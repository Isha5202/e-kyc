import { SignJWT, jwtVerify } from 'jose';
import { cookies as getCookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const encoder = new TextEncoder();
const secretKey = encoder.encode(JWT_SECRET);

export async function createJWT(user: { id: number; email: string; role: string }) {
  // console.log('[createJWT] Creating token for user:', user);
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
  // console.log('[createJWT] Token created:', token);
  return token;
}

export async function verifyJWT(token: string) {
  // console.log('[verifyJWT] Verifying token:', token);
  try {
    const { payload } = await jwtVerify(token, secretKey);
    // console.log('[verifyJWT] Token valid, decoded:', payload);
    return payload;
  } catch (err) {
    // console.warn('[verifyJWT] Invalid token:', err);
    return null;
  }
}

/**
 * For use in API routes. Modifies response and sets cookie.
 */
export function setAuthCookie(token: string, response: NextResponse) {
  // console.log('[setAuthCookie] Setting auth cookie with token:', token);
  response.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  // console.log('[setAuthCookie] Cookie set successfully');
}

/**
 * For use in API routes. Modifies response and removes cookie.
 */
export function removeAuthCookie(response: NextResponse) {
  // console.log('[removeAuthCookie] Removing auth cookie');
  response.cookies.set('token', '', {
    path: '/',
    maxAge: 0,
  });
  // console.log('[removeAuthCookie] Cookie removed successfully');
}

/**
 * For use in middleware or server-only functions (not API routes).
 */
export async function getTokenFromCookies() {
  const cookieStore = getCookies();
  const token = (await cookieStore).get('token')?.value;
  console.log('[getTokenFromCookies] Token from cookie:', token);
  return token ?? null;
}

/**
 * For internal fetch calls where you want to forward token manually.
 */
export function getAuthHeaders() {
  const token = getTokenFromCookies();
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}
