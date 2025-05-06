// src/lib/kyc-stats.ts

import { db } from './db';
import { kycLogs } from './schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getCurrentUser } from './current-user';

export async function getTop3KycByCurrentUser() {
  const user = await getCurrentUser();
  if (!user) return [];

  const result = await db
    .select({
      kycType: kycLogs.kycType,
      count: sql<number>`COUNT(*)`.as('count')
    })
    .from(kycLogs)
    .where(eq(kycLogs.userId, user.id))
    .groupBy(kycLogs.kycType)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(3);

  return result;
}
