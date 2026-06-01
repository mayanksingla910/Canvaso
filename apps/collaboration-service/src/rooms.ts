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

interface Room {
  doc: Y.Doc;
  clients: Set<WebSocket>;
  awareness: Awareness;
  flushTimer: ReturnType<typeof setTimeout> | null;
}

const rooms = new Map<string, Room>();

export async function getOrCreateRoom(boardId: string): Promise<Room> {
  if (rooms.has(boardId)) return rooms.get(boardId)!;

  const doc = new Y.Doc();

  const state = await loadDoc(boardId);
  if (state) Y.applyUpdate(doc, state);

  const awareness = new Awareness(doc);

  const room: Room = {
    doc,
    clients: new Set<WebSocket>(),
    awareness,
    flushTimer: null,
  };

  rooms.set(boardId, room);

  doc.on("update", () => {
    if (room.flushTimer) clearTimeout(room.flushTimer);

    room.flushTimer = setTimeout(() => {
      saveDoc(boardId, doc).catch((err) => {
        console.error("[Persistence] Failed to save document:", err);
      });
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

export async function handleConnection(
  boardId: string,
  ws: WebSocket,
): Promise<void> {
  const room = await getOrCreateRoom(boardId);
  room.clients.add(ws);
  console.log(
    `[Room] Client joined board ${boardId}, ${room.clients.size} clients remain`,
  );

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, 0);
  syncProtocol.writeSyncStep1(encoder, room.doc);
  ws.send(encoding.toUint8Array(encoder));

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

      if (messageType === 0) {
        const replyencoder = encoding.createEncoder();
        encoding.writeVarUint(replyencoder, 0);
        syncProtocol.readSyncMessage(decoder, replyencoder, room.doc, null);
        if (encoding.length(replyencoder) > 1) {
          ws.send(encoding.toUint8Array(replyencoder));
        }
        const update = Y.encodeStateAsUpdate(room.doc);
        const updateEncoder = encoding.createEncoder();
        encoding.writeVarUint(updateEncoder, 0);
        syncProtocol.writeUpdate(updateEncoder, update);
        broadcast(room, encoding.toUint8Array(updateEncoder), ws);
      } else if (messageType === 1) {
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
      `[Room] Client left board ${boardId}, ${room.clients.size} clients remain`,
    );

    if (room.clients.size === 0) {
      if (room.flushTimer) clearTimeout(room.flushTimer);
      saveDoc(boardId, room.doc).then(() => {
        rooms.delete(boardId);
        console.log(`[Room] Closed board ${boardId}`);
      });
    }
  });

  ws.on("error", (err) => console.error(`[Room] WS error ${boardId}`, err));
}
