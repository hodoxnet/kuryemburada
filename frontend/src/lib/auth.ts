import Cookies from 'js-cookie';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user_info';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'COMPANY' | 'COURIER';
  companyId?: string;
  courierId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export class AuthService {
  static setTokens(tokens: AuthTokens) {
    Cookies.set(TOKEN_KEY, tokens.accessToken, { 
      expires: 7, // 7 gün
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    if (tokens.refreshToken) {
      Cookies.set('refresh_token', tokens.refreshToken, { 
        expires: 30, // 30 gün
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
  }

  static getAccessToken(): string | undefined {
    return Cookies.get(TOKEN_KEY);
  }

  static getRefreshToken(): string | undefined {
    return Cookies.get('refresh_token');
  }

  static setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static clearAuth() {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove('refresh_token');
    localStorage.removeItem(USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  static hasRole(requiredRoles: string[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }
}