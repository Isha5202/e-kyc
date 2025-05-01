// src/app/api/overview/route.ts
import { db } from "@/lib/db";
import { users, branches, kycLogs } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get counts with explicit type casting
    const [usersResult, branchesResult, kycResult] = await Promise.all([
      db.execute(sql<{ count: number }>`
        SELECT CAST(COUNT(*) AS INTEGER) as count 
        FROM ${users} 
        WHERE role = 'user'
      `),
      db.execute(sql<{ count: number }>`
        SELECT CAST(COUNT(*) AS INTEGER) as count 
        FROM ${branches}
      `),
      db.execute(sql<{ count: number }>`
        SELECT CAST(COUNT(*) AS INTEGER) as count 
        FROM ${kycLogs}
      `)
    ]);

    return NextResponse.json({
      users: usersResult.rows[0]?.count ?? 0,
      branches: branchesResult.rows[0]?.count ?? 0,
      kyc: kycResult.rows[0]?.count ?? 0,
    });
  } catch (error) {
    console.error("Error in overview endpoint:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" 
          ? error instanceof Error ? error.message : String(error)
          : undefined
      },
      { status: 500 }
    );
  }
}