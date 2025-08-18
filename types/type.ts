// Enums
export enum GameType {
  SPIN_WHELL = "SPIN_WHELL",
  AI_ROAST = "AI_ROAST",
}

export enum GameStatus {
  PENDING = "PENDING",
  STARTED = "STARTED",
  FINISHED = "FINISHED",
}

// Types
export interface Room {
  id: number;
  code: string;
  roomname: string;
  createdAt: string; // ISO string for frontend
  gameType: GameType;
  gamestatus: GameStatus;
  results: Result[];
  participants: Participant[];
  message: Message[];
}

export interface Participant {
  id: number;
  name: string;
  roomId: number;
  createdAt: string;
  results: Result[];
  reasons: Reason[];
}

export interface Reason {
  id: number;
  text: string;
  participantId: number;
  createdAt: string;
}

export interface Result {
  id: number;
  roomId: number;
  loserId: number | null;
  createdAt: string;
}

export interface Message {
  id: number;
  summary: string;
  roomId: number;
  createdAt: string;
}
