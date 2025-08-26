"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { FaCrown, FaUser } from "react-icons/fa";

const socket = io("http://localhost:4200");

export default function Page() {
  const [step, setStep] = useState<"lobby" | "question" | "result">("lobby");
  const [roomCode, setRoomCode] = useState("GAME");
  const [players, setPlayers] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [votes, setVotes] = useState<any>({});
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    socket.emit("autoJoin", (res: any) => {
      setRoomCode(res.code);
      setPlayers(res.players);
    });

    socket.on("roomUpdate", (room) => setPlayers(room.players));
    socket.on("newQuestion", (q) => { setQuestion(q); setStep("question"); });
    socket.on("voteUpdate", (v) => setVotes(v));
    socket.on("roundResult", (r) => { setResult(r); setStep("result"); });
  }, []);

  const startQuestion = () => socket.emit("startQuestion", roomCode);
  const vote = (id: string) => socket.emit("vote", { code: roomCode, votedId: id });

  return (
    <div className="p-6 max-w-lg mx-auto text-center min-h-screen-20 bg-gradient-to-br from-purple-100 to-blue-100 ">
      {/* Room code */}
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold tracking-widest text-purple-700 drop-shadow">Room: {roomCode}</h2>
      </div>

      {/* Lobby */}
      {step === "lobby" && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Тоглогчид</h3>
          <ul className="flex flex-wrap justify-center gap-3 mb-6">
            {players.map((p) => (
              <li key={p.id} className="bg-white shadow rounded-lg px-4 py-2 flex items-center gap-2">
                <FaUser className="text-purple-400" />
                <span className="font-medium">{p.name}</span>
                <span className="ml-2 bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">{p.score}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={startQuestion}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition"
          >
            Асуулт эхлүүлэх
          </button>
        </div>
      )}

      {/* Question */}
      {step === "question" && (
        <div>
          <h2 className="text-2xl font-bold text-blue-700 mb-6 animate-pulse">{question}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() => vote(p.id)}
                className="bg-white border-2 border-blue-300 hover:bg-blue-100 hover:border-blue-500 text-blue-700 font-semibold px-6 py-3 rounded-xl shadow transition-all duration-200 active:scale-95"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

     {/* Result */}
{step === "result" && (
  <div>
    <h2 className="text-2xl font-bold text-green-600 mb-4">Үр дүн</h2>
    {result.winner ? (
      <div className="flex flex-col items-center gap-2">
        <FaCrown className="text-yellow-400 text-4xl animate-bounce" />
        <p className="text-lg font-semibold text-gray-800">
          Ялагч: <span className="text-purple-700">{result.winner.name}</span>
        </p>
        <p className="text-sm text-gray-600">
          Оноо: <span className="font-bold text-blue-600">{result.winner.score}</span>
        </p>
      </div>
    ) : (
      <p className="text-lg text-gray-600">Тэнцсэн!</p>
    )}

    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2 text-gray-700">Онооны самбар</h3>
      <ul className="flex flex-col gap-2 items-center">
        {players.map((p) => (
          <li key={p.id} className="bg-white px-4 py-2 rounded-lg shadow flex gap-2 items-center">
            <FaUser className="text-purple-400" />
            <span>{p.name}</span>
            <span className="ml-2 bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {p.score}
            </span>
          </li>
        ))}
      </ul>
    </div>

    <button
      onClick={startQuestion}
      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg mt-6 hover:scale-105 transition"
    >
      Дараагийн асуулт
    </button>
  </div>
)}
    </div>
  );
}