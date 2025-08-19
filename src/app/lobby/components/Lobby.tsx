"use client"; 

import React from "react";
import {
  ArrowLeft,
  Users,
  Gamepad2,
  Target,
  Dice6,
  Trophy,
  LogOut,
} from "lucide-react";
import { Room } from "../../../../types/type";
// import { Room } from "../types/type";

 
interface RoomLobbyProps {
  room: Room | null;
  onStartGame: (gameType: string) => void;
  onBack: () => void;
  onLeaveRoom?: () => void;
}
 
export const RoomLobby: React.FC<RoomLobbyProps> = ({
  // Changed to named export as per your provided code
  room,
  onStartGame,
  onBack,
  onLeaveRoom,
}) => {
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">No room data available</p>
      </div>
    );
  }
  
  console.log('Room data:', room);
  console.log('Participants:', room.participants);
  
  const players = room && Array.isArray(room.participants) ? room.participants : [];
  
  // Get current user's nickname from localStorage
  const currentUserNickname = typeof window !== 'undefined' ? localStorage.getItem('userNickname') : null;
  const currentRoomData = typeof window !== 'undefined' ? localStorage.getItem('currentRoom') : null;
  let isCurrentUserHost = false;
  
  try {
    if (currentRoomData) {
      const parsed = JSON.parse(currentRoomData);
      isCurrentUserHost = parsed.isHost === true;
    }
  } catch (error) {
    console.error('Error parsing room data:', error);
  }

  // Helper function to determine if a participant is the host
  const isHost = (participant: any, index: number) => {
    // First participant is typically the host, or check if participant has isHost flag
    return participant.isHost === true || index === 0;
  };

  // Handle leaving room
  const handleLeaveRoom = async () => {
    if (!room || !currentUserNickname) return;
    
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
        // Clear local storage
        localStorage.removeItem('currentRoom');
        localStorage.removeItem('userNickname');
        
        // Call the onLeaveRoom callback if provided, otherwise use onBack
        if (onLeaveRoom) {
          onLeaveRoom();
        } else {
          onBack();
        }
      } else {
        console.error('Failed to leave room');
        // Fallback: still leave locally
        onBack();
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      // Fallback: still leave locally
      onBack();
    }
  };

  const games = [
    {
      id: "spin-wheel",
      name: "Spin the Wheel",
      icon: Target,
      description: "Classic wheel spinning game",
      color: "bg-red-400 hover:bg-red-500 border-red-600",
      textColor: "text-red-900",
    },
    {
      id: "dice-roll",
      name: "Lucky Dice",
      icon: Dice6,
      description: "Roll the dice to decide",
      color: "bg-green-400 hover:bg-green-500 border-green-600",
      textColor: "text-green-900",
    },
    {
      id: "card-draw",
      name: "Draw Cards",
      icon: Trophy,
      description: "Pick the unlucky card",
      color: "bg-purple-400 hover:bg-purple-500 border-purple-600",
      textColor: "text-purple-900",
    },
    {
      id: "number-guess",
      name: "Number Game",
      icon: Gamepad2,
      description: "Guess the magic number",
      color: "bg-orange-400 hover:bg-orange-500 border-orange-600",
      textColor: "text-orange-900",
    },
  ];
 
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-blue-50 p-4">
      {/* Header */}
      {/* The CreateRoomForm component is currently rendered here.
          Consider if this is the intended placement as RoomLobby is typically
          for a room that has already been created. */}

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
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Room Info Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
          <div className="text-center">
            <h1 className="text-3xl font-black text-blue-800 mb-2">Lobby Name: {room.roomname}</h1>
            <div className="flex items-center justify-center gap-4 text-blue-600">
              <div className="flex items-center gap-2">
                <span className="font-bold">Room Code:</span>
                <span className="bg-blue-100 px-3 py-1 rounded-full font-mono text-lg font-bold">
                  {room.code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span className="font-bold">{players.length} participant{players.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>  
        </div>

        {/* Players Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center flex items-center justify-center gap-2">
            <Users size={24} />
            Players in the Room ({players.length}/10)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((player, index) => {
              const isCurrentUser = player.name === currentUserNickname;
              const playerIsHost = isHost(player, index);
              
              return (
                <div
                  key={player.id}
                  className={`bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border-3 ${
                    isCurrentUser 
                      ? 'border-blue-400 bg-blue-50/80' 
                      : playerIsHost
                        ? 'border-yellow-400 bg-yellow-50/80'
                        : 'border-white/50'
                  } text-center transform hover:scale-105 transition-all duration-200`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${
                    playerIsHost 
                      ? 'from-yellow-300 to-yellow-400' 
                      : isCurrentUser
                        ? 'from-blue-300 to-blue-400'
                        : 'from-gray-300 to-gray-400'
                  } rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-black ${
                    playerIsHost 
                      ? 'text-yellow-800' 
                      : isCurrentUser
                        ? 'text-blue-800'
                        : 'text-gray-800'
                  } shadow-inner`}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-blue-800 text-lg">{player.name}</p>
                  <div className="flex flex-col gap-1 mt-2">
                    {playerIsHost && (
                      <span className="inline-block px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">
                        👑 HOST
                      </span>
                    )}
                    {isCurrentUser && (
                      <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 text-xs font-bold rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
 
            {/* Add more players placeholder */}
            {/* Use the 'players' variable here */}
            {players.length < 6 && (
              <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border-3 border-dashed border-blue-300 text-center flex flex-col items-center justify-center min-h-[120px]">
                <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto mb-3 flex items-center justify-center text-blue-500">
                  <Users size={24} />
                </div>
                <p className="text-blue-600 font-medium text-sm">
                  Waiting for more players...
                </p>
              </div>
            )}
          </div>
        </div>
 
        {/* Games Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-blue-800 mb-4">
            Choose Your Game!
          </h2>
          <p className="text-blue-700 text-lg font-medium mb-8">
            Pick a fun way to decide who pays the bill! 🎮
          </p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => onStartGame(game.id)}
                // Only host can start games and need at least 2 players
                disabled={!isCurrentUserHost || players.length < 2}
                className={`${game.color} ${game.textColor} p-6 rounded-3xl shadow-xl border-b-4 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-4 bg-white/30 rounded-2xl group-hover:bg-white/40 transition-colors">
                    <IconComponent size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">{game.name}</h3>
                  <p className="text-lg font-medium opacity-90">
                    {game.description}
                  </p>
                  {!isCurrentUserHost && (
                    <p className="text-sm mt-2 bg-black/20 px-2 py-1 rounded-full">
                      Only host can start
                    </p>
                  )}
                  {isCurrentUserHost && players.length < 2 && (
                    <p className="text-sm mt-2 bg-black/20 px-2 py-1 rounded-full">
                      Need 2+ players
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
 
        {/* Use the 'players' variable here */}
        {players.length < 2 && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4">
              <p className="text-yellow-800 font-bold">
                🎯 You need at least 2 players to start a game!
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Share the room code{" "}
                <span className="font-black">{room ? room.code : ""}</span> with your
                friends
              </p>
            </div>
          </div>
        )}
 
        {/* Fun Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-6">
          <div className="w-6 h-6 bg-red-300 rounded-full animate-bounce opacity-60"></div>
          <div
            className="w-6 h-6 bg-yellow-300 rounded-full animate-bounce opacity-60"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-6 h-6 bg-green-300 rounded-full animate-bounce opacity-60"
            style={{ animationDelay: "0.4s" }}
          ></div>
          <div
            className="w-6 h-6 bg-blue-300 rounded-full animate-bounce opacity-60"
            style={{ animationDelay: "0.6s" }}
          ></div>
          <div
            className="w-6 h-6 bg-purple-300 rounded-full animate-bounce opacity-60"
            style={{ animationDelay: "0.8s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};
 
export default RoomLobby; 
 
 