"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerAdmin } from '@/lib/adminApi';

export default function AdminSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await registerAdmin({ name: name.trim(), password });
      // after successful signup, redirect to login
      router.push('/admin/login');
    } catch (e) {
      console.error(e);
      alert('Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sky-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-4">Admin Sign up</h1>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Admin name" className="px-3 py-2 border rounded" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (optional)" className="px-3 py-2 border rounded" />
          <div className="flex items-center gap-3">
            <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
            <button type="button" className="text-sm text-gray-600" onClick={() => router.push('/admin/login')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
