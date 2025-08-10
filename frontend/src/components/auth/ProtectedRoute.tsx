'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Rol kontrolü
      if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
        // Yetkisiz erişim - 403 sayfasına veya ana sayfaya yönlendir
        router.push('/unauthorized');
        return;
      }
    }
  }, [loading, isAuthenticated, requiredRoles, hasRole, router]);

  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa veya yetkisi yoksa null döndür
  if (!isAuthenticated || (requiredRoles.length > 0 && !hasRole(requiredRoles))) {
    return null;
  }

  // Her şey tamamsa children'ı render et
  return <>{children}</>;
}