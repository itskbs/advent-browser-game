// Client-seitige Helfer für Login/Session. Antworten enthalten { username, isAdmin }.

export async function fetchMe() {
  const res = await fetch('/api/me');
  if (!res.ok) return null;
  return res.json();
}

export async function login(username, birthdate) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, birthdate }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Anmeldung fehlgeschlagen.');
  return data;
}

export async function logout() {
  await fetch('/api/logout', { method: 'POST' });
}
