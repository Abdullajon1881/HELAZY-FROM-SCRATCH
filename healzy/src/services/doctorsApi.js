import api from './apiClient';

export const doctorsAPI = {

  search: (params) => api.get('/doctors/', { params }),
  getById: (id) => api.get(`/doctors/${id}/`),
  getProfile: () => api.get('/doctors/my-profile/'),
  submitApplication: (formData) => api.post('/doctors/apply/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProfile: (data) => api.patch('/doctors/my-profile/', data),
  getSpecialties: () => api.get('/doctors/specialties/'),
  getReviews: (doctorId) => api.get(`/doctors/${doctorId}/reviews/`),
  submitReview: (doctorId, data) => api.post(`/doctors/${doctorId}/reviews/`, data),
  getFeatured: () => api.get('/doctors/featured/'),

};
