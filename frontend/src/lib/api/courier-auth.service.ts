import { apiClient } from '../api-client';

export interface CourierLoginRequest {
  email: string;
  password: string;
}

export interface CourierRegisterRequest {
  email: string;
  password: string;
  fullName: string;
  tcNumber: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  vehicleInfo: {
    type: string;
    brand: string;
    model: string;
    year: string;
    plateNumber: string;
    color?: string;
  };
  licenseInfo: {
    licenseNumber: string;
    licenseType: string;
    expiryDate: string;
  };
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface CourierLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    courier: {
      id: string;
      fullName: string;
      tcNumber: string;
      phone: string;
      status: string;
      dateOfBirth?: string;
      address?: string;
      vehicleInfo: any;
      licenseInfo: any;
      rating?: number;
      totalDeliveries?: number;
      emergencyContact?: any;
    };
    createdAt?: string | Date;
    lastLoginAt?: string | Date;
  };
}

export interface CourierRegisterResponse {
  message: string;
  courier: {
    id: string;
    email: string;
    status: string;
    courier: {
      id: string;
      fullName: string;
      phone: string;
      status: string;
    };
  };
}

export interface CourierStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  activeDeliveries: number;
  rating?: number;
  lastUpdated: string;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
}

export class CourierAuthService {
  private static readonly BASE_URL = '/auth/courier';

  /**
   * Courier login
   */
  static async login(credentials: CourierLoginRequest): Promise<CourierLoginResponse> {
    const response = await apiClient.post<CourierLoginResponse>(
      `${this.BASE_URL}/login`,
      credentials
    );
    return response.data;
  }

  /**
   * Courier registration
   */
  static async register(data: CourierRegisterRequest): Promise<CourierRegisterResponse> {
    const response = await apiClient.post<CourierRegisterResponse>(
      `${this.BASE_URL}/register`,
      data
    );
    return response.data;
  }

  /**
   * Refresh courier access token
   */
  static async refreshToken(refreshToken: string): Promise<CourierLoginResponse> {
    const response = await apiClient.post<CourierLoginResponse>(
      `${this.BASE_URL}/refresh`,
      { refreshToken }
    );
    return response.data;
  }

  /**
   * Courier logout
   */
  static async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.BASE_URL}/logout`
    );
    return response.data;
  }

  /**
   * Get courier profile
   */
  static async getProfile(): Promise<CourierLoginResponse['courier']> {
    const response = await apiClient.get<CourierLoginResponse['courier']>(
      `${this.BASE_URL}/profile`
    );
    return response.data;
  }

  /**
   * Update courier profile
   */
  static async updateProfile(data: Partial<CourierRegisterRequest>): Promise<{ message: string; courier: any }> {
    const response = await apiClient.put<{ message: string; courier: any }>(
      `${this.BASE_URL}/profile`,
      data
    );
    return response.data;
  }

  /**
   * Get courier statistics
   */
  static async getStats(): Promise<CourierStats> {
    const response = await apiClient.get<CourierStats>(
      `${this.BASE_URL}/stats`
    );
    return response.data;
  }

  /**
   * Update courier location
   */
  static async updateLocation(location: LocationUpdate): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(
      `${this.BASE_URL}/location`,
      location
    );
    return response.data;
  }

  /**
   * Change courier password
   */
  static async changePassword(data: { oldPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.BASE_URL}/change-password`,
      data
    );
    return response.data;
  }
}
