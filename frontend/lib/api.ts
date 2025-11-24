import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const auth = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Transfer endpoints
export const transfers = {
  create: (data: any) => api.post('/transfers', data),
  upload: (transferId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/transfers/${transferId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  finalize: (transferId: string) => api.post(`/transfers/${transferId}/finalize`),
  get: (shortId: string, password?: string) =>
    api.get(`/transfers/${shortId}`, { params: { password } }),
  download: (shortId: string, password?: string) =>
    api.post(`/transfers/${shortId}/download`, null, { params: { password } }),
  delete: (id: string) => api.delete(`/transfers/${id}`),
  getAnalytics: (id: string) => api.get(`/transfers/${id}/analytics`),
};

// User endpoints
export const users = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.put('/users/me', data),
  getTransfers: () => api.get('/users/me/transfers'),
  getStorage: () => api.get('/users/me/storage'),
};

// Organization endpoints
export const organizations = {
  getAll: () => api.get('/organizations'),
  get: (id: string) => api.get(`/organizations/${id}`),
  create: (data: any) => api.post('/organizations', data),
  update: (id: string, data: any) => api.put(`/organizations/${id}`, data),
  getUsers: (id: string) => api.get(`/organizations/${id}/users`),
  getAnalytics: (id: string) => api.get(`/organizations/${id}/analytics`),
};

// Admin endpoints
export const admin = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAuditLogs: (limit = 100, offset = 0) =>
    api.get('/admin/audit-logs', { params: { limit, offset } }),
  getHealth: () => api.get('/admin/health'),
  getAnalytics: (days = 30) => api.get('/admin/analytics', { params: { days } }),
};
