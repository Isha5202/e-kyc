export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // console.log('[Middleware] Incoming request:', pathname);
  // console.log('[Middleware] Token:', token);

  const isPublic =
    pathname.startsWith('/login') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/logo');

  if (isPublic) {
    // console.log('[Middleware] Public route, allowing access');
    return NextResponse.next();
  }

  if (!token) {
    // console.warn('[Middleware] No token found, redirecting to /login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const decoded = await verifyJWT(token); // ✅ Await this!
  // console.log('[Middleware] Decoded token:', decoded);

  if (!decoded || typeof decoded !== 'object' || !('role' in decoded)) {
    // console.warn('[Middleware] Invalid or malformed token, redirecting to /login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = typeof decoded.role === 'string' ? decoded.role : null;
  // console.log(`[Middleware] User role: ${role}`);

  if (pathname.startsWith('/users') && role !== 'user') {
    // console.warn('[Middleware] Non-user tried to access /users, redirecting to /');
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (
    (pathname.startsWith('/manage-user') || pathname.startsWith('/settings')) &&
    role !== 'admin'
  ) {
    // console.warn('[Middleware] Non-admin tried to access admin routes, redirecting to /users');
    return NextResponse.redirect(new URL('/users', req.url));
  }

  // console.log('[Middleware] Authenticated and authorized, allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon.ico|images|logo|.*\\..*).*)'],
};
