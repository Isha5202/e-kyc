import { NextResponse } from 'next/server';
import { createJWT, setAuthCookie } from '@/lib/auth';
import pool from '@/lib/db';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { db } from '@/lib/db';
import { refreshTokens } from '@/lib/schema'; // You must define this schema like we discussed

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );
    client.release();

    const user = result.rows[0];

    if (!user || user.password_hash !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const accessToken = await createJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Generate refresh token
    const refreshToken = randomUUID();
    const refreshExpires = add(new Date(), { days: 30 });

    // Store refresh token in DB
    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpires,
    });

    const response = NextResponse.json({
      success: true,
      role: user.role,
    });

    // Set access token
    setAuthCookie(accessToken, response);

    // Set refresh token in cookie
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
