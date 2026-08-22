import { api, BASE_URL } from './api';

export const fetchSettings = async () => {
  return await api.get('/api/settings');
};

export const updateAccountSettings = async (data) => {
  return await api.patch('/api/settings/account', data);
};

export const updateJobPreferencesSettings = async (data) => {
  return await api.patch('/api/settings/job-preferences', data);
};

export const updateNotificationSettings = async (data) => {
  return await api.patch('/api/settings/notifications', data);
};

export const updatePrivacySettings = async (data) => {
  return await api.patch('/api/settings/privacy', data);
};

export const updateAppearanceSettings = async (data) => {
  return await api.patch('/api/settings/appearance', data);
};

export const changePasswordSettings = async (data) => {
  return await api.patch('/api/settings/password', data);
};

export const fetchSessions = async () => {
  return await api.get('/api/settings/sessions');
};

export const revokeSession = async (sessionId) => {
  return await api.delete(`/api/settings/sessions/${sessionId}`);
};

export const logoutAllOtherSessions = async () => {
  return await api.post('/api/settings/sessions/logout-all', {});
};

export const downloadExportData = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/api/settings/export`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to export data');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `placemate-export-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export const deactivateAccount = async () => {
  return await api.post('/api/settings/deactivate', {});
};

export const deleteAccount = async (password) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/api/settings/account`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ password })
  });

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error((data && data.message) || 'Failed to delete account.');
  }

  return data;
};
