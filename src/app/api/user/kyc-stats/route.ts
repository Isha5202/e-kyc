import { db } from '@/lib/db';
import { kycLogs } from '@/lib/schema';
import { and, gte, lte, sql } from 'drizzle-orm';
import { startOfToday, startOfMonth, addHours, addDays } from 'date-fns';
import { getCurrentUser } from '@/lib/current-user';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period');
  const now = new Date();

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (period === 'today') {
      const start = startOfToday();
      const data = [];

      for (let i = 10; i <= 18; i++) {
        const hourStart = addHours(start, i);
        const hourEnd = addHours(start, i + 1);

        const count = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(kycLogs)
          .where(
            and(
              gte(kycLogs.timestamp, hourStart),
              lte(kycLogs.timestamp, hourEnd),
              sql`${kycLogs.userId} = ${user.id}`
            )
          );

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
          .select({ count: sql<number>`COUNT(*)` })
          .from(kycLogs)
          .where(
            and(
              gte(kycLogs.timestamp, weekStart),
              lte(kycLogs.timestamp, weekEnd),
              sql`${kycLogs.userId} = ${user.id}`
            )
          );

        data.push({ name: `Week ${i + 1}`, value: Number(count[0].count) });
      }

      return Response.json({ success: true, data });
    }

    return Response.json({ success: false, message: 'Invalid period' }, { status: 400 });
  } catch (error) {
    console.error('[USER_KYC_STATS_ERROR]', error);
    return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
