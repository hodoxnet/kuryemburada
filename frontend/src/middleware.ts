import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Korumalı rotalar ve gerekli roller
const protectedRoutes = {
  '/admin': ['SUPER_ADMIN'],
  '/company': ['COMPANY', 'SUPER_ADMIN'],
  '/courier': ['COURIER', 'SUPER_ADMIN'],
  '/dashboard': ['SUPER_ADMIN', 'COMPANY', 'COURIER'],
};

// Public rotalar (giriş yapmadan erişilebilir)
const publicRoutes = ['/login', '/register', '/forgot-password', '/', '/about'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Public rotalara her zaman erişim izni ver
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute && !token) {
    return NextResponse.next();
  }

  // Giriş yapmış kullanıcılar login sayfasına gitmeye çalışırsa dashboard'a yönlendir
  if (isPublicRoute && token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Korumalı rotalara erişim kontrolü
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (protectedRoute) {
    // Token yoksa login sayfasına yönlendir
    if (!token) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Token var ama rol kontrolü için backend'e istek atılabilir
    // Şimdilik sadece token varlığını kontrol ediyoruz
    // İleride JWT decode edilip rol kontrolü yapılabilir
  }

  return NextResponse.next();
}

// Middleware'in çalışacağı path'ler
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};