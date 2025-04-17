import { NextResponse } from 'next/server';
import { createJWT, setAuthCookie } from '@/lib/auth';
import pool from '@/lib/db'; // Your pg pool

export async function POST(req: Request) {
  console.log('[POST /api/login] Login request received');
  const body = await req.json();
  console.log('[POST /api/login] Parsed body:', body);

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
      console.warn('[POST /api/login] Invalid credentials');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    console.log('[POST /api/login] User found:', user);

    const token = await createJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    console.log('[POST /api/login] JWT created:', token);

    // Create a response and set cookie directly on it
    const response = NextResponse.json({
      success: true,
      role: user.role, // ⬅️ Return role for client redirect
    });

    setAuthCookie(token, response); // ⬅️ This mutates the response
    console.log('[POST /api/login] Auth cookie set');

    return response;
  } catch (error) {
    console.error('[POST /api/login] Error during login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
