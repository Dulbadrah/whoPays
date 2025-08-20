"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { validateAdminKey, getAdminKey } from '@/lib/adminApi';
import { AdminAuthContextType } from '@/app/types/type';


const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const key = getAdminKey();
      if (key) {
        const ok = await validateAdminKey(key);
        setAdminKey(key);
        setIsAuthenticated(ok);
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (key: string) => {
    setLoading(true);
    const ok = await validateAdminKey(key);
    if (ok) {
      try { localStorage.setItem('adminKey', key); } catch (e) {}
      setAdminKey(key);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return ok;
  };

  const logout = () => {
    try { localStorage.removeItem('adminKey'); } catch (e) {}
    setAdminKey(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ adminKey, isAuthenticated, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
