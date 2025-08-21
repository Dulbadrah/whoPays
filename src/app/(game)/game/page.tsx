"use client"

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function Home() {
  const [results, setResults] = useState<{ user: string; result: number }[]>([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Connect to Express backend Socket.IO
    socket = io("http://localhost:4200");

    socket.on("spinResult", (data: { user: string; result: number }) => {
      setResults((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSpin = async () => {
    if (!username) return alert("Enter username");

    // Call Express REST API
    await fetch("http://localhost:4200/spin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: username }),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Spin Wheel Game</h1>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Your name"
      />
      <button onClick={handleSpin}>Spin</button>

      <ul>
        {results.map((r, idx) => (
          <li key={idx}>
            {r.user} spun and got {r.result}
          </li>
        ))}
      </ul>
    </div>
  );
}
