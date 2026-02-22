import { apiClient } from './client';

export const contentApi = {
  getById: (id: string) => apiClient.get(`/content/${id}`),
  getQuiz: (id: string) => apiClient.get(`/content/${id}/quiz`),
  updateProgress: (id: string, data: { watchedSeconds?: number; completed?: boolean }) =>
    apiClient.post(`/content/${id}/progress`, data),
  toggleLike: (id: string) => apiClient.post(`/content/${id}/like`),
  toggleSave: (id: string) => apiClient.post(`/content/${id}/save`),
  share: (id: string) => apiClient.post(`/content/${id}/share`),
};

export const programsApi = {
  getAll: () => apiClient.get('/programs'),
  getById: (id: string) => apiClient.get(`/programs/${id}`),
  enroll: (id: string) => apiClient.post(`/programs/${id}/enroll`),
  updateProgress: (id: string, data: { moduleId: string; completed: boolean }) =>
    apiClient.post(`/programs/${id}/progress`, data),
};

export const challengesApi = {
  getAll: () => apiClient.get('/challenges'),
  getById: (id: string) => apiClient.get(`/challenges/${id}`),
  join: (id: string) => apiClient.post(`/challenges/${id}/join`),
  validateDay: (id: string, data: { dayNumber: number; reflection?: string }) =>
    apiClient.post(`/challenges/${id}/validate-day`, data),
};

export const aiApi = {
  chat: (data: { message: string; conversationId?: string }) =>
    apiClient.post('/ai/chat', data),
  summarize: (contentId: string) =>
    apiClient.post('/ai/summarize', { contentId }),
  getRecommendations: () => apiClient.get('/ai/recommendations'),
};

export const notificationsApi = {
  getAll: () => apiClient.get('/notifications'),
  markRead: (id: string) => apiClient.post(`/notifications/${id}/read`),
};

export const billingApi = {
  getPlans: () => apiClient.get('/billing/plans'),
  subscribe: (data: { planId: string; provider: string; phoneNumber: string }) =>
    apiClient.post('/billing/subscribe', data),
  getStatus: () => apiClient.get('/billing/status'),
  getPayment: (id: string) => apiClient.get(`/billing/payment/${id}`),
};

export const dashboardApi = {
  getKpis: () => apiClient.get('/dashboard/kpis'),
  getUsers: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get('/dashboard/users', { params }),
  getUserById: (id: string) => apiClient.get(`/dashboard/users/${id}`),
  getContent: (params?: { status?: string; type?: string }) =>
    apiClient.get('/dashboard/content', { params }),
  createContent: (data: Record<string, unknown>) =>
    apiClient.post('/dashboard/content', data),
  updateContent: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/dashboard/content/${id}`, data),
  deleteContent: (id: string) => apiClient.delete(`/dashboard/content/${id}`),
  getSubscriptions: () => apiClient.get('/dashboard/subscriptions'),
};
