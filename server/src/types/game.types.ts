export * from "../../../shared/game.types";

import type { GameOverPayload, GuessResultPayload, PublicRoom } from "../../../shared/game.types";

export interface ProcessGuessResult {
  room: PublicRoom;
  guessResult: GuessResultPayload;
  gameOver: GameOverPayload | null;
}

export interface RemovePlayerResult {
  room: PublicRoom | null;
  deleted: boolean;
  gameOver: GameOverPayload | null;
}

