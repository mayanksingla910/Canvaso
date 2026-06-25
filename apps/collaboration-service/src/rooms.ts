import * as Y from "yjs";
import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import { WebSocket } from "ws";
import { loadDoc, saveDoc } from "./persistence.js";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as syncProtocol from "y-protocols/sync";
import { prisma } from "@canvaso/database";

interface Room {
  doc: Y.Doc;
  clients: Set<WebSocket>;
  awareness: Awareness;
  flushTimer: ReturnType<typeof setTimeout> | null;
}

interface ConnectionMeta {
  userId: string | null;
  token: string | null;
}

type BoardRole = "owner" | "editor" | "viewer";

const rooms = new Map<string, Room>();

// WeakMap so entries are GC'd automatically when the socket closes
const clientRoles = new WeakMap<WebSocket, BoardRole>();

// ── Role resolution (mirrors apps/web/lib/resolveRole.ts) ────────────────────
// Duplicated here because the collaboration service is a separate process
// with no access to Next.js internals.
async function resolveRole(
  boardId: string,
  userId: string | null,
  token: string | null,
): Promise<BoardRole | null> {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return null;
  console.log("[resolveRole]", { boardId, userId, token });

  if (userId && board.authorId === userId) return "owner";

  if (userId) {
    const collab = await prisma.boardCollaborator.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (collab) return collab.role as BoardRole;
  }

  if (token) {
    const link = await prisma.boardShareLink.findUnique({ where: { token } });
    if (
      link &&
      link.boardId === boardId &&
      link.isActive &&
      (!link.expiresAt || link.expiresAt > new Date())
    ) {
      return link.role as BoardRole;
    }
  }

  return null;
}

// ── Room lifecycle ────────────────────────────────────────────────────────────

async function getOrCreateRoom(boardId: string): Promise<Room> {
  if (rooms.has(boardId)) return rooms.get(boardId)!;

  const doc = new Y.Doc();
  const state = await loadDoc(boardId);
  if (state) Y.applyUpdate(doc, state);

  const awareness = new Awareness(doc);
  const room: Room = { doc, clients: new Set(), awareness, flushTimer: null };

  rooms.set(boardId, room);

  doc.on("update", () => {
    if (room.flushTimer) clearTimeout(room.flushTimer);
    room.flushTimer = setTimeout(() => {
      saveDoc(boardId, doc).catch((err) =>
        console.error("[Persistence] Failed to save:", err),
      );
    }, 5000);
  });

  return room;
}

function broadcast(room: Room, data: Uint8Array, sender: WebSocket) {
  room.clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// ── Connection handler ────────────────────────────────────────────────────────

export async function handleConnection(
  boardId: string,
  ws: WebSocket,
  meta: ConnectionMeta,
): Promise<void> {
  // Validate access before doing anything
  const role = await resolveRole(boardId, meta.userId, meta.token);
  if (!role) {
    console.warn(`[Room] Rejected unauthorized connection to board ${boardId}`);
    ws.close(1008, "Unauthorized");
    return;
  }

  clientRoles.set(ws, role);

  const room = await getOrCreateRoom(boardId);
  room.clients.add(ws);
  console.log(
    `[Room] ${role} joined board ${boardId} — ${room.clients.size} client(s) connected`,
  );

  // Send current doc state to the joining client
  const syncEncoder = encoding.createEncoder();
  encoding.writeVarUint(syncEncoder, 0);
  syncProtocol.writeSyncStep1(syncEncoder, room.doc);
  ws.send(encoding.toUint8Array(syncEncoder));

  // Send current awareness states (other users' cursors)
  const awarenessStates = room.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, 1);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      encodeAwarenessUpdate(room.awareness, [...awarenessStates.keys()]),
    );
    ws.send(encoding.toUint8Array(awarenessEncoder));
  }

  ws.on("message", (data) => {
    try {
      const msg = Buffer.isBuffer(data)
        ? data
        : new Uint8Array(data as ArrayBuffer);
      const decoder = decoding.createDecoder(msg);
      const messageType = decoding.readVarUint(decoder);
      const role = clientRoles.get(ws);

      if (messageType === 0) {
        // ── Sync message
        const replyEncoder = encoding.createEncoder();
        encoding.writeVarUint(replyEncoder, 0);
        syncProtocol.readSyncMessage(decoder, replyEncoder, room.doc, null);

        if (encoding.length(replyEncoder) > 1) {
          ws.send(encoding.toUint8Array(replyEncoder));
        }

        // Viewers can receive the doc state but cannot push mutations to others
        if (role !== "viewer") {
          const update = Y.encodeStateAsUpdate(room.doc);
          const updateEncoder = encoding.createEncoder();
          encoding.writeVarUint(updateEncoder, 0);
          syncProtocol.writeUpdate(updateEncoder, update);
          broadcast(room, encoding.toUint8Array(updateEncoder), ws);
        }
      } else if (messageType === 1) {
        // ── Awareness message (cursor positions)
        // All roles can broadcast cursor — viewers should still be visible
        const update = decoding.readVarUint8Array(decoder);
        applyAwarenessUpdate(room.awareness, update, ws);
        broadcast(room, msg, ws);
      }
    } catch (err) {
      console.error(
        `[Room] Failed to process message for board ${boardId}:`,
        err,
      );
    }
  });

  ws.on("close", () => {
    room.clients.delete(ws);
    removeAwarenessStates(room.awareness, [room.doc.clientID], null);
    console.log(
      `[Room] Client left board ${boardId} — ${room.clients.size} client(s) remain`,
    );

    if (room.clients.size === 0) {
      if (room.flushTimer) clearTimeout(room.flushTimer);
      saveDoc(boardId, room.doc)
        .then(() => {
          rooms.delete(boardId);
          console.log(`[Room] Closed and saved board ${boardId}`);
        })
        .catch((err) =>
          console.error(
            `[Room] Failed to save on close for board ${boardId}:`,
            err,
          ),
        );
    }
  });

  ws.on("error", (err) =>
    console.error(`[Room] WS error on board ${boardId}:`, err),
  );
}
