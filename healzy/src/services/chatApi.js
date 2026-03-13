import api from './apiClient';

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

export const createChatWebSocket = (conversationId, token) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
