import { api } from './api';

export const profilesApi = {
  getProfiles: () => api.get('/api/profiles'),
  getProfile: (id) => api.get(`/api/profiles/${id}`),
  createProfile: (profileData) => api.post('/api/profiles', profileData),
  updateProfile: (id, profileData) => api.put(`/api/profiles/${id}`, profileData),
  deleteProfile: (id) => api.delete(`/api/profiles/${id}`),
  setDefaultProfile: (id) => api.patch(`/api/profiles/${id}/default`),
  duplicateProfile: (id) => api.post(`/api/profiles/${id}/duplicate`)
};
