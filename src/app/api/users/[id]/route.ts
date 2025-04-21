import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db'; // update if different
import { users } from '@/lib/schema'; // update if different


// This function will handle GET requests for a dynamic route like `/api/users/[id]`

// This function will handle GET requests for a dynamic route like `/api/users/[id]`
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Convert the id to a number before passing it to the query
    const numericId = Number(id);

    // Ensure the ID is a valid number
    if (isNaN(numericId)) {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid ID' }),
        { status: 400 }
      );
    }

    // Query the PostgreSQL database to find the user by ID
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, numericId)); // Pass numericId to eq instead of the string id

    const user = result[0];

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      );
    }

    return new NextResponse(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = Number(params.id);
    const { name, email, password } = await req.json();

    const updates: {
      name?: string;
      email?: string;
      password_hash?: string; // Assuming this is the DB column
    } = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) {
      updates.password_hash = password; // store as-is, no hashing
    }

    await db.update(users).set(updates).where(eq(users.id, userId));

    return new Response(JSON.stringify({ message: "User updated successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
