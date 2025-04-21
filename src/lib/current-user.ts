// src/lib/current-user.ts
import { getTokenFromCookies, verifyJWT } from './auth';
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUser() {
  const token = await getTokenFromCookies();
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload || !payload.id) return null;

  const userId = parseInt(payload.id); // convert id from string to number
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user[0] || null;
}
