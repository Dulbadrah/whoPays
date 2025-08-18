"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Player {
  id: number;
  name: string;
  progress: number;
  isMe: boolean;
}

interface RoomData {
  participants: { id: number; name: string; progress?: number }[];
}

export default function RaceGame({ roomId }: { roomId: number }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<string | null>(null);

  // Backend-аас data авах
  useEffect(() => {
 const fetchRoom = async () => {
  try {
    const res = await fetch(`http://localhost:4200/room/get/15`);
    if (!res.ok) throw new Error("Failed to fetch room");

    const data: { room?: RoomData } = await res.json();

    if (!data.room) {
      console.error("Room data ирсэнгүй");
      return;
    }

    const initialPlayers: Player[] = data.room.participants.map((p, index) => ({
      id: p.id,
      name: p.name,
      progress: p.progress || 0,
      isMe: index === 0, // өөрийнх
    }));

    setPlayers(initialPlayers);
  } catch (err) {
    console.error("Error fetching room:", err);
  }
};

    fetchRoom();
  }, [roomId]);

  const handleClick = (id: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === id && !winner) {
          const newProgress = Math.min(p.progress + 3, 100);
          if (newProgress >= 100 && !winner) {
            setWinner(p.name);
          }
          return { ...p, progress: newProgress };
        }
        return p;
      })
    );
  };

  const resetGame = () => {
    setPlayers((prev) =>
      prev.map((p) => ({ ...p, progress: 0 }))
    );
    setWinner(null);
  };

  if (players.length === 0) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-center">🏁 Running Race</h1>

      <div className="space-y-6">
        {players.map((player) => (
          <div key={player.id}>
            <div className="flex justify-between items-center mb-2">
              <span className={player.isMe ? "font-bold text-blue-600" : ""}>
                {player.name}
              </span>
              {player.isMe && (
                <Button
                  onClick={() => handleClick(player.id)}
                  disabled={!!winner}
                >
                  Run!
                </Button>
              )}
            </div>

            <div className="relative h-10 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-300 ${player.isMe ? "text-blue-600" : "text-gray-700"
                  }`}
                style={{ left: `${player.progress}%` }}
              >
                🏃👨‍🦯
              </div>
            </div>
          </div>
        ))}
      </div>

      {winner && (
        <div className="text-center space-y-3">
          <div className="font-bold text-green-600 text-xl">
            🎉 {winner} is the Winner!
          </div>
          <Button onClick={resetGame}>🔄 Play Again</Button>
        </div>
      )}
    </div>
  );
}
