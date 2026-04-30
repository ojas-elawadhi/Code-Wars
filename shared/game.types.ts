export type GameState = "waiting" | "playing" | "finished";
export type GuessFeedback = "higher" | "lower" | "correct" | "missed";
export type RoundStatus = "idle" | "setup" | "collecting" | "revealing";
export type GameMode = "friends" | "versus";

export interface Player {
  id: string;
  name: string;
}

export interface PublicRoom {
  roomId: string;
  players: Player[];
  gameState: GameState;
  gameMode: GameMode;
  maxPlayers: number;
  winner: string | null;
  winnerIds: string[];
  hostId: string;
  roundNumber: number;
  roundStatus: RoundStatus;
  roundEndsAt: number | null;
  roundDurationSeconds: number;
  submittedPlayerIds: string[];
  secretSubmittedPlayerIds: string[];
}

export interface CreateRoomPayload {
  playerName: string;
  gameMode: GameMode;
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

export interface SetSecretNumberPayload {
  roomId: string;
  secretNumber: number;
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
  roundNumber: number;
  guess: number | null;
  opponentGuess: number | null;
  result: GuessFeedback;
}

export interface GameOverPayload {
  room: PublicRoom;
  winner: Player | null;
  winners: Player[];
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
  set_secret_number: (payload: SetSecretNumberPayload, ack?: SocketAck<void>) => void;
  leave_room: (payload: LeaveRoomPayload, ack?: SocketAck<void>) => void;
  make_guess: (payload: MakeGuessPayload, ack?: SocketAck<void>) => void;
}

export interface ServerToClientEvents {
  room_update: (payload: RoomUpdatePayload) => void;
  game_started: (payload: GameStartedPayload) => void;
  guess_result: (payload: GuessResultPayload) => void;
  game_over: (payload: GameOverPayload) => void;
}
