import axios from 'axios';
import { useAuthStore } from '../features/auth/store';

import axios from 'axios';
import { useAuthStore } from './store';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// CSRF token handling
let csrfToken = null;

const getCSRFToken = () => {
  const match = document.cookie.match('(^|;)\\s*csrftoken\\s*=\\s*([^;]+)');
  return match ? match.pop() : '';
};

// Request interceptor — attach auth token + CSRF
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-CSRFToken'] = getCSRFToken();
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
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

// ─── Doctors ──────────────────────────────────────────────────────────────────
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

// ─── Consultations / Chat ─────────────────────────────────────────────────────
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations/'),
  getMessages: (conversationId, page = 1) =>
    api.get(`/chat/conversations/${conversationId}/messages/`, { params: { page } }),
  startConsultation: (doctorId) => api.post('/chat/start/', { doctor_id: doctorId }),
  endConsultation: (conversationId) => api.post(`/chat/conversations/${conversationId}/end/`),
  uploadFile: (conversationId, formData) =>
    api.post(`/chat/conversations/${conversationId}/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getConsultationHistory: () => api.get('/chat/history/'),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  getDialogues: () => api.get('/ai/dialogues/'),
  createDialogue: () => api.post('/ai/dialogues/'),
  getMessages: (dialogueId) => api.get(`/ai/dialogues/${dialogueId}/messages/`),
  sendMessage: (dialogueId, data) => api.post(`/ai/dialogues/${dialogueId}/messages/`, data),
  sendMessageWithImage: (dialogueId, formData) =>
    api.post(`/ai/dialogues/${dialogueId}/messages/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteDialogue: (dialogueId) => api.delete(`/ai/dialogues/${dialogueId}/`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
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

// ─── WebSocket Factory ─────────────────────────────────────────────────────────
export const createChatWebSocket = (conversationId, token) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return new WebSocket(`${protocol}//${host}/ws/chat/${conversationId}/?token=${token}`);
};

export default api;
 
