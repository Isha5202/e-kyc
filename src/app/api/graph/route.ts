import { db } from "@/lib/db"; // your drizzle db instance
import { kycLogs } from "@/lib/schema"; // assuming you have a schema for KYC logs
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm"; // for custom SQL queries

// Define the type for the weekly KYC data
interface KycWeekData {
  week: number;
  count: number;
}

export async function GET(request: Request) {
  try {
    // Get query parameters to determine the date type (today or monthly)
    const url = new URL(request.url);
    const view = url.searchParams.get("view"); // 'today' or 'monthly'

    // Get the current date in the format YYYY-MM-DD and the current month in YYYY-MM format
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    let kycCount = 0;
    let kycCountsByWeek: KycWeekData[] = []; // Explicitly type as KycWeekData[]

    if (view === "today") {
      // Get today's KYC count
      const totalKycToday = await db
        .select({ count: sql`COUNT("id")` })  // Using raw SQL to count
        .from(kycLogs)
        .where(sql`DATE("timestamp") = ${currentDate}`); // Assuming 'timestamp' is your column name

      // Extract the count value, make sure it's a number
      kycCount = totalKycToday.length > 0 ? Number(totalKycToday[0]?.count) : 0;
    }else if (view === "monthly") {
      // Group by week for monthly view using the corrected query
      const totalKycMonth = await db
        .select({
          week: sql`EXTRACT(WEEK FROM "timestamp")`, // Extract the week number from the timestamp
          count: sql`COUNT("id")`  // Count the entries per week
        })
        .from(kycLogs)
        .where(sql`TO_CHAR("timestamp", 'YYYY-MM') LIKE ${currentMonth}%`) // Filter records by the current month
        .groupBy(sql`EXTRACT(WEEK FROM "timestamp")`)  // Group results by week
        .orderBy(sql`EXTRACT(WEEK FROM "timestamp")`);  // Order the results by week number
    
      // Map the result to return week-wise KYC counts
      kycCountsByWeek = totalKycMonth.map((entry) => ({
        week: Number(entry.week),  // Convert the week to a number
        count: Number(entry.count), // Ensure the count is a number
      }));
    }
    else {
      // If an invalid view is provided, return a bad request response
      return new NextResponse("Invalid view parameter. Use 'today' or 'monthly'.", { status: 400 });
    }

    // Return the result as a JSON response
    if (view === "today") {
      return NextResponse.json({ kycCount });
    } else {
      return NextResponse.json({ kycCountsByWeek });
    }
  } catch (error) {
    // Log the error and return a 500 Internal Server Error response
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
