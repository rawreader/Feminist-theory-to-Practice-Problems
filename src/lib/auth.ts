import crypto from 'node:crypto';
import type { AstroCookies } from 'astro';

const COOKIE = 'ftp_session';
const SALT = 'feminist-theory-into-practice-v1';

function expectedToken(): string {
  const pw = process.env.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD || '';
  return crypto.createHash('sha256').update(SALT + pw).digest('hex');
}

export function checkPassword(pw: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD || '';
  return expected.length > 0 && pw === expected;
}

export function setSession(cookies: AstroCookies): void {
  cookies.set(COOKIE, expectedToken(), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSession(cookies: AstroCookies): void {
  cookies.delete(COOKIE, { path: '/' });
}

export function isAuthed(cookies: AstroCookies): boolean {
  return cookies.get(COOKIE)?.value === expectedToken();
}
