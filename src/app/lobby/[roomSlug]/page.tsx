"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import RoomLobby from "../components/Lobby";
import { GameType, GameStatus, Room } from "../../../../types/type";
import { parseRoomSlug, isValidRoomSlug } from "../../../utils/roomSlug";

interface StoredRoomData {
  roomName: string;
  roomCode: string;
  roomId: number;
  nickname: string;
  createdAt: string;
}

export default function RoomLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  const roomSlug = params.roomSlug as string;

  // Helper function to create room object
  const createRoomObject = (roomName: string, roomCode: string, nickname: string, roomId?: number): Room => ({
    id: roomId || Date.now(),
    code: roomCode,
    roomname: roomName,
    createdAt: new Date().toISOString(),
    gameType: GameType.SPIN_WHELL,
    gamestatus: GameStatus.PENDING,
    results: [],
    participants: [{
      id: 1,
      name: nickname,
      roomId: roomId || Date.now(),
      createdAt: new Date().toISOString(),
      results: [],
      reasons: []
    }],
    message: []
  });

  // Helper function to store room data
  const storeRoomData = (roomName: string, roomCode: string, nickname: string, roomId: number) => {
    const roomData: StoredRoomData = {
      roomName,
      roomCode,
      roomId,
      nickname,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('currentRoom', JSON.stringify(roomData));
    localStorage.setItem('userNickname', nickname);
  };

  // Helper function to get nickname
  const getNickname = (): string | null => {
    return searchParams.get("nickname") || localStorage.getItem('userNickname');
  };

  // Helper function to validate stored room data
  const validateStoredRoomData = (roomCode: string): StoredRoomData | null => {
    try {
      const storedData = localStorage.getItem('currentRoom');
      if (!storedData) return null;
      
      const parsed: StoredRoomData = JSON.parse(storedData);
      return parsed.roomCode === roomCode ? parsed : null;
    } catch (error) {
      console.error('Error parsing stored room data:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeRoom = async () => {
      // Validate room slug
      if (!roomSlug || !isValidRoomSlug(roomSlug)) {
        console.error('Invalid room slug format:', roomSlug);
        router.push('/createRoom');
        return;
      }

      // Parse room slug
      const slugData = parseRoomSlug(roomSlug);
      if (!slugData) {
        router.push('/createRoom');
        return;
      }

      const { roomName, roomCode } = slugData;
      const nickname = getNickname();

      if (!nickname) {
        router.push('/joinRoom');
        return;
      }

      try {
        // Fetch real room data from server including all participants
        const response = await fetch(`http://localhost:4200/room/${roomCode}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const roomData = await response.json();
          if (roomData.room) {
            // Update room data with server response
            setRoom(roomData.room);
            
            // Update localStorage with fresh data
            const storedData = {
              roomName: roomData.room.roomname,
              roomCode: roomData.room.code,
              roomId: roomData.room.id,
              nickname: nickname,
              createdAt: new Date().toISOString()
            };
            localStorage.setItem('currentRoom', JSON.stringify(storedData));
          } else {
            console.error('Room not found');
            router.push('/createRoom');
          }
        } else {
          console.error('Failed to fetch room data');
          router.push('/createRoom');
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
        // Fallback to stored data if server is unavailable
        const storedData = validateStoredRoomData(roomCode);
        if (storedData?.nickname) {
          const roomData = createRoomObject(roomName, roomCode, storedData.nickname, storedData.roomId);
          setRoom(roomData);
        } else {
          router.push('/joinRoom');
        }
      }
    };

    initializeRoom().finally(() => setLoading(false));

    // Set up polling to get real-time updates of participants
    const pollInterval = setInterval(async () => {
      if (roomSlug && isValidRoomSlug(roomSlug)) {
        const slugData = parseRoomSlug(roomSlug);
        if (slugData) {
          try {
            const response = await fetch(`http://localhost:4200/room/${slugData.roomCode}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const roomData = await response.json();
              if (roomData.room) {
                setRoom(roomData.room);
              }
            }
          } catch (error) {
            console.error('Error polling room data:', error);
          }
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [roomSlug, searchParams, router]);

  const handleStartGame = (gameType: string) => {
    const slugData = parseRoomSlug(roomSlug);
    console.log(`Starting ${gameType} game in room:`, slugData?.roomCode || 'unknown');
    // TODO: Implement game start logic
  };

  const handleBack = () => {
    localStorage.removeItem('currentRoom');
    localStorage.removeItem('userNickname');
    router.push('/');
  };

  const handleLeaveRoom = async () => {
    if (!room) return;
    
    const currentUserNickname = localStorage.getItem('userNickname');
    if (!currentUserNickname) {
      handleBack();
      return;
    }

    try {
      // Call API to remove participant from room
      const response = await fetch(`http://localhost:4200/room/${room.code}/participants`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: currentUserNickname
        }),
      });

      if (response.ok) {
        // Clear local storage and redirect
        localStorage.removeItem('currentRoom');
        localStorage.removeItem('userNickname');
        router.push('/');
      } else {
        console.error('Failed to leave room, leaving locally');
        handleBack();
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      handleBack();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-blue-600">Loading room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Room not found or invalid room code</p>
          <button 
            onClick={() => router.push('/createRoom')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Room
          </button>
        </div>
      </div>
    );
  }

  return <RoomLobby room={room} onStartGame={handleStartGame} onBack={handleBack} onLeaveRoom={handleLeaveRoom} />;
}
