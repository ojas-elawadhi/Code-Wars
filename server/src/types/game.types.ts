export * from "../../../shared/game.types";

import type { GameOverPayload, GuessResultPayload, PublicRoom } from "../../../shared/game.types";

export interface SubmitGuessResult {
  room: PublicRoom;
}

export interface ResolveRoundResult {
  room: PublicRoom;
  guessResults: GuessResultPayload[];
  gameOver: GameOverPayload | null;
}

export interface RemovePlayerResult {
  roomId: string | null;
  room: PublicRoom | null;
  deleted: boolean;
  gameOver: GameOverPayload | null;
}
