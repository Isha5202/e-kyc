import { SignJWT, jwtVerify } from 'jose';
import { cookies as getCookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

// Define the JWT payload structure
export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const encoder = new TextEncoder();
const secretKey = encoder.encode(JWT_SECRET);

// Function to create JWT token
export async function createJWT(user: { id: number; email: string; role: string }) {
  // Ensure the user object is correctly formatted
  if (!user || typeof user.id !== 'number' || typeof user.email !== 'string' || typeof user.role !== 'string') {
    throw new Error('Invalid user object provided');
  }

  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

  return token;
}

// Function to verify JWT token
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    
    // Type assertion: Convert to 'unknown' first and then cast to your JWTPayload
    return payload as unknown as JWTPayload;
  } catch (err) {
    return null;
  }
}

/**
 * For use in API routes. Modifies response and sets cookie.
 */
export function setAuthCookie(token: string, response: NextResponse) {
  // Ensure token is a non-empty string
  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('Invalid token provided');
  }

  response.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * For use in API routes. Modifies response and removes cookie.
 */
export function removeAuthCookie(response: NextResponse) {
  response.cookies.set('token', '', {
    path: '/',
    maxAge: 0,
  });
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
