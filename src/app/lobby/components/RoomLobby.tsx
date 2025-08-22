"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import * as roomUtils from "@/utils/roomUtils";



import { ArrowLeft, Users, LogOut, Target, Dice6, Trophy, Gamepad2 } from "lucide-react";


import { GameButton } from "./GameButton";
import { PlayerCard } from "./PlayerCard";
import { Room } from "../../../types/type";

interface RoomLobbyProps {
  room: Room | null;
  onBack: () => void;
  onLeaveRoom?: () => void;
  onRoomUpdate?: (room: Room) => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  room,
  onBack,
  onLeaveRoom,
  onRoomUpdate,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  useEffect(() => {
    if (room && typeof window !== 'undefined') {
      const socketInstance = io('http://localhost:3000', {
        path: '/api/socket',
        transports: ['polling', 'websocket'],
        upgrade: true,
        rememberUpgrade: false,
        timeout: 20000,
        forceNew: false, // Don't force new connection, reuse existing
        autoConnect: true
      });
      
      socketInstance.on('connect', () => {
        const currentUserNickname = localStorage.getItem("userNickname");
        let isCurrentUserHost = false;
        
        try {
          const currentRoomData = localStorage.getItem("currentRoom");
          if (currentRoomData) {
            const parsed = JSON.parse(currentRoomData);
            isCurrentUserHost = parsed.isHost === true;
          }
        } catch (error) {
          console.error("Error parsing room data:", error);
        }

        // Join the room via socket only after connection is established
        if (currentUserNickname) {
          socketInstance.emit('join', {
            roomId: room.code,
            name: currentUserNickname,
            isHost: isCurrentUserHost
          });
        }
      });
      
      socketInstance.on('connect_error', (error) => {
        console.error('Lobby socket connection error:', error);
      });

      // Listen for game selection events
      socketInstance.on('game:selected', ({ gameType }) => {
        setSelectedGame(gameType);
      });

      // Listen for game start events and redirect
      socketInstance.on('game:start', ({ gameType, roomCode }) => {
        const gamePathMap: Record<string, string> = {
          "spin-wheel": "/spin",
          "Lets-run": "/runnerGame", 
          "Excuse-section": "/excuseSection",
          "tic-tac-toe": "/tic-tac-toe",
        };

        const path = gamePathMap[gameType];
        if (path) {
          const roomName = encodeURIComponent(room?.roomname || '');
          const nickname = encodeURIComponent(localStorage.getItem('userNickname') || '');
          
          // Determine if current user is host
          let isCurrentUserHost = false;
          try {
            const currentRoomData = localStorage.getItem("currentRoom");
            if (currentRoomData) {
              const parsed = JSON.parse(currentRoomData);
              isCurrentUserHost = parsed.isHost === true;
            }
          } catch (error) {
            console.error("Error parsing room data for host info:", error);
          }
          
          const isHostParam = isCurrentUserHost ? 'true' : 'false';
          const url = `${path}?roomName=${roomName}&roomCode=${roomCode}&nickname=${nickname}&isHost=${isHostParam}`;
          window.location.href = url;
        }
      });

      // Listen for errors
      socketInstance.on('error', (error) => {
        console.error('Socket error received:', error);
        alert(`Error: ${error.message}`);
      });

      // Listen for participant removal notification
      socketInstance.on('participant_removed', (data) => {
        alert(data.message);
        // Redirect to join room page
        window.location.href = '/joinRoom';
      });

      // Listen for room state updates to keep lobby in sync
      socketInstance.on('room_state', (data) => {
        if (data.participants && room && onRoomUpdate) {
          // Update the room state with new participant list
          const updatedRoom: Room = {
            ...room,
            participants: data.participants
          };
          onRoomUpdate(updatedRoom);
        }
      });

      // Listen for participant left events
      socketInstance.on('participant_left', (socketId) => {
        console.log('Participant left:', socketId);
        // Room state will be updated via room_state event
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [room, onRoomUpdate]); // Only depend on room code, not entire room object

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">No room data available</p>
      </div>
    );
  }

  const players = Array.isArray(room.participants) ? room.participants : [];
  const currentUserNickname =
    typeof window !== "undefined" ? localStorage.getItem("userNickname") : null;

  let isCurrentUserHost = false;
  try {
    const currentRoomData =
      typeof window !== "undefined"
        ? localStorage.getItem("currentRoom")
        : null;
    if (currentRoomData) {
      const parsed = JSON.parse(currentRoomData);
      isCurrentUserHost = parsed.isHost === true;
    }
  } catch (error) {
    console.error("Error parsing room data:", error);
  }

  const handleLeaveRoom = async () => {
    if (!currentUserNickname) return;

    // Leave via socket
    if (socket) {
      socket.emit('leave', { roomId: room.code });
    }

    if (currentUserNickname) {
      await roomUtils.removeParticipant(socket, room.code, currentUserNickname);
    }
    localStorage.removeItem("currentRoom");
    localStorage.removeItem("userNickname");

    if (onLeaveRoom) onLeaveRoom();
    else onBack();
  };

  const handleRemovePlayer = async (playerNickname: string) => {
    if (!isCurrentUserHost || playerNickname === currentUserNickname) return;

    const success = await roomUtils.removeParticipant(
      socket,
      room.code,
      playerNickname
    );
    if (success) {
      // Room state will be updated via socket event, no need to reload
      console.log(`Successfully removed ${playerNickname}`);
    } else {
      alert('Failed to remove player. Please try again.');
    }
  };
const games = [
  {
    id: "spin-wheel",
    name: "Азаа үзэе!",
    icon: Target,
    description: "Азын эргэлт",
    color: "bg-red-400 hover:bg-red-500 border-red-600",
    textColor: "text-red-900",
  },
  {
    id: "Lets-run",
    name: "Бүгдээрээ гүйцгээе!",
    icon: Dice6,
    description: "Товч дараад гүй!",
    color: "bg-green-400 hover:bg-green-500 border-green-600",
    textColor: "text-green-900",
  },
  {
    id: "Excuse-section",
    name: "Шалтаг тоочье!",
    icon: Trophy,
    description: "Хэн нь сайн шалтаг тоочих вэ?",
    color: "bg-purple-400 hover:bg-purple-500 border-purple-600",
    textColor: "text-purple-900",
  },
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    icon: Gamepad2,
    description: "Tic Tac Toe",
    color: "bg-orange-400 hover:bg-orange-500 border-orange-600",
    textColor: "text-orange-900",
  },
];


  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-blue-70 p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft size={20} />
            Нүүр хуудас
          </button>
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-2 text-red-700 hover:text-red-800 font-medium transition-colors bg-red-100/50 hover:bg-red-100/80 px-4 py-2 rounded-full backdrop-blur-sm border border-red-200"
          >
            <LogOut size={20} />
            Өрөөнөөс гарах
          </button>
        </div>
        <div className="w-24" />
      </div>

      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 text-center">
          <h1 className="text-3xl font-black text-blue-800 mb-2">
            Өрөөний нэр: {room.roomname}
          </h1>
          <div className="flex items-center justify-center gap-4 text-blue-600">
            <div className="flex items-center gap-2">
              <span className="font-bold">Өрөөний код:</span>
              <span className="bg-blue-100 px-3 py-1 rounded-full font-mono text-lg font-bold">
                {room.code}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={20} />
              <span className="font-bold">
                {players.length} тоглогч{players.length !== 1 ? "ид" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-1xl font-bold text-blue-800 mb-6 text-center flex items-center justify-center gap-2">
          <Users size={24} />
          Өрөөнд байгаа тоглогчид ({players.length}/10)
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentUser={player.name === currentUserNickname}
              isHost={roomUtils.isHost(player, index)}
              isCurrentUserHost={isCurrentUserHost}
              onRemove={handleRemovePlayer}
            />
          ))}

          {players.length < 6 && (
            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border-3 border-dashed border-blue-300 text-center flex flex-col items-center justify-center min-h-[120px]">
              <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto mb-3 flex items-center justify-center text-blue-500">
                <Users size={24} />
              </div>
              <p className="text-blue-600 font-medium text-sm">
                Бусад тоглогчдыг хүлээж байна...
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-blue-800 mb-4">
          Тоглоомоо сонгоно уу!🎮
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {games.map((game) => (
            <GameButton
              key={game.id}
              game={game}
              isHost={isCurrentUserHost}
              canStart={players.length >= 2}
              socket={socket}
              selectedGame={selectedGame}
              roomCode={room.code}
            />
          ))}
        </div>
      </div>

      {players.length < 2 && (
        <div className="mt-8 text-center">
          <div className="inline-block bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4">
            <p className="text-yellow-800 font-bold">
              🎯 Тоглоом эхлэхэд 2-оос дээш тоглогч шаардлагатай!
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Share the room code{" "}
              <span className="font-black">{room.code}</span> with your friends
            </p>
          </div>
        </div>
      )}

      <div className="mt-12 flex justify-center space-x-6">
        {["red", "yellow", "green", "purple"].map((color, idx) => (
          <div
            key={idx}
            className={`w-6 h-6 bg-${color}-400 rounded-full animate-bounce opacity-60`}
            style={{ animationDelay: `${idx * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default RoomLobby;
