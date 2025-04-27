import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { branches } from "@/lib/schema"; // Assuming branches table is imported

// GET branch by ID
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());

    const branch = await db.query.branches.findFirst({
      where: eq(branches.id, id),
    });

    if (!branch) {
      return new Response(JSON.stringify({ message: "Branch not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(branch), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

// PUT update branch by ID
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());

    const { branch_name, branch_code, contact_number, email, ifsc_code } = await req.json();

    const updates: {
      branch_name?: string;
      branch_code?: string;
      contact_number?: string;
      email?: string;
      ifsc_code?: string;
    } = {};

    if (branch_name) updates.branch_name = branch_name;
    if (branch_code) updates.branch_code = branch_code;
    if (contact_number) updates.contact_number = contact_number;
    if (email) updates.email = email;
    if (ifsc_code) updates.ifsc_code = ifsc_code;

    await db.update(branches).set(updates).where(eq(branches.id, id));

    return new Response(JSON.stringify({ message: "Branch updated successfully" }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

// DELETE branch by ID
export async function DELETE(req: NextRequest) {
    try {
      const url = new URL(req.url);
      const id = Number(url.pathname.split("/").pop());
  
      // Attempt to delete the branch from the database
      const result = await db.delete(branches).where(eq(branches.id, id));
  
      // Check if result is an object that has a property like `affectedRows` or `count`
      if (result && typeof result === 'object' && 'affectedRows' in result) {
        if (result.affectedRows === 0) {
          return new Response(JSON.stringify({ message: "Branch not found or could not be deleted" }), { status: 404 });
        }
      } else {
        return new Response(JSON.stringify({ message: "Unexpected result format" }), { status: 500 });
      }
  
      return new Response(JSON.stringify({ message: "Branch deleted successfully" }), { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    }
  }
  