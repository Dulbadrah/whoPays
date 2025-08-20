"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Snail } from "lucide-react";

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
          const newProgress = Math.min(p.progress + 1, 100);
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
          <div key={player.id} className="space-y-2">
            <div className="flex flex-col">
              {/* Player name */}
              <div className="mb-1">
                <span className={player.isMe ? "font-bold text-blue-600" : ""}>
                  {player.name}
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-10 bg-gray-200 rounded-full overflow-hidden">
                {/* Progress icon */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-300 ${player.isMe ? "text-blue-600" : "text-gray-700"
                    }`}
                  style={{ left: `${player.progress}%` }}
                >
                   <Snail />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Run button below all progress bars */}


      {winner && (
        <div className="text-center space-y-3 mt-4">
          <div className="font-bold text-green-600 text-xl">
            🎉 {winner} is the Winner!
          </div>
          <Button onClick={resetGame}>🔄 Play Again</Button>
        </div>
      )}


      {!winner && (
        <div className="text-center mt-4">
          <Button variant={"destructive"} onClick={() => handleClick(players[0].id)}>
            Run!
          </Button>
        </div>
      )}
    </div>
  );
}
