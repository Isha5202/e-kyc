import { getTokenFromCookies, verifyJWT } from './auth';
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUser() {
  // Get the token from cookies
  const token = await getTokenFromCookies();
  if (!token) return null;

  // Verify the token and get the payload
  const payload = await verifyJWT(token);
  if (!payload || !payload.id) return null;

  // Convert the id to a number if it's a string
  const userId = typeof payload.id === 'string' ? parseInt(payload.id) : payload.id;

  // Query the database for the user by id
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId)) // Ensure userId is in the correct format
    .limit(1);

  return user[0] || null;
}
