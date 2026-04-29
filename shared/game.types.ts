export type GameState = "waiting" | "playing" | "finished";
export type GuessFeedback = "higher" | "lower" | "correct";

export interface Player {
  id: string;
  name: string;
}

export interface PublicRoom {
  roomId: string;
  players: Player[];
  gameState: GameState;
  winner: string | null;
  hostId: string;
}

export interface CreateRoomPayload {
  playerName: string;
}

export interface JoinRoomPayload {
  roomId: string;
  playerName: string;
}

export interface StartGamePayload {
  roomId: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface MakeGuessPayload {
  roomId: string;
  guess: number;
}

export interface RoomUpdatePayload {
  room: PublicRoom;
}

export interface GameStartedPayload {
  room: PublicRoom;
}

export interface GuessResultPayload {
  roomId: string;
  playerId: string;
  guess: number;
  result: GuessFeedback;
}

export interface GameOverPayload {
  room: PublicRoom;
  winner: Player | null;
}

export interface CreateOrJoinRoomResponse {
  room: PublicRoom;
  player: Player;
}

export interface StartGameResponse {
  room: PublicRoom;
}

export type SocketSuccess<T> = {
  success: true;
  data: T;
};

export type SocketFailure = {
  success: false;
  message: string;
};

export type SocketResponse<T> = SocketSuccess<T> | SocketFailure;
export type SocketAck<T> = (response: SocketResponse<T>) => void;

export interface ClientToServerEvents {
  create_room: (
    payload: CreateRoomPayload,
    ack: SocketAck<CreateOrJoinRoomResponse>
  ) => void;
  join_room: (
    payload: JoinRoomPayload,
    ack: SocketAck<CreateOrJoinRoomResponse>
  ) => void;
  start_game: (
    payload: StartGamePayload,
    ack: SocketAck<StartGameResponse>
  ) => void;
  leave_room: (payload: LeaveRoomPayload, ack?: SocketAck<void>) => void;
  make_guess: (payload: MakeGuessPayload, ack?: SocketAck<void>) => void;
}

export interface ServerToClientEvents {
  room_update: (payload: RoomUpdatePayload) => void;
  game_started: (payload: GameStartedPayload) => void;
  guess_result: (payload: GuessResultPayload) => void;
  game_over: (payload: GameOverPayload) => void;
}
