import { NextResponse } from 'next/server';
import { createJWT, setAuthCookie } from '@/lib/auth';
import pool from '@/lib/db';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { db } from '@/lib/db';
import { refreshTokens } from '@/lib/schema';

export async function POST(req: Request) {
  console.log('[POST /api/login] Login request received');

  const body = await req.json();
  const { email, password } = body;

  console.log('[POST /api/login] Parsed body:', body);

  try {
    const client = await pool.connect();
    console.log('[POST /api/login] DB client connected');

    const result = await client.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );
    console.log('[POST /api/login] User lookup result:', result.rows);

    client.release();

    const user = result.rows[0];

    if (!user || user.password_hash !== password) {
      console.warn('[POST /api/login] Invalid credentials');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    console.log('[POST /api/login] Authenticated user:', user);

    const accessToken = await createJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    console.log('[POST /api/login] Access token created:', accessToken);

    // Generate refresh token
    const refreshToken = randomUUID();
    const refreshExpires = add(new Date(), { days: 30 });

    console.log('[POST /api/login] Refresh token generated:', refreshToken);

    // Store refresh token in DB
    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpires,
    });
    console.log('[POST /api/login] Refresh token stored in DB');

    const response = NextResponse.json({
      success: true,
      role: user.role,
    });

    // Set access token cookie
    setAuthCookie(accessToken, response);
    console.log('[POST /api/login] Access token cookie set');

    // Set refresh token cookie
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    console.log('[POST /api/login] Refresh token cookie set');

    return response;
  } catch (error) {
    console.error('[POST /api/login] Error occurred:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
