export * from "../../shared/game.types";

export interface GuessHistoryItem {
  guess: number;
  result: import("../../shared/game.types").GuessFeedback;
}

