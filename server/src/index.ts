import "dotenv/config";

import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import { getHealth } from "./controllers/health.controller";
import { registerGameSocketHandlers } from "./sockets/game.socket";
import type { ClientToServerEvents, ServerToClientEvents } from "./types/game.types";

const PORT = Number(process.env.PORT ?? 3001);
const configuredOrigins = (process.env.CLIENT_ORIGIN ?? "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAnyOrigin = configuredOrigins.includes("*");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: allowAnyOrigin ? true : configuredOrigins,
    credentials: true
  })
);

app.get("/health", getHealth);

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: allowAnyOrigin ? true : configuredOrigins,
    credentials: true
  }
});

registerGameSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Higher or Lower server listening on port ${PORT}`);
});
