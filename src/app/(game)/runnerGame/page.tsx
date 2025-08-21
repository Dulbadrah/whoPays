"use client";

import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type Player = {
  id: number;
  name: string;
  progress: number;
  isMe?: boolean;
  socketId?: string;
};

export default function RaceGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Extract parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomNameParam = urlParams.get('roomName');
    const roomCodeParam = urlParams.get('roomCode');
    const nicknameParam = urlParams.get('nickname');
    
    if (roomNameParam) setRoomName(decodeURIComponent(roomNameParam));
    if (roomCodeParam) setRoomCode(roomCodeParam);
    if (nicknameParam) {
      setNickname(decodeURIComponent(nicknameParam));
    } else {
      // Fallback to localStorage
      const storedNickname = localStorage.getItem('userNickname');
      if (storedNickname) setNickname(storedNickname);
    }

    // Fallback to localStorage for room info if not in URL
    if (!roomCodeParam) {
      const storedRoom = localStorage.getItem("currentRoom");
      if (storedRoom) {
        try {
          const parsedRoom = JSON.parse(storedRoom);
          if (parsedRoom.roomCode) {
            setRoomCode(String(parsedRoom.roomCode));
          }
        } catch (e) {
          console.error("Failed to parse currentRoom", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    console.log('Runner game useEffect triggered with:', { roomCode, nickname });
    
    if (!roomCode || !nickname) {
      console.log('Missing required params, skipping socket connection');
      return;
    }

    console.log('Connecting to runner game with:', { roomCode, nickname });

    const socket = io('http://localhost:3000', {
      path: '/api/socket',
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000,
      forceNew: false,
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log('Runner game socket connected:', socket.id);
      console.log('About to join room with:', { roomCode, nickname });
      setIsConnected(true);
      
      // Join the room using the same format as the lobby
      socket.emit("join", { 
        roomId: roomCode, 
        name: nickname, 
        isHost: false  // Players joining the runner game are not hosts
      });
    });

    socket.on("connect_error", (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socket.on("disconnect", (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on("room_state", (state: { participants: Player[] }) => {
      console.log('Room state updated:', state);
      const mapped = state.participants.map((p) => ({
        ...p,
        isMe: p.name === nickname,
      }));
      setPlayers(mapped);
    });

    socket.on("player_update", (player: Player) => {
      console.log('Player update:', player);
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === player.id ? { ...p, progress: player.progress } : p
        )
      );
      
      // Check for winner
      if (player.progress >= 100 && !winner) {
        setWinner(player.name);
        setIsGameActive(false);
      }
    });

    socket.on("game:start", ({ gameType }) => {
      if (gameType === 'Lets-run') {
        console.log('Runner game started!');
        setIsGameActive(true);
        setWinner(null);
        // Reset all player progress
        setPlayers(prev => prev.map(p => ({ ...p, progress: 0 })));
      }
    });

    socket.on("runner:reset", () => {
      console.log('Game reset');
      setPlayers(prev => prev.map(p => ({ ...p, progress: 0 })));
      setWinner(null);
      setIsGameActive(true);
    });

    socket.on("runner:winner", ({ winner: winnerName }) => {
      console.log('Winner announced:', winnerName);
      setWinner(winnerName);
      setIsGameActive(false);
    });

    socket.on("error", (error) => {
      console.error('Socket error:', error);
      
      // Handle specific errors
      if (error.message === 'Room not found') {
        alert(`Room ${roomCode} not found. Please join through the lobby first.`);
        // Redirect to join room page
        window.location.href = `/joinRoom`;
      } else {
        alert(`Error: ${error.message}`);
      }
    });

    return () => {
      console.log('Cleaning up runner game socket');
      if (socket.connected) {
        socket.emit("leave", { roomId: roomCode });
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [roomCode, nickname]);

  const handleRun = () => {
    if (!socketRef.current || !roomCode || !isGameActive) return;
    
    const myPlayer = players.find((p) => p.isMe);
    if (!myPlayer || winner) return;

    console.log('Running for player:', myPlayer.name);
    socketRef.current.emit("runner:run", { roomCode });
  };

  const resetGame = () => {
    if (!socketRef.current || !roomCode) return;
    
    console.log('Resetting game');
    socketRef.current.emit("runner:reset", { roomCode });
  };

  const startGame = () => {
    if (!socketRef.current || !roomCode) return;
    
    console.log('Starting runner game');
    setIsGameActive(true);
    setWinner(null);
    socketRef.current.emit("runner:start", { roomCode });
  };

  // Loading states
  if (!roomCode || !nickname) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center border border-white/30">
          <div className="text-2xl font-bold text-gray-800 mb-4">🏃‍♂️ Loading Race...</div>
          <div className="text-gray-600">Room: {roomCode || 'Not found'}</div>
          <div className="text-gray-600">Player: {nickname || 'Not found'}</div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center border border-white/30">
          <div className="text-2xl font-bold text-gray-800 mb-4">🔗 Connecting to Race...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center border border-white/30">
          <div className="text-2xl font-bold text-gray-800 mb-4">⏳ Waiting for Racers...</div>
          <div className="text-gray-600">Room: {roomName || roomCode}</div>
        </div>
      </div>
    );
  }

  const myPlayer = players.find((p) => p.isMe);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-10 w-32 h-32 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-10 left-1/3 w-36 h-36 bg-green-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-5xl w-full border border-white/30">
        
        {/* Header Section */}
        <div className="text-center space-y-4 mb-8">
          <div className="relative">
            <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-lg">
              🏃‍♂️ SPEED RACE 🏃‍♀️
            </h1>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-lg font-semibold flex-wrap">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg">
              🏠 {roomName || roomCode}
            </div>
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-full shadow-lg">
              👥 {players.length} Racers
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} shadow-lg`}></div>
            <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </div>

        {/* Game Status Section */}
        {!isGameActive && !winner && (
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-3">🏁</div>
              <div className="text-yellow-800 font-bold text-2xl mb-2">Race Ready!</div>
              <div className="text-yellow-700 mb-4 text-lg">Racers are at the starting line. Ready to run?</div>
              <button 
                onClick={startGame} 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 text-xl"
              >
                🚀 START RACE
              </button>
            </div>
          </div>
        )}

        {/* Race Track Section */}
        <div className="space-y-6 mb-8">
          {players.map((player, index) => (
            <div key={player.id} className="relative">
              {/* Player Info Row */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-lg ${
                    player.isMe ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 
                    winner === player.name ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`font-bold text-xl ${player.isMe ? "text-blue-600" : "text-gray-700"}`}>
                    {player.isMe ? "🫵 " : ""}
                    {player.name}
                    {winner === player.name ? " 🏆" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-mono font-bold text-gray-700">
                    {player.progress}%
                  </span>
                  {player.progress === 100 && (
                    <div className="animate-bounce text-3xl">🏆</div>
                  )}
                </div>
              </div>

              {/* Race Track */}
              <div className="relative h-20 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full overflow-hidden border-4 border-gray-300 shadow-inner">
                {/* Finish line */}
                <div className="absolute right-3 top-0 bottom-0 w-2 bg-red-600 opacity-50"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-red-500/30 to-transparent"></div>
                
                {/* Progress bar */}
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out ${
                    player.isMe 
                      ? "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 shadow-lg" 
                      : winner === player.name
                      ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 shadow-lg"
                      : "bg-gradient-to-r from-gray-300 to-gray-400"
                  }`}
                  style={{ width: `${player.progress}%` }}
                >
                  {/* Progress shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-pulse"></div>
                </div>
                
                {/* Runner avatar */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 text-4xl transition-all duration-500 ease-out z-10 drop-shadow-lg"
                  style={{ 
                    left: `${Math.max(0, Math.min(player.progress - 4, 92))}%`,
                    transform: `translateY(-50%) ${player.progress > 0 ? 'scale(1.2)' : 'scale(1)'}` 
                  }}
                >
                  {player.isMe ? "🏃‍♂️" : "🏃‍♀️"}
                </div>

                {/* Track markers */}
                <div className="absolute top-2 bottom-2 left-1/4 w-0.5 bg-white/60"></div>
                <div className="absolute top-2 bottom-2 left-1/2 w-0.5 bg-white/60"></div>
                <div className="absolute top-2 bottom-2 left-3/4 w-0.5 bg-white/60"></div>
              </div>

              {/* Player status indicators */}
              <div className="flex justify-between mt-3 text-sm">
                <div className={`font-semibold ${player.isMe ? 'text-blue-600' : 'text-gray-500'}`}>
                  {player.isMe ? 'YOU' : 'OPPONENT'}
                </div>
                <div className="font-medium text-gray-600">
                  {player.progress < 25 ? '🐌 Getting Started' : 
                   player.progress < 50 ? '🚶‍♂️ Picking Up Speed' :
                   player.progress < 75 ? '🏃‍♂️ Running Fast' :
                   player.progress < 100 ? '⚡ Almost There!' : '🏆 Champion!'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Winner Celebration */}
        {winner && (
          <div className="text-center space-y-6 relative mb-8">
            <div className="bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-100 border-4 border-yellow-400 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-8xl mb-4 animate-bounce">🏆</div>
                <div className="text-4xl font-black text-yellow-800 mb-3">
                  RACE CHAMPION!
                </div>
                <div className="text-3xl font-bold text-yellow-700 mb-4">
                  🎉 {winner} 🎉
                </div>
                <div className="text-yellow-600 text-xl mb-6">
                  Incredible speed! What an amazing race! 
                </div>
                <button 
                  onClick={resetGame} 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 text-xl"
                >
                  🔄 RACE AGAIN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Controls - Active Game */}
        {isGameActive && !winner && myPlayer && (
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-3xl p-8 shadow-lg">
              <div className="text-blue-800 font-bold text-2xl mb-6">
                Your Progress: {myPlayer.progress}%
              </div>
              
              <button
                className="group relative bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-black py-6 px-12 rounded-full shadow-xl transform hover:scale-110 transition-all duration-200 text-2xl"
                onClick={handleRun}
                disabled={!isGameActive || !!winner}
              >
                <span className="relative z-10 flex items-center gap-3">
                  🏃‍♂️ RUN FASTER! 💨
                </span>
              </button>
              
              <div className="text-blue-700 text-lg mt-4 animate-pulse">
                💡 Keep clicking to run faster and win the race!
              </div>
            </div>
          </div>
        )}

        {/* Not in Room */}
        {!myPlayer && !isGameActive && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
              <div className="text-4xl mb-4">❌</div>
              <div className="text-red-800 font-bold text-xl mb-2">Not in Race</div>
              <div className="text-red-700 mb-4 text-lg">
                You need to join the lobby first to participate in this race!
              </div>
              <button
                onClick={() => window.location.href = '/joinRoom'}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🚪 Join Lobby
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
