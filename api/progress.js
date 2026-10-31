import { sql, ensureSchema } from './_db.js';
import { getSession } from './_auth.js';

const DEFAULT_PROGRESS = { solved: {}, eggs: {}, gift: false };

function normalize(progress) {
  return { ...DEFAULT_PROGRESS, ...(progress || {}) };
}

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) { res.status(401).json({ error: 'Nicht angemeldet.' }); return; }

  await ensureSchema();

  if (req.method === 'GET') {
    const rows = await sql`SELECT progress FROM users WHERE id = ${session.uid}`;
    res.status(200).json(normalize(rows[0]?.progress));
    return;
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const rows = await sql`SELECT progress FROM users WHERE id = ${session.uid}`;
    const data = normalize(rows[0]?.progress);

    let next = data;
    if (body.action === 'solve' && body.day) data.solved[body.day] = true;
    else if (body.action === 'egg' && body.id) data.eggs[body.id] = true;
    else if (body.action === 'gift') data.gift = true;
    else if (body.action === 'reset') next = { solved: {}, eggs: {}, gift: false };
    else { res.status(400).json({ error: 'Ungültige Aktion.' }); return; }

    await sql`UPDATE users SET progress = ${JSON.stringify(next)}::jsonb WHERE id = ${session.uid}`;
    res.status(200).json(next);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
