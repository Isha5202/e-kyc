import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, branches } from "@/lib/schema"; // Assuming branches table is imported

// GET user by ID with branch name and IFSC code
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());

    // Fetch user data along with branch details
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        branch: true, // Fetch related branch data
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    // Check if branch data is available and add branchName and ifscCode to response
    const branchDetails = user.branch
      ? { branchName: user.branch.branch_name, ifscCode: user.branch.ifsc_code }
      : { branchName: null, ifscCode: null };

    return new Response(
      JSON.stringify({
        ...user,
        ...branchDetails, // Include branch details in response
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

// PUT update user by ID with branchId handling
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());

    const { name, email, password, branchId } = await req.json();

    const updates: {
      name?: string;
      email?: string;
      password_hash?: string;
      branch_id?: number; // Include branchId if provided
    } = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password_hash = password;
    if (branchId) updates.branch_id = branchId; // Update branchId if provided

    console.log(updates);
    await db.update(users).set(updates).where(eq(users.id, id));

    return new Response(JSON.stringify({ message: "User updated successfully" }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

// DELETE user by ID
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());

    // Attempt to delete the user from the database
    const result = await db.delete(users).where(eq(users.id, id));

// Check if result is an object that has a property like `affectedRows` or `count`
if (result && typeof result === 'object' && 'affectedRows' in result) {
  if (result.affectedRows === 0) {
    return new Response(JSON.stringify({ message: "User not found or could not be deleted" }), { status: 404 });
  }
} else {
  return new Response(JSON.stringify({ message: "Unexpected result format" }), { status: 500 });
}

return new Response(JSON.stringify({ message: "User deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
