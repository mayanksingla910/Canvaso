import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";
import { connectRedis } from "./persistence.js";
import { env } from "./env.js";
import { handleConnection } from "./rooms.js";

async function main() {
  await connectRedis();

  const wss = new WebSocketServer({ port: Number(env.PORT) });

  wss.on("connection", async (ws: WebSocket, req) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const boardId = url.searchParams.get("boardId");

    if (!boardId) {
      ws.close(1008, "Missing boardId");
      return;
    }

    handleConnection(boardId, ws).catch((err) => {
      console.error("Connection error:", err);
      ws.close(1011, "Internal server error");
    });
  });

  wss.on("listening", () => {
    console.log(`WebSocket server is listening on port ${env.PORT}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, closing server");
    wss.close(() => process.exit(0));
  });
}

main().catch((err) => {
  console.error("[Fatal]", err);
  process.exit(1);
});
