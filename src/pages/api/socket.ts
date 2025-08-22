import { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import { Socket } from 'socket.io-client';

type Player = { id: number; name: string; progress: number; socketId?: string };
type GameType = 'spin-wheel' | 'Lets-run' | 'Excuse-section' | 'tic-tac-toe';

// Keep rooms in-memory for dev only
const rooms: Record<string, { 
  participants: Player[]; 
  selectedGame?: GameType;
  hostSocketId?: string;
}> = {};
interface NextApiResponseWithSocket<S = Socket> {
  
  socket: import("net").Socket & {
    server: import("http").Server & {
      io: import("socket.io").Server;
    };
  };
 
}
 
export default function handler(req: NextApiRequest, res: NextApiResponse & NextApiResponseWithSocket) {
  
  if (!(res.socket  ).server.io) {
    console.log('Initializing Socket.io server...');
    const io = new IOServer((res.socket).server, {
      path: '/api/socket',
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['polling', 'websocket'],
      allowEIO3: true
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socket.on('join', ({ roomId, name, isHost }) => {
        console.log(`${name} joining room ${roomId} as ${isHost ? 'host' : 'player'}`);
        socket.join(roomId);
        const room = rooms[roomId] || { participants: [] };
        const existing = room.participants.find((p) => p.socketId === socket.id || p.name === name);
        if (!existing) {
          const player: Player = { id: Date.now() % 100000, name, progress: 0, socketId: socket.id };
          room.participants.push(player);
        } else {
          existing.socketId = socket.id;
        }
        
        // Update host socket ID whenever the host connects (handles reconnections)
        if (isHost) {
          room.hostSocketId = socket.id;
          console.log(`Host socket ID updated to ${socket.id} for room ${roomId}`);
        }
        
        rooms[roomId] = room;
        io.to(roomId).emit('room_state', { 
          participants: room.participants,
          selectedGame: room.selectedGame 
        });
        io.to(roomId).emit('player_joined', { name, socketId: socket.id });
      });

      // Host selects a game
      socket.on('host:select_game', ({ roomId, gameType }) => {
        console.log(`Host selecting game ${gameType} in room ${roomId}, socket: ${socket.id}`);
        const room = rooms[roomId];
        if (!room) {
          console.error(`Room ${roomId} not found`);
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Find the player associated with this socket
        const player = room.participants.find(p => p.socketId === socket.id);
        if (!player) {
          console.error(`Player with socket ${socket.id} not found in room ${roomId}`);
          socket.emit('error', { message: 'Player not found in room' });
          return;
        }
        
        // Check if this player is the host (more flexible check)
        const isCurrentSocketTheHost = room.hostSocketId === socket.id;
        if (!isCurrentSocketTheHost) {
          console.error(`Socket ${socket.id} (player: ${player.name}) is not the host (host socket: ${room.hostSocketId}) for room ${roomId}`);
          socket.emit('error', { message: 'Only the host can select games' });
          return;
        }
        
        room.selectedGame = gameType;
        console.log(`Game ${gameType} selected for room ${roomId} by host ${player.name}`);
        io.to(roomId).emit('game:selected', { gameType });
      });

      // Host starts the game
      socket.on('host:start_game', ({ roomId }) => {
        console.log(`Host starting game in room ${roomId}, socket: ${socket.id}`);
        const room = rooms[roomId];
        if (!room) {
          console.error(`Room ${roomId} not found`);
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Find the player associated with this socket
        const player = room.participants.find(p => p.socketId === socket.id);
        if (!player) {
          console.error(`Player with socket ${socket.id} not found in room ${roomId}`);
          socket.emit('error', { message: 'Player not found in room' });
          return;
        }
        
        // Check if this player is the host
        const isCurrentSocketTheHost = room.hostSocketId === socket.id;
        if (!isCurrentSocketTheHost) {
          console.error(`Socket ${socket.id} (player: ${player.name}) is not the host (host socket: ${room.hostSocketId}) for room ${roomId}`);
          socket.emit('error', { message: 'Only the host can start games' });
          return;
        }
        
        if (!room.selectedGame) {
          console.error(`No game selected for room ${roomId}`);
          socket.emit('error', { message: 'No game selected' });
          return;
        }
        
        // Emit game start to all clients in the room
        console.log(`Starting game ${room.selectedGame} for room ${roomId} by host ${player.name}`);
        io.to(roomId).emit('game:start', { 
          gameType: room.selectedGame,
          roomCode: roomId 
        });
      });

      // Runner game events
      socket.on('runner:run', ({ roomCode }) => {
        console.log(`Player running in room ${roomCode}, socket: ${socket.id}`);
        const room = rooms[roomCode];
        if (!room) {
          console.error(`Room ${roomCode} not found`);
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        const player = room.participants.find((p) => p.socketId === socket.id);
        if (!player) {
          console.error(`Player with socket ${socket.id} not found in room ${roomCode}`);
          socket.emit('error', { message: 'Player not found in room' });
          return;
        }
        
        // Increase player progress with some randomness for fun
        const increment = Math.floor(Math.random() * 5) + 3; // 3-7% progress
        player.progress = Math.min(player.progress + increment, 100);
        
        console.log(`${player.name} ran and now has ${player.progress}% progress`);
        
        // Broadcast player update to all players in the room
        io.to(roomCode).emit('player_update', player);
        
        // Check if player won
        if (player.progress >= 100) {
          console.log(`${player.name} wins the race in room ${roomCode}!`);
          io.to(roomCode).emit('runner:winner', { 
            winner: player.name, 
            playerId: player.id 
          });
        }
      });

      socket.on('runner:reset', ({ roomCode }) => {
        console.log(`Resetting runner game in room ${roomCode}`);
        const room = rooms[roomCode];
        if (!room) {
          console.error(`Room ${roomCode} not found`);
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Reset all player progress
        room.participants.forEach((p) => (p.progress = 0));
        
        console.log(`Game reset in room ${roomCode}`);
        
        // Broadcast reset to all players
        io.to(roomCode).emit('runner:reset');
        io.to(roomCode).emit('room_state', { participants: room.participants });
      });

      socket.on('runner:start', ({ roomCode }) => {
        console.log(`Starting runner game in room ${roomCode}`);
        const room = rooms[roomCode];
        if (!room) {
          console.error(`Room ${roomCode} not found`);
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Reset all player progress and start the game
        room.participants.forEach((p) => (p.progress = 0));
        
        console.log(`Runner game started in room ${roomCode}`);
        
        // Broadcast game start to all players
        io.to(roomCode).emit('game:start', { gameType: 'Lets-run' });
        io.to(roomCode).emit('room_state', { participants: room.participants });
      });

      // Handle participant removal (host only)
      socket.on('remove_participant', ({ roomId, participantName }) => {
        console.log(`Host attempting to remove ${participantName} from room ${roomId}`);
        const room = rooms[roomId];
        if (!room) {
          console.error(`Room ${roomId} not found`);
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Check if the requesting socket is the host
        const isCurrentSocketTheHost = room.hostSocketId === socket.id;
        if (!isCurrentSocketTheHost) {
          console.error(`Socket ${socket.id} is not the host for room ${roomId}`);
          socket.emit('error', { message: 'Only the host can remove participants' });
          return;
        }
        
        // Find and remove the participant
        const participantIndex = room.participants.findIndex(p => p.name === participantName);
        if (participantIndex === -1) {
          console.error(`Participant ${participantName} not found in room ${roomId}`);
          socket.emit('error', { message: 'Participant not found' });
          return;
        }
        
        const removedParticipant = room.participants[participantIndex];
        room.participants.splice(participantIndex, 1);
        
        console.log(`Removed ${participantName} from room ${roomId}`);
        
        // Notify the removed participant to leave and disconnect them
        if (removedParticipant.socketId) {
          const removedSocket = io.sockets.sockets.get(removedParticipant.socketId);
          if (removedSocket) {
            removedSocket.emit('participant_removed', { 
              message: 'You have been removed from the room by the host' 
            });
            // Force disconnect the removed participant after a short delay
            setTimeout(() => {
              removedSocket.leave(roomId);
              removedSocket.disconnect(true);
            }, 1000);
          }
        }
        
        // Broadcast updated room state to all remaining participants
        io.to(roomId).emit('room_state', { participants: room.participants });
        io.to(roomId).emit('participant_left', removedParticipant.socketId);
      });

      // Legacy runner events (keep for backward compatibility)
      socket.on('run', ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;
        const player = room.participants.find((p) => p.socketId === socket.id);
        if (!player) return;
        player.progress = Math.min(player.progress + 2, 100);
        io.to(roomId).emit('player_update', player);
      });

      socket.on('reset', ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;
        room.participants.forEach((p) => (p.progress = 0));
        io.to(roomId).emit('room_state', { participants: room.participants });
      });

      socket.on('leave', ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;
        room.participants = room.participants.filter((p) => p.socketId !== socket.id);
        io.to(roomId).emit('room_state', { participants: room.participants });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // remove from any room
        Object.keys(rooms).forEach((roomId) => {
          const room = rooms[roomId];
          const before = room.participants.length;
          room.participants = room.participants.filter((p) => p.socketId !== socket.id);
          if (room.participants.length !== before) {
            io.to(roomId).emit('room_state', { participants: room.participants });
          }
        });
      });
    });

    // attach to Next.js server instance so it won't be reinitialized
    (res.socket).server.io = io;
  }

  res.end();
}
