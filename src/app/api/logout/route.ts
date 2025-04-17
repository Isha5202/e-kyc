import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
  console.log('[POST /api/logout] Logout request received');

  const response = NextResponse.json({ success: true });
  removeAuthCookie(response);

  return response;
}
