import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/booking', '/account', '/admin'];
const AUTH_ONLY = ['/login', '/signup'];

function getSessionToken(req: NextRequest) {
  return req.cookies.get('session')?.value ?? null;
}

export function middleware(req: NextRequest) {
  const token = getSessionToken(req);
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthOnly && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/account';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/booking/:path*', '/account/:path*', '/admin/:path*', '/login', '/signup'],
};
