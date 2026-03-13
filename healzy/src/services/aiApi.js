import api from './apiClient';

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
