import { apiClient } from '../api-client';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    status?: string;
    createdAt?: string | Date;
    lastLoginAt?: string | Date;
  };
}

export interface AdminRefreshRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface AdminStats {
  totalCompanies: number;
  totalCouriers: number;
  totalOrders: number;
  activeCompanies: number;
  activeCouriers: number;
  pendingApprovals: number;
  lastUpdated: string;
}

export class AdminAuthService {
  private static readonly BASE_URL = '/auth/admin';

  /**
   * Admin login
   */
  static async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await apiClient.post<AdminLoginResponse>(
      `${this.BASE_URL}/login`,
      credentials
    );
    return response.data;
  }

  /**
   * Refresh admin access token
   */
  static async refreshToken(refreshToken: string): Promise<AdminLoginResponse> {
    const response = await apiClient.post<AdminLoginResponse>(
      `${this.BASE_URL}/refresh`,
      { refreshToken }
    );
    return response.data;
  }

  /**
   * Admin logout
   */
  static async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.BASE_URL}/logout`
    );
    return response.data;
  }

  /**
   * Get admin profile
   */
  static async getProfile(): Promise<AdminLoginResponse['admin']> {
    const response = await apiClient.get<AdminLoginResponse['admin']>(
      `${this.BASE_URL}/profile`
    );
    return response.data;
  }

  /**
   * Get system statistics
   */
  static async getSystemStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>(
      `${this.BASE_URL}/stats`
    );
    return response.data;
  }

  /**
   * Change admin password
   */
  static async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.BASE_URL}/change-password`,
      data
    );
    return response.data;
  }
}
