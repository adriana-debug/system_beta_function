import { api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  employee_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_superuser: boolean;
  last_login: string | null;
  role: {
    id: string;
    name: string;
    code: string;
  };
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<CurrentUser> => {
    const response = await api.get<CurrentUser>('/auth/me');
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
