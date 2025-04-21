import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

// GET user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {

const {id} = params;

console.log("id",id);

}




// PUT update user by ID
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const id = Number(context.params.id);
    const { name, email, password } = await req.json();

    const updates: {
      name?: string;
      email?: string;
      password_hash?: string;
    } = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password_hash = password;

    await db.update(users).set(updates).where(eq(users.id, id));

    return new Response(JSON.stringify({ message: "User updated successfully" }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
