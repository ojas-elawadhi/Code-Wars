import type { Player } from "../types/game.types";
import type {
  GameOverPayload,
  GuessFeedback,
  ProcessGuessResult,
  PublicRoom,
  RemovePlayerResult
} from "../types/game.types";
import type { RoomModel } from "../models/room.model";

const MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;
const ROOM_CODE_LENGTH = 6;
const GUESS_MIN = 1;
const GUESS_MAX = 100;

class GameService {
  private readonly rooms = new Map<string, RoomModel>();
  private readonly playerRooms = new Map<string, string>();

  createRoom(host: Player): PublicRoom {
    this.validatePlayerName(host.name);

    const roomId = this.generateRoomId();
    const room: RoomModel = {
      roomId,
      players: [host],
      gameState: "waiting",
      secretNumber: 0,
      winner: null,
      hostId: host.id
    };

    this.rooms.set(room.roomId, room);
    this.playerRooms.set(host.id, room.roomId);

    return this.toPublicRoom(room);
  }

  joinRoom(roomId: string, player: Player): PublicRoom {
    this.validatePlayerName(player.name);

    const normalizedRoomId = this.normalizeRoomId(roomId);
    const room = this.requireRoom(normalizedRoomId);

    if (room.players.length >= MAX_PLAYERS) {
      throw new Error("This room is full.");
    }

    if (room.gameState === "playing") {
      throw new Error("A round is already in progress.");
    }

    if (room.players.some((currentPlayer) => currentPlayer.name.toLowerCase() === player.name.toLowerCase())) {
      throw new Error("Choose a different name for this room.");
    }

    room.players.push(player);
    this.playerRooms.set(player.id, normalizedRoomId);

    return this.toPublicRoom(room);
  }

  startGame(roomId: string, requesterId: string): PublicRoom {
    const room = this.requireRoom(this.normalizeRoomId(roomId));

    if (room.hostId !== requesterId) {
      throw new Error("Only the host can start the game.");
    }

    if (room.players.length < MIN_PLAYERS) {
      throw new Error("At least 2 players are required to start.");
    }

    room.gameState = "playing";
    room.secretNumber = this.randomNumber(GUESS_MIN, GUESS_MAX);
    room.winner = null;

    return this.toPublicRoom(room);
  }

  leaveRoom(roomId: string, playerId: string): RemovePlayerResult {
    const normalizedRoomId = this.normalizeRoomId(roomId);
    const currentRoomId = this.playerRooms.get(playerId);

    if (!currentRoomId) {
      return {
        room: null,
        deleted: false,
        gameOver: null
      };
    }

    if (currentRoomId !== normalizedRoomId) {
      throw new Error("Player is not part of this room.");
    }

    return this.removePlayer(playerId);
  }

  processGuess(roomId: string, playerId: string, guess: number): ProcessGuessResult {
    const room = this.requireRoom(this.normalizeRoomId(roomId));
    const player = room.players.find((currentPlayer) => currentPlayer.id === playerId);

    if (!player) {
      throw new Error("Player is not part of this room.");
    }

    if (room.gameState !== "playing") {
      throw new Error("The round is not active.");
    }

    const normalizedGuess = this.validateGuess(guess);
    let result: GuessFeedback = "higher";

    if (normalizedGuess === room.secretNumber) {
      result = "correct";
      room.gameState = "finished";
      room.winner = player.id;
    } else if (normalizedGuess > room.secretNumber) {
      result = "lower";
    }

    const publicRoom = this.toPublicRoom(room);
    const guessResult = {
      roomId: room.roomId,
      playerId,
      guess: normalizedGuess,
      result
    };

    const gameOver =
      result === "correct"
        ? {
            room: publicRoom,
            winner: player
          }
        : null;

    return {
      room: publicRoom,
      guessResult,
      gameOver
    };
  }

  removePlayer(playerId: string): RemovePlayerResult {
    const roomId = this.playerRooms.get(playerId);

    if (!roomId) {
      return {
        room: null,
        deleted: false,
        gameOver: null
      };
    }

    this.playerRooms.delete(playerId);

    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        room: null,
        deleted: false,
        gameOver: null
      };
    }

    room.players = room.players.filter((player) => player.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return {
        room: null,
        deleted: true,
        gameOver: null
      };
    }

    if (room.hostId === playerId) {
      room.hostId = room.players[0].id;
    }

    let gameOver: GameOverPayload | null = null;

    if (room.gameState === "playing" && room.players.length < MIN_PLAYERS) {
      room.gameState = "finished";
      room.secretNumber = 0;
      room.winner = room.players[0]?.id ?? null;

      if (room.winner) {
        const winner = room.players.find((player) => player.id === room.winner) ?? null;
        gameOver = {
          room: this.toPublicRoom(room),
          winner
        };
      }
    }

    if (room.winner === playerId) {
      room.winner = null;
      room.gameState = "waiting";
    }

    return {
      room: this.toPublicRoom(room),
      deleted: false,
      gameOver
    };
  }

  private toPublicRoom(room: RoomModel): PublicRoom {
    return {
      roomId: room.roomId,
      players: [...room.players],
      gameState: room.gameState,
      winner: room.winner,
      hostId: room.hostId
    };
  }

  private requireRoom(roomId: string): RoomModel {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error("Room not found.");
    }

    return room;
  }

  private generateRoomId(): string {
    let roomId = "";

    do {
      roomId = Math.random().toString(36).slice(2, 2 + ROOM_CODE_LENGTH).toUpperCase();
    } while (this.rooms.has(roomId));

    return roomId;
  }

  private normalizeRoomId(roomId: string) {
    return roomId.trim().toUpperCase();
  }

  private validatePlayerName(name: string) {
    if (name.trim().length < 2) {
      throw new Error("Player name must be at least 2 characters.");
    }
  }

  private validateGuess(guess: number) {
    if (!Number.isInteger(guess) || guess < GUESS_MIN || guess > GUESS_MAX) {
      throw new Error("Guesses must be whole numbers between 1 and 100.");
    }

    return guess;
  }

  private randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export const gameService = new GameService();
