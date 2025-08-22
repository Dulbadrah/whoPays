"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";

type Player = {
  id: string;
  name: string;
  progress: number; // 0-100
};

type Phase = "ready" | "countdown" | "race" | "finished";

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Та", progress: 0 },
    { id: "2", name: "Найз 1", progress: 0 },
    { id: "3", name: "Найз 2", progress: 0 },
  ]);
  const [phase, setPhase] = useState<Phase>("ready");
  const [countdown, setCountdown] = useState<number>(3);
  const [winner, setWinner] = useState<string | null>(null);

  // Winner check
  useEffect(() => {
    if (phase !== "race") return;
    const w = players.find((p) => p.progress >= 100);
    if (w && !winner) {
      setWinner(w.name);
      setPhase("finished");
    }
  }, [players, phase, winner]);

  // Countdown effect
  useEffect(() => {
    if (phase !== "countdown") return;
    setCountdown(3);
    const iv = setInterval(() => {
      setCountdown((s) => {
        if (s <= 1) {
          clearInterval(iv);
          setPhase("race");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  const handleStart = () => {
    if (phase !== "ready") return;
    setWinner(null);
    setPlayers((prev) => prev.map((p) => ({ ...p, progress: 0 })));
    setPhase("countdown");
  };

  const handlePress = () => {
    if (phase !== "race" || winner) return;
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === "1" ? { ...p, progress: Math.min(p.progress + 5, 100) } : p
      )
    );
  };

  const resetGame = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, progress: 0 })));
    setWinner(null);
    setPhase("ready");
    setCountdown(3);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-purple-100">
      <style>{`
        @keyframes roll {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rolling {
          display: inline-block;
          animation: roll 0.6s linear infinite;
        }
      `}</style>

      {/* Header / Status */}
      <div className="p-4 pb-0">
        <h1 className="text-2xl font-bold text-gray-800">🍽️ Restaurant Race</h1>
        <p className="text-gray-600 text-sm">
          Түрүүлсэн хүн төлбөрөөс чөлөөлөгдөнө 😄
        </p>
      </div>

      {/* Players progress list */}
      <div className="flex-1 p-4 space-y-6">
        {players.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow p-3 relative">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{p.name}</span>
              <span>{p.progress}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
              {/* Progress background */}
              <div
                className="h-full bg-blue-500 transition-[width] duration-200"
                style={{ inlineSize: `${p.progress}%` }}
              />
              {/* Rolling Ball emoji */}
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-200"
                style={{ insetInlineStart: `calc(${p.progress}% - 1px)` }}
              >
                <span className="rolling">🏀</span>
              </div>
            </div>
          </div>
        ))}

        {/* Countdown / Winner banners */}
        {phase === "countdown" && (
          <div className="text-center text-3xl font-extrabold text-indigo-700">
            {countdown === 0 ? "GO!" : countdown}
          </div>
        )}
        {phase === "finished" && winner && (
          <div className="text-center text-2xl font-bold text-green-600">
            🏆 {winner} хожлоо!
          </div>
        )}
      </div>

      {/* Bottom control bar */}
      <div className="p-4 bg-white shadow-inner space-y-3">
        {phase === "ready" && (
          <Button
            onClick={handleStart}
            className="w-full h-16 text-xl rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            ▶️ Эхлэх
          </Button>
        )}

        {phase === "countdown" && (
          <Button
            disabled
            className="w-full h-16 text-xl rounded-2xl bg-gray-300 text-gray-700"
          >
            ⏳ Эхлэхэд: {countdown === 0 ? "GO!" : `${countdown} сек`}
          </Button>
        )}

        {phase === "race" && (
          <Button
            onClick={handlePress}
            className="w-full h-16 text-xl rounded-2xl bg-blue-500 hover:bg-blue-700 text-white active:scale-95"
          >
            🚀 Уралдах
          </Button>
        )}

        {phase === "finished" && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={resetGame}
              className="h-14 rounded-xl bg-blue-500 hover:bg-blue-700 text-white"
            >
              🔄 Дахин тоглох
            </Button>
            {/* <Link href="/lobby"> */}
              <Button
                onClick={() => setPhase("ready")}
                variant="outline"
                className="h-14 rounded-xl bg-green-500 hover:bg-green-700"
              >
                🏁 Лобби руу
              </Button>
            {/* </Link> */}
          </div>
        )}
      </div>
    </div>
  );
} 
