import { clearSessionCookie } from './_auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  clearSessionCookie(req, res);
  res.status(200).json({});
}
