import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyJWT } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm'; // ✅ Import eq helper

export async function GET() {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload || typeof payload.id !== 'number') {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const user = await db.select().from(users).where(eq(users.id, payload.id)).limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { name, email, role } = user[0];

    return NextResponse.json({ name, email, role });

  } catch (err) {
    // console.error('[API /me] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
