import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('accessToken')?.value;

  // Ana sayfayı her durumda göster (yönlendirme yok)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Auth sayfası: token varsa role göre panele yönlendir
  if (pathname === '/auth' && token) {
    // JWT payload'dan rolü çöz (base64url decode)
    const decodeRole = (jwt: string): string | null => {
      try {
        const payload = jwt.split('.')[1];
        if (!payload) return null;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        // atob ile decode et, padding'i düzelt
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
        const json = atob(padded);
        const data = JSON.parse(json);
        return data?.role ?? null;
      } catch {
        return null;
      }
    };

    const role = decodeRole(token);
    const roleTarget = role === 'SUPER_ADMIN' ? '/admin' : role === 'COMPANY' ? '/company' : role === 'COURIER' ? '/courier' : '/';
    return NextResponse.redirect(new URL(roleTarget, request.url));
  }

  // Korumalı sayfalar - token yoksa login'e yönlendir
  const protectedPaths = ['/admin', '/company', '/courier'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/auth', request.url);
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
    '/auth',
  ],
};
