import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycLogs, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const logs = await db
      .select({
        logId: kycLogs.id,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        kycType: kycLogs.kycType,
        status: kycLogs.status,
        timestamp: kycLogs.timestamp,
      })
      .from(kycLogs)
      .innerJoin(users, eq(kycLogs.userId, users.id));

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('[KYC_LOGS_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch KYC logs' }, { status: 500 });
  }
}
