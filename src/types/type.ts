// Enums
export enum GameType {
  SPIN_WHEEL = "SPIN_WHEEL",
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
  createdAt: string; 
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
  isHost: boolean;
}

export interface Player {
  id: number;
  name: string;
  progress: number;
  socketId?: string;
  isMe?: boolean;
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

export interface RoomContextType {
  room: RoomForContext | null;
  setRoom: (room: RoomForContext | null) => void;
}

export interface RoomForContext {
  roomId: number;
  roomName: string;
  roomCode: string;
  nickname: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  textColor: string;
}

export interface GameButtonProps {
  game: Game;
  room?: Room;
  isHost: boolean;
  canStart: boolean
}

export interface PlayerCardProps {
  player: Participant;
  isCurrentUser: boolean;
  isHost: boolean;
  isCurrentUserHost: boolean;
  onRemove?: (nickname: string) => void;
}

export interface JoinFormInputsProps {
  code: string;
  setCode: (value: string) => void;
  nickname: string;
  setNickname: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
}

export interface CreateRoomFormProps {
  onRoomCreated?: (room: { roomName: string; roomCode: string; roomId: number }) => void;
}

export interface CreateFormInputsProps {
  roomName: string;
  setRoomName: (value: string) => void;
  nickname: string;
  setNickname: (value: string) => void;
  isLoading: boolean;
}

export type AdminAuthContextType = {
  adminKey: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
};

export interface GameProps {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
  textColor: string;
}

export interface RoomDataResponse {
  room?: {
    id: number;
    code: string;
    roomname: string;
    createdAt?: string;
    gameType?: string;
    gamestatus?: string;
    results?: string[];
    participants?: string[];
    message?: string[];
  };
  message?: string;
}
