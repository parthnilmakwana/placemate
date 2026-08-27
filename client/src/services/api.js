/**
 * Unified API client utility for standard HTTP requests.
 * Automatically injects the JWT token from localStorage into headers.
 */

export const BASE_URL = import.meta.env.VITE_API_URL || '';

export const getHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    // Extract error message from API response, fallback to status text
    const message = (data && data.message) || response.statusText || 'An API error occurred';
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    // Add response property to match Axios behavior that components might expect
    error.response = { data }; 
    throw error;
  }

  return data;
};

export const api = {
  get: async (url) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async (url, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const headers = { ...getHeaders(isFormData), ...(options.headers || {}) };
    
    // Browser must set the boundary for multipart/form-data
    if (isFormData && headers['Content-Type'] === 'multipart/form-data') {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async (url, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const headers = { ...getHeaders(isFormData), ...(options.headers || {}) };

    if (isFormData && headers['Content-Type'] === 'multipart/form-data') {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response);
  },

  patch: async (url, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const headers = { ...getHeaders(isFormData), ...(options.headers || {}) };

    if (isFormData && headers['Content-Type'] === 'multipart/form-data') {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PATCH',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (url, body = null, options = {}) => {
    const headers = { ...getHeaders(), ...(options.headers || {}) };
    const fetchOptions = {
      method: 'DELETE',
      headers,
    };
    
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${url}`, fetchOptions);
    return handleResponse(response);
  },
};
