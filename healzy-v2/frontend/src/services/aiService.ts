import api from './api';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  imageBase64?: string;
}

export interface AIResponse {
  message: string;
  sessionId: string;
  suggestions?: string[];
  relatedDoctors?: { specialty: string; reason: string }[];
}

export const aiService = {
  // Main AI chat (Claude Sonnet)
  chat: (messages: AIMessage[], sessionId?: string) =>
    api.post<AIResponse>('/ai/chat', { messages, sessionId }).then((r) => r.data),

  // Image analysis (Gemini Vision)
  analyzeImage: (imageBase64: string, question?: string) =>
    api.post<AIResponse>('/ai/analyze-image', { imageBase64, question }).then((r) => r.data),

  // Voice transcript → AI response (Gemini)
  voiceQuery: (audioBlob: Blob) => {
    const form = new FormData();
    form.append('audio', audioBlob, 'recording.webm');
    return api.post<AIResponse & { transcript: string }>('/ai/voice', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  // Symptom checker
  checkSymptoms: (symptoms: string[], age?: number, gender?: string) =>
    api.post<AIResponse>('/ai/symptoms', { symptoms, age, gender }).then((r) => r.data),

  // TTS — Gemini 2.5 Flash voice
  textToSpeech: (text: string, lang = 'en') =>
    api.post('/ai/tts', { text, lang }, { responseType: 'blob' }).then((r) => r.data as Blob),

  // Get session history
  getSession: (sessionId: string) =>
    api.get(`/ai/sessions/${sessionId}`).then((r) => r.data),

  // Delete session
  deleteSession: (sessionId: string) =>
    api.delete(`/ai/sessions/${sessionId}`).then((r) => r.data),
};
