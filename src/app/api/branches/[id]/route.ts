import { NextRequest } from "next/server";
import { and, eq, ne } from "drizzle-orm";
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

    // First get the existing branch to compare updates
    const existingBranch = await db.query.branches.findFirst({
      where: eq(branches.id, id),
    });

    if (!existingBranch) {
      return new Response(JSON.stringify({ message: "Branch not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updates: Partial<typeof branches.$inferInsert> = {};
    
    // Only update fields that are provided and changed
    if (body.branch_name !== undefined && body.branch_name !== existingBranch.branch_name) {
      updates.branch_name = body.branch_name;
    }
    if (body.branch_code !== undefined && body.branch_code !== existingBranch.branch_code) {
      updates.branch_code = body.branch_code;
    }
    if (body.contact_number !== undefined && body.contact_number !== existingBranch.contact_number) {
      updates.contact_number = body.contact_number;
    }
    if (body.email !== undefined && body.email !== existingBranch.email) {
      updates.email = body.email;
    }
    if (body.ifsc_code !== undefined && body.ifsc_code !== existingBranch.ifsc_code) {
      updates.ifsc_code = body.ifsc_code;
    }
    if (body.address_line1 !== undefined && body.address_line1 !== existingBranch.address_line1) {
      updates.address_line1 = body.address_line1;
    }

    // If no actual updates needed
    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ message: "No changes detected" }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for duplicates only for fields that are being updated
    if (updates.branch_code !== undefined) {
      const existing = await db.query.branches.findFirst({
        where: and(
          eq(branches.branch_code, updates.branch_code),
          ne(branches.id, id)
        ),
      });
      if (existing) {
        return new Response(JSON.stringify({ 
          message: "Another branch with this branch code already exists",
          conflictField: 'branch_code',
          existingBranch: existing
        }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (typeof updates.ifsc_code === 'string') {
      const existing = await db.query.branches.findFirst({
        where: and(
          eq(branches.ifsc_code, updates.ifsc_code),
          ne(branches.id, id)
        ),
      });
    
      if (existing) {
        return new Response(JSON.stringify({ 
          message: "Another branch with this IFSC code already exists",
          conflictField: 'ifsc_code',
          existingBranch: existing
        }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (updates.branch_name !== undefined) {
      const existing = await db.query.branches.findFirst({
        where: and(
          eq(branches.branch_name, updates.branch_name),
          ne(branches.id, id)
        ),
      });
      if (existing) {
        return new Response(JSON.stringify({ 
          message: "Another branch with this name already exists",
          conflictField: 'branch_name',
          existingBranch: existing
        }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (updates.address_line1 !== undefined) {
      const existing = await db.query.branches.findFirst({
        where: and(
          eq(branches.address_line1, updates.address_line1),
          ne(branches.id, id)
        ),
      });
      if (existing) {
        return new Response(JSON.stringify({ 
          message: "Another branch with this address already exists",
          conflictField: 'address_line1',
          existingBranch: existing
        }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Perform the update
    await db.update(branches)
      .set(updates)
      .where(eq(branches.id, id));

    return new Response(JSON.stringify({ 
      message: "Branch updated successfully",
      updatedFields: Object.keys(updates)
    }), { 
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