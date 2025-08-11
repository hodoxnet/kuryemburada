import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('TEST MIDDLEWARE ÇALIŞIYOR!', request.nextUrl.pathname);
  
  // Test için /admin'e gidenleri login'e yönlendir
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('ADMIN REDIRECT TEST');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};