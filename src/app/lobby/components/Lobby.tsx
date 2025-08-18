"use client"; // 🔥 CRITICAL FIX: Add this directive at the very top
 
import React from "react";
import {
  ArrowLeft,
  Users,
  Gamepad2,
  Target,
  Dice6,
  Trophy,
} from "lucide-react";
import { Room } from "../../../../types/type";
// import { Room } from "../types/type";
// Keep this import as per your provided code
 
interface RoomLobbyProps {
  room: Room | null;
  onStartGame: (gameType: string) => void;
  onBack: () => void;
}
 
export const RoomLobby: React.FC<RoomLobbyProps> = ({
  // Changed to named export as per your provided code
  room,
  onStartGame,
  onBack,
}) => {
//   if (!room) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-red-600">No room data available</p>
//       </div>
//     );
//   }
console.log(room);

  const players = room && Array.isArray(room.participants) ? room.participants : [];

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
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft size={20} />
          Leave Room
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-black text-blue-800 mb-1">
            {room ? room.roomname : "Unknown Room"}
          </h1>
          <p className="text-lg font-semibold text-blue-700 mb-2">
            Room Code: <span className="font-black text-2xl">{room ? room.code : ""}</span>
          </p>
          {/* <p className="text-sm text-blue-600 mb-2">
            Room ID: #{room ? room.id : ""}
          </p> */}
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Users size={18} />
            <span className="font-medium">{players.length} players joined</span>
          </div>
        </div>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>
 
      <div className="max-w-4xl mx-auto">
        {/* Players Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center flex items-center justify-center gap-2">
            <Users size={24} />
            Players in the Room
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Use the 'players' variable here */}
            {players.map((player, index) => (
              <div
                key={player.id}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border-3 border-white/50 text-center transform hover:scale-105 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-black text-yellow-800 shadow-inner">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <p className="font-bold text-blue-800 text-lg">{player.name}</p>
                {index === 0 && (
                  <span className="inline-block mt-1 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">
                    HOST
                  </span>
                )}
              </div>
            ))}
 
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
                // Use the 'players' variable here
                disabled={players.length < 2}
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
 
export default RoomLobby; // Kept for compatibility, but the named export is preferred
 
 