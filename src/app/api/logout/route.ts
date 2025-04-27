import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Remove the auth cookie without passing `response`
  await removeAuthCookie(); // ✅ No `response` argument needed

  return response;
}
