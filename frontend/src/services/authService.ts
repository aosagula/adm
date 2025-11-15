import { api } from './api';

export const authService = {
  // Login
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  // Register
  async register(userData: any) {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  // Get current user
  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  // Logout
  async logout() {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  // Refresh token
  async refreshToken(refreshToken: string) {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },
};
