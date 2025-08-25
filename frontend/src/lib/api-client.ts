import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthService } from './auth';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4004';

// Axios instance oluştur
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Her istekte token ekle
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Cookie'den token al (AuthService üzerinden)
    const token = AuthService.getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Token yenileme ve hata yönetimi
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 401 hatası ve token yenileme denemesi yapılmamışsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = AuthService.getRefreshToken();
        
        if (refreshToken) {
          // Token yenileme isteği
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Yeni token'ları kaydet (rotation)
          AuthService.setTokens({ 
            accessToken, 
            refreshToken: newRefreshToken 
          });

          // Orijinal isteği yeni token ile tekrar gönder
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Token yenileme başarısız - kullanıcıyı çıkış yaptır
        AuthService.clearAuth();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    // 403 Forbidden - Yetki hatası
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
    }

    return Promise.reject(error);
  }
);

// API metodları
export const api = {
  // GET isteği
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config),

  // POST isteği
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config),

  // PUT isteği
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config),

  // PATCH isteği
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config),

  // DELETE isteği
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),

  // File upload için özel metod
  upload: <T = any>(url: string, formData: FormData, onProgress?: (progressEvent: any) => void) =>
    apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    }),
};

// Hata yönetimi helper'ları
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.status === 404) {
      return 'İstenen kaynak bulunamadı';
    }
    if (error.response?.status === 500) {
      return 'Sunucu hatası oluştu';
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'Beklenmeyen bir hata oluştu';
};

// Export both apiClient and api for different use cases
export { apiClient };
export default apiClient;
