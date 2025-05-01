//src\app\api\users\route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // PostgreSQL client
import { getCurrentUser } from '@/lib/current-user';
import { users } from '@/lib/schema';
import { branches } from '@/lib/schema';
import { eq, ne } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { authHelpers } from '@/lib/schema';
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
// export async function POST(req: Request) {
//   try {
//     const { name, email, password, branchId } = await req.json();

//     if (!name || !email || !password) {
//       return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
//     }

//     // Check for duplicate user
//     const exists = await db
//       .select()
//       .from(users)
//       .where(eq(users.email, email));

//     if (exists.length > 0) {
//       return NextResponse.json({ error: 'User already exists' }, { status: 409 });
//     }

//     // Hash the password
//     const saltRounds = 10;
//     const passwordHash = await bcrypt.hash(password, saltRounds);

//     // Insert user with hashed password
//     await db.insert(users).values({
//       name,
//       email,
//       password_hash: passwordHash,
//       role: 'user',
//       branch_id: branchId || null,
//     });

//     return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
//   } catch (error) {
//     console.error('Error inserting user:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// PATCH: Update current user's password
// export async function PATCH(req: Request) {
//   try {
//     const { oldPassword, newPassword } = await req.json();
    
//     if (!oldPassword || !newPassword) {
//       return NextResponse.json(
//         { error: 'Both old and new passwords are required' }, 
//         { status: 400 }
//       );
//     }

//     const currentUser = await getCurrentUser();
//     if (!currentUser) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Fetch the current user's password hash from DB
//     const user = await db
//       .select({ password_hash: users.password_hash })
//       .from(users)
//       .where(eq(users.id, currentUser.id))
//       .limit(1)
//       .execute();

//     if (!user.length) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     // Verify old password matches
//     const isPasswordValid = await bcrypt.compare(oldPassword, user[0].password_hash);
//     if (!isPasswordValid) {
//       return NextResponse.json(
//         { error: 'Old password is incorrect' },
//         { status: 403 }
//       );
//     }

//     // Hash the new password
//     const saltRounds = 10;
//     const passwordHash = await bcrypt.hash(newPassword, saltRounds);

//     await db
//       .update(users)
//       .set({ password_hash: passwordHash })
//       .where(eq(users.id, currentUser.id));

//     return NextResponse.json({ message: 'Password updated successfully' });
//   } catch (error) {
//     console.error('Error updating password:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' }, 
//       { status: 500 }
//     );
//   }
// }




// POST: Add a new user with password hashing
export async function POST(req: Request) {
  try {
    const { name, email, password, branchId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Validate password complexity
    const validation = authHelpers.validatePasswordComplexity(password);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // Check for duplicate user
    const exists = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (exists.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash the password before storing
    const passwordHash = await authHelpers.hashPassword(password);

    await db.insert(users).values({
      name,
      email,
      password_hash: passwordHash,
      role: 'user',
      branch_id: branchId || null,
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error inserting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update password with hashing and verification
// PATCH: Update password with hashing and verification
export async function PATCH(req: Request) {
  try {
    const { currentPassword, newPassword, confirmPassword } = await req.json();
    
    // Validate all required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All password fields are required' }, 
        { status: 400 }
      );
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match' },
        { status: 400 }
      );
    }

    // Validate new password complexity
    const validation = authHelpers.validatePasswordComplexity(newPassword);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current password hash
    const user = await db.query.users.findFirst({
      where: eq(users.id, currentUser.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await authHelpers.verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 403 }
      );
    }

    // Hash new password
    const newPasswordHash = await authHelpers.hashPassword(newPassword);

    await db
      .update(users)
      .set({ password_hash: newPasswordHash })
      .where(eq(users.id, currentUser.id));

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}