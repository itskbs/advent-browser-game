import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'session';
const MAX_AGE_SECONDS = 180 * 24 * 60 * 60; // ~180 Tage

function sign(payloadB64) {
  return createHmac('sha256', process.env.SESSION_SECRET).update(payloadB64).digest('hex');
}

export function createSessionCookieValue({ uid, username }) {
  const payload = { uid, username, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

function verifySessionValue(value) {
  if (!value || typeof value !== 'string') return null;
  const [payloadB64, sig] = value.split('.');
  if (!payloadB64 || !sig) return null;
  try {
    const expected = Buffer.from(sign(payloadB64));
    const actual = Buffer.from(sig);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.uid || !payload.username || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  if (req.cookies) return req.cookies;
  const header = req.headers?.cookie || '';
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function getSession(req) {
  const cookies = parseCookies(req);
  return verifySessionValue(cookies[COOKIE_NAME]);
}

function isHttps(req) {
  return (req.headers?.['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

export function setSessionCookie(req, res, { uid, username }) {
  const value = createSessionCookieValue({ uid, username });
  const secure = isHttps(req) ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure}`);
}

export function clearSessionCookie(req, res) {
  const secure = isHttps(req) ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

export function isAdminUsername(username) {
  const admins = (process.env.ADMIN_USERNAMES || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return admins.includes((username || '').trim().toLowerCase());
}
