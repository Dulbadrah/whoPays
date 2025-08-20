"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { promoteParticipant, removeParticipant, fetchRooms } from '@/lib/adminApi';

export default function RoomDetailPage({ params }: { params: { code: string } }) {
  const { code } = params;
  const [room, setRoom] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchRooms({ code });
        const r = Array.isArray(data) ? data.find((x: any) => x.code === code) : data.room || data;
        if (mounted) setRoom(r);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [code]);

  const handlePromote = async (participantId: number) => {
    try {
      await promoteParticipant(code, participantId);
      setRoom((prev: any) => ({ ...prev, participants: prev.participants.map((p: any) => ({ ...p, isHost: p.id === participantId })) }));
      alert('Promoted');
    } catch (e) {
      console.error(e);
      alert('Promote failed');
    }
  };

  const handleRemove = async (participantId: number) => {
    if (!confirm('Remove participant?')) return;
    try {
      await removeParticipant(code, participantId);
      setRoom((prev: any) => ({ ...prev, participants: prev.participants.filter((p: any) => p.id !== participantId) }));
      alert('Removed');
    } catch (e) {
      console.error(e);
      alert('Remove failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!room) return <div className="text-red-600">Room not found</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{room.roomname || room.roomName}</h2>
          <div className="text-sm text-gray-600">Code: <span className="font-mono">{room.code}</span></div>
        </div>
        <div>
          <button className="bg-red-600 text-white px-3 py-2 rounded" onClick={() => alert('Delete flow - implement confirm')}>Delete Room</button>
        </div>
      </div>

      <h3 className="font-bold mb-2">Participants</h3>
      <div className="space-y-2">
        {room.participants?.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div>
              <div className="font-medium">{p.name}</div>
              {p.isHost && <div className="text-xs text-yellow-800">Host</div>}
            </div>
            <div className="flex items-center gap-2">
              <button disabled={p.isHost} onClick={() => handlePromote(p.id)} className="text-sm text-blue-600">Promote</button>
              <button disabled={p.isHost} onClick={() => handleRemove(p.id)} className="text-sm text-red-600">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
