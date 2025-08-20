import React from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import { AdminAuthProvider } from '@/context/adminAuth';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 bg-gray-50">{children}</main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}
