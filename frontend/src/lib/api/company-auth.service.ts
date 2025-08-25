import { apiClient } from '../api-client';

export interface CompanyLoginRequest {
  email: string;
  password: string;
}

export interface CompanyRegisterRequest {
  email: string;
  password: string;
  companyName: string;
  phone: string;
  taxNumber?: string;
  tradeRegistryNumber?: string;
  website?: string;
  description?: string;
  address: {
    street: string;
    city: string;
    district: string;
    postalCode: string;
    country?: string;
  };
  contactPerson: {
    fullName: string;
    phone: string;
    email?: string;
    title?: string;
  };
}

export interface CompanyLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    company: {
      id: string;
      name: string;
      phone: string;
      status: string;
      address: any;
      contactPerson: any;
      taxNumber?: string;
      tradeLicenseNo?: string;
      website?: string;
    };
    createdAt?: string | Date;
    lastLoginAt?: string | Date;
  };
}

export interface CompanyRegisterResponse {
  message: string;
  company: {
    id: string;
    email: string;
    status: string;
    company: {
      id: string;
      name: string;
      phone: string;
      status: string;
    };
  };
}

export interface CompanyStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  activeOrders: number;
  lastUpdated: string;
}

export class CompanyAuthService {
  private static readonly BASE_URL = '/auth/company';

  /**
   * Company login
   */
  static async login(credentials: CompanyLoginRequest): Promise<CompanyLoginResponse> {
    const response = await apiClient.post<CompanyLoginResponse>(
      `${this.BASE_URL}/login`,
      credentials
    );
    return response.data;
  }

  /**
   * Company registration
   */
  static async register(data: CompanyRegisterRequest): Promise<CompanyRegisterResponse> {
    const response = await apiClient.post<CompanyRegisterResponse>(
      `${this.BASE_URL}/register`,
      data
    );
    return response.data;
  }

  /**
   * Refresh company access token
   */
  static async refreshToken(refreshToken: string): Promise<CompanyLoginResponse> {
    const response = await apiClient.post<CompanyLoginResponse>(
      `${this.BASE_URL}/refresh`,
      { refreshToken }
    );
    return response.data;
  }

  /**
   * Company logout
   */
  static async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.BASE_URL}/logout`
    );
    return response.data;
  }

  /**
   * Get company profile
   */
  static async getProfile(): Promise<CompanyLoginResponse['company']> {
    const response = await apiClient.get<CompanyLoginResponse['company']>(
      `${this.BASE_URL}/profile`
    );
    return response.data;
  }

  /**
   * Update company profile
   */
  static async updateProfile(data: Partial<CompanyRegisterRequest>): Promise<{ message: string; company: any }> {
    const response = await apiClient.put<{ message: string; company: any }>(
      `${this.BASE_URL}/profile`,
      data
    );
    return response.data;
  }

  /**
   * Get company statistics
   */
  static async getStats(): Promise<CompanyStats> {
    const response = await apiClient.get<CompanyStats>(
      `${this.BASE_URL}/stats`
    );
    return response.data;
  }

  /**
   * Change company password
   */
  static async changePassword(data: { oldPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.BASE_URL}/change-password`,
      data
    );
    return response.data;
  }
}
