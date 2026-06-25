import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";
import { connectRedis } from "./persistence.js";
import { env } from "./env.js";
import { handleConnection } from "./rooms.js";

async function main() {
  await connectRedis();

  const wss = new WebSocketServer({ port: Number(env.PORT) });

  wss.on("connection", async (ws: WebSocket, req) => {
    console.log("[WS] Incoming connection:", req.url);

    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    // y-websocket sends room name as the path: ws://host/<boardId>?userId=...
    const boardId = url.pathname.slice(1); // strip leading /
    const userId = url.searchParams.get("userId") ?? null;
    const token = url.searchParams.get("token") ?? null;

    console.log("[WS] Parsed:", { boardId, userId, token });

    if (!boardId) {
      ws.close(1008, "Missing boardId");
      return;
    }

    handleConnection(boardId, ws, { userId, token }).catch((err) => {
      console.error("[Connection] Fatal error:", err);
      ws.close(1011, "Internal server error");
    });
  });

  wss.on("listening", () => {
    console.log(`[WS] Server listening on port ${env.PORT}`);
  });

  process.on("SIGTERM", () => {
    console.log("[WS] SIGTERM received, shutting down");
    wss.close(() => process.exit(0));
  });
}

main().catch((err) => {
  console.error("[Fatal]", err);
  process.exit(1);
});