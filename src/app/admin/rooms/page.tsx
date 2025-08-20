"use client";

import React, { useEffect, useState } from 'react';
import { fetchRooms, deleteRoom } from '@/lib/adminApi';
import ConfirmModal from '../components/ConfirmModal';

export default function RoomsListPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchRooms();
        if (mounted) setRooms(data.rooms || data);
      } catch (e: any) {
        console.error(e);
  setError(e?.statusText || e?.message || 'Failed to fetch');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const handleDelete = async (code: string) => {
    setConfirmTarget(code);
  };

  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const doConfirmDelete = async () => {
    if (!confirmTarget) return;
    try {
      await deleteRoom(confirmTarget);
      setRooms(prev => prev.filter(r => r.code !== confirmTarget));
      setConfirmTarget(null);
      alert('Deleted');
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  if (loading) return <div>Loading rooms...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rooms</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow p-2">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Game</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Participants</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.code} className="border-t">
                <td className="px-3 py-2 font-mono">{room.code}</td>
                <td className="px-3 py-2">{room.roomname || room.roomName}</td>
                <td className="px-3 py-2">{room.gameType}</td>
                <td className="px-3 py-2">{room.gamestatus}</td>
                <td className="px-3 py-2">{(room.participants || []).length}</td>
                <td className="px-3 py-2">{new Date(room.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <a className="text-blue-600 mr-3" href={`/admin/rooms/${room.code}`}>View</a>
                  <button className="text-red-600" onClick={() => handleDelete(room.code)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirmTarget && (
        <ConfirmModal
          title="Delete Room"
          confirmText={confirmTarget}
          onConfirm={doConfirmDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}
