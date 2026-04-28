import type { Server } from "socket.io";

import { gameService } from "../services/game.service";
import type {
  ClientToServerEvents,
  CreateOrJoinRoomResponse,
  ServerToClientEvents,
  SocketAck,
  StartGameResponse
} from "../types/game.types";

const sendSuccess = <T>(ack: SocketAck<T> | undefined, data: T) => {
  ack?.({
    success: true,
    data
  });
};

const sendFailure = <T>(ack: SocketAck<T> | undefined, error: unknown) => {
  ack?.({
    success: false,
    message: error instanceof Error ? error.message : "Something went wrong."
  });
};

export const registerGameSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
  io.on("connection", (socket) => {
    socket.on("create_room", (payload, ack) => {
      try {
        const player = {
          id: socket.id,
          name: payload.playerName.trim()
        };
        const room = gameService.createRoom(player);

        socket.join(room.roomId);
        io.to(room.roomId).emit("room_update", { room });
        sendSuccess<CreateOrJoinRoomResponse>(ack, { room, player });
      } catch (error) {
        sendFailure(ack, error);
      }
    });

    socket.on("join_room", (payload, ack) => {
      try {
        const player = {
          id: socket.id,
          name: payload.playerName.trim()
        };
        const room = gameService.joinRoom(payload.roomId, player);

        socket.join(room.roomId);
        io.to(room.roomId).emit("room_update", { room });
        sendSuccess<CreateOrJoinRoomResponse>(ack, { room, player });
      } catch (error) {
        sendFailure(ack, error);
      }
    });

    socket.on("start_game", (payload, ack) => {
      try {
        const room = gameService.startGame(payload.roomId, socket.id);

        io.to(room.roomId).emit("game_started", { room });
        sendSuccess<StartGameResponse>(ack, { room });
      } catch (error) {
        sendFailure(ack, error);
      }
    });

    socket.on("make_guess", (payload, ack) => {
      try {
        const result = gameService.processGuess(payload.roomId, socket.id, payload.guess);

        socket.emit("guess_result", result.guessResult);

        if (result.gameOver) {
          io.to(result.room.roomId).emit("game_over", result.gameOver);
        }

        sendSuccess<void>(ack, undefined);
      } catch (error) {
        sendFailure(ack, error);
      }
    });

    socket.on("disconnect", () => {
      const result = gameService.removePlayer(socket.id);

      if (!result.room || result.deleted) {
        return;
      }

      io.to(result.room.roomId).emit("room_update", { room: result.room });

      if (result.gameOver) {
        io.to(result.room.roomId).emit("game_over", result.gameOver);
      }
    });
  });
};

