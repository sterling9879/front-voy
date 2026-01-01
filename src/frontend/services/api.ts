import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; niche?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Projects API
export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string; niche: string }) =>
    api.post('/projects', data),
  update: (id: string, data: { name?: string; description?: string; niche?: string }) =>
    api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Copies API
export const copiesApi = {
  list: (projectId: string, filters?: Record<string, string>) =>
    api.get('/copies', { params: { projectId, ...filters } }),
  get: (id: string) => api.get(`/copies/${id}`),
  create: (data: {
    projectId: string;
    title: string;
    content: string;
    status?: string;
    creativeUrl?: string;
    creativeType?: string;
    audienceSegment?: object;
    hypothesisId?: string;
    hypothesisVariable?: string;
  }) => api.post('/copies', data),
  update: (id: string, data: object) => api.put(`/copies/${id}`, data),
  updateStatus: (id: string, data: {
    status: string;
    metrics?: object;
    failureReasons?: string[];
    failureNotes?: string;
  }) => api.put(`/copies/${id}/status`, data),
  delete: (id: string) => api.delete(`/copies/${id}`),
  getVersions: (id: string) => api.get(`/copies/${id}/versions`),
  restoreVersion: (copyId: string, versionId: string) =>
    api.post(`/copies/${copyId}/restore/${versionId}`),
};

// Analytics API
export const analyticsApi = {
  dashboard: (projectId: string) =>
    api.get('/analytics/dashboard', { params: { projectId } }),
  evolution: (projectId: string) =>
    api.get('/analytics/evolution', { params: { projectId } }),
  heatmap: (projectId: string) =>
    api.get('/analytics/heatmap', { params: { projectId } }),
  insights: (projectId: string) =>
    api.get('/analytics/insights', { params: { projectId } }),
  audienceSignature: (projectId: string, segment: string) =>
    api.get(`/analytics/audience/${segment}`, { params: { projectId } }),
  benchmark: (projectId: string) =>
    api.get('/analytics/benchmark', { params: { projectId } }),
  failureReasons: (projectId: string) =>
    api.get('/analytics/failure-reasons', { params: { projectId } }),
  creativeCorrelation: (projectId: string) =>
    api.get('/analytics/creative-correlation', { params: { projectId } }),
};

// Hypotheses API
export const hypothesesApi = {
  list: (projectId: string) =>
    api.get('/hypotheses', { params: { projectId } }),
  get: (id: string) => api.get(`/hypotheses/${id}`),
  create: (data: {
    projectId: string;
    name: string;
    description?: string;
    variableA: string;
    variableB: string;
  }) => api.post('/hypotheses', data),
  update: (id: string, data: object) => api.put(`/hypotheses/${id}`, data),
  conclude: (id: string, data: { conclusion: string; winningVariable: string }) =>
    api.post(`/hypotheses/${id}/conclude`, data),
  delete: (id: string) => api.delete(`/hypotheses/${id}`),
};

// Timeline API
export const timelineApi = {
  list: (projectId: string, filters?: Record<string, string>) =>
    api.get('/timeline', { params: { projectId, ...filters } }),
  getCopyTimeline: (copyId: string) =>
    api.get(`/timeline/copy/${copyId}`),
};
