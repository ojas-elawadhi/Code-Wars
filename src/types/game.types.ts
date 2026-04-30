export * from "../../shared/game.types";

export interface GuessHistoryItem {
  guess: number | null;
  roundNumber: number;
  result: import("../../shared/game.types").GuessFeedback;
}
