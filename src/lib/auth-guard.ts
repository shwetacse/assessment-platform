import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: 'ADMIN' | 'STUDENT';
};

export async function getAuthUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getAuthUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return user;
}

export async function requireStudent(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'STUDENT') throw new Error('FORBIDDEN');
  return user;
}
