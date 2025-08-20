"use client";

import React, { useEffect, useState } from 'react';
import { fetchLogs } from '@/lib/adminApi';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchLogs();
        if (mounted) setLogs(data.logs || data || []);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Failed to fetch logs');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const filtered = logs.filter(l => {
    if (!query) return true;
    return JSON.stringify(l).toLowerCase().includes(query.toLowerCase());
  });

  if (loading) return <div>Loading logs...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      <div className="mb-4 flex gap-2">
        <input placeholder="Search logs" value={query} onChange={e => setQuery(e.target.value)} className="px-3 py-2 border rounded w-full" />
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Admin</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{new Date(l.timestamp || l.time || Date.now()).toLocaleString()}</td>
                <td className="px-3 py-2">{l.user || l.admin || l.userId}</td>
                <td className="px-3 py-2">{l.action}</td>
                <td className="px-3 py-2">{JSON.stringify(l.details || l.data || '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
