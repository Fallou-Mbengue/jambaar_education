import apiClient from './client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const authApi = {
  login: (dto: LoginDto) => apiClient.post('/auth/login', dto),
  signup: (dto: SignupDto) => apiClient.post('/auth/signup', dto),
  logout: () => apiClient.post('/auth/logout'),
  refresh: () => apiClient.post('/auth/refresh'),
  getMe: () => apiClient.get('/users/me'),
};
