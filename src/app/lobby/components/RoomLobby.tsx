"use client";

import React from "react";

import * as roomUtils from "@/utils/roomUtils";

import { ArrowLeft, Users, LogOut } from "lucide-react";

import { GameButton } from "./GameButton";
import { PlayerCard } from "./PlayerCard";
import { Room } from "../../../types/type";

interface RoomLobbyProps {
  room: Room | null;
  onBack: () => void;
  onLeaveRoom?: () => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  room,
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

    await roomUtils.removeParticipant(room.code, currentUserNickname);
    localStorage.removeItem("currentRoom");
    localStorage.removeItem("userNickname");

    if (onLeaveRoom) onLeaveRoom();
    else onBack();
  };

  const handleRemovePlayer = async (playerNickname: string) => {
    if (!isCurrentUserHost || playerNickname === currentUserNickname) return;

    const success = await roomUtils.removeParticipant(
      room.code,
      playerNickname
    );
    if (success) window.location.reload();
  };

  const games = [
    {
      id: "spin-wheel",
      name: "Азаа үзэе!",
      icon: require("lucide-react").Target,
      description: "Азын эргэлт",
      color: "bg-red-400 hover:bg-red-500 border-red-600",
      textColor: "text-red-900",
    },
    {
      id: "Lets-run",
      name: "Бүгдээрээ гүйцгээе!",
      icon: require("lucide-react").Dice6,
      description: "Товч дараад гүй!",
      color: "bg-green-400 hover:bg-green-500 border-green-600",
      textColor: "text-green-900",
    },
    {
      id: "Excuse-section",
      name: "Шалтаг тоочье!",
      icon: require("lucide-react").Trophy,
      description: "Хэн нь сайн шалтаг тоочих вэ?",
      color: "bg-purple-400 hover:bg-purple-500 border-purple-600",
      textColor: "text-purple-900",
    },
    {
      id: "tic-tac-toe",
      name: "Tic Tac Toe",
      icon: require("lucide-react").Gamepad2,
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
