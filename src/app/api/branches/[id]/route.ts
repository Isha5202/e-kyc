import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { branches, users } from "@/lib/schema";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());

    const branch = await db.query.branches.findFirst({
      where: eq(branches.id, id),
    });

    if (!branch) {
      return new Response(JSON.stringify({ message: "Branch not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(branch), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ 
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());
    const body = await req.json();

    const updates: Partial<typeof branches.$inferInsert> = {};
    
    // Only update fields that are provided
    if (body.branch_name !== undefined) updates.branch_name = body.branch_name;
    if (body.branch_code !== undefined) updates.branch_code = body.branch_code;
    if (body.contact_number !== undefined) updates.contact_number = body.contact_number;
    if (body.email !== undefined) updates.email = body.email;
    if (body.ifsc_code !== undefined) updates.ifsc_code = body.ifsc_code;

    const result = await db.update(branches)
      .set(updates)
      .where(eq(branches.id, id));

    return new Response(JSON.stringify({ message: "Branch updated successfully" }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ 
      message: "Failed to update branch",
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());

    // First check if branch exists
    const branch = await db.query.branches.findFirst({
      where: eq(branches.id, id),
    });

    if (!branch) {
      return new Response(JSON.stringify({ message: "Branch not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for associated users
    const usersInBranch = await db.query.users.findMany({
      where: eq(users.branch_id, id),
    });

    if (usersInBranch.length > 0) {
      return new Response(JSON.stringify({ 
        message: "Cannot delete branch with associated users",
        userCount: usersInBranch.length
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Perform deletion - Drizzle delete returns a query result without row count
    await db.delete(branches)
      .where(eq(branches.id, id));

    return new Response(JSON.stringify({ 
      message: "Branch deleted successfully",
      deletedId: id
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ 
      message: "Failed to delete branch",
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}