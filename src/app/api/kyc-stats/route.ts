//src\app\api\kyc-stats\route.ts

import { db } from '@/lib/db';
import { kycLogs } from '@/lib/schema';
import { and, gte, lte, sql } from 'drizzle-orm';
import { startOfToday, startOfMonth, addHours, addDays } from 'date-fns';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period');
  const now = new Date();

  try {
    if (period === 'today') {
        const start = startOfToday();
        const data = [];
      
        // Define the range for 10 AM to 6 PM
        const startOfDay = addHours(start, 10); // 10 AM
        const endOfDay = addHours(start, 18); // 6 PM
      
        // Loop over hours between 10 AM and 6 PM (inclusive)
        for (let i = 10; i <= 18; i++) {
          const hourStart = addHours(start, i);
          const hourEnd = addHours(start, i + 1);
          const count = await db
            .select({ count: sql`COUNT(*)` })
            .from(kycLogs)
            .where(and(gte(kycLogs.timestamp, hourStart), lte(kycLogs.timestamp, hourEnd)));
      
          data.push({ name: `${i}:00`, value: Number(count[0].count) });
        }
      
        return Response.json({ success: true, data });
      }

    if (period === 'month') {
      const start = startOfMonth(now);
      const data = [];

      for (let i = 0; i < 5; i++) {
        const weekStart = addDays(start, i * 7);
        const weekEnd = addDays(start, (i + 1) * 7);
        const count = await db
          .select({ count: sql`COUNT(*)` })
          .from(kycLogs)
          .where(and(gte(kycLogs.timestamp, weekStart), lte(kycLogs.timestamp, weekEnd)));

        data.push({ name: `Week ${i + 1}`, value: Number(count[0].count) });
      }

      return Response.json({ success: true, data });
    }

    return Response.json({ success: false, message: 'Invalid period' }, { status: 400 });

  } catch (error) {
    console.error('API error in /api/kyc-stats:', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
