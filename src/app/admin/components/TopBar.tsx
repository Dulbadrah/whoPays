import React from 'react';
import { useAdminAuth } from '@/context/adminAuth';

export default function TopBar() {
  const { isAuthenticated, adminKey, logout } = useAdminAuth();
  return (
    <header className="w-full bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="font-bold text-lg">Admin Panel</div>
      <div className="flex items-center gap-4">
        <input
          placeholder="Search rooms..."
          className="px-3 py-1 border rounded-md hidden md:block"
        />
        <div className="text-sm text-gray-600">{isAuthenticated ? 'Signed in' : 'Not signed'}</div>
        {!isAuthenticated ? (
          <a href="/admin/signup" className="text-sm text-blue-600 underline">Sign up</a>
        ) : (
          <button onClick={logout} className="text-sm text-red-600">Logout</button>
        )}
      </div>
    </header>
  );
}
