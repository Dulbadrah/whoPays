import { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';

type Player = { id: number; name: string; progress: number; socketId?: string };
type GameType = 'spin-wheel' | 'Lets-run' | 'Excuse-section' | 'tic-tac-toe';

//*  Keep rooms in-memory for dev only
const rooms: Record<string, { 
  participants: Player[]; 
  selectedGame?: GameType;
  hostSocketId?: string;
}> = {};
   const port = process.env.PORT || 3000;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    const io = new IOServer((res.socket as any).server, {
      path: '/api/socket',
      cors: {
        origin: [`http://localhost:${port}`],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['polling', 'websocket'],
      allowEIO3: true
    });

    io.on('connection', (socket) => {
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socket.on('join', ({ roomId, name, isHost }) => {
        socket.join(roomId);
        const room = rooms[roomId] || { participants: [] };
        const existing = room.participants.find((p) => p.socketId === socket.id || p.name === name);
        if (!existing) {
          const player: Player = { id: Date.now() % 100000, name, progress: 0, socketId: socket.id };
          room.participants.push(player);
        } else {
          existing.socketId = socket.id;
        }
        
        //* Update host socket ID whenever the host connects 
        if (isHost) {
          room.hostSocketId = socket.id;
        }
        
        rooms[roomId] = room;
        io.to(roomId).emit('room_state', { 
          participants: room.participants,
          selectedGame: room.selectedGame 
        });
        io.to(roomId).emit('player_joined', { name, socketId: socket.id });
      });

      //* Host selects a game
      socket.on('host:select_game', ({ roomId, gameType }) => {
        const room = rooms[roomId];
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        //* Find the player associated with this socket
        const player = room.participants.find(p => p.socketId === socket.id);
        if (!player) {
          socket.emit('error', { message: 'Player not found in room' });
          return;
        }
        
        //* Check if this player is the host 
        const isCurrentSocketTheHost = room.hostSocketId === socket.id;
        if (!isCurrentSocketTheHost) {
          socket.emit('error', { message: 'Only the host can select games' });
          return;
        }
        
        room.selectedGame = gameType;
        io.to(roomId).emit('game:selected', { gameType });
      });

      //* Host starts the game
      socket.on('host:start_game', ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        //* Find the player associated with this socket
        const player = room.participants.find(p => p.socketId === socket.id);
        if (!player) {
          socket.emit('error', { message: 'Player not found in room' });
          return;
        }
        
        //* Check if this player is the host
        const isCurrentSocketTheHost = room.hostSocketId === socket.id;
        if (!isCurrentSocketTheHost) {
          socket.emit('error', { message: 'Only the host can start games' });
          return;
        }
        
        if (!room.selectedGame) {
          socket.emit('error', { message: 'No game selected' });
          return;
        }
        
        // Emit game start to all clients in the room
        io.to(roomId).emit('game:start', { 
          gameType: room.selectedGame,
          roomCode: roomId 
        });
      });

      // Runner game events
      socket.on('runner:run', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        const player = room.participants.find((p) => p.socketId === socket.id);
        if (!player) {
          socket.emit('error', { message: 'Player not found in room' });
          return;
        }
        
        // Increase player progress with some randomness for fun
        const increment = Math.floor(Math.random() * 5) + 3; // 3-7% progress
        player.progress = Math.min(player.progress + increment, 100);
        
        // Broadcast player update to all players in the room
        io.to(roomCode).emit('player_update', player);
        
        // Check if player won
        if (player.progress >= 100) {
          io.to(roomCode).emit('runner:winner', { 
            winner: player.name, 
            playerId: player.id 
          });
        }
      });

      socket.on('runner:reset', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Reset all player progress
        room.participants.forEach((p) => (p.progress = 0));
        
        // Broadcast reset to all players
        io.to(roomCode).emit('runner:reset');
        io.to(roomCode).emit('room_state', { participants: room.participants });
      });

      socket.on('runner:start', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Reset all player progress and start the game
        room.participants.forEach((p) => (p.progress = 0));
        
        // Broadcast game start to all players
        io.to(roomCode).emit('game:start', { gameType: 'Lets-run' });
        io.to(roomCode).emit('room_state', { participants: room.participants });
      });

      // Handle participant removal (host only)
      socket.on('remove_participant', ({ roomId, participantName }) => {
        const room = rooms[roomId];
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Check if the requesting socket is the host
        const isCurrentSocketTheHost = room.hostSocketId === socket.id;
        if (!isCurrentSocketTheHost) {
          socket.emit('error', { message: 'Only the host can remove participants' });
          return;
        }
        
        // Find and remove the participant
        const participantIndex = room.participants.findIndex(p => p.name === participantName);
        if (participantIndex === -1) {
          socket.emit('error', { message: 'Participant not found' });
          return;
        }
        
        const removedParticipant = room.participants[participantIndex];
        room.participants.splice(participantIndex, 1);
        
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



      socket.on('disconnect', () => {
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
    (res.socket as any).server.io = io;
  }

  res.end();
}
