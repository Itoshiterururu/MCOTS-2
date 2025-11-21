import authService from '../services/authService';

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Generic API request handler
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Auto logout on unauthorized
        const authService = await import('../services/authService');
        authService.default.logout();
        window.location.reload();
      }
      return { 
        success: false, 
        error: `Request failed: ${response.status} ${response.statusText}` 
      };
    }
    
    if (response.status === 204 || options.method === 'DELETE') {
      return { success: true };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// CRUD operations factory
export const createCrudOperations = (baseUrl) => ({
  getAll: () => apiRequest(baseUrl),
  getById: (id) => apiRequest(`${baseUrl}/${id}`),
  create: (data) => apiRequest(baseUrl, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`${baseUrl}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`${baseUrl}/${id}`, {
    method: 'DELETE',
  }),
});