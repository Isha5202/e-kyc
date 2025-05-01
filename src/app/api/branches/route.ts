// src/app/api/branches/route.ts
import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Query the branches table
    const result = await client.query(
      "SELECT * FROM branches WHERE is_active = $1",
      [true],
    );

    // Send the response with the fetched data
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { message: "Failed to fetch branches" },
      { status: 500 },
    );
  }
}
// Handle POST request to add a new branch
export async function POST(request: NextRequest) {
  try {
    const {
      branch_code,
      branch_name,
      address_line1,
      postal_code,
      contact_number,
      email,
      ifsc_code,
      is_active = true,
    } = await request.json();

    // Check if required fields are provided (now including ifsc_code)
    if (!branch_code || !branch_name || !address_line1 || !ifsc_code) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: branch_code, branch_name, address_line1, ifsc_code",
        },
        { status: 400 },
      );
    }

    // Check for existing branches with separate checks
    const existingChecks = [
      {
        query: "SELECT * FROM branches WHERE branch_code = $1 LIMIT 1",
        params: [branch_code],
        error: "branch code",
      },
      {
        query: "SELECT * FROM branches WHERE ifsc_code = $1 LIMIT 1",
        params: [ifsc_code],
        error: "IFSC code",
      },
      {
        query: "SELECT * FROM branches WHERE branch_name = $1 LIMIT 1",
        params: [branch_name],
        error: "branch name",
      },
      {
        query: "SELECT * FROM branches WHERE address_line1 = $1 LIMIT 1",
        params: [address_line1],
        error: "address",
      },
    ];

    for (const check of existingChecks) {
      const result = await client.query(check.query, check.params);
      if (result.rows.length > 0) {
        return NextResponse.json(
          {
            message: `Branch with this ${check.error} already exists`,
            conflictField: check.error,
            existingBranch: result.rows[0],
          },
          { status: 409 },
        );
      }
    }
    // Insert new branch
    const result = await client.query(
      `INSERT INTO branches 
        (branch_code, branch_name, address_line1, postal_code, contact_number, email, ifsc_code, is_active) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        branch_code,
        branch_name,
        address_line1,
        postal_code ?? null,
        contact_number ?? null,
        email ?? null,
        ifsc_code, // No longer needs null coalescing since it's required
        is_active,
      ],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error adding new branch:", error);
    return NextResponse.json(
      { message: "Failed to add new branch" },
      { status: 500 },
    );
  }
}
