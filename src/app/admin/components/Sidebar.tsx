import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-4 hidden sm:block">
      <nav className="flex flex-col gap-2">
        <Link href="/admin" className="font-medium">Rooms</Link>
        <Link href="/admin/logs" className="text-sm text-gray-600">Logs</Link>
        <Link href="/admin/settings" className="text-sm text-gray-600">Settings</Link>
      </nav>
    </aside>
  );
}
