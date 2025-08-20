"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface Game {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  textColor: string;
}

interface GameButtonProps {
  game: Game;
}

export const GameButton: React.FC<GameButtonProps> = ({ game }) => {
  const router = useRouter();
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

    try {
      const storedRoom = localStorage.getItem("currentRoom");
      const room = storedRoom ? JSON.parse(storedRoom) : null;

      const nickname = encodeURIComponent(localStorage.getItem("userNickname") || "");

      if (!room) {
        console.warn("No room found in localStorage, navigating without params");
        router.push(target);
        return;
      }

      const roomName = encodeURIComponent(room.roomName || "");
      const roomCode = encodeURIComponent(room.roomCode || "");
      
      const url = `${target}?roomName=${roomName}&roomCode=${roomCode}&nickname=${nickname}`;
      router.push(url);
    } catch (err) {
      console.error("Failed to navigate to game:", err);
    }
  };

  return (
    <button
      onClick={handleStart}
      className={`${game.color} ${game.textColor} p-6 rounded-3xl shadow-xl border-b-4 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 p-4 bg-white/30 rounded-2xl group-hover:bg-white/40 transition-colors">
          <IconComponent size={48} className="mx-auto" />
        </div>
        <h3 className="text-2xl font-black mb-2">{game.name}</h3>
        <p className="text-lg font-medium opacity-90">{game.description}</p>

        <p className="text-sm mt-2 bg-black/20 px-2 py-1 rounded-full">
          Only host can start
        </p>
        <p className="text-sm mt-2 bg-black/20 px-2 py-1 rounded-full">
          Need 2+ players
        </p>
      </div>
    </button>
  );
};
