import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@halaqa/shared';

class ApiClient {
  private client: AxiosInstance;

  constructor(
    baseURL: string = import.meta.env.VITE_API_URL ||
      'http://localhost:3000/api'
  ) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
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
          // Handle unauthorized access
          localStorage.removeItem('halaqa_token');
          localStorage.removeItem('halaqa_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || 'حدث خطأ غير متوقع'
      };
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(
        url,
        data,
        config
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || 'حدث خطأ غير متوقع'
      };
    }
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(
        url,
        data,
        config
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || 'حدث خطأ غير متوقع'
      };
    }
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || 'حدث خطأ غير متوقع'
      };
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
