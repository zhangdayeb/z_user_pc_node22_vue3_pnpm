import axios from 'axios';
import { setupInterceptors } from './interceptors';

export function createAxios(options = {}) {
  const defaultOptions = {
    // 移除硬编码的 /api，完全由环境变量控制
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 12000,
  };
  const service = axios.create({
    ...defaultOptions,
    ...options,
  });
  setupInterceptors(service);
  return service;
}

export const request = createAxios();
