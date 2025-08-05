'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';

const publicPaths = ['/login', '/register', '/forgot-password', '/'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, checkAuth, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const isPublicPath = publicPaths.includes(pathname);

    if (!isAuthenticated && !isPublicPath) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }

    // Role-based redirects
    if (isAuthenticated && user) {
      if (pathname === '/login' || pathname === '/register') {
        switch (user.role) {
          case 'SUPER_ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'COMPANY':
            router.push('/company/dashboard');
            break;
          case 'COURIER':
            router.push('/courier/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, pathname, router, user]);

  return <>{children}</>;
}