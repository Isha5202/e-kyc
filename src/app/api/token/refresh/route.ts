import { NextResponse } from 'next/server';
import { createJWT } from '@/lib/auth';
import { db } from '@/lib/db';
import { refreshTokens, users } from '@/lib/schema';
import { eq, and, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  const refreshToken = (await cookieStore).get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token found' }, { status: 401 });
  }

  // Find refresh token in DB and check it's not expired
  const tokenRecord = await db.query.refreshTokens.findFirst({
    where: and(
      eq(refreshTokens.token, refreshToken),
      gt(refreshTokens.expiresAt, new Date())
    ),
  });

  if (!tokenRecord) {
    return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 403 });
  }

  // Find user
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, tokenRecord.userId),
  });

  if (!userRecord) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Create new access token
  const newAccessToken = await createJWT({
    id: userRecord.id,
    email: userRecord.email,
    role: userRecord.role!,
  });

  const response = NextResponse.json({ success: true });

  // Set new access token in cookie
  response.cookies.set('token', newAccessToken, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
