import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<any> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken();
          }

          try {
            await this.refreshPromise;
            this.refreshPromise = null;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.refreshPromise = null;
            this.handleLogout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: AxiosError<ApiError>): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }

    if (error.request) {
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
        error: 'NetworkError',
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: 0,
      error: 'UnknownError',
    };
  }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  private setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.client.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      this.setTokens(accessToken, newRefreshToken);
      return response.data;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  private handleLogout() {
    this.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Public methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Auth specific methods
  async login(email: string, password: string) {
    const response = await this.post<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', { email, password });
    
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async register(data: { email: string; password: string; role: string }) {
    const response = await this.post<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', data);
    
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const apiClient = new ApiClient();
export default apiClient;