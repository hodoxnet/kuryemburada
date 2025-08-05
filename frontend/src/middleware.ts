import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/orders',
  '/profile',
  '/settings',
  '/admin',
  '/company',
  '/courier',
];

// Define public routes
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/',
];

// Define role-based routes
const roleRoutes = {
  SUPER_ADMIN: ['/admin'],
  COMPANY: ['/company'],
  COURIER: ['/courier'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname.startsWith(route)
  );

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // If it's a protected route and no token, redirect to login
  if (isProtectedRoute && !accessToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access public auth routes, redirect to dashboard
  if (accessToken && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For role-based routing, we would need to decode the JWT token
  // This is a simplified version - in production, you'd validate the token
  // and check the user's role
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};