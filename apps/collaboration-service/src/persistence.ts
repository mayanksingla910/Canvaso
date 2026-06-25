import * as Y from "yjs";
import { env } from "./env.js";
import { createClient, RedisClientType } from "redis";
import { prisma } from "@canvaso/database";

export const redis: RedisClientType = createClient({
  url: env.REDIS_URL,
});
redis.on("error", (err) => console.error("Redis Client Error", err));

export async function connectRedis(): Promise<void> {
  await redis.connect();
  console.log("[Redis] Client Connected");
}

const TTL = 60 * 60 * 24;
const key = (boardId: string) => `board:${boardId}:ydoc`;

export async function loadDoc(boardId: string): Promise<Uint8Array | null> {
  try {
    const cached = await redis.get(key(boardId));
    if (cached) return Buffer.from(cached, "base64");
  } catch (err) {
    console.warn("[Persistence] Redis read failed:", err);
  }

  try {
    const board = await prisma.board.findUnique({
      where: {
        id: boardId,
      },
      select: {
        ydocState: true,
      },
    });
    if (!board?.ydocState) return null;

    await redis
      .setEx(key(boardId), TTL, Buffer.from(board.ydocState).toString("base64"))
      .catch((err) => {
        console.warn("[Persistence] Redis write failed:", err);
      });

    return new Uint8Array(board.ydocState);
  } catch (err) {
    console.error("[Persistence] DB read failed:", err);
    return null;
  }
}

export async function saveDoc(boardId: string, doc: Y.Doc): Promise<void> {
  const state = Y.encodeStateAsUpdate(doc);

  try {
    await redis.setEx(key(boardId), TTL, Buffer.from(state).toString("base64"));
  } catch (err) {
    console.warn("[Persistence] Redis write failed:", err);
  }

  try {
    await prisma.board.update({
      where: {
        id: boardId,
      },
      data: {
        ydocState: Buffer.from(state),
      },
    });
  } catch (err) {
    console.warn("[Persistence] DB write failed:", err);
  }
}
