//src\app\api\users\[id]\route.ts

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, branches } from "@/lib/schema"; // Assuming branches table is imported
import { authHelpers } from '@/lib/schema';
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
// export async function PUT(req: NextRequest) {
//   try {
//     const url = new URL(req.url);
//     const id = Number(url.pathname.split("/").pop());

//     const { name, email, password, branchId } = await req.json();

//     const updates: {
//       name?: string;
//       email?: string;
//       password_hash?: string;
//       branch_id?: number; // Include branchId if provided
//     } = {};

//     if (name) updates.name = name;
//     if (email) updates.email = email;
//     if (password) updates.password_hash = password;
//     if (branchId) updates.branch_id = branchId; // Update branchId if provided

//     console.log(updates);
//     await db.update(users).set(updates).where(eq(users.id, id));

//     return new Response(JSON.stringify({ message: "User updated successfully" }), { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
//   }
// }
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());
    const { name, email, password, branchId } = await req.json();

    // First get the current user data
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!currentUser) {
      return new Response(
        JSON.stringify({ message: "User not found" }), 
        { status: 404 }
      );
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== currentUser.email) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "User with this email already exists" }), 
          { status: 409 }
        );
      }
    }

    const updates: {
      name?: string;
      email?: string;
      password_hash?: string;
      branch_id?: number;
    } = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) {
      // Validate password complexity
      const validation = authHelpers.validatePasswordComplexity(password);
      if (!validation.valid) {
        return new Response(
          JSON.stringify({ error: validation.message }), 
          { status: 400 }
        );
      }
      // Hash new password before storing
      updates.password_hash = await authHelpers.hashPassword(password);
    }
    if (branchId) updates.branch_id = branchId;

    await db.update(users).set(updates).where(eq(users.id, id));

    return new Response(
      JSON.stringify({ message: "User updated successfully" }), 
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }), 
      { status: 500 }
    );
  }
}
// DELETE user by ID
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());

    // First verify the user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Perform deletion - Drizzle delete doesn't return row count
    await db.delete(users)
      .where(eq(users.id, id));

    return new Response(JSON.stringify({ 
      message: "User deleted successfully",
      deletedId: id
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ 
      message: "Failed to delete user",
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
