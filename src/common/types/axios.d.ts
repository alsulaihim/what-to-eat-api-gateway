import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      responseTime?: number;
    };
  }

  export interface InternalAxiosRequestConfig {
    metadata?: {
      responseTime?: number;
    };
  }
}