import apiClient from './client';

export const feedApi = {
  getFeed: (cursor?: string, limit = 10) =>
    apiClient.get('/feed', { params: { cursor, limit } }),
  getContent: (id: string) => apiClient.get(`/content/${id}`),
  updateProgress: (id: string, data: { watchedSeconds: number; progressPercent: number }) =>
    apiClient.post(`/content/${id}/progress`, data),
  toggleLike: (id: string) => apiClient.post(`/content/${id}/like`),
  toggleSave: (id: string) => apiClient.post(`/content/${id}/save`),
  share: (id: string, platform: string) =>
    apiClient.post(`/content/${id}/share`, { platform }),
  getSaved: () => apiClient.get('/content/saved'),
  getAiSummary: (id: string) => apiClient.post(`/ai/summarize/${id}`),
};
