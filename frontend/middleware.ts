import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // Check for auth cookie set on login
  const authCookie = request.cookies.get('inventoryai_auth');

  if (!authCookie || authCookie.value !== 'true') {
    // Not authenticated — redirect to login, preserving intended destination
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files, api routes, _next internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
