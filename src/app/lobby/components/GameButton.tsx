"use client";

import React from "react";

interface GameButtonProps {
  game: any;
  onStart: (id: string) => void;
  isHost: boolean;
  canStart: boolean;
}

export const GameButton: React.FC<GameButtonProps> = ({ game, onStart, isHost, canStart }) => {
  const IconComponent = game.icon;
  return (
    <button
      onClick={() => onStart(game.id)}
      disabled={!isHost || !canStart}
      className={`${game.color} ${game.textColor} p-6 rounded-3xl shadow-xl border-b-4 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 p-4 bg-white/30 rounded-2xl group-hover:bg-white/40 transition-colors">
          <IconComponent size={48} className="mx-auto" />
        </div>
        <h3 className="text-2xl font-black mb-2">{game.name}</h3>
        <p className="text-lg font-medium opacity-90">{game.description}</p>
        {!isHost && (
          <p className="text-sm mt-2 bg-black/20 px-2 py-1 rounded-full">
            Only host can start
          </p>
        )}
        {isHost && !canStart && (
          <p className="text-sm mt-2 bg-black/20 px-2 py-1 rounded-full">
            Need 2+ players
          </p>
        )}
      </div>
    </button>
  );
};
