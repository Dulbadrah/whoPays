"use client";

import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '@/lib/adminApi';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getSettings();
        if (mounted) setSettings(data || {});
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Failed to load settings');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false };
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      alert('Saved');
    } catch (e) {
      console.error(e);
      alert('Save failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div>Loading settings...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>

      <div className="bg-white rounded shadow p-4">
        <label className="block mb-2">
          <div className="text-sm font-medium text-gray-700">Require admin key</div>
          <select value={settings.requireAdminKey ? 'yes' : 'no'} onChange={e => setSettings({...settings, requireAdminKey: e.target.value === 'yes'})} className="mt-1 px-3 py-2 border rounded">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>

        <label className="block mb-2">
          <div className="text-sm font-medium text-gray-700">Rate limit (requests/min)</div>
          <input type="number" value={settings.rateLimit || 0} onChange={e => setSettings({...settings, rateLimit: Number(e.target.value)})} className="mt-1 px-3 py-2 border rounded w-40" />
        </label>

        <div className="mt-4">
          <button disabled={saving} onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
