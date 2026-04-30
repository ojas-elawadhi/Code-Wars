import type { Player } from "../types/game.types";
import type {
  GameOverPayload,
  GuessFeedback,
  PublicRoom,
  RemovePlayerResult,
  ResolveRoundResult,
  SubmitGuessResult
} from "../types/game.types";
import type { RoomModel } from "../models/room.model";

const MAX_PLAYERS = 6;
const MIN_PLAYERS = 2;
const ROOM_CODE_LENGTH = 6;
const GUESS_MIN = 1;
const GUESS_MAX = 100;
export const ROUND_DURATION_MS = 15000;
export const ROUND_REVEAL_MS = 2500;

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
      hostId: host.id,
      roundNumber: 0,
      roundStatus: "idle",
      roundEndsAt: null,
      roundDurationSeconds: ROUND_DURATION_MS / 1000,
      submittedPlayerIds: [],
      roundGuesses: new Map()
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
      throw new Error("A game is already in progress.");
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

    this.beginRound(room, 1);

    return this.toPublicRoom(room);
  }

  leaveRoom(roomId: string, playerId: string): RemovePlayerResult {
    const normalizedRoomId = this.normalizeRoomId(roomId);
    const currentRoomId = this.playerRooms.get(playerId);

    if (!currentRoomId) {
      return {
        roomId: null,
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

  submitGuess(roomId: string, playerId: string, guess: number): SubmitGuessResult {
    const room = this.requireRoom(this.normalizeRoomId(roomId));
    const player = room.players.find((currentPlayer) => currentPlayer.id === playerId);

    if (!player) {
      throw new Error("Player is not part of this room.");
    }

    if (room.gameState !== "playing" || room.roundStatus !== "collecting") {
      throw new Error("Wait for the next round to submit a guess.");
    }

    if (room.submittedPlayerIds.includes(playerId)) {
      throw new Error("You already submitted a guess this round.");
    }

    const normalizedGuess = this.validateGuess(guess);

    room.roundGuesses.set(playerId, normalizedGuess);
    room.submittedPlayerIds = [...room.submittedPlayerIds, playerId];

    return {
      room: this.toPublicRoom(room)
    };
  }

  resolveRound(roomId: string): ResolveRoundResult {
    const room = this.requireRoom(this.normalizeRoomId(roomId));

    if (room.gameState !== "playing" || room.roundStatus !== "collecting") {
      throw new Error("The round is not active.");
    }

    const winningPlayerId =
      room.submittedPlayerIds.find((playerId) => room.roundGuesses.get(playerId) === room.secretNumber) ?? null;

    const guessResults = room.players.map((player) => {
      const submittedGuess = room.roundGuesses.get(player.id);

      if (submittedGuess === undefined) {
        return {
          roomId: room.roomId,
          playerId: player.id,
          roundNumber: room.roundNumber,
          guess: null,
          result: "missed" as GuessFeedback
        };
      }

      let result: GuessFeedback = "higher";

      if (submittedGuess === room.secretNumber) {
        result = "correct";
      } else if (submittedGuess > room.secretNumber) {
        result = "lower";
      }

      return {
        roomId: room.roomId,
        playerId: player.id,
        roundNumber: room.roundNumber,
        guess: submittedGuess,
        result
      };
    });

    let gameOver: GameOverPayload | null = null;

    if (winningPlayerId) {
      room.gameState = "finished";
      room.winner = winningPlayerId;
      room.roundStatus = "idle";
      room.roundEndsAt = null;
    } else {
      room.roundStatus = "revealing";
      room.roundEndsAt = null;
      room.winner = null;
    }

    room.submittedPlayerIds = [];
    room.roundGuesses.clear();

    if (winningPlayerId) {
      const winner = room.players.find((player) => player.id === winningPlayerId) ?? null;
      gameOver = {
        room: this.toPublicRoom(room),
        winner
      };
    }

    return {
      room: this.toPublicRoom(room),
      guessResults,
      gameOver
    };
  }

  startNextRound(roomId: string): PublicRoom {
    const room = this.requireRoom(this.normalizeRoomId(roomId));

    if (room.gameState !== "playing") {
      throw new Error("The game is not active.");
    }

    this.beginRound(room, room.roundNumber + 1);

    return this.toPublicRoom(room);
  }

  removePlayer(playerId: string): RemovePlayerResult {
    const roomId = this.playerRooms.get(playerId);

    if (!roomId) {
      return {
        roomId: null,
        room: null,
        deleted: false,
        gameOver: null
      };
    }

    this.playerRooms.delete(playerId);

    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        roomId,
        room: null,
        deleted: false,
        gameOver: null
      };
    }

    room.players = room.players.filter((player) => player.id !== playerId);
    room.submittedPlayerIds = room.submittedPlayerIds.filter((submittedPlayerId) => submittedPlayerId !== playerId);
    room.roundGuesses.delete(playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return {
        roomId,
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
      room.winner = room.players[0]?.id ?? null;
      this.resetRoundState(room);

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
      this.resetRoundState(room);
    }

    return {
      roomId,
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
      hostId: room.hostId,
      roundNumber: room.roundNumber,
      roundStatus: room.roundStatus,
      roundEndsAt: room.roundEndsAt,
      roundDurationSeconds: room.roundDurationSeconds,
      submittedPlayerIds: [...room.submittedPlayerIds]
    };
  }

  private beginRound(room: RoomModel, roundNumber: number) {
    room.roundNumber = roundNumber;
    room.roundStatus = "collecting";
    room.roundEndsAt = Date.now() + ROUND_DURATION_MS;
    room.submittedPlayerIds = [];
    room.roundGuesses.clear();
  }

  private resetRoundState(room: RoomModel) {
    room.roundNumber = 0;
    room.roundStatus = "idle";
    room.roundEndsAt = null;
    room.submittedPlayerIds = [];
    room.roundGuesses.clear();
    room.secretNumber = 0;
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
