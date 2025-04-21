import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db'; // update if different
import { users } from '@/lib/schema'; // update if different
export async function GET(req: NextRequest, context: { params: { id: number } }) {
  try {
    const id = context.params.id;

    // Check if id is a valid number
    if (isNaN(id)) {
      return new Response(JSON.stringify({ message: 'Invalid ID' }), {
        status: 400,
      });
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    const user = result[0];

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
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
