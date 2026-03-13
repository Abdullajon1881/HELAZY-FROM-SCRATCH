import api from './apiClient';

export const authAPI = {

  getCSRF: () => api.get('/auth/csrf/'),
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  logout: () => api.post('/auth/logout/'),
  googleAuth: (token) => api.post('/auth/google-auth/', { token }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  resetPasswordRequest: (email) => api.post('/auth/password-reset/', { email }),
  resetPasswordConfirm: (data) => api.post('/auth/password-reset/confirm/', data),
  uploadAvatar: (formData) => api.post('/auth/avatar/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

};
