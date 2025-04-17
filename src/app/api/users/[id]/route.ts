import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(params.id)),
    });

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
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
