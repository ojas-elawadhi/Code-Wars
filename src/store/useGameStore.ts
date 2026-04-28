import { create } from "zustand";

import type {
  GameOverPayload,
  GameStartedPayload,
  GameState,
  GuessHistoryItem,
  GuessResultPayload,
  Player,
  PublicRoom
} from "../types/game.types";

interface GameStore {
  player: Player | null;
  room: PublicRoom | null;
  gameState: GameState;
  lastGuessResult: GuessResultPayload | null;
  guessHistory: GuessHistoryItem[];
  isConnected: boolean;
  errorMessage: string | null;
  setConnectionStatus: (isConnected: boolean) => void;
  setErrorMessage: (message: string | null) => void;
  setSession: (player: Player, room: PublicRoom) => void;
  setRoom: (room: PublicRoom) => void;
  setGameStarted: (payload: GameStartedPayload) => void;
  setGuessResult: (payload: GuessResultPayload) => void;
  setGameOver: (payload: GameOverPayload) => void;
  resetRoundState: () => void;
  resetAll: () => void;
}

const initialState = {
  player: null,
  room: null,
  gameState: "waiting" as GameState,
  lastGuessResult: null,
  guessHistory: [] as GuessHistoryItem[],
  isConnected: false,
  errorMessage: null
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setConnectionStatus: (isConnected) => set({ isConnected }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setSession: (player, room) =>
    set({
      player,
      room,
      gameState: room.gameState,
      errorMessage: null
    }),
  setRoom: (room) =>
    set({
      room,
      gameState: room.gameState
    }),
  setGameStarted: ({ room }) =>
    set({
      room,
      gameState: room.gameState,
      lastGuessResult: null,
      guessHistory: [],
      errorMessage: null
    }),
  setGuessResult: (payload) =>
    set((state) => ({
      lastGuessResult: payload,
      guessHistory: [
        {
          guess: payload.guess,
          result: payload.result
        },
        ...state.guessHistory
      ].slice(0, 10)
    })),
  setGameOver: ({ room }) =>
    set({
      room,
      gameState: room.gameState
    }),
  resetRoundState: () =>
    set((state) => ({
      room: state.room
        ? {
            ...state.room,
            gameState: "waiting",
            winner: null
          }
        : null,
      gameState: "waiting",
      lastGuessResult: null,
      guessHistory: [],
      errorMessage: null
    })),
  resetAll: () => set(initialState)
}));

