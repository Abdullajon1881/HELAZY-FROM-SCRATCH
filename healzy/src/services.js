// This is the single import point for all API calls.
// Set USE_MOCK = false in mockData.js to switch to the live Django backend.

import {
  USE_MOCK,
  mockAuthAPI, mockDoctorsAPI, mockChatAPI, mockAdminAPI,
} from './mockData';
import { authAPI, doctorsAPI, chatAPI, adminAPI, aiAPI } from './api';

export const Auth   = USE_MOCK ? mockAuthAPI   : authAPI;
export const Doctors = USE_MOCK ? mockDoctorsAPI : doctorsAPI;
export const Chat   = USE_MOCK ? mockChatAPI   : chatAPI;
export const Admin  = USE_MOCK ? mockAdminAPI  : adminAPI;
export const AI     = aiAPI; // AI always hits real Gemini via your backend
