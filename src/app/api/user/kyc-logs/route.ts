// src/app/api/user/kyc-logs/route.ts

import { NextResponse } from 'next/server';
import { getTop3KycByCurrentUser } from '@/lib/kyc-stats';

export async function GET() {
  try {
    const topKycTypes = await getTop3KycByCurrentUser();

    return NextResponse.json({ success: true, data: topKycTypes });
  } catch (error) {
    console.error('[USER_TOP_KYC_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
