import api from './apiClient';

export const adminAPI = {

  getStats: () => api.get('/admin/stats/'),
  getDoctorApplications: (status) => api.get('/admin/doctor-applications/', { params: { status } }),
  approveDoctor: (id) => api.post(`/admin/doctor-applications/${id}/approve/`),
  rejectDoctor: (id, reason) => api.post(`/admin/doctor-applications/${id}/reject/`, { reason }),
  getUsers: (params) => api.get('/admin/users/', { params }),
  banUser: (id) => api.post(`/admin/users/${id}/ban/`),
  unbanUser: (id) => api.post(`/admin/users/${id}/unban/`),
  makeAdmin: (id) => api.post(`/admin/users/${id}/make-admin/`),
  getConsultations: (params) => api.get('/admin/consultations/', { params }),

};
