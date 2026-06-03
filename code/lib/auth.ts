import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { findUserByEmail } from './storage';

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret-change-me';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export function signSession(user: SessionUser) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: '7d' });
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, SECRET) as { sub: string; email: string; name?: string };
}

export function getSessionFromRequest(req: Request): SessionUser | null {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...vals] = c.trim().split('=');
      return [key.trim(), vals.join('=')];
    }),
  );
  const token = cookies['session'];
  if (!token) return null;
  try {
    const payload = verifySessionToken(token);
    return { id: payload.sub, email: payload.email, name: payload.name || payload.email };
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || !user.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, String(user.password));
  if (!isValid) {
    return null;
  }

  return {
    id: String(user.id),
    email: String(user.email),
    name: String(user.name || user.email),
  } as SessionUser;
}

