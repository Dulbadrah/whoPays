"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RoomLobby from "./components/RoomLobby";
import { GameStatus, GameType, Room } from "../../types/type";


export default function LobbyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room| null>(null);

  useEffect(() => {
    // Try to get room data from URL parameters first
    const roomNameFromURL = searchParams?.get("roomName");
    const roomCodeFromURL = searchParams?.get("roomCode");
    const nicknameFromURL = searchParams?.get("nickname");

    // Get stored data as fallback
    const storedRoomData = localStorage.getItem('currentRoom');
    const storedNickname = localStorage.getItem('userNickname');

    let finalRoomName = roomNameFromURL;
    let finalRoomCode = roomCodeFromURL;
    let finalNickname = nicknameFromURL;

    // Use stored data as fallback for missing URL parameters
    if (!finalRoomName || !finalRoomCode || !finalNickname) {
      try {
        if (storedRoomData) {
          const parsed = JSON.parse(storedRoomData);
          finalRoomName = finalRoomName || parsed.roomName;
          finalRoomCode = finalRoomCode || parsed.roomCode;
          finalNickname = finalNickname || storedNickname || parsed.nickname;
        }
      } catch (error) {
        console.error('Error parsing stored room data:', error);
      }
    }

    if (finalRoomName && finalRoomCode && finalNickname) {
      // Create room object from available parameters
      const roomData: Room = {
        id: Date.now(), // temporary ID based on timestamp
        code: finalRoomCode,
        roomname: finalRoomName,
        createdAt: new Date().toISOString(),
        gameType: GameType.SPIN_WHEEL,
        gamestatus: GameStatus.PENDING,
        results: [],
        participants: [{
          id: 1,
          name: finalNickname,
          roomId: Date.now(),
          createdAt: new Date().toISOString(),
          results: [],
          reasons: []
        }],
        message: []
      };
      setRoom(roomData);
      
      //* Store in localStorage 
      localStorage.setItem('currentRoom', JSON.stringify({
        roomName: finalRoomName,
        roomCode: finalRoomCode,
        roomId: roomData.id,
        nickname: finalNickname,
        createdAt: roomData.createdAt
      }));
      localStorage.setItem('userNickname', finalNickname);
    } else {
      //* Fallback: try to get from localStorage complete
      if (storedRoomData && storedNickname) {
        try {
          const parsed = JSON.parse(storedRoomData);
          const roomData: Room = {
            id: parsed.roomId || Date.now(),
            code: parsed.roomCode,
            roomname: parsed.roomName,
            createdAt: parsed.createdAt || new Date().toISOString(),
            gameType: GameType.SPIN_WHEEL,
            gamestatus: GameStatus.PENDING,
            results: [],
            participants: [{
              id: 1,
              name: storedNickname,
              roomId: parsed.roomId || Date.now(),
              createdAt: parsed.createdAt || new Date().toISOString(),
              results: [],
              reasons: []
            }],
            message: []
          };
          setRoom(roomData);
        } catch (error) {
          console.error('Error parsing stored room data:', error);
          //* Redirect to home or create room if no valid data
          router.push('/createRoom');
        }
      } else {
        //* No room data available, redirect to create room
        router.push('/createRoom');
      }
    }
  }, [searchParams, router]);


  const handleBack = () => {
    // Clear room data and go back
    localStorage.removeItem('currentRoom');
    router.push('/');
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Loading room...</p>
        </div>
      </div>
    );
  }

  return <RoomLobby room={room}  onBack={handleBack} />;
}