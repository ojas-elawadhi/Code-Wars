import type { PublicRoom } from "../types/game.types";

export interface RoomModel extends PublicRoom {
  secretNumber: number;
  playerSecretNumbers: Map<string, number>;
  roundGuesses: Map<string, number>;
}
