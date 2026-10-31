import { getSession, isAdminUsername } from './_auth.js';

export default function handler(req, res) {
  const session = getSession(req);
  if (!session) { res.status(401).json({}); return; }
  res.status(200).json({ username: session.username, isAdmin: isAdminUsername(session.username) });
}
