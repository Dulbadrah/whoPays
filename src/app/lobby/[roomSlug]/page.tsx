"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import RoomLobby from "../components/RoomLobby";

import { parseRoomSlug, isValidRoomSlug } from "../../../utils/roomSlug";
import roomApi from "../../../utils/roomApi";
import { getNickname, getStoredRoomData, storeRoomData } from "@/utils/localStorageHelper";
import { GameStatus, GameType, Room } from "../../../types/type";

export default function RoomLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<Room| null>(null);
  const [loading, setLoading] = useState(true);

  const roomSlug = params?.roomSlug as string;

  useEffect(() => {
    if (!roomSlug || !isValidRoomSlug(roomSlug)) {
      router.push("/createRoom");
      return;
    }

    const slugData = parseRoomSlug(roomSlug);
    if (!slugData) {
      router.push("/createRoom");
      return;
    }

    const { roomCode } = slugData;
    const nickname = searchParams ? getNickname(searchParams) : null;

    if (!nickname) {
      router.push("/joinRoom");
      return;
    }

    const initializeRoom = async () => {
      try {
        const data = await roomApi.fetchRoomData(roomCode);
        if (data?.room) {
          setRoom(data.room);
          
          // Check if user is already stored as host (from room creation)
          const existingRoomData = getStoredRoomData(roomCode);
          const isHost = existingRoomData?.isHost || false;
          
          console.log('Existing room data:', existingRoomData);
          console.log('Preserving host status:', isHost, 'for user:', nickname);
          
          storeRoomData({
            roomName: data.room.roomname,
            roomCode: data.room.code,
            roomId: data.room.id,
            nickname,
            createdAt: new Date().toISOString(),
            isHost: isHost, // Preserve existing host status
          });
        } else {
          const stored = getStoredRoomData(roomCode);
          if (stored) {
            setRoom({
              id: stored.roomId,
              roomname: stored.roomName,
              code: stored.roomCode,
              createdAt: stored.createdAt,
              gameType: GameType.SPIN_WHEEL,
              gamestatus: GameStatus.PENDING,
              results: [],
              participants: [{ id: 1, name: stored.nickname, roomId: stored.roomId, createdAt: stored.createdAt, results: [], reasons: [],isHost: false }],
              message: [],
            });
          } else {
            router.push("/joinRoom");
          }
        }
      } catch (e) {
        console.error("Init error:", e);
        const stored = getStoredRoomData(roomCode);
        if (stored) {
          setRoom({
            id: stored.roomId,
            roomname: stored.roomName,
            code: stored.roomCode,
            createdAt: stored.createdAt,
            gameType: GameType.SPIN_WHEEL,
            gamestatus: GameStatus.PENDING,
            results: [],
            participants: [{ id: 1, name: stored.nickname, roomId: stored.roomId, createdAt: stored.createdAt, results: [], reasons: [],isHost: false }],
            message: [],
          });
        } else {
          router.push("/joinRoom");
        }
      } finally {
        setLoading(false);
      }
    };

    initializeRoom();

    const stopPolling = roomApi.pollRoomData(slugData.roomCode, setRoom);
    return () => stopPolling();
  }, [roomSlug, searchParams, router]);

  const handleBack = () => {
    localStorage.removeItem("currentRoom");
    router.push("/");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-blue-600">Loading room...</p>
        </div>
      </div>
    );

  if (!room)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Room not found or invalid room code</p>
          <button onClick={() => router.push("/createRoom")} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create New Room
          </button>
        </div>
      </div>
    );

  return <RoomLobby room={room} onBack={handleBack} onRoomUpdate={setRoom} />;
}