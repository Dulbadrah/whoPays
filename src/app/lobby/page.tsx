"use client";
import { useSearchParams } from "next/navigation";
import RoomLobby from "../lobby/components/Lobby";
import { GameType, GameStatus } from "../../../types/type";

export default function LobbyPage() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get("roomName");
  const roomCode = searchParams.get("roomCode");

  // Query параметрээс room object үүсгэнэ
  const room = roomName && roomCode ? {
    id: 1, // temporary ID
    code: roomCode,
    roomname: roomName,
    createdAt: new Date().toISOString(),
    gameType: GameType.SPIN_WHELL,
    gamestatus: GameStatus.PENDING,
    results: [],
    participants: [], // Энд оролцогчдыг серверээс авах эсвэл дараа нэмнэ
    message: []
  } : null;

  return <RoomLobby room={room} onStartGame={() => {}} onBack={() => {}} />;
}
