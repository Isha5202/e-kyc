// src/app/api/overview/route.ts
import { db } from "@/lib/db";
import { users, branches, kycLogs } from "@/lib/schema";
import { sql } from "drizzle-orm"; // 💥 import sql
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get counts
    const totalUsersPromise = db
  .select({ count: sql<number>`count(*)` })
  .from(users)
  .where(sql`deleted_at IS NULL`); // Assuming soft deletion is implemented
    const totalBranchesPromise = db.select({ count: sql<number>`count(*)` }).from(branches);
    const totalKycPromise = db.select({ count: sql<number>`count(*)` }).from(kycLogs);

    // Parallel execution
    const [totalUsers, totalBranches, totalKyc] = await Promise.all([
      totalUsersPromise,
      totalBranchesPromise,
      totalKycPromise,
    ]);

    return NextResponse.json({
      users: totalUsers[0]?.count || 0,
      branches: totalBranches[0]?.count || 0,
      kyc: totalKyc[0]?.count || 0,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
