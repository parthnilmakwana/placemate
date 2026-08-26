import { api } from './api';

export const resumeApi = {
  getResumes: () => api.get('/api/resume'),
  getResume: (id) => api.get(`/api/resume/${id}`),
  createResume: (data) => api.post('/api/resume', data),
  updateResume: (id, data) => api.put(`/api/resume/${id}`, data),
  deleteResume: (id) => api.delete(`/api/resume/${id}`),
  downloadResume: (query = '') => api.get(`/api/resume/download${query}`),
  enhanceResume: () => api.post('/api/resume/enhance')
};
