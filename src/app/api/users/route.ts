import { NextResponse } from 'next/server';
import db from '@/lib/db'; // PostgreSQL client

// GET: Return all non-admin users
export async function GET() {
  try {
    const result = await db.query(
      'SELECT id, name, email, role FROM users WHERE role != $1',
      ['admin']
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add a new user with default role 'user'
export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check for duplicate user
    const exists = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);

    if ((exists?.rowCount ?? 0) > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Insert user with role = 'user'
    await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      [name, email, password, 'user']
    );

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error inserting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update current user's password
import { getCurrentUser } from '@/lib/current-user';

export async function PATCH(req: Request) {
  try {
    const { newPassword } = await req.json();
    if (!newPassword) {
      return NextResponse.json({ error: 'Missing new password' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPassword, currentUser.id]
    );

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
