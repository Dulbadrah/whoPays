"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/adminAuth';

export default function AdminLoginPage() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { login, isAuthenticated, loading: authLoading } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading) router.push('/admin');
  }, [isAuthenticated, authLoading, router]);

  const tryValidate = async (candidate: string) => {
    // Try x-admin-key header first, then Authorization Bearer
    try {
      let res = await fetch('/admin/rooms', { headers: { 'x-admin-key': candidate } });
      if (res.ok) return true;
      res = await fetch('/admin/rooms', { headers: { Authorization: `Bearer ${candidate}` } });
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please enter your admin key');
      return;
    }

  setLoading(true);
  const ok = await login(trimmed);
  setLoading(false);
  if (!ok) setError('Invalid admin key or unauthorized');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sky-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Admin key or token</span>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter admin key or token"
              className="px-3 py-2 border rounded"
              aria-label="Admin key"
            />
          </label>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center gap-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60" disabled={loading}>
              {loading ? 'Checking...' : 'Sign in'}
            </button>
            <button type="button" className="text-sm text-gray-600" onClick={() => router.push('/')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
