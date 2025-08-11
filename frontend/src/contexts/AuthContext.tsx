'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User, AuthTokens } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Eski localStorage verilerini temizle (migration)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
    }
    
    // Token doğrulama fonksiyonu
    const verifyAuth = async () => {
      const token = AuthService.getAccessToken();
      const storedUser = AuthService.getUser();
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Backend'e token doğrulama isteği gönder
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Token geçerli, kullanıcı bilgilerini güncelle
          setUser(data.user);
        } else {
          // Token geçersiz, temizle ve login'e yönlendir
          AuthService.clearAuth();
          setUser(null);
          router.push('/login');
        }
      } catch (error) {
        console.error('Token doğrulama hatası:', error);
        // Hata durumunda güvenlik için temizle
        AuthService.clearAuth();
        setUser(null);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    verifyAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      // API çağrısı - backend'e istek gönder
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Giriş başarısız');
      }

      const data = await response.json();
      
      // Token ve kullanıcı bilgilerini kaydet (cookie'lere)
      AuthService.setTokens({ 
        accessToken: data.accessToken,
        refreshToken: data.refreshToken 
      });
      AuthService.setUser(data.user);
      
      // State'i güncelle
      setUser(data.user);
      
      // Rol bazlı yönlendirme
      switch (data.user.role) {
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
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = AuthService.getAccessToken();
      if (token) {
        // Backend'e logout isteği gönder
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Her durumda local storage'ı temizle
      AuthService.clearAuth();
      setUser(null);
      router.push('/login');
    }
  };

  const hasRole = (roles: string[]) => {
    return AuthService.hasRole(roles);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};