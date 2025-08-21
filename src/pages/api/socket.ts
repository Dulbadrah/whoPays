import { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';

type Player = { id: number; name: string; progress: number; socketId?: string };

// Keep rooms in-memory for dev only
const rooms: Record<string, { participants: Player[] }> = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint should only be called once to upgrade to websocket via next's server
  if (!(res.socket as any).server.io) {
    console.log('Initializing Socket.io server...');
    const io = new IOServer((res.socket as any).server, {
      path: '/api/socket_io',
    });

    io.on('connection', (socket) => {
      socket.on('join', ({ roomId, name }) => {
        socket.join(roomId);
        const room = rooms[roomId] || { participants: [] };
        const existing = room.participants.find((p) => p.socketId === socket.id || p.name === name);
        if (!existing) {
          const player: Player = { id: Date.now() % 100000, name, progress: 0, socketId: socket.id };
          room.participants.push(player);
        } else {
          existing.socketId = socket.id;
        }
        rooms[roomId] = room;
        io.to(roomId).emit('room_state', { participants: room.participants });
        io.to(roomId).emit('player_joined', { name, socketId: socket.id });
      });

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
