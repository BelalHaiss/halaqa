import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { UnifiedApiResponse } from '@halaqa/shared';
import { normalizeError } from '@/lib/errors/normalize-error';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('halaqa_token');
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
      (error) => {
        if (error.response?.status === 401) {
          const isLoginRequest = error.config?.url?.includes('/auth/login');

          if (!isLoginRequest) {
            // Only redirect to login if it's NOT the login endpoint
            localStorage.removeItem('halaqa_token');
            localStorage.removeItem('halaqa_user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<UnifiedApiResponse<T>> {
    try {
      const response: AxiosResponse<UnifiedApiResponse<T>> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<UnifiedApiResponse<T>> {
    try {
      const response: AxiosResponse<UnifiedApiResponse<T>> = await this.client.post(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<UnifiedApiResponse<T>> {
    try {
      const response: AxiosResponse<UnifiedApiResponse<T>> = await this.client.put(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<UnifiedApiResponse<T>> {
    try {
      const response: AxiosResponse<UnifiedApiResponse<T>> = await this.client.patch(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<UnifiedApiResponse<T>> {
    try {
      const response: AxiosResponse<UnifiedApiResponse<T>> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
