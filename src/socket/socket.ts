import { io, type Socket } from "socket.io-client";

import { useGameStore } from "../store/useGameStore";
import type {
  ClientToServerEvents,
  CreateOrJoinRoomResponse,
  ServerToClientEvents,
  SocketAck,
  StartGameResponse
} from "../types/game.types";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let listenersBound = false;

const emitWithAck = <T>(emitter: (ack: SocketAck<T>) => void) =>
  new Promise<T>((resolve, reject) => {
    emitter((response) => {
      if (response.success) {
        resolve(response.data);
        return;
      }

      reject(new Error(response.message));
    });
  });

const bindListeners = (activeSocket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
  if (listenersBound) {
    return;
  }

  activeSocket.on("connect", () => {
    useGameStore.getState().setConnectionStatus(true);
  });

  activeSocket.on("disconnect", () => {
    useGameStore.getState().setConnectionStatus(false);
  });

  activeSocket.on("room_update", ({ room }) => {
    useGameStore.getState().setRoom(room);
  });

  activeSocket.on("game_started", (payload) => {
    useGameStore.getState().setGameStarted(payload);
  });

  activeSocket.on("guess_result", (payload) => {
    useGameStore.getState().setGuessResult(payload);
  });

  activeSocket.on("game_over", (payload) => {
    useGameStore.getState().setGameOver(payload);
  });

  listenersBound = true;
};

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"]
    });
  }

  bindListeners(socket);

  return socket;
};

export const connectSocket = () => {
  const activeSocket = getSocket();

  if (!activeSocket.connected) {
    activeSocket.connect();
  }

  return activeSocket;
};

export const createRoom = (playerName: string) =>
  emitWithAck<CreateOrJoinRoomResponse>((ack) => {
    connectSocket().emit("create_room", { playerName }, ack);
  });

export const joinRoom = (roomId: string, playerName: string) =>
  emitWithAck<CreateOrJoinRoomResponse>((ack) => {
    connectSocket().emit("join_room", { roomId, playerName }, ack);
  });

export const startGame = (roomId: string) =>
  emitWithAck<StartGameResponse>((ack) => {
    connectSocket().emit("start_game", { roomId }, ack);
  });

export const makeGuess = (roomId: string, guess: number) =>
  emitWithAck<void>((ack) => {
    connectSocket().emit("make_guess", { roomId, guess }, ack);
  });
