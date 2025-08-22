export const getAdminKey = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminKey');
};

const withAuth = (opts: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const key = getAdminKey();
  if (key) headers['x-admin-key'] = key;
  return { ...opts, headers };
};

export async function fetchRooms(params: Record<string, string | number | undefined> = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  });
  const res = await fetch(`/admin/rooms?${qs.toString()}`, withAuth());
  if (!res.ok) throw res;
  return res.json();
}

export async function deleteRoom(roomCode: string) {
  const res = await fetch(`/admin/rooms/${encodeURIComponent(roomCode)}`, {
    method: 'DELETE',
    ...withAuth(),
  });
  if (!res.ok) throw res;
  return res.json();
}

export async function promoteParticipant(roomCode: string, participantId: number) {
  const res = await fetch(
    `/admin/rooms/${encodeURIComponent(roomCode)}/promote/${participantId}`,
    { method: 'POST', ...withAuth() }
  );
  if (!res.ok) throw res;
  return res.json();
}

export async function removeParticipant(roomCode: string, participantId: number) {
  const res = await fetch(
    `/admin/rooms/${encodeURIComponent(roomCode)}/remove/${participantId}`,
    { method: 'POST', ...withAuth() }
  );
  if (!res.ok) throw res;
  return res.json();
}

export async function fetchLogs(params: Record<string, string | number | undefined> = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  });
  const res = await fetch(`/admin/logs?${qs.toString()}`, withAuth());
  if (!res.ok) throw res;
  return res.json();
}

export async function getSettings() {
  const res = await fetch(`/admin/settings`, withAuth());
  if (!res.ok) throw res;
  return res.json();
}

export async function updateSettings(payload: string) {
  const res = await fetch(`/admin/settings`, { method: 'POST', body: JSON.stringify(payload), ...withAuth() });
  if (!res.ok) throw res;
  return res.json();
}

export async function registerAdmin(payload: { name: string; password?: string }) {
  const res = await fetch(`/admin/signup`, { method: 'POST', body: JSON.stringify(payload), ...withAuth() });
  if (!res.ok) throw res;
  return res.json();
}

export async function validateAdminKey(candidate: string) {
  try {
    let res = await fetch('/admin/me', { headers: { 'x-admin-key': candidate } });
    if (res.ok) return true;

    res = await fetch('/admin/me', { headers: { Authorization: `Bearer ${candidate}` } });
    return res.ok;
  } catch {
    return false;
  }
}


