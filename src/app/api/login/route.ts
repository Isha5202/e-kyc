import { NextResponse } from 'next/server';
import { createJWT, setAuthCookie } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const origin = req.headers.get("origin");

  const body = await req.json();
  const { email, password } = body;
  try {
    // Query users table to find the user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .execute();

    // Check for valid user and password match
    if (!user.length || user[0].password_hash !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const authenticatedUser = user[0];
    // Create the access token for the user
    const accessToken = await createJWT({
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      role: authenticatedUser.role ?? 'user',
    });

    console.log('[POST /api/login] Access token generated:', accessToken);

    // Set the access token in cookies using setAuthCookie
    await setAuthCookie(accessToken); // This already sets the accessToken cookie

    const response = NextResponse.json({ 
      success: true,
      role: authenticatedUser.role,
    });
    
    response.headers.set('Set-Cookie', 
      `token=${accessToken}; Path=/; HttpOnly; SameSite=Lax`
    );

    response.headers.set("Access-Control-Allow-Origin", origin || "http://65.20.72.49");
    response.headers.set("Access-Control-Allow-Credentials", "true");

    return response;
  } catch (error) {
    console.error('[POST /api/login] Error occurred:', error);
    return NextResponse.json({ error: 'Something went wrong: ' + error }, { status: 500 });
  }
}
