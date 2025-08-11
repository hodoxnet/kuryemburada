import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('accessToken')?.value;

  // Ana sayfa yönlendirmesi
  if (pathname === '/') {
    return NextResponse.redirect(new URL(token ? '/admin' : '/login', request.url));
  }

  // Login sayfası - token varsa admin'e yönlendir
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Korumalı sayfalar - token yoksa login'e yönlendir
  const protectedPaths = ['/admin', '/company', '/courier'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/company/:path*',
    '/courier/:path*',
    '/login',
  ],
};