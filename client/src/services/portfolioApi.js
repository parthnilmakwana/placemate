import { api } from './api';

export const portfolioApi = {
  getPortfolios: () => api.get('/api/portfolio'),
  getPortfolio: (id) => api.get(`/api/portfolio/item/${id}`),
  createPortfolio: (data) => api.post('/api/portfolio', data),
  updatePortfolio: (id, data) => api.put(`/api/portfolio/item/${id}`, data),
  deletePortfolio: (id) => api.delete(`/api/portfolio/item/${id}`),
  
  getSettings: () => api.get('/api/portfolio/settings'), // Note: this was originally PUT, maybe add get if needed
  updateSettings: (data) => api.put('/api/portfolio/settings', data),
  
  getUsage: () => api.get('/api/portfolio/usage'),
  generate: (data) => api.post('/api/portfolio/generate', data),
  applyDraft: (id, data) => api.post(`/api/portfolio/draft/${id}/apply`, data),
  discardDraft: (id) => api.delete(`/api/portfolio/draft/${id}`)
};
