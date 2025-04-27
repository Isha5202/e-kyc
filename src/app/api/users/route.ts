import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // PostgreSQL client
import { getCurrentUser } from '@/lib/current-user';
import { users } from '@/lib/schema';
import { branches } from '@/lib/schema';
import { eq, ne } from 'drizzle-orm';

// GET: Return all non-admin users with branch name (nullable)
export async function GET() {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branchName: branches.branch_name,
      })
      .from(users)
      .leftJoin(branches, eq(users.branch_id, branches.id))
      .where(ne(users.role, 'admin'));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add a new user with default role 'user' and optional branchId
export async function POST(req: Request) {
  try {
    const { name, email, password, branchId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check for duplicate user
    const exists = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (exists.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Insert user (use password directly)
    await db.insert(users).values({
      name,
      email,
      password_hash: password, // inserting into password_hash field
      role: 'user',
      branch_id: branchId || null, // nullable
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error inserting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update current user's password
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

    await db
      .update(users)
      .set({ password_hash: newPassword })
      .where(eq(users.id, currentUser.id));

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
