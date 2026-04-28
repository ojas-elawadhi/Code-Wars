import type { PublicRoom } from "../types/game.types";

export interface RoomModel extends PublicRoom {
  secretNumber: number;
}

