"use client";

import React from "react";

import { useRoom } from "@/context/room.context";

interface GameProps {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
  textColor: string;
}

interface GameButtonProps {
  game: GameProps;
  isHost: boolean;
  canStart: boolean;
}

export const GameButton: React.FC<GameButtonProps> = ({ game }) => {
  const { room } = useRoom();
  const IconComponent = game.icon;

  const handleStart = () => {
    const map: Record<string, string> = {
      "spin-wheel": "/spin",
      "Lets-run": "/runnerGame",
      "Excuse-section": "/excuseSection",
      "tic-tac-toe": "/tic-tac-toe",
    };

    const target =
      map[game.id] || (game.id.startsWith("/") ? game.id : `/games/${game.id}`);

    if (!room) {
      console.warn(
        "Өрөө байхгүй тул өрөөний параметрүүдгүйгээр чиглүүлж байна"
      );
      window.location.href = target;
      return;
    }

    const roomName = encodeURIComponent(room.roomName);
    const roomCode = encodeURIComponent(room.roomCode);

    console.log("uruu", roomCode);
    const nickname = encodeURIComponent("current_player_nickname_placeholder");

    const url = `${target}?roomName=${roomName}&roomCode=${roomCode}&nickname=${nickname}`;
    window.location.href = url;
  };

  return (
    <button
      onClick={handleStart}
      className={`${game.color} ${game.textColor} p-6 rounded-3xl shadow-xl border-b-4 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 p-4 bg-white/30 rounded-2xl group-hover:bg-white/40 transition-colors">
          <IconComponent size={48} className="mx-auto" />
        </div>
        <h3 className="text-2xl font-black mb-2">{game.name}</h3>
        <p className="text-lg font-medium opacity-90">{game.description}</p>
      </div>
    </button>
  );
};
