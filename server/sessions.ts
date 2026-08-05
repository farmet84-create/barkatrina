import crypto from 'crypto';

interface Session {
  idUsuario: number;
  idEmpleado: number | null;
  createdAt: number;
}

const sessions = new Map<string, Session>();

export function createSession(idUsuario: number, idEmpleado: number | null): string {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { idUsuario, idEmpleado, createdAt: Date.now() });
  return token;
}

export function getSession(token: string | undefined | null): Session | null {
  if (!token) return null;
  return sessions.get(token) || null;
}

export function destroySession(token: string) {
  sessions.delete(token);
}
