// ═══════════════════════════════════════════════════════════════════════════════
//  HEALZY FRONTEND — COMPLETE SOURCE  (self-extracting Node script)
//  Save as  healzy-complete.cjs  then run:  node healzy-complete.cjs
//
//  ┌─ TO BROWSE IN VS CODE ──────────────────────────────────────────────────┐
//  │  Use  Ctrl+F  and search  "FILE:"  to jump between files                │
//  │  Install "Comment Anchors" extension for a sidebar table of contents    │
//  └─────────────────────────────────────────────────────────────────────────┘
//
//  ┌─ TO EXTRACT & RUN ──────────────────────────────────────────────────────┐
//  │  node healzy-complete.cjs                                               │
//  │  cd healzy && npm install && npm run dev                                │
//  │  → http://localhost:5173                                                │
//  └─────────────────────────────────────────────────────────────────────────┘
//
//  Demo logins (password: password123)
//    patient@healzy.uz   →  Patient dashboard
//    doctor@healzy.uz    →  Doctor (apply form / dashboard)
//    admin@healzy.uz     →  Admin panel
//
//  To go live:  set USE_MOCK = false  in  src/mockData.js
// ═══════════════════════════════════════════════════════════════════════════════

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'healzy');

function write(rel, content) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  process.stdout.write('  ✓  ' + rel + '\n');
}

const FILES = {
  "package.json": "{\n  \"name\": \"healzy\",\n  \"private\": true,\n  \"version\": \"2.0.0\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"react\": \"^18.3.1\",\n    \"react-dom\": \"^18.3.1\",\n    \"react-router-dom\": \"^6.26.0\",\n    \"axios\": \"^1.7.2\",\n    \"zustand\": \"^4.5.4\",\n    \"framer-motion\": \"^11.3.19\",\n    \"react-hot-toast\": \"^2.4.1\",\n    \"date-fns\": \"^3.6.0\",\n    \"react-intersection-observer\": \"^9.13.0\",\n    \"lucide-react\": \"^0.408.0\"\n  },\n  \"devDependencies\": {\n    \"@vitejs/plugin-react\": \"^4.3.1\",\n    \"vite\": \"^5.3.4\"\n  }\n}\n",
  "vite.config.js": "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    proxy: {\n      '/api': {\n        target: 'http://localhost:8000',\n        changeOrigin: true,\n      },\n      '/ws': {\n        target: 'ws://localhost:8000',\n        ws: true,\n      },\n      '/media': {\n        target: 'http://localhost:8000',\n        changeOrigin: true,\n      }\n    }\n  }\n})\n",
  "index.html": "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/favicon.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Healzy — Online Medical Consultations</title>\n    <meta name=\"description\" content=\"Connect with certified doctors online. Real-time consultations, AI diagnostics, and expert medical advice.\" />\n    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n    <link href=\"https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap\" rel=\"stylesheet\">\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.jsx\"></script>\n  </body>\n</html>\n",
  "public/favicon.svg": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <rect width=\"32\" height=\"32\" rx=\"8\" fill=\"#2D6A4F\"/>\n  <path d=\"M16 8v16M8 16h16\" stroke=\"white\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n</svg>\n",
  "src/main.jsx": "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './styles/globals.css';\nimport { useUIStore } from './store';\n\n// Apply saved theme on load\nconst theme = useUIStore.getState().theme || 'light';\ndocument.documentElement.setAttribute('data-theme', theme);\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n",
  "src/App.jsx": "import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';\nimport { Toaster } from 'react-hot-toast';\nimport { AnimatePresence } from 'framer-motion';\n\nimport { useAuthStore } from './store';\nimport Navbar from './components/layout/Navbar';\nimport Footer from './components/layout/Footer';\n\nimport HomePage from './pages/HomePage';\nimport { LoginPage, RegisterPage, ResetPasswordPage } from './pages/AuthPage';\nimport { DoctorsPage, DoctorProfilePage } from './pages/DoctorsPage';\nimport ChatPage from './pages/ChatPage';\nimport AIPage from './pages/AIPage';\nimport AdminPage from './pages/AdminPage';\nimport DashboardPage from './pages/DashboardPage';\n\n// ── Protected Route ──────────────────────────────────────────────────────────\nfunction Protected({ children, roles }) {\n  const { isAuthenticated, user } = useAuthStore();\n  const location = useLocation();\n\n  if (!isAuthenticated) {\n    return <Navigate to=\"/login\" state={{ from: location }} replace />;\n  }\n  if (roles && !roles.includes(user?.role)) {\n    return <Navigate to=\"/dashboard\" replace />;\n  }\n  return children;\n}\n\n// ── Guest Only Route (redirect if logged in) ─────────────────────────────────\nfunction GuestOnly({ children }) {\n  const { isAuthenticated } = useAuthStore();\n  if (isAuthenticated) return <Navigate to=\"/dashboard\" replace />;\n  return children;\n}\n\n// ── Layout wrapper ───────────────────────────────────────────────────────────\nconst NO_FOOTER_ROUTES = ['/chat', '/ai'];\n\nfunction Layout({ children }) {\n  const location = useLocation();\n  const noFooter = NO_FOOTER_ROUTES.some(r => location.pathname.startsWith(r));\n\n  return (\n    <>\n      <Navbar />\n      <main style={{ flex: 1 }}>\n        {children}\n      </main>\n      {!noFooter && <Footer />}\n    </>\n  );\n}\n\n// ── App ──────────────────────────────────────────────────────────────────────\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Toaster\n        position=\"top-right\"\n        toastOptions={{\n          duration: 3500,\n          style: {\n            fontFamily: 'var(--font-body)',\n            fontSize: '14px',\n            borderRadius: '12px',\n            background: 'var(--color-surface)',\n            color: 'var(--color-text-primary)',\n            border: '1px solid var(--color-border)',\n            boxShadow: 'var(--shadow-lg)',\n          },\n          success: { iconTheme: { primary: 'var(--color-success)', secondary: 'white' } },\n          error: { iconTheme: { primary: 'var(--color-error)', secondary: 'white' } },\n        }}\n      />\n      <Layout>\n        <Routes>\n          {/* Public */}\n          <Route path=\"/\" element={<HomePage />} />\n          <Route path=\"/doctors\" element={<DoctorsPage />} />\n          <Route path=\"/doctors/:id\" element={<DoctorProfilePage />} />\n          <Route path=\"/ai\" element={<AIPage />} />\n\n          {/* Guest only */}\n          <Route path=\"/login\" element={<GuestOnly><LoginPage /></GuestOnly>} />\n          <Route path=\"/register\" element={<GuestOnly><RegisterPage /></GuestOnly>} />\n          <Route path=\"/reset-password\" element={<GuestOnly><ResetPasswordPage /></GuestOnly>} />\n\n          {/* Protected */}\n          <Route path=\"/dashboard\" element={<Protected><DashboardPage /></Protected>} />\n          <Route path=\"/chat\" element={<Protected><ChatPage /></Protected>} />\n\n          {/* Admin only */}\n          <Route path=\"/admin\" element={<Protected roles={['admin']}><AdminPage /></Protected>} />\n\n          {/* 404 fallback */}\n          <Route path=\"*\" element={<Navigate to=\"/\" replace />} />\n        </Routes>\n      </Layout>\n    </BrowserRouter>\n  );\n}\n",
  "src/store.js": "import { create } from 'zustand';\nimport { persist } from 'zustand/middleware';\n\n// ─── Auth Store ───────────────────────────────────────────────────────────────\nexport const useAuthStore = create(\n  persist(\n    (set, get) => ({\n      user: null,\n      token: null,\n      isAuthenticated: false,\n      isLoading: false,\n\n      setUser: (user) => set({ user, isAuthenticated: !!user }),\n      setToken: (token) => set({ token }),\n      login: (user, token) => set({ user, token, isAuthenticated: true }),\n      logout: () => set({ user: null, token: null, isAuthenticated: false }),\n      updateUser: (updates) => set((state) => ({\n        user: state.user ? { ...state.user, ...updates } : null\n      })),\n      setLoading: (isLoading) => set({ isLoading }),\n    }),\n    {\n      name: 'healzy-auth',\n      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),\n    }\n  )\n);\n\n// ─── UI Store ─────────────────────────────────────────────────────────────────\nexport const useUIStore = create(\n  persist(\n    (set) => ({\n      theme: 'light',\n      language: 'en',\n      sidebarOpen: false,\n      notifications: [],\n\n      setTheme: (theme) => {\n        set({ theme });\n        document.documentElement.setAttribute('data-theme', theme);\n      },\n      toggleTheme: () => set((state) => {\n        const newTheme = state.theme === 'light' ? 'dark' : 'light';\n        document.documentElement.setAttribute('data-theme', newTheme);\n        return { theme: newTheme };\n      }),\n      setLanguage: (language) => set({ language }),\n      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),\n      addNotification: (notification) => set((state) => ({\n        notifications: [...state.notifications, { id: Date.now(), ...notification }]\n      })),\n      removeNotification: (id) => set((state) => ({\n        notifications: state.notifications.filter(n => n.id !== id)\n      })),\n    }),\n    {\n      name: 'healzy-ui',\n      partialize: (state) => ({ theme: state.theme, language: state.language }),\n    }\n  )\n);\n\n// ─── Chat Store ───────────────────────────────────────────────────────────────\nexport const useChatStore = create((set, get) => ({\n  conversations: [],\n  activeConversationId: null,\n  messages: {},\n  onlineUsers: new Set(),\n  typingUsers: {},\n  wsConnection: null,\n\n  setConversations: (conversations) => set({ conversations }),\n  setActiveConversation: (id) => set({ activeConversationId: id }),\n  addMessage: (conversationId, message) => set((state) => ({\n    messages: {\n      ...state.messages,\n      [conversationId]: [...(state.messages[conversationId] || []), message]\n    }\n  })),\n  setMessages: (conversationId, messages) => set((state) => ({\n    messages: { ...state.messages, [conversationId]: messages }\n  })),\n  setUserOnline: (userId, online) => set((state) => {\n    const onlineUsers = new Set(state.onlineUsers);\n    if (online) onlineUsers.add(userId);\n    else onlineUsers.delete(userId);\n    return { onlineUsers };\n  }),\n  setTyping: (conversationId, userId, isTyping) => set((state) => ({\n    typingUsers: {\n      ...state.typingUsers,\n      [conversationId]: isTyping\n        ? { ...state.typingUsers[conversationId], [userId]: true }\n        : Object.fromEntries(\n            Object.entries(state.typingUsers[conversationId] || {}).filter(([k]) => k !== String(userId))\n          )\n    }\n  })),\n  setWsConnection: (ws) => set({ wsConnection: ws }),\n  updateConversationLastMessage: (conversationId, message) => set((state) => ({\n    conversations: state.conversations.map(c =>\n      c.id === conversationId ? { ...c, lastMessage: message, updatedAt: new Date().toISOString() } : c\n    )\n  })),\n}));\n\n// ─── AI Store ─────────────────────────────────────────────────────────────────\nexport const useAIStore = create(\n  persist(\n    (set, get) => ({\n      dialogues: [],\n      activeDialogueId: null,\n      isLoading: false,\n\n      setDialogues: (dialogues) => set({ dialogues }),\n      setActiveDialogue: (id) => set({ activeDialogueId: id }),\n      addMessage: (dialogueId, message) => set((state) => ({\n        dialogues: state.dialogues.map(d =>\n          d.id === dialogueId\n            ? { ...d, messages: [...(d.messages || []), message] }\n            : d\n        )\n      })),\n      createDialogue: (dialogue) => set((state) => ({\n        dialogues: [dialogue, ...state.dialogues],\n        activeDialogueId: dialogue.id,\n      })),\n      setLoading: (isLoading) => set({ isLoading }),\n    }),\n    {\n      name: 'healzy-ai',\n      partialize: (state) => ({ dialogues: state.dialogues.slice(0, 20), activeDialogueId: state.activeDialogueId }),\n    }\n  )\n);\n",
  "src/api.js": "import axios from 'axios';\nimport { useAuthStore } from './store';\n\nconst API_BASE = '/api';\n\nconst api = axios.create({\n  baseURL: API_BASE,\n  withCredentials: true,\n});\n\n// CSRF token handling\nlet csrfToken = null;\n\nconst getCSRFToken = () => {\n  const match = document.cookie.match('(^|;)\\\\s*csrftoken\\\\s*=\\\\s*([^;]+)');\n  return match ? match.pop() : '';\n};\n\n// Request interceptor — attach auth token + CSRF\napi.interceptors.request.use((config) => {\n  const token = useAuthStore.getState().token;\n  if (token) {\n    config.headers.Authorization = `Token ${token}`;\n  }\n  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {\n    config.headers['X-CSRFToken'] = getCSRFToken();\n  }\n  return config;\n});\n\n// Response interceptor — handle 401\napi.interceptors.response.use(\n  (response) => response,\n  (error) => {\n    if (error.response?.status === 401) {\n      useAuthStore.getState().logout();\n      window.location.href = '/login';\n    }\n    return Promise.reject(error);\n  }\n);\n\n// ─── Auth ─────────────────────────────────────────────────────────────────────\nexport const authAPI = {\n  getCSRF: () => api.get('/auth/csrf/'),\n  login: (data) => api.post('/auth/login/', data),\n  register: (data) => api.post('/auth/register/', data),\n  logout: () => api.post('/auth/logout/'),\n  googleAuth: (token) => api.post('/auth/google-auth/', { token }),\n  getProfile: () => api.get('/auth/profile/'),\n  updateProfile: (data) => api.patch('/auth/profile/', data),\n  changePassword: (data) => api.post('/auth/change-password/', data),\n  resetPasswordRequest: (email) => api.post('/auth/password-reset/', { email }),\n  resetPasswordConfirm: (data) => api.post('/auth/password-reset/confirm/', data),\n  uploadAvatar: (formData) => api.post('/auth/avatar/', formData, {\n    headers: { 'Content-Type': 'multipart/form-data' }\n  }),\n};\n\n// ─── Doctors ──────────────────────────────────────────────────────────────────\nexport const doctorsAPI = {\n  search: (params) => api.get('/doctors/', { params }),\n  getById: (id) => api.get(`/doctors/${id}/`),\n  getProfile: () => api.get('/doctors/my-profile/'),\n  submitApplication: (formData) => api.post('/doctors/apply/', formData, {\n    headers: { 'Content-Type': 'multipart/form-data' }\n  }),\n  updateProfile: (data) => api.patch('/doctors/my-profile/', data),\n  getSpecialties: () => api.get('/doctors/specialties/'),\n  getReviews: (doctorId) => api.get(`/doctors/${doctorId}/reviews/`),\n  submitReview: (doctorId, data) => api.post(`/doctors/${doctorId}/reviews/`, data),\n  getFeatured: () => api.get('/doctors/featured/'),\n};\n\n// ─── Consultations / Chat ─────────────────────────────────────────────────────\nexport const chatAPI = {\n  getConversations: () => api.get('/chat/conversations/'),\n  getMessages: (conversationId, page = 1) =>\n    api.get(`/chat/conversations/${conversationId}/messages/`, { params: { page } }),\n  startConsultation: (doctorId) => api.post('/chat/start/', { doctor_id: doctorId }),\n  endConsultation: (conversationId) => api.post(`/chat/conversations/${conversationId}/end/`),\n  uploadFile: (conversationId, formData) =>\n    api.post(`/chat/conversations/${conversationId}/upload/`, formData, {\n      headers: { 'Content-Type': 'multipart/form-data' }\n    }),\n  getConsultationHistory: () => api.get('/chat/history/'),\n};\n\n// ─── AI ───────────────────────────────────────────────────────────────────────\nexport const aiAPI = {\n  getDialogues: () => api.get('/ai/dialogues/'),\n  createDialogue: () => api.post('/ai/dialogues/'),\n  getMessages: (dialogueId) => api.get(`/ai/dialogues/${dialogueId}/messages/`),\n  sendMessage: (dialogueId, data) => api.post(`/ai/dialogues/${dialogueId}/messages/`, data),\n  sendMessageWithImage: (dialogueId, formData) =>\n    api.post(`/ai/dialogues/${dialogueId}/messages/`, formData, {\n      headers: { 'Content-Type': 'multipart/form-data' }\n    }),\n  deleteDialogue: (dialogueId) => api.delete(`/ai/dialogues/${dialogueId}/`),\n};\n\n// ─── Admin ────────────────────────────────────────────────────────────────────\nexport const adminAPI = {\n  getStats: () => api.get('/admin/stats/'),\n  getDoctorApplications: (status) => api.get('/admin/doctor-applications/', { params: { status } }),\n  approveDoctor: (id) => api.post(`/admin/doctor-applications/${id}/approve/`),\n  rejectDoctor: (id, reason) => api.post(`/admin/doctor-applications/${id}/reject/`, { reason }),\n  getUsers: (params) => api.get('/admin/users/', { params }),\n  banUser: (id) => api.post(`/admin/users/${id}/ban/`),\n  unbanUser: (id) => api.post(`/admin/users/${id}/unban/`),\n  makeAdmin: (id) => api.post(`/admin/users/${id}/make-admin/`),\n  getConsultations: (params) => api.get('/admin/consultations/', { params }),\n};\n\n// ─── WebSocket Factory ─────────────────────────────────────────────────────────\nexport const createChatWebSocket = (conversationId, token) => {\n  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';\n  const host = window.location.host;\n  return new WebSocket(`${protocol}//${host}/ws/chat/${conversationId}/?token=${token}`);\n};\n\nexport default api;\n",
  "src/services.js": "// This is the single import point for all API calls.\n// Set USE_MOCK = false in mockData.js to switch to the live Django backend.\n\nimport {\n  USE_MOCK,\n  mockAuthAPI, mockDoctorsAPI, mockChatAPI, mockAdminAPI,\n} from './mockData';\nimport { authAPI, doctorsAPI, chatAPI, adminAPI, aiAPI } from './api';\n\nexport const Auth   = USE_MOCK ? mockAuthAPI   : authAPI;\nexport const Doctors = USE_MOCK ? mockDoctorsAPI : doctorsAPI;\nexport const Chat   = USE_MOCK ? mockChatAPI   : chatAPI;\nexport const Admin  = USE_MOCK ? mockAdminAPI  : adminAPI;\nexport const AI     = aiAPI; // AI always hits real Gemini via your backend\n",
  "src/mockData.js": "// ─── Mock Data Layer ──────────────────────────────────────────────────────────\n// All API calls check USE_MOCK first. To go live, set USE_MOCK = false\n// and ensure your Django backend is running at /api/*\n\nexport const USE_MOCK = true;\nexport const MOCK_DELAY = 600; // ms — simulates network latency\n\nconst delay = (ms = MOCK_DELAY) => new Promise(r => setTimeout(r, ms));\n\n// ─── Mock Users ───────────────────────────────────────────────────────────────\nexport const MOCK_USERS = {\n  patient: {\n    id: 1,\n    email: 'patient@healzy.uz',\n    firstName: 'Amir',\n    lastName: 'Karimov',\n    role: 'patient',\n    avatar: null,\n    phone: '+998 90 123 45 67',\n    dateOfBirth: '1992-05-15',\n    createdAt: '2024-01-10T10:00:00Z',\n  },\n  doctor: {\n    id: 2,\n    email: 'doctor@healzy.uz',\n    firstName: 'Dilnoza',\n    lastName: 'Yusupova',\n    role: 'doctor',\n    avatar: null,\n    phone: '+998 91 234 56 78',\n    createdAt: '2024-01-05T09:00:00Z',\n  },\n  admin: {\n    id: 3,\n    email: 'admin@healzy.uz',\n    firstName: 'Admin',\n    lastName: 'Healzy',\n    role: 'admin',\n    avatar: null,\n    createdAt: '2024-01-01T00:00:00Z',\n  },\n};\n\n// ─── Mock Doctors ─────────────────────────────────────────────────────────────\nexport const MOCK_DOCTORS = [\n  {\n    id: 1,\n    userId: 2,\n    firstName: 'Dilnoza',\n    lastName: 'Yusupova',\n    specialty: 'Cardiologist',\n    specialtyRu: 'Кардиолог',\n    specialtyUz: 'Kardiolog',\n    experience: 12,\n    rating: 4.9,\n    reviewCount: 234,\n    consultationCount: 1847,\n    bio: 'Board-certified cardiologist with 12 years of experience in treating heart conditions. Specializes in preventive cardiology and heart failure management.',\n    bioRu: 'Сертифицированный кардиолог с 12-летним опытом лечения сердечных заболеваний. Специализируется на профилактической кардиологии.',\n    bioUz: '12 yillik tajribaga ega sertifikatlangan kardiolog. Profilaktik kardiologiya va yurak yetishmovchiligini davolashga ixtisoslashgan.',\n    education: 'Tashkent Medical Academy, MD — 2010\\nResidency: National Cardiology Center — 2014',\n    languages: ['Uzbek', 'Russian', 'English'],\n    workingHours: 'Mon–Fri: 9:00–18:00',\n    isAvailable: true,\n    isVerified: true,\n    avatar: null,\n    price: 150000,\n    documents: ['diploma.pdf', 'license.pdf'],\n  },\n  {\n    id: 2,\n    userId: 10,\n    firstName: 'Bobur',\n    lastName: 'Toshmatov',\n    specialty: 'Neurologist',\n    specialtyRu: 'Невролог',\n    specialtyUz: 'Nevrolog',\n    experience: 8,\n    rating: 4.7,\n    reviewCount: 156,\n    consultationCount: 982,\n    bio: 'Neurologist specializing in headaches, epilepsy, and stroke management. Provides compassionate, evidence-based care.',\n    bioRu: 'Невролог, специализирующийся на головных болях, эпилепсии и лечении инсульта.',\n    bioUz: 'Bosh og\\'riq, epilepsiya va insult davolashga ixtisoslashgan nevrolog.',\n    education: 'Samarkand State Medical University — 2014\\nFellowship: Russian Neurology Institute — 2016',\n    languages: ['Uzbek', 'Russian'],\n    workingHours: 'Mon–Sat: 10:00–17:00',\n    isAvailable: true,\n    isVerified: true,\n    avatar: null,\n    price: 120000,\n    documents: ['diploma.pdf'],\n  },\n  {\n    id: 3,\n    userId: 11,\n    firstName: 'Malika',\n    lastName: 'Rashidova',\n    specialty: 'Pediatrician',\n    specialtyRu: 'Педиатр',\n    specialtyUz: 'Pediatr',\n    experience: 15,\n    rating: 4.95,\n    reviewCount: 412,\n    consultationCount: 3200,\n    bio: 'Dedicated pediatrician with 15 years caring for children from newborns to adolescents. Expert in developmental pediatrics.',\n    bioRu: 'Педиатр с 15-летним опытом ухода за детьми от новорождённых до подростков.',\n    bioUz: '15 yillik tajribaga ega bolalar shifokori. Yangi tug\\'ilganlardan o\\'spirinlargacha bo\\'lgan bolalarga g\\'amxo\\'rlik qiladi.',\n    education: 'Tashkent Pediatric Medical Institute — 2008',\n    languages: ['Uzbek', 'Russian', 'English'],\n    workingHours: 'Mon–Fri: 8:00–16:00',\n    isAvailable: false,\n    isVerified: true,\n    avatar: null,\n    price: 100000,\n    documents: ['diploma.pdf', 'license.pdf', 'certificate.pdf'],\n  },\n  {\n    id: 4,\n    userId: 12,\n    firstName: 'Jasur',\n    lastName: 'Mirzoev',\n    specialty: 'Dermatologist',\n    specialtyRu: 'Дерматолог',\n    specialtyUz: 'Dermatolog',\n    experience: 6,\n    rating: 4.6,\n    reviewCount: 89,\n    consultationCount: 540,\n    bio: 'Dermatologist specializing in acne, psoriasis, and cosmetic dermatology. Passionate about skin health education.',\n    bioRu: 'Дерматолог, специализирующийся на акне, псориазе и косметической дерматологии.',\n    bioUz: 'Akne, psoriaz va kosmetik dermatologiyaga ixtisoslashgan dermatolог.',\n    education: 'Andijan State Medical Institute — 2017',\n    languages: ['Uzbek', 'Russian'],\n    workingHours: 'Tue–Sat: 11:00–19:00',\n    isAvailable: true,\n    isVerified: true,\n    avatar: null,\n    price: 90000,\n    documents: ['diploma.pdf'],\n  },\n  {\n    id: 5,\n    userId: 13,\n    firstName: 'Nargiza',\n    lastName: 'Abdullayeva',\n    specialty: 'Gynecologist',\n    specialtyRu: 'Гинеколог',\n    specialtyUz: 'Ginekolog',\n    experience: 20,\n    rating: 4.92,\n    reviewCount: 567,\n    consultationCount: 4100,\n    bio: 'Experienced gynecologist specializing in women\\'s reproductive health, prenatal care, and menopause management.',\n    bioRu: 'Опытный гинеколог, специализирующийся на репродуктивном здоровье женщин.',\n    bioUz: 'Tajribali ginekolog. Ayollar reproduktiv sog\\'lig\\'i, prenatal parvarishga ixtisoslashgan.',\n    education: 'Tashkent Medical Academy — 2003\\nAdvanced Fellowship: Istanbul — 2007',\n    languages: ['Uzbek', 'Russian', 'Turkish'],\n    workingHours: 'Mon–Fri: 9:00–17:00',\n    isAvailable: true,\n    isVerified: true,\n    avatar: null,\n    price: 130000,\n    documents: ['diploma.pdf', 'license.pdf'],\n  },\n  {\n    id: 6,\n    userId: 14,\n    firstName: 'Otabek',\n    lastName: 'Xolmatov',\n    specialty: 'General Practitioner',\n    specialtyRu: 'Терапевт',\n    specialtyUz: 'Umumiy amaliyot',\n    experience: 4,\n    rating: 4.5,\n    reviewCount: 43,\n    consultationCount: 280,\n    bio: 'General practitioner focused on preventive medicine, chronic disease management, and patient education.',\n    bioRu: 'Терапевт, ориентированный на профилактику заболеваний и ведение хронических болезней.',\n    bioUz: 'Profilaktik tibbiyot va surunkali kasalliklarni boshqarishga yo\\'naltirilgan umumiy amaliyot shifokori.',\n    education: 'Fergana Medical Institute — 2019',\n    languages: ['Uzbek', 'Russian'],\n    workingHours: 'Mon–Sat: 8:00–20:00',\n    isAvailable: true,\n    isVerified: true,\n    avatar: null,\n    price: 80000,\n    documents: ['diploma.pdf'],\n  },\n];\n\n// ─── Mock Reviews ─────────────────────────────────────────────────────────────\nexport const MOCK_REVIEWS = {\n  1: [\n    { id: 1, patientName: 'Amir K.', rating: 5, comment: 'Excellent doctor! Very thorough and explained everything clearly.', date: '2025-01-15' },\n    { id: 2, patientName: 'Zulfiya M.', rating: 5, comment: 'Отличный врач, очень внимательный и профессиональный.', date: '2025-01-10' },\n    { id: 3, patientName: 'Sardor T.', rating: 4, comment: 'Professional and knowledgeable. Highly recommend.', date: '2024-12-28' },\n  ],\n  2: [\n    { id: 4, patientName: 'Lola B.', rating: 5, comment: 'Helped me understand my condition clearly. Very patient doctor.', date: '2025-01-12' },\n    { id: 5, patientName: 'Mansur R.', rating: 4, comment: 'Хороший специалист, быстро разобрался с моей проблемой.', date: '2024-12-30' },\n  ],\n};\n\n// ─── Mock Conversations ───────────────────────────────────────────────────────\nexport const MOCK_CONVERSATIONS = [\n  {\n    id: 1,\n    doctor: MOCK_DOCTORS[0],\n    patient: MOCK_USERS.patient,\n    status: 'active',\n    lastMessage: { text: 'How are you feeling today?', sentAt: '2025-01-20T14:30:00Z', senderId: 2 },\n    unreadCount: 1,\n    createdAt: '2025-01-18T10:00:00Z',\n  },\n  {\n    id: 2,\n    doctor: MOCK_DOCTORS[2],\n    patient: MOCK_USERS.patient,\n    status: 'ended',\n    lastMessage: { text: 'Thank you, feel much better now!', sentAt: '2025-01-15T16:00:00Z', senderId: 1 },\n    unreadCount: 0,\n    createdAt: '2025-01-14T09:00:00Z',\n  },\n];\n\nexport const MOCK_MESSAGES = {\n  1: [\n    { id: 1, conversationId: 1, senderId: 2, text: 'Hello! I reviewed your information. What are your main symptoms?', type: 'text', sentAt: '2025-01-20T10:00:00Z' },\n    { id: 2, conversationId: 1, senderId: 1, text: \"I've been having chest pain and shortness of breath for 3 days.\", type: 'text', sentAt: '2025-01-20T10:02:00Z' },\n    { id: 3, conversationId: 1, senderId: 2, text: 'I see. Is the chest pain sharp or dull? Does it radiate anywhere?', type: 'text', sentAt: '2025-01-20T10:03:00Z' },\n    { id: 4, conversationId: 1, senderId: 1, text: \"It's dull and sometimes I feel it in my left arm too.\", type: 'text', sentAt: '2025-01-20T10:05:00Z' },\n    { id: 5, conversationId: 1, senderId: 2, text: 'Those are symptoms we should take seriously. I recommend you get an ECG done as soon as possible. I can write you a referral.', type: 'text', sentAt: '2025-01-20T10:07:00Z' },\n    { id: 6, conversationId: 1, senderId: 1, text: 'Thank you doctor. Should I go to the emergency room?', type: 'text', sentAt: '2025-01-20T14:28:00Z' },\n    { id: 7, conversationId: 1, senderId: 2, text: 'How are you feeling today?', type: 'text', sentAt: '2025-01-20T14:30:00Z' },\n  ],\n};\n\n// ─── Mock Admin Stats ─────────────────────────────────────────────────────────\nexport const MOCK_ADMIN_STATS = {\n  totalUsers: 1247,\n  activeDoctors: 89,\n  pendingApplications: 7,\n  todayConsultations: 43,\n  totalConsultations: 8920,\n  revenueThisMonth: 45600000,\n  newUsersThisWeek: 134,\n};\n\nexport const MOCK_DOCTOR_APPLICATIONS = [\n  {\n    id: 1,\n    user: { firstName: 'Kamol', lastName: 'Nazarov', email: 'kamol@example.com' },\n    specialty: 'Orthopedist',\n    experience: 9,\n    education: 'Tashkent Medical Academy, 2014',\n    status: 'pending',\n    appliedAt: '2025-01-19T11:00:00Z',\n    documents: ['diploma.pdf', 'license.pdf'],\n  },\n  {\n    id: 2,\n    user: { firstName: 'Gulnora', lastName: 'Saidova', email: 'gulnora@example.com' },\n    specialty: 'Psychiatrist',\n    experience: 11,\n    education: 'Samarkand Medical University, 2012',\n    status: 'pending',\n    appliedAt: '2025-01-18T09:30:00Z',\n    documents: ['diploma.pdf'],\n  },\n  {\n    id: 3,\n    user: { firstName: 'Timur', lastName: 'Ergashev', email: 'timur@example.com' },\n    specialty: 'Ophthalmologist',\n    experience: 5,\n    education: 'Andijan State Medical Institute, 2018',\n    status: 'approved',\n    appliedAt: '2025-01-10T14:00:00Z',\n    documents: ['diploma.pdf', 'certificate.pdf'],\n  },\n  {\n    id: 4,\n    user: { firstName: 'Feruza', lastName: 'Mirzayeva', email: 'feruza@example.com' },\n    specialty: 'Endocrinologist',\n    experience: 3,\n    education: 'Tashkent Pediatric Medical Institute, 2020',\n    status: 'rejected',\n    appliedAt: '2025-01-05T10:00:00Z',\n    documents: ['diploma.pdf'],\n  },\n];\n\nexport const MOCK_ALL_USERS = [\n  { id: 1, firstName: 'Amir', lastName: 'Karimov', email: 'amir@example.com', role: 'patient', status: 'active', joinedAt: '2024-11-10' },\n  { id: 2, firstName: 'Dilnoza', lastName: 'Yusupova', email: 'dilnoza@example.com', role: 'doctor', status: 'active', joinedAt: '2024-10-05' },\n  { id: 4, firstName: 'Sardor', lastName: 'Toshev', email: 'sardor@example.com', role: 'patient', status: 'active', joinedAt: '2024-12-01' },\n  { id: 5, firstName: 'Zulfiya', lastName: 'Hamidova', email: 'zulfiya@example.com', role: 'patient', status: 'banned', joinedAt: '2024-09-15' },\n  { id: 6, firstName: 'Nodir', lastName: 'Alimov', email: 'nodir@example.com', role: 'doctor', status: 'active', joinedAt: '2024-08-20' },\n];\n\n// ─── Mock API Functions ────────────────────────────────────────────────────────\nexport const mockAuthAPI = {\n  getCSRF: async () => ({ data: {} }),\n\n  login: async ({ email, password }) => {\n    await delay();\n    const user = Object.values(MOCK_USERS).find(u => u.email === email);\n    if (!user || password !== 'password123') {\n      throw { response: { data: { error: 'Invalid credentials' }, status: 400 } };\n    }\n    return { data: { user, token: 'mock-token-' + user.id } };\n  },\n\n  register: async (data) => {\n    await delay();\n    const newUser = {\n      id: Date.now(),\n      email: data.email,\n      firstName: data.firstName,\n      lastName: data.lastName,\n      role: data.role || 'patient',\n      avatar: null,\n      createdAt: new Date().toISOString(),\n    };\n    return { data: { user: newUser, token: 'mock-token-' + newUser.id } };\n  },\n\n  logout: async () => { await delay(200); return { data: {} }; },\n\n  googleAuth: async (token) => {\n    await delay();\n    return { data: { user: MOCK_USERS.patient, token: 'mock-google-token' } };\n  },\n\n  getProfile: async () => {\n    await delay(300);\n    return { data: MOCK_USERS.patient };\n  },\n\n  updateProfile: async (data) => {\n    await delay();\n    return { data: { ...MOCK_USERS.patient, ...data } };\n  },\n\n  resetPasswordRequest: async (email) => {\n    await delay();\n    return { data: { message: 'Reset link sent' } };\n  },\n};\n\nexport const mockDoctorsAPI = {\n  search: async (params = {}) => {\n    await delay();\n    let doctors = [...MOCK_DOCTORS];\n    if (params.search) {\n      const q = params.search.toLowerCase();\n      doctors = doctors.filter(d =>\n        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||\n        d.specialty.toLowerCase().includes(q)\n      );\n    }\n    if (params.specialty) {\n      doctors = doctors.filter(d => d.specialty === params.specialty);\n    }\n    if (params.available) {\n      doctors = doctors.filter(d => d.isAvailable);\n    }\n    if (params.sort === 'rating') doctors.sort((a, b) => b.rating - a.rating);\n    if (params.sort === 'experience') doctors.sort((a, b) => b.experience - a.experience);\n    if (params.sort === 'consultations') doctors.sort((a, b) => b.consultationCount - a.consultationCount);\n    return { data: { results: doctors, count: doctors.length } };\n  },\n\n  getById: async (id) => {\n    await delay();\n    const doctor = MOCK_DOCTORS.find(d => d.id === Number(id));\n    if (!doctor) throw { response: { status: 404 } };\n    return { data: doctor };\n  },\n\n  getReviews: async (doctorId) => {\n    await delay(400);\n    return { data: { results: MOCK_REVIEWS[doctorId] || [] } };\n  },\n\n  getFeatured: async () => {\n    await delay();\n    return { data: MOCK_DOCTORS.slice(0, 3) };\n  },\n\n  submitApplication: async (data) => {\n    await delay(1200);\n    return { data: { id: Date.now(), status: 'pending' } };\n  },\n};\n\nexport const mockChatAPI = {\n  getConversations: async () => {\n    await delay();\n    return { data: MOCK_CONVERSATIONS };\n  },\n\n  getMessages: async (conversationId) => {\n    await delay(400);\n    return { data: { results: MOCK_MESSAGES[conversationId] || [] } };\n  },\n\n  startConsultation: async (doctorId) => {\n    await delay();\n    const doctor = MOCK_DOCTORS.find(d => d.id === Number(doctorId));\n    const newConv = {\n      id: Date.now(),\n      doctor,\n      patient: MOCK_USERS.patient,\n      status: 'active',\n      lastMessage: null,\n      unreadCount: 0,\n      createdAt: new Date().toISOString(),\n    };\n    MOCK_CONVERSATIONS.unshift(newConv);\n    return { data: newConv };\n  },\n\n  endConsultation: async (conversationId) => {\n    await delay();\n    return { data: { status: 'ended' } };\n  },\n};\n\nexport const mockAdminAPI = {\n  getStats: async () => {\n    await delay(500);\n    return { data: MOCK_ADMIN_STATS };\n  },\n\n  getDoctorApplications: async (status) => {\n    await delay();\n    const apps = status && status !== 'all'\n      ? MOCK_DOCTOR_APPLICATIONS.filter(a => a.status === status)\n      : MOCK_DOCTOR_APPLICATIONS;\n    return { data: apps };\n  },\n\n  approveDoctor: async (id) => {\n    await delay();\n    const app = MOCK_DOCTOR_APPLICATIONS.find(a => a.id === Number(id));\n    if (app) app.status = 'approved';\n    return { data: { status: 'approved' } };\n  },\n\n  rejectDoctor: async (id) => {\n    await delay();\n    const app = MOCK_DOCTOR_APPLICATIONS.find(a => a.id === Number(id));\n    if (app) app.status = 'rejected';\n    return { data: { status: 'rejected' } };\n  },\n\n  getUsers: async () => {\n    await delay();\n    return { data: { results: MOCK_ALL_USERS } };\n  },\n\n  banUser: async (id) => {\n    await delay();\n    const user = MOCK_ALL_USERS.find(u => u.id === Number(id));\n    if (user) user.status = 'banned';\n    return { data: {} };\n  },\n\n  unbanUser: async (id) => {\n    await delay();\n    const user = MOCK_ALL_USERS.find(u => u.id === Number(id));\n    if (user) user.status = 'active';\n    return { data: {} };\n  },\n};\n",
  "src/i18n/translations.js": "export const translations = {\n  en: {\n    // Nav\n    nav: {\n      home: 'Home',\n      doctors: 'Find Doctors',\n      aiAssistant: 'AI Assistant',\n      consultations: 'My Consultations',\n      dashboard: 'Dashboard',\n      admin: 'Admin Panel',\n      login: 'Sign In',\n      register: 'Sign Up',\n      logout: 'Sign Out',\n      profile: 'My Profile',\n      becomeDoctor: 'Become a Doctor',\n    },\n    // Home\n    home: {\n      hero: {\n        badge: 'Trusted by 10,000+ patients',\n        title: 'Your Health,\\nOur Priority',\n        subtitle: 'Connect with certified doctors online. Get expert medical advice, real-time consultations, and AI-powered diagnostics — all in one place.',\n        cta: 'Find a Doctor',\n        ctaSecondary: 'Try AI Diagnosis',\n        stats: {\n          doctors: 'Verified Doctors',\n          consultations: 'Consultations',\n          satisfaction: 'Satisfaction Rate',\n          available: 'Available 24/7',\n        }\n      },\n      features: {\n        title: 'Why Choose Healzy?',\n        subtitle: 'Everything you need for your health in one modern platform',\n        chat: { title: 'Real-time Consultations', desc: 'Instant messaging with your doctor. No waiting rooms, no delays.' },\n        ai: { title: 'AI Health Assistant', desc: 'Voice and text-powered AI diagnostics using the latest Gemini models.' },\n        secure: { title: 'Private & Secure', desc: 'End-to-end encrypted communications. Your health data stays yours.' },\n        search: { title: 'Find Specialists', desc: 'Search by specialty, experience, rating, and availability.' },\n      },\n      howItWorks: {\n        title: 'How It Works',\n        steps: [\n          { title: 'Create Account', desc: 'Sign up in under a minute with email or Google' },\n          { title: 'Find Your Doctor', desc: 'Search by specialty, read reviews, check availability' },\n          { title: 'Start Consultation', desc: 'Chat in real-time, share files, get prescriptions' },\n          { title: 'Stay Healthy', desc: 'Track your history, follow-ups, and health journey' },\n        ]\n      },\n      topDoctors: {\n        title: 'Top Rated Doctors',\n        viewAll: 'View All Doctors',\n      },\n      cta: {\n        title: 'Ready to Take Control of Your Health?',\n        subtitle: 'Join thousands of patients who trust Healzy for their medical needs.',\n        button: 'Get Started Free',\n      }\n    },\n    // Auth\n    auth: {\n      login: {\n        title: 'Welcome Back',\n        subtitle: 'Sign in to your Healzy account',\n        email: 'Email Address',\n        password: 'Password',\n        forgotPassword: 'Forgot password?',\n        submit: 'Sign In',\n        noAccount: \"Don't have an account?\",\n        register: 'Create one',\n        orGoogle: 'Or continue with',\n        google: 'Google',\n      },\n      register: {\n        title: 'Join Healzy',\n        subtitle: 'Create your free account today',\n        firstName: 'First Name',\n        lastName: 'Last Name',\n        email: 'Email Address',\n        password: 'Password',\n        confirmPassword: 'Confirm Password',\n        role: 'I am a',\n        patient: 'Patient',\n        doctor: 'Doctor',\n        submit: 'Create Account',\n        hasAccount: 'Already have an account?',\n        login: 'Sign in',\n        terms: 'By creating an account, you agree to our Terms of Service and Privacy Policy.',\n      },\n      resetPassword: {\n        title: 'Reset Password',\n        subtitle: 'Enter your email to receive reset instructions',\n        email: 'Email Address',\n        submit: 'Send Reset Link',\n        back: 'Back to Sign In',\n        success: 'Reset link sent! Check your email.',\n      }\n    },\n    // Doctors\n    doctors: {\n      search: {\n        title: 'Find Your Doctor',\n        subtitle: 'Search from hundreds of verified specialists',\n        placeholder: 'Search by name or specialty...',\n        filterSpecialty: 'Specialty',\n        filterRating: 'Min Rating',\n        filterAvailable: 'Available Now',\n        sort: 'Sort by',\n        sortOptions: {\n          rating: 'Highest Rated',\n          experience: 'Most Experienced',\n          consultations: 'Most Consultations',\n          price: 'Price',\n        },\n        noResults: 'No doctors found. Try adjusting your filters.',\n        results: 'doctors found',\n      },\n      card: {\n        experience: 'years exp.',\n        consultations: 'consultations',\n        rating: 'rating',\n        bookNow: 'Book Consultation',\n        viewProfile: 'View Profile',\n        available: 'Available',\n        busy: 'Busy',\n      },\n      profile: {\n        about: 'About',\n        education: 'Education',\n        specializations: 'Specializations',\n        reviews: 'Patient Reviews',\n        startConsultation: 'Start Consultation',\n        sendMessage: 'Send Message',\n        experience: 'Experience',\n        yearsOfExperience: 'Years of Experience',\n        totalConsultations: 'Total Consultations',\n        averageRating: 'Average Rating',\n        languages: 'Languages',\n        workingHours: 'Working Hours',\n        documents: 'Verified Documents',\n      }\n    },\n    // Chat\n    chat: {\n      title: 'Consultations',\n      noConversation: 'Select a conversation to start chatting',\n      messagePlaceholder: 'Type your message...',\n      send: 'Send',\n      online: 'Online',\n      offline: 'Offline',\n      typing: 'typing...',\n      attachFile: 'Attach file',\n      today: 'Today',\n      yesterday: 'Yesterday',\n      newConsultation: 'New Consultation',\n      endConsultation: 'End Consultation',\n      consultationEnded: 'This consultation has ended.',\n      fileShared: 'File shared',\n      imageShared: 'Image shared',\n    },\n    // AI\n    ai: {\n      title: 'Healzy AI Assistant',\n      subtitle: 'Ask about symptoms, medications, or get health advice',\n      placeholder: 'Describe your symptoms or ask a health question...',\n      send: 'Send',\n      voiceStart: 'Start Voice Input',\n      voiceStop: 'Stop Recording',\n      clearHistory: 'Clear History',\n      disclaimer: 'AI responses are for informational purposes only and do not constitute medical advice. Always consult a qualified healthcare professional.',\n      thinking: 'Analyzing your query...',\n      uploadImage: 'Upload medical image',\n      newChat: 'New Chat',\n      history: 'Chat History',\n      suggestions: {\n        title: 'Quick suggestions',\n        items: [\n          'What are common cold symptoms?',\n          'How to manage high blood pressure?',\n          'When should I see a doctor for a headache?',\n          'What vitamins should I take daily?',\n        ]\n      },\n      errorMessage: 'Sorry, I encountered an error. Please try again.',\n    },\n    // Admin\n    admin: {\n      title: 'Admin Panel',\n      dashboard: 'Dashboard',\n      users: 'Users',\n      doctors: 'Doctor Applications',\n      consultations: 'Consultations',\n      stats: {\n        totalUsers: 'Total Users',\n        activeDoctors: 'Active Doctors',\n        pendingApps: 'Pending Applications',\n        todayConsultations: \"Today's Consultations\",\n      },\n      doctorApps: {\n        title: 'Doctor Applications',\n        pending: 'Pending',\n        approved: 'Approved',\n        rejected: 'Rejected',\n        approve: 'Approve',\n        reject: 'Reject',\n        viewDocs: 'View Documents',\n        appliedAt: 'Applied',\n        specialty: 'Specialty',\n        experience: 'Experience',\n        education: 'Education',\n      },\n      users: {\n        title: 'User Management',\n        name: 'Name',\n        email: 'Email',\n        role: 'Role',\n        status: 'Status',\n        joined: 'Joined',\n        actions: 'Actions',\n        ban: 'Ban User',\n        unban: 'Unban User',\n        makeAdmin: 'Make Admin',\n      }\n    },\n    // Patient Dashboard\n    patient: {\n      dashboard: {\n        title: 'My Health Dashboard',\n        welcome: 'Welcome back',\n        recentConsultations: 'Recent Consultations',\n        upcomingAppointments: 'Upcoming',\n        healthSummary: 'Health Summary',\n        findDoctor: 'Find a Doctor',\n        myDoctors: 'My Doctors',\n        aiHistory: 'AI Chat History',\n        noConsultations: 'No consultations yet. Find a doctor to get started.',\n      }\n    },\n    // Doctor Dashboard\n    doctorDashboard: {\n      title: 'Doctor Dashboard',\n      myPatients: 'My Patients',\n      pendingRequests: 'Pending Requests',\n      schedule: 'Schedule',\n      earnings: 'Earnings',\n      becomeDoctor: {\n        title: 'Complete Your Doctor Profile',\n        subtitle: 'Submit your credentials to start receiving patients',\n        specialty: 'Medical Specialty',\n        experience: 'Years of Experience',\n        education: 'Education & Certifications',\n        bio: 'Professional Bio',\n        documents: 'Upload Documents',\n        submit: 'Submit Application',\n        pending: 'Application Under Review',\n        pendingDesc: 'Your application is being reviewed by our team. This usually takes 1-2 business days.',\n      }\n    },\n    // Common\n    common: {\n      loading: 'Loading...',\n      error: 'Something went wrong',\n      retry: 'Try Again',\n      save: 'Save',\n      cancel: 'Cancel',\n      delete: 'Delete',\n      edit: 'Edit',\n      back: 'Back',\n      next: 'Next',\n      submit: 'Submit',\n      search: 'Search',\n      filter: 'Filter',\n      clear: 'Clear',\n      close: 'Close',\n      confirm: 'Confirm',\n      yes: 'Yes',\n      no: 'No',\n      or: 'or',\n      and: 'and',\n      required: 'Required',\n      optional: 'Optional',\n      darkMode: 'Dark Mode',\n      lightMode: 'Light Mode',\n      language: 'Language',\n      notifications: 'Notifications',\n      settings: 'Settings',\n      theme: 'Theme',\n    },\n    specialties: [\n      'General Practitioner', 'Cardiologist', 'Dermatologist', 'Neurologist',\n      'Pediatrician', 'Psychiatrist', 'Gynecologist', 'Orthopedist',\n      'Ophthalmologist', 'ENT Specialist', 'Endocrinologist', 'Gastroenterologist',\n      'Urologist', 'Pulmonologist', 'Rheumatologist', 'Oncologist',\n    ],\n  },\n\n  ru: {\n    nav: {\n      home: 'Главная',\n      doctors: 'Найти врача',\n      aiAssistant: 'ИИ Ассистент',\n      consultations: 'Мои консультации',\n      dashboard: 'Личный кабинет',\n      admin: 'Панель администратора',\n      login: 'Войти',\n      register: 'Регистрация',\n      logout: 'Выйти',\n      profile: 'Мой профиль',\n      becomeDoctor: 'Стать врачом',\n    },\n    home: {\n      hero: {\n        badge: 'Доверяют более 10 000 пациентов',\n        title: 'Ваше здоровье —\\nнаш приоритет',\n        subtitle: 'Консультируйтесь с сертифицированными врачами онлайн. Экспертные консультации, ИИ-диагностика и медицинская помощь — всё в одном месте.',\n        cta: 'Найти врача',\n        ctaSecondary: 'Попробовать ИИ',\n        stats: {\n          doctors: 'Проверенных врачей',\n          consultations: 'Консультаций',\n          satisfaction: 'Довольных пациентов',\n          available: 'Доступны 24/7',\n        }\n      },\n      features: {\n        title: 'Почему выбирают Healzy?',\n        subtitle: 'Всё необходимое для вашего здоровья на одной современной платформе',\n        chat: { title: 'Консультации в реальном времени', desc: 'Мгновенный чат с врачом. Без очередей и задержек.' },\n        ai: { title: 'ИИ Ассистент здоровья', desc: 'Голосовая и текстовая ИИ-диагностика на основе Gemini.' },\n        secure: { title: 'Конфиденциально и безопасно', desc: 'Сквозное шифрование. Ваши данные — только ваши.' },\n        search: { title: 'Найдите специалиста', desc: 'Поиск по специализации, опыту, рейтингу и доступности.' },\n      },\n      howItWorks: {\n        title: 'Как это работает',\n        steps: [\n          { title: 'Создайте аккаунт', desc: 'Регистрация за минуту через email или Google' },\n          { title: 'Найдите врача', desc: 'Поиск по специализации, отзывы, проверка доступности' },\n          { title: 'Начните консультацию', desc: 'Чат в реальном времени, файлы, рецепты' },\n          { title: 'Будьте здоровы', desc: 'История, повторные приёмы и ваш путь к здоровью' },\n        ]\n      },\n      topDoctors: {\n        title: 'Лучшие врачи',\n        viewAll: 'Все врачи',\n      },\n      cta: {\n        title: 'Готовы заботиться о своём здоровье?',\n        subtitle: 'Присоединяйтесь к тысячам пациентов, которые доверяют Healzy.',\n        button: 'Начать бесплатно',\n      }\n    },\n    auth: {\n      login: {\n        title: 'Добро пожаловать',\n        subtitle: 'Войдите в свой аккаунт Healzy',\n        email: 'Email',\n        password: 'Пароль',\n        forgotPassword: 'Забыли пароль?',\n        submit: 'Войти',\n        noAccount: 'Нет аккаунта?',\n        register: 'Зарегистрироваться',\n        orGoogle: 'Или войдите через',\n        google: 'Google',\n      },\n      register: {\n        title: 'Регистрация в Healzy',\n        subtitle: 'Создайте бесплатный аккаунт',\n        firstName: 'Имя',\n        lastName: 'Фамилия',\n        email: 'Email',\n        password: 'Пароль',\n        confirmPassword: 'Подтвердите пароль',\n        role: 'Я являюсь',\n        patient: 'Пациентом',\n        doctor: 'Врачом',\n        submit: 'Создать аккаунт',\n        hasAccount: 'Уже есть аккаунт?',\n        login: 'Войти',\n        terms: 'Создавая аккаунт, вы соглашаетесь с Условиями использования и Политикой конфиденциальности.',\n      },\n      resetPassword: {\n        title: 'Сброс пароля',\n        subtitle: 'Введите email для получения инструкций',\n        email: 'Email',\n        submit: 'Отправить ссылку',\n        back: 'Назад',\n        success: 'Ссылка отправлена! Проверьте почту.',\n      }\n    },\n    doctors: {\n      search: {\n        title: 'Найдите своего врача',\n        subtitle: 'Выберите из сотен проверенных специалистов',\n        placeholder: 'Поиск по имени или специализации...',\n        filterSpecialty: 'Специализация',\n        filterRating: 'Мин. рейтинг',\n        filterAvailable: 'Доступен сейчас',\n        sort: 'Сортировка',\n        sortOptions: {\n          rating: 'По рейтингу',\n          experience: 'По опыту',\n          consultations: 'По консультациям',\n          price: 'По цене',\n        },\n        noResults: 'Врачи не найдены. Измените фильтры.',\n        results: 'врачей найдено',\n      },\n      card: {\n        experience: 'лет опыта',\n        consultations: 'консультаций',\n        rating: 'рейтинг',\n        bookNow: 'Записаться',\n        viewProfile: 'Профиль',\n        available: 'Доступен',\n        busy: 'Занят',\n      },\n      profile: {\n        about: 'О враче',\n        education: 'Образование',\n        specializations: 'Специализации',\n        reviews: 'Отзывы пациентов',\n        startConsultation: 'Начать консультацию',\n        sendMessage: 'Написать сообщение',\n        experience: 'Опыт',\n        yearsOfExperience: 'Лет опыта',\n        totalConsultations: 'Всего консультаций',\n        averageRating: 'Средний рейтинг',\n        languages: 'Языки',\n        workingHours: 'Часы работы',\n        documents: 'Подтверждённые документы',\n      }\n    },\n    chat: {\n      title: 'Консультации',\n      noConversation: 'Выберите чат для общения',\n      messagePlaceholder: 'Введите сообщение...',\n      send: 'Отправить',\n      online: 'Онлайн',\n      offline: 'Не в сети',\n      typing: 'печатает...',\n      attachFile: 'Прикрепить файл',\n      today: 'Сегодня',\n      yesterday: 'Вчера',\n      newConsultation: 'Новая консультация',\n      endConsultation: 'Завершить',\n      consultationEnded: 'Консультация завершена.',\n      fileShared: 'Файл отправлен',\n      imageShared: 'Изображение отправлено',\n    },\n    ai: {\n      title: 'ИИ Ассистент Healzy',\n      subtitle: 'Спросите о симптомах, лекарствах или получите совет',\n      placeholder: 'Опишите симптомы или задайте вопрос о здоровье...',\n      send: 'Отправить',\n      voiceStart: 'Начать голосовой ввод',\n      voiceStop: 'Остановить запись',\n      clearHistory: 'Очистить историю',\n      disclaimer: 'Ответы ИИ носят информационный характер и не являются медицинской консультацией. Всегда консультируйтесь с квалифицированным врачом.',\n      thinking: 'Анализирую запрос...',\n      uploadImage: 'Загрузить медицинское изображение',\n      newChat: 'Новый чат',\n      history: 'История чатов',\n      suggestions: {\n        title: 'Быстрые вопросы',\n        items: [\n          'Симптомы простуды?',\n          'Как контролировать давление?',\n          'Когда идти к врачу с головной болью?',\n          'Какие витамины принимать?',\n        ]\n      },\n      errorMessage: 'Произошла ошибка. Попробуйте ещё раз.',\n    },\n    admin: {\n      title: 'Панель администратора',\n      dashboard: 'Главная',\n      users: 'Пользователи',\n      doctors: 'Заявки врачей',\n      consultations: 'Консультации',\n      stats: {\n        totalUsers: 'Всего пользователей',\n        activeDoctors: 'Активных врачей',\n        pendingApps: 'Ожидающих заявок',\n        todayConsultations: 'Консультаций сегодня',\n      },\n      doctorApps: {\n        title: 'Заявки врачей',\n        pending: 'Ожидают',\n        approved: 'Одобрены',\n        rejected: 'Отклонены',\n        approve: 'Одобрить',\n        reject: 'Отклонить',\n        viewDocs: 'Документы',\n        appliedAt: 'Подал заявку',\n        specialty: 'Специализация',\n        experience: 'Опыт',\n        education: 'Образование',\n      },\n      users: {\n        title: 'Управление пользователями',\n        name: 'Имя',\n        email: 'Email',\n        role: 'Роль',\n        status: 'Статус',\n        joined: 'Зарегистрирован',\n        actions: 'Действия',\n        ban: 'Заблокировать',\n        unban: 'Разблокировать',\n        makeAdmin: 'Сделать администратором',\n      }\n    },\n    patient: {\n      dashboard: {\n        title: 'Мой кабинет',\n        welcome: 'Добро пожаловать',\n        recentConsultations: 'Последние консультации',\n        upcomingAppointments: 'Предстоящие',\n        healthSummary: 'Сводка здоровья',\n        findDoctor: 'Найти врача',\n        myDoctors: 'Мои врачи',\n        aiHistory: 'История ИИ чата',\n        noConsultations: 'Консультаций пока нет. Найдите врача чтобы начать.',\n      }\n    },\n    doctorDashboard: {\n      title: 'Кабинет врача',\n      myPatients: 'Мои пациенты',\n      pendingRequests: 'Ожидающие запросы',\n      schedule: 'Расписание',\n      earnings: 'Заработок',\n      becomeDoctor: {\n        title: 'Заполните профиль врача',\n        subtitle: 'Отправьте данные для начала приёма пациентов',\n        specialty: 'Медицинская специализация',\n        experience: 'Лет опыта',\n        education: 'Образование и сертификаты',\n        bio: 'Профессиональная биография',\n        documents: 'Загрузить документы',\n        submit: 'Отправить заявку',\n        pending: 'Заявка на рассмотрении',\n        pendingDesc: 'Наша команда рассматривает вашу заявку. Обычно это занимает 1-2 рабочих дня.',\n      }\n    },\n    common: {\n      loading: 'Загрузка...',\n      error: 'Что-то пошло не так',\n      retry: 'Попробовать снова',\n      save: 'Сохранить',\n      cancel: 'Отмена',\n      delete: 'Удалить',\n      edit: 'Редактировать',\n      back: 'Назад',\n      next: 'Далее',\n      submit: 'Отправить',\n      search: 'Поиск',\n      filter: 'Фильтр',\n      clear: 'Очистить',\n      close: 'Закрыть',\n      confirm: 'Подтвердить',\n      yes: 'Да',\n      no: 'Нет',\n      or: 'или',\n      and: 'и',\n      required: 'Обязательно',\n      optional: 'Необязательно',\n      darkMode: 'Тёмная тема',\n      lightMode: 'Светлая тема',\n      language: 'Язык',\n      notifications: 'Уведомления',\n      settings: 'Настройки',\n      theme: 'Тема',\n    },\n    specialties: [\n      'Терапевт', 'Кардиолог', 'Дерматолог', 'Невролог',\n      'Педиатр', 'Психиатр', 'Гинеколог', 'Ортопед',\n      'Офтальмолог', 'Отоларинголог', 'Эндокринолог', 'Гастроэнтеролог',\n      'Уролог', 'Пульмонолог', 'Ревматолог', 'Онколог',\n    ],\n  },\n\n  uz: {\n    nav: {\n      home: 'Bosh sahifa',\n      doctors: 'Shifokor topish',\n      aiAssistant: 'AI Yordamchi',\n      consultations: 'Mening konsultatsiyalarim',\n      dashboard: 'Shaxsiy kabinet',\n      admin: 'Admin paneli',\n      login: 'Kirish',\n      register: \"Ro'yxatdan o'tish\",\n      logout: 'Chiqish',\n      profile: 'Mening profilim',\n      becomeDoctor: 'Shifokor bo\\'lish',\n    },\n    home: {\n      hero: {\n        badge: '10 000+ bemor ishonadi',\n        title: 'Sizning sog\\'lig\\'ingiz —\\nbizning ustuvorligimiz',\n        subtitle: 'Sertifikatlangan shifokorlar bilan onlayn maslahatlashing. Ekspert tavsiyalar, real vaqt konsultatsiyalari va AI diagnostika — hammasi bir joyda.',\n        cta: 'Shifokor topish',\n        ctaSecondary: 'AI Diagnostika',\n        stats: {\n          doctors: 'Tekshirilgan shifokorlar',\n          consultations: 'Konsultatsiyalar',\n          satisfaction: 'Qoniqish darajasi',\n          available: '24/7 mavjud',\n        }\n      },\n      features: {\n        title: 'Nima uchun Healzy?',\n        subtitle: 'Sog\\'lig\\'ingiz uchun kerakli hamma narsa bir zamonaviy platformada',\n        chat: { title: 'Real vaqt konsultatsiyalari', desc: 'Shifokor bilan darhol yozishuv. Navbat yo\\'q, kechikish yo\\'q.' },\n        ai: { title: 'AI sog\\'liq yordamchisi', desc: 'Ovoz va matn orqali Gemini asosida AI diagnostika.' },\n        secure: { title: 'Maxfiy va xavfsiz', desc: 'Uchidan-uchiga shifrlash. Sog\\'liq ma\\'lumotlaringiz faqat sizniki.' },\n        search: { title: 'Mutaxassislarni topish', desc: 'Mutaxassislik, tajriba, reyting va mavjudlik bo\\'yicha qidirish.' },\n      },\n      howItWorks: {\n        title: 'Bu qanday ishlaydi',\n        steps: [\n          { title: 'Hisob yarating', desc: 'Email yoki Google orqali bir daqiqada ro\\'yxatdan o\\'ting' },\n          { title: 'Shifokoringizni toping', desc: 'Mutaxassislik bo\\'yicha qidiring, sharhlarni o\\'qing' },\n          { title: 'Konsultatsiya boshlang', desc: 'Real vaqt chat, fayllar, retseptlar' },\n          { title: 'Sog\\'lom bo\\'ling', desc: 'Tarixingiz, takroriy qabullar va sog\\'liq yo\\'lingiz' },\n        ]\n      },\n      topDoctors: {\n        title: 'Eng yaxshi shifokorlar',\n        viewAll: 'Barcha shifokorlar',\n      },\n      cta: {\n        title: 'Sog\\'lig\\'ingizni nazorat qilishga tayyormisiz?',\n        subtitle: 'Healzyga ishongan minglab bemorlarga qo\\'shiling.',\n        button: 'Bepul boshlash',\n      }\n    },\n    auth: {\n      login: {\n        title: 'Xush kelibsiz',\n        subtitle: 'Healzy hisobingizga kiring',\n        email: 'Email manzil',\n        password: 'Parol',\n        forgotPassword: 'Parolni unutdingizmi?',\n        submit: 'Kirish',\n        noAccount: 'Hisobingiz yo\\'qmi?',\n        register: 'Yarating',\n        orGoogle: 'Yoki orqali kirish',\n        google: 'Google',\n      },\n      register: {\n        title: 'Healzyga qo\\'shiling',\n        subtitle: 'Bepul hisob yarating',\n        firstName: 'Ism',\n        lastName: 'Familiya',\n        email: 'Email manzil',\n        password: 'Parol',\n        confirmPassword: 'Parolni tasdiqlang',\n        role: 'Men',\n        patient: 'Bemorman',\n        doctor: 'Shiforkorman',\n        submit: 'Hisob yaratish',\n        hasAccount: 'Hisobingiz bormi?',\n        login: 'Kirish',\n        terms: 'Hisob yaratish orqali Foydalanish shartlari va Maxfiylik siyosatiga rozilik bildirasiz.',\n      },\n      resetPassword: {\n        title: 'Parolni tiklash',\n        subtitle: 'Ko\\'rsatmalar uchun emailingizni kiriting',\n        email: 'Email manzil',\n        submit: 'Havola yuborish',\n        back: 'Kirish sahifasiga qaytish',\n        success: 'Havola yuborildi! Emailingizni tekshiring.',\n      }\n    },\n    doctors: {\n      search: {\n        title: 'Shifokoringizni toping',\n        subtitle: 'Yuzlab tekshirilgan mutaxassislardan tanlang',\n        placeholder: 'Ism yoki mutaxassislik bo\\'yicha qidiring...',\n        filterSpecialty: 'Mutaxassislik',\n        filterRating: 'Min. reyting',\n        filterAvailable: 'Hozir mavjud',\n        sort: 'Saralash',\n        sortOptions: {\n          rating: 'Eng yuqori reyting',\n          experience: 'Eng tajribali',\n          consultations: 'Eng ko\\'p konsultatsiya',\n          price: 'Narx',\n        },\n        noResults: 'Shifokor topilmadi. Filtrlarni o\\'zgartiring.',\n        results: 'shifokor topildi',\n      },\n      card: {\n        experience: 'yil tajriba',\n        consultations: 'konsultatsiya',\n        rating: 'reyting',\n        bookNow: 'Qabul olish',\n        viewProfile: 'Profilni ko\\'rish',\n        available: 'Mavjud',\n        busy: 'Band',\n      },\n      profile: {\n        about: 'Shifokor haqida',\n        education: 'Ta\\'lim',\n        specializations: 'Mutaxassisliklar',\n        reviews: 'Bemor sharhlari',\n        startConsultation: 'Konsultatsiya boshlash',\n        sendMessage: 'Xabar yuborish',\n        experience: 'Tajriba',\n        yearsOfExperience: 'Yillik tajriba',\n        totalConsultations: 'Jami konsultatsiyalar',\n        averageRating: \"O'rtacha reyting\",\n        languages: 'Tillar',\n        workingHours: 'Ish vaqti',\n        documents: 'Tasdiqlangan hujjatlar',\n      }\n    },\n    chat: {\n      title: 'Konsultatsiyalar',\n      noConversation: 'Chat tanlang',\n      messagePlaceholder: 'Xabar yozing...',\n      send: 'Yuborish',\n      online: 'Onlayn',\n      offline: 'Oflayn',\n      typing: 'yozmoqda...',\n      attachFile: 'Fayl biriktirish',\n      today: 'Bugun',\n      yesterday: 'Kecha',\n      newConsultation: 'Yangi konsultatsiya',\n      endConsultation: 'Tugatish',\n      consultationEnded: 'Konsultatsiya tugadi.',\n      fileShared: 'Fayl yuborildi',\n      imageShared: 'Rasm yuborildi',\n    },\n    ai: {\n      title: 'Healzy AI Yordamchi',\n      subtitle: 'Simptomlar, dorilar yoki sog\\'liq maslahati haqida so\\'rang',\n      placeholder: 'Simptomlaringizni tasvirlab bering yoki sog\\'liq savoli bering...',\n      send: 'Yuborish',\n      voiceStart: 'Ovozli kiritishni boshlash',\n      voiceStop: 'Yozishni to\\'xtatish',\n      clearHistory: 'Tarixni tozalash',\n      disclaimer: 'AI javoblari faqat ma\\'lumot uchun bo\\'lib, tibbiy maslahat hisoblanmaydi. Har doim malakali shifokor bilan maslahatlashing.',\n      thinking: 'So\\'rovingiz tahlil qilinmoqda...',\n      uploadImage: 'Tibbiy rasm yuklash',\n      newChat: 'Yangi chat',\n      history: 'Chat tarixi',\n      suggestions: {\n        title: 'Tez savollar',\n        items: [\n          'Shamollash belgilari nima?',\n          'Qon bosimini qanday boshqarish?',\n          'Bosh og\\'riqda qachon shifokorga borish kerak?',\n          'Har kuni qanday vitaminlar olish kerak?',\n        ]\n      },\n      errorMessage: 'Xato yuz berdi. Qayta urinib ko\\'ring.',\n    },\n    admin: {\n      title: 'Admin paneli',\n      dashboard: 'Bosh sahifa',\n      users: 'Foydalanuvchilar',\n      doctors: 'Shifokor arizalari',\n      consultations: 'Konsultatsiyalar',\n      stats: {\n        totalUsers: 'Jami foydalanuvchilar',\n        activeDoctors: 'Faol shifokorlar',\n        pendingApps: 'Kutayotgan arizalar',\n        todayConsultations: 'Bugungi konsultatsiyalar',\n      },\n      doctorApps: {\n        title: 'Shifokor arizalari',\n        pending: 'Kutmoqda',\n        approved: 'Tasdiqlangan',\n        rejected: 'Rad etilgan',\n        approve: 'Tasdiqlash',\n        reject: 'Rad etish',\n        viewDocs: 'Hujjatlar',\n        appliedAt: 'Ariza bergan',\n        specialty: 'Mutaxassislik',\n        experience: 'Tajriba',\n        education: \"Ta'lim\",\n      },\n      users: {\n        title: 'Foydalanuvchilarni boshqarish',\n        name: 'Ism',\n        email: 'Email',\n        role: 'Rol',\n        status: 'Holat',\n        joined: \"Qo'shilgan\",\n        actions: 'Amallar',\n        ban: 'Bloklash',\n        unban: 'Blokdan chiqarish',\n        makeAdmin: 'Admin qilish',\n      }\n    },\n    patient: {\n      dashboard: {\n        title: 'Mening kabinetim',\n        welcome: 'Xush kelibsiz',\n        recentConsultations: 'So\\'nggi konsultatsiyalar',\n        upcomingAppointments: 'Kelgusi',\n        healthSummary: \"Sog'liq xulosasi\",\n        findDoctor: 'Shifokor topish',\n        myDoctors: 'Mening shifokorlarim',\n        aiHistory: 'AI chat tarixi',\n        noConsultations: 'Hali konsultatsiyalar yo\\'q. Boshlash uchun shifokor toping.',\n      }\n    },\n    doctorDashboard: {\n      title: 'Shifokor kabineti',\n      myPatients: 'Mening bemorlarim',\n      pendingRequests: 'Kutayotgan so\\'rovlar',\n      schedule: 'Jadval',\n      earnings: 'Daromad',\n      becomeDoctor: {\n        title: 'Shifokor profilingizni to\\'ldiring',\n        subtitle: 'Bemorlarni qabul qilishni boshlash uchun ma\\'lumotlaringizni yuboring',\n        specialty: 'Tibbiy mutaxassislik',\n        experience: 'Yillik tajriba',\n        education: \"Ta'lim va sertifikatlar\",\n        bio: 'Professional biografiya',\n        documents: 'Hujjatlarni yuklash',\n        submit: 'Ariza yuborish',\n        pending: \"Ariza ko'rib chiqilmoqda\",\n        pendingDesc: 'Bizning jamoamiz arizangizni ko\\'rib chiqmoqda. Bu odatda 1-2 ish kunini oladi.',\n      }\n    },\n    common: {\n      loading: 'Yuklanmoqda...',\n      error: 'Xato yuz berdi',\n      retry: 'Qayta urinish',\n      save: 'Saqlash',\n      cancel: 'Bekor qilish',\n      delete: \"O'chirish\",\n      edit: 'Tahrirlash',\n      back: 'Orqaga',\n      next: 'Keyingi',\n      submit: 'Yuborish',\n      search: 'Qidirish',\n      filter: 'Filtr',\n      clear: 'Tozalash',\n      close: 'Yopish',\n      confirm: 'Tasdiqlash',\n      yes: 'Ha',\n      no: \"Yo'q\",\n      or: 'yoki',\n      and: 'va',\n      required: 'Majburiy',\n      optional: 'Ixtiyoriy',\n      darkMode: \"Qorong'u rejim\",\n      lightMode: 'Yorqin rejim',\n      language: 'Til',\n      notifications: 'Bildirishnomalar',\n      settings: 'Sozlamalar',\n      theme: 'Mavzu',\n    },\n    specialties: [\n      'Umumiy amaliyot', 'Kardiolog', 'Dermatolog', 'Nevrolog',\n      'Pediatr', 'Psixiatr', 'Ginekolog', 'Ortoped',\n      'Oftalmolog', 'LOR mutaxassisi', 'Endokrinolog', 'Gastroenterolog',\n      'Urolog', 'Pulmonolog', 'Revmatolog', 'Onkolog',\n    ],\n  }\n};\n\nexport const LANGUAGES = {\n  en: { name: 'English', flag: '🇬🇧' },\n  ru: { name: 'Русский', flag: '🇷🇺' },\n  uz: { name: \"O'zbek\", flag: '🇺🇿' },\n};\n",
  "src/i18n/useT.js": "import { createContext, useContext } from 'react';\nimport { translations } from './translations';\nimport { useUIStore } from '../store';\n\nexport const LanguageContext = createContext(null);\n\nexport const useT = () => {\n  const language = useUIStore((s) => s.language);\n  const t = translations[language] || translations.en;\n\n  const get = (path) => {\n    const keys = path.split('.');\n    let val = t;\n    for (const k of keys) {\n      if (val == null) return path;\n      val = val[k];\n    }\n    return val ?? path;\n  };\n\n  return { t, get, language };\n};\n",
  "src/styles/globals.css": "/* ── Healzy Design System ── */\n\n:root {\n  /* Colors — Light Theme */\n  --color-bg: #F8F6F1;\n  --color-bg-secondary: #FFFFFF;\n  --color-bg-tertiary: #F0EDE6;\n  --color-surface: #FFFFFF;\n  --color-surface-raised: #FFFFFF;\n\n  --color-text-primary: #1A1714;\n  --color-text-secondary: #5C5751;\n  --color-text-tertiary: #8C8680;\n  --color-text-inverse: #FFFFFF;\n\n  --color-primary: #2D6A4F;\n  --color-primary-light: #40916C;\n  --color-primary-dark: #1B4332;\n  --color-primary-muted: #D8F3DC;\n\n  --color-accent: #E76F51;\n  --color-accent-light: #F4A261;\n  --color-accent-dark: #C45D40;\n\n  --color-teal: #0F766E;\n  --color-teal-light: #14B8A6;\n  --color-teal-muted: #CCFBF1;\n\n  --color-border: #E4E0D8;\n  --color-border-strong: #C8C3BA;\n\n  --color-success: #16A34A;\n  --color-warning: #D97706;\n  --color-error: #DC2626;\n  --color-info: #2563EB;\n\n  --color-success-muted: #DCFCE7;\n  --color-warning-muted: #FEF3C7;\n  --color-error-muted: #FEE2E2;\n\n  /* Typography */\n  --font-display: 'Playfair Display', Georgia, serif;\n  --font-body: 'DM Sans', system-ui, sans-serif;\n  --font-mono: 'DM Mono', 'Fira Code', monospace;\n\n  /* Spacing */\n  --space-1: 4px;\n  --space-2: 8px;\n  --space-3: 12px;\n  --space-4: 16px;\n  --space-5: 20px;\n  --space-6: 24px;\n  --space-8: 32px;\n  --space-10: 40px;\n  --space-12: 48px;\n  --space-16: 64px;\n  --space-20: 80px;\n  --space-24: 96px;\n\n  /* Radius */\n  --radius-sm: 6px;\n  --radius-md: 12px;\n  --radius-lg: 20px;\n  --radius-xl: 28px;\n  --radius-full: 9999px;\n\n  /* Shadows */\n  --shadow-sm: 0 1px 3px rgba(26, 23, 20, 0.06), 0 1px 2px rgba(26, 23, 20, 0.04);\n  --shadow-md: 0 4px 16px rgba(26, 23, 20, 0.08), 0 2px 6px rgba(26, 23, 20, 0.05);\n  --shadow-lg: 0 10px 40px rgba(26, 23, 20, 0.12), 0 4px 12px rgba(26, 23, 20, 0.06);\n  --shadow-xl: 0 20px 60px rgba(26, 23, 20, 0.15), 0 8px 20px rgba(26, 23, 20, 0.08);\n  --shadow-primary: 0 8px 24px rgba(45, 106, 79, 0.25);\n  --shadow-accent: 0 8px 24px rgba(231, 111, 81, 0.25);\n\n  /* Transitions */\n  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);\n  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);\n  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);\n\n  /* Layout */\n  --max-width: 1280px;\n  --nav-height: 72px;\n  --sidebar-width: 280px;\n}\n\n[data-theme=\"dark\"] {\n  --color-bg: #0F1412;\n  --color-bg-secondary: #161C19;\n  --color-bg-tertiary: #1C2421;\n  --color-surface: #1C2421;\n  --color-surface-raised: #232B27;\n\n  --color-text-primary: #F0EDE6;\n  --color-text-secondary: #A8A49E;\n  --color-text-tertiary: #706C66;\n  --color-text-inverse: #1A1714;\n\n  --color-primary: #52B788;\n  --color-primary-light: #74C69D;\n  --color-primary-dark: #40916C;\n  --color-primary-muted: #1B3A2E;\n\n  --color-accent: #F4A261;\n  --color-accent-light: #F9C784;\n  --color-accent-dark: #E76F51;\n\n  --color-teal: #2DD4BF;\n  --color-teal-light: #5EEAD4;\n  --color-teal-muted: #0F2E2B;\n\n  --color-border: #2A332F;\n  --color-border-strong: #3D4A45;\n\n  --color-success: #4ADE80;\n  --color-warning: #FCD34D;\n  --color-error: #F87171;\n\n  --color-success-muted: #14291D;\n  --color-warning-muted: #2D2006;\n  --color-error-muted: #2D0F0F;\n\n  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);\n  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.25);\n  --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3);\n  --shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.4);\n  --shadow-primary: 0 8px 24px rgba(82, 183, 136, 0.2);\n  --shadow-accent: 0 8px 24px rgba(244, 162, 97, 0.2);\n}\n\n/* ── Reset ── */\n*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\nhtml {\n  scroll-behavior: smooth;\n  -webkit-text-size-adjust: 100%;\n}\n\nbody {\n  font-family: var(--font-body);\n  background-color: var(--color-bg);\n  color: var(--color-text-primary);\n  line-height: 1.6;\n  min-height: 100vh;\n  transition: background-color var(--transition-base), color var(--transition-base);\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n#root {\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n}\n\nimg, video {\n  max-width: 100%;\n  height: auto;\n  display: block;\n}\n\na {\n  color: var(--color-primary);\n  text-decoration: none;\n  transition: color var(--transition-fast);\n}\n\na:hover { color: var(--color-primary-light); }\n\nbutton {\n  cursor: pointer;\n  font-family: inherit;\n  border: none;\n  background: none;\n}\n\ninput, textarea, select {\n  font-family: inherit;\n  font-size: inherit;\n}\n\n/* ── Typography Classes ── */\n.font-display { font-family: var(--font-display); }\n.font-body { font-family: var(--font-body); }\n.font-mono { font-family: var(--font-mono); }\n\n/* ── Layout Utilities ── */\n.container {\n  max-width: var(--max-width);\n  margin: 0 auto;\n  padding: 0 var(--space-6);\n}\n\n@media (max-width: 768px) {\n  .container { padding: 0 var(--space-4); }\n}\n\n/* ── Scrollbar Styling ── */\n::-webkit-scrollbar { width: 6px; height: 6px; }\n::-webkit-scrollbar-track { background: transparent; }\n::-webkit-scrollbar-thumb {\n  background: var(--color-border-strong);\n  border-radius: var(--radius-full);\n}\n::-webkit-scrollbar-thumb:hover { background: var(--color-text-tertiary); }\n\n/* ── Focus Styles ── */\n:focus-visible {\n  outline: 2px solid var(--color-primary);\n  outline-offset: 2px;\n  border-radius: 4px;\n}\n\n/* ── Selection ── */\n::selection {\n  background: var(--color-primary-muted);\n  color: var(--color-primary-dark);\n}\n\n/* ── Animations ── */\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(8px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n@keyframes slideInLeft {\n  from { opacity: 0; transform: translateX(-16px); }\n  to { opacity: 1; transform: translateX(0); }\n}\n\n@keyframes slideInRight {\n  from { opacity: 0; transform: translateX(16px); }\n  to { opacity: 1; transform: translateX(0); }\n}\n\n@keyframes scaleIn {\n  from { opacity: 0; transform: scale(0.96); }\n  to { opacity: 1; transform: scale(1); }\n}\n\n@keyframes pulse {\n  0%, 100% { opacity: 1; }\n  50% { opacity: 0.5; }\n}\n\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}\n\n@keyframes shimmer {\n  0% { background-position: -200% 0; }\n  100% { background-position: 200% 0; }\n}\n\n@keyframes breathe {\n  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.05); }\n}\n\n@keyframes recordPulse {\n  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }\n  50% { box-shadow: 0 0 0 12px rgba(220, 38, 38, 0); }\n}\n\n/* ── Skeleton Loading ── */\n.skeleton {\n  background: linear-gradient(\n    90deg,\n    var(--color-bg-tertiary) 25%,\n    var(--color-border) 50%,\n    var(--color-bg-tertiary) 75%\n  );\n  background-size: 200% 100%;\n  animation: shimmer 1.5s infinite;\n  border-radius: var(--radius-sm);\n}\n\n/* ── Badge ── */\n.badge {\n  display: inline-flex;\n  align-items: center;\n  gap: var(--space-1);\n  padding: 3px 10px;\n  border-radius: var(--radius-full);\n  font-size: 12px;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n}\n.badge-primary { background: var(--color-primary-muted); color: var(--color-primary-dark); }\n.badge-accent { background: rgba(231, 111, 81, 0.12); color: var(--color-accent-dark); }\n.badge-success { background: var(--color-success-muted); color: var(--color-success); }\n.badge-warning { background: var(--color-warning-muted); color: var(--color-warning); }\n.badge-error { background: var(--color-error-muted); color: var(--color-error); }\n\n/* ── Divider ── */\n.divider {\n  height: 1px;\n  background: var(--color-border);\n  border: none;\n  margin: var(--space-6) 0;\n}\n\n/* ── Page Transition ── */\n.page-enter {\n  animation: fadeIn var(--transition-base) forwards;\n}\n\n/* ── Gradient Text ── */\n.gradient-text {\n  background: linear-gradient(135deg, var(--color-primary), var(--color-teal));\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n}\n\n/* ── Glass Effect ── */\n.glass {\n  background: rgba(255, 255, 255, 0.7);\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  border: 1px solid rgba(255, 255, 255, 0.5);\n}\n\n[data-theme=\"dark\"] .glass {\n  background: rgba(28, 36, 33, 0.7);\n  border-color: rgba(255, 255, 255, 0.08);\n}\n",
  "src/components/common/Button.jsx": "import { motion } from 'framer-motion';\nimport styles from './Button.module.css';\n\nconst variants = {\n  primary: styles.primary,\n  secondary: styles.secondary,\n  outline: styles.outline,\n  ghost: styles.ghost,\n  danger: styles.danger,\n  accent: styles.accent,\n};\n\nconst sizes = {\n  sm: styles.sm,\n  md: styles.md,\n  lg: styles.lg,\n  xl: styles.xl,\n};\n\nexport default function Button({\n  children,\n  variant = 'primary',\n  size = 'md',\n  loading = false,\n  disabled = false,\n  fullWidth = false,\n  icon,\n  iconRight,\n  className = '',\n  onClick,\n  type = 'button',\n  ...props\n}) {\n  return (\n    <motion.button\n      type={type}\n      className={[\n        styles.btn,\n        variants[variant],\n        sizes[size],\n        fullWidth ? styles.fullWidth : '',\n        loading ? styles.loading : '',\n        className,\n      ].filter(Boolean).join(' ')}\n      disabled={disabled || loading}\n      onClick={onClick}\n      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}\n      {...props}\n    >\n      {loading ? (\n        <span className={styles.spinner} aria-hidden=\"true\" />\n      ) : icon ? (\n        <span className={styles.iconLeft}>{icon}</span>\n      ) : null}\n      {children && <span>{children}</span>}\n      {iconRight && !loading && <span className={styles.iconRight}>{iconRight}</span>}\n    </motion.button>\n  );\n}\n",
  "src/components/common/Button.module.css": ".btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  font-family: var(--font-body);\n  font-weight: 500;\n  letter-spacing: 0.01em;\n  border-radius: var(--radius-md);\n  transition: all var(--transition-fast);\n  position: relative;\n  overflow: hidden;\n  white-space: nowrap;\n  border: 1.5px solid transparent;\n}\n\n.btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }\n.fullWidth { width: 100%; }\n\n/* Sizes */\n.sm { padding: 6px 14px; font-size: 13px; border-radius: var(--radius-sm); }\n.md { padding: 10px 20px; font-size: 14px; }\n.lg { padding: 13px 28px; font-size: 15px; }\n.xl { padding: 16px 36px; font-size: 16px; border-radius: var(--radius-lg); }\n\n/* Variants */\n.primary {\n  background: var(--color-primary);\n  color: var(--color-text-inverse);\n  border-color: var(--color-primary);\n  box-shadow: var(--shadow-primary);\n}\n.primary:hover:not(:disabled) {\n  background: var(--color-primary-light);\n  border-color: var(--color-primary-light);\n  box-shadow: 0 10px 28px rgba(45, 106, 79, 0.35);\n  transform: translateY(-1px);\n}\n\n.secondary {\n  background: var(--color-bg-tertiary);\n  color: var(--color-text-primary);\n  border-color: var(--color-border);\n}\n.secondary:hover:not(:disabled) {\n  background: var(--color-border);\n  border-color: var(--color-border-strong);\n}\n\n.outline {\n  background: transparent;\n  color: var(--color-primary);\n  border-color: var(--color-primary);\n}\n.outline:hover:not(:disabled) {\n  background: var(--color-primary-muted);\n}\n\n.ghost {\n  background: transparent;\n  color: var(--color-text-secondary);\n  border-color: transparent;\n}\n.ghost:hover:not(:disabled) {\n  background: var(--color-bg-tertiary);\n  color: var(--color-text-primary);\n}\n\n.danger {\n  background: var(--color-error);\n  color: white;\n  border-color: var(--color-error);\n}\n.danger:hover:not(:disabled) {\n  background: #b91c1c;\n  transform: translateY(-1px);\n}\n\n.accent {\n  background: var(--color-accent);\n  color: white;\n  border-color: var(--color-accent);\n  box-shadow: var(--shadow-accent);\n}\n.accent:hover:not(:disabled) {\n  background: var(--color-accent-light);\n  transform: translateY(-1px);\n}\n\n/* Icons */\n.iconLeft, .iconRight {\n  display: flex;\n  align-items: center;\n  flex-shrink: 0;\n}\n.iconLeft { margin-right: -2px; }\n.iconRight { margin-left: -2px; }\n\n/* Spinner */\n.spinner {\n  width: 16px;\n  height: 16px;\n  border: 2px solid currentColor;\n  border-top-color: transparent;\n  border-radius: 50%;\n  animation: spin 0.7s linear infinite;\n  flex-shrink: 0;\n}\n\n@keyframes spin { to { transform: rotate(360deg); } }\n",
  "src/components/common/Input.jsx": "import { forwardRef } from 'react';\nimport styles from './Input.module.css';\n\nconst Input = forwardRef(({\n  label,\n  error,\n  hint,\n  icon,\n  iconRight,\n  className = '',\n  containerClassName = '',\n  type = 'text',\n  ...props\n}, ref) => {\n  return (\n    <div className={[styles.container, containerClassName].join(' ')}>\n      {label && (\n        <label className={styles.label}>\n          {label}\n          {props.required && <span className={styles.required}>*</span>}\n        </label>\n      )}\n      <div className={styles.inputWrapper}>\n        {icon && <span className={styles.iconLeft}>{icon}</span>}\n        <input\n          ref={ref}\n          type={type}\n          className={[\n            styles.input,\n            icon ? styles.hasIconLeft : '',\n            iconRight ? styles.hasIconRight : '',\n            error ? styles.hasError : '',\n            className,\n          ].filter(Boolean).join(' ')}\n          {...props}\n        />\n        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}\n      </div>\n      {error && <span className={styles.error}>{error}</span>}\n      {hint && !error && <span className={styles.hint}>{hint}</span>}\n    </div>\n  );\n});\n\nInput.displayName = 'Input';\nexport default Input;\n",
  "src/components/common/Input.module.css": ".container { display: flex; flex-direction: column; gap: 6px; }\n\n.label {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--color-text-secondary);\n  letter-spacing: 0.01em;\n}\n\n.required { color: var(--color-error); margin-left: 3px; }\n\n.inputWrapper { position: relative; }\n\n.input {\n  width: 100%;\n  padding: 11px 16px;\n  background: var(--color-surface);\n  border: 1.5px solid var(--color-border);\n  border-radius: var(--radius-md);\n  color: var(--color-text-primary);\n  font-size: 14px;\n  transition: all var(--transition-fast);\n  outline: none;\n}\n\n.input::placeholder { color: var(--color-text-tertiary); }\n\n.input:focus {\n  border-color: var(--color-primary);\n  box-shadow: 0 0 0 3px var(--color-primary-muted);\n}\n\n.hasError {\n  border-color: var(--color-error) !important;\n}\n.hasError:focus {\n  box-shadow: 0 0 0 3px var(--color-error-muted) !important;\n}\n\n.iconLeft, .iconRight {\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  color: var(--color-text-tertiary);\n  display: flex;\n  align-items: center;\n  pointer-events: none;\n}\n\n.iconLeft { left: 14px; }\n.iconRight { right: 14px; }\n\n.hasIconLeft { padding-left: 42px; }\n.hasIconRight { padding-right: 42px; }\n\n.error { font-size: 12px; color: var(--color-error); }\n.hint { font-size: 12px; color: var(--color-text-tertiary); }\n",
  "src/components/common/Avatar.jsx": "import styles from './Avatar.module.css';\n\nconst sizeMap = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80, '2xl': 120 };\n\nexport default function Avatar({ src, name, size = 'md', online, className = '', badge }) {\n  const px = sizeMap[size] || 40;\n\n  const initials = name\n    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()\n    : '?';\n\n  const colorIndex = name\n    ? name.charCodeAt(0) % 8\n    : 0;\n\n  return (\n    <div\n      className={[styles.avatar, styles[size], className].join(' ')}\n      style={{ width: px, height: px, minWidth: px }}\n      data-color={colorIndex}\n    >\n      {src ? (\n        <img\n          src={src}\n          alt={name || 'Avatar'}\n          className={styles.img}\n          onError={(e) => { e.target.style.display = 'none'; }}\n        />\n      ) : (\n        <span className={styles.initials} style={{ fontSize: px * 0.36 }}>\n          {initials}\n        </span>\n      )}\n      {online !== undefined && (\n        <span className={[styles.onlineDot, online ? styles.online : styles.offline].join(' ')} />\n      )}\n      {badge && <span className={styles.badge}>{badge}</span>}\n    </div>\n  );\n}\n",
  "src/components/common/Avatar.module.css": ".avatar {\n  position: relative;\n  border-radius: 50%;\n  overflow: hidden;\n  flex-shrink: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-family: var(--font-body);\n  font-weight: 600;\n}\n\n.img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  border-radius: 50%;\n}\n\n.initials {\n  color: white;\n  line-height: 1;\n  user-select: none;\n}\n\n/* Color palettes */\n.avatar[data-color=\"0\"] { background: linear-gradient(135deg, #2D6A4F, #40916C); }\n.avatar[data-color=\"1\"] { background: linear-gradient(135deg, #0F766E, #14B8A6); }\n.avatar[data-color=\"2\"] { background: linear-gradient(135deg, #E76F51, #F4A261); }\n.avatar[data-color=\"3\"] { background: linear-gradient(135deg, #7C3AED, #A78BFA); }\n.avatar[data-color=\"4\"] { background: linear-gradient(135deg, #1D4ED8, #60A5FA); }\n.avatar[data-color=\"5\"] { background: linear-gradient(135deg, #9D174D, #F472B6); }\n.avatar[data-color=\"6\"] { background: linear-gradient(135deg, #92400E, #FCD34D); }\n.avatar[data-color=\"7\"] { background: linear-gradient(135deg, #374151, #9CA3AF); }\n\n/* Online dot */\n.onlineDot {\n  position: absolute;\n  bottom: 1px;\n  right: 1px;\n  width: 30%;\n  height: 30%;\n  max-width: 14px;\n  max-height: 14px;\n  border-radius: 50%;\n  border: 2px solid var(--color-surface);\n}\n\n.online { background: var(--color-success); }\n.offline { background: var(--color-text-tertiary); }\n\n.badge {\n  position: absolute;\n  top: -2px;\n  right: -2px;\n  background: var(--color-error);\n  color: white;\n  font-size: 10px;\n  font-weight: 600;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border: 2px solid var(--color-surface);\n}\n",
  "src/components/layout/Navbar.jsx": "import { useState, useEffect } from 'react';\nimport { Link, NavLink, useNavigate } from 'react-router-dom';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport {\n  Sun, Moon, Globe, Bell, Menu, X,\n  LogOut, User, Settings, LayoutDashboard, Shield\n} from 'lucide-react';\nimport { useAuthStore, useUIStore } from '../../store';\nimport { useT } from '../../i18n/useT';\nimport { LANGUAGES } from '../../i18n/translations';\nimport { authAPI } from '../../api';\nimport Avatar from '../common/Avatar';\nimport styles from './Navbar.module.css';\nimport toast from 'react-hot-toast';\n\nexport default function Navbar() {\n  const { user, isAuthenticated, logout } = useAuthStore();\n  const { theme, toggleTheme, language, setLanguage } = useUIStore();\n  const { t } = useT();\n  const navigate = useNavigate();\n\n  const [scrolled, setScrolled] = useState(false);\n  const [mobileOpen, setMobileOpen] = useState(false);\n  const [langOpen, setLangOpen] = useState(false);\n  const [profileOpen, setProfileOpen] = useState(false);\n\n  useEffect(() => {\n    const onScroll = () => setScrolled(window.scrollY > 16);\n    window.addEventListener('scroll', onScroll, { passive: true });\n    return () => window.removeEventListener('scroll', onScroll);\n  }, []);\n\n  useEffect(() => {\n    const close = () => { setLangOpen(false); setProfileOpen(false); };\n    document.addEventListener('click', close);\n    return () => document.removeEventListener('click', close);\n  }, []);\n\n  const handleLogout = async () => {\n    try {\n      await authAPI.logout();\n    } catch {}\n    logout();\n    navigate('/');\n    toast.success('Signed out successfully');\n  };\n\n  const isAdmin = user?.role === 'admin';\n  const isDoctor = user?.role === 'doctor';\n\n  const navLinks = [\n    { to: '/', label: t.nav.home, exact: true },\n    { to: '/doctors', label: t.nav.doctors },\n    { to: '/ai', label: t.nav.aiAssistant },\n    ...(isAuthenticated ? [{ to: '/chat', label: t.nav.consultations }] : []),\n    ...(isAdmin ? [{ to: '/admin', label: t.nav.admin }] : []),\n  ];\n\n  return (\n    <header className={[styles.navbar, scrolled ? styles.scrolled : ''].join(' ')}>\n      <div className={styles.inner}>\n        {/* Logo */}\n        <Link to=\"/\" className={styles.logo}>\n          <div className={styles.logoMark}>\n            <svg width=\"28\" height=\"28\" viewBox=\"0 0 28 28\" fill=\"none\">\n              <rect width=\"28\" height=\"28\" rx=\"8\" fill=\"currentColor\" className={styles.logoRect} />\n              <path d=\"M14 7v14M7 14h14\" stroke=\"white\" strokeWidth=\"2.5\" strokeLinecap=\"round\" />\n            </svg>\n          </div>\n          <span className={styles.logoText}>Healzy</span>\n        </Link>\n\n        {/* Desktop Nav */}\n        <nav className={styles.desktopNav}>\n          {navLinks.map(link => (\n            <NavLink\n              key={link.to}\n              to={link.to}\n              end={link.exact}\n              className={({ isActive }) =>\n                [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')\n              }\n            >\n              {link.label}\n            </NavLink>\n          ))}\n        </nav>\n\n        {/* Actions */}\n        <div className={styles.actions}>\n          {/* Language */}\n          <div className={styles.dropdown} onClick={e => e.stopPropagation()}>\n            <button\n              className={styles.iconBtn}\n              onClick={() => setLangOpen(o => !o)}\n              title={t.common.language}\n            >\n              <Globe size={18} />\n            </button>\n            <AnimatePresence>\n              {langOpen && (\n                <motion.div\n                  className={styles.dropdownMenu}\n                  initial={{ opacity: 0, y: -8, scale: 0.96 }}\n                  animate={{ opacity: 1, y: 0, scale: 1 }}\n                  exit={{ opacity: 0, y: -8, scale: 0.96 }}\n                  transition={{ duration: 0.15 }}\n                >\n                  {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (\n                    <button\n                      key={code}\n                      className={[styles.dropdownItem, language === code ? styles.dropdownItemActive : ''].join(' ')}\n                      onClick={() => { setLanguage(code); setLangOpen(false); }}\n                    >\n                      <span>{flag}</span>\n                      <span>{name}</span>\n                    </button>\n                  ))}\n                </motion.div>\n              )}\n            </AnimatePresence>\n          </div>\n\n          {/* Theme Toggle */}\n          <motion.button\n            className={styles.iconBtn}\n            onClick={toggleTheme}\n            title={theme === 'light' ? t.common.darkMode : t.common.lightMode}\n            whileTap={{ scale: 0.9, rotate: 15 }}\n          >\n            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}\n          </motion.button>\n\n          {/* Auth */}\n          {isAuthenticated ? (\n            <>\n              <button className={styles.iconBtn} title={t.common.notifications}>\n                <Bell size={18} />\n              </button>\n              <div className={styles.dropdown} onClick={e => e.stopPropagation()}>\n                <button\n                  className={styles.avatarBtn}\n                  onClick={() => setProfileOpen(o => !o)}\n                >\n                  <Avatar\n                    src={user?.avatar}\n                    name={`${user?.firstName} ${user?.lastName}`}\n                    size=\"sm\"\n                  />\n                </button>\n                <AnimatePresence>\n                  {profileOpen && (\n                    <motion.div\n                      className={[styles.dropdownMenu, styles.profileMenu].join(' ')}\n                      initial={{ opacity: 0, y: -8, scale: 0.96 }}\n                      animate={{ opacity: 1, y: 0, scale: 1 }}\n                      exit={{ opacity: 0, y: -8, scale: 0.96 }}\n                      transition={{ duration: 0.15 }}\n                    >\n                      <div className={styles.profileHeader}>\n                        <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size=\"md\" />\n                        <div>\n                          <div className={styles.profileName}>{user?.firstName} {user?.lastName}</div>\n                          <div className={styles.profileEmail}>{user?.email}</div>\n                        </div>\n                      </div>\n                      <div className={styles.dropdownDivider} />\n                      <Link to=\"/dashboard\" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>\n                        <LayoutDashboard size={15} />{t.nav.dashboard}\n                      </Link>\n                      <Link to=\"/profile\" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>\n                        <User size={15} />{t.nav.profile}\n                      </Link>\n                      <Link to=\"/settings\" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>\n                        <Settings size={15} />{t.common.settings}\n                      </Link>\n                      {isAdmin && (\n                        <Link to=\"/admin\" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>\n                          <Shield size={15} />{t.nav.admin}\n                        </Link>\n                      )}\n                      <div className={styles.dropdownDivider} />\n                      <button className={[styles.dropdownItem, styles.dropdownItemDanger].join(' ')} onClick={handleLogout}>\n                        <LogOut size={15} />{t.nav.logout}\n                      </button>\n                    </motion.div>\n                  )}\n                </AnimatePresence>\n              </div>\n            </>\n          ) : (\n            <div className={styles.authBtns}>\n              <Link to=\"/login\" className={styles.loginBtn}>{t.nav.login}</Link>\n              <Link to=\"/register\" className={styles.registerBtn}>{t.nav.register}</Link>\n            </div>\n          )}\n\n          {/* Mobile Menu Toggle */}\n          <button className={styles.mobileToggle} onClick={() => setMobileOpen(o => !o)}>\n            {mobileOpen ? <X size={22} /> : <Menu size={22} />}\n          </button>\n        </div>\n      </div>\n\n      {/* Mobile Menu */}\n      <AnimatePresence>\n        {mobileOpen && (\n          <motion.div\n            className={styles.mobileMenu}\n            initial={{ opacity: 0, height: 0 }}\n            animate={{ opacity: 1, height: 'auto' }}\n            exit={{ opacity: 0, height: 0 }}\n          >\n            {navLinks.map(link => (\n              <NavLink\n                key={link.to}\n                to={link.to}\n                end={link.exact}\n                className={({ isActive }) =>\n                  [styles.mobileLink, isActive ? styles.mobileLinkActive : ''].join(' ')\n                }\n                onClick={() => setMobileOpen(false)}\n              >\n                {link.label}\n              </NavLink>\n            ))}\n            {!isAuthenticated && (\n              <div className={styles.mobileAuth}>\n                <Link to=\"/login\" className={styles.loginBtn} onClick={() => setMobileOpen(false)}>{t.nav.login}</Link>\n                <Link to=\"/register\" className={styles.registerBtn} onClick={() => setMobileOpen(false)}>{t.nav.register}</Link>\n              </div>\n            )}\n          </motion.div>\n        )}\n      </AnimatePresence>\n    </header>\n  );\n}\n",
  "src/components/layout/Navbar.module.css": ".navbar {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  z-index: 100;\n  height: var(--nav-height);\n  transition: all var(--transition-base);\n  border-bottom: 1px solid transparent;\n}\n\n.scrolled {\n  background: rgba(248, 246, 241, 0.85);\n  backdrop-filter: blur(24px);\n  -webkit-backdrop-filter: blur(24px);\n  border-bottom-color: var(--color-border);\n  box-shadow: var(--shadow-sm);\n}\n\n[data-theme=\"dark\"] .scrolled {\n  background: rgba(15, 20, 18, 0.85);\n}\n\n.inner {\n  max-width: var(--max-width);\n  margin: 0 auto;\n  padding: 0 var(--space-6);\n  height: 100%;\n  display: flex;\n  align-items: center;\n  gap: var(--space-6);\n}\n\n/* Logo */\n.logo {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  text-decoration: none;\n  flex-shrink: 0;\n}\n\n.logoMark {\n  color: var(--color-primary);\n  display: flex;\n}\n\n.logoText {\n  font-family: var(--font-display);\n  font-size: 22px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n  letter-spacing: -0.02em;\n}\n\n/* Desktop Nav */\n.desktopNav {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex: 1;\n}\n\n@media (max-width: 900px) { .desktopNav { display: none; } }\n\n.navLink {\n  padding: 7px 14px;\n  font-size: 14px;\n  font-weight: 500;\n  color: var(--color-text-secondary);\n  border-radius: var(--radius-md);\n  transition: all var(--transition-fast);\n  text-decoration: none;\n}\n\n.navLink:hover {\n  color: var(--color-text-primary);\n  background: var(--color-bg-tertiary);\n}\n\n.navLinkActive {\n  color: var(--color-primary);\n  background: var(--color-primary-muted);\n}\n\n/* Actions */\n.actions {\n  display: flex;\n  align-items: center;\n  gap: var(--space-2);\n  margin-left: auto;\n}\n\n.iconBtn {\n  width: 38px;\n  height: 38px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: var(--radius-md);\n  color: var(--color-text-secondary);\n  transition: all var(--transition-fast);\n  cursor: pointer;\n}\n\n.iconBtn:hover {\n  color: var(--color-text-primary);\n  background: var(--color-bg-tertiary);\n}\n\n/* Dropdown */\n.dropdown { position: relative; }\n\n.dropdownMenu {\n  position: absolute;\n  top: calc(100% + 10px);\n  right: 0;\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  box-shadow: var(--shadow-xl);\n  min-width: 160px;\n  padding: 6px;\n  z-index: 200;\n  overflow: hidden;\n}\n\n.dropdownItem {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 9px 12px;\n  font-size: 13.5px;\n  color: var(--color-text-secondary);\n  border-radius: var(--radius-sm);\n  transition: all var(--transition-fast);\n  text-decoration: none;\n  cursor: pointer;\n  font-family: var(--font-body);\n}\n\n.dropdownItem:hover {\n  color: var(--color-text-primary);\n  background: var(--color-bg-tertiary);\n}\n\n.dropdownItemActive {\n  color: var(--color-primary);\n  background: var(--color-primary-muted);\n}\n\n.dropdownItemDanger { color: var(--color-error) !important; }\n.dropdownItemDanger:hover { background: var(--color-error-muted) !important; }\n\n.dropdownDivider {\n  height: 1px;\n  background: var(--color-border);\n  margin: 6px 0;\n}\n\n/* Profile menu */\n.profileMenu { min-width: 220px; }\n\n.profileHeader {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 12px;\n}\n\n.profileName {\n  font-weight: 600;\n  font-size: 14px;\n  color: var(--color-text-primary);\n}\n\n.profileEmail {\n  font-size: 12px;\n  color: var(--color-text-tertiary);\n  margin-top: 1px;\n  max-width: 140px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n/* Avatar button */\n.avatarBtn {\n  border-radius: 50%;\n  display: flex;\n  cursor: pointer;\n  transition: opacity var(--transition-fast);\n}\n.avatarBtn:hover { opacity: 0.85; }\n\n/* Auth Buttons */\n.authBtns {\n  display: flex;\n  align-items: center;\n  gap: var(--space-2);\n}\n\n@media (max-width: 600px) { .authBtns { display: none; } }\n\n.loginBtn {\n  padding: 8px 16px;\n  font-size: 14px;\n  font-weight: 500;\n  color: var(--color-text-secondary);\n  border-radius: var(--radius-md);\n  transition: all var(--transition-fast);\n  text-decoration: none;\n}\n.loginBtn:hover {\n  color: var(--color-text-primary);\n  background: var(--color-bg-tertiary);\n}\n\n.registerBtn {\n  padding: 8px 18px;\n  font-size: 14px;\n  font-weight: 500;\n  background: var(--color-primary);\n  color: white;\n  border-radius: var(--radius-md);\n  transition: all var(--transition-fast);\n  text-decoration: none;\n  box-shadow: var(--shadow-primary);\n}\n.registerBtn:hover {\n  background: var(--color-primary-light);\n  transform: translateY(-1px);\n}\n\n/* Mobile */\n.mobileToggle {\n  display: none;\n  width: 40px;\n  height: 40px;\n  align-items: center;\n  justify-content: center;\n  border-radius: var(--radius-md);\n  color: var(--color-text-secondary);\n  transition: all var(--transition-fast);\n}\n\n.mobileToggle:hover { background: var(--color-bg-tertiary); }\n\n@media (max-width: 900px) { .mobileToggle { display: flex; } }\n\n.mobileMenu {\n  background: var(--color-surface);\n  border-top: 1px solid var(--color-border);\n  overflow: hidden;\n}\n\n.mobileLink {\n  display: block;\n  padding: 14px 24px;\n  font-size: 15px;\n  font-weight: 500;\n  color: var(--color-text-secondary);\n  text-decoration: none;\n  border-bottom: 1px solid var(--color-border);\n  transition: all var(--transition-fast);\n}\n\n.mobileLink:hover, .mobileLinkActive {\n  color: var(--color-primary);\n  background: var(--color-primary-muted);\n}\n\n.mobileAuth {\n  display: flex;\n  gap: var(--space-3);\n  padding: var(--space-4) var(--space-6);\n}\n\n.mobileAuth .loginBtn, .mobileAuth .registerBtn {\n  flex: 1;\n  text-align: center;\n}\n",
  "src/components/layout/Footer.jsx": "import { Link } from 'react-router-dom';\nimport { Heart } from 'lucide-react';\nimport { useT } from '../../i18n/useT';\nimport styles from './Footer.module.css';\n\nexport default function Footer() {\n  const { t } = useT();\n\n  return (\n    <footer className={styles.footer}>\n      <div className={styles.inner}>\n        <div className={styles.brand}>\n          <div className={styles.logo}>\n            <svg width=\"24\" height=\"24\" viewBox=\"0 0 28 28\" fill=\"none\">\n              <rect width=\"28\" height=\"28\" rx=\"8\" fill=\"var(--color-primary)\" />\n              <path d=\"M14 7v14M7 14h14\" stroke=\"white\" strokeWidth=\"2.5\" strokeLinecap=\"round\" />\n            </svg>\n            <span>Healzy</span>\n          </div>\n          <p className={styles.tagline}>\n            Modern healthcare, delivered online.\n          </p>\n        </div>\n\n        <div className={styles.links}>\n          <div className={styles.linkGroup}>\n            <h4>Platform</h4>\n            <Link to=\"/doctors\">Find Doctors</Link>\n            <Link to=\"/ai\">AI Assistant</Link>\n            <Link to=\"/register\">Sign Up Free</Link>\n          </div>\n          <div className={styles.linkGroup}>\n            <h4>Company</h4>\n            <Link to=\"/about\">About</Link>\n            <Link to=\"/privacy\">Privacy</Link>\n            <Link to=\"/terms\">Terms</Link>\n          </div>\n        </div>\n      </div>\n      <div className={styles.bottom}>\n        <span>© 2025 Healzy. Made with <Heart size={12} className={styles.heart} /> for better healthcare.</span>\n      </div>\n    </footer>\n  );\n}\n",
  "src/components/layout/Footer.module.css": ".footer {\n  background: var(--color-surface);\n  border-top: 1px solid var(--color-border);\n  padding-top: 48px;\n}\n\n.inner {\n  max-width: var(--max-width);\n  margin: 0 auto;\n  padding: 0 var(--space-6) 40px;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 48px;\n}\n\n@media (max-width: 640px) { .inner { grid-template-columns: 1fr; gap: 32px; } }\n\n.brand { display: flex; flex-direction: column; gap: 12px; }\n\n.logo {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  font-family: var(--font-display);\n  font-size: 20px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n  text-decoration: none;\n}\n\n.tagline { font-size: 14px; color: var(--color-text-tertiary); line-height: 1.6; max-width: 240px; }\n\n.links { display: flex; gap: 48px; }\n\n.linkGroup { display: flex; flex-direction: column; gap: 10px; }\n\n.linkGroup h4 {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--color-text-tertiary);\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  margin-bottom: 4px;\n}\n\n.linkGroup a {\n  font-size: 14px;\n  color: var(--color-text-secondary);\n  text-decoration: none;\n  transition: color var(--transition-fast);\n}\n.linkGroup a:hover { color: var(--color-primary); }\n\n.bottom {\n  border-top: 1px solid var(--color-border);\n  padding: 16px var(--space-6);\n  text-align: center;\n  font-size: 13px;\n  color: var(--color-text-tertiary);\n  max-width: var(--max-width);\n  margin: 0 auto;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n}\n\n.heart { color: var(--color-error); display: inline; }\n",
  "src/pages/HomePage.jsx": "import { useEffect, useState, useRef } from 'react';\nimport { Link, useNavigate } from 'react-router-dom';\nimport { motion, useScroll, useTransform } from 'framer-motion';\nimport { useInView } from 'react-intersection-observer';\nimport {\n  MessageSquare, Brain, Shield, Search,\n  Star, ArrowRight, ChevronRight, Play,\n  Activity, Clock, Users, Award\n} from 'lucide-react';\nimport { useT } from '../i18n/useT';\nimport { Doctors } from '../services';\nimport Avatar from '../components/common/Avatar';\nimport Button from '../components/common/Button';\nimport styles from './HomePage.module.css';\n\n// Animated counter\nfunction Counter({ value, suffix = '' }) {\n  const [count, setCount] = useState(0);\n  const [ref, inView] = useInView({ triggerOnce: true });\n  useEffect(() => {\n    if (!inView) return;\n    const end = parseInt(value);\n    const step = Math.ceil(end / 40);\n    let cur = 0;\n    const id = setInterval(() => {\n      cur = Math.min(cur + step, end);\n      setCount(cur);\n      if (cur >= end) clearInterval(id);\n    }, 30);\n    return () => clearInterval(id);\n  }, [inView, value]);\n  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;\n}\n\n// Stagger wrapper\nfunction StaggerIn({ children, className }) {\n  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });\n  return (\n    <motion.div\n      ref={ref}\n      className={className}\n      initial=\"hidden\"\n      animate={inView ? 'visible' : 'hidden'}\n      variants={{\n        hidden: {},\n        visible: { transition: { staggerChildren: 0.1 } },\n      }}\n    >\n      {children}\n    </motion.div>\n  );\n}\n\nconst fadeUp = {\n  hidden: { opacity: 0, y: 32 },\n  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },\n};\n\n// ─── Doctor Card ──────────────────────────────────────────────────────────────\nfunction DoctorCard({ doctor, delay = 0 }) {\n  const { t, language } = useT();\n  const navigate = useNavigate();\n  const specialty = language === 'ru' ? doctor.specialtyRu : language === 'uz' ? doctor.specialtyUz : doctor.specialty;\n\n  return (\n    <motion.div className={styles.doctorCard} variants={fadeUp} whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>\n      <div className={styles.doctorCardTop}>\n        <Avatar name={`${doctor.firstName} ${doctor.lastName}`} size=\"xl\" />\n        <div className={styles.doctorAvailBadge}>\n          <span className={[styles.availDot, doctor.isAvailable ? styles.availGreen : styles.availGray].join(' ')} />\n          {doctor.isAvailable ? t.doctors.card.available : t.doctors.card.busy}\n        </div>\n      </div>\n      <div className={styles.doctorCardBody}>\n        <h3>{doctor.firstName} {doctor.lastName}</h3>\n        <p className={styles.doctorSpecialty}>{specialty}</p>\n        <div className={styles.doctorMeta}>\n          <span><Star size={13} fill=\"currentColor\" />{doctor.rating}</span>\n          <span>·</span>\n          <span>{doctor.experience} {t.doctors.card.experience}</span>\n          <span>·</span>\n          <span>{doctor.consultationCount.toLocaleString()} {t.doctors.card.consultations}</span>\n        </div>\n        <div className={styles.doctorLangs}>\n          {doctor.languages.slice(0, 3).map(l => (\n            <span key={l} className={styles.langTag}>{l}</span>\n          ))}\n        </div>\n      </div>\n      <div className={styles.doctorCardFooter}>\n        <Button variant=\"outline\" size=\"sm\" onClick={() => navigate(`/doctors/${doctor.id}`)}>\n          {t.doctors.card.viewProfile}\n        </Button>\n        <Button size=\"sm\" onClick={() => navigate(`/doctors/${doctor.id}`)}>\n          {t.doctors.card.bookNow}\n        </Button>\n      </div>\n    </motion.div>\n  );\n}\n\n// ─── Main Component ───────────────────────────────────────────────────────────\nexport default function HomePage() {\n  const { t } = useT();\n  const navigate = useNavigate();\n  const [featuredDoctors, setFeaturedDoctors] = useState([]);\n  const [searchQuery, setSearchQuery] = useState('');\n  const heroRef = useRef(null);\n  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });\n  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);\n\n  useEffect(() => {\n    Doctors.getFeatured().then(res => setFeaturedDoctors(res.data)).catch(() => {});\n  }, []);\n\n  const handleSearch = (e) => {\n    e.preventDefault();\n    navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);\n  };\n\n  const features = [\n    { icon: <MessageSquare size={24} />, key: 'chat', color: '#2D6A4F' },\n    { icon: <Brain size={24} />, key: 'ai', color: '#0F766E' },\n    { icon: <Shield size={24} />, key: 'secure', color: '#7C3AED' },\n    { icon: <Search size={24} />, key: 'search', color: '#D97706' },\n  ];\n\n  const stats = [\n    { icon: <Users size={20} />, value: 500, suffix: '+', label: t.home.hero.stats.doctors },\n    { icon: <Activity size={20} />, value: 50000, suffix: '+', label: t.home.hero.stats.consultations },\n    { icon: <Award size={20} />, value: 98, suffix: '%', label: t.home.hero.stats.satisfaction },\n    { icon: <Clock size={20} />, value: 24, suffix: '/7', label: t.home.hero.stats.available },\n  ];\n\n  return (\n    <div className={styles.page}>\n      {/* ── Hero ── */}\n      <section className={styles.hero} ref={heroRef}>\n        <motion.div className={styles.heroBg} style={{ y: heroY }} aria-hidden>\n          <div className={styles.heroBlob1} />\n          <div className={styles.heroBlob2} />\n          <div className={styles.heroGrid} />\n        </motion.div>\n\n        <div className={`container ${styles.heroInner}`}>\n          <motion.div\n            className={styles.heroContent}\n            initial={{ opacity: 0, y: 40 }}\n            animate={{ opacity: 1, y: 0 }}\n            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}\n          >\n            <motion.div\n              className={styles.heroBadge}\n              initial={{ opacity: 0, scale: 0.9 }}\n              animate={{ opacity: 1, scale: 1 }}\n              transition={{ delay: 0.1, duration: 0.4 }}\n            >\n              <span className={styles.heroBadgeDot} />\n              {t.home.hero.badge}\n            </motion.div>\n\n            <h1 className={styles.heroTitle}>\n              {t.home.hero.title.split('\\n').map((line, i) => (\n                <span key={i}>\n                  {i === 0 ? line : <em>{line}</em>}\n                  {i < t.home.hero.title.split('\\n').length - 1 && <br />}\n                </span>\n              ))}\n            </h1>\n\n            <p className={styles.heroSubtitle}>{t.home.hero.subtitle}</p>\n\n            {/* Hero search */}\n            <form className={styles.heroSearch} onSubmit={handleSearch}>\n              <div className={styles.searchInputWrap}>\n                <Search size={18} className={styles.searchIcon} />\n                <input\n                  className={styles.searchInput}\n                  placeholder={t.doctors.search.placeholder}\n                  value={searchQuery}\n                  onChange={e => setSearchQuery(e.target.value)}\n                />\n              </div>\n              <Button type=\"submit\" size=\"lg\" iconRight={<ArrowRight size={16} />}>\n                {t.home.hero.cta}\n              </Button>\n            </form>\n\n            <div className={styles.heroCtas}>\n              <Link to=\"/ai\">\n                <Button variant=\"secondary\" size=\"md\" icon={<Brain size={16} />}>\n                  {t.home.hero.ctaSecondary}\n                </Button>\n              </Link>\n              <button className={styles.watchDemo}>\n                <span className={styles.playBtn}><Play size={12} fill=\"currentColor\" /></span>\n                Watch demo\n              </button>\n            </div>\n          </motion.div>\n\n          {/* Floating preview card */}\n          <motion.div\n            className={styles.heroVisual}\n            initial={{ opacity: 0, x: 60 }}\n            animate={{ opacity: 1, x: 0 }}\n            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}\n          >\n            <div className={styles.previewCard}>\n              <div className={styles.previewHeader}>\n                <div className={styles.previewDots}>\n                  <span /><span /><span />\n                </div>\n                <span className={styles.previewTitle}>Live Consultation</span>\n              </div>\n              <div className={styles.previewChat}>\n                {[\n                  { sender: 'doctor', text: 'Hello! How can I help you today?' },\n                  { sender: 'patient', text: \"I've had a headache for 3 days.\" },\n                  { sender: 'doctor', text: 'Let me ask you a few questions to better understand your condition.' },\n                ].map((m, i) => (\n                  <motion.div\n                    key={i}\n                    className={[styles.previewMsg, m.sender === 'patient' ? styles.previewMsgRight : ''].join(' ')}\n                    initial={{ opacity: 0, y: 10 }}\n                    animate={{ opacity: 1, y: 0 }}\n                    transition={{ delay: 0.6 + i * 0.15 }}\n                  >\n                    {m.text}\n                  </motion.div>\n                ))}\n                <div className={styles.previewTyping}>\n                  <span /><span /><span />\n                </div>\n              </div>\n              <div className={styles.previewDoctorRow}>\n                <Avatar name=\"Dilnoza Yusupova\" size=\"sm\" online />\n                <div>\n                  <div className={styles.previewDoctorName}>Dr. Dilnoza Yusupova</div>\n                  <div className={styles.previewDoctorSpec}>Cardiologist · Online</div>\n                </div>\n              </div>\n            </div>\n\n            {/* Floating stat cards */}\n            <motion.div className={styles.floatStat} style={{ top: '5%', right: '-10%' }}\n              animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}>\n              <Star size={14} fill=\"currentColor\" style={{ color: '#F59E0B' }} />\n              <span>4.9 Rating</span>\n            </motion.div>\n            <motion.div className={styles.floatStat} style={{ bottom: '10%', left: '-12%' }}\n              animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 1 }}>\n              <Users size={14} />\n              <span>500+ Doctors</span>\n            </motion.div>\n          </motion.div>\n        </div>\n\n        {/* Stats strip */}\n        <div className={styles.statsStrip}>\n          <div className=\"container\">\n            <div className={styles.statsRow}>\n              {stats.map((s, i) => (\n                <div key={i} className={styles.statItem}>\n                  <div className={styles.statIcon}>{s.icon}</div>\n                  <div className={styles.statNum}>\n                    <Counter value={s.value} suffix={s.suffix} />\n                  </div>\n                  <div className={styles.statText}>{s.label}</div>\n                </div>\n              ))}\n            </div>\n          </div>\n        </div>\n      </section>\n\n      {/* ── Features ── */}\n      <section className={styles.features}>\n        <div className=\"container\">\n          <StaggerIn className={styles.sectionHeader}>\n            <motion.h2 variants={fadeUp} className={styles.sectionTitle}>{t.home.features.title}</motion.h2>\n            <motion.p variants={fadeUp} className={styles.sectionSubtitle}>{t.home.features.subtitle}</motion.p>\n          </StaggerIn>\n          <StaggerIn className={styles.featuresGrid}>\n            {features.map(f => (\n              <motion.div key={f.key} className={styles.featureCard} variants={fadeUp} whileHover={{ y: -4 }}>\n                <div className={styles.featureIcon} style={{ background: `${f.color}18`, color: f.color }}>\n                  {f.icon}\n                </div>\n                <h3>{t.home.features[f.key].title}</h3>\n                <p>{t.home.features[f.key].desc}</p>\n              </motion.div>\n            ))}\n          </StaggerIn>\n        </div>\n      </section>\n\n      {/* ── How It Works ── */}\n      <section className={styles.howItWorks}>\n        <div className=\"container\">\n          <StaggerIn className={styles.sectionHeader}>\n            <motion.h2 variants={fadeUp} className={styles.sectionTitle}>{t.home.howItWorks.title}</motion.h2>\n          </StaggerIn>\n          <div className={styles.stepsRow}>\n            {t.home.howItWorks.steps.map((step, i) => (\n              <motion.div key={i} className={styles.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}\n                viewport={{ once: true }} transition={{ delay: i * 0.12 }}>\n                <div className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</div>\n                <h3>{step.title}</h3>\n                <p>{step.desc}</p>\n                {i < t.home.howItWorks.steps.length - 1 && (\n                  <ChevronRight className={styles.stepArrow} size={20} />\n                )}\n              </motion.div>\n            ))}\n          </div>\n        </div>\n      </section>\n\n      {/* ── Top Doctors ── */}\n      <section className={styles.topDoctors}>\n        <div className=\"container\">\n          <div className={styles.sectionHeaderRow}>\n            <div>\n              <h2 className={styles.sectionTitle}>{t.home.topDoctors.title}</h2>\n            </div>\n            <Link to=\"/doctors\">\n              <Button variant=\"outline\" size=\"sm\" iconRight={<ArrowRight size={14} />}>\n                {t.home.topDoctors.viewAll}\n              </Button>\n            </Link>\n          </div>\n          <StaggerIn className={styles.doctorsGrid}>\n            {featuredDoctors.map(doc => (\n              <DoctorCard key={doc.id} doctor={doc} />\n            ))}\n          </StaggerIn>\n        </div>\n      </section>\n\n      {/* ── CTA ── */}\n      <section className={styles.ctaSection}>\n        <div className=\"container\">\n          <motion.div className={styles.ctaBox}\n            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}\n            viewport={{ once: true }} transition={{ duration: 0.6 }}>\n            <h2>{t.home.cta.title}</h2>\n            <p>{t.home.cta.subtitle}</p>\n            <Link to=\"/register\">\n              <Button size=\"xl\" variant=\"accent\" iconRight={<ArrowRight size={18} />}>\n                {t.home.cta.button}\n              </Button>\n            </Link>\n          </motion.div>\n        </div>\n      </section>\n    </div>\n  );\n}\n",
  "src/pages/HomePage.module.css": ".page { overflow: hidden; }\n\n/* ── Hero ── */\n.hero {\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  padding-top: var(--nav-height);\n}\n\n.heroBg {\n  position: absolute;\n  inset: 0;\n  z-index: 0;\n  pointer-events: none;\n}\n\n.heroBlob1 {\n  position: absolute;\n  top: -10%;\n  right: -5%;\n  width: 600px;\n  height: 600px;\n  background: radial-gradient(ellipse, rgba(45, 106, 79, 0.12) 0%, transparent 70%);\n  border-radius: 50%;\n}\n\n.heroBlob2 {\n  position: absolute;\n  bottom: 0;\n  left: -10%;\n  width: 500px;\n  height: 500px;\n  background: radial-gradient(ellipse, rgba(15, 118, 110, 0.08) 0%, transparent 70%);\n  border-radius: 50%;\n}\n\n.heroGrid {\n  position: absolute;\n  inset: 0;\n  background-image: linear-gradient(var(--color-border) 1px, transparent 1px),\n    linear-gradient(90deg, var(--color-border) 1px, transparent 1px);\n  background-size: 48px 48px;\n  opacity: 0.4;\n  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);\n}\n\n.heroInner {\n  flex: 1;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 80px;\n  align-items: center;\n  padding-top: 80px;\n  padding-bottom: 60px;\n  position: relative;\n  z-index: 1;\n}\n\n@media (max-width: 960px) {\n  .heroInner { grid-template-columns: 1fr; gap: 48px; }\n  .heroVisual { display: none; }\n}\n\n.heroContent { display: flex; flex-direction: column; gap: 24px; }\n\n.heroBadge {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  background: var(--color-primary-muted);\n  border: 1px solid rgba(45, 106, 79, 0.2);\n  color: var(--color-primary);\n  padding: 6px 14px;\n  border-radius: var(--radius-full);\n  font-size: 13px;\n  font-weight: 500;\n  width: fit-content;\n}\n\n.heroBadgeDot {\n  width: 7px;\n  height: 7px;\n  background: var(--color-primary);\n  border-radius: 50%;\n  animation: pulse 2s ease-in-out infinite;\n}\n\n.heroTitle {\n  font-family: var(--font-display);\n  font-size: clamp(40px, 5vw, 64px);\n  line-height: 1.1;\n  letter-spacing: -0.03em;\n  color: var(--color-text-primary);\n}\n\n.heroTitle em {\n  font-style: italic;\n  color: var(--color-primary);\n}\n\n.heroSubtitle {\n  font-size: 17px;\n  line-height: 1.7;\n  color: var(--color-text-secondary);\n  max-width: 520px;\n}\n\n.heroSearch {\n  display: flex;\n  gap: 10px;\n  background: var(--color-surface);\n  border: 1.5px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 6px 6px 6px 16px;\n  box-shadow: var(--shadow-md);\n  align-items: center;\n  max-width: 520px;\n}\n\n.searchInputWrap {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.searchIcon { color: var(--color-text-tertiary); flex-shrink: 0; }\n\n.searchInput {\n  flex: 1;\n  border: none;\n  outline: none;\n  background: transparent;\n  color: var(--color-text-primary);\n  font-size: 14px;\n  font-family: var(--font-body);\n}\n\n.searchInput::placeholder { color: var(--color-text-tertiary); }\n\n.heroCtas {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n\n.watchDemo {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  font-size: 14px;\n  color: var(--color-text-secondary);\n  cursor: pointer;\n  transition: color var(--transition-fast);\n  font-family: var(--font-body);\n}\n.watchDemo:hover { color: var(--color-text-primary); }\n\n.playBtn {\n  width: 36px;\n  height: 36px;\n  background: var(--color-surface);\n  border: 1.5px solid var(--color-border);\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  box-shadow: var(--shadow-sm);\n  color: var(--color-primary);\n  padding-left: 2px;\n  transition: all var(--transition-fast);\n}\n.watchDemo:hover .playBtn { box-shadow: var(--shadow-md); transform: scale(1.1); }\n\n/* ── Hero Visual ── */\n.heroVisual { position: relative; }\n\n.previewCard {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  box-shadow: var(--shadow-xl);\n  overflow: hidden;\n  max-width: 380px;\n  margin: 0 auto;\n}\n\n.previewHeader {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 14px 18px;\n  border-bottom: 1px solid var(--color-border);\n  background: var(--color-bg-tertiary);\n}\n\n.previewDots { display: flex; gap: 6px; }\n.previewDots span {\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  background: var(--color-border-strong);\n}\n.previewDots span:first-child { background: #FF5F57; }\n.previewDots span:nth-child(2) { background: #FFBD2E; }\n.previewDots span:nth-child(3) { background: #28C840; }\n\n.previewTitle { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-left: 4px; }\n\n.previewChat { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; min-height: 160px; }\n\n.previewMsg {\n  background: var(--color-bg-tertiary);\n  border-radius: 14px 14px 14px 4px;\n  padding: 9px 13px;\n  font-size: 13px;\n  line-height: 1.4;\n  color: var(--color-text-primary);\n  max-width: 85%;\n  box-shadow: var(--shadow-sm);\n}\n\n.previewMsgRight {\n  background: var(--color-primary);\n  color: white;\n  border-radius: 14px 14px 4px 14px;\n  align-self: flex-end;\n}\n\n.previewTyping {\n  display: flex;\n  gap: 4px;\n  padding: 6px 0;\n}\n\n.previewTyping span {\n  width: 6px;\n  height: 6px;\n  border-radius: 50%;\n  background: var(--color-text-tertiary);\n  animation: bounce 1.2s ease-in-out infinite;\n}\n.previewTyping span:nth-child(2) { animation-delay: 0.2s; }\n.previewTyping span:nth-child(3) { animation-delay: 0.4s; }\n\n@keyframes bounce {\n  0%, 80%, 100% { transform: translateY(0); }\n  40% { transform: translateY(-6px); }\n}\n\n.previewDoctorRow {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 12px 18px;\n  border-top: 1px solid var(--color-border);\n  background: var(--color-bg-tertiary);\n}\n\n.previewDoctorName { font-size: 13px; font-weight: 600; color: var(--color-text-primary); }\n.previewDoctorSpec { font-size: 11px; color: var(--color-primary); }\n\n.floatStat {\n  position: absolute;\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-full);\n  padding: 8px 14px;\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--color-text-primary);\n  box-shadow: var(--shadow-md);\n  white-space: nowrap;\n}\n\n/* ── Stats Strip ── */\n.statsStrip {\n  background: var(--color-surface);\n  border-top: 1px solid var(--color-border);\n  border-bottom: 1px solid var(--color-border);\n  position: relative;\n  z-index: 1;\n}\n\n.statsRow {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 0;\n}\n\n@media (max-width: 600px) { .statsRow { grid-template-columns: repeat(2, 1fr); } }\n\n.statItem {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n  padding: 28px 16px;\n  text-align: center;\n  border-right: 1px solid var(--color-border);\n}\n.statItem:last-child { border-right: none; }\n\n.statIcon { color: var(--color-primary); }\n\n.statNum {\n  font-family: var(--font-display);\n  font-size: 32px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n  letter-spacing: -0.02em;\n}\n\n.statText { font-size: 13px; color: var(--color-text-tertiary); font-weight: 500; }\n\n/* ── Sections ── */\n.features, .howItWorks, .topDoctors, .ctaSection {\n  padding: 100px 0;\n}\n\n.howItWorks { background: var(--color-bg-secondary); }\n.topDoctors { background: var(--color-bg); }\n\n.sectionHeader {\n  text-align: center;\n  margin-bottom: 60px;\n}\n\n.sectionHeaderRow {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 48px;\n}\n\n.sectionTitle {\n  font-family: var(--font-display);\n  font-size: clamp(28px, 3.5vw, 44px);\n  font-weight: 700;\n  letter-spacing: -0.025em;\n  color: var(--color-text-primary);\n  margin-bottom: 12px;\n}\n\n.sectionSubtitle {\n  font-size: 17px;\n  color: var(--color-text-secondary);\n  max-width: 500px;\n  margin: 0 auto;\n  line-height: 1.6;\n}\n\n/* ── Features Grid ── */\n.featuresGrid {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 20px;\n}\n\n@media (max-width: 960px) { .featuresGrid { grid-template-columns: repeat(2, 1fr); } }\n@media (max-width: 500px) { .featuresGrid { grid-template-columns: 1fr; } }\n\n.featureCard {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 28px;\n  transition: all var(--transition-base);\n}\n\n.featureCard:hover {\n  border-color: var(--color-primary);\n  box-shadow: var(--shadow-md);\n}\n\n.featureIcon {\n  width: 52px;\n  height: 52px;\n  border-radius: var(--radius-md);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-bottom: 20px;\n}\n\n.featureCard h3 {\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--color-text-primary);\n  margin-bottom: 8px;\n}\n\n.featureCard p {\n  font-size: 14px;\n  color: var(--color-text-secondary);\n  line-height: 1.6;\n}\n\n/* ── Steps ── */\n.stepsRow {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 0;\n  position: relative;\n}\n\n@media (max-width: 860px) { .stepsRow { grid-template-columns: repeat(2, 1fr); gap: 24px; } }\n\n.step {\n  padding: 32px 24px;\n  position: relative;\n  text-align: center;\n}\n\n.stepNum {\n  font-family: var(--font-display);\n  font-size: 48px;\n  font-weight: 700;\n  color: var(--color-primary-muted);\n  line-height: 1;\n  margin-bottom: 16px;\n}\n\n[data-theme=\"dark\"] .stepNum { color: var(--color-primary-dark); }\n\n.step h3 {\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--color-text-primary);\n  margin-bottom: 8px;\n}\n\n.step p {\n  font-size: 14px;\n  color: var(--color-text-secondary);\n  line-height: 1.6;\n}\n\n.stepArrow {\n  position: absolute;\n  top: 36px;\n  right: -10px;\n  color: var(--color-border-strong);\n  z-index: 1;\n}\n\n/* ── Doctors Grid ── */\n.doctorsGrid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}\n\n@media (max-width: 960px) { .doctorsGrid { grid-template-columns: repeat(2, 1fr); } }\n@media (max-width: 600px) { .doctorsGrid { grid-template-columns: 1fr; } }\n\n.doctorCard {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  overflow: hidden;\n  transition: all var(--transition-base);\n}\n\n.doctorCard:hover { box-shadow: var(--shadow-lg); border-color: var(--color-border-strong); }\n\n.doctorCardTop {\n  background: linear-gradient(135deg, var(--color-primary-muted), var(--color-teal-muted));\n  padding: 28px 20px 20px;\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n}\n\n.doctorAvailBadge {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: var(--color-surface);\n  border-radius: var(--radius-full);\n  padding: 4px 10px;\n  font-size: 12px;\n  font-weight: 500;\n  color: var(--color-text-secondary);\n}\n\n.availDot {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n}\n.availGreen { background: var(--color-success); animation: pulse 2s infinite; }\n.availGray { background: var(--color-text-tertiary); }\n\n.doctorCardBody {\n  padding: 20px;\n  border-bottom: 1px solid var(--color-border);\n}\n\n.doctorCardBody h3 {\n  font-size: 17px;\n  font-weight: 600;\n  color: var(--color-text-primary);\n  margin-bottom: 4px;\n}\n\n.doctorSpecialty {\n  font-size: 13px;\n  color: var(--color-primary);\n  font-weight: 500;\n  margin-bottom: 12px;\n}\n\n.doctorMeta {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 12.5px;\n  color: var(--color-text-tertiary);\n  margin-bottom: 12px;\n  flex-wrap: wrap;\n}\n\n.doctorMeta svg { color: #F59E0B; }\n\n.doctorLangs { display: flex; gap: 6px; flex-wrap: wrap; }\n\n.langTag {\n  background: var(--color-bg-tertiary);\n  border: 1px solid var(--color-border);\n  color: var(--color-text-tertiary);\n  padding: 2px 8px;\n  border-radius: var(--radius-full);\n  font-size: 11px;\n}\n\n.doctorCardFooter {\n  display: flex;\n  gap: 10px;\n  padding: 14px 20px;\n}\n\n/* ── CTA ── */\n.ctaSection {\n  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 60%, var(--color-teal) 100%);\n}\n\n.ctaBox {\n  text-align: center;\n  color: white;\n  padding: 20px 0;\n}\n\n.ctaBox h2 {\n  font-family: var(--font-display);\n  font-size: clamp(28px, 4vw, 48px);\n  font-weight: 700;\n  letter-spacing: -0.02em;\n  margin-bottom: 16px;\n}\n\n.ctaBox p {\n  font-size: 17px;\n  color: rgba(255,255,255,0.8);\n  margin-bottom: 36px;\n  max-width: 500px;\n  margin-left: auto;\n  margin-right: auto;\n}\n\n@keyframes pulse {\n  0%, 100% { opacity: 1; transform: scale(1); }\n  50% { opacity: 0.7; transform: scale(1.1); }\n}\n",
  "src/pages/AuthPage.jsx": "import { useState } from 'react';\nimport { Link, useNavigate, useLocation } from 'react-router-dom';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport { Eye, EyeOff, Mail, Lock, User, ArrowRight, Stethoscope, HeartPulse } from 'lucide-react';\nimport toast from 'react-hot-toast';\nimport { useAuthStore } from '../store';\nimport { useT } from '../i18n/useT';\nimport { Auth } from '../services';\nimport Button from '../components/common/Button';\nimport Input from '../components/common/Input';\nimport styles from './AuthPage.module.css';\n\n// ─── Shared animated panel ────────────────────────────────────────────────────\nfunction AuthLayout({ children, title, subtitle }) {\n  return (\n    <div className={styles.page}>\n      {/* Decorative left panel */}\n      <div className={styles.leftPanel}>\n        <div className={styles.leftContent}>\n          <div className={styles.brandMark}>\n            <svg width=\"48\" height=\"48\" viewBox=\"0 0 28 28\" fill=\"none\">\n              <rect width=\"28\" height=\"28\" rx=\"8\" fill=\"white\" fillOpacity=\"0.2\" />\n              <path d=\"M14 7v14M7 14h14\" stroke=\"white\" strokeWidth=\"2.5\" strokeLinecap=\"round\" />\n            </svg>\n            <span className={styles.brandName}>Healzy</span>\n          </div>\n          <div className={styles.leftHero}>\n            <h2>Healthcare<br />at your fingertips</h2>\n            <p>Connect with certified doctors, get AI-powered insights, and take control of your health — all from one platform.</p>\n          </div>\n          <div className={styles.leftStats}>\n            {[\n              { value: '500+', label: 'Doctors' },\n              { value: '50K+', label: 'Patients' },\n              { value: '4.9★', label: 'Rating' },\n            ].map(s => (\n              <div key={s.label} className={styles.stat}>\n                <span className={styles.statValue}>{s.value}</span>\n                <span className={styles.statLabel}>{s.label}</span>\n              </div>\n            ))}\n          </div>\n          {/* Floating cards decoration */}\n          <div className={styles.floatingCards}>\n            <div className={styles.floatCard} style={{ top: '20%', right: '-20px' }}>\n              <HeartPulse size={16} />\n              <span>Live consultation</span>\n            </div>\n            <div className={styles.floatCard} style={{ bottom: '30%', right: '-30px' }}>\n              <Stethoscope size={16} />\n              <span>AI Diagnosis</span>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      {/* Right form panel */}\n      <div className={styles.rightPanel}>\n        <motion.div\n          className={styles.formBox}\n          initial={{ opacity: 0, y: 24 }}\n          animate={{ opacity: 1, y: 0 }}\n          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}\n        >\n          <div className={styles.formHeader}>\n            <h1 className={styles.formTitle}>{title}</h1>\n            <p className={styles.formSubtitle}>{subtitle}</p>\n          </div>\n          {children}\n        </motion.div>\n      </div>\n    </div>\n  );\n}\n\n// ─── Login ────────────────────────────────────────────────────────────────────\nexport function LoginPage() {\n  const { t } = useT();\n  const navigate = useNavigate();\n  const location = useLocation();\n  const login = useAuthStore(s => s.login);\n  const from = location.state?.from?.pathname || '/dashboard';\n\n  const [form, setForm] = useState({ email: '', password: '' });\n  const [showPass, setShowPass] = useState(false);\n  const [errors, setErrors] = useState({});\n  const [loading, setLoading] = useState(false);\n\n  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };\n\n  const validate = () => {\n    const e = {};\n    if (!form.email) e.email = 'Email is required';\n    else if (!/\\S+@\\S+\\.\\S+/.test(form.email)) e.email = 'Invalid email';\n    if (!form.password) e.password = 'Password is required';\n    setErrors(e);\n    return !Object.keys(e).length;\n  };\n\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    if (!validate()) return;\n    setLoading(true);\n    try {\n      await Auth.getCSRF();\n      const res = await Auth.login(form);\n      login(res.data.user, res.data.token);\n      toast.success(`Welcome back, ${res.data.user.firstName}!`);\n      navigate(from, { replace: true });\n    } catch (err) {\n      const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Invalid credentials';\n      toast.error(msg);\n      setErrors({ password: msg });\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  const demoLogin = async (role) => {\n    const creds = {\n      patient: { email: 'patient@healzy.uz', password: 'password123' },\n      doctor: { email: 'doctor@healzy.uz', password: 'password123' },\n      admin: { email: 'admin@healzy.uz', password: 'password123' },\n    };\n    setForm(creds[role]);\n    setLoading(true);\n    try {\n      await Auth.getCSRF();\n      const res = await Auth.login(creds[role]);\n      login(res.data.user, res.data.token);\n      toast.success(`Signed in as ${role}!`);\n      navigate(from, { replace: true });\n    } catch {\n      toast.error('Demo login failed');\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <AuthLayout title={t.auth.login.title} subtitle={t.auth.login.subtitle}>\n      {/* Demo accounts */}\n      <div className={styles.demoSection}>\n        <span className={styles.demoLabel}>Demo accounts</span>\n        <div className={styles.demoBtns}>\n          {['patient', 'doctor', 'admin'].map(role => (\n            <button key={role} className={styles.demoBtn} onClick={() => demoLogin(role)} disabled={loading}>\n              {role.charAt(0).toUpperCase() + role.slice(1)}\n            </button>\n          ))}\n        </div>\n      </div>\n\n      <form onSubmit={handleSubmit} className={styles.form}>\n        <Input\n          label={t.auth.login.email}\n          type=\"email\"\n          value={form.email}\n          onChange={e => set('email', e.target.value)}\n          icon={<Mail size={16} />}\n          error={errors.email}\n          placeholder=\"you@example.com\"\n          autoComplete=\"email\"\n        />\n        <Input\n          label={t.auth.login.password}\n          type={showPass ? 'text' : 'password'}\n          value={form.password}\n          onChange={e => set('password', e.target.value)}\n          icon={<Lock size={16} />}\n          iconRight={\n            <button type=\"button\" onClick={() => setShowPass(s => !s)} className={styles.passToggle}>\n              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}\n            </button>\n          }\n          error={errors.password}\n          placeholder=\"••••••••\"\n          autoComplete=\"current-password\"\n        />\n\n        <div className={styles.forgotRow}>\n          <Link to=\"/reset-password\" className={styles.forgot}>{t.auth.login.forgotPassword}</Link>\n        </div>\n\n        <Button type=\"submit\" fullWidth loading={loading} size=\"lg\" iconRight={<ArrowRight size={16} />}>\n          {t.auth.login.submit}\n        </Button>\n      </form>\n\n      <p className={styles.switchAuth}>\n        {t.auth.login.noAccount}{' '}\n        <Link to=\"/register\">{t.auth.login.register}</Link>\n      </p>\n    </AuthLayout>\n  );\n}\n\n// ─── Register ─────────────────────────────────────────────────────────────────\nexport function RegisterPage() {\n  const { t } = useT();\n  const navigate = useNavigate();\n  const login = useAuthStore(s => s.login);\n\n  const [step, setStep] = useState(1); // 1: details, 2: role select\n  const [form, setForm] = useState({\n    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'patient',\n  });\n  const [showPass, setShowPass] = useState(false);\n  const [errors, setErrors] = useState({});\n  const [loading, setLoading] = useState(false);\n\n  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };\n\n  const validateStep1 = () => {\n    const e = {};\n    if (!form.firstName.trim()) e.firstName = 'Required';\n    if (!form.lastName.trim()) e.lastName = 'Required';\n    if (!form.email) e.email = 'Required';\n    else if (!/\\S+@\\S+\\.\\S+/.test(form.email)) e.email = 'Invalid email';\n    if (!form.password) e.password = 'Required';\n    else if (form.password.length < 8) e.password = 'Min 8 characters';\n    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';\n    setErrors(e);\n    return !Object.keys(e).length;\n  };\n\n  const handleNext = () => { if (validateStep1()) setStep(2); };\n\n  const handleSubmit = async () => {\n    setLoading(true);\n    try {\n      await Auth.getCSRF();\n      const res = await Auth.register(form);\n      login(res.data.user, res.data.token);\n      toast.success(`Welcome to Healzy, ${res.data.user.firstName}!`);\n      navigate('/dashboard');\n    } catch (err) {\n      const data = err?.response?.data || {};\n      const msg = data.email?.[0] || data.error || 'Registration failed';\n      toast.error(msg);\n      setStep(1);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <AuthLayout title={t.auth.register.title} subtitle={t.auth.register.subtitle}>\n      {/* Progress */}\n      <div className={styles.progress}>\n        {[1, 2].map(i => (\n          <div key={i} className={[styles.progressStep, step >= i ? styles.progressActive : ''].join(' ')} />\n        ))}\n      </div>\n\n      <AnimatePresence mode=\"wait\">\n        {step === 1 ? (\n          <motion.div\n            key=\"step1\"\n            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}\n            className={styles.form}\n          >\n            <div className={styles.nameRow}>\n              <Input label={t.auth.register.firstName} value={form.firstName}\n                onChange={e => set('firstName', e.target.value)} error={errors.firstName}\n                icon={<User size={16} />} placeholder=\"Amir\" />\n              <Input label={t.auth.register.lastName} value={form.lastName}\n                onChange={e => set('lastName', e.target.value)} error={errors.lastName}\n                placeholder=\"Karimov\" />\n            </div>\n            <Input label={t.auth.register.email} type=\"email\" value={form.email}\n              onChange={e => set('email', e.target.value)} error={errors.email}\n              icon={<Mail size={16} />} placeholder=\"you@example.com\" />\n            <Input label={t.auth.register.password}\n              type={showPass ? 'text' : 'password'} value={form.password}\n              onChange={e => set('password', e.target.value)} error={errors.password}\n              icon={<Lock size={16} />}\n              iconRight={<button type=\"button\" onClick={() => setShowPass(s => !s)} className={styles.passToggle}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>}\n              placeholder=\"Min 8 characters\" />\n            <Input label={t.auth.register.confirmPassword}\n              type={showPass ? 'text' : 'password'} value={form.confirmPassword}\n              onChange={e => set('confirmPassword', e.target.value)} error={errors.confirmPassword}\n              icon={<Lock size={16} />} placeholder=\"Repeat password\" />\n            <Button onClick={handleNext} fullWidth size=\"lg\" iconRight={<ArrowRight size={16} />}>\n              {t.common.next}\n            </Button>\n          </motion.div>\n        ) : (\n          <motion.div\n            key=\"step2\"\n            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}\n            className={styles.form}\n          >\n            <p className={styles.roleLabel}>{t.auth.register.role}</p>\n            <div className={styles.roleCards}>\n              {[\n                { value: 'patient', label: t.auth.register.patient, icon: '🏥', desc: 'Find doctors, get consultations, track your health' },\n                { value: 'doctor', label: t.auth.register.doctor, icon: '👨‍⚕️', desc: 'See patients, manage consultations, grow your practice' },\n              ].map(r => (\n                <button\n                  key={r.value}\n                  type=\"button\"\n                  className={[styles.roleCard, form.role === r.value ? styles.roleCardActive : ''].join(' ')}\n                  onClick={() => set('role', r.value)}\n                >\n                  <span className={styles.roleIcon}>{r.icon}</span>\n                  <span className={styles.roleName}>{r.label}</span>\n                  <span className={styles.roleDesc}>{r.desc}</span>\n                  {form.role === r.value && <span className={styles.roleCheck}>✓</span>}\n                </button>\n              ))}\n            </div>\n            <p className={styles.terms}>{t.auth.register.terms}</p>\n            <div className={styles.stepBtns}>\n              <Button variant=\"secondary\" onClick={() => setStep(1)} size=\"lg\">{t.common.back}</Button>\n              <Button onClick={handleSubmit} loading={loading} size=\"lg\" iconRight={<ArrowRight size={16} />} fullWidth>\n                {t.auth.register.submit}\n              </Button>\n            </div>\n          </motion.div>\n        )}\n      </AnimatePresence>\n\n      <p className={styles.switchAuth}>\n        {t.auth.register.hasAccount}{' '}\n        <Link to=\"/login\">{t.auth.register.login}</Link>\n      </p>\n    </AuthLayout>\n  );\n}\n\n// ─── Reset Password ───────────────────────────────────────────────────────────\nexport function ResetPasswordPage() {\n  const { t } = useT();\n  const [email, setEmail] = useState('');\n  const [sent, setSent] = useState(false);\n  const [loading, setLoading] = useState(false);\n\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    if (!email) return;\n    setLoading(true);\n    try {\n      await Auth.resetPasswordRequest(email);\n      setSent(true);\n      toast.success(t.auth.resetPassword.success);\n    } catch {\n      toast.error('Failed to send reset link. Check the email address.');\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <AuthLayout title={t.auth.resetPassword.title} subtitle={t.auth.resetPassword.subtitle}>\n      {sent ? (\n        <motion.div className={styles.successBox} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>\n          <div className={styles.successIcon}>✉️</div>\n          <h3>Check your email</h3>\n          <p>We sent a password reset link to <strong>{email}</strong></p>\n          <Link to=\"/login\">\n            <Button variant=\"outline\" fullWidth>{t.auth.resetPassword.back}</Button>\n          </Link>\n        </motion.div>\n      ) : (\n        <form onSubmit={handleSubmit} className={styles.form}>\n          <Input\n            label={t.auth.resetPassword.email}\n            type=\"email\"\n            value={email}\n            onChange={e => setEmail(e.target.value)}\n            icon={<Mail size={16} />}\n            placeholder=\"you@example.com\"\n          />\n          <Button type=\"submit\" fullWidth loading={loading} size=\"lg\">{t.auth.resetPassword.submit}</Button>\n          <Link to=\"/login\">\n            <Button variant=\"ghost\" fullWidth>{t.auth.resetPassword.back}</Button>\n          </Link>\n        </form>\n      )}\n    </AuthLayout>\n  );\n}\n",
  "src/pages/AuthPage.module.css": ".page {\n  min-height: 100vh;\n  display: flex;\n}\n\n/* ── Left Panel ── */\n.leftPanel {\n  flex: 0 0 44%;\n  background: linear-gradient(150deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-teal) 100%);\n  position: relative;\n  overflow: hidden;\n  display: flex;\n  align-items: center;\n  padding: 48px;\n}\n\n@media (max-width: 900px) { .leftPanel { display: none; } }\n\n.leftPanel::before {\n  content: '';\n  position: absolute;\n  inset: 0;\n  background: url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\");\n}\n\n.leftContent {\n  position: relative;\n  z-index: 1;\n  color: white;\n  width: 100%;\n}\n\n.brandMark {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 64px;\n}\n\n.brandName {\n  font-family: var(--font-display);\n  font-size: 26px;\n  font-weight: 700;\n  color: white;\n}\n\n.leftHero h2 {\n  font-family: var(--font-display);\n  font-size: 42px;\n  line-height: 1.15;\n  font-weight: 700;\n  margin-bottom: 20px;\n  letter-spacing: -0.02em;\n}\n\n.leftHero p {\n  font-size: 16px;\n  line-height: 1.7;\n  color: rgba(255, 255, 255, 0.75);\n  max-width: 340px;\n}\n\n.leftStats {\n  display: flex;\n  gap: 40px;\n  margin-top: 56px;\n}\n\n.stat { display: flex; flex-direction: column; gap: 4px; }\n\n.statValue {\n  font-family: var(--font-display);\n  font-size: 28px;\n  font-weight: 700;\n  color: white;\n}\n\n.statLabel {\n  font-size: 13px;\n  color: rgba(255, 255, 255, 0.65);\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n}\n\n.floatingCards {\n  position: absolute;\n  right: 0;\n  top: 50%;\n  transform: translateY(-50%);\n  width: 200px;\n}\n\n.floatCard {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: rgba(255,255,255,0.15);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255,255,255,0.25);\n  border-radius: 12px;\n  padding: 10px 14px;\n  font-size: 13px;\n  color: white;\n  margin-bottom: 12px;\n  position: absolute;\n  white-space: nowrap;\n  animation: breathe 4s ease-in-out infinite;\n}\n\n.floatCard:last-child { animation-delay: 2s; }\n\n/* ── Right Panel ── */\n.rightPanel {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 48px var(--space-6);\n  overflow-y: auto;\n}\n\n.formBox {\n  width: 100%;\n  max-width: 420px;\n}\n\n.formHeader { margin-bottom: 32px; }\n\n.formTitle {\n  font-family: var(--font-display);\n  font-size: 32px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n  letter-spacing: -0.02em;\n  margin-bottom: 8px;\n}\n\n.formSubtitle {\n  font-size: 15px;\n  color: var(--color-text-secondary);\n}\n\n/* ── Form Elements ── */\n.form {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n.nameRow {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 12px;\n}\n\n.forgotRow {\n  display: flex;\n  justify-content: flex-end;\n  margin-top: -4px;\n}\n\n.forgot {\n  font-size: 13px;\n  color: var(--color-text-tertiary);\n  text-decoration: none;\n}\n.forgot:hover { color: var(--color-primary); }\n\n.passToggle {\n  display: flex;\n  align-items: center;\n  color: var(--color-text-tertiary);\n  cursor: pointer;\n  pointer-events: all;\n  transition: color var(--transition-fast);\n}\n.passToggle:hover { color: var(--color-text-primary); }\n\n/* ── Demo ── */\n.demoSection {\n  background: var(--color-bg-tertiary);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-md);\n  padding: 12px 16px;\n  margin-bottom: 24px;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n\n.demoLabel {\n  font-size: 12px;\n  color: var(--color-text-tertiary);\n  font-weight: 500;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  flex-shrink: 0;\n}\n\n.demoBtns { display: flex; gap: 8px; }\n\n.demoBtn {\n  padding: 5px 14px;\n  font-size: 12px;\n  font-weight: 500;\n  border: 1px solid var(--color-border-strong);\n  border-radius: var(--radius-full);\n  background: var(--color-surface);\n  color: var(--color-text-secondary);\n  cursor: pointer;\n  transition: all var(--transition-fast);\n  font-family: var(--font-body);\n}\n.demoBtn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-muted); }\n.demoBtn:disabled { opacity: 0.5; cursor: not-allowed; }\n\n/* ── Progress ── */\n.progress {\n  display: flex;\n  gap: 8px;\n  margin-bottom: 28px;\n}\n\n.progressStep {\n  height: 4px;\n  flex: 1;\n  border-radius: var(--radius-full);\n  background: var(--color-border);\n  transition: background var(--transition-base);\n}\n\n.progressActive { background: var(--color-primary); }\n\n/* ── Role Cards ── */\n.roleLabel {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--color-text-secondary);\n  margin-bottom: -4px;\n}\n\n.roleCards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }\n\n.roleCard {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 6px;\n  padding: 16px;\n  border: 1.5px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  background: var(--color-surface);\n  cursor: pointer;\n  text-align: left;\n  transition: all var(--transition-fast);\n  font-family: var(--font-body);\n}\n\n.roleCard:hover { border-color: var(--color-primary-light); background: var(--color-primary-muted); }\n\n.roleCardActive {\n  border-color: var(--color-primary) !important;\n  background: var(--color-primary-muted) !important;\n  box-shadow: 0 0 0 3px var(--color-primary-muted);\n}\n\n.roleIcon { font-size: 24px; }\n\n.roleName {\n  font-weight: 600;\n  font-size: 14px;\n  color: var(--color-text-primary);\n}\n\n.roleDesc {\n  font-size: 12px;\n  color: var(--color-text-tertiary);\n  line-height: 1.4;\n}\n\n.roleCheck {\n  position: absolute;\n  top: 12px;\n  right: 12px;\n  width: 20px;\n  height: 20px;\n  background: var(--color-primary);\n  color: white;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 11px;\n  font-weight: 700;\n}\n\n.terms {\n  font-size: 12px;\n  color: var(--color-text-tertiary);\n  line-height: 1.6;\n  text-align: center;\n}\n\n.stepBtns {\n  display: grid;\n  grid-template-columns: auto 1fr;\n  gap: 10px;\n}\n\n/* ── Switch ── */\n.switchAuth {\n  text-align: center;\n  font-size: 14px;\n  color: var(--color-text-tertiary);\n  margin-top: 24px;\n}\n\n.switchAuth a { color: var(--color-primary); font-weight: 500; }\n\n/* ── Success Box ── */\n.successBox {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 16px;\n  text-align: center;\n}\n\n.successIcon { font-size: 48px; }\n\n.successBox h3 {\n  font-family: var(--font-display);\n  font-size: 22px;\n  color: var(--color-text-primary);\n}\n\n.successBox p {\n  color: var(--color-text-secondary);\n  font-size: 15px;\n}\n\n@keyframes breathe {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-6px); }\n}\n",
  "src/pages/DoctorsPage.jsx": "import { useState, useEffect, useCallback } from 'react';\nimport { useNavigate, useSearchParams, Link } from 'react-router-dom';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport { Search, SlidersHorizontal, Star, X, ChevronDown, MessageSquare, ArrowLeft } from 'lucide-react';\nimport { useT } from '../i18n/useT';\nimport { Doctors, Chat } from '../services';\nimport { useAuthStore } from '../store';\nimport Avatar from '../components/common/Avatar';\nimport Button from '../components/common/Button';\nimport styles from './DoctorsPage.module.css';\nimport toast from 'react-hot-toast';\n\n// ─── Doctor Card ──────────────────────────────────────────────────────────────\nfunction DoctorCard({ doctor }) {\n  const { t, language } = useT();\n  const navigate = useNavigate();\n  const { isAuthenticated } = useAuthStore();\n  const [starting, setStarting] = useState(false);\n\n  const specialty = language === 'ru' ? doctor.specialtyRu : language === 'uz' ? doctor.specialtyUz : doctor.specialty;\n\n  const handleConsult = async (e) => {\n    e.stopPropagation();\n    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: '/doctors' } } }); return; }\n    setStarting(true);\n    try {\n      const res = await Chat.startConsultation(doctor.id);\n      navigate(`/chat?conversation=${res.data.id}`);\n      toast.success(`Consultation started with Dr. ${doctor.firstName}!`);\n    } catch {\n      toast.error('Failed to start consultation. Please try again.');\n    } finally { setStarting(false); }\n  };\n\n  return (\n    <motion.div\n      className={styles.card}\n      layout\n      initial={{ opacity: 0, y: 20 }}\n      animate={{ opacity: 1, y: 0 }}\n      exit={{ opacity: 0, scale: 0.96 }}\n      whileHover={{ y: -4 }}\n      onClick={() => navigate(`/doctors/${doctor.id}`)}\n    >\n      <div className={styles.cardLeft}>\n        <div className={styles.cardAvatar}>\n          <Avatar name={`${doctor.firstName} ${doctor.lastName}`} size=\"lg\" />\n          {doctor.isVerified && <span className={styles.verifiedBadge} title=\"Verified\">✓</span>}\n        </div>\n        <div className={styles.onlineRow}>\n          <span className={[styles.onlineDot, doctor.isAvailable ? styles.online : styles.offline].join(' ')} />\n          <span className={styles.onlineText}>{doctor.isAvailable ? t.doctors.card.available : t.doctors.card.busy}</span>\n        </div>\n      </div>\n\n      <div className={styles.cardBody}>\n        <div className={styles.cardHeader}>\n          <div>\n            <h3 className={styles.cardName}>Dr. {doctor.firstName} {doctor.lastName}</h3>\n            <p className={styles.cardSpec}>{specialty}</p>\n          </div>\n          <div className={styles.ratingBadge}>\n            <Star size={13} fill=\"currentColor\" />\n            <span>{doctor.rating}</span>\n            <span className={styles.ratingCount}>({doctor.reviewCount})</span>\n          </div>\n        </div>\n\n        <p className={styles.cardBio} onClick={e => e.stopPropagation()}>\n          {(language === 'ru' ? doctor.bioRu : language === 'uz' ? doctor.bioUz : doctor.bio)?.slice(0, 120)}...\n        </p>\n\n        <div className={styles.cardStats}>\n          <span className={styles.cardStat}><strong>{doctor.experience}</strong> {t.doctors.card.experience}</span>\n          <span className={styles.cardStatDiv} />\n          <span className={styles.cardStat}><strong>{doctor.consultationCount.toLocaleString()}</strong> {t.doctors.card.consultations}</span>\n          <span className={styles.cardStatDiv} />\n          <div className={styles.langTags}>\n            {doctor.languages.slice(0, 2).map(l => <span key={l} className={styles.langTag}>{l}</span>)}\n          </div>\n        </div>\n      </div>\n\n      <div className={styles.cardActions} onClick={e => e.stopPropagation()}>\n        <div className={styles.priceTag}>\n          {doctor.price?.toLocaleString()} <span>UZS</span>\n        </div>\n        <Button variant=\"outline\" size=\"sm\" onClick={() => navigate(`/doctors/${doctor.id}`)}>\n          {t.doctors.card.viewProfile}\n        </Button>\n        <Button size=\"sm\" loading={starting} icon={<MessageSquare size={14} />} onClick={handleConsult}>\n          {t.doctors.card.bookNow}\n        </Button>\n      </div>\n    </motion.div>\n  );\n}\n\n// ─── Doctors Search Page ──────────────────────────────────────────────────────\nexport function DoctorsPage() {\n  const { t } = useT();\n  const [searchParams, setSearchParams] = useSearchParams();\n\n  const [doctors, setDoctors] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [total, setTotal] = useState(0);\n  const [filtersOpen, setFiltersOpen] = useState(false);\n\n  const [filters, setFilters] = useState({\n    search: searchParams.get('search') || '',\n    specialty: '',\n    available: false,\n    sort: 'rating',\n    minRating: '',\n  });\n\n  const fetchDoctors = useCallback(async () => {\n    setLoading(true);\n    try {\n      const params = {};\n      if (filters.search) params.search = filters.search;\n      if (filters.specialty) params.specialty = filters.specialty;\n      if (filters.available) params.available = true;\n      if (filters.sort) params.sort = filters.sort;\n      const res = await Doctors.search(params);\n      setDoctors(res.data.results || res.data);\n      setTotal(res.data.count || (res.data.results || res.data).length);\n    } catch {\n      toast.error('Failed to load doctors');\n    } finally { setLoading(false); }\n  }, [filters]);\n\n  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);\n\n  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));\n\n  const clearFilters = () => setFilters({ search: '', specialty: '', available: false, sort: 'rating', minRating: '' });\n\n  const { specialties } = t;\n\n  return (\n    <div className={styles.page}>\n      {/* Header */}\n      <div className={styles.pageHeader}>\n        <div className=\"container\">\n          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>\n            <h1 className={styles.pageTitle}>{t.doctors.search.title}</h1>\n            <p className={styles.pageSubtitle}>{t.doctors.search.subtitle}</p>\n          </motion.div>\n        </div>\n      </div>\n\n      <div className=\"container\">\n        <div className={styles.layout}>\n          {/* Sidebar Filters */}\n          <aside className={[styles.sidebar, filtersOpen ? styles.sidebarOpen : ''].join(' ')}>\n            <div className={styles.sidebarHeader}>\n              <h3>{t.doctors.search.filter || 'Filters'}</h3>\n              <button onClick={() => setFiltersOpen(false)} className={styles.closeSidebar}><X size={18} /></button>\n            </div>\n\n            <div className={styles.filterSection}>\n              <label className={styles.filterLabel}>{t.doctors.search.filterSpecialty}</label>\n              <select\n                className={styles.filterSelect}\n                value={filters.specialty}\n                onChange={e => setFilter('specialty', e.target.value)}\n              >\n                <option value=\"\">All Specialties</option>\n                {specialties.map(s => <option key={s} value={s}>{s}</option>)}\n              </select>\n            </div>\n\n            <div className={styles.filterSection}>\n              <label className={styles.filterLabel}>{t.doctors.search.sort}</label>\n              <div className={styles.sortOptions}>\n                {Object.entries(t.doctors.search.sortOptions).map(([k, label]) => (\n                  <button\n                    key={k}\n                    className={[styles.sortBtn, filters.sort === k ? styles.sortBtnActive : ''].join(' ')}\n                    onClick={() => setFilter('sort', k)}\n                  >\n                    {label}\n                  </button>\n                ))}\n              </div>\n            </div>\n\n            <div className={styles.filterSection}>\n              <label className={[styles.filterLabel, styles.checkLabel].join(' ')}>\n                <input\n                  type=\"checkbox\"\n                  checked={filters.available}\n                  onChange={e => setFilter('available', e.target.checked)}\n                  className={styles.checkbox}\n                />\n                {t.doctors.search.filterAvailable}\n              </label>\n            </div>\n\n            <Button variant=\"ghost\" size=\"sm\" onClick={clearFilters} fullWidth>\n              {t.common.clear}\n            </Button>\n          </aside>\n\n          {/* Main content */}\n          <main className={styles.main}>\n            {/* Search bar */}\n            <div className={styles.searchBar}>\n              <div className={styles.searchInputWrap}>\n                <Search size={18} className={styles.searchIcon} />\n                <input\n                  className={styles.searchInput}\n                  placeholder={t.doctors.search.placeholder}\n                  value={filters.search}\n                  onChange={e => setFilter('search', e.target.value)}\n                />\n                {filters.search && (\n                  <button onClick={() => setFilter('search', '')} className={styles.clearSearch}>\n                    <X size={16} />\n                  </button>\n                )}\n              </div>\n              <button className={styles.filterToggle} onClick={() => setFiltersOpen(o => !o)}>\n                <SlidersHorizontal size={18} />\n                {t.common.filter}\n              </button>\n            </div>\n\n            {/* Results count */}\n            <div className={styles.resultsRow}>\n              {!loading && (\n                <span className={styles.resultsCount}>\n                  <strong>{total}</strong> {t.doctors.search.results}\n                </span>\n              )}\n            </div>\n\n            {/* Doctor list */}\n            {loading ? (\n              <div className={styles.skeletonList}>\n                {[1,2,3].map(i => <div key={i} className={[styles.skeletonCard, 'skeleton'].join(' ')} />)}\n              </div>\n            ) : doctors.length === 0 ? (\n              <div className={styles.empty}>\n                <div className={styles.emptyIcon}>🔍</div>\n                <h3>{t.doctors.search.noResults}</h3>\n                <Button variant=\"outline\" onClick={clearFilters}>{t.common.clear}</Button>\n              </div>\n            ) : (\n              <AnimatePresence mode=\"popLayout\">\n                <div className={styles.doctorList}>\n                  {doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)}\n                </div>\n              </AnimatePresence>\n            )}\n          </main>\n        </div>\n      </div>\n    </div>\n  );\n}\n\n// ─── Doctor Profile Page ──────────────────────────────────────────────────────\nexport function DoctorProfilePage() {\n  const { t, language } = useT();\n  const navigate = useNavigate();\n  const { isAuthenticated } = useAuthStore();\n  const id = window.location.pathname.split('/').pop();\n\n  const [doctor, setDoctor] = useState(null);\n  const [reviews, setReviews] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [starting, setStarting] = useState(false);\n  const [activeTab, setActiveTab] = useState('about');\n\n  useEffect(() => {\n    const load = async () => {\n      setLoading(true);\n      try {\n        const [docRes, revRes] = await Promise.all([\n          Doctors.getById(id),\n          Doctors.getReviews(id),\n        ]);\n        setDoctor(docRes.data);\n        setReviews(revRes.data.results || revRes.data || []);\n      } catch {\n        toast.error('Doctor not found');\n        navigate('/doctors');\n      } finally { setLoading(false); }\n    };\n    load();\n  }, [id]);\n\n  const handleConsult = async () => {\n    if (!isAuthenticated) { navigate('/login'); return; }\n    setStarting(true);\n    try {\n      const res = await Chat.startConsultation(doctor.id);\n      navigate(`/chat?conversation=${res.data.id}`);\n      toast.success(`Consultation started!`);\n    } catch { toast.error('Failed to start consultation'); }\n    finally { setStarting(false); }\n  };\n\n  if (loading) return (\n    <div className={styles.profileLoading}>\n      <div className={`skeleton ${styles.profileSkeleton}`} />\n    </div>\n  );\n\n  if (!doctor) return null;\n\n  const specialty = language === 'ru' ? doctor.specialtyRu : language === 'uz' ? doctor.specialtyUz : doctor.specialty;\n  const bio = language === 'ru' ? doctor.bioRu : language === 'uz' ? doctor.bioUz : doctor.bio;\n\n  return (\n    <div className={styles.profilePage}>\n      <div className=\"container\">\n        <button className={styles.backBtn} onClick={() => navigate('/doctors')}>\n          <ArrowLeft size={16} /> {t.common.back}\n        </button>\n\n        <div className={styles.profileLayout}>\n          {/* Sidebar */}\n          <aside className={styles.profileSidebar}>\n            <motion.div className={styles.profileCard} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>\n              <div className={styles.profileAvatarWrap}>\n                <Avatar name={`${doctor.firstName} ${doctor.lastName}`} size=\"2xl\" />\n                {doctor.isVerified && (\n                  <div className={styles.verifiedBig}>\n                    <span>✓</span> Verified Doctor\n                  </div>\n                )}\n                <div className={[styles.availPill, doctor.isAvailable ? styles.availGreen : styles.availGray].join(' ')}>\n                  <span className={styles.availDotSmall} />\n                  {doctor.isAvailable ? t.doctors.card.available : t.doctors.card.busy}\n                </div>\n              </div>\n\n              <h2 className={styles.profileName}>Dr. {doctor.firstName} {doctor.lastName}</h2>\n              <p className={styles.profileSpec}>{specialty}</p>\n\n              <div className={styles.profileStatGrid}>\n                {[\n                  { label: t.doctors.profile.yearsOfExperience, value: doctor.experience },\n                  { label: t.doctors.profile.totalConsultations, value: doctor.consultationCount.toLocaleString() },\n                  { label: t.doctors.profile.averageRating, value: `${doctor.rating} ★` },\n                ].map(s => (\n                  <div key={s.label} className={styles.profileStat}>\n                    <span className={styles.profileStatVal}>{s.value}</span>\n                    <span className={styles.profileStatLabel}>{s.label}</span>\n                  </div>\n                ))}\n              </div>\n\n              <div className={styles.profileInfo}>\n                <div className={styles.infoRow}>\n                  <span className={styles.infoLabel}>{t.doctors.profile.languages}</span>\n                  <div className={styles.langList}>\n                    {doctor.languages.map(l => <span key={l} className={styles.langChip}>{l}</span>)}\n                  </div>\n                </div>\n                <div className={styles.infoRow}>\n                  <span className={styles.infoLabel}>{t.doctors.profile.workingHours}</span>\n                  <span className={styles.infoValue}>{doctor.workingHours}</span>\n                </div>\n              </div>\n\n              <div className={styles.profilePrice}>\n                <span className={styles.priceLabel}>Consultation fee</span>\n                <span className={styles.priceValue}>{doctor.price?.toLocaleString()} UZS</span>\n              </div>\n\n              <Button fullWidth size=\"lg\" onClick={handleConsult} loading={starting} icon={<MessageSquare size={16} />}>\n                {t.doctors.profile.startConsultation}\n              </Button>\n            </motion.div>\n          </aside>\n\n          {/* Main */}\n          <main className={styles.profileMain}>\n            {/* Tabs */}\n            <div className={styles.tabs}>\n              {['about', 'reviews'].map(tab => (\n                <button\n                  key={tab}\n                  className={[styles.tab, activeTab === tab ? styles.tabActive : ''].join(' ')}\n                  onClick={() => setActiveTab(tab)}\n                >\n                  {tab === 'about' ? t.doctors.profile.about : `${t.doctors.profile.reviews} (${reviews.length})`}\n                </button>\n              ))}\n            </div>\n\n            <AnimatePresence mode=\"wait\">\n              {activeTab === 'about' ? (\n                <motion.div key=\"about\" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.tabContent}>\n                  <div className={styles.section}>\n                    <h3>{t.doctors.profile.about}</h3>\n                    <p className={styles.bioText}>{bio}</p>\n                  </div>\n                  <div className={styles.section}>\n                    <h3>{t.doctors.profile.education}</h3>\n                    <pre className={styles.education}>{doctor.education}</pre>\n                  </div>\n                  <div className={styles.section}>\n                    <h3>{t.doctors.profile.specializations}</h3>\n                    <div className={styles.specTags}>\n                      {[specialty, 'Preventive Medicine', 'Patient Education'].map(s => (\n                        <span key={s} className={styles.specTag}>{s}</span>\n                      ))}\n                    </div>\n                  </div>\n                </motion.div>\n              ) : (\n                <motion.div key=\"reviews\" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.tabContent}>\n                  {reviews.length === 0 ? (\n                    <div className={styles.noReviews}>No reviews yet.</div>\n                  ) : (\n                    <div className={styles.reviewsList}>\n                      {reviews.map(r => (\n                        <div key={r.id} className={styles.reviewCard}>\n                          <div className={styles.reviewHeader}>\n                            <Avatar name={r.patientName} size=\"sm\" />\n                            <div>\n                              <span className={styles.reviewName}>{r.patientName}</span>\n                              <span className={styles.reviewDate}>{r.date}</span>\n                            </div>\n                            <div className={styles.reviewStars}>\n                              {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}\n                            </div>\n                          </div>\n                          <p className={styles.reviewText}>{r.comment}</p>\n                        </div>\n                      ))}\n                    </div>\n                  )}\n                </motion.div>\n              )}\n            </AnimatePresence>\n          </main>\n        </div>\n      </div>\n    </div>\n  );\n}\n",
  "src/pages/DoctorsPage.module.css": "/* ── Page Header ── */\n.page { padding-bottom: 80px; }\n\n.pageHeader {\n  background: linear-gradient(135deg, var(--color-primary-muted) 0%, var(--color-teal-muted) 100%);\n  border-bottom: 1px solid var(--color-border);\n  padding: calc(var(--nav-height) + 48px) 0 48px;\n  margin-bottom: 40px;\n}\n\n.pageTitle {\n  font-family: var(--font-display);\n  font-size: 40px;\n  font-weight: 700;\n  letter-spacing: -0.025em;\n  color: var(--color-text-primary);\n  margin-bottom: 8px;\n}\n\n.pageSubtitle { font-size: 16px; color: var(--color-text-secondary); }\n\n/* ── Layout ── */\n.layout { display: grid; grid-template-columns: 260px 1fr; gap: 32px; align-items: start; }\n\n@media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }\n\n/* ── Sidebar ── */\n.sidebar {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 20px;\n  position: sticky;\n  top: calc(var(--nav-height) + 20px);\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n}\n\n@media (max-width: 960px) {\n  .sidebar {\n    display: none;\n    position: fixed;\n    inset: 0;\n    z-index: 200;\n    overflow-y: auto;\n    border-radius: 0;\n    top: 0;\n  }\n  .sidebarOpen { display: flex; }\n}\n\n.sidebarHeader {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.sidebarHeader h3 { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }\n\n.closeSidebar {\n  display: none;\n  cursor: pointer;\n  color: var(--color-text-tertiary);\n}\n@media (max-width: 960px) { .closeSidebar { display: flex; } }\n\n.filterSection { display: flex; flex-direction: column; gap: 10px; }\n\n.filterLabel {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--color-text-tertiary);\n  text-transform: uppercase;\n  letter-spacing: 0.07em;\n}\n\n.filterSelect {\n  padding: 9px 12px;\n  border: 1.5px solid var(--color-border);\n  border-radius: var(--radius-md);\n  background: var(--color-bg);\n  color: var(--color-text-primary);\n  font-size: 13px;\n  font-family: var(--font-body);\n  outline: none;\n  cursor: pointer;\n}\n.filterSelect:focus { border-color: var(--color-primary); }\n\n.sortOptions { display: flex; flex-direction: column; gap: 4px; }\n\n.sortBtn {\n  padding: 8px 12px;\n  border-radius: var(--radius-sm);\n  font-size: 13px;\n  color: var(--color-text-secondary);\n  font-family: var(--font-body);\n  text-align: left;\n  cursor: pointer;\n  transition: all var(--transition-fast);\n}\n.sortBtn:hover { background: var(--color-bg-tertiary); color: var(--color-text-primary); }\n.sortBtnActive { background: var(--color-primary-muted); color: var(--color-primary); font-weight: 500; }\n\n.checkLabel {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n  font-size: 13px;\n  color: var(--color-text-secondary);\n  text-transform: none;\n  letter-spacing: 0;\n  font-weight: 400;\n}\n\n.checkbox { width: 16px; height: 16px; accent-color: var(--color-primary); cursor: pointer; }\n\n/* ── Main ── */\n.main { display: flex; flex-direction: column; gap: 20px; }\n\n.searchBar {\n  display: flex;\n  gap: 12px;\n  align-items: center;\n}\n\n.searchInputWrap {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  background: var(--color-surface);\n  border: 1.5px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  padding: 0 16px;\n  height: 48px;\n  transition: border-color var(--transition-fast);\n}\n.searchInputWrap:focus-within { border-color: var(--color-primary); }\n\n.searchIcon { color: var(--color-text-tertiary); flex-shrink: 0; }\n\n.searchInput {\n  flex: 1;\n  border: none;\n  outline: none;\n  background: transparent;\n  color: var(--color-text-primary);\n  font-size: 14px;\n  font-family: var(--font-body);\n}\n\n.clearSearch {\n  color: var(--color-text-tertiary);\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n}\n.clearSearch:hover { color: var(--color-text-primary); }\n\n.filterToggle {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 0 18px;\n  height: 48px;\n  background: var(--color-surface);\n  border: 1.5px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  color: var(--color-text-secondary);\n  font-size: 14px;\n  font-family: var(--font-body);\n  font-weight: 500;\n  cursor: pointer;\n  transition: all var(--transition-fast);\n  white-space: nowrap;\n}\n.filterToggle:hover { border-color: var(--color-primary); color: var(--color-primary); }\n\n@media (min-width: 961px) { .filterToggle { display: none; } }\n\n.resultsRow { display: flex; align-items: center; }\n\n.resultsCount { font-size: 14px; color: var(--color-text-tertiary); }\n.resultsCount strong { color: var(--color-text-primary); }\n\n/* ── Doctor List Cards ── */\n.doctorList { display: flex; flex-direction: column; gap: 16px; }\n\n.card {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 24px;\n  display: grid;\n  grid-template-columns: auto 1fr auto;\n  gap: 20px;\n  align-items: start;\n  cursor: pointer;\n  transition: all var(--transition-base);\n}\n\n.card:hover { box-shadow: var(--shadow-lg); border-color: var(--color-border-strong); }\n\n@media (max-width: 760px) { .card { grid-template-columns: 1fr; } }\n\n.cardLeft { display: flex; flex-direction: column; align-items: center; gap: 8px; }\n\n.cardAvatar { position: relative; }\n\n.verifiedBadge {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  width: 20px;\n  height: 20px;\n  background: var(--color-primary);\n  color: white;\n  border-radius: 50%;\n  border: 2px solid var(--color-surface);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 10px;\n  font-weight: 700;\n}\n\n.onlineRow { display: flex; align-items: center; gap: 5px; }\n\n.onlineDot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }\n.online { background: var(--color-success); }\n.offline { background: var(--color-text-tertiary); }\n.onlineText { font-size: 12px; color: var(--color-text-tertiary); white-space: nowrap; }\n\n.cardBody { display: flex; flex-direction: column; gap: 10px; min-width: 0; }\n\n.cardHeader { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }\n\n.cardName {\n  font-size: 17px;\n  font-weight: 600;\n  color: var(--color-text-primary);\n  margin-bottom: 3px;\n}\n\n.cardSpec { font-size: 13px; color: var(--color-primary); font-weight: 500; }\n\n.ratingBadge {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  background: #FEF3C7;\n  color: #92400E;\n  padding: 4px 10px;\n  border-radius: var(--radius-full);\n  font-size: 13px;\n  font-weight: 600;\n  flex-shrink: 0;\n}\n\n.ratingCount { font-weight: 400; color: #B45309; }\n\n.cardBio {\n  font-size: 13.5px;\n  color: var(--color-text-secondary);\n  line-height: 1.6;\n}\n\n.cardStats {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n\n.cardStat { font-size: 13px; color: var(--color-text-tertiary); }\n.cardStat strong { color: var(--color-text-primary); font-weight: 600; }\n\n.cardStatDiv { width: 1px; height: 14px; background: var(--color-border); }\n\n.langTags { display: flex; gap: 5px; }\n.langTag {\n  background: var(--color-bg-tertiary);\n  border: 1px solid var(--color-border);\n  color: var(--color-text-tertiary);\n  padding: 2px 7px;\n  border-radius: var(--radius-full);\n  font-size: 11px;\n}\n\n.cardActions {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  min-width: 140px;\n  align-items: stretch;\n}\n\n.priceTag {\n  text-align: center;\n  font-size: 17px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n}\n.priceTag span { font-size: 11px; font-weight: 400; color: var(--color-text-tertiary); }\n\n/* ── Skeleton / Empty ── */\n.skeletonList { display: flex; flex-direction: column; gap: 16px; }\n.skeletonCard { height: 150px; border-radius: var(--radius-xl); }\n\n.empty {\n  text-align: center;\n  padding: 80px 20px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 16px;\n}\n.emptyIcon { font-size: 48px; }\n.empty h3 { font-size: 18px; color: var(--color-text-secondary); }\n\n/* ── Profile Page ── */\n.profilePage { padding: calc(var(--nav-height) + 32px) 0 80px; }\n\n.backBtn {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 14px;\n  color: var(--color-text-secondary);\n  margin-bottom: 32px;\n  cursor: pointer;\n  font-family: var(--font-body);\n  transition: color var(--transition-fast);\n  padding: 6px 0;\n}\n.backBtn:hover { color: var(--color-primary); }\n\n.profileLayout { display: grid; grid-template-columns: 300px 1fr; gap: 32px; align-items: start; }\n\n@media (max-width: 860px) { .profileLayout { grid-template-columns: 1fr; } }\n\n.profileCard {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 28px;\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  position: sticky;\n  top: calc(var(--nav-height) + 20px);\n}\n\n.profileAvatarWrap {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 10px;\n}\n\n.verifiedBig {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  font-size: 12px;\n  color: var(--color-primary);\n  font-weight: 500;\n  background: var(--color-primary-muted);\n  padding: 4px 10px;\n  border-radius: var(--radius-full);\n}\n\n.availPill {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 12px;\n  padding: 4px 12px;\n  border-radius: var(--radius-full);\n  font-weight: 500;\n}\n.availGreen { background: var(--color-success-muted); color: var(--color-success); }\n.availGray { background: var(--color-bg-tertiary); color: var(--color-text-tertiary); }\n.availDotSmall { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }\n\n.profileName { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--color-text-primary); text-align: center; }\n.profileSpec { font-size: 14px; color: var(--color-primary); font-weight: 500; text-align: center; }\n\n.profileStatGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px 0; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }\n\n.profileStat { display: flex; flex-direction: column; align-items: center; gap: 3px; }\n.profileStatVal { font-size: 18px; font-weight: 700; color: var(--color-text-primary); }\n.profileStatLabel { font-size: 10px; color: var(--color-text-tertiary); text-align: center; line-height: 1.3; }\n\n.profileInfo { display: flex; flex-direction: column; gap: 12px; }\n\n.infoRow { display: flex; flex-direction: column; gap: 5px; }\n.infoLabel { font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-tertiary); font-weight: 600; }\n.infoValue { font-size: 13px; color: var(--color-text-primary); }\n\n.langList { display: flex; flex-wrap: wrap; gap: 5px; }\n.langChip { background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-text-secondary); padding: 3px 9px; border-radius: var(--radius-full); font-size: 12px; }\n\n.profilePrice { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--color-bg-tertiary); border-radius: var(--radius-md); }\n.priceLabel { font-size: 13px; color: var(--color-text-tertiary); }\n.priceValue { font-size: 18px; font-weight: 700; color: var(--color-text-primary); }\n\n/* ── Profile Main ── */\n.profileMain { display: flex; flex-direction: column; gap: 24px; }\n\n.tabs { display: flex; border-bottom: 2px solid var(--color-border); gap: 0; }\n\n.tab {\n  padding: 12px 24px;\n  font-size: 14px;\n  font-weight: 500;\n  color: var(--color-text-tertiary);\n  border-bottom: 2px solid transparent;\n  margin-bottom: -2px;\n  cursor: pointer;\n  font-family: var(--font-body);\n  transition: all var(--transition-fast);\n}\n.tab:hover { color: var(--color-text-primary); }\n.tabActive { color: var(--color-primary); border-bottom-color: var(--color-primary); }\n\n.tabContent { display: flex; flex-direction: column; gap: 28px; }\n\n.section h3 {\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--color-text-primary);\n  margin-bottom: 12px;\n}\n\n.bioText { font-size: 15px; line-height: 1.8; color: var(--color-text-secondary); }\n\n.education {\n  font-family: var(--font-body);\n  font-size: 14px;\n  color: var(--color-text-secondary);\n  line-height: 1.7;\n  white-space: pre-wrap;\n}\n\n.specTags { display: flex; flex-wrap: wrap; gap: 8px; }\n.specTag { background: var(--color-primary-muted); color: var(--color-primary); padding: 5px 14px; border-radius: var(--radius-full); font-size: 13px; font-weight: 500; }\n\n.reviewsList { display: flex; flex-direction: column; gap: 16px; }\n\n.reviewCard {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  padding: 18px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.reviewHeader {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.reviewName { font-size: 14px; font-weight: 600; color: var(--color-text-primary); display: block; }\n.reviewDate { font-size: 12px; color: var(--color-text-tertiary); }\n\n.reviewStars { margin-left: auto; color: #F59E0B; font-size: 14px; letter-spacing: 1px; }\n\n.reviewText { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; }\n\n.noReviews { text-align: center; padding: 48px; color: var(--color-text-tertiary); }\n\n.profileLoading { padding: calc(var(--nav-height) + 80px) 0; display: flex; justify-content: center; }\n.profileSkeleton { width: 100%; max-width: 800px; height: 400px; border-radius: var(--radius-xl); }\n",
  "src/pages/ChatPage.jsx": "import { useState, useEffect, useRef, useCallback } from 'react';\nimport { useSearchParams, useNavigate } from 'react-router-dom';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport {\n  Send, Paperclip, Phone, Video, MoreVertical,\n  Check, CheckCheck, Search, Plus, X, ArrowLeft\n} from 'lucide-react';\nimport { format, isToday, isYesterday } from 'date-fns';\nimport { useT } from '../i18n/useT';\nimport { useAuthStore, useChatStore } from '../store';\nimport { Chat as ChatAPI } from '../services';\nimport { USE_MOCK, MOCK_MESSAGES } from '../mockData';\nimport { createChatWebSocket } from '../api';\nimport Avatar from '../components/common/Avatar';\nimport styles from './ChatPage.module.css';\nimport toast from 'react-hot-toast';\n\n// Format message time\nfunction formatTime(dateStr) {\n  const d = new Date(dateStr);\n  if (isNaN(d)) return '';\n  return format(d, 'HH:mm');\n}\n\nfunction formatDay(dateStr) {\n  const d = new Date(dateStr);\n  if (isToday(d)) return 'Today';\n  if (isYesterday(d)) return 'Yesterday';\n  return format(d, 'MMM d');\n}\n\n// Group messages by date\nfunction groupByDay(messages) {\n  const groups = {};\n  messages.forEach(m => {\n    const day = format(new Date(m.sentAt), 'yyyy-MM-dd');\n    if (!groups[day]) groups[day] = [];\n    groups[day].push(m);\n  });\n  return Object.entries(groups).map(([day, msgs]) => ({ day, msgs }));\n}\n\n// ─── Conversation List Item ───────────────────────────────────────────────────\nfunction ConvItem({ conv, active, onClick }) {\n  const { user } = useAuthStore();\n  const other = user?.role === 'patient' ? conv.doctor : conv.patient;\n  const name = user?.role === 'patient'\n    ? `Dr. ${conv.doctor?.firstName} ${conv.doctor?.lastName}`\n    : `${conv.patient?.firstName} ${conv.patient?.lastName}`;\n\n  return (\n    <motion.button\n      className={[styles.convItem, active ? styles.convItemActive : ''].join(' ')}\n      onClick={onClick}\n      whileHover={{ x: 2 }}\n    >\n      <div className={styles.convAvatar}>\n        <Avatar name={name} size=\"md\" online={conv.status === 'active'} />\n      </div>\n      <div className={styles.convInfo}>\n        <div className={styles.convTop}>\n          <span className={styles.convName}>{name}</span>\n          {conv.lastMessage && (\n            <span className={styles.convTime}>{formatTime(conv.lastMessage.sentAt)}</span>\n          )}\n        </div>\n        <div className={styles.convBottom}>\n          <span className={styles.convLastMsg}>\n            {conv.lastMessage?.text || 'Consultation started'}\n          </span>\n          {conv.unreadCount > 0 && (\n            <span className={styles.unreadBadge}>{conv.unreadCount}</span>\n          )}\n        </div>\n        {conv.status === 'ended' && (\n          <span className={styles.endedChip}>Ended</span>\n        )}\n      </div>\n    </motion.button>\n  );\n}\n\n// ─── Message Bubble ───────────────────────────────────────────────────────────\nfunction MessageBubble({ message, isOwn, showAvatar, partnerName }) {\n  return (\n    <div className={[styles.msgRow, isOwn ? styles.msgRowOwn : ''].join(' ')}>\n      {!isOwn && showAvatar && (\n        <Avatar name={partnerName} size=\"xs\" />\n      )}\n      {!isOwn && !showAvatar && <div className={styles.avatarSpacer} />}\n      <div className={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther].join(' ')}>\n        {message.type === 'file' ? (\n          <div className={styles.fileMsg}>\n            <Paperclip size={14} />\n            <span>{message.fileName || 'File'}</span>\n          </div>\n        ) : (\n          <p>{message.text}</p>\n        )}\n        <div className={styles.msgMeta}>\n          <span>{formatTime(message.sentAt)}</span>\n          {isOwn && <CheckCheck size={12} className={styles.readIcon} />}\n        </div>\n      </div>\n    </div>\n  );\n}\n\n// ─── Main Chat Page ───────────────────────────────────────────────────────────\nexport default function ChatPage() {\n  const { t } = useT();\n  const { user, token } = useAuthStore();\n  const [searchParams] = useSearchParams();\n  const navigate = useNavigate();\n\n  const [conversations, setConversations] = useState([]);\n  const [activeConvId, setActiveConvId] = useState(null);\n  const [messages, setMessages] = useState([]);\n  const [text, setText] = useState('');\n  const [loading, setLoading] = useState(true);\n  const [sending, setSending] = useState(false);\n  const [typing, setTyping] = useState(false);\n  const [convSearch, setConvSearch] = useState('');\n  const [showSidebar, setShowSidebar] = useState(true);\n\n  const wsRef = useRef(null);\n  const bottomRef = useRef(null);\n  const typingTimerRef = useRef(null);\n  const inputRef = useRef(null);\n\n  const activeConv = conversations.find(c => c.id === activeConvId);\n  const partnerName = user?.role === 'patient'\n    ? `Dr. ${activeConv?.doctor?.firstName} ${activeConv?.doctor?.lastName}`\n    : `${activeConv?.patient?.firstName} ${activeConv?.patient?.lastName}`;\n\n  // Load conversations\n  useEffect(() => {\n    ChatAPI.getConversations().then(res => {\n      const convs = res.data;\n      setConversations(convs);\n      // Open conversation from URL param\n      const paramId = searchParams.get('conversation');\n      if (paramId) {\n        const id = parseInt(paramId);\n        setActiveConvId(id);\n      } else if (convs.length > 0) {\n        setActiveConvId(convs[0].id);\n      }\n    }).catch(() => toast.error('Failed to load conversations'))\n    .finally(() => setLoading(false));\n  }, []);\n\n  // Load messages when active conversation changes\n  useEffect(() => {\n    if (!activeConvId) return;\n    setMessages([]);\n    setLoading(true);\n\n    if (USE_MOCK) {\n      // Simulate loading mock messages\n      setTimeout(() => {\n        setMessages(MOCK_MESSAGES[activeConvId] || []);\n        setLoading(false);\n      }, 400);\n    } else {\n      ChatAPI.getMessages(activeConvId)\n        .then(res => setMessages(res.data.results || res.data))\n        .catch(() => toast.error('Failed to load messages'))\n        .finally(() => setLoading(false));\n    }\n\n    // Close previous WS\n    if (wsRef.current) {\n      wsRef.current.close();\n      wsRef.current = null;\n    }\n\n    // Open WebSocket (only when not mocking)\n    if (!USE_MOCK && token) {\n      const ws = createChatWebSocket(activeConvId, token);\n      wsRef.current = ws;\n\n      ws.onmessage = (event) => {\n        const data = JSON.parse(event.data);\n        if (data.type === 'chat_message') {\n          const msg = {\n            id: Date.now(),\n            conversationId: activeConvId,\n            senderId: data.sender_id,\n            text: data.message,\n            type: 'text',\n            sentAt: new Date().toISOString(),\n          };\n          setMessages(prev => [...prev, msg]);\n          // Update conversation last message\n          setConversations(prev => prev.map(c =>\n            c.id === activeConvId ? { ...c, lastMessage: msg } : c\n          ));\n        }\n        if (data.type === 'typing') {\n          if (data.sender_id !== user.id) {\n            setTyping(true);\n            clearTimeout(typingTimerRef.current);\n            typingTimerRef.current = setTimeout(() => setTyping(false), 3000);\n          }\n        }\n      };\n\n      ws.onerror = () => toast.error('Connection error');\n    }\n\n    return () => {\n      if (wsRef.current) {\n        wsRef.current.close();\n        wsRef.current = null;\n      }\n    };\n  }, [activeConvId, token]);\n\n  // Auto scroll to bottom\n  useEffect(() => {\n    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });\n  }, [messages, typing]);\n\n  const handleSend = async () => {\n    if (!text.trim() || !activeConvId || sending) return;\n\n    const msgText = text.trim();\n    setText('');\n\n    // Optimistic message\n    const optimistic = {\n      id: Date.now(),\n      conversationId: activeConvId,\n      senderId: user.id,\n      text: msgText,\n      type: 'text',\n      sentAt: new Date().toISOString(),\n    };\n    setMessages(prev => [...prev, optimistic]);\n    setConversations(prev => prev.map(c =>\n      c.id === activeConvId ? { ...c, lastMessage: optimistic } : c\n    ));\n\n    if (USE_MOCK) {\n      // Mock: simulate doctor response after delay\n      setTimeout(() => {\n        const responses = [\n          \"Thank you for sharing that. Can you tell me more?\",\n          \"I understand. How long have you been experiencing this?\",\n          \"That's helpful information. I'll note that in your record.\",\n          \"Based on what you've described, I recommend we run some tests.\",\n          \"Please don't worry — this is very common and treatable.\",\n        ];\n        const reply = {\n          id: Date.now() + 1,\n          conversationId: activeConvId,\n          senderId: activeConv?.doctor?.userId || 2,\n          text: responses[Math.floor(Math.random() * responses.length)],\n          type: 'text',\n          sentAt: new Date().toISOString(),\n        };\n        setTyping(false);\n        setMessages(prev => [...prev, reply]);\n        setConversations(prev => prev.map(c =>\n          c.id === activeConvId ? { ...c, lastMessage: reply } : c\n        ));\n      }, 1200);\n\n      // Show typing\n      setTimeout(() => setTyping(true), 300);\n      setTimeout(() => setTyping(false), 1150);\n      return;\n    }\n\n    if (wsRef.current?.readyState === WebSocket.OPEN) {\n      wsRef.current.send(JSON.stringify({ type: 'chat_message', message: msgText }));\n    }\n  };\n\n  const handleKeyDown = (e) => {\n    if (e.key === 'Enter' && !e.shiftKey) {\n      e.preventDefault();\n      handleSend();\n    }\n  };\n\n  const handleInputChange = (e) => {\n    setText(e.target.value);\n    // Send typing indicator\n    if (!USE_MOCK && wsRef.current?.readyState === WebSocket.OPEN) {\n      wsRef.current.send(JSON.stringify({ type: 'typing' }));\n    }\n  };\n\n  const filteredConvs = conversations.filter(c => {\n    const name = user?.role === 'patient'\n      ? `${c.doctor?.firstName} ${c.doctor?.lastName}`\n      : `${c.patient?.firstName} ${c.patient?.lastName}`;\n    return name.toLowerCase().includes(convSearch.toLowerCase());\n  });\n\n  const grouped = groupByDay(messages);\n\n  return (\n    <div className={styles.page}>\n      {/* ── Conversation Sidebar ── */}\n      <aside className={[styles.sidebar, showSidebar ? styles.sidebarVisible : ''].join(' ')}>\n        <div className={styles.sidebarHeader}>\n          <h2 className={styles.sidebarTitle}>{t.chat.title}</h2>\n          <button onClick={() => navigate('/doctors')} className={styles.newChatBtn} title={t.chat.newConsultation}>\n            <Plus size={18} />\n          </button>\n        </div>\n        <div className={styles.convSearch}>\n          <Search size={15} className={styles.convSearchIcon} />\n          <input\n            placeholder=\"Search...\"\n            value={convSearch}\n            onChange={e => setConvSearch(e.target.value)}\n            className={styles.convSearchInput}\n          />\n        </div>\n        <div className={styles.convList}>\n          {filteredConvs.length === 0 && !loading && (\n            <div className={styles.noConvs}>\n              <p>No conversations yet.</p>\n              <button onClick={() => navigate('/doctors')} className={styles.findDoctorBtn}>Find a Doctor</button>\n            </div>\n          )}\n          {filteredConvs.map(conv => (\n            <ConvItem\n              key={conv.id}\n              conv={conv}\n              active={conv.id === activeConvId}\n              onClick={() => { setActiveConvId(conv.id); setShowSidebar(false); }}\n            />\n          ))}\n        </div>\n      </aside>\n\n      {/* ── Chat Area ── */}\n      <main className={styles.chatArea}>\n        {!activeConvId ? (\n          <div className={styles.emptyChat}>\n            <div className={styles.emptyChatIcon}>💬</div>\n            <h3>{t.chat.noConversation}</h3>\n            <p>Start a consultation by finding a doctor.</p>\n          </div>\n        ) : (\n          <>\n            {/* Chat Header */}\n            <div className={styles.chatHeader}>\n              <button className={styles.backToList} onClick={() => setShowSidebar(true)}>\n                <ArrowLeft size={18} />\n              </button>\n              <Avatar name={partnerName} size=\"md\" online={activeConv?.status === 'active'} />\n              <div className={styles.chatHeaderInfo}>\n                <h3>{partnerName}</h3>\n                <span className={styles.chatStatus}>\n                  {activeConv?.status === 'active'\n                    ? (typing ? t.chat.typing : t.chat.online)\n                    : t.chat.offline\n                  }\n                </span>\n              </div>\n              <div className={styles.chatHeaderActions}>\n                <button className={styles.headerAction}><Phone size={18} /></button>\n                <button className={styles.headerAction}><Video size={18} /></button>\n                <button className={styles.headerAction}><MoreVertical size={18} /></button>\n              </div>\n            </div>\n\n            {/* Messages */}\n            <div className={styles.messages}>\n              {loading ? (\n                <div className={styles.msgLoading}>\n                  {[1,2,3,4].map(i => (\n                    <div key={i} className={[styles.msgSkeleton, i % 2 === 0 ? styles.msgSkeletonRight : ''].join(' ')} />\n                  ))}\n                </div>\n              ) : (\n                grouped.map(({ day, msgs }) => (\n                  <div key={day}>\n                    <div className={styles.dayDivider}>\n                      <span>{formatDay(msgs[0].sentAt)}</span>\n                    </div>\n                    {msgs.map((msg, i) => {\n                      const isOwn = msg.senderId === user.id;\n                      const showAvatar = !isOwn && (i === 0 || msgs[i-1].senderId !== msg.senderId);\n                      return (\n                        <MessageBubble\n                          key={msg.id}\n                          message={msg}\n                          isOwn={isOwn}\n                          showAvatar={showAvatar}\n                          partnerName={partnerName}\n                        />\n                      );\n                    })}\n                  </div>\n                ))\n              )}\n\n              {/* Typing indicator */}\n              <AnimatePresence>\n                {typing && (\n                  <motion.div\n                    className={styles.typingRow}\n                    initial={{ opacity: 0, y: 8 }}\n                    animate={{ opacity: 1, y: 0 }}\n                    exit={{ opacity: 0, y: 8 }}\n                  >\n                    <Avatar name={partnerName} size=\"xs\" />\n                    <div className={styles.typingBubble}>\n                      <span className={styles.typingDot} />\n                      <span className={styles.typingDot} />\n                      <span className={styles.typingDot} />\n                    </div>\n                  </motion.div>\n                )}\n              </AnimatePresence>\n\n              {activeConv?.status === 'ended' && (\n                <div className={styles.endedBanner}>{t.chat.consultationEnded}</div>\n              )}\n\n              <div ref={bottomRef} />\n            </div>\n\n            {/* Input */}\n            {activeConv?.status !== 'ended' && (\n              <div className={styles.inputArea}>\n                <button className={styles.attachBtn} title={t.chat.attachFile}>\n                  <Paperclip size={18} />\n                </button>\n                <div className={styles.textInputWrap}>\n                  <textarea\n                    ref={inputRef}\n                    className={styles.textInput}\n                    placeholder={t.chat.messagePlaceholder}\n                    value={text}\n                    onChange={handleInputChange}\n                    onKeyDown={handleKeyDown}\n                    rows={1}\n                  />\n                </div>\n                <motion.button\n                  className={[styles.sendBtn, text.trim() ? styles.sendBtnActive : ''].join(' ')}\n                  onClick={handleSend}\n                  disabled={!text.trim()}\n                  whileTap={{ scale: 0.9 }}\n                >\n                  <Send size={18} />\n                </motion.button>\n              </div>\n            )}\n          </>\n        )}\n      </main>\n    </div>\n  );\n}\n",
  "src/pages/ChatPage.module.css": ".page {\n  display: grid;\n  grid-template-columns: 320px 1fr;\n  height: calc(100vh - var(--nav-height));\n  margin-top: var(--nav-height);\n  background: var(--color-bg);\n  overflow: hidden;\n}\n\n@media (max-width: 768px) {\n  .page { grid-template-columns: 1fr; }\n  .sidebar { position: absolute; z-index: 50; inset: 0; top: var(--nav-height); display: none; }\n  .sidebarVisible { display: flex !important; }\n}\n\n/* ── Sidebar ── */\n.sidebar {\n  background: var(--color-surface);\n  border-right: 1px solid var(--color-border);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n\n.sidebarHeader {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 20px 16px 12px;\n  border-bottom: 1px solid var(--color-border);\n  flex-shrink: 0;\n}\n\n.sidebarTitle {\n  font-size: 18px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n  font-family: var(--font-display);\n}\n\n.newChatBtn {\n  width: 36px;\n  height: 36px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--color-primary);\n  color: white;\n  border-radius: var(--radius-md);\n  cursor: pointer;\n  transition: all var(--transition-fast);\n}\n.newChatBtn:hover { background: var(--color-primary-light); transform: scale(1.05); }\n\n.convSearch {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 12px;\n  margin: 8px 12px;\n  background: var(--color-bg-tertiary);\n  border-radius: var(--radius-md);\n  flex-shrink: 0;\n}\n\n.convSearchIcon { color: var(--color-text-tertiary); flex-shrink: 0; }\n\n.convSearchInput {\n  flex: 1;\n  border: none;\n  outline: none;\n  background: transparent;\n  font-size: 13px;\n  color: var(--color-text-primary);\n  font-family: var(--font-body);\n}\n.convSearchInput::placeholder { color: var(--color-text-tertiary); }\n\n.convList {\n  flex: 1;\n  overflow-y: auto;\n  padding: 4px 0;\n}\n\n.convItem {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 12px 16px;\n  width: 100%;\n  text-align: left;\n  cursor: pointer;\n  transition: all var(--transition-fast);\n  border-radius: 0;\n  font-family: var(--font-body);\n  border-bottom: 1px solid var(--color-border);\n}\n\n.convItem:hover { background: var(--color-bg-tertiary); }\n.convItemActive { background: var(--color-primary-muted) !important; }\n\n.convAvatar { flex-shrink: 0; }\n\n.convInfo { flex: 1; min-width: 0; }\n\n.convTop {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 3px;\n}\n\n.convName {\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--color-text-primary);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.convTime {\n  font-size: 11px;\n  color: var(--color-text-tertiary);\n  flex-shrink: 0;\n}\n\n.convBottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }\n\n.convLastMsg {\n  font-size: 13px;\n  color: var(--color-text-tertiary);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  flex: 1;\n}\n\n.unreadBadge {\n  background: var(--color-primary);\n  color: white;\n  border-radius: var(--radius-full);\n  font-size: 11px;\n  font-weight: 600;\n  min-width: 20px;\n  height: 20px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0 5px;\n  flex-shrink: 0;\n}\n\n.endedChip {\n  font-size: 11px;\n  background: var(--color-bg-tertiary);\n  color: var(--color-text-tertiary);\n  padding: 2px 7px;\n  border-radius: var(--radius-full);\n}\n\n.noConvs {\n  padding: 40px 20px;\n  text-align: center;\n  color: var(--color-text-tertiary);\n  font-size: 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  align-items: center;\n}\n\n.findDoctorBtn {\n  background: var(--color-primary);\n  color: white;\n  padding: 8px 18px;\n  border-radius: var(--radius-md);\n  font-size: 13px;\n  font-weight: 500;\n  cursor: pointer;\n  font-family: var(--font-body);\n  transition: background var(--transition-fast);\n}\n.findDoctorBtn:hover { background: var(--color-primary-light); }\n\n/* ── Chat Area ── */\n.chatArea {\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  background: var(--color-bg);\n}\n\n.emptyChat {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 12px;\n  color: var(--color-text-tertiary);\n}\n.emptyChatIcon { font-size: 56px; }\n.emptyChat h3 { font-size: 18px; color: var(--color-text-secondary); }\n.emptyChat p { font-size: 14px; }\n\n/* ── Chat Header ── */\n.chatHeader {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 14px 20px;\n  background: var(--color-surface);\n  border-bottom: 1px solid var(--color-border);\n  flex-shrink: 0;\n  box-shadow: var(--shadow-sm);\n}\n\n.backToList {\n  display: none;\n  align-items: center;\n  justify-content: center;\n  width: 36px;\n  height: 36px;\n  border-radius: var(--radius-md);\n  color: var(--color-text-secondary);\n  cursor: pointer;\n  transition: all var(--transition-fast);\n}\n.backToList:hover { background: var(--color-bg-tertiary); }\n@media (max-width: 768px) { .backToList { display: flex; } }\n\n.chatHeaderInfo { flex: 1; min-width: 0; }\n.chatHeaderInfo h3 { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }\n.chatStatus { font-size: 12px; color: var(--color-success); }\n\n.chatHeaderActions { display: flex; gap: 4px; }\n.headerAction {\n  width: 38px;\n  height: 38px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: var(--radius-md);\n  color: var(--color-text-tertiary);\n  cursor: pointer;\n  transition: all var(--transition-fast);\n}\n.headerAction:hover { background: var(--color-bg-tertiary); color: var(--color-text-primary); }\n\n/* ── Messages ── */\n.messages {\n  flex: 1;\n  overflow-y: auto;\n  padding: 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.dayDivider {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin: 16px 0 12px;\n}\n.dayDivider span {\n  background: var(--color-bg-tertiary);\n  border: 1px solid var(--color-border);\n  color: var(--color-text-tertiary);\n  font-size: 11px;\n  padding: 4px 12px;\n  border-radius: var(--radius-full);\n}\n\n.msgRow { display: flex; align-items: flex-end; gap: 7px; margin-bottom: 3px; }\n.msgRowOwn { flex-direction: row-reverse; }\n.avatarSpacer { width: 24px; flex-shrink: 0; }\n\n.bubble {\n  max-width: min(480px, 70%);\n  padding: 9px 14px;\n  border-radius: 18px;\n  position: relative;\n  word-break: break-word;\n}\n\n.bubble p { font-size: 14px; line-height: 1.5; margin: 0; }\n\n.bubbleOther {\n  background: var(--color-surface);\n  color: var(--color-text-primary);\n  border: 1px solid var(--color-border);\n  border-bottom-left-radius: 4px;\n  box-shadow: var(--shadow-sm);\n}\n\n.bubbleOwn {\n  background: var(--color-primary);\n  color: white;\n  border-bottom-right-radius: 4px;\n}\n\n.msgMeta {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  margin-top: 4px;\n  justify-content: flex-end;\n}\n.msgMeta span { font-size: 10px; opacity: 0.65; }\n.readIcon { opacity: 0.7; }\n\n.fileMsg {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 13px;\n  padding: 4px 0;\n}\n\n/* Typing indicator */\n.typingRow { display: flex; align-items: flex-end; gap: 7px; margin-bottom: 4px; }\n\n.typingBubble {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: 18px 18px 18px 4px;\n  padding: 12px 16px;\n  display: flex;\n  gap: 4px;\n  align-items: center;\n  box-shadow: var(--shadow-sm);\n}\n\n.typingDot {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: var(--color-text-tertiary);\n  animation: bounce 1.2s ease-in-out infinite;\n}\n.typingDot:nth-child(2) { animation-delay: 0.2s; }\n.typingDot:nth-child(3) { animation-delay: 0.4s; }\n\n@keyframes bounce {\n  0%, 80%, 100% { transform: translateY(0); }\n  40% { transform: translateY(-5px); }\n}\n\n.endedBanner {\n  text-align: center;\n  padding: 10px 20px;\n  background: var(--color-bg-tertiary);\n  border-radius: var(--radius-full);\n  font-size: 13px;\n  color: var(--color-text-tertiary);\n  margin: 10px auto;\n  border: 1px solid var(--color-border);\n}\n\n/* Skeleton loading */\n.msgLoading { display: flex; flex-direction: column; gap: 12px; }\n.msgSkeleton { height: 44px; border-radius: 18px; background: var(--color-bg-tertiary); width: 60%; animation: shimmer 1.5s infinite; background-size: 200% 100%; background-image: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-border) 50%, var(--color-bg-tertiary) 75%); }\n.msgSkeletonRight { align-self: flex-end; }\n\n/* ── Input Area ── */\n.inputArea {\n  display: flex;\n  align-items: flex-end;\n  gap: 10px;\n  padding: 14px 16px;\n  background: var(--color-surface);\n  border-top: 1px solid var(--color-border);\n  flex-shrink: 0;\n}\n\n.attachBtn {\n  width: 40px;\n  height: 40px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: var(--radius-md);\n  color: var(--color-text-tertiary);\n  cursor: pointer;\n  transition: all var(--transition-fast);\n  flex-shrink: 0;\n}\n.attachBtn:hover { background: var(--color-bg-tertiary); color: var(--color-text-primary); }\n\n.textInputWrap {\n  flex: 1;\n  background: var(--color-bg-tertiary);\n  border: 1.5px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  padding: 10px 14px;\n  transition: border-color var(--transition-fast);\n}\n.textInputWrap:focus-within { border-color: var(--color-primary); }\n\n.textInput {\n  width: 100%;\n  border: none;\n  outline: none;\n  background: transparent;\n  color: var(--color-text-primary);\n  font-size: 14px;\n  font-family: var(--font-body);\n  resize: none;\n  max-height: 120px;\n  line-height: 1.5;\n}\n.textInput::placeholder { color: var(--color-text-tertiary); }\n\n.sendBtn {\n  width: 44px;\n  height: 44px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: var(--radius-md);\n  background: var(--color-bg-tertiary);\n  color: var(--color-text-tertiary);\n  cursor: pointer;\n  transition: all var(--transition-fast);\n  flex-shrink: 0;\n}\n\n.sendBtnActive {\n  background: var(--color-primary);\n  color: white;\n  box-shadow: var(--shadow-primary);\n}\n.sendBtnActive:hover { background: var(--color-primary-light); }\n\n@keyframes shimmer {\n  0% { background-position: -200% 0; }\n  100% { background-position: 200% 0; }\n}\n",
  "src/pages/AIPage.jsx": "import { useState, useRef, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport { Send, Mic, MicOff, Volume2, VolumeX, Plus, Trash2, Image, AlertCircle } from 'lucide-react';\nimport { useT } from '../i18n/useT';\nimport { useAIStore } from '../store';\nimport Button from '../components/common/Button';\nimport styles from './AIPage.module.css';\n\n// ─── Mock AI Response Generator ───────────────────────────────────────────────\nconst MOCK_RESPONSES = {\n  headache: \"Based on your description, there are several possible causes for your headache:\\n\\n**Tension headache** — the most common type, often caused by stress, poor posture, or eye strain.\\n\\n**Dehydration** — even mild dehydration can cause headaches. Try drinking 2-3 glasses of water.\\n\\n**Recommendation:** Rest in a quiet, dark room, apply a cold compress, and take an OTC pain reliever if needed. If the headache is severe, sudden, or accompanied by fever/vision changes, please see a doctor immediately.\\n\\n⚠️ *This is general information only. Please consult a doctor for proper diagnosis.*\",\n  cold: \"Common cold symptoms typically include:\\n\\n• Runny or stuffy nose\\n• Sore throat\\n• Cough\\n• Mild headache\\n• Low-grade fever (usually below 38.5°C)\\n• Sneezing\\n• Fatigue\\n\\n**Treatment:** Rest, fluids, and OTC cold medicines can help manage symptoms. Most colds resolve within 7-10 days.\\n\\n⚠️ *See a doctor if symptoms worsen or persist beyond 10 days.*\",\n  pressure: \"Managing high blood pressure (hypertension) involves several strategies:\\n\\n1. **Diet** — Reduce sodium, eat more fruits, vegetables, and whole grains (DASH diet)\\n2. **Exercise** — 150 minutes of moderate activity per week\\n3. **Weight management** — Even 5-10 lbs loss can lower BP significantly\\n4. **Limit alcohol** and **quit smoking**\\n5. **Stress management** — Meditation, yoga, deep breathing\\n6. **Medication** — If prescribed, take consistently\\n\\nRegular monitoring at home is important. Target: below 130/80 mmHg.\\n\\n⚠️ *Always follow your doctor's specific advice for your situation.*\",\n  vitamins: \"Essential daily vitamins and minerals for general health:\\n\\n**For most adults:**\\n• **Vitamin D** (1000-2000 IU) — Most people are deficient\\n• **Vitamin B12** (2.4 mcg) — Especially important for vegetarians\\n• **Magnesium** (310-420 mg) — Supports 300+ body functions\\n• **Omega-3 fatty acids** — Heart and brain health\\n• **Vitamin C** (75-90 mg) — Immune support\\n\\n**Best source:** A balanced diet with varied whole foods. Supplements should complement, not replace, good nutrition.\\n\\n⚠️ *Consult your doctor before starting any supplement regimen, especially if you take medications.*\",\n  default: \"Thank you for your question. As an AI health assistant, I can provide general health information, but please remember that this is not a substitute for professional medical advice.\\n\\nBased on what you've described, I'd recommend:\\n\\n1. **Monitor your symptoms** carefully and note any changes\\n2. **Stay hydrated** and get adequate rest\\n3. **Consult a doctor** if symptoms persist or worsen\\n4. **Avoid self-medicating** without professional guidance\\n\\nFor a proper diagnosis and personalized treatment plan, I encourage you to book a consultation with one of our qualified doctors on the Healzy platform.\\n\\n⚠️ *This information is for educational purposes only and does not constitute medical advice.*\",\n};\n\nasync function getMockResponse(text) {\n  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));\n  const lower = text.toLowerCase();\n  if (lower.includes('headache') || lower.includes('голова') || lower.includes('bosh')) return MOCK_RESPONSES.headache;\n  if (lower.includes('cold') || lower.includes('flu') || lower.includes('простуд') || lower.includes('shamollash')) return MOCK_RESPONSES.cold;\n  if (lower.includes('pressure') || lower.includes('hypertension') || lower.includes('давлени') || lower.includes('bosim')) return MOCK_RESPONSES.pressure;\n  if (lower.includes('vitamin') || lower.includes('витамин')) return MOCK_RESPONSES.vitamins;\n  return MOCK_RESPONSES.default;\n}\n\n// ─── Markdown-ish renderer ─────────────────────────────────────────────────────\nfunction MessageText({ text }) {\n  const lines = text.split('\\n');\n  return (\n    <div className={styles.msgText}>\n      {lines.map((line, i) => {\n        if (!line.trim()) return <br key={i} />;\n        const bold = line.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');\n        if (line.startsWith('• ') || line.startsWith('- ')) {\n          return <li key={i} dangerouslySetInnerHTML={{ __html: bold.slice(2) }} />;\n        }\n        if (/^\\d+\\./.test(line)) {\n          return <li key={i} dangerouslySetInnerHTML={{ __html: bold.replace(/^\\d+\\.\\s/, '') }} />;\n        }\n        return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} />;\n      })}\n    </div>\n  );\n}\n\n// ─── Main AI Page ─────────────────────────────────────────────────────────────\nexport default function AIPage() {\n  const { t } = useT();\n  const { dialogues, activeDialogueId, isLoading, createDialogue, addMessage, setActiveDialogue, setLoading } = useAIStore();\n\n  const [text, setText] = useState('');\n  const [isRecording, setIsRecording] = useState(false);\n  const [isSpeaking, setIsSpeaking] = useState(false);\n  const [voiceEnabled, setVoiceEnabled] = useState(false);\n  const [imageFile, setImageFile] = useState(null);\n\n  const bottomRef = useRef(null);\n  const textareaRef = useRef(null);\n  const recognitionRef = useRef(null);\n  const fileInputRef = useRef(null);\n\n  const activeDialogue = dialogues.find(d => d.id === activeDialogueId);\n\n  // Auto scroll\n  useEffect(() => {\n    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });\n  }, [activeDialogue?.messages]);\n\n  // Voice Recognition setup\n  useEffect(() => {\n    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;\n    if (SpeechRecognition) {\n      recognitionRef.current = new SpeechRecognition();\n      recognitionRef.current.continuous = false;\n      recognitionRef.current.interimResults = false;\n\n      recognitionRef.current.onresult = (event) => {\n        const transcript = event.results[0][0].transcript;\n        setText(prev => prev + (prev ? ' ' : '') + transcript);\n        setIsRecording(false);\n      };\n\n      recognitionRef.current.onerror = () => {\n        setIsRecording(false);\n      };\n\n      recognitionRef.current.onend = () => {\n        setIsRecording(false);\n      };\n    }\n  }, []);\n\n  const startNewDialogue = () => {\n    const newDialogue = {\n      id: Date.now(),\n      title: 'New consultation',\n      createdAt: new Date().toISOString(),\n      messages: [],\n    };\n    createDialogue(newDialogue);\n  };\n\n  const handleSend = async () => {\n    if ((!text.trim() && !imageFile) || isLoading) return;\n\n    let dialogue = activeDialogue;\n    if (!dialogue) {\n      const newDialogue = {\n        id: Date.now(),\n        title: text.slice(0, 40) || 'Image consultation',\n        createdAt: new Date().toISOString(),\n        messages: [],\n      };\n      createDialogue(newDialogue);\n      dialogue = newDialogue;\n    }\n\n    const userMsg = {\n      id: Date.now(),\n      role: 'user',\n      text: text.trim(),\n      imageFile: imageFile ? URL.createObjectURL(imageFile) : null,\n      sentAt: new Date().toISOString(),\n    };\n\n    addMessage(dialogue.id, userMsg);\n    setText('');\n    setImageFile(null);\n    setLoading(true);\n\n    try {\n      // Use mock response; swap getMockResponse for real API call when backend ready\n      const responseText = await getMockResponse(userMsg.text);\n\n      const aiMsg = {\n        id: Date.now() + 1,\n        role: 'assistant',\n        text: responseText,\n        sentAt: new Date().toISOString(),\n      };\n      addMessage(dialogue.id, aiMsg);\n\n      // TTS\n      if (voiceEnabled && 'speechSynthesis' in window) {\n        const utterance = new SpeechSynthesisUtterance(\n          responseText.replace(/\\*\\*(.*?)\\*\\*/g, '$1').replace(/[•⚠️]/g, '').trim()\n        );\n        utterance.rate = 0.9;\n        utterance.onstart = () => setIsSpeaking(true);\n        utterance.onend = () => setIsSpeaking(false);\n        window.speechSynthesis.speak(utterance);\n      }\n    } catch {\n      addMessage(dialogue.id, {\n        id: Date.now() + 1,\n        role: 'assistant',\n        text: t.ai.errorMessage,\n        sentAt: new Date().toISOString(),\n        isError: true,\n      });\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  const handleKeyDown = (e) => {\n    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }\n  };\n\n  const toggleRecording = () => {\n    if (!recognitionRef.current) {\n      alert('Voice recognition not supported in your browser. Try Chrome.');\n      return;\n    }\n    if (isRecording) {\n      recognitionRef.current.stop();\n      setIsRecording(false);\n    } else {\n      recognitionRef.current.start();\n      setIsRecording(true);\n    }\n  };\n\n  const stopSpeaking = () => {\n    window.speechSynthesis?.cancel();\n    setIsSpeaking(false);\n  };\n\n  const messages = activeDialogue?.messages || [];\n\n  return (\n    <div className={styles.page}>\n      {/* ── Left sidebar - history ── */}\n      <aside className={styles.sidebar}>\n        <div className={styles.sidebarHeader}>\n          <h2>{t.ai.history}</h2>\n          <button className={styles.newChatBtn} onClick={startNewDialogue}>\n            <Plus size={16} />\n            {t.ai.newChat}\n          </button>\n        </div>\n        <div className={styles.dialogueList}>\n          {dialogues.length === 0 && (\n            <div className={styles.noDialogues}>Start your first AI health conversation</div>\n          )}\n          {dialogues.map(d => (\n            <button\n              key={d.id}\n              className={[styles.dialogueItem, d.id === activeDialogueId ? styles.dialogueActive : ''].join(' ')}\n              onClick={() => setActiveDialogue(d.id)}\n            >\n              <span className={styles.dialogueTitle}>{d.title}</span>\n              <span className={styles.dialogueDate}>{new Date(d.createdAt).toLocaleDateString()}</span>\n            </button>\n          ))}\n        </div>\n      </aside>\n\n      {/* ── Main chat ── */}\n      <main className={styles.main}>\n        {/* Header */}\n        <div className={styles.header}>\n          <div className={styles.headerLeft}>\n            <div className={styles.aiLogo}>\n              <span>✦</span>\n            </div>\n            <div>\n              <h1 className={styles.headerTitle}>{t.ai.title}</h1>\n              <p className={styles.headerSub}>{t.ai.subtitle}</p>\n            </div>\n          </div>\n          <div className={styles.headerActions}>\n            <button\n              className={[styles.voiceToggle, voiceEnabled ? styles.voiceToggleOn : ''].join(' ')}\n              onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) stopSpeaking(); }}\n              title=\"Toggle voice responses\"\n            >\n              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}\n              {voiceEnabled ? 'Voice On' : 'Voice Off'}\n            </button>\n          </div>\n        </div>\n\n        {/* Messages */}\n        <div className={styles.messages}>\n          {messages.length === 0 ? (\n            <div className={styles.welcome}>\n              <motion.div className={styles.welcomeIcon} animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>\n                🏥\n              </motion.div>\n              <h2>How can I help you today?</h2>\n              <p className={styles.welcomeDesc}>{t.ai.subtitle}</p>\n\n              {/* Quick suggestions */}\n              <div className={styles.suggestions}>\n                <p className={styles.suggestLabel}>{t.ai.suggestions.title}</p>\n                <div className={styles.suggestGrid}>\n                  {t.ai.suggestions.items.map((item, i) => (\n                    <button key={i} className={styles.suggestBtn} onClick={() => setText(item)}>\n                      {item}\n                    </button>\n                  ))}\n                </div>\n              </div>\n            </div>\n          ) : (\n            messages.map((msg, i) => (\n              <motion.div\n                key={msg.id}\n                className={[styles.msgRow, msg.role === 'user' ? styles.msgUser : styles.msgAI].join(' ')}\n                initial={{ opacity: 0, y: 12 }}\n                animate={{ opacity: 1, y: 0 }}\n                transition={{ duration: 0.3 }}\n              >\n                {msg.role === 'assistant' && (\n                  <div className={styles.aiAvatar}><span>✦</span></div>\n                )}\n                <div className={[styles.bubble, msg.isError ? styles.bubbleError : ''].join(' ')}>\n                  {msg.imageFile && (\n                    <img src={msg.imageFile} alt=\"Uploaded\" className={styles.uploadedImg} />\n                  )}\n                  {msg.role === 'user' ? (\n                    <p>{msg.text}</p>\n                  ) : (\n                    <MessageText text={msg.text} />\n                  )}\n                  <span className={styles.time}>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>\n                </div>\n              </motion.div>\n            ))\n          )}\n\n          {/* Loading */}\n          <AnimatePresence>\n            {isLoading && (\n              <motion.div className={[styles.msgRow, styles.msgAI].join(' ')}\n                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>\n                <div className={styles.aiAvatar}><span>✦</span></div>\n                <div className={styles.thinkingBubble}>\n                  <span className={styles.thinkingDot} />\n                  <span className={styles.thinkingDot} />\n                  <span className={styles.thinkingDot} />\n                  <span className={styles.thinkingLabel}>{t.ai.thinking}</span>\n                </div>\n              </motion.div>\n            )}\n          </AnimatePresence>\n\n          <div ref={bottomRef} />\n        </div>\n\n        {/* Disclaimer */}\n        <div className={styles.disclaimer}>\n          <AlertCircle size={13} />\n          <span>{t.ai.disclaimer}</span>\n        </div>\n\n        {/* Input */}\n        <div className={styles.inputArea}>\n          {/* Image preview */}\n          <AnimatePresence>\n            {imageFile && (\n              <motion.div className={styles.imagePreview} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>\n                <img src={URL.createObjectURL(imageFile)} alt=\"Preview\" />\n                <button onClick={() => setImageFile(null)} className={styles.removeImage}><X size={14} /></button>\n                <span className={styles.imageName}>{imageFile.name}</span>\n              </motion.div>\n            )}\n          </AnimatePresence>\n\n          <div className={styles.inputRow}>\n            <div className={styles.textWrap}>\n              <textarea\n                ref={textareaRef}\n                className={styles.textarea}\n                placeholder={isRecording ? '🎙 Listening...' : t.ai.placeholder}\n                value={text}\n                onChange={e => setText(e.target.value)}\n                onKeyDown={handleKeyDown}\n                rows={1}\n                disabled={isLoading}\n              />\n            </div>\n\n            <div className={styles.inputActions}>\n              {/* Image upload */}\n              <button className={styles.actionBtn} onClick={() => fileInputRef.current?.click()} title={t.ai.uploadImage}>\n                <Image size={18} />\n              </button>\n              <input\n                ref={fileInputRef}\n                type=\"file\"\n                accept=\"image/*\"\n                className={styles.hiddenInput}\n                onChange={e => setImageFile(e.target.files[0])}\n              />\n\n              {/* Voice */}\n              <motion.button\n                className={[styles.actionBtn, isRecording ? styles.recording : ''].join(' ')}\n                onClick={toggleRecording}\n                title={isRecording ? t.ai.voiceStop : t.ai.voiceStart}\n                animate={isRecording ? { scale: [1, 1.1, 1] } : {}}\n                transition={{ repeat: Infinity, duration: 1 }}\n              >\n                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}\n              </motion.button>\n\n              {/* Stop speaking */}\n              {isSpeaking && (\n                <button className={[styles.actionBtn, styles.speakingBtn].join(' ')} onClick={stopSpeaking}>\n                  <VolumeX size={18} />\n                </button>\n              )}\n\n              {/* Send */}\n              <motion.button\n                className={[styles.sendBtn, (text.trim() || imageFile) ? styles.sendBtnActive : ''].join(' ')}\n                onClick={handleSend}\n                disabled={(!text.trim() && !imageFile) || isLoading}\n                whileTap={{ scale: 0.9 }}\n              >\n                <Send size={18} />\n              </motion.button>\n            </div>\n          </div>\n        </div>\n      </main>\n    </div>\n  );\n}\n",
  "src/pages/AIPage.module.css": ".page {\n  display: grid;\n  grid-template-columns: 260px 1fr;\n  height: calc(100vh - var(--nav-height));\n  margin-top: var(--nav-height);\n  overflow: hidden;\n}\n\n@media (max-width: 768px) { .page { grid-template-columns: 1fr; } }\n\n/* ── Sidebar ── */\n.sidebar {\n  background: var(--color-surface);\n  border-right: 1px solid var(--color-border);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n\n@media (max-width: 768px) { .sidebar { display: none; } }\n\n.sidebarHeader {\n  padding: 20px 16px;\n  border-bottom: 1px solid var(--color-border);\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  flex-shrink: 0;\n}\n\n.sidebarHeader h2 { font-size: 16px; font-weight: 700; color: var(--color-text-primary); }\n\n.newChatBtn {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 9px 14px;\n  background: var(--color-primary);\n  color: white;\n  border-radius: var(--radius-md);\n  font-size: 13px;\n  font-weight: 500;\n  cursor: pointer;\n  font-family: var(--font-body);\n  transition: background var(--transition-fast);\n}\n.newChatBtn:hover { background: var(--color-primary-light); }\n\n.dialogueList { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 4px; }\n\n.noDialogues { padding: 32px 16px; text-align: center; font-size: 13px; color: var(--color-text-tertiary); line-height: 1.6; }\n\n.dialogueItem {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  padding: 10px 12px;\n  border-radius: var(--radius-md);\n  text-align: left;\n  cursor: pointer;\n  font-family: var(--font-body);\n  transition: all var(--transition-fast);\n  border: 1px solid transparent;\n}\n.dialogueItem:hover { background: var(--color-bg-tertiary); }\n.dialogueActive { background: var(--color-primary-muted); border-color: rgba(45,106,79,0.2); }\n\n.dialogueTitle { font-size: 13px; font-weight: 500; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.dialogueDate { font-size: 11px; color: var(--color-text-tertiary); }\n\n/* ── Main ── */\n.main {\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  background: var(--color-bg);\n}\n\n.header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px 24px;\n  background: var(--color-surface);\n  border-bottom: 1px solid var(--color-border);\n  flex-shrink: 0;\n}\n\n.headerLeft { display: flex; align-items: center; gap: 14px; }\n\n.aiLogo {\n  width: 44px;\n  height: 44px;\n  background: linear-gradient(135deg, var(--color-primary), var(--color-teal));\n  border-radius: var(--radius-lg);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 22px;\n  color: white;\n  box-shadow: var(--shadow-primary);\n}\n\n.headerTitle { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--color-text-primary); }\n.headerSub { font-size: 12px; color: var(--color-text-tertiary); margin-top: 2px; }\n\n.headerActions { display: flex; gap: 10px; }\n\n.voiceToggle {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 7px 14px;\n  border: 1.5px solid var(--color-border);\n  border-radius: var(--radius-full);\n  font-size: 12px;\n  font-weight: 500;\n  color: var(--color-text-tertiary);\n  cursor: pointer;\n  font-family: var(--font-body);\n  transition: all var(--transition-fast);\n}\n.voiceToggle:hover { border-color: var(--color-primary); color: var(--color-primary); }\n.voiceToggleOn { background: var(--color-primary-muted); border-color: var(--color-primary); color: var(--color-primary); }\n\n/* ── Messages ── */\n.messages {\n  flex: 1;\n  overflow-y: auto;\n  padding: 24px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n/* Welcome state */\n.welcome {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 16px;\n  padding: 40px 20px;\n  text-align: center;\n  max-width: 560px;\n  margin: auto;\n}\n\n.welcomeIcon { font-size: 56px; }\n\n.welcome h2 {\n  font-family: var(--font-display);\n  font-size: 28px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n}\n\n.welcomeDesc { font-size: 15px; color: var(--color-text-secondary); line-height: 1.6; }\n\n.suggestions { width: 100%; text-align: left; }\n\n.suggestLabel { font-size: 12px; font-weight: 600; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }\n\n.suggestGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }\n\n.suggestBtn {\n  padding: 12px 16px;\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  font-size: 13px;\n  color: var(--color-text-secondary);\n  cursor: pointer;\n  text-align: left;\n  font-family: var(--font-body);\n  transition: all var(--transition-fast);\n  line-height: 1.4;\n}\n.suggestBtn:hover { border-color: var(--color-primary); background: var(--color-primary-muted); color: var(--color-primary); }\n\n/* Message rows */\n.msgRow { display: flex; gap: 12px; align-items: flex-start; }\n.msgUser { flex-direction: row-reverse; }\n\n.aiAvatar {\n  width: 36px;\n  height: 36px;\n  background: linear-gradient(135deg, var(--color-primary), var(--color-teal));\n  border-radius: var(--radius-md);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 16px;\n  color: white;\n  flex-shrink: 0;\n}\n\n.bubble {\n  max-width: min(600px, 75%);\n  padding: 13px 16px;\n  border-radius: 18px;\n  position: relative;\n}\n\n.msgAI .bubble {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-top-left-radius: 4px;\n  box-shadow: var(--shadow-sm);\n}\n\n.msgUser .bubble {\n  background: var(--color-primary);\n  color: white;\n  border-top-right-radius: 4px;\n}\n\n.msgUser .bubble p { font-size: 14px; line-height: 1.5; color: white; margin: 0; }\n\n.bubbleError { border-color: var(--color-error) !important; background: var(--color-error-muted) !important; }\n\n.msgText { font-size: 14px; line-height: 1.7; color: var(--color-text-primary); }\n.msgText p { margin: 0 0 6px; }\n.msgText li { margin: 3px 0 3px 18px; color: var(--color-text-secondary); }\n.msgText strong { color: var(--color-text-primary); }\n\n.uploadedImg { max-width: 200px; border-radius: 10px; margin-bottom: 8px; }\n\n.time { display: block; font-size: 10px; color: var(--color-text-tertiary); margin-top: 6px; text-align: right; }\n.msgUser .time { color: rgba(255,255,255,0.6); }\n\n/* Thinking bubble */\n.thinkingBubble {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: 18px 18px 18px 4px;\n  padding: 14px 18px;\n  box-shadow: var(--shadow-sm);\n}\n\n.thinkingDot {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: var(--color-primary);\n  animation: bounce 1.2s ease-in-out infinite;\n}\n.thinkingDot:nth-child(2) { animation-delay: 0.2s; background: var(--color-teal); }\n.thinkingDot:nth-child(3) { animation-delay: 0.4s; }\n\n.thinkingLabel { font-size: 12px; color: var(--color-text-tertiary); margin-left: 4px; }\n\n@keyframes bounce {\n  0%, 80%, 100% { transform: translateY(0); }\n  40% { transform: translateY(-5px); }\n}\n\n/* ── Disclaimer ── */\n.disclaimer {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  padding: 8px 24px;\n  font-size: 11px;\n  color: var(--color-text-tertiary);\n  background: var(--color-bg-tertiary);\n  border-top: 1px solid var(--color-border);\n  flex-shrink: 0;\n}\n\n/* ── Input Area ── */\n.inputArea {\n  background: var(--color-surface);\n  border-top: 1px solid var(--color-border);\n  padding: 14px 20px;\n  flex-shrink: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.imagePreview {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px;\n  background: var(--color-bg-tertiary);\n  border-radius: var(--radius-md);\n  overflow: hidden;\n}\n\n.imagePreview img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; }\n\n.imageName { font-size: 12px; color: var(--color-text-secondary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n\n.removeImage {\n  width: 24px;\n  height: 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 50%;\n  background: var(--color-border-strong);\n  color: var(--color-text-secondary);\n  cursor: pointer;\n  transition: all var(--transition-fast);\n  flex-shrink: 0;\n}\n.removeImage:hover { background: var(--color-error); color: white; }\n\n.inputRow {\n  display: flex;\n  gap: 10px;\n  align-items: flex-end;\n}\n\n.textWrap {\n  flex: 1;\n  background: var(--color-bg-tertiary);\n  border: 1.5px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  padding: 10px 14px;\n  transition: border-color var(--transition-fast);\n}\n.textWrap:focus-within { border-color: var(--color-primary); }\n\n.textarea {\n  width: 100%;\n  border: none;\n  outline: none;\n  background: transparent;\n  color: var(--color-text-primary);\n  font-size: 14px;\n  font-family: var(--font-body);\n  resize: none;\n  max-height: 120px;\n  line-height: 1.5;\n}\n.textarea::placeholder { color: var(--color-text-tertiary); }\n\n.inputActions { display: flex; gap: 6px; align-items: flex-end; }\n\n.actionBtn {\n  width: 40px;\n  height: 40px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: var(--radius-md);\n  color: var(--color-text-tertiary);\n  cursor: pointer;\n  transition: all var(--transition-fast);\n  border: 1.5px solid var(--color-border);\n  background: var(--color-surface);\n}\n.actionBtn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-muted); }\n\n.recording {\n  background: var(--color-error-muted);\n  border-color: var(--color-error);\n  color: var(--color-error);\n  animation: recordPulse 1.5s infinite;\n}\n\n.speakingBtn { border-color: var(--color-teal); color: var(--color-teal); }\n\n.hiddenInput { display: none; }\n\n.sendBtn {\n  width: 44px;\n  height: 44px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: var(--radius-md);\n  background: var(--color-bg-tertiary);\n  color: var(--color-text-tertiary);\n  cursor: not-allowed;\n  transition: all var(--transition-fast);\n  border: none;\n}\n\n.sendBtnActive {\n  background: linear-gradient(135deg, var(--color-primary), var(--color-teal));\n  color: white;\n  cursor: pointer;\n  box-shadow: var(--shadow-primary);\n}\n.sendBtnActive:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(45,106,79,0.35); }\n\n@keyframes recordPulse {\n  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.3); }\n  50% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }\n}\n",
  "src/pages/AdminPage.jsx": "import { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport { Users, Stethoscope, Activity, Clock, Check, X, Eye, Ban, ShieldCheck, ChevronDown } from 'lucide-react';\nimport { useT } from '../i18n/useT';\nimport { useAuthStore } from '../store';\nimport { Admin } from '../services';\nimport Avatar from '../components/common/Avatar';\nimport Button from '../components/common/Button';\nimport styles from './AdminPage.module.css';\nimport toast from 'react-hot-toast';\nimport { useNavigate } from 'react-router-dom';\n\n// ─── Stat Card ────────────────────────────────────────────────────────────────\nfunction StatCard({ icon, label, value, color, trend }) {\n  return (\n    <motion.div className={styles.statCard} whileHover={{ y: -3 }}>\n      <div className={styles.statIcon} style={{ background: `${color}15`, color }}>{icon}</div>\n      <div className={styles.statContent}>\n        <div className={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</div>\n        <div className={styles.statLabel}>{label}</div>\n      </div>\n      {trend && (\n        <div className={[styles.statTrend, trend > 0 ? styles.trendUp : styles.trendDown].join(' ')}>\n          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%\n        </div>\n      )}\n    </motion.div>\n  );\n}\n\n// ─── Admin Tabs ───────────────────────────────────────────────────────────────\nconst TABS = ['dashboard', 'doctors', 'users'];\n\nexport default function AdminPage() {\n  const { t } = useT();\n  const { user } = useAuthStore();\n  const navigate = useNavigate();\n\n  const [activeTab, setActiveTab] = useState('dashboard');\n  const [stats, setStats] = useState(null);\n  const [applications, setApplications] = useState([]);\n  const [users, setUsers] = useState([]);\n  const [appFilter, setAppFilter] = useState('pending');\n  const [loading, setLoading] = useState(true);\n\n  // Guard: only admins\n  useEffect(() => {\n    if (user?.role !== 'admin') {\n      navigate('/dashboard');\n      toast.error('Admin access required');\n    }\n  }, [user]);\n\n  // Load data\n  useEffect(() => {\n    const loadAll = async () => {\n      setLoading(true);\n      try {\n        const [statsRes, appsRes, usersRes] = await Promise.all([\n          Admin.getStats(),\n          Admin.getDoctorApplications('pending'),\n          Admin.getUsers(),\n        ]);\n        setStats(statsRes.data);\n        setApplications(appsRes.data);\n        setUsers(usersRes.data.results || usersRes.data);\n      } catch { toast.error('Failed to load admin data'); }\n      finally { setLoading(false); }\n    };\n    if (user?.role === 'admin') loadAll();\n  }, [user]);\n\n  const loadApplications = async (status) => {\n    setAppFilter(status);\n    try {\n      const res = await Admin.getDoctorApplications(status);\n      setApplications(res.data);\n    } catch { toast.error('Failed to load applications'); }\n  };\n\n  const handleApprove = async (id) => {\n    try {\n      await Admin.approveDoctor(id);\n      toast.success('Doctor approved!');\n      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));\n    } catch { toast.error('Failed to approve doctor'); }\n  };\n\n  const handleReject = async (id) => {\n    try {\n      await Admin.rejectDoctor(id);\n      toast.success('Application rejected');\n      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));\n    } catch { toast.error('Failed to reject application'); }\n  };\n\n  const handleBanUser = async (id, currentStatus) => {\n    try {\n      if (currentStatus === 'banned') {\n        await Admin.unbanUser(id);\n        toast.success('User unbanned');\n        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u));\n      } else {\n        await Admin.banUser(id);\n        toast.success('User banned');\n        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'banned' } : u));\n      }\n    } catch { toast.error('Action failed'); }\n  };\n\n  const tabLabels = {\n    dashboard: t.admin.dashboard,\n    doctors: t.admin.doctors,\n    users: t.admin.users,\n  };\n\n  return (\n    <div className={styles.page}>\n      {/* Header */}\n      <div className={styles.header}>\n        <div className=\"container\">\n          <h1 className={styles.pageTitle}>{t.admin.title}</h1>\n          <div className={styles.tabs}>\n            {TABS.map(tab => (\n              <button\n                key={tab}\n                className={[styles.tab, activeTab === tab ? styles.tabActive : ''].join(' ')}\n                onClick={() => setActiveTab(tab)}\n              >\n                {tabLabels[tab]}\n              </button>\n            ))}\n          </div>\n        </div>\n      </div>\n\n      <div className=\"container\">\n        <div className={styles.content}>\n          <AnimatePresence mode=\"wait\">\n            {/* ── Dashboard Tab ── */}\n            {activeTab === 'dashboard' && (\n              <motion.div key=\"dashboard\" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>\n                {loading || !stats ? (\n                  <div className={styles.statsGrid}>\n                    {[1,2,3,4].map(i => <div key={i} className={['skeleton', styles.statSkeleton].join(' ')} />)}\n                  </div>\n                ) : (\n                  <div className={styles.statsGrid}>\n                    <StatCard icon={<Users size={22} />} label={t.admin.stats.totalUsers} value={stats.totalUsers} color=\"#2D6A4F\" trend={12} />\n                    <StatCard icon={<Stethoscope size={22} />} label={t.admin.stats.activeDoctors} value={stats.activeDoctors} color=\"#0F766E\" trend={5} />\n                    <StatCard icon={<Clock size={22} />} label={t.admin.stats.pendingApps} value={stats.pendingApplications} color=\"#D97706\" />\n                    <StatCard icon={<Activity size={22} />} label={t.admin.stats.todayConsultations} value={stats.todayConsultations} color=\"#7C3AED\" trend={8} />\n                  </div>\n                )}\n\n                {/* Recent applications summary */}\n                <div className={styles.dashSection}>\n                  <div className={styles.sectionHeader}>\n                    <h2>{t.admin.doctorApps.title}</h2>\n                    <Button variant=\"ghost\" size=\"sm\" onClick={() => setActiveTab('doctors')}>View all →</Button>\n                  </div>\n                  <div className={styles.recentApps}>\n                    {applications.slice(0, 3).map(app => (\n                      <div key={app.id} className={styles.recentApp}>\n                        <Avatar name={`${app.user.firstName} ${app.user.lastName}`} size=\"sm\" />\n                        <div className={styles.recentAppInfo}>\n                          <span className={styles.recentAppName}>{app.user.firstName} {app.user.lastName}</span>\n                          <span className={styles.recentAppSpec}>{app.specialty}</span>\n                        </div>\n                        <span className={[styles.statusBadge, styles[`status_${app.status}`]].join(' ')}>\n                          {t.admin.doctorApps[app.status]}\n                        </span>\n                        {app.status === 'pending' && (\n                          <div className={styles.quickActions}>\n                            <button className={styles.approveBtn} onClick={() => handleApprove(app.id)}><Check size={14} /></button>\n                            <button className={styles.rejectBtn} onClick={() => handleReject(app.id)}><X size={14} /></button>\n                          </div>\n                        )}\n                      </div>\n                    ))}\n                  </div>\n                </div>\n\n                {/* Stats cards */}\n                <div className={styles.dashSection}>\n                  <h2>Platform Overview</h2>\n                  <div className={styles.overviewGrid}>\n                    {[\n                      { label: 'Total Consultations', value: stats?.totalConsultations, icon: '💬' },\n                      { label: 'New Users This Week', value: stats?.newUsersThisWeek, icon: '👤' },\n                      { label: 'Revenue This Month', value: stats ? `${(stats.revenueThisMonth / 1000000).toFixed(1)}M UZS` : '—', icon: '💰' },\n                    ].map(s => (\n                      <div key={s.label} className={styles.overviewCard}>\n                        <span className={styles.overviewIcon}>{s.icon}</span>\n                        <div className={styles.overviewVal}>{s.value?.toLocaleString?.() || s.value}</div>\n                        <div className={styles.overviewLabel}>{s.label}</div>\n                      </div>\n                    ))}\n                  </div>\n                </div>\n              </motion.div>\n            )}\n\n            {/* ── Doctors Tab ── */}\n            {activeTab === 'doctors' && (\n              <motion.div key=\"doctors\" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>\n                <div className={styles.tabHeader}>\n                  <h2 className={styles.tabTitle}>{t.admin.doctorApps.title}</h2>\n                  <div className={styles.filterRow}>\n                    {['pending', 'approved', 'rejected'].map(status => (\n                      <button\n                        key={status}\n                        className={[styles.filterBtn, appFilter === status ? styles.filterBtnActive : ''].join(' ')}\n                        onClick={() => loadApplications(status)}\n                      >\n                        {t.admin.doctorApps[status]}\n                      </button>\n                    ))}\n                  </div>\n                </div>\n\n                <div className={styles.applicationList}>\n                  {applications.length === 0 && (\n                    <div className={styles.empty}>\n                      <span style={{ fontSize: 40 }}>🩺</span>\n                      <p>No {appFilter} applications</p>\n                    </div>\n                  )}\n                  {applications.map(app => (\n                    <motion.div key={app.id} className={styles.applicationCard} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>\n                      <div className={styles.appLeft}>\n                        <Avatar name={`${app.user.firstName} ${app.user.lastName}`} size=\"lg\" />\n                        <div>\n                          <h3 className={styles.appName}>{app.user.firstName} {app.user.lastName}</h3>\n                          <p className={styles.appEmail}>{app.user.email}</p>\n                        </div>\n                      </div>\n\n                      <div className={styles.appDetails}>\n                        <div className={styles.appDetail}>\n                          <span className={styles.detailLabel}>{t.admin.doctorApps.specialty}</span>\n                          <span className={styles.detailValue}>{app.specialty}</span>\n                        </div>\n                        <div className={styles.appDetail}>\n                          <span className={styles.detailLabel}>{t.admin.doctorApps.experience}</span>\n                          <span className={styles.detailValue}>{app.experience} years</span>\n                        </div>\n                        <div className={styles.appDetail}>\n                          <span className={styles.detailLabel}>{t.admin.doctorApps.education}</span>\n                          <span className={styles.detailValue}>{app.education}</span>\n                        </div>\n                        <div className={styles.appDetail}>\n                          <span className={styles.detailLabel}>{t.admin.doctorApps.appliedAt}</span>\n                          <span className={styles.detailValue}>{new Date(app.appliedAt).toLocaleDateString()}</span>\n                        </div>\n                      </div>\n\n                      <div className={styles.appRight}>\n                        <span className={[styles.statusBadge, styles[`status_${app.status}`]].join(' ')}>\n                          {t.admin.doctorApps[app.status]}\n                        </span>\n                        <div className={styles.appDocs}>\n                          <Eye size={13} />\n                          {app.documents.length} docs\n                        </div>\n                        {app.status === 'pending' && (\n                          <div className={styles.appActions}>\n                            <Button size=\"sm\" onClick={() => handleApprove(app.id)} icon={<Check size={14} />}>\n                              {t.admin.doctorApps.approve}\n                            </Button>\n                            <Button size=\"sm\" variant=\"danger\" onClick={() => handleReject(app.id)} icon={<X size={14} />}>\n                              {t.admin.doctorApps.reject}\n                            </Button>\n                          </div>\n                        )}\n                      </div>\n                    </motion.div>\n                  ))}\n                </div>\n              </motion.div>\n            )}\n\n            {/* ── Users Tab ── */}\n            {activeTab === 'users' && (\n              <motion.div key=\"users\" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>\n                <div className={styles.tabHeader}>\n                  <h2 className={styles.tabTitle}>{t.admin.users.title}</h2>\n                </div>\n                <div className={styles.usersTable}>\n                  <div className={styles.tableHeader}>\n                    <span>{t.admin.users.name}</span>\n                    <span>{t.admin.users.email}</span>\n                    <span>{t.admin.users.role}</span>\n                    <span>{t.admin.users.status}</span>\n                    <span>{t.admin.users.joined}</span>\n                    <span>{t.admin.users.actions}</span>\n                  </div>\n                  {users.map(u => (\n                    <motion.div key={u.id} className={styles.tableRow} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>\n                      <span className={styles.userNameCell}>\n                        <Avatar name={`${u.firstName} ${u.lastName}`} size=\"xs\" />\n                        {u.firstName} {u.lastName}\n                      </span>\n                      <span className={styles.email}>{u.email}</span>\n                      <span>\n                        <span className={[styles.roleBadge, styles[`role_${u.role}`]].join(' ')}>{u.role}</span>\n                      </span>\n                      <span>\n                        <span className={[styles.statusBadge, u.status === 'active' ? styles.status_approved : styles.status_rejected].join(' ')}>\n                          {u.status}\n                        </span>\n                      </span>\n                      <span className={styles.dateCell}>{u.joinedAt}</span>\n                      <span className={styles.actionsCell}>\n                        <button\n                          className={[styles.actionBtn, u.status === 'banned' ? styles.unbanBtn : styles.banBtn].join(' ')}\n                          onClick={() => handleBanUser(u.id, u.status)}\n                          title={u.status === 'banned' ? t.admin.users.unban : t.admin.users.ban}\n                        >\n                          <Ban size={14} />\n                        </button>\n                        <button className={[styles.actionBtn, styles.adminBtn].join(' ')} title={t.admin.users.makeAdmin}>\n                          <ShieldCheck size={14} />\n                        </button>\n                      </span>\n                    </motion.div>\n                  ))}\n                </div>\n              </motion.div>\n            )}\n          </AnimatePresence>\n        </div>\n      </div>\n    </div>\n  );\n}\n",
  "src/pages/AdminPage.module.css": ".page { padding-bottom: 80px; min-height: 100vh; }\n\n.header {\n  background: var(--color-surface);\n  border-bottom: 1px solid var(--color-border);\n  padding-top: calc(var(--nav-height) + 32px);\n  padding-bottom: 0;\n  position: sticky;\n  top: var(--nav-height);\n  z-index: 10;\n  box-shadow: var(--shadow-sm);\n}\n\n.pageTitle {\n  font-family: var(--font-display);\n  font-size: 28px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n  margin-bottom: 20px;\n}\n\n.tabs { display: flex; gap: 0; border-bottom: 2px solid var(--color-border); margin: 0 -24px; padding: 0 24px; }\n\n.tab {\n  padding: 12px 20px;\n  font-size: 14px;\n  font-weight: 500;\n  color: var(--color-text-tertiary);\n  border-bottom: 2px solid transparent;\n  margin-bottom: -2px;\n  cursor: pointer;\n  font-family: var(--font-body);\n  transition: all var(--transition-fast);\n}\n.tab:hover { color: var(--color-text-primary); }\n.tabActive { color: var(--color-primary); border-bottom-color: var(--color-primary); }\n\n.content { padding: 32px 0; }\n\n/* ── Stats Grid ── */\n.statsGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }\n\n@media (max-width: 1024px) { .statsGrid { grid-template-columns: repeat(2, 1fr); } }\n@media (max-width: 480px) { .statsGrid { grid-template-columns: 1fr; } }\n\n.statSkeleton { height: 100px; border-radius: var(--radius-xl); }\n\n.statCard {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 20px;\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  transition: all var(--transition-base);\n}\n.statCard:hover { box-shadow: var(--shadow-md); }\n\n.statIcon {\n  width: 48px;\n  height: 48px;\n  border-radius: var(--radius-md);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.statContent { flex: 1; }\n\n.statValue { font-size: 28px; font-weight: 700; color: var(--color-text-primary); font-family: var(--font-display); line-height: 1; }\n\n.statLabel { font-size: 12px; color: var(--color-text-tertiary); margin-top: 4px; }\n\n.statTrend { font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: var(--radius-full); flex-shrink: 0; }\n.trendUp { background: var(--color-success-muted); color: var(--color-success); }\n.trendDown { background: var(--color-error-muted); color: var(--color-error); }\n\n/* ── Dashboard Sections ── */\n.dashSection { margin-bottom: 32px; }\n\n.sectionHeader {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n}\n\n.dashSection h2 {\n  font-size: 18px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n}\n\n/* Recent apps */\n.recentApps { display: flex; flex-direction: column; gap: 10px; }\n\n.recentApp {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  padding: 14px 16px;\n}\n\n.recentAppInfo { flex: 1; }\n.recentAppName { font-size: 14px; font-weight: 600; color: var(--color-text-primary); display: block; }\n.recentAppSpec { font-size: 12px; color: var(--color-text-tertiary); }\n\n.quickActions { display: flex; gap: 6px; }\n\n.approveBtn, .rejectBtn {\n  width: 30px;\n  height: 30px;\n  border-radius: var(--radius-sm);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  transition: all var(--transition-fast);\n}\n\n.approveBtn { background: var(--color-success-muted); color: var(--color-success); }\n.approveBtn:hover { background: var(--color-success); color: white; }\n.rejectBtn { background: var(--color-error-muted); color: var(--color-error); }\n.rejectBtn:hover { background: var(--color-error); color: white; }\n\n/* Overview grid */\n.overviewGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }\n\n@media (max-width: 640px) { .overviewGrid { grid-template-columns: 1fr; } }\n\n.overviewCard {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 24px;\n  text-align: center;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n}\n\n.overviewIcon { font-size: 32px; }\n.overviewVal { font-size: 24px; font-weight: 700; color: var(--color-text-primary); font-family: var(--font-display); }\n.overviewLabel { font-size: 13px; color: var(--color-text-tertiary); }\n\n/* ── Tab header ── */\n.tabHeader {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 20px;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n\n.tabTitle { font-size: 22px; font-weight: 700; color: var(--color-text-primary); }\n\n.filterRow { display: flex; gap: 6px; }\n\n.filterBtn {\n  padding: 7px 16px;\n  border-radius: var(--radius-full);\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--color-text-secondary);\n  border: 1.5px solid var(--color-border);\n  background: var(--color-surface);\n  cursor: pointer;\n  font-family: var(--font-body);\n  transition: all var(--transition-fast);\n}\n.filterBtn:hover { border-color: var(--color-primary); color: var(--color-primary); }\n.filterBtnActive { background: var(--color-primary-muted); border-color: var(--color-primary); color: var(--color-primary); }\n\n/* ── Application List ── */\n.applicationList { display: flex; flex-direction: column; gap: 14px; }\n\n.applicationCard {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 20px;\n  display: grid;\n  grid-template-columns: auto 1fr auto;\n  gap: 20px;\n  align-items: start;\n}\n\n@media (max-width: 760px) { .applicationCard { grid-template-columns: 1fr; } }\n\n.appLeft { display: flex; align-items: center; gap: 12px; }\n\n.appName { font-size: 16px; font-weight: 600; color: var(--color-text-primary); }\n.appEmail { font-size: 13px; color: var(--color-text-tertiary); }\n\n.appDetails { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }\n\n.appDetail { display: flex; flex-direction: column; gap: 2px; }\n.detailLabel { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-tertiary); font-weight: 600; }\n.detailValue { font-size: 13px; color: var(--color-text-primary); }\n\n.appRight { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }\n\n.appDocs {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  font-size: 12px;\n  color: var(--color-text-tertiary);\n  background: var(--color-bg-tertiary);\n  padding: 4px 10px;\n  border-radius: var(--radius-full);\n}\n\n.appActions { display: flex; gap: 8px; }\n\n/* Status Badges */\n.statusBadge {\n  display: inline-flex;\n  align-items: center;\n  padding: 4px 10px;\n  border-radius: var(--radius-full);\n  font-size: 12px;\n  font-weight: 500;\n}\n\n.status_pending { background: var(--color-warning-muted); color: var(--color-warning); }\n.status_approved { background: var(--color-success-muted); color: var(--color-success); }\n.status_rejected { background: var(--color-error-muted); color: var(--color-error); }\n\n/* ── Users Table ── */\n.usersTable {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  overflow: hidden;\n}\n\n.tableHeader {\n  display: grid;\n  grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;\n  gap: 16px;\n  padding: 12px 20px;\n  background: var(--color-bg-tertiary);\n  border-bottom: 1px solid var(--color-border);\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--color-text-tertiary);\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n}\n\n.tableRow {\n  display: grid;\n  grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;\n  gap: 16px;\n  padding: 14px 20px;\n  border-bottom: 1px solid var(--color-border);\n  align-items: center;\n  font-size: 13.5px;\n  color: var(--color-text-secondary);\n  transition: background var(--transition-fast);\n}\n.tableRow:last-child { border-bottom: none; }\n.tableRow:hover { background: var(--color-bg-tertiary); }\n\n.userNameCell { display: flex; align-items: center; gap: 8px; font-weight: 500; color: var(--color-text-primary); }\n\n.email { color: var(--color-text-tertiary); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n\n.roleBadge {\n  display: inline-flex;\n  padding: 3px 9px;\n  border-radius: var(--radius-full);\n  font-size: 11px;\n  font-weight: 600;\n  text-transform: capitalize;\n}\n.role_patient { background: var(--color-primary-muted); color: var(--color-primary); }\n.role_doctor { background: var(--color-teal-muted); color: var(--color-teal); }\n.role_admin { background: #f3e8ff; color: #7C3AED; }\n[data-theme=\"dark\"] .role_admin { background: #2e1065; color: #a78bfa; }\n\n.dateCell { font-size: 12px; }\n\n.actionsCell { display: flex; gap: 6px; }\n\n.actionBtn {\n  width: 30px;\n  height: 30px;\n  border-radius: var(--radius-sm);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  transition: all var(--transition-fast);\n  border: none;\n}\n\n.banBtn { background: var(--color-error-muted); color: var(--color-error); }\n.banBtn:hover { background: var(--color-error); color: white; }\n.unbanBtn { background: var(--color-success-muted); color: var(--color-success); }\n.unbanBtn:hover { background: var(--color-success); color: white; }\n.adminBtn { background: #f3e8ff; color: #7C3AED; }\n.adminBtn:hover { background: #7C3AED; color: white; }\n\n.empty {\n  text-align: center;\n  padding: 60px 20px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n  color: var(--color-text-tertiary);\n}\n\n@media (max-width: 768px) {\n  .tableHeader, .tableRow { grid-template-columns: 2fr 1fr 1fr 1fr; }\n  .tableHeader span:nth-child(2), .tableRow span:nth-child(2),\n  .tableHeader span:nth-child(5), .tableRow span:nth-child(5) { display: none; }\n}\n",
  "src/pages/DashboardPage.jsx": "import { useState } from 'react';\nimport { Link, useNavigate } from 'react-router-dom';\nimport { motion } from 'framer-motion';\nimport { MessageSquare, Search, Brain, Upload, CheckCircle, Star, Calendar, Users } from 'lucide-react';\nimport { useT } from '../i18n/useT';\nimport { useAuthStore } from '../store';\nimport { Doctors } from '../services';\nimport Avatar from '../components/common/Avatar';\nimport Button from '../components/common/Button';\nimport Input from '../components/common/Input';\nimport styles from './DashboardPage.module.css';\nimport toast from 'react-hot-toast';\n\nconst fadeUp = {\n  hidden: { opacity: 0, y: 20 },\n  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),\n};\n\n// ─── Patient Dashboard ────────────────────────────────────────────────────────\nfunction PatientDashboard({ user, t }) {\n  const navigate = useNavigate();\n\n  const quickActions = [\n    { icon: <Search size={22} />, label: t.nav.doctors, to: '/doctors', color: '#2D6A4F', bg: 'var(--color-primary-muted)' },\n    { icon: <MessageSquare size={22} />, label: t.nav.consultations, to: '/chat', color: '#0F766E', bg: 'var(--color-teal-muted)' },\n    { icon: <Brain size={22} />, label: t.nav.aiAssistant, to: '/ai', color: '#7C3AED', bg: '#f3e8ff' },\n  ];\n\n  const recentConsultations = [\n    { doctor: 'Dr. Dilnoza Yusupova', spec: 'Cardiologist', date: 'Jan 20, 2025', status: 'active', id: 1 },\n    { doctor: 'Dr. Malika Rashidova', spec: 'Pediatrician', date: 'Jan 15, 2025', status: 'ended', id: 2 },\n  ];\n\n  return (\n    <div className={styles.dashContent}>\n      {/* Welcome Banner */}\n      <motion.div className={styles.welcomeBanner} variants={fadeUp} initial=\"hidden\" animate=\"visible\">\n        <div className={styles.welcomeLeft}>\n          <Avatar name={`${user.firstName} ${user.lastName}`} size=\"xl\" />\n          <div>\n            <p className={styles.welcomeGreeting}>{t.patient.dashboard.welcome} 👋</p>\n            <h1 className={styles.welcomeName}>{user.firstName} {user.lastName}</h1>\n            <p className={styles.welcomeEmail}>{user.email}</p>\n          </div>\n        </div>\n        <div className={styles.welcomeStats}>\n          {[\n            { val: '3', label: 'Consultations' },\n            { val: '2', label: t.patient.dashboard.myDoctors },\n            { val: '12', label: 'AI Chats' },\n          ].map((s, i) => (\n            <div key={i} className={styles.wStat}>\n              <span className={styles.wStatVal}>{s.val}</span>\n              <span className={styles.wStatLabel}>{s.label}</span>\n            </div>\n          ))}\n        </div>\n      </motion.div>\n\n      {/* Quick Actions */}\n      <div className={styles.section}>\n        <h2 className={styles.sectionTitle}>Quick Actions</h2>\n        <div className={styles.quickActions}>\n          {quickActions.map((a, i) => (\n            <motion.div\n              key={a.to}\n              className={styles.quickAction}\n              custom={i}\n              variants={fadeUp}\n              initial=\"hidden\"\n              animate=\"visible\"\n              whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}\n              onClick={() => navigate(a.to)}\n            >\n              <div className={styles.qaIcon} style={{ background: a.bg, color: a.color }}>{a.icon}</div>\n              <span className={styles.qaLabel}>{a.label}</span>\n            </motion.div>\n          ))}\n        </div>\n      </div>\n\n      <div className={styles.twoCol}>\n        {/* Recent Consultations */}\n        <div className={styles.section}>\n          <div className={styles.sectionHeader}>\n            <h2 className={styles.sectionTitle}>{t.patient.dashboard.recentConsultations}</h2>\n            <Link to=\"/chat\" className={styles.viewAll}>View all →</Link>\n          </div>\n          <div className={styles.cardList}>\n            {recentConsultations.map((c, i) => (\n              <motion.div key={i} className={styles.listCard} custom={i} variants={fadeUp} initial=\"hidden\" animate=\"visible\">\n                <Avatar name={c.doctor} size=\"md\" online={c.status === 'active'} />\n                <div className={styles.listCardInfo}>\n                  <span className={styles.listCardTitle}>{c.doctor}</span>\n                  <span className={styles.listCardSub}>{c.spec} · {c.date}</span>\n                </div>\n                <span className={[styles.statusPill, c.status === 'active' ? styles.pillActive : styles.pillEnded].join(' ')}>\n                  {c.status}\n                </span>\n                <Button variant=\"outline\" size=\"sm\" onClick={() => navigate('/chat')}>Open</Button>\n              </motion.div>\n            ))}\n            {recentConsultations.length === 0 && (\n              <div className={styles.emptyState}>\n                <p>{t.patient.dashboard.noConsultations}</p>\n                <Button size=\"sm\" onClick={() => navigate('/doctors')}>{t.patient.dashboard.findDoctor}</Button>\n              </div>\n            )}\n          </div>\n        </div>\n\n        {/* Health Tip + AI promo */}\n        <div className={styles.sideWidgets}>\n          <motion.div className={styles.tipCard} variants={fadeUp} initial=\"hidden\" animate=\"visible\" custom={1}>\n            <div className={styles.tipIcon}>💡</div>\n            <div>\n              <h3>Daily Health Tip</h3>\n              <p>Drink at least 8 glasses of water daily. Proper hydration improves energy levels, concentration, and organ function.</p>\n            </div>\n          </motion.div>\n\n          <motion.div className={styles.aiPromoCard} variants={fadeUp} initial=\"hidden\" animate=\"visible\" custom={2}\n            onClick={() => navigate('/ai')} style={{ cursor: 'pointer' }}>\n            <div className={styles.aiPromoIcon}>✦</div>\n            <div>\n              <h3>Try Healzy AI</h3>\n              <p>Ask about symptoms, medications, or get instant health advice — available 24/7.</p>\n            </div>\n            <span className={styles.aiPromoArrow}>→</span>\n          </motion.div>\n\n          <motion.div className={styles.ratingCard} variants={fadeUp} initial=\"hidden\" animate=\"visible\" custom={3}>\n            <Star size={18} fill=\"currentColor\" style={{ color: '#F59E0B' }} />\n            <div>\n              <h3>Rate your last consultation</h3>\n              <p>How was your visit with Dr. Dilnoza?</p>\n            </div>\n            <div className={styles.starRow}>\n              {[1,2,3,4,5].map(n => (\n                <button key={n} className={styles.starBtn}>★</button>\n              ))}\n            </div>\n          </motion.div>\n        </div>\n      </div>\n    </div>\n  );\n}\n\n// ─── Doctor Application Form ──────────────────────────────────────────────────\nfunction DoctorApplicationForm({ t }) {\n  const [form, setForm] = useState({ specialty: '', experience: '', education: '', bio: '' });\n  const [files, setFiles] = useState([]);\n  const [loading, setLoading] = useState(false);\n  const [submitted, setSubmitted] = useState(false);\n  const { specialties } = t;\n\n  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));\n\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    if (!form.specialty || !form.experience || !form.education) {\n      toast.error('Please fill all required fields');\n      return;\n    }\n    setLoading(true);\n    try {\n      const formData = new FormData();\n      Object.entries(form).forEach(([k, v]) => formData.append(k, v));\n      files.forEach(f => formData.append('documents', f));\n      await Doctors.submitApplication(formData);\n      setSubmitted(true);\n      toast.success('Application submitted!');\n    } catch {\n      toast.error('Failed to submit. Please try again.');\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  if (submitted) return (\n    <motion.div className={styles.pendingCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>\n      <CheckCircle size={60} className={styles.pendingIcon} />\n      <h2>{t.doctorDashboard.becomeDoctor.pending}</h2>\n      <p>{t.doctorDashboard.becomeDoctor.pendingDesc}</p>\n      <div className={styles.pendingTimeline}>\n        {['Application received', 'Document review (1–2 days)', 'Approval & activation'].map((step, i) => (\n          <div key={i} className={styles.timelineStep}>\n            <div className={[styles.timelineDot, i === 0 ? styles.timelineDotDone : ''].join(' ')}>\n              {i === 0 ? '✓' : i + 1}\n            </div>\n            <span className={styles.timelineLabel}>{step}</span>\n            {i < 2 && <div className={styles.timelineLine} />}\n          </div>\n        ))}\n      </div>\n    </motion.div>\n  );\n\n  return (\n    <div className={styles.applyWrapper}>\n      <motion.div className={styles.applyHeader} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>\n        <div className={styles.applyBadge}>🩺 Doctor Application</div>\n        <h1>{t.doctorDashboard.becomeDoctor.title}</h1>\n        <p>{t.doctorDashboard.becomeDoctor.subtitle}</p>\n      </motion.div>\n\n      <motion.form\n        className={styles.applyForm}\n        onSubmit={handleSubmit}\n        initial={{ opacity: 0 }}\n        animate={{ opacity: 1 }}\n        transition={{ delay: 0.15 }}\n      >\n        <div className={styles.formRow}>\n          <div className={styles.formField}>\n            <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.specialty} *</label>\n            <select\n              className={styles.formSelect}\n              value={form.specialty}\n              onChange={e => set('specialty', e.target.value)}\n              required\n            >\n              <option value=\"\">Select specialty...</option>\n              {specialties.map(s => <option key={s} value={s}>{s}</option>)}\n            </select>\n          </div>\n          <Input\n            label={`${t.doctorDashboard.becomeDoctor.experience} *`}\n            type=\"number\"\n            value={form.experience}\n            onChange={e => set('experience', e.target.value)}\n            placeholder=\"e.g. 10\"\n            min=\"0\" max=\"60\"\n            required\n          />\n        </div>\n\n        <div className={styles.formField}>\n          <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.education} *</label>\n          <textarea\n            className={styles.formTextarea}\n            value={form.education}\n            onChange={e => set('education', e.target.value)}\n            placeholder=\"e.g. Tashkent Medical Academy, MD — 2010&#10;Residency: National Cardiology Center — 2014\"\n            rows={3}\n            required\n          />\n        </div>\n\n        <div className={styles.formField}>\n          <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.bio}</label>\n          <textarea\n            className={styles.formTextarea}\n            value={form.bio}\n            onChange={e => set('bio', e.target.value)}\n            placeholder=\"Tell patients about your experience and approach to care...\"\n            rows={4}\n          />\n        </div>\n\n        <div className={styles.formField}>\n          <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.documents}</label>\n          <div\n            className={styles.uploadZone}\n            onClick={() => document.getElementById('docUpload').click()}\n          >\n            <Upload size={30} className={styles.uploadIcon} />\n            <p>Click to upload or drag & drop</p>\n            <span>Diploma, license, certificates — PDF, JPG, PNG (max 10MB each)</span>\n            <input\n              id=\"docUpload\"\n              type=\"file\"\n              multiple\n              accept=\".pdf,.jpg,.jpeg,.png\"\n              style={{ display: 'none' }}\n              onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)])}\n            />\n          </div>\n          {files.length > 0 && (\n            <div className={styles.fileList}>\n              {files.map((f, i) => (\n                <div key={i} className={styles.fileChip}>\n                  <span>📄 {f.name}</span>\n                  <button type=\"button\" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>✕</button>\n                </div>\n              ))}\n            </div>\n          )}\n        </div>\n\n        <Button type=\"submit\" size=\"lg\" loading={loading} fullWidth>\n          {t.doctorDashboard.becomeDoctor.submit}\n        </Button>\n      </motion.form>\n    </div>\n  );\n}\n\n// ─── Doctor Dashboard (approved) ─────────────────────────────────────────────\nfunction DoctorDashboard({ user, t }) {\n  const navigate = useNavigate();\n  return (\n    <div className={styles.dashContent}>\n      <motion.div className={styles.welcomeBanner} variants={fadeUp} initial=\"hidden\" animate=\"visible\">\n        <div className={styles.welcomeLeft}>\n          <Avatar name={`${user.firstName} ${user.lastName}`} size=\"xl\" />\n          <div>\n            <p className={styles.welcomeGreeting}>Doctor Dashboard 👨‍⚕️</p>\n            <h1 className={styles.welcomeName}>Dr. {user.firstName} {user.lastName}</h1>\n            <p className={styles.welcomeEmail}>{user.email}</p>\n          </div>\n        </div>\n        <div className={styles.welcomeStats}>\n          {[\n            { val: '0', label: t.doctorDashboard.myPatients },\n            { val: '0', label: t.doctorDashboard.pendingRequests },\n          ].map((s, i) => (\n            <div key={i} className={styles.wStat}>\n              <span className={styles.wStatVal}>{s.val}</span>\n              <span className={styles.wStatLabel}>{s.label}</span>\n            </div>\n          ))}\n        </div>\n      </motion.div>\n\n      <div className={styles.section}>\n        <h2 className={styles.sectionTitle}>{t.doctorDashboard.myPatients}</h2>\n        <div className={styles.emptyState}>\n          <Users size={40} style={{ color: 'var(--color-text-tertiary)', marginBottom: 12 }} />\n          <p>No patients yet. Your profile is live — patients can find and contact you.</p>\n          <Button variant=\"outline\" size=\"sm\" onClick={() => navigate('/doctors')}>View your profile</Button>\n        </div>\n      </div>\n    </div>\n  );\n}\n\n// ─── Main Dashboard Page ──────────────────────────────────────────────────────\nexport default function DashboardPage() {\n  const { t } = useT();\n  const { user } = useAuthStore();\n  const navigate = useNavigate();\n\n  if (!user) {\n    navigate('/login');\n    return null;\n  }\n\n  // Doctor who hasn't applied yet → show application form\n  if (user.role === 'doctor' && !user.isApproved && !user.isPending) {\n    return (\n      <div className={styles.page}>\n        <div className=\"container\">\n          <DoctorApplicationForm t={t} />\n        </div>\n      </div>\n    );\n  }\n\n  // Doctor pending approval\n  if (user.role === 'doctor' && user.isPending) {\n    return (\n      <div className={styles.page}>\n        <div className=\"container\">\n          <motion.div className={styles.pendingCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>\n            <CheckCircle size={60} className={styles.pendingIcon} />\n            <h2>{t.doctorDashboard.becomeDoctor.pending}</h2>\n            <p>{t.doctorDashboard.becomeDoctor.pendingDesc}</p>\n          </motion.div>\n        </div>\n      </div>\n    );\n  }\n\n  return (\n    <div className={styles.page}>\n      <div className=\"container\">\n        {user.role === 'patient' && <PatientDashboard user={user} t={t} />}\n        {user.role === 'doctor' && <DoctorDashboard user={user} t={t} />}\n        {user.role === 'admin' && (\n          <div className={styles.dashContent}>\n            <motion.div className={styles.welcomeBanner} variants={fadeUp} initial=\"hidden\" animate=\"visible\">\n              <div className={styles.welcomeLeft}>\n                <Avatar name={`${user.firstName} ${user.lastName}`} size=\"xl\" />\n                <div>\n                  <p className={styles.welcomeGreeting}>Admin Panel 🛡️</p>\n                  <h1 className={styles.welcomeName}>{user.firstName} {user.lastName}</h1>\n                  <p className={styles.welcomeEmail}>{user.email}</p>\n                </div>\n              </div>\n            </motion.div>\n            <div className={styles.section}>\n              <Button onClick={() => navigate('/admin')} size=\"lg\" icon={<Search size={16}/>}>\n                Go to Admin Panel\n              </Button>\n            </div>\n          </div>\n        )}\n      </div>\n    </div>\n  );\n}\n",
  "src/pages/DashboardPage.module.css": ".page {\n  padding: calc(var(--nav-height) + 40px) 0 80px;\n  min-height: 100vh;\n}\n\n.dashContent { display: flex; flex-direction: column; gap: 32px; }\n\n/* ── Welcome Banner ── */\n.welcomeBanner {\n  background: linear-gradient(135deg, var(--color-primary-muted) 0%, var(--color-teal-muted) 100%);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 28px 32px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 24px;\n  flex-wrap: wrap;\n}\n\n.welcomeLeft { display: flex; align-items: center; gap: 16px; }\n\n.welcomeGreeting { font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 4px; font-weight: 500; }\n\n.welcomeName {\n  font-family: var(--font-display);\n  font-size: 26px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n  letter-spacing: -0.02em;\n  margin-bottom: 4px;\n}\n\n.welcomeEmail { font-size: 13px; color: var(--color-text-secondary); }\n\n.welcomeStats { display: flex; gap: 28px; }\n\n.wStat { display: flex; flex-direction: column; align-items: center; gap: 3px; }\n.wStatVal { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--color-text-primary); }\n.wStatLabel { font-size: 12px; color: var(--color-text-tertiary); text-align: center; }\n\n/* ── Section ── */\n.section { display: flex; flex-direction: column; gap: 16px; }\n\n.sectionHeader { display: flex; align-items: center; justify-content: space-between; }\n\n.sectionTitle {\n  font-size: 18px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n}\n\n.viewAll { font-size: 13px; color: var(--color-primary); font-weight: 500; }\n.viewAll:hover { text-decoration: underline; }\n\n/* ── Quick Actions ── */\n.quickActions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }\n\n@media (max-width: 640px) { .quickActions { grid-template-columns: repeat(3, 1fr); } }\n\n.quickAction {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 24px 16px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n  cursor: pointer;\n  transition: all var(--transition-base);\n}\n\n.qaIcon {\n  width: 52px;\n  height: 52px;\n  border-radius: var(--radius-lg);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.qaLabel { font-size: 13px; font-weight: 600; color: var(--color-text-primary); text-align: center; }\n\n/* ── Two Col ── */\n.twoCol { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }\n\n@media (max-width: 960px) { .twoCol { grid-template-columns: 1fr; } }\n\n/* ── Card List ── */\n.cardList { display: flex; flex-direction: column; gap: 10px; }\n\n.listCard {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  padding: 14px 16px;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  transition: box-shadow var(--transition-fast);\n}\n.listCard:hover { box-shadow: var(--shadow-sm); }\n\n.listCardInfo { flex: 1; min-width: 0; }\n.listCardTitle { font-size: 14px; font-weight: 600; color: var(--color-text-primary); display: block; }\n.listCardSub { font-size: 12px; color: var(--color-text-tertiary); }\n\n.statusPill {\n  padding: 3px 10px;\n  border-radius: var(--radius-full);\n  font-size: 11px;\n  font-weight: 600;\n  text-transform: capitalize;\n  flex-shrink: 0;\n}\n.pillActive { background: var(--color-success-muted); color: var(--color-success); }\n.pillEnded { background: var(--color-bg-tertiary); color: var(--color-text-tertiary); }\n\n.emptyState {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 40px 24px;\n  text-align: center;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n  color: var(--color-text-secondary);\n  font-size: 14px;\n}\n\n/* ── Side Widgets ── */\n.sideWidgets { display: flex; flex-direction: column; gap: 14px; }\n\n.tipCard {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 20px;\n  display: flex;\n  gap: 14px;\n  align-items: flex-start;\n}\n\n.tipIcon { font-size: 28px; flex-shrink: 0; }\n\n.tipCard h3 { font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 6px; }\n.tipCard p { font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; }\n\n.aiPromoCard {\n  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal) 100%);\n  border-radius: var(--radius-xl);\n  padding: 20px;\n  display: flex;\n  gap: 14px;\n  align-items: center;\n  transition: all var(--transition-base);\n}\n.aiPromoCard:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }\n\n.aiPromoIcon {\n  font-size: 24px;\n  color: white;\n  width: 44px;\n  height: 44px;\n  background: rgba(255,255,255,0.15);\n  border-radius: var(--radius-md);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.aiPromoCard h3 { font-size: 14px; font-weight: 600; color: white; margin-bottom: 4px; }\n.aiPromoCard p { font-size: 12px; color: rgba(255,255,255,0.8); line-height: 1.5; }\n.aiPromoArrow { font-size: 20px; color: white; margin-left: auto; flex-shrink: 0; }\n\n.ratingCard {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 18px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.ratingCard h3 { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }\n.ratingCard p { font-size: 12px; color: var(--color-text-secondary); }\n\n.starRow { display: flex; gap: 6px; }\n\n.starBtn {\n  font-size: 22px;\n  color: var(--color-border-strong);\n  cursor: pointer;\n  transition: all var(--transition-fast);\n  line-height: 1;\n}\n.starBtn:hover { color: #F59E0B; transform: scale(1.2); }\n\n/* ── Doctor Application Form ── */\n.applyWrapper { max-width: 680px; margin: 0 auto; }\n\n.applyHeader {\n  text-align: center;\n  margin-bottom: 40px;\n}\n\n.applyBadge {\n  display: inline-flex;\n  background: var(--color-primary-muted);\n  color: var(--color-primary);\n  border-radius: var(--radius-full);\n  padding: 6px 16px;\n  font-size: 13px;\n  font-weight: 600;\n  margin-bottom: 16px;\n}\n\n.applyHeader h1 {\n  font-family: var(--font-display);\n  font-size: 34px;\n  font-weight: 700;\n  letter-spacing: -0.025em;\n  color: var(--color-text-primary);\n  margin-bottom: 10px;\n}\n\n.applyHeader p { font-size: 16px; color: var(--color-text-secondary); }\n\n.applyForm {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 36px;\n  display: flex;\n  flex-direction: column;\n  gap: 22px;\n  box-shadow: var(--shadow-md);\n}\n\n.formRow { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }\n@media (max-width: 580px) { .formRow { grid-template-columns: 1fr; } }\n\n.formField { display: flex; flex-direction: column; gap: 6px; }\n\n.formLabel {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--color-text-secondary);\n  letter-spacing: 0.01em;\n}\n\n.formSelect {\n  padding: 11px 14px;\n  border: 1.5px solid var(--color-border);\n  border-radius: var(--radius-md);\n  background: var(--color-surface);\n  color: var(--color-text-primary);\n  font-size: 14px;\n  font-family: var(--font-body);\n  outline: none;\n  transition: border-color var(--transition-fast);\n  cursor: pointer;\n}\n.formSelect:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-muted); }\n\n.formTextarea {\n  padding: 11px 14px;\n  border: 1.5px solid var(--color-border);\n  border-radius: var(--radius-md);\n  background: var(--color-surface);\n  color: var(--color-text-primary);\n  font-size: 14px;\n  font-family: var(--font-body);\n  outline: none;\n  resize: vertical;\n  transition: border-color var(--transition-fast);\n  line-height: 1.6;\n}\n.formTextarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-muted); }\n\n.uploadZone {\n  border: 2px dashed var(--color-border-strong);\n  border-radius: var(--radius-lg);\n  padding: 36px 20px;\n  text-align: center;\n  cursor: pointer;\n  transition: all var(--transition-fast);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n}\n.uploadZone:hover { border-color: var(--color-primary); background: var(--color-primary-muted); }\n\n.uploadIcon { color: var(--color-text-tertiary); }\n.uploadZone:hover .uploadIcon { color: var(--color-primary); }\n\n.uploadZone p { font-size: 14px; font-weight: 500; color: var(--color-text-secondary); }\n.uploadZone span { font-size: 12px; color: var(--color-text-tertiary); }\n\n.fileList { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }\n\n.fileChip {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: var(--color-bg-tertiary);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-full);\n  padding: 5px 12px;\n  font-size: 12px;\n  color: var(--color-text-secondary);\n}\n\n.fileChip button {\n  color: var(--color-text-tertiary);\n  cursor: pointer;\n  font-size: 13px;\n  line-height: 1;\n  transition: color var(--transition-fast);\n}\n.fileChip button:hover { color: var(--color-error); }\n\n/* ── Pending Card ── */\n.pendingCard {\n  max-width: 480px;\n  margin: 80px auto;\n  text-align: center;\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-xl);\n  padding: 48px 36px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 16px;\n  box-shadow: var(--shadow-lg);\n}\n\n.pendingIcon { color: var(--color-success); }\n\n.pendingCard h2 {\n  font-family: var(--font-display);\n  font-size: 24px;\n  font-weight: 700;\n  color: var(--color-text-primary);\n}\n\n.pendingCard p { font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; }\n\n.pendingTimeline {\n  display: flex;\n  align-items: center;\n  gap: 0;\n  margin-top: 8px;\n  flex-wrap: wrap;\n  justify-content: center;\n  gap: 8px;\n}\n\n.timelineStep {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.timelineDot {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  background: var(--color-bg-tertiary);\n  border: 2px solid var(--color-border-strong);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 12px;\n  font-weight: 700;\n  color: var(--color-text-tertiary);\n  flex-shrink: 0;\n}\n\n.timelineDotDone {\n  background: var(--color-success);\n  border-color: var(--color-success);\n  color: white;\n}\n\n.timelineLabel { font-size: 12px; color: var(--color-text-secondary); white-space: nowrap; }\n.timelineLine { width: 32px; height: 2px; background: var(--color-border); }\n"
};

console.log('\n🏥  Healzy — extracting ' + Object.keys(FILES).length + ' files...\n');
for (const [rel, content] of Object.entries(FILES)) {
  write(rel, content);
}
console.log('\n✅  Done! Project written to ./healzy/');
console.log('\n  Next steps:');
console.log('    cd healzy');
console.log('    npm install');
console.log('    npm run dev');
console.log('\n  Then open http://localhost:5173\n');

/*
 * ═══════════════════════════════════════════════════════════════
 * SOURCE CODE BROWSER
 * Search  FILE:  to jump between files
 * ═══════════════════════════════════════════════════════════════
 */


/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: package.json
 * ──────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "name": "healzy",
 *   "private": true,
 *   "version": "2.0.0",
 *   "type": "module",
 *   "scripts": {
 *     "dev": "vite",
 *     "build": "vite build",
 *     "preview": "vite preview"
 *   },
 *   "dependencies": {
 *     "react": "^18.3.1",
 *     "react-dom": "^18.3.1",
 *     "react-router-dom": "^6.26.0",
 *     "axios": "^1.7.2",
 *     "zustand": "^4.5.4",
 *     "framer-motion": "^11.3.19",
 *     "react-hot-toast": "^2.4.1",
 *     "date-fns": "^3.6.0",
 *     "react-intersection-observer": "^9.13.0",
 *     "lucide-react": "^0.408.0"
 *   },
 *   "devDependencies": {
 *     "@vitejs/plugin-react": "^4.3.1",
 *     "vite": "^5.3.4"
 *   }
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: vite.config.js
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { defineConfig } from 'vite'
 * import react from '@vitejs/plugin-react'
 * 
 * export default defineConfig({
 *   plugins: [react()],
 *   server: {
 *     proxy: {
 *       '/api': {
 *         target: 'http://localhost:8000',
 *         changeOrigin: true,
 *       },
 *       '/ws': {
 *         target: 'ws://localhost:8000',
 *         ws: true,
 *       },
 *       '/media': {
 *         target: 'http://localhost:8000',
 *         changeOrigin: true,
 *       }
 *     }
 *   }
 * })
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: index.html
 * ──────────────────────────────────────────────────────────────────────────
 *
 * <!DOCTYPE html>
 * <html lang="en">
 *   <head>
 *     <meta charset="UTF-8" />
 *     <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
 *     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
 *     <title>Healzy — Online Medical Consultations</title>
 *     <meta name="description" content="Connect with certified doctors online. Real-time consultations, AI diagnostics, and expert medical advice." />
 *     <link rel="preconnect" href="https://fonts.googleapis.com">
 *     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *     <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
 *   </head>
 *   <body>
 *     <div id="root"></div>
 *     <script type="module" src="/src/main.jsx"></script>
 *   </body>
 * </html>
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: public/favicon.svg
 * ──────────────────────────────────────────────────────────────────────────
 *
 * <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
 *   <rect width="32" height="32" rx="8" fill="#2D6A4F"/>
 *   <path d="M16 8v16M8 16h16" stroke="white" stroke-width="3" stroke-linecap="round"/>
 * </svg>
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/main.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import React from 'react';
 * import ReactDOM from 'react-dom/client';
 * import App from './App';
 * import './styles/globals.css';
 * import { useUIStore } from './store';
 * 
 * // Apply saved theme on load
 * const theme = useUIStore.getState().theme || 'light';
 * document.documentElement.setAttribute('data-theme', theme);
 * 
 * ReactDOM.createRoot(document.getElementById('root')).render(
 *   <React.StrictMode>
 *     <App />
 *   </React.StrictMode>
 * );
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/App.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
 * import { Toaster } from 'react-hot-toast';
 * import { AnimatePresence } from 'framer-motion';
 * 
 * import { useAuthStore } from './store';
 * import Navbar from './components/layout/Navbar';
 * import Footer from './components/layout/Footer';
 * 
 * import HomePage from './pages/HomePage';
 * import { LoginPage, RegisterPage, ResetPasswordPage } from './pages/AuthPage';
 * import { DoctorsPage, DoctorProfilePage } from './pages/DoctorsPage';
 * import ChatPage from './pages/ChatPage';
 * import AIPage from './pages/AIPage';
 * import AdminPage from './pages/AdminPage';
 * import DashboardPage from './pages/DashboardPage';
 * 
 * // ── Protected Route ──────────────────────────────────────────────────────────
 * function Protected({ children, roles }) {
 *   const { isAuthenticated, user } = useAuthStore();
 *   const location = useLocation();
 * 
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" state={{ from: location }} replace />;
 *   }
 *   if (roles && !roles.includes(user?.role)) {
 *     return <Navigate to="/dashboard" replace />;
 *   }
 *   return children;
 * }
 * 
 * // ── Guest Only Route (redirect if logged in) ─────────────────────────────────
 * function GuestOnly({ children }) {
 *   const { isAuthenticated } = useAuthStore();
 *   if (isAuthenticated) return <Navigate to="/dashboard" replace />;
 *   return children;
 * }
 * 
 * // ── Layout wrapper ───────────────────────────────────────────────────────────
 * const NO_FOOTER_ROUTES = ['/chat', '/ai'];
 * 
 * function Layout({ children }) {
 *   const location = useLocation();
 *   const noFooter = NO_FOOTER_ROUTES.some(r => location.pathname.startsWith(r));
 * 
 *   return (
 *     <>
 *       <Navbar />
 *       <main style={{ flex: 1 }}>
 *         {children}
 *       </main>
 *       {!noFooter && <Footer />}
 *     </>
 *   );
 * }
 * 
 * // ── App ──────────────────────────────────────────────────────────────────────
 * export default function App() {
 *   return (
 *     <BrowserRouter>
 *       <Toaster
 *         position="top-right"
 *         toastOptions={{
 *           duration: 3500,
 *           style: {
 *             fontFamily: 'var(--font-body)',
 *             fontSize: '14px',
 *             borderRadius: '12px',
 *             background: 'var(--color-surface)',
 *             color: 'var(--color-text-primary)',
 *             border: '1px solid var(--color-border)',
 *             boxShadow: 'var(--shadow-lg)',
 *           },
 *           success: { iconTheme: { primary: 'var(--color-success)', secondary: 'white' } },
 *           error: { iconTheme: { primary: 'var(--color-error)', secondary: 'white' } },
 *         }}
 *       />
 *       <Layout>
 *         <Routes>
 *           {/* Public * /}
 *           <Route path="/" element={<HomePage />} />
 *           <Route path="/doctors" element={<DoctorsPage />} />
 *           <Route path="/doctors/:id" element={<DoctorProfilePage />} />
 *           <Route path="/ai" element={<AIPage />} />
 * 
 *           {/* Guest only * /}
 *           <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
 *           <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
 *           <Route path="/reset-password" element={<GuestOnly><ResetPasswordPage /></GuestOnly>} />
 * 
 *           {/* Protected * /}
 *           <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
 *           <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
 * 
 *           {/* Admin only * /}
 *           <Route path="/admin" element={<Protected roles={['admin']}><AdminPage /></Protected>} />
 * 
 *           {/* 404 fallback * /}
 *           <Route path="*" element={<Navigate to="/" replace />} />
 *         </Routes>
 *       </Layout>
 *     </BrowserRouter>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/store.js
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { create } from 'zustand';
 * import { persist } from 'zustand/middleware';
 * 
 * // ─── Auth Store ───────────────────────────────────────────────────────────────
 * export const useAuthStore = create(
 *   persist(
 *     (set, get) => ({
 *       user: null,
 *       token: null,
 *       isAuthenticated: false,
 *       isLoading: false,
 * 
 *       setUser: (user) => set({ user, isAuthenticated: !!user }),
 *       setToken: (token) => set({ token }),
 *       login: (user, token) => set({ user, token, isAuthenticated: true }),
 *       logout: () => set({ user: null, token: null, isAuthenticated: false }),
 *       updateUser: (updates) => set((state) => ({
 *         user: state.user ? { ...state.user, ...updates } : null
 *       })),
 *       setLoading: (isLoading) => set({ isLoading }),
 *     }),
 *     {
 *       name: 'healzy-auth',
 *       partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
 *     }
 *   )
 * );
 * 
 * // ─── UI Store ─────────────────────────────────────────────────────────────────
 * export const useUIStore = create(
 *   persist(
 *     (set) => ({
 *       theme: 'light',
 *       language: 'en',
 *       sidebarOpen: false,
 *       notifications: [],
 * 
 *       setTheme: (theme) => {
 *         set({ theme });
 *         document.documentElement.setAttribute('data-theme', theme);
 *       },
 *       toggleTheme: () => set((state) => {
 *         const newTheme = state.theme === 'light' ? 'dark' : 'light';
 *         document.documentElement.setAttribute('data-theme', newTheme);
 *         return { theme: newTheme };
 *       }),
 *       setLanguage: (language) => set({ language }),
 *       setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
 *       addNotification: (notification) => set((state) => ({
 *         notifications: [...state.notifications, { id: Date.now(), ...notification }]
 *       })),
 *       removeNotification: (id) => set((state) => ({
 *         notifications: state.notifications.filter(n => n.id !== id)
 *       })),
 *     }),
 *     {
 *       name: 'healzy-ui',
 *       partialize: (state) => ({ theme: state.theme, language: state.language }),
 *     }
 *   )
 * );
 * 
 * // ─── Chat Store ───────────────────────────────────────────────────────────────
 * export const useChatStore = create((set, get) => ({
 *   conversations: [],
 *   activeConversationId: null,
 *   messages: {},
 *   onlineUsers: new Set(),
 *   typingUsers: {},
 *   wsConnection: null,
 * 
 *   setConversations: (conversations) => set({ conversations }),
 *   setActiveConversation: (id) => set({ activeConversationId: id }),
 *   addMessage: (conversationId, message) => set((state) => ({
 *     messages: {
 *       ...state.messages,
 *       [conversationId]: [...(state.messages[conversationId] || []), message]
 *     }
 *   })),
 *   setMessages: (conversationId, messages) => set((state) => ({
 *     messages: { ...state.messages, [conversationId]: messages }
 *   })),
 *   setUserOnline: (userId, online) => set((state) => {
 *     const onlineUsers = new Set(state.onlineUsers);
 *     if (online) onlineUsers.add(userId);
 *     else onlineUsers.delete(userId);
 *     return { onlineUsers };
 *   }),
 *   setTyping: (conversationId, userId, isTyping) => set((state) => ({
 *     typingUsers: {
 *       ...state.typingUsers,
 *       [conversationId]: isTyping
 *         ? { ...state.typingUsers[conversationId], [userId]: true }
 *         : Object.fromEntries(
 *             Object.entries(state.typingUsers[conversationId] || {}).filter(([k]) => k !== String(userId))
 *           )
 *     }
 *   })),
 *   setWsConnection: (ws) => set({ wsConnection: ws }),
 *   updateConversationLastMessage: (conversationId, message) => set((state) => ({
 *     conversations: state.conversations.map(c =>
 *       c.id === conversationId ? { ...c, lastMessage: message, updatedAt: new Date().toISOString() } : c
 *     )
 *   })),
 * }));
 * 
 * // ─── AI Store ─────────────────────────────────────────────────────────────────
 * export const useAIStore = create(
 *   persist(
 *     (set, get) => ({
 *       dialogues: [],
 *       activeDialogueId: null,
 *       isLoading: false,
 * 
 *       setDialogues: (dialogues) => set({ dialogues }),
 *       setActiveDialogue: (id) => set({ activeDialogueId: id }),
 *       addMessage: (dialogueId, message) => set((state) => ({
 *         dialogues: state.dialogues.map(d =>
 *           d.id === dialogueId
 *             ? { ...d, messages: [...(d.messages || []), message] }
 *             : d
 *         )
 *       })),
 *       createDialogue: (dialogue) => set((state) => ({
 *         dialogues: [dialogue, ...state.dialogues],
 *         activeDialogueId: dialogue.id,
 *       })),
 *       setLoading: (isLoading) => set({ isLoading }),
 *     }),
 *     {
 *       name: 'healzy-ai',
 *       partialize: (state) => ({ dialogues: state.dialogues.slice(0, 20), activeDialogueId: state.activeDialogueId }),
 *     }
 *   )
 * );
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/api.js
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import axios from 'axios';
 * import { useAuthStore } from './store';
 * 
 * const API_BASE = '/api';
 * 
 * const api = axios.create({
 *   baseURL: API_BASE,
 *   withCredentials: true,
 * });
 * 
 * // CSRF token handling
 * let csrfToken = null;
 * 
 * const getCSRFToken = () => {
 *   const match = document.cookie.match('(^|;)\\s*csrftoken\\s*=\\s*([^;]+)');
 *   return match ? match.pop() : '';
 * };
 * 
 * // Request interceptor — attach auth token + CSRF
 * api.interceptors.request.use((config) => {
 *   const token = useAuthStore.getState().token;
 *   if (token) {
 *     config.headers.Authorization = `Token ${token}`;
 *   }
 *   if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
 *     config.headers['X-CSRFToken'] = getCSRFToken();
 *   }
 *   return config;
 * });
 * 
 * // Response interceptor — handle 401
 * api.interceptors.response.use(
 *   (response) => response,
 *   (error) => {
 *     if (error.response?.status === 401) {
 *       useAuthStore.getState().logout();
 *       window.location.href = '/login';
 *     }
 *     return Promise.reject(error);
 *   }
 * );
 * 
 * // ─── Auth ─────────────────────────────────────────────────────────────────────
 * export const authAPI = {
 *   getCSRF: () => api.get('/auth/csrf/'),
 *   login: (data) => api.post('/auth/login/', data),
 *   register: (data) => api.post('/auth/register/', data),
 *   logout: () => api.post('/auth/logout/'),
 *   googleAuth: (token) => api.post('/auth/google-auth/', { token }),
 *   getProfile: () => api.get('/auth/profile/'),
 *   updateProfile: (data) => api.patch('/auth/profile/', data),
 *   changePassword: (data) => api.post('/auth/change-password/', data),
 *   resetPasswordRequest: (email) => api.post('/auth/password-reset/', { email }),
 *   resetPasswordConfirm: (data) => api.post('/auth/password-reset/confirm/', data),
 *   uploadAvatar: (formData) => api.post('/auth/avatar/', formData, {
 *     headers: { 'Content-Type': 'multipart/form-data' }
 *   }),
 * };
 * 
 * // ─── Doctors ──────────────────────────────────────────────────────────────────
 * export const doctorsAPI = {
 *   search: (params) => api.get('/doctors/', { params }),
 *   getById: (id) => api.get(`/doctors/${id}/`),
 *   getProfile: () => api.get('/doctors/my-profile/'),
 *   submitApplication: (formData) => api.post('/doctors/apply/', formData, {
 *     headers: { 'Content-Type': 'multipart/form-data' }
 *   }),
 *   updateProfile: (data) => api.patch('/doctors/my-profile/', data),
 *   getSpecialties: () => api.get('/doctors/specialties/'),
 *   getReviews: (doctorId) => api.get(`/doctors/${doctorId}/reviews/`),
 *   submitReview: (doctorId, data) => api.post(`/doctors/${doctorId}/reviews/`, data),
 *   getFeatured: () => api.get('/doctors/featured/'),
 * };
 * 
 * // ─── Consultations / Chat ─────────────────────────────────────────────────────
 * export const chatAPI = {
 *   getConversations: () => api.get('/chat/conversations/'),
 *   getMessages: (conversationId, page = 1) =>
 *     api.get(`/chat/conversations/${conversationId}/messages/`, { params: { page } }),
 *   startConsultation: (doctorId) => api.post('/chat/start/', { doctor_id: doctorId }),
 *   endConsultation: (conversationId) => api.post(`/chat/conversations/${conversationId}/end/`),
 *   uploadFile: (conversationId, formData) =>
 *     api.post(`/chat/conversations/${conversationId}/upload/`, formData, {
 *       headers: { 'Content-Type': 'multipart/form-data' }
 *     }),
 *   getConsultationHistory: () => api.get('/chat/history/'),
 * };
 * 
 * // ─── AI ───────────────────────────────────────────────────────────────────────
 * export const aiAPI = {
 *   getDialogues: () => api.get('/ai/dialogues/'),
 *   createDialogue: () => api.post('/ai/dialogues/'),
 *   getMessages: (dialogueId) => api.get(`/ai/dialogues/${dialogueId}/messages/`),
 *   sendMessage: (dialogueId, data) => api.post(`/ai/dialogues/${dialogueId}/messages/`, data),
 *   sendMessageWithImage: (dialogueId, formData) =>
 *     api.post(`/ai/dialogues/${dialogueId}/messages/`, formData, {
 *       headers: { 'Content-Type': 'multipart/form-data' }
 *     }),
 *   deleteDialogue: (dialogueId) => api.delete(`/ai/dialogues/${dialogueId}/`),
 * };
 * 
 * // ─── Admin ────────────────────────────────────────────────────────────────────
 * export const adminAPI = {
 *   getStats: () => api.get('/admin/stats/'),
 *   getDoctorApplications: (status) => api.get('/admin/doctor-applications/', { params: { status } }),
 *   approveDoctor: (id) => api.post(`/admin/doctor-applications/${id}/approve/`),
 *   rejectDoctor: (id, reason) => api.post(`/admin/doctor-applications/${id}/reject/`, { reason }),
 *   getUsers: (params) => api.get('/admin/users/', { params }),
 *   banUser: (id) => api.post(`/admin/users/${id}/ban/`),
 *   unbanUser: (id) => api.post(`/admin/users/${id}/unban/`),
 *   makeAdmin: (id) => api.post(`/admin/users/${id}/make-admin/`),
 *   getConsultations: (params) => api.get('/admin/consultations/', { params }),
 * };
 * 
 * // ─── WebSocket Factory ─────────────────────────────────────────────────────────
 * export const createChatWebSocket = (conversationId, token) => {
 *   const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
 *   const host = window.location.host;
 *   return new WebSocket(`${protocol}//${host}/ws/chat/${conversationId}/?token=${token}`);
 * };
 * 
 * export default api;
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/services.js
 * ──────────────────────────────────────────────────────────────────────────
 *
 * // This is the single import point for all API calls.
 * // Set USE_MOCK = false in mockData.js to switch to the live Django backend.
 * 
 * import {
 *   USE_MOCK,
 *   mockAuthAPI, mockDoctorsAPI, mockChatAPI, mockAdminAPI,
 * } from './mockData';
 * import { authAPI, doctorsAPI, chatAPI, adminAPI, aiAPI } from './api';
 * 
 * export const Auth   = USE_MOCK ? mockAuthAPI   : authAPI;
 * export const Doctors = USE_MOCK ? mockDoctorsAPI : doctorsAPI;
 * export const Chat   = USE_MOCK ? mockChatAPI   : chatAPI;
 * export const Admin  = USE_MOCK ? mockAdminAPI  : adminAPI;
 * export const AI     = aiAPI; // AI always hits real Gemini via your backend
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/mockData.js
 * ──────────────────────────────────────────────────────────────────────────
 *
 * // ─── Mock Data Layer ──────────────────────────────────────────────────────────
 * // All API calls check USE_MOCK first. To go live, set USE_MOCK = false
 * // and ensure your Django backend is running at /api/*
 * 
 * export const USE_MOCK = true;
 * export const MOCK_DELAY = 600; // ms — simulates network latency
 * 
 * const delay = (ms = MOCK_DELAY) => new Promise(r => setTimeout(r, ms));
 * 
 * // ─── Mock Users ───────────────────────────────────────────────────────────────
 * export const MOCK_USERS = {
 *   patient: {
 *     id: 1,
 *     email: 'patient@healzy.uz',
 *     firstName: 'Amir',
 *     lastName: 'Karimov',
 *     role: 'patient',
 *     avatar: null,
 *     phone: '+998 90 123 45 67',
 *     dateOfBirth: '1992-05-15',
 *     createdAt: '2024-01-10T10:00:00Z',
 *   },
 *   doctor: {
 *     id: 2,
 *     email: 'doctor@healzy.uz',
 *     firstName: 'Dilnoza',
 *     lastName: 'Yusupova',
 *     role: 'doctor',
 *     avatar: null,
 *     phone: '+998 91 234 56 78',
 *     createdAt: '2024-01-05T09:00:00Z',
 *   },
 *   admin: {
 *     id: 3,
 *     email: 'admin@healzy.uz',
 *     firstName: 'Admin',
 *     lastName: 'Healzy',
 *     role: 'admin',
 *     avatar: null,
 *     createdAt: '2024-01-01T00:00:00Z',
 *   },
 * };
 * 
 * // ─── Mock Doctors ─────────────────────────────────────────────────────────────
 * export const MOCK_DOCTORS = [
 *   {
 *     id: 1,
 *     userId: 2,
 *     firstName: 'Dilnoza',
 *     lastName: 'Yusupova',
 *     specialty: 'Cardiologist',
 *     specialtyRu: 'Кардиолог',
 *     specialtyUz: 'Kardiolog',
 *     experience: 12,
 *     rating: 4.9,
 *     reviewCount: 234,
 *     consultationCount: 1847,
 *     bio: 'Board-certified cardiologist with 12 years of experience in treating heart conditions. Specializes in preventive cardiology and heart failure management.',
 *     bioRu: 'Сертифицированный кардиолог с 12-летним опытом лечения сердечных заболеваний. Специализируется на профилактической кардиологии.',
 *     bioUz: '12 yillik tajribaga ega sertifikatlangan kardiolog. Profilaktik kardiologiya va yurak yetishmovchiligini davolashga ixtisoslashgan.',
 *     education: 'Tashkent Medical Academy, MD — 2010\nResidency: National Cardiology Center — 2014',
 *     languages: ['Uzbek', 'Russian', 'English'],
 *     workingHours: 'Mon–Fri: 9:00–18:00',
 *     isAvailable: true,
 *     isVerified: true,
 *     avatar: null,
 *     price: 150000,
 *     documents: ['diploma.pdf', 'license.pdf'],
 *   },
 *   {
 *     id: 2,
 *     userId: 10,
 *     firstName: 'Bobur',
 *     lastName: 'Toshmatov',
 *     specialty: 'Neurologist',
 *     specialtyRu: 'Невролог',
 *     specialtyUz: 'Nevrolog',
 *     experience: 8,
 *     rating: 4.7,
 *     reviewCount: 156,
 *     consultationCount: 982,
 *     bio: 'Neurologist specializing in headaches, epilepsy, and stroke management. Provides compassionate, evidence-based care.',
 *     bioRu: 'Невролог, специализирующийся на головных болях, эпилепсии и лечении инсульта.',
 *     bioUz: 'Bosh og\'riq, epilepsiya va insult davolashga ixtisoslashgan nevrolog.',
 *     education: 'Samarkand State Medical University — 2014\nFellowship: Russian Neurology Institute — 2016',
 *     languages: ['Uzbek', 'Russian'],
 *     workingHours: 'Mon–Sat: 10:00–17:00',
 *     isAvailable: true,
 *     isVerified: true,
 *     avatar: null,
 *     price: 120000,
 *     documents: ['diploma.pdf'],
 *   },
 *   {
 *     id: 3,
 *     userId: 11,
 *     firstName: 'Malika',
 *     lastName: 'Rashidova',
 *     specialty: 'Pediatrician',
 *     specialtyRu: 'Педиатр',
 *     specialtyUz: 'Pediatr',
 *     experience: 15,
 *     rating: 4.95,
 *     reviewCount: 412,
 *     consultationCount: 3200,
 *     bio: 'Dedicated pediatrician with 15 years caring for children from newborns to adolescents. Expert in developmental pediatrics.',
 *     bioRu: 'Педиатр с 15-летним опытом ухода за детьми от новорождённых до подростков.',
 *     bioUz: '15 yillik tajribaga ega bolalar shifokori. Yangi tug\'ilganlardan o\'spirinlargacha bo\'lgan bolalarga g\'amxo\'rlik qiladi.',
 *     education: 'Tashkent Pediatric Medical Institute — 2008',
 *     languages: ['Uzbek', 'Russian', 'English'],
 *     workingHours: 'Mon–Fri: 8:00–16:00',
 *     isAvailable: false,
 *     isVerified: true,
 *     avatar: null,
 *     price: 100000,
 *     documents: ['diploma.pdf', 'license.pdf', 'certificate.pdf'],
 *   },
 *   {
 *     id: 4,
 *     userId: 12,
 *     firstName: 'Jasur',
 *     lastName: 'Mirzoev',
 *     specialty: 'Dermatologist',
 *     specialtyRu: 'Дерматолог',
 *     specialtyUz: 'Dermatolog',
 *     experience: 6,
 *     rating: 4.6,
 *     reviewCount: 89,
 *     consultationCount: 540,
 *     bio: 'Dermatologist specializing in acne, psoriasis, and cosmetic dermatology. Passionate about skin health education.',
 *     bioRu: 'Дерматолог, специализирующийся на акне, псориазе и косметической дерматологии.',
 *     bioUz: 'Akne, psoriaz va kosmetik dermatologiyaga ixtisoslashgan dermatolог.',
 *     education: 'Andijan State Medical Institute — 2017',
 *     languages: ['Uzbek', 'Russian'],
 *     workingHours: 'Tue–Sat: 11:00–19:00',
 *     isAvailable: true,
 *     isVerified: true,
 *     avatar: null,
 *     price: 90000,
 *     documents: ['diploma.pdf'],
 *   },
 *   {
 *     id: 5,
 *     userId: 13,
 *     firstName: 'Nargiza',
 *     lastName: 'Abdullayeva',
 *     specialty: 'Gynecologist',
 *     specialtyRu: 'Гинеколог',
 *     specialtyUz: 'Ginekolog',
 *     experience: 20,
 *     rating: 4.92,
 *     reviewCount: 567,
 *     consultationCount: 4100,
 *     bio: 'Experienced gynecologist specializing in women\'s reproductive health, prenatal care, and menopause management.',
 *     bioRu: 'Опытный гинеколог, специализирующийся на репродуктивном здоровье женщин.',
 *     bioUz: 'Tajribali ginekolog. Ayollar reproduktiv sog\'lig\'i, prenatal parvarishga ixtisoslashgan.',
 *     education: 'Tashkent Medical Academy — 2003\nAdvanced Fellowship: Istanbul — 2007',
 *     languages: ['Uzbek', 'Russian', 'Turkish'],
 *     workingHours: 'Mon–Fri: 9:00–17:00',
 *     isAvailable: true,
 *     isVerified: true,
 *     avatar: null,
 *     price: 130000,
 *     documents: ['diploma.pdf', 'license.pdf'],
 *   },
 *   {
 *     id: 6,
 *     userId: 14,
 *     firstName: 'Otabek',
 *     lastName: 'Xolmatov',
 *     specialty: 'General Practitioner',
 *     specialtyRu: 'Терапевт',
 *     specialtyUz: 'Umumiy amaliyot',
 *     experience: 4,
 *     rating: 4.5,
 *     reviewCount: 43,
 *     consultationCount: 280,
 *     bio: 'General practitioner focused on preventive medicine, chronic disease management, and patient education.',
 *     bioRu: 'Терапевт, ориентированный на профилактику заболеваний и ведение хронических болезней.',
 *     bioUz: 'Profilaktik tibbiyot va surunkali kasalliklarni boshqarishga yo\'naltirilgan umumiy amaliyot shifokori.',
 *     education: 'Fergana Medical Institute — 2019',
 *     languages: ['Uzbek', 'Russian'],
 *     workingHours: 'Mon–Sat: 8:00–20:00',
 *     isAvailable: true,
 *     isVerified: true,
 *     avatar: null,
 *     price: 80000,
 *     documents: ['diploma.pdf'],
 *   },
 * ];
 * 
 * // ─── Mock Reviews ─────────────────────────────────────────────────────────────
 * export const MOCK_REVIEWS = {
 *   1: [
 *     { id: 1, patientName: 'Amir K.', rating: 5, comment: 'Excellent doctor! Very thorough and explained everything clearly.', date: '2025-01-15' },
 *     { id: 2, patientName: 'Zulfiya M.', rating: 5, comment: 'Отличный врач, очень внимательный и профессиональный.', date: '2025-01-10' },
 *     { id: 3, patientName: 'Sardor T.', rating: 4, comment: 'Professional and knowledgeable. Highly recommend.', date: '2024-12-28' },
 *   ],
 *   2: [
 *     { id: 4, patientName: 'Lola B.', rating: 5, comment: 'Helped me understand my condition clearly. Very patient doctor.', date: '2025-01-12' },
 *     { id: 5, patientName: 'Mansur R.', rating: 4, comment: 'Хороший специалист, быстро разобрался с моей проблемой.', date: '2024-12-30' },
 *   ],
 * };
 * 
 * // ─── Mock Conversations ───────────────────────────────────────────────────────
 * export const MOCK_CONVERSATIONS = [
 *   {
 *     id: 1,
 *     doctor: MOCK_DOCTORS[0],
 *     patient: MOCK_USERS.patient,
 *     status: 'active',
 *     lastMessage: { text: 'How are you feeling today?', sentAt: '2025-01-20T14:30:00Z', senderId: 2 },
 *     unreadCount: 1,
 *     createdAt: '2025-01-18T10:00:00Z',
 *   },
 *   {
 *     id: 2,
 *     doctor: MOCK_DOCTORS[2],
 *     patient: MOCK_USERS.patient,
 *     status: 'ended',
 *     lastMessage: { text: 'Thank you, feel much better now!', sentAt: '2025-01-15T16:00:00Z', senderId: 1 },
 *     unreadCount: 0,
 *     createdAt: '2025-01-14T09:00:00Z',
 *   },
 * ];
 * 
 * export const MOCK_MESSAGES = {
 *   1: [
 *     { id: 1, conversationId: 1, senderId: 2, text: 'Hello! I reviewed your information. What are your main symptoms?', type: 'text', sentAt: '2025-01-20T10:00:00Z' },
 *     { id: 2, conversationId: 1, senderId: 1, text: "I've been having chest pain and shortness of breath for 3 days.", type: 'text', sentAt: '2025-01-20T10:02:00Z' },
 *     { id: 3, conversationId: 1, senderId: 2, text: 'I see. Is the chest pain sharp or dull? Does it radiate anywhere?', type: 'text', sentAt: '2025-01-20T10:03:00Z' },
 *     { id: 4, conversationId: 1, senderId: 1, text: "It's dull and sometimes I feel it in my left arm too.", type: 'text', sentAt: '2025-01-20T10:05:00Z' },
 *     { id: 5, conversationId: 1, senderId: 2, text: 'Those are symptoms we should take seriously. I recommend you get an ECG done as soon as possible. I can write you a referral.', type: 'text', sentAt: '2025-01-20T10:07:00Z' },
 *     { id: 6, conversationId: 1, senderId: 1, text: 'Thank you doctor. Should I go to the emergency room?', type: 'text', sentAt: '2025-01-20T14:28:00Z' },
 *     { id: 7, conversationId: 1, senderId: 2, text: 'How are you feeling today?', type: 'text', sentAt: '2025-01-20T14:30:00Z' },
 *   ],
 * };
 * 
 * // ─── Mock Admin Stats ─────────────────────────────────────────────────────────
 * export const MOCK_ADMIN_STATS = {
 *   totalUsers: 1247,
 *   activeDoctors: 89,
 *   pendingApplications: 7,
 *   todayConsultations: 43,
 *   totalConsultations: 8920,
 *   revenueThisMonth: 45600000,
 *   newUsersThisWeek: 134,
 * };
 * 
 * export const MOCK_DOCTOR_APPLICATIONS = [
 *   {
 *     id: 1,
 *     user: { firstName: 'Kamol', lastName: 'Nazarov', email: 'kamol@example.com' },
 *     specialty: 'Orthopedist',
 *     experience: 9,
 *     education: 'Tashkent Medical Academy, 2014',
 *     status: 'pending',
 *     appliedAt: '2025-01-19T11:00:00Z',
 *     documents: ['diploma.pdf', 'license.pdf'],
 *   },
 *   {
 *     id: 2,
 *     user: { firstName: 'Gulnora', lastName: 'Saidova', email: 'gulnora@example.com' },
 *     specialty: 'Psychiatrist',
 *     experience: 11,
 *     education: 'Samarkand Medical University, 2012',
 *     status: 'pending',
 *     appliedAt: '2025-01-18T09:30:00Z',
 *     documents: ['diploma.pdf'],
 *   },
 *   {
 *     id: 3,
 *     user: { firstName: 'Timur', lastName: 'Ergashev', email: 'timur@example.com' },
 *     specialty: 'Ophthalmologist',
 *     experience: 5,
 *     education: 'Andijan State Medical Institute, 2018',
 *     status: 'approved',
 *     appliedAt: '2025-01-10T14:00:00Z',
 *     documents: ['diploma.pdf', 'certificate.pdf'],
 *   },
 *   {
 *     id: 4,
 *     user: { firstName: 'Feruza', lastName: 'Mirzayeva', email: 'feruza@example.com' },
 *     specialty: 'Endocrinologist',
 *     experience: 3,
 *     education: 'Tashkent Pediatric Medical Institute, 2020',
 *     status: 'rejected',
 *     appliedAt: '2025-01-05T10:00:00Z',
 *     documents: ['diploma.pdf'],
 *   },
 * ];
 * 
 * export const MOCK_ALL_USERS = [
 *   { id: 1, firstName: 'Amir', lastName: 'Karimov', email: 'amir@example.com', role: 'patient', status: 'active', joinedAt: '2024-11-10' },
 *   { id: 2, firstName: 'Dilnoza', lastName: 'Yusupova', email: 'dilnoza@example.com', role: 'doctor', status: 'active', joinedAt: '2024-10-05' },
 *   { id: 4, firstName: 'Sardor', lastName: 'Toshev', email: 'sardor@example.com', role: 'patient', status: 'active', joinedAt: '2024-12-01' },
 *   { id: 5, firstName: 'Zulfiya', lastName: 'Hamidova', email: 'zulfiya@example.com', role: 'patient', status: 'banned', joinedAt: '2024-09-15' },
 *   { id: 6, firstName: 'Nodir', lastName: 'Alimov', email: 'nodir@example.com', role: 'doctor', status: 'active', joinedAt: '2024-08-20' },
 * ];
 * 
 * // ─── Mock API Functions ────────────────────────────────────────────────────────
 * export const mockAuthAPI = {
 *   getCSRF: async () => ({ data: {} }),
 * 
 *   login: async ({ email, password }) => {
 *     await delay();
 *     const user = Object.values(MOCK_USERS).find(u => u.email === email);
 *     if (!user || password !== 'password123') {
 *       throw { response: { data: { error: 'Invalid credentials' }, status: 400 } };
 *     }
 *     return { data: { user, token: 'mock-token-' + user.id } };
 *   },
 * 
 *   register: async (data) => {
 *     await delay();
 *     const newUser = {
 *       id: Date.now(),
 *       email: data.email,
 *       firstName: data.firstName,
 *       lastName: data.lastName,
 *       role: data.role || 'patient',
 *       avatar: null,
 *       createdAt: new Date().toISOString(),
 *     };
 *     return { data: { user: newUser, token: 'mock-token-' + newUser.id } };
 *   },
 * 
 *   logout: async () => { await delay(200); return { data: {} }; },
 * 
 *   googleAuth: async (token) => {
 *     await delay();
 *     return { data: { user: MOCK_USERS.patient, token: 'mock-google-token' } };
 *   },
 * 
 *   getProfile: async () => {
 *     await delay(300);
 *     return { data: MOCK_USERS.patient };
 *   },
 * 
 *   updateProfile: async (data) => {
 *     await delay();
 *     return { data: { ...MOCK_USERS.patient, ...data } };
 *   },
 * 
 *   resetPasswordRequest: async (email) => {
 *     await delay();
 *     return { data: { message: 'Reset link sent' } };
 *   },
 * };
 * 
 * export const mockDoctorsAPI = {
 *   search: async (params = {}) => {
 *     await delay();
 *     let doctors = [...MOCK_DOCTORS];
 *     if (params.search) {
 *       const q = params.search.toLowerCase();
 *       doctors = doctors.filter(d =>
 *         `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
 *         d.specialty.toLowerCase().includes(q)
 *       );
 *     }
 *     if (params.specialty) {
 *       doctors = doctors.filter(d => d.specialty === params.specialty);
 *     }
 *     if (params.available) {
 *       doctors = doctors.filter(d => d.isAvailable);
 *     }
 *     if (params.sort === 'rating') doctors.sort((a, b) => b.rating - a.rating);
 *     if (params.sort === 'experience') doctors.sort((a, b) => b.experience - a.experience);
 *     if (params.sort === 'consultations') doctors.sort((a, b) => b.consultationCount - a.consultationCount);
 *     return { data: { results: doctors, count: doctors.length } };
 *   },
 * 
 *   getById: async (id) => {
 *     await delay();
 *     const doctor = MOCK_DOCTORS.find(d => d.id === Number(id));
 *     if (!doctor) throw { response: { status: 404 } };
 *     return { data: doctor };
 *   },
 * 
 *   getReviews: async (doctorId) => {
 *     await delay(400);
 *     return { data: { results: MOCK_REVIEWS[doctorId] || [] } };
 *   },
 * 
 *   getFeatured: async () => {
 *     await delay();
 *     return { data: MOCK_DOCTORS.slice(0, 3) };
 *   },
 * 
 *   submitApplication: async (data) => {
 *     await delay(1200);
 *     return { data: { id: Date.now(), status: 'pending' } };
 *   },
 * };
 * 
 * export const mockChatAPI = {
 *   getConversations: async () => {
 *     await delay();
 *     return { data: MOCK_CONVERSATIONS };
 *   },
 * 
 *   getMessages: async (conversationId) => {
 *     await delay(400);
 *     return { data: { results: MOCK_MESSAGES[conversationId] || [] } };
 *   },
 * 
 *   startConsultation: async (doctorId) => {
 *     await delay();
 *     const doctor = MOCK_DOCTORS.find(d => d.id === Number(doctorId));
 *     const newConv = {
 *       id: Date.now(),
 *       doctor,
 *       patient: MOCK_USERS.patient,
 *       status: 'active',
 *       lastMessage: null,
 *       unreadCount: 0,
 *       createdAt: new Date().toISOString(),
 *     };
 *     MOCK_CONVERSATIONS.unshift(newConv);
 *     return { data: newConv };
 *   },
 * 
 *   endConsultation: async (conversationId) => {
 *     await delay();
 *     return { data: { status: 'ended' } };
 *   },
 * };
 * 
 * export const mockAdminAPI = {
 *   getStats: async () => {
 *     await delay(500);
 *     return { data: MOCK_ADMIN_STATS };
 *   },
 * 
 *   getDoctorApplications: async (status) => {
 *     await delay();
 *     const apps = status && status !== 'all'
 *       ? MOCK_DOCTOR_APPLICATIONS.filter(a => a.status === status)
 *       : MOCK_DOCTOR_APPLICATIONS;
 *     return { data: apps };
 *   },
 * 
 *   approveDoctor: async (id) => {
 *     await delay();
 *     const app = MOCK_DOCTOR_APPLICATIONS.find(a => a.id === Number(id));
 *     if (app) app.status = 'approved';
 *     return { data: { status: 'approved' } };
 *   },
 * 
 *   rejectDoctor: async (id) => {
 *     await delay();
 *     const app = MOCK_DOCTOR_APPLICATIONS.find(a => a.id === Number(id));
 *     if (app) app.status = 'rejected';
 *     return { data: { status: 'rejected' } };
 *   },
 * 
 *   getUsers: async () => {
 *     await delay();
 *     return { data: { results: MOCK_ALL_USERS } };
 *   },
 * 
 *   banUser: async (id) => {
 *     await delay();
 *     const user = MOCK_ALL_USERS.find(u => u.id === Number(id));
 *     if (user) user.status = 'banned';
 *     return { data: {} };
 *   },
 * 
 *   unbanUser: async (id) => {
 *     await delay();
 *     const user = MOCK_ALL_USERS.find(u => u.id === Number(id));
 *     if (user) user.status = 'active';
 *     return { data: {} };
 *   },
 * };
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/i18n/translations.js
 * ──────────────────────────────────────────────────────────────────────────
 *
 * export const translations = {
 *   en: {
 *     // Nav
 *     nav: {
 *       home: 'Home',
 *       doctors: 'Find Doctors',
 *       aiAssistant: 'AI Assistant',
 *       consultations: 'My Consultations',
 *       dashboard: 'Dashboard',
 *       admin: 'Admin Panel',
 *       login: 'Sign In',
 *       register: 'Sign Up',
 *       logout: 'Sign Out',
 *       profile: 'My Profile',
 *       becomeDoctor: 'Become a Doctor',
 *     },
 *     // Home
 *     home: {
 *       hero: {
 *         badge: 'Trusted by 10,000+ patients',
 *         title: 'Your Health,\nOur Priority',
 *         subtitle: 'Connect with certified doctors online. Get expert medical advice, real-time consultations, and AI-powered diagnostics — all in one place.',
 *         cta: 'Find a Doctor',
 *         ctaSecondary: 'Try AI Diagnosis',
 *         stats: {
 *           doctors: 'Verified Doctors',
 *           consultations: 'Consultations',
 *           satisfaction: 'Satisfaction Rate',
 *           available: 'Available 24/7',
 *         }
 *       },
 *       features: {
 *         title: 'Why Choose Healzy?',
 *         subtitle: 'Everything you need for your health in one modern platform',
 *         chat: { title: 'Real-time Consultations', desc: 'Instant messaging with your doctor. No waiting rooms, no delays.' },
 *         ai: { title: 'AI Health Assistant', desc: 'Voice and text-powered AI diagnostics using the latest Gemini models.' },
 *         secure: { title: 'Private & Secure', desc: 'End-to-end encrypted communications. Your health data stays yours.' },
 *         search: { title: 'Find Specialists', desc: 'Search by specialty, experience, rating, and availability.' },
 *       },
 *       howItWorks: {
 *         title: 'How It Works',
 *         steps: [
 *           { title: 'Create Account', desc: 'Sign up in under a minute with email or Google' },
 *           { title: 'Find Your Doctor', desc: 'Search by specialty, read reviews, check availability' },
 *           { title: 'Start Consultation', desc: 'Chat in real-time, share files, get prescriptions' },
 *           { title: 'Stay Healthy', desc: 'Track your history, follow-ups, and health journey' },
 *         ]
 *       },
 *       topDoctors: {
 *         title: 'Top Rated Doctors',
 *         viewAll: 'View All Doctors',
 *       },
 *       cta: {
 *         title: 'Ready to Take Control of Your Health?',
 *         subtitle: 'Join thousands of patients who trust Healzy for their medical needs.',
 *         button: 'Get Started Free',
 *       }
 *     },
 *     // Auth
 *     auth: {
 *       login: {
 *         title: 'Welcome Back',
 *         subtitle: 'Sign in to your Healzy account',
 *         email: 'Email Address',
 *         password: 'Password',
 *         forgotPassword: 'Forgot password?',
 *         submit: 'Sign In',
 *         noAccount: "Don't have an account?",
 *         register: 'Create one',
 *         orGoogle: 'Or continue with',
 *         google: 'Google',
 *       },
 *       register: {
 *         title: 'Join Healzy',
 *         subtitle: 'Create your free account today',
 *         firstName: 'First Name',
 *         lastName: 'Last Name',
 *         email: 'Email Address',
 *         password: 'Password',
 *         confirmPassword: 'Confirm Password',
 *         role: 'I am a',
 *         patient: 'Patient',
 *         doctor: 'Doctor',
 *         submit: 'Create Account',
 *         hasAccount: 'Already have an account?',
 *         login: 'Sign in',
 *         terms: 'By creating an account, you agree to our Terms of Service and Privacy Policy.',
 *       },
 *       resetPassword: {
 *         title: 'Reset Password',
 *         subtitle: 'Enter your email to receive reset instructions',
 *         email: 'Email Address',
 *         submit: 'Send Reset Link',
 *         back: 'Back to Sign In',
 *         success: 'Reset link sent! Check your email.',
 *       }
 *     },
 *     // Doctors
 *     doctors: {
 *       search: {
 *         title: 'Find Your Doctor',
 *         subtitle: 'Search from hundreds of verified specialists',
 *         placeholder: 'Search by name or specialty...',
 *         filterSpecialty: 'Specialty',
 *         filterRating: 'Min Rating',
 *         filterAvailable: 'Available Now',
 *         sort: 'Sort by',
 *         sortOptions: {
 *           rating: 'Highest Rated',
 *           experience: 'Most Experienced',
 *           consultations: 'Most Consultations',
 *           price: 'Price',
 *         },
 *         noResults: 'No doctors found. Try adjusting your filters.',
 *         results: 'doctors found',
 *       },
 *       card: {
 *         experience: 'years exp.',
 *         consultations: 'consultations',
 *         rating: 'rating',
 *         bookNow: 'Book Consultation',
 *         viewProfile: 'View Profile',
 *         available: 'Available',
 *         busy: 'Busy',
 *       },
 *       profile: {
 *         about: 'About',
 *         education: 'Education',
 *         specializations: 'Specializations',
 *         reviews: 'Patient Reviews',
 *         startConsultation: 'Start Consultation',
 *         sendMessage: 'Send Message',
 *         experience: 'Experience',
 *         yearsOfExperience: 'Years of Experience',
 *         totalConsultations: 'Total Consultations',
 *         averageRating: 'Average Rating',
 *         languages: 'Languages',
 *         workingHours: 'Working Hours',
 *         documents: 'Verified Documents',
 *       }
 *     },
 *     // Chat
 *     chat: {
 *       title: 'Consultations',
 *       noConversation: 'Select a conversation to start chatting',
 *       messagePlaceholder: 'Type your message...',
 *       send: 'Send',
 *       online: 'Online',
 *       offline: 'Offline',
 *       typing: 'typing...',
 *       attachFile: 'Attach file',
 *       today: 'Today',
 *       yesterday: 'Yesterday',
 *       newConsultation: 'New Consultation',
 *       endConsultation: 'End Consultation',
 *       consultationEnded: 'This consultation has ended.',
 *       fileShared: 'File shared',
 *       imageShared: 'Image shared',
 *     },
 *     // AI
 *     ai: {
 *       title: 'Healzy AI Assistant',
 *       subtitle: 'Ask about symptoms, medications, or get health advice',
 *       placeholder: 'Describe your symptoms or ask a health question...',
 *       send: 'Send',
 *       voiceStart: 'Start Voice Input',
 *       voiceStop: 'Stop Recording',
 *       clearHistory: 'Clear History',
 *       disclaimer: 'AI responses are for informational purposes only and do not constitute medical advice. Always consult a qualified healthcare professional.',
 *       thinking: 'Analyzing your query...',
 *       uploadImage: 'Upload medical image',
 *       newChat: 'New Chat',
 *       history: 'Chat History',
 *       suggestions: {
 *         title: 'Quick suggestions',
 *         items: [
 *           'What are common cold symptoms?',
 *           'How to manage high blood pressure?',
 *           'When should I see a doctor for a headache?',
 *           'What vitamins should I take daily?',
 *         ]
 *       },
 *       errorMessage: 'Sorry, I encountered an error. Please try again.',
 *     },
 *     // Admin
 *     admin: {
 *       title: 'Admin Panel',
 *       dashboard: 'Dashboard',
 *       users: 'Users',
 *       doctors: 'Doctor Applications',
 *       consultations: 'Consultations',
 *       stats: {
 *         totalUsers: 'Total Users',
 *         activeDoctors: 'Active Doctors',
 *         pendingApps: 'Pending Applications',
 *         todayConsultations: "Today's Consultations",
 *       },
 *       doctorApps: {
 *         title: 'Doctor Applications',
 *         pending: 'Pending',
 *         approved: 'Approved',
 *         rejected: 'Rejected',
 *         approve: 'Approve',
 *         reject: 'Reject',
 *         viewDocs: 'View Documents',
 *         appliedAt: 'Applied',
 *         specialty: 'Specialty',
 *         experience: 'Experience',
 *         education: 'Education',
 *       },
 *       users: {
 *         title: 'User Management',
 *         name: 'Name',
 *         email: 'Email',
 *         role: 'Role',
 *         status: 'Status',
 *         joined: 'Joined',
 *         actions: 'Actions',
 *         ban: 'Ban User',
 *         unban: 'Unban User',
 *         makeAdmin: 'Make Admin',
 *       }
 *     },
 *     // Patient Dashboard
 *     patient: {
 *       dashboard: {
 *         title: 'My Health Dashboard',
 *         welcome: 'Welcome back',
 *         recentConsultations: 'Recent Consultations',
 *         upcomingAppointments: 'Upcoming',
 *         healthSummary: 'Health Summary',
 *         findDoctor: 'Find a Doctor',
 *         myDoctors: 'My Doctors',
 *         aiHistory: 'AI Chat History',
 *         noConsultations: 'No consultations yet. Find a doctor to get started.',
 *       }
 *     },
 *     // Doctor Dashboard
 *     doctorDashboard: {
 *       title: 'Doctor Dashboard',
 *       myPatients: 'My Patients',
 *       pendingRequests: 'Pending Requests',
 *       schedule: 'Schedule',
 *       earnings: 'Earnings',
 *       becomeDoctor: {
 *         title: 'Complete Your Doctor Profile',
 *         subtitle: 'Submit your credentials to start receiving patients',
 *         specialty: 'Medical Specialty',
 *         experience: 'Years of Experience',
 *         education: 'Education & Certifications',
 *         bio: 'Professional Bio',
 *         documents: 'Upload Documents',
 *         submit: 'Submit Application',
 *         pending: 'Application Under Review',
 *         pendingDesc: 'Your application is being reviewed by our team. This usually takes 1-2 business days.',
 *       }
 *     },
 *     // Common
 *     common: {
 *       loading: 'Loading...',
 *       error: 'Something went wrong',
 *       retry: 'Try Again',
 *       save: 'Save',
 *       cancel: 'Cancel',
 *       delete: 'Delete',
 *       edit: 'Edit',
 *       back: 'Back',
 *       next: 'Next',
 *       submit: 'Submit',
 *       search: 'Search',
 *       filter: 'Filter',
 *       clear: 'Clear',
 *       close: 'Close',
 *       confirm: 'Confirm',
 *       yes: 'Yes',
 *       no: 'No',
 *       or: 'or',
 *       and: 'and',
 *       required: 'Required',
 *       optional: 'Optional',
 *       darkMode: 'Dark Mode',
 *       lightMode: 'Light Mode',
 *       language: 'Language',
 *       notifications: 'Notifications',
 *       settings: 'Settings',
 *       theme: 'Theme',
 *     },
 *     specialties: [
 *       'General Practitioner', 'Cardiologist', 'Dermatologist', 'Neurologist',
 *       'Pediatrician', 'Psychiatrist', 'Gynecologist', 'Orthopedist',
 *       'Ophthalmologist', 'ENT Specialist', 'Endocrinologist', 'Gastroenterologist',
 *       'Urologist', 'Pulmonologist', 'Rheumatologist', 'Oncologist',
 *     ],
 *   },
 * 
 *   ru: {
 *     nav: {
 *       home: 'Главная',
 *       doctors: 'Найти врача',
 *       aiAssistant: 'ИИ Ассистент',
 *       consultations: 'Мои консультации',
 *       dashboard: 'Личный кабинет',
 *       admin: 'Панель администратора',
 *       login: 'Войти',
 *       register: 'Регистрация',
 *       logout: 'Выйти',
 *       profile: 'Мой профиль',
 *       becomeDoctor: 'Стать врачом',
 *     },
 *     home: {
 *       hero: {
 *         badge: 'Доверяют более 10 000 пациентов',
 *         title: 'Ваше здоровье —\nнаш приоритет',
 *         subtitle: 'Консультируйтесь с сертифицированными врачами онлайн. Экспертные консультации, ИИ-диагностика и медицинская помощь — всё в одном месте.',
 *         cta: 'Найти врача',
 *         ctaSecondary: 'Попробовать ИИ',
 *         stats: {
 *           doctors: 'Проверенных врачей',
 *           consultations: 'Консультаций',
 *           satisfaction: 'Довольных пациентов',
 *           available: 'Доступны 24/7',
 *         }
 *       },
 *       features: {
 *         title: 'Почему выбирают Healzy?',
 *         subtitle: 'Всё необходимое для вашего здоровья на одной современной платформе',
 *         chat: { title: 'Консультации в реальном времени', desc: 'Мгновенный чат с врачом. Без очередей и задержек.' },
 *         ai: { title: 'ИИ Ассистент здоровья', desc: 'Голосовая и текстовая ИИ-диагностика на основе Gemini.' },
 *         secure: { title: 'Конфиденциально и безопасно', desc: 'Сквозное шифрование. Ваши данные — только ваши.' },
 *         search: { title: 'Найдите специалиста', desc: 'Поиск по специализации, опыту, рейтингу и доступности.' },
 *       },
 *       howItWorks: {
 *         title: 'Как это работает',
 *         steps: [
 *           { title: 'Создайте аккаунт', desc: 'Регистрация за минуту через email или Google' },
 *           { title: 'Найдите врача', desc: 'Поиск по специализации, отзывы, проверка доступности' },
 *           { title: 'Начните консультацию', desc: 'Чат в реальном времени, файлы, рецепты' },
 *           { title: 'Будьте здоровы', desc: 'История, повторные приёмы и ваш путь к здоровью' },
 *         ]
 *       },
 *       topDoctors: {
 *         title: 'Лучшие врачи',
 *         viewAll: 'Все врачи',
 *       },
 *       cta: {
 *         title: 'Готовы заботиться о своём здоровье?',
 *         subtitle: 'Присоединяйтесь к тысячам пациентов, которые доверяют Healzy.',
 *         button: 'Начать бесплатно',
 *       }
 *     },
 *     auth: {
 *       login: {
 *         title: 'Добро пожаловать',
 *         subtitle: 'Войдите в свой аккаунт Healzy',
 *         email: 'Email',
 *         password: 'Пароль',
 *         forgotPassword: 'Забыли пароль?',
 *         submit: 'Войти',
 *         noAccount: 'Нет аккаунта?',
 *         register: 'Зарегистрироваться',
 *         orGoogle: 'Или войдите через',
 *         google: 'Google',
 *       },
 *       register: {
 *         title: 'Регистрация в Healzy',
 *         subtitle: 'Создайте бесплатный аккаунт',
 *         firstName: 'Имя',
 *         lastName: 'Фамилия',
 *         email: 'Email',
 *         password: 'Пароль',
 *         confirmPassword: 'Подтвердите пароль',
 *         role: 'Я являюсь',
 *         patient: 'Пациентом',
 *         doctor: 'Врачом',
 *         submit: 'Создать аккаунт',
 *         hasAccount: 'Уже есть аккаунт?',
 *         login: 'Войти',
 *         terms: 'Создавая аккаунт, вы соглашаетесь с Условиями использования и Политикой конфиденциальности.',
 *       },
 *       resetPassword: {
 *         title: 'Сброс пароля',
 *         subtitle: 'Введите email для получения инструкций',
 *         email: 'Email',
 *         submit: 'Отправить ссылку',
 *         back: 'Назад',
 *         success: 'Ссылка отправлена! Проверьте почту.',
 *       }
 *     },
 *     doctors: {
 *       search: {
 *         title: 'Найдите своего врача',
 *         subtitle: 'Выберите из сотен проверенных специалистов',
 *         placeholder: 'Поиск по имени или специализации...',
 *         filterSpecialty: 'Специализация',
 *         filterRating: 'Мин. рейтинг',
 *         filterAvailable: 'Доступен сейчас',
 *         sort: 'Сортировка',
 *         sortOptions: {
 *           rating: 'По рейтингу',
 *           experience: 'По опыту',
 *           consultations: 'По консультациям',
 *           price: 'По цене',
 *         },
 *         noResults: 'Врачи не найдены. Измените фильтры.',
 *         results: 'врачей найдено',
 *       },
 *       card: {
 *         experience: 'лет опыта',
 *         consultations: 'консультаций',
 *         rating: 'рейтинг',
 *         bookNow: 'Записаться',
 *         viewProfile: 'Профиль',
 *         available: 'Доступен',
 *         busy: 'Занят',
 *       },
 *       profile: {
 *         about: 'О враче',
 *         education: 'Образование',
 *         specializations: 'Специализации',
 *         reviews: 'Отзывы пациентов',
 *         startConsultation: 'Начать консультацию',
 *         sendMessage: 'Написать сообщение',
 *         experience: 'Опыт',
 *         yearsOfExperience: 'Лет опыта',
 *         totalConsultations: 'Всего консультаций',
 *         averageRating: 'Средний рейтинг',
 *         languages: 'Языки',
 *         workingHours: 'Часы работы',
 *         documents: 'Подтверждённые документы',
 *       }
 *     },
 *     chat: {
 *       title: 'Консультации',
 *       noConversation: 'Выберите чат для общения',
 *       messagePlaceholder: 'Введите сообщение...',
 *       send: 'Отправить',
 *       online: 'Онлайн',
 *       offline: 'Не в сети',
 *       typing: 'печатает...',
 *       attachFile: 'Прикрепить файл',
 *       today: 'Сегодня',
 *       yesterday: 'Вчера',
 *       newConsultation: 'Новая консультация',
 *       endConsultation: 'Завершить',
 *       consultationEnded: 'Консультация завершена.',
 *       fileShared: 'Файл отправлен',
 *       imageShared: 'Изображение отправлено',
 *     },
 *     ai: {
 *       title: 'ИИ Ассистент Healzy',
 *       subtitle: 'Спросите о симптомах, лекарствах или получите совет',
 *       placeholder: 'Опишите симптомы или задайте вопрос о здоровье...',
 *       send: 'Отправить',
 *       voiceStart: 'Начать голосовой ввод',
 *       voiceStop: 'Остановить запись',
 *       clearHistory: 'Очистить историю',
 *       disclaimer: 'Ответы ИИ носят информационный характер и не являются медицинской консультацией. Всегда консультируйтесь с квалифицированным врачом.',
 *       thinking: 'Анализирую запрос...',
 *       uploadImage: 'Загрузить медицинское изображение',
 *       newChat: 'Новый чат',
 *       history: 'История чатов',
 *       suggestions: {
 *         title: 'Быстрые вопросы',
 *         items: [
 *           'Симптомы простуды?',
 *           'Как контролировать давление?',
 *           'Когда идти к врачу с головной болью?',
 *           'Какие витамины принимать?',
 *         ]
 *       },
 *       errorMessage: 'Произошла ошибка. Попробуйте ещё раз.',
 *     },
 *     admin: {
 *       title: 'Панель администратора',
 *       dashboard: 'Главная',
 *       users: 'Пользователи',
 *       doctors: 'Заявки врачей',
 *       consultations: 'Консультации',
 *       stats: {
 *         totalUsers: 'Всего пользователей',
 *         activeDoctors: 'Активных врачей',
 *         pendingApps: 'Ожидающих заявок',
 *         todayConsultations: 'Консультаций сегодня',
 *       },
 *       doctorApps: {
 *         title: 'Заявки врачей',
 *         pending: 'Ожидают',
 *         approved: 'Одобрены',
 *         rejected: 'Отклонены',
 *         approve: 'Одобрить',
 *         reject: 'Отклонить',
 *         viewDocs: 'Документы',
 *         appliedAt: 'Подал заявку',
 *         specialty: 'Специализация',
 *         experience: 'Опыт',
 *         education: 'Образование',
 *       },
 *       users: {
 *         title: 'Управление пользователями',
 *         name: 'Имя',
 *         email: 'Email',
 *         role: 'Роль',
 *         status: 'Статус',
 *         joined: 'Зарегистрирован',
 *         actions: 'Действия',
 *         ban: 'Заблокировать',
 *         unban: 'Разблокировать',
 *         makeAdmin: 'Сделать администратором',
 *       }
 *     },
 *     patient: {
 *       dashboard: {
 *         title: 'Мой кабинет',
 *         welcome: 'Добро пожаловать',
 *         recentConsultations: 'Последние консультации',
 *         upcomingAppointments: 'Предстоящие',
 *         healthSummary: 'Сводка здоровья',
 *         findDoctor: 'Найти врача',
 *         myDoctors: 'Мои врачи',
 *         aiHistory: 'История ИИ чата',
 *         noConsultations: 'Консультаций пока нет. Найдите врача чтобы начать.',
 *       }
 *     },
 *     doctorDashboard: {
 *       title: 'Кабинет врача',
 *       myPatients: 'Мои пациенты',
 *       pendingRequests: 'Ожидающие запросы',
 *       schedule: 'Расписание',
 *       earnings: 'Заработок',
 *       becomeDoctor: {
 *         title: 'Заполните профиль врача',
 *         subtitle: 'Отправьте данные для начала приёма пациентов',
 *         specialty: 'Медицинская специализация',
 *         experience: 'Лет опыта',
 *         education: 'Образование и сертификаты',
 *         bio: 'Профессиональная биография',
 *         documents: 'Загрузить документы',
 *         submit: 'Отправить заявку',
 *         pending: 'Заявка на рассмотрении',
 *         pendingDesc: 'Наша команда рассматривает вашу заявку. Обычно это занимает 1-2 рабочих дня.',
 *       }
 *     },
 *     common: {
 *       loading: 'Загрузка...',
 *       error: 'Что-то пошло не так',
 *       retry: 'Попробовать снова',
 *       save: 'Сохранить',
 *       cancel: 'Отмена',
 *       delete: 'Удалить',
 *       edit: 'Редактировать',
 *       back: 'Назад',
 *       next: 'Далее',
 *       submit: 'Отправить',
 *       search: 'Поиск',
 *       filter: 'Фильтр',
 *       clear: 'Очистить',
 *       close: 'Закрыть',
 *       confirm: 'Подтвердить',
 *       yes: 'Да',
 *       no: 'Нет',
 *       or: 'или',
 *       and: 'и',
 *       required: 'Обязательно',
 *       optional: 'Необязательно',
 *       darkMode: 'Тёмная тема',
 *       lightMode: 'Светлая тема',
 *       language: 'Язык',
 *       notifications: 'Уведомления',
 *       settings: 'Настройки',
 *       theme: 'Тема',
 *     },
 *     specialties: [
 *       'Терапевт', 'Кардиолог', 'Дерматолог', 'Невролог',
 *       'Педиатр', 'Психиатр', 'Гинеколог', 'Ортопед',
 *       'Офтальмолог', 'Отоларинголог', 'Эндокринолог', 'Гастроэнтеролог',
 *       'Уролог', 'Пульмонолог', 'Ревматолог', 'Онколог',
 *     ],
 *   },
 * 
 *   uz: {
 *     nav: {
 *       home: 'Bosh sahifa',
 *       doctors: 'Shifokor topish',
 *       aiAssistant: 'AI Yordamchi',
 *       consultations: 'Mening konsultatsiyalarim',
 *       dashboard: 'Shaxsiy kabinet',
 *       admin: 'Admin paneli',
 *       login: 'Kirish',
 *       register: "Ro'yxatdan o'tish",
 *       logout: 'Chiqish',
 *       profile: 'Mening profilim',
 *       becomeDoctor: 'Shifokor bo\'lish',
 *     },
 *     home: {
 *       hero: {
 *         badge: '10 000+ bemor ishonadi',
 *         title: 'Sizning sog\'lig\'ingiz —\nbizning ustuvorligimiz',
 *         subtitle: 'Sertifikatlangan shifokorlar bilan onlayn maslahatlashing. Ekspert tavsiyalar, real vaqt konsultatsiyalari va AI diagnostika — hammasi bir joyda.',
 *         cta: 'Shifokor topish',
 *         ctaSecondary: 'AI Diagnostika',
 *         stats: {
 *           doctors: 'Tekshirilgan shifokorlar',
 *           consultations: 'Konsultatsiyalar',
 *           satisfaction: 'Qoniqish darajasi',
 *           available: '24/7 mavjud',
 *         }
 *       },
 *       features: {
 *         title: 'Nima uchun Healzy?',
 *         subtitle: 'Sog\'lig\'ingiz uchun kerakli hamma narsa bir zamonaviy platformada',
 *         chat: { title: 'Real vaqt konsultatsiyalari', desc: 'Shifokor bilan darhol yozishuv. Navbat yo\'q, kechikish yo\'q.' },
 *         ai: { title: 'AI sog\'liq yordamchisi', desc: 'Ovoz va matn orqali Gemini asosida AI diagnostika.' },
 *         secure: { title: 'Maxfiy va xavfsiz', desc: 'Uchidan-uchiga shifrlash. Sog\'liq ma\'lumotlaringiz faqat sizniki.' },
 *         search: { title: 'Mutaxassislarni topish', desc: 'Mutaxassislik, tajriba, reyting va mavjudlik bo\'yicha qidirish.' },
 *       },
 *       howItWorks: {
 *         title: 'Bu qanday ishlaydi',
 *         steps: [
 *           { title: 'Hisob yarating', desc: 'Email yoki Google orqali bir daqiqada ro\'yxatdan o\'ting' },
 *           { title: 'Shifokoringizni toping', desc: 'Mutaxassislik bo\'yicha qidiring, sharhlarni o\'qing' },
 *           { title: 'Konsultatsiya boshlang', desc: 'Real vaqt chat, fayllar, retseptlar' },
 *           { title: 'Sog\'lom bo\'ling', desc: 'Tarixingiz, takroriy qabullar va sog\'liq yo\'lingiz' },
 *         ]
 *       },
 *       topDoctors: {
 *         title: 'Eng yaxshi shifokorlar',
 *         viewAll: 'Barcha shifokorlar',
 *       },
 *       cta: {
 *         title: 'Sog\'lig\'ingizni nazorat qilishga tayyormisiz?',
 *         subtitle: 'Healzyga ishongan minglab bemorlarga qo\'shiling.',
 *         button: 'Bepul boshlash',
 *       }
 *     },
 *     auth: {
 *       login: {
 *         title: 'Xush kelibsiz',
 *         subtitle: 'Healzy hisobingizga kiring',
 *         email: 'Email manzil',
 *         password: 'Parol',
 *         forgotPassword: 'Parolni unutdingizmi?',
 *         submit: 'Kirish',
 *         noAccount: 'Hisobingiz yo\'qmi?',
 *         register: 'Yarating',
 *         orGoogle: 'Yoki orqali kirish',
 *         google: 'Google',
 *       },
 *       register: {
 *         title: 'Healzyga qo\'shiling',
 *         subtitle: 'Bepul hisob yarating',
 *         firstName: 'Ism',
 *         lastName: 'Familiya',
 *         email: 'Email manzil',
 *         password: 'Parol',
 *         confirmPassword: 'Parolni tasdiqlang',
 *         role: 'Men',
 *         patient: 'Bemorman',
 *         doctor: 'Shiforkorman',
 *         submit: 'Hisob yaratish',
 *         hasAccount: 'Hisobingiz bormi?',
 *         login: 'Kirish',
 *         terms: 'Hisob yaratish orqali Foydalanish shartlari va Maxfiylik siyosatiga rozilik bildirasiz.',
 *       },
 *       resetPassword: {
 *         title: 'Parolni tiklash',
 *         subtitle: 'Ko\'rsatmalar uchun emailingizni kiriting',
 *         email: 'Email manzil',
 *         submit: 'Havola yuborish',
 *         back: 'Kirish sahifasiga qaytish',
 *         success: 'Havola yuborildi! Emailingizni tekshiring.',
 *       }
 *     },
 *     doctors: {
 *       search: {
 *         title: 'Shifokoringizni toping',
 *         subtitle: 'Yuzlab tekshirilgan mutaxassislardan tanlang',
 *         placeholder: 'Ism yoki mutaxassislik bo\'yicha qidiring...',
 *         filterSpecialty: 'Mutaxassislik',
 *         filterRating: 'Min. reyting',
 *         filterAvailable: 'Hozir mavjud',
 *         sort: 'Saralash',
 *         sortOptions: {
 *           rating: 'Eng yuqori reyting',
 *           experience: 'Eng tajribali',
 *           consultations: 'Eng ko\'p konsultatsiya',
 *           price: 'Narx',
 *         },
 *         noResults: 'Shifokor topilmadi. Filtrlarni o\'zgartiring.',
 *         results: 'shifokor topildi',
 *       },
 *       card: {
 *         experience: 'yil tajriba',
 *         consultations: 'konsultatsiya',
 *         rating: 'reyting',
 *         bookNow: 'Qabul olish',
 *         viewProfile: 'Profilni ko\'rish',
 *         available: 'Mavjud',
 *         busy: 'Band',
 *       },
 *       profile: {
 *         about: 'Shifokor haqida',
 *         education: 'Ta\'lim',
 *         specializations: 'Mutaxassisliklar',
 *         reviews: 'Bemor sharhlari',
 *         startConsultation: 'Konsultatsiya boshlash',
 *         sendMessage: 'Xabar yuborish',
 *         experience: 'Tajriba',
 *         yearsOfExperience: 'Yillik tajriba',
 *         totalConsultations: 'Jami konsultatsiyalar',
 *         averageRating: "O'rtacha reyting",
 *         languages: 'Tillar',
 *         workingHours: 'Ish vaqti',
 *         documents: 'Tasdiqlangan hujjatlar',
 *       }
 *     },
 *     chat: {
 *       title: 'Konsultatsiyalar',
 *       noConversation: 'Chat tanlang',
 *       messagePlaceholder: 'Xabar yozing...',
 *       send: 'Yuborish',
 *       online: 'Onlayn',
 *       offline: 'Oflayn',
 *       typing: 'yozmoqda...',
 *       attachFile: 'Fayl biriktirish',
 *       today: 'Bugun',
 *       yesterday: 'Kecha',
 *       newConsultation: 'Yangi konsultatsiya',
 *       endConsultation: 'Tugatish',
 *       consultationEnded: 'Konsultatsiya tugadi.',
 *       fileShared: 'Fayl yuborildi',
 *       imageShared: 'Rasm yuborildi',
 *     },
 *     ai: {
 *       title: 'Healzy AI Yordamchi',
 *       subtitle: 'Simptomlar, dorilar yoki sog\'liq maslahati haqida so\'rang',
 *       placeholder: 'Simptomlaringizni tasvirlab bering yoki sog\'liq savoli bering...',
 *       send: 'Yuborish',
 *       voiceStart: 'Ovozli kiritishni boshlash',
 *       voiceStop: 'Yozishni to\'xtatish',
 *       clearHistory: 'Tarixni tozalash',
 *       disclaimer: 'AI javoblari faqat ma\'lumot uchun bo\'lib, tibbiy maslahat hisoblanmaydi. Har doim malakali shifokor bilan maslahatlashing.',
 *       thinking: 'So\'rovingiz tahlil qilinmoqda...',
 *       uploadImage: 'Tibbiy rasm yuklash',
 *       newChat: 'Yangi chat',
 *       history: 'Chat tarixi',
 *       suggestions: {
 *         title: 'Tez savollar',
 *         items: [
 *           'Shamollash belgilari nima?',
 *           'Qon bosimini qanday boshqarish?',
 *           'Bosh og\'riqda qachon shifokorga borish kerak?',
 *           'Har kuni qanday vitaminlar olish kerak?',
 *         ]
 *       },
 *       errorMessage: 'Xato yuz berdi. Qayta urinib ko\'ring.',
 *     },
 *     admin: {
 *       title: 'Admin paneli',
 *       dashboard: 'Bosh sahifa',
 *       users: 'Foydalanuvchilar',
 *       doctors: 'Shifokor arizalari',
 *       consultations: 'Konsultatsiyalar',
 *       stats: {
 *         totalUsers: 'Jami foydalanuvchilar',
 *         activeDoctors: 'Faol shifokorlar',
 *         pendingApps: 'Kutayotgan arizalar',
 *         todayConsultations: 'Bugungi konsultatsiyalar',
 *       },
 *       doctorApps: {
 *         title: 'Shifokor arizalari',
 *         pending: 'Kutmoqda',
 *         approved: 'Tasdiqlangan',
 *         rejected: 'Rad etilgan',
 *         approve: 'Tasdiqlash',
 *         reject: 'Rad etish',
 *         viewDocs: 'Hujjatlar',
 *         appliedAt: 'Ariza bergan',
 *         specialty: 'Mutaxassislik',
 *         experience: 'Tajriba',
 *         education: "Ta'lim",
 *       },
 *       users: {
 *         title: 'Foydalanuvchilarni boshqarish',
 *         name: 'Ism',
 *         email: 'Email',
 *         role: 'Rol',
 *         status: 'Holat',
 *         joined: "Qo'shilgan",
 *         actions: 'Amallar',
 *         ban: 'Bloklash',
 *         unban: 'Blokdan chiqarish',
 *         makeAdmin: 'Admin qilish',
 *       }
 *     },
 *     patient: {
 *       dashboard: {
 *         title: 'Mening kabinetim',
 *         welcome: 'Xush kelibsiz',
 *         recentConsultations: 'So\'nggi konsultatsiyalar',
 *         upcomingAppointments: 'Kelgusi',
 *         healthSummary: "Sog'liq xulosasi",
 *         findDoctor: 'Shifokor topish',
 *         myDoctors: 'Mening shifokorlarim',
 *         aiHistory: 'AI chat tarixi',
 *         noConsultations: 'Hali konsultatsiyalar yo\'q. Boshlash uchun shifokor toping.',
 *       }
 *     },
 *     doctorDashboard: {
 *       title: 'Shifokor kabineti',
 *       myPatients: 'Mening bemorlarim',
 *       pendingRequests: 'Kutayotgan so\'rovlar',
 *       schedule: 'Jadval',
 *       earnings: 'Daromad',
 *       becomeDoctor: {
 *         title: 'Shifokor profilingizni to\'ldiring',
 *         subtitle: 'Bemorlarni qabul qilishni boshlash uchun ma\'lumotlaringizni yuboring',
 *         specialty: 'Tibbiy mutaxassislik',
 *         experience: 'Yillik tajriba',
 *         education: "Ta'lim va sertifikatlar",
 *         bio: 'Professional biografiya',
 *         documents: 'Hujjatlarni yuklash',
 *         submit: 'Ariza yuborish',
 *         pending: "Ariza ko'rib chiqilmoqda",
 *         pendingDesc: 'Bizning jamoamiz arizangizni ko\'rib chiqmoqda. Bu odatda 1-2 ish kunini oladi.',
 *       }
 *     },
 *     common: {
 *       loading: 'Yuklanmoqda...',
 *       error: 'Xato yuz berdi',
 *       retry: 'Qayta urinish',
 *       save: 'Saqlash',
 *       cancel: 'Bekor qilish',
 *       delete: "O'chirish",
 *       edit: 'Tahrirlash',
 *       back: 'Orqaga',
 *       next: 'Keyingi',
 *       submit: 'Yuborish',
 *       search: 'Qidirish',
 *       filter: 'Filtr',
 *       clear: 'Tozalash',
 *       close: 'Yopish',
 *       confirm: 'Tasdiqlash',
 *       yes: 'Ha',
 *       no: "Yo'q",
 *       or: 'yoki',
 *       and: 'va',
 *       required: 'Majburiy',
 *       optional: 'Ixtiyoriy',
 *       darkMode: "Qorong'u rejim",
 *       lightMode: 'Yorqin rejim',
 *       language: 'Til',
 *       notifications: 'Bildirishnomalar',
 *       settings: 'Sozlamalar',
 *       theme: 'Mavzu',
 *     },
 *     specialties: [
 *       'Umumiy amaliyot', 'Kardiolog', 'Dermatolog', 'Nevrolog',
 *       'Pediatr', 'Psixiatr', 'Ginekolog', 'Ortoped',
 *       'Oftalmolog', 'LOR mutaxassisi', 'Endokrinolog', 'Gastroenterolog',
 *       'Urolog', 'Pulmonolog', 'Revmatolog', 'Onkolog',
 *     ],
 *   }
 * };
 * 
 * export const LANGUAGES = {
 *   en: { name: 'English', flag: '🇬🇧' },
 *   ru: { name: 'Русский', flag: '🇷🇺' },
 *   uz: { name: "O'zbek", flag: '🇺🇿' },
 * };
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/i18n/useT.js
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { createContext, useContext } from 'react';
 * import { translations } from './translations';
 * import { useUIStore } from '../store';
 * 
 * export const LanguageContext = createContext(null);
 * 
 * export const useT = () => {
 *   const language = useUIStore((s) => s.language);
 *   const t = translations[language] || translations.en;
 * 
 *   const get = (path) => {
 *     const keys = path.split('.');
 *     let val = t;
 *     for (const k of keys) {
 *       if (val == null) return path;
 *       val = val[k];
 *     }
 *     return val ?? path;
 *   };
 * 
 *   return { t, get, language };
 * };
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/styles/globals.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * /* ── Healzy Design System ── * /
 * 
 * :root {
 *   /* Colors — Light Theme * /
 *   --color-bg: #F8F6F1;
 *   --color-bg-secondary: #FFFFFF;
 *   --color-bg-tertiary: #F0EDE6;
 *   --color-surface: #FFFFFF;
 *   --color-surface-raised: #FFFFFF;
 * 
 *   --color-text-primary: #1A1714;
 *   --color-text-secondary: #5C5751;
 *   --color-text-tertiary: #8C8680;
 *   --color-text-inverse: #FFFFFF;
 * 
 *   --color-primary: #2D6A4F;
 *   --color-primary-light: #40916C;
 *   --color-primary-dark: #1B4332;
 *   --color-primary-muted: #D8F3DC;
 * 
 *   --color-accent: #E76F51;
 *   --color-accent-light: #F4A261;
 *   --color-accent-dark: #C45D40;
 * 
 *   --color-teal: #0F766E;
 *   --color-teal-light: #14B8A6;
 *   --color-teal-muted: #CCFBF1;
 * 
 *   --color-border: #E4E0D8;
 *   --color-border-strong: #C8C3BA;
 * 
 *   --color-success: #16A34A;
 *   --color-warning: #D97706;
 *   --color-error: #DC2626;
 *   --color-info: #2563EB;
 * 
 *   --color-success-muted: #DCFCE7;
 *   --color-warning-muted: #FEF3C7;
 *   --color-error-muted: #FEE2E2;
 * 
 *   /* Typography * /
 *   --font-display: 'Playfair Display', Georgia, serif;
 *   --font-body: 'DM Sans', system-ui, sans-serif;
 *   --font-mono: 'DM Mono', 'Fira Code', monospace;
 * 
 *   /* Spacing * /
 *   --space-1: 4px;
 *   --space-2: 8px;
 *   --space-3: 12px;
 *   --space-4: 16px;
 *   --space-5: 20px;
 *   --space-6: 24px;
 *   --space-8: 32px;
 *   --space-10: 40px;
 *   --space-12: 48px;
 *   --space-16: 64px;
 *   --space-20: 80px;
 *   --space-24: 96px;
 * 
 *   /* Radius * /
 *   --radius-sm: 6px;
 *   --radius-md: 12px;
 *   --radius-lg: 20px;
 *   --radius-xl: 28px;
 *   --radius-full: 9999px;
 * 
 *   /* Shadows * /
 *   --shadow-sm: 0 1px 3px rgba(26, 23, 20, 0.06), 0 1px 2px rgba(26, 23, 20, 0.04);
 *   --shadow-md: 0 4px 16px rgba(26, 23, 20, 0.08), 0 2px 6px rgba(26, 23, 20, 0.05);
 *   --shadow-lg: 0 10px 40px rgba(26, 23, 20, 0.12), 0 4px 12px rgba(26, 23, 20, 0.06);
 *   --shadow-xl: 0 20px 60px rgba(26, 23, 20, 0.15), 0 8px 20px rgba(26, 23, 20, 0.08);
 *   --shadow-primary: 0 8px 24px rgba(45, 106, 79, 0.25);
 *   --shadow-accent: 0 8px 24px rgba(231, 111, 81, 0.25);
 * 
 *   /* Transitions * /
 *   --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
 *   --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
 *   --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
 * 
 *   /* Layout * /
 *   --max-width: 1280px;
 *   --nav-height: 72px;
 *   --sidebar-width: 280px;
 * }
 * 
 * [data-theme="dark"] {
 *   --color-bg: #0F1412;
 *   --color-bg-secondary: #161C19;
 *   --color-bg-tertiary: #1C2421;
 *   --color-surface: #1C2421;
 *   --color-surface-raised: #232B27;
 * 
 *   --color-text-primary: #F0EDE6;
 *   --color-text-secondary: #A8A49E;
 *   --color-text-tertiary: #706C66;
 *   --color-text-inverse: #1A1714;
 * 
 *   --color-primary: #52B788;
 *   --color-primary-light: #74C69D;
 *   --color-primary-dark: #40916C;
 *   --color-primary-muted: #1B3A2E;
 * 
 *   --color-accent: #F4A261;
 *   --color-accent-light: #F9C784;
 *   --color-accent-dark: #E76F51;
 * 
 *   --color-teal: #2DD4BF;
 *   --color-teal-light: #5EEAD4;
 *   --color-teal-muted: #0F2E2B;
 * 
 *   --color-border: #2A332F;
 *   --color-border-strong: #3D4A45;
 * 
 *   --color-success: #4ADE80;
 *   --color-warning: #FCD34D;
 *   --color-error: #F87171;
 * 
 *   --color-success-muted: #14291D;
 *   --color-warning-muted: #2D2006;
 *   --color-error-muted: #2D0F0F;
 * 
 *   --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
 *   --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.25);
 *   --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3);
 *   --shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.4);
 *   --shadow-primary: 0 8px 24px rgba(82, 183, 136, 0.2);
 *   --shadow-accent: 0 8px 24px rgba(244, 162, 97, 0.2);
 * }
 * 
 * /* ── Reset ── * /
 * *, *::before, *::after {
 *   box-sizing: border-box;
 *   margin: 0;
 *   padding: 0;
 * }
 * 
 * html {
 *   scroll-behavior: smooth;
 *   -webkit-text-size-adjust: 100%;
 * }
 * 
 * body {
 *   font-family: var(--font-body);
 *   background-color: var(--color-bg);
 *   color: var(--color-text-primary);
 *   line-height: 1.6;
 *   min-height: 100vh;
 *   transition: background-color var(--transition-base), color var(--transition-base);
 *   -webkit-font-smoothing: antialiased;
 *   -moz-osx-font-smoothing: grayscale;
 * }
 * 
 * #root {
 *   min-height: 100vh;
 *   display: flex;
 *   flex-direction: column;
 * }
 * 
 * img, video {
 *   max-width: 100%;
 *   height: auto;
 *   display: block;
 * }
 * 
 * a {
 *   color: var(--color-primary);
 *   text-decoration: none;
 *   transition: color var(--transition-fast);
 * }
 * 
 * a:hover { color: var(--color-primary-light); }
 * 
 * button {
 *   cursor: pointer;
 *   font-family: inherit;
 *   border: none;
 *   background: none;
 * }
 * 
 * input, textarea, select {
 *   font-family: inherit;
 *   font-size: inherit;
 * }
 * 
 * /* ── Typography Classes ── * /
 * .font-display { font-family: var(--font-display); }
 * .font-body { font-family: var(--font-body); }
 * .font-mono { font-family: var(--font-mono); }
 * 
 * /* ── Layout Utilities ── * /
 * .container {
 *   max-width: var(--max-width);
 *   margin: 0 auto;
 *   padding: 0 var(--space-6);
 * }
 * 
 * @media (max-width: 768px) {
 *   .container { padding: 0 var(--space-4); }
 * }
 * 
 * /* ── Scrollbar Styling ── * /
 * ::-webkit-scrollbar { width: 6px; height: 6px; }
 * ::-webkit-scrollbar-track { background: transparent; }
 * ::-webkit-scrollbar-thumb {
 *   background: var(--color-border-strong);
 *   border-radius: var(--radius-full);
 * }
 * ::-webkit-scrollbar-thumb:hover { background: var(--color-text-tertiary); }
 * 
 * /* ── Focus Styles ── * /
 * :focus-visible {
 *   outline: 2px solid var(--color-primary);
 *   outline-offset: 2px;
 *   border-radius: 4px;
 * }
 * 
 * /* ── Selection ── * /
 * ::selection {
 *   background: var(--color-primary-muted);
 *   color: var(--color-primary-dark);
 * }
 * 
 * /* ── Animations ── * /
 * @keyframes fadeIn {
 *   from { opacity: 0; transform: translateY(8px); }
 *   to { opacity: 1; transform: translateY(0); }
 * }
 * 
 * @keyframes slideInLeft {
 *   from { opacity: 0; transform: translateX(-16px); }
 *   to { opacity: 1; transform: translateX(0); }
 * }
 * 
 * @keyframes slideInRight {
 *   from { opacity: 0; transform: translateX(16px); }
 *   to { opacity: 1; transform: translateX(0); }
 * }
 * 
 * @keyframes scaleIn {
 *   from { opacity: 0; transform: scale(0.96); }
 *   to { opacity: 1; transform: scale(1); }
 * }
 * 
 * @keyframes pulse {
 *   0%, 100% { opacity: 1; }
 *   50% { opacity: 0.5; }
 * }
 * 
 * @keyframes spin {
 *   to { transform: rotate(360deg); }
 * }
 * 
 * @keyframes shimmer {
 *   0% { background-position: -200% 0; }
 *   100% { background-position: 200% 0; }
 * }
 * 
 * @keyframes breathe {
 *   0%, 100% { transform: scale(1); }
 *   50% { transform: scale(1.05); }
 * }
 * 
 * @keyframes recordPulse {
 *   0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
 *   50% { box-shadow: 0 0 0 12px rgba(220, 38, 38, 0); }
 * }
 * 
 * /* ── Skeleton Loading ── * /
 * .skeleton {
 *   background: linear-gradient(
 *     90deg,
 *     var(--color-bg-tertiary) 25%,
 *     var(--color-border) 50%,
 *     var(--color-bg-tertiary) 75%
 *   );
 *   background-size: 200% 100%;
 *   animation: shimmer 1.5s infinite;
 *   border-radius: var(--radius-sm);
 * }
 * 
 * /* ── Badge ── * /
 * .badge {
 *   display: inline-flex;
 *   align-items: center;
 *   gap: var(--space-1);
 *   padding: 3px 10px;
 *   border-radius: var(--radius-full);
 *   font-size: 12px;
 *   font-weight: 500;
 *   letter-spacing: 0.02em;
 * }
 * .badge-primary { background: var(--color-primary-muted); color: var(--color-primary-dark); }
 * .badge-accent { background: rgba(231, 111, 81, 0.12); color: var(--color-accent-dark); }
 * .badge-success { background: var(--color-success-muted); color: var(--color-success); }
 * .badge-warning { background: var(--color-warning-muted); color: var(--color-warning); }
 * .badge-error { background: var(--color-error-muted); color: var(--color-error); }
 * 
 * /* ── Divider ── * /
 * .divider {
 *   height: 1px;
 *   background: var(--color-border);
 *   border: none;
 *   margin: var(--space-6) 0;
 * }
 * 
 * /* ── Page Transition ── * /
 * .page-enter {
 *   animation: fadeIn var(--transition-base) forwards;
 * }
 * 
 * /* ── Gradient Text ── * /
 * .gradient-text {
 *   background: linear-gradient(135deg, var(--color-primary), var(--color-teal));
 *   -webkit-background-clip: text;
 *   -webkit-text-fill-color: transparent;
 *   background-clip: text;
 * }
 * 
 * /* ── Glass Effect ── * /
 * .glass {
 *   background: rgba(255, 255, 255, 0.7);
 *   backdrop-filter: blur(20px);
 *   -webkit-backdrop-filter: blur(20px);
 *   border: 1px solid rgba(255, 255, 255, 0.5);
 * }
 * 
 * [data-theme="dark"] .glass {
 *   background: rgba(28, 36, 33, 0.7);
 *   border-color: rgba(255, 255, 255, 0.08);
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/components/common/Button.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { motion } from 'framer-motion';
 * import styles from './Button.module.css';
 * 
 * const variants = {
 *   primary: styles.primary,
 *   secondary: styles.secondary,
 *   outline: styles.outline,
 *   ghost: styles.ghost,
 *   danger: styles.danger,
 *   accent: styles.accent,
 * };
 * 
 * const sizes = {
 *   sm: styles.sm,
 *   md: styles.md,
 *   lg: styles.lg,
 *   xl: styles.xl,
 * };
 * 
 * export default function Button({
 *   children,
 *   variant = 'primary',
 *   size = 'md',
 *   loading = false,
 *   disabled = false,
 *   fullWidth = false,
 *   icon,
 *   iconRight,
 *   className = '',
 *   onClick,
 *   type = 'button',
 *   ...props
 * }) {
 *   return (
 *     <motion.button
 *       type={type}
 *       className={[
 *         styles.btn,
 *         variants[variant],
 *         sizes[size],
 *         fullWidth ? styles.fullWidth : '',
 *         loading ? styles.loading : '',
 *         className,
 *       ].filter(Boolean).join(' ')}
 *       disabled={disabled || loading}
 *       onClick={onClick}
 *       whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
 *       {...props}
 *     >
 *       {loading ? (
 *         <span className={styles.spinner} aria-hidden="true" />
 *       ) : icon ? (
 *         <span className={styles.iconLeft}>{icon}</span>
 *       ) : null}
 *       {children && <span>{children}</span>}
 *       {iconRight && !loading && <span className={styles.iconRight}>{iconRight}</span>}
 *     </motion.button>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/components/common/Button.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * .btn {
 *   display: inline-flex;
 *   align-items: center;
 *   justify-content: center;
 *   gap: 8px;
 *   font-family: var(--font-body);
 *   font-weight: 500;
 *   letter-spacing: 0.01em;
 *   border-radius: var(--radius-md);
 *   transition: all var(--transition-fast);
 *   position: relative;
 *   overflow: hidden;
 *   white-space: nowrap;
 *   border: 1.5px solid transparent;
 * }
 * 
 * .btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
 * .fullWidth { width: 100%; }
 * 
 * /* Sizes * /
 * .sm { padding: 6px 14px; font-size: 13px; border-radius: var(--radius-sm); }
 * .md { padding: 10px 20px; font-size: 14px; }
 * .lg { padding: 13px 28px; font-size: 15px; }
 * .xl { padding: 16px 36px; font-size: 16px; border-radius: var(--radius-lg); }
 * 
 * /* Variants * /
 * .primary {
 *   background: var(--color-primary);
 *   color: var(--color-text-inverse);
 *   border-color: var(--color-primary);
 *   box-shadow: var(--shadow-primary);
 * }
 * .primary:hover:not(:disabled) {
 *   background: var(--color-primary-light);
 *   border-color: var(--color-primary-light);
 *   box-shadow: 0 10px 28px rgba(45, 106, 79, 0.35);
 *   transform: translateY(-1px);
 * }
 * 
 * .secondary {
 *   background: var(--color-bg-tertiary);
 *   color: var(--color-text-primary);
 *   border-color: var(--color-border);
 * }
 * .secondary:hover:not(:disabled) {
 *   background: var(--color-border);
 *   border-color: var(--color-border-strong);
 * }
 * 
 * .outline {
 *   background: transparent;
 *   color: var(--color-primary);
 *   border-color: var(--color-primary);
 * }
 * .outline:hover:not(:disabled) {
 *   background: var(--color-primary-muted);
 * }
 * 
 * .ghost {
 *   background: transparent;
 *   color: var(--color-text-secondary);
 *   border-color: transparent;
 * }
 * .ghost:hover:not(:disabled) {
 *   background: var(--color-bg-tertiary);
 *   color: var(--color-text-primary);
 * }
 * 
 * .danger {
 *   background: var(--color-error);
 *   color: white;
 *   border-color: var(--color-error);
 * }
 * .danger:hover:not(:disabled) {
 *   background: #b91c1c;
 *   transform: translateY(-1px);
 * }
 * 
 * .accent {
 *   background: var(--color-accent);
 *   color: white;
 *   border-color: var(--color-accent);
 *   box-shadow: var(--shadow-accent);
 * }
 * .accent:hover:not(:disabled) {
 *   background: var(--color-accent-light);
 *   transform: translateY(-1px);
 * }
 * 
 * /* Icons * /
 * .iconLeft, .iconRight {
 *   display: flex;
 *   align-items: center;
 *   flex-shrink: 0;
 * }
 * .iconLeft { margin-right: -2px; }
 * .iconRight { margin-left: -2px; }
 * 
 * /* Spinner * /
 * .spinner {
 *   width: 16px;
 *   height: 16px;
 *   border: 2px solid currentColor;
 *   border-top-color: transparent;
 *   border-radius: 50%;
 *   animation: spin 0.7s linear infinite;
 *   flex-shrink: 0;
 * }
 * 
 * @keyframes spin { to { transform: rotate(360deg); } }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/components/common/Input.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { forwardRef } from 'react';
 * import styles from './Input.module.css';
 * 
 * const Input = forwardRef(({
 *   label,
 *   error,
 *   hint,
 *   icon,
 *   iconRight,
 *   className = '',
 *   containerClassName = '',
 *   type = 'text',
 *   ...props
 * }, ref) => {
 *   return (
 *     <div className={[styles.container, containerClassName].join(' ')}>
 *       {label && (
 *         <label className={styles.label}>
 *           {label}
 *           {props.required && <span className={styles.required}>*</span>}
 *         </label>
 *       )}
 *       <div className={styles.inputWrapper}>
 *         {icon && <span className={styles.iconLeft}>{icon}</span>}
 *         <input
 *           ref={ref}
 *           type={type}
 *           className={[
 *             styles.input,
 *             icon ? styles.hasIconLeft : '',
 *             iconRight ? styles.hasIconRight : '',
 *             error ? styles.hasError : '',
 *             className,
 *           ].filter(Boolean).join(' ')}
 *           {...props}
 *         />
 *         {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
 *       </div>
 *       {error && <span className={styles.error}>{error}</span>}
 *       {hint && !error && <span className={styles.hint}>{hint}</span>}
 *     </div>
 *   );
 * });
 * 
 * Input.displayName = 'Input';
 * export default Input;
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/components/common/Input.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * .container { display: flex; flex-direction: column; gap: 6px; }
 * 
 * .label {
 *   font-size: 13px;
 *   font-weight: 500;
 *   color: var(--color-text-secondary);
 *   letter-spacing: 0.01em;
 * }
 * 
 * .required { color: var(--color-error); margin-left: 3px; }
 * 
 * .inputWrapper { position: relative; }
 * 
 * .input {
 *   width: 100%;
 *   padding: 11px 16px;
 *   background: var(--color-surface);
 *   border: 1.5px solid var(--color-border);
 *   border-radius: var(--radius-md);
 *   color: var(--color-text-primary);
 *   font-size: 14px;
 *   transition: all var(--transition-fast);
 *   outline: none;
 * }
 * 
 * .input::placeholder { color: var(--color-text-tertiary); }
 * 
 * .input:focus {
 *   border-color: var(--color-primary);
 *   box-shadow: 0 0 0 3px var(--color-primary-muted);
 * }
 * 
 * .hasError {
 *   border-color: var(--color-error) !important;
 * }
 * .hasError:focus {
 *   box-shadow: 0 0 0 3px var(--color-error-muted) !important;
 * }
 * 
 * .iconLeft, .iconRight {
 *   position: absolute;
 *   top: 50%;
 *   transform: translateY(-50%);
 *   color: var(--color-text-tertiary);
 *   display: flex;
 *   align-items: center;
 *   pointer-events: none;
 * }
 * 
 * .iconLeft { left: 14px; }
 * .iconRight { right: 14px; }
 * 
 * .hasIconLeft { padding-left: 42px; }
 * .hasIconRight { padding-right: 42px; }
 * 
 * .error { font-size: 12px; color: var(--color-error); }
 * .hint { font-size: 12px; color: var(--color-text-tertiary); }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/components/common/Avatar.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import styles from './Avatar.module.css';
 * 
 * const sizeMap = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80, '2xl': 120 };
 * 
 * export default function Avatar({ src, name, size = 'md', online, className = '', badge }) {
 *   const px = sizeMap[size] || 40;
 * 
 *   const initials = name
 *     ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
 *     : '?';
 * 
 *   const colorIndex = name
 *     ? name.charCodeAt(0) % 8
 *     : 0;
 * 
 *   return (
 *     <div
 *       className={[styles.avatar, styles[size], className].join(' ')}
 *       style={{ width: px, height: px, minWidth: px }}
 *       data-color={colorIndex}
 *     >
 *       {src ? (
 *         <img
 *           src={src}
 *           alt={name || 'Avatar'}
 *           className={styles.img}
 *           onError={(e) => { e.target.style.display = 'none'; }}
 *         />
 *       ) : (
 *         <span className={styles.initials} style={{ fontSize: px * 0.36 }}>
 *           {initials}
 *         </span>
 *       )}
 *       {online !== undefined && (
 *         <span className={[styles.onlineDot, online ? styles.online : styles.offline].join(' ')} />
 *       )}
 *       {badge && <span className={styles.badge}>{badge}</span>}
 *     </div>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/components/common/Avatar.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * .avatar {
 *   position: relative;
 *   border-radius: 50%;
 *   overflow: hidden;
 *   flex-shrink: 0;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   font-family: var(--font-body);
 *   font-weight: 600;
 * }
 * 
 * .img {
 *   width: 100%;
 *   height: 100%;
 *   object-fit: cover;
 *   border-radius: 50%;
 * }
 * 
 * .initials {
 *   color: white;
 *   line-height: 1;
 *   user-select: none;
 * }
 * 
 * /* Color palettes * /
 * .avatar[data-color="0"] { background: linear-gradient(135deg, #2D6A4F, #40916C); }
 * .avatar[data-color="1"] { background: linear-gradient(135deg, #0F766E, #14B8A6); }
 * .avatar[data-color="2"] { background: linear-gradient(135deg, #E76F51, #F4A261); }
 * .avatar[data-color="3"] { background: linear-gradient(135deg, #7C3AED, #A78BFA); }
 * .avatar[data-color="4"] { background: linear-gradient(135deg, #1D4ED8, #60A5FA); }
 * .avatar[data-color="5"] { background: linear-gradient(135deg, #9D174D, #F472B6); }
 * .avatar[data-color="6"] { background: linear-gradient(135deg, #92400E, #FCD34D); }
 * .avatar[data-color="7"] { background: linear-gradient(135deg, #374151, #9CA3AF); }
 * 
 * /* Online dot * /
 * .onlineDot {
 *   position: absolute;
 *   bottom: 1px;
 *   right: 1px;
 *   width: 30%;
 *   height: 30%;
 *   max-width: 14px;
 *   max-height: 14px;
 *   border-radius: 50%;
 *   border: 2px solid var(--color-surface);
 * }
 * 
 * .online { background: var(--color-success); }
 * .offline { background: var(--color-text-tertiary); }
 * 
 * .badge {
 *   position: absolute;
 *   top: -2px;
 *   right: -2px;
 *   background: var(--color-error);
 *   color: white;
 *   font-size: 10px;
 *   font-weight: 600;
 *   width: 18px;
 *   height: 18px;
 *   border-radius: 50%;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   border: 2px solid var(--color-surface);
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/components/layout/Navbar.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { useState, useEffect } from 'react';
 * import { Link, NavLink, useNavigate } from 'react-router-dom';
 * import { motion, AnimatePresence } from 'framer-motion';
 * import {
 *   Sun, Moon, Globe, Bell, Menu, X,
 *   LogOut, User, Settings, LayoutDashboard, Shield
 * } from 'lucide-react';
 * import { useAuthStore, useUIStore } from '../../store';
 * import { useT } from '../../i18n/useT';
 * import { LANGUAGES } from '../../i18n/translations';
 * import { authAPI } from '../../api';
 * import Avatar from '../common/Avatar';
 * import styles from './Navbar.module.css';
 * import toast from 'react-hot-toast';
 * 
 * export default function Navbar() {
 *   const { user, isAuthenticated, logout } = useAuthStore();
 *   const { theme, toggleTheme, language, setLanguage } = useUIStore();
 *   const { t } = useT();
 *   const navigate = useNavigate();
 * 
 *   const [scrolled, setScrolled] = useState(false);
 *   const [mobileOpen, setMobileOpen] = useState(false);
 *   const [langOpen, setLangOpen] = useState(false);
 *   const [profileOpen, setProfileOpen] = useState(false);
 * 
 *   useEffect(() => {
 *     const onScroll = () => setScrolled(window.scrollY > 16);
 *     window.addEventListener('scroll', onScroll, { passive: true });
 *     return () => window.removeEventListener('scroll', onScroll);
 *   }, []);
 * 
 *   useEffect(() => {
 *     const close = () => { setLangOpen(false); setProfileOpen(false); };
 *     document.addEventListener('click', close);
 *     return () => document.removeEventListener('click', close);
 *   }, []);
 * 
 *   const handleLogout = async () => {
 *     try {
 *       await authAPI.logout();
 *     } catch {}
 *     logout();
 *     navigate('/');
 *     toast.success('Signed out successfully');
 *   };
 * 
 *   const isAdmin = user?.role === 'admin';
 *   const isDoctor = user?.role === 'doctor';
 * 
 *   const navLinks = [
 *     { to: '/', label: t.nav.home, exact: true },
 *     { to: '/doctors', label: t.nav.doctors },
 *     { to: '/ai', label: t.nav.aiAssistant },
 *     ...(isAuthenticated ? [{ to: '/chat', label: t.nav.consultations }] : []),
 *     ...(isAdmin ? [{ to: '/admin', label: t.nav.admin }] : []),
 *   ];
 * 
 *   return (
 *     <header className={[styles.navbar, scrolled ? styles.scrolled : ''].join(' ')}>
 *       <div className={styles.inner}>
 *         {/* Logo * /}
 *         <Link to="/" className={styles.logo}>
 *           <div className={styles.logoMark}>
 *             <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
 *               <rect width="28" height="28" rx="8" fill="currentColor" className={styles.logoRect} />
 *               <path d="M14 7v14M7 14h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
 *             </svg>
 *           </div>
 *           <span className={styles.logoText}>Healzy</span>
 *         </Link>
 * 
 *         {/* Desktop Nav * /}
 *         <nav className={styles.desktopNav}>
 *           {navLinks.map(link => (
 *             <NavLink
 *               key={link.to}
 *               to={link.to}
 *               end={link.exact}
 *               className={({ isActive }) =>
 *                 [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
 *               }
 *             >
 *               {link.label}
 *             </NavLink>
 *           ))}
 *         </nav>
 * 
 *         {/* Actions * /}
 *         <div className={styles.actions}>
 *           {/* Language * /}
 *           <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
 *             <button
 *               className={styles.iconBtn}
 *               onClick={() => setLangOpen(o => !o)}
 *               title={t.common.language}
 *             >
 *               <Globe size={18} />
 *             </button>
 *             <AnimatePresence>
 *               {langOpen && (
 *                 <motion.div
 *                   className={styles.dropdownMenu}
 *                   initial={{ opacity: 0, y: -8, scale: 0.96 }}
 *                   animate={{ opacity: 1, y: 0, scale: 1 }}
 *                   exit={{ opacity: 0, y: -8, scale: 0.96 }}
 *                   transition={{ duration: 0.15 }}
 *                 >
 *                   {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
 *                     <button
 *                       key={code}
 *                       className={[styles.dropdownItem, language === code ? styles.dropdownItemActive : ''].join(' ')}
 *                       onClick={() => { setLanguage(code); setLangOpen(false); }}
 *                     >
 *                       <span>{flag}</span>
 *                       <span>{name}</span>
 *                     </button>
 *                   ))}
 *                 </motion.div>
 *               )}
 *             </AnimatePresence>
 *           </div>
 * 
 *           {/* Theme Toggle * /}
 *           <motion.button
 *             className={styles.iconBtn}
 *             onClick={toggleTheme}
 *             title={theme === 'light' ? t.common.darkMode : t.common.lightMode}
 *             whileTap={{ scale: 0.9, rotate: 15 }}
 *           >
 *             {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
 *           </motion.button>
 * 
 *           {/* Auth * /}
 *           {isAuthenticated ? (
 *             <>
 *               <button className={styles.iconBtn} title={t.common.notifications}>
 *                 <Bell size={18} />
 *               </button>
 *               <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
 *                 <button
 *                   className={styles.avatarBtn}
 *                   onClick={() => setProfileOpen(o => !o)}
 *                 >
 *                   <Avatar
 *                     src={user?.avatar}
 *                     name={`${user?.firstName} ${user?.lastName}`}
 *                     size="sm"
 *                   />
 *                 </button>
 *                 <AnimatePresence>
 *                   {profileOpen && (
 *                     <motion.div
 *                       className={[styles.dropdownMenu, styles.profileMenu].join(' ')}
 *                       initial={{ opacity: 0, y: -8, scale: 0.96 }}
 *                       animate={{ opacity: 1, y: 0, scale: 1 }}
 *                       exit={{ opacity: 0, y: -8, scale: 0.96 }}
 *                       transition={{ duration: 0.15 }}
 *                     >
 *                       <div className={styles.profileHeader}>
 *                         <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="md" />
 *                         <div>
 *                           <div className={styles.profileName}>{user?.firstName} {user?.lastName}</div>
 *                           <div className={styles.profileEmail}>{user?.email}</div>
 *                         </div>
 *                       </div>
 *                       <div className={styles.dropdownDivider} />
 *                       <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
 *                         <LayoutDashboard size={15} />{t.nav.dashboard}
 *                       </Link>
 *                       <Link to="/profile" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
 *                         <User size={15} />{t.nav.profile}
 *                       </Link>
 *                       <Link to="/settings" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
 *                         <Settings size={15} />{t.common.settings}
 *                       </Link>
 *                       {isAdmin && (
 *                         <Link to="/admin" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
 *                           <Shield size={15} />{t.nav.admin}
 *                         </Link>
 *                       )}
 *                       <div className={styles.dropdownDivider} />
 *                       <button className={[styles.dropdownItem, styles.dropdownItemDanger].join(' ')} onClick={handleLogout}>
 *                         <LogOut size={15} />{t.nav.logout}
 *                       </button>
 *                     </motion.div>
 *                   )}
 *                 </AnimatePresence>
 *               </div>
 *             </>
 *           ) : (
 *             <div className={styles.authBtns}>
 *               <Link to="/login" className={styles.loginBtn}>{t.nav.login}</Link>
 *               <Link to="/register" className={styles.registerBtn}>{t.nav.register}</Link>
 *             </div>
 *           )}
 * 
 *           {/* Mobile Menu Toggle * /}
 *           <button className={styles.mobileToggle} onClick={() => setMobileOpen(o => !o)}>
 *             {mobileOpen ? <X size={22} /> : <Menu size={22} />}
 *           </button>
 *         </div>
 *       </div>
 * 
 *       {/* Mobile Menu * /}
 *       <AnimatePresence>
 *         {mobileOpen && (
 *           <motion.div
 *             className={styles.mobileMenu}
 *             initial={{ opacity: 0, height: 0 }}
 *             animate={{ opacity: 1, height: 'auto' }}
 *             exit={{ opacity: 0, height: 0 }}
 *           >
 *             {navLinks.map(link => (
 *               <NavLink
 *                 key={link.to}
 *                 to={link.to}
 *                 end={link.exact}
 *                 className={({ isActive }) =>
 *                   [styles.mobileLink, isActive ? styles.mobileLinkActive : ''].join(' ')
 *                 }
 *                 onClick={() => setMobileOpen(false)}
 *               >
 *                 {link.label}
 *               </NavLink>
 *             ))}
 *             {!isAuthenticated && (
 *               <div className={styles.mobileAuth}>
 *                 <Link to="/login" className={styles.loginBtn} onClick={() => setMobileOpen(false)}>{t.nav.login}</Link>
 *                 <Link to="/register" className={styles.registerBtn} onClick={() => setMobileOpen(false)}>{t.nav.register}</Link>
 *               </div>
 *             )}
 *           </motion.div>
 *         )}
 *       </AnimatePresence>
 *     </header>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/components/layout/Navbar.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * .navbar {
 *   position: fixed;
 *   top: 0;
 *   left: 0;
 *   right: 0;
 *   z-index: 100;
 *   height: var(--nav-height);
 *   transition: all var(--transition-base);
 *   border-bottom: 1px solid transparent;
 * }
 * 
 * .scrolled {
 *   background: rgba(248, 246, 241, 0.85);
 *   backdrop-filter: blur(24px);
 *   -webkit-backdrop-filter: blur(24px);
 *   border-bottom-color: var(--color-border);
 *   box-shadow: var(--shadow-sm);
 * }
 * 
 * [data-theme="dark"] .scrolled {
 *   background: rgba(15, 20, 18, 0.85);
 * }
 * 
 * .inner {
 *   max-width: var(--max-width);
 *   margin: 0 auto;
 *   padding: 0 var(--space-6);
 *   height: 100%;
 *   display: flex;
 *   align-items: center;
 *   gap: var(--space-6);
 * }
 * 
 * /* Logo * /
 * .logo {
 *   display: flex;
 *   align-items: center;
 *   gap: 10px;
 *   text-decoration: none;
 *   flex-shrink: 0;
 * }
 * 
 * .logoMark {
 *   color: var(--color-primary);
 *   display: flex;
 * }
 * 
 * .logoText {
 *   font-family: var(--font-display);
 *   font-size: 22px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 *   letter-spacing: -0.02em;
 * }
 * 
 * /* Desktop Nav * /
 * .desktopNav {
 *   display: flex;
 *   align-items: center;
 *   gap: 4px;
 *   flex: 1;
 * }
 * 
 * @media (max-width: 900px) { .desktopNav { display: none; } }
 * 
 * .navLink {
 *   padding: 7px 14px;
 *   font-size: 14px;
 *   font-weight: 500;
 *   color: var(--color-text-secondary);
 *   border-radius: var(--radius-md);
 *   transition: all var(--transition-fast);
 *   text-decoration: none;
 * }
 * 
 * .navLink:hover {
 *   color: var(--color-text-primary);
 *   background: var(--color-bg-tertiary);
 * }
 * 
 * .navLinkActive {
 *   color: var(--color-primary);
 *   background: var(--color-primary-muted);
 * }
 * 
 * /* Actions * /
 * .actions {
 *   display: flex;
 *   align-items: center;
 *   gap: var(--space-2);
 *   margin-left: auto;
 * }
 * 
 * .iconBtn {
 *   width: 38px;
 *   height: 38px;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   border-radius: var(--radius-md);
 *   color: var(--color-text-secondary);
 *   transition: all var(--transition-fast);
 *   cursor: pointer;
 * }
 * 
 * .iconBtn:hover {
 *   color: var(--color-text-primary);
 *   background: var(--color-bg-tertiary);
 * }
 * 
 * /* Dropdown * /
 * .dropdown { position: relative; }
 * 
 * .dropdownMenu {
 *   position: absolute;
 *   top: calc(100% + 10px);
 *   right: 0;
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-lg);
 *   box-shadow: var(--shadow-xl);
 *   min-width: 160px;
 *   padding: 6px;
 *   z-index: 200;
 *   overflow: hidden;
 * }
 * 
 * .dropdownItem {
 *   display: flex;
 *   align-items: center;
 *   gap: 10px;
 *   width: 100%;
 *   padding: 9px 12px;
 *   font-size: 13.5px;
 *   color: var(--color-text-secondary);
 *   border-radius: var(--radius-sm);
 *   transition: all var(--transition-fast);
 *   text-decoration: none;
 *   cursor: pointer;
 *   font-family: var(--font-body);
 * }
 * 
 * .dropdownItem:hover {
 *   color: var(--color-text-primary);
 *   background: var(--color-bg-tertiary);
 * }
 * 
 * .dropdownItemActive {
 *   color: var(--color-primary);
 *   background: var(--color-primary-muted);
 * }
 * 
 * .dropdownItemDanger { color: var(--color-error) !important; }
 * .dropdownItemDanger:hover { background: var(--color-error-muted) !important; }
 * 
 * .dropdownDivider {
 *   height: 1px;
 *   background: var(--color-border);
 *   margin: 6px 0;
 * }
 * 
 * /* Profile menu * /
 * .profileMenu { min-width: 220px; }
 * 
 * .profileHeader {
 *   display: flex;
 *   align-items: center;
 *   gap: 12px;
 *   padding: 12px;
 * }
 * 
 * .profileName {
 *   font-weight: 600;
 *   font-size: 14px;
 *   color: var(--color-text-primary);
 * }
 * 
 * .profileEmail {
 *   font-size: 12px;
 *   color: var(--color-text-tertiary);
 *   margin-top: 1px;
 *   max-width: 140px;
 *   overflow: hidden;
 *   text-overflow: ellipsis;
 *   white-space: nowrap;
 * }
 * 
 * /* Avatar button * /
 * .avatarBtn {
 *   border-radius: 50%;
 *   display: flex;
 *   cursor: pointer;
 *   transition: opacity var(--transition-fast);
 * }
 * .avatarBtn:hover { opacity: 0.85; }
 * 
 * /* Auth Buttons * /
 * .authBtns {
 *   display: flex;
 *   align-items: center;
 *   gap: var(--space-2);
 * }
 * 
 * @media (max-width: 600px) { .authBtns { display: none; } }
 * 
 * .loginBtn {
 *   padding: 8px 16px;
 *   font-size: 14px;
 *   font-weight: 500;
 *   color: var(--color-text-secondary);
 *   border-radius: var(--radius-md);
 *   transition: all var(--transition-fast);
 *   text-decoration: none;
 * }
 * .loginBtn:hover {
 *   color: var(--color-text-primary);
 *   background: var(--color-bg-tertiary);
 * }
 * 
 * .registerBtn {
 *   padding: 8px 18px;
 *   font-size: 14px;
 *   font-weight: 500;
 *   background: var(--color-primary);
 *   color: white;
 *   border-radius: var(--radius-md);
 *   transition: all var(--transition-fast);
 *   text-decoration: none;
 *   box-shadow: var(--shadow-primary);
 * }
 * .registerBtn:hover {
 *   background: var(--color-primary-light);
 *   transform: translateY(-1px);
 * }
 * 
 * /* Mobile * /
 * .mobileToggle {
 *   display: none;
 *   width: 40px;
 *   height: 40px;
 *   align-items: center;
 *   justify-content: center;
 *   border-radius: var(--radius-md);
 *   color: var(--color-text-secondary);
 *   transition: all var(--transition-fast);
 * }
 * 
 * .mobileToggle:hover { background: var(--color-bg-tertiary); }
 * 
 * @media (max-width: 900px) { .mobileToggle { display: flex; } }
 * 
 * .mobileMenu {
 *   background: var(--color-surface);
 *   border-top: 1px solid var(--color-border);
 *   overflow: hidden;
 * }
 * 
 * .mobileLink {
 *   display: block;
 *   padding: 14px 24px;
 *   font-size: 15px;
 *   font-weight: 500;
 *   color: var(--color-text-secondary);
 *   text-decoration: none;
 *   border-bottom: 1px solid var(--color-border);
 *   transition: all var(--transition-fast);
 * }
 * 
 * .mobileLink:hover, .mobileLinkActive {
 *   color: var(--color-primary);
 *   background: var(--color-primary-muted);
 * }
 * 
 * .mobileAuth {
 *   display: flex;
 *   gap: var(--space-3);
 *   padding: var(--space-4) var(--space-6);
 * }
 * 
 * .mobileAuth .loginBtn, .mobileAuth .registerBtn {
 *   flex: 1;
 *   text-align: center;
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/components/layout/Footer.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { Link } from 'react-router-dom';
 * import { Heart } from 'lucide-react';
 * import { useT } from '../../i18n/useT';
 * import styles from './Footer.module.css';
 * 
 * export default function Footer() {
 *   const { t } = useT();
 * 
 *   return (
 *     <footer className={styles.footer}>
 *       <div className={styles.inner}>
 *         <div className={styles.brand}>
 *           <div className={styles.logo}>
 *             <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
 *               <rect width="28" height="28" rx="8" fill="var(--color-primary)" />
 *               <path d="M14 7v14M7 14h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
 *             </svg>
 *             <span>Healzy</span>
 *           </div>
 *           <p className={styles.tagline}>
 *             Modern healthcare, delivered online.
 *           </p>
 *         </div>
 * 
 *         <div className={styles.links}>
 *           <div className={styles.linkGroup}>
 *             <h4>Platform</h4>
 *             <Link to="/doctors">Find Doctors</Link>
 *             <Link to="/ai">AI Assistant</Link>
 *             <Link to="/register">Sign Up Free</Link>
 *           </div>
 *           <div className={styles.linkGroup}>
 *             <h4>Company</h4>
 *             <Link to="/about">About</Link>
 *             <Link to="/privacy">Privacy</Link>
 *             <Link to="/terms">Terms</Link>
 *           </div>
 *         </div>
 *       </div>
 *       <div className={styles.bottom}>
 *         <span>© 2025 Healzy. Made with <Heart size={12} className={styles.heart} /> for better healthcare.</span>
 *       </div>
 *     </footer>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/components/layout/Footer.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * .footer {
 *   background: var(--color-surface);
 *   border-top: 1px solid var(--color-border);
 *   padding-top: 48px;
 * }
 * 
 * .inner {
 *   max-width: var(--max-width);
 *   margin: 0 auto;
 *   padding: 0 var(--space-6) 40px;
 *   display: grid;
 *   grid-template-columns: 1fr 1fr;
 *   gap: 48px;
 * }
 * 
 * @media (max-width: 640px) { .inner { grid-template-columns: 1fr; gap: 32px; } }
 * 
 * .brand { display: flex; flex-direction: column; gap: 12px; }
 * 
 * .logo {
 *   display: flex;
 *   align-items: center;
 *   gap: 10px;
 *   font-family: var(--font-display);
 *   font-size: 20px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 *   text-decoration: none;
 * }
 * 
 * .tagline { font-size: 14px; color: var(--color-text-tertiary); line-height: 1.6; max-width: 240px; }
 * 
 * .links { display: flex; gap: 48px; }
 * 
 * .linkGroup { display: flex; flex-direction: column; gap: 10px; }
 * 
 * .linkGroup h4 {
 *   font-size: 12px;
 *   font-weight: 600;
 *   color: var(--color-text-tertiary);
 *   text-transform: uppercase;
 *   letter-spacing: 0.08em;
 *   margin-bottom: 4px;
 * }
 * 
 * .linkGroup a {
 *   font-size: 14px;
 *   color: var(--color-text-secondary);
 *   text-decoration: none;
 *   transition: color var(--transition-fast);
 * }
 * .linkGroup a:hover { color: var(--color-primary); }
 * 
 * .bottom {
 *   border-top: 1px solid var(--color-border);
 *   padding: 16px var(--space-6);
 *   text-align: center;
 *   font-size: 13px;
 *   color: var(--color-text-tertiary);
 *   max-width: var(--max-width);
 *   margin: 0 auto;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   gap: 4px;
 * }
 * 
 * .heart { color: var(--color-error); display: inline; }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/HomePage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { useEffect, useState, useRef } from 'react';
 * import { Link, useNavigate } from 'react-router-dom';
 * import { motion, useScroll, useTransform } from 'framer-motion';
 * import { useInView } from 'react-intersection-observer';
 * import {
 *   MessageSquare, Brain, Shield, Search,
 *   Star, ArrowRight, ChevronRight, Play,
 *   Activity, Clock, Users, Award
 * } from 'lucide-react';
 * import { useT } from '../i18n/useT';
 * import { Doctors } from '../services';
 * import Avatar from '../components/common/Avatar';
 * import Button from '../components/common/Button';
 * import styles from './HomePage.module.css';
 * 
 * // Animated counter
 * function Counter({ value, suffix = '' }) {
 *   const [count, setCount] = useState(0);
 *   const [ref, inView] = useInView({ triggerOnce: true });
 *   useEffect(() => {
 *     if (!inView) return;
 *     const end = parseInt(value);
 *     const step = Math.ceil(end / 40);
 *     let cur = 0;
 *     const id = setInterval(() => {
 *       cur = Math.min(cur + step, end);
 *       setCount(cur);
 *       if (cur >= end) clearInterval(id);
 *     }, 30);
 *     return () => clearInterval(id);
 *   }, [inView, value]);
 *   return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
 * }
 * 
 * // Stagger wrapper
 * function StaggerIn({ children, className }) {
 *   const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
 *   return (
 *     <motion.div
 *       ref={ref}
 *       className={className}
 *       initial="hidden"
 *       animate={inView ? 'visible' : 'hidden'}
 *       variants={{
 *         hidden: {},
 *         visible: { transition: { staggerChildren: 0.1 } },
 *       }}
 *     >
 *       {children}
 *     </motion.div>
 *   );
 * }
 * 
 * const fadeUp = {
 *   hidden: { opacity: 0, y: 32 },
 *   visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
 * };
 * 
 * // ─── Doctor Card ──────────────────────────────────────────────────────────────
 * function DoctorCard({ doctor, delay = 0 }) {
 *   const { t, language } = useT();
 *   const navigate = useNavigate();
 *   const specialty = language === 'ru' ? doctor.specialtyRu : language === 'uz' ? doctor.specialtyUz : doctor.specialty;
 * 
 *   return (
 *     <motion.div className={styles.doctorCard} variants={fadeUp} whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
 *       <div className={styles.doctorCardTop}>
 *         <Avatar name={`${doctor.firstName} ${doctor.lastName}`} size="xl" />
 *         <div className={styles.doctorAvailBadge}>
 *           <span className={[styles.availDot, doctor.isAvailable ? styles.availGreen : styles.availGray].join(' ')} />
 *           {doctor.isAvailable ? t.doctors.card.available : t.doctors.card.busy}
 *         </div>
 *       </div>
 *       <div className={styles.doctorCardBody}>
 *         <h3>{doctor.firstName} {doctor.lastName}</h3>
 *         <p className={styles.doctorSpecialty}>{specialty}</p>
 *         <div className={styles.doctorMeta}>
 *           <span><Star size={13} fill="currentColor" />{doctor.rating}</span>
 *           <span>·</span>
 *           <span>{doctor.experience} {t.doctors.card.experience}</span>
 *           <span>·</span>
 *           <span>{doctor.consultationCount.toLocaleString()} {t.doctors.card.consultations}</span>
 *         </div>
 *         <div className={styles.doctorLangs}>
 *           {doctor.languages.slice(0, 3).map(l => (
 *             <span key={l} className={styles.langTag}>{l}</span>
 *           ))}
 *         </div>
 *       </div>
 *       <div className={styles.doctorCardFooter}>
 *         <Button variant="outline" size="sm" onClick={() => navigate(`/doctors/${doctor.id}`)}>
 *           {t.doctors.card.viewProfile}
 *         </Button>
 *         <Button size="sm" onClick={() => navigate(`/doctors/${doctor.id}`)}>
 *           {t.doctors.card.bookNow}
 *         </Button>
 *       </div>
 *     </motion.div>
 *   );
 * }
 * 
 * // ─── Main Component ───────────────────────────────────────────────────────────
 * export default function HomePage() {
 *   const { t } = useT();
 *   const navigate = useNavigate();
 *   const [featuredDoctors, setFeaturedDoctors] = useState([]);
 *   const [searchQuery, setSearchQuery] = useState('');
 *   const heroRef = useRef(null);
 *   const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
 *   const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
 * 
 *   useEffect(() => {
 *     Doctors.getFeatured().then(res => setFeaturedDoctors(res.data)).catch(() => {});
 *   }, []);
 * 
 *   const handleSearch = (e) => {
 *     e.preventDefault();
 *     navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
 *   };
 * 
 *   const features = [
 *     { icon: <MessageSquare size={24} />, key: 'chat', color: '#2D6A4F' },
 *     { icon: <Brain size={24} />, key: 'ai', color: '#0F766E' },
 *     { icon: <Shield size={24} />, key: 'secure', color: '#7C3AED' },
 *     { icon: <Search size={24} />, key: 'search', color: '#D97706' },
 *   ];
 * 
 *   const stats = [
 *     { icon: <Users size={20} />, value: 500, suffix: '+', label: t.home.hero.stats.doctors },
 *     { icon: <Activity size={20} />, value: 50000, suffix: '+', label: t.home.hero.stats.consultations },
 *     { icon: <Award size={20} />, value: 98, suffix: '%', label: t.home.hero.stats.satisfaction },
 *     { icon: <Clock size={20} />, value: 24, suffix: '/7', label: t.home.hero.stats.available },
 *   ];
 * 
 *   return (
 *     <div className={styles.page}>
 *       {/* ── Hero ── * /}
 *       <section className={styles.hero} ref={heroRef}>
 *         <motion.div className={styles.heroBg} style={{ y: heroY }} aria-hidden>
 *           <div className={styles.heroBlob1} />
 *           <div className={styles.heroBlob2} />
 *           <div className={styles.heroGrid} />
 *         </motion.div>
 * 
 *         <div className={`container ${styles.heroInner}`}>
 *           <motion.div
 *             className={styles.heroContent}
 *             initial={{ opacity: 0, y: 40 }}
 *             animate={{ opacity: 1, y: 0 }}
 *             transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
 *           >
 *             <motion.div
 *               className={styles.heroBadge}
 *               initial={{ opacity: 0, scale: 0.9 }}
 *               animate={{ opacity: 1, scale: 1 }}
 *               transition={{ delay: 0.1, duration: 0.4 }}
 *             >
 *               <span className={styles.heroBadgeDot} />
 *               {t.home.hero.badge}
 *             </motion.div>
 * 
 *             <h1 className={styles.heroTitle}>
 *               {t.home.hero.title.split('\n').map((line, i) => (
 *                 <span key={i}>
 *                   {i === 0 ? line : <em>{line}</em>}
 *                   {i < t.home.hero.title.split('\n').length - 1 && <br />}
 *                 </span>
 *               ))}
 *             </h1>
 * 
 *             <p className={styles.heroSubtitle}>{t.home.hero.subtitle}</p>
 * 
 *             {/* Hero search * /}
 *             <form className={styles.heroSearch} onSubmit={handleSearch}>
 *               <div className={styles.searchInputWrap}>
 *                 <Search size={18} className={styles.searchIcon} />
 *                 <input
 *                   className={styles.searchInput}
 *                   placeholder={t.doctors.search.placeholder}
 *                   value={searchQuery}
 *                   onChange={e => setSearchQuery(e.target.value)}
 *                 />
 *               </div>
 *               <Button type="submit" size="lg" iconRight={<ArrowRight size={16} />}>
 *                 {t.home.hero.cta}
 *               </Button>
 *             </form>
 * 
 *             <div className={styles.heroCtas}>
 *               <Link to="/ai">
 *                 <Button variant="secondary" size="md" icon={<Brain size={16} />}>
 *                   {t.home.hero.ctaSecondary}
 *                 </Button>
 *               </Link>
 *               <button className={styles.watchDemo}>
 *                 <span className={styles.playBtn}><Play size={12} fill="currentColor" /></span>
 *                 Watch demo
 *               </button>
 *             </div>
 *           </motion.div>
 * 
 *           {/* Floating preview card * /}
 *           <motion.div
 *             className={styles.heroVisual}
 *             initial={{ opacity: 0, x: 60 }}
 *             animate={{ opacity: 1, x: 0 }}
 *             transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
 *           >
 *             <div className={styles.previewCard}>
 *               <div className={styles.previewHeader}>
 *                 <div className={styles.previewDots}>
 *                   <span /><span /><span />
 *                 </div>
 *                 <span className={styles.previewTitle}>Live Consultation</span>
 *               </div>
 *               <div className={styles.previewChat}>
 *                 {[
 *                   { sender: 'doctor', text: 'Hello! How can I help you today?' },
 *                   { sender: 'patient', text: "I've had a headache for 3 days." },
 *                   { sender: 'doctor', text: 'Let me ask you a few questions to better understand your condition.' },
 *                 ].map((m, i) => (
 *                   <motion.div
 *                     key={i}
 *                     className={[styles.previewMsg, m.sender === 'patient' ? styles.previewMsgRight : ''].join(' ')}
 *                     initial={{ opacity: 0, y: 10 }}
 *                     animate={{ opacity: 1, y: 0 }}
 *                     transition={{ delay: 0.6 + i * 0.15 }}
 *                   >
 *                     {m.text}
 *                   </motion.div>
 *                 ))}
 *                 <div className={styles.previewTyping}>
 *                   <span /><span /><span />
 *                 </div>
 *               </div>
 *               <div className={styles.previewDoctorRow}>
 *                 <Avatar name="Dilnoza Yusupova" size="sm" online />
 *                 <div>
 *                   <div className={styles.previewDoctorName}>Dr. Dilnoza Yusupova</div>
 *                   <div className={styles.previewDoctorSpec}>Cardiologist · Online</div>
 *                 </div>
 *               </div>
 *             </div>
 * 
 *             {/* Floating stat cards * /}
 *             <motion.div className={styles.floatStat} style={{ top: '5%', right: '-10%' }}
 *               animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
 *               <Star size={14} fill="currentColor" style={{ color: '#F59E0B' }} />
 *               <span>4.9 Rating</span>
 *             </motion.div>
 *             <motion.div className={styles.floatStat} style={{ bottom: '10%', left: '-12%' }}
 *               animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 1 }}>
 *               <Users size={14} />
 *               <span>500+ Doctors</span>
 *             </motion.div>
 *           </motion.div>
 *         </div>
 * 
 *         {/* Stats strip * /}
 *         <div className={styles.statsStrip}>
 *           <div className="container">
 *             <div className={styles.statsRow}>
 *               {stats.map((s, i) => (
 *                 <div key={i} className={styles.statItem}>
 *                   <div className={styles.statIcon}>{s.icon}</div>
 *                   <div className={styles.statNum}>
 *                     <Counter value={s.value} suffix={s.suffix} />
 *                   </div>
 *                   <div className={styles.statText}>{s.label}</div>
 *                 </div>
 *               ))}
 *             </div>
 *           </div>
 *         </div>
 *       </section>
 * 
 *       {/* ── Features ── * /}
 *       <section className={styles.features}>
 *         <div className="container">
 *           <StaggerIn className={styles.sectionHeader}>
 *             <motion.h2 variants={fadeUp} className={styles.sectionTitle}>{t.home.features.title}</motion.h2>
 *             <motion.p variants={fadeUp} className={styles.sectionSubtitle}>{t.home.features.subtitle}</motion.p>
 *           </StaggerIn>
 *           <StaggerIn className={styles.featuresGrid}>
 *             {features.map(f => (
 *               <motion.div key={f.key} className={styles.featureCard} variants={fadeUp} whileHover={{ y: -4 }}>
 *                 <div className={styles.featureIcon} style={{ background: `${f.color}18`, color: f.color }}>
 *                   {f.icon}
 *                 </div>
 *                 <h3>{t.home.features[f.key].title}</h3>
 *                 <p>{t.home.features[f.key].desc}</p>
 *               </motion.div>
 *             ))}
 *           </StaggerIn>
 *         </div>
 *       </section>
 * 
 *       {/* ── How It Works ── * /}
 *       <section className={styles.howItWorks}>
 *         <div className="container">
 *           <StaggerIn className={styles.sectionHeader}>
 *             <motion.h2 variants={fadeUp} className={styles.sectionTitle}>{t.home.howItWorks.title}</motion.h2>
 *           </StaggerIn>
 *           <div className={styles.stepsRow}>
 *             {t.home.howItWorks.steps.map((step, i) => (
 *               <motion.div key={i} className={styles.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
 *                 viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
 *                 <div className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</div>
 *                 <h3>{step.title}</h3>
 *                 <p>{step.desc}</p>
 *                 {i < t.home.howItWorks.steps.length - 1 && (
 *                   <ChevronRight className={styles.stepArrow} size={20} />
 *                 )}
 *               </motion.div>
 *             ))}
 *           </div>
 *         </div>
 *       </section>
 * 
 *       {/* ── Top Doctors ── * /}
 *       <section className={styles.topDoctors}>
 *         <div className="container">
 *           <div className={styles.sectionHeaderRow}>
 *             <div>
 *               <h2 className={styles.sectionTitle}>{t.home.topDoctors.title}</h2>
 *             </div>
 *             <Link to="/doctors">
 *               <Button variant="outline" size="sm" iconRight={<ArrowRight size={14} />}>
 *                 {t.home.topDoctors.viewAll}
 *               </Button>
 *             </Link>
 *           </div>
 *           <StaggerIn className={styles.doctorsGrid}>
 *             {featuredDoctors.map(doc => (
 *               <DoctorCard key={doc.id} doctor={doc} />
 *             ))}
 *           </StaggerIn>
 *         </div>
 *       </section>
 * 
 *       {/* ── CTA ── * /}
 *       <section className={styles.ctaSection}>
 *         <div className="container">
 *           <motion.div className={styles.ctaBox}
 *             initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
 *             viewport={{ once: true }} transition={{ duration: 0.6 }}>
 *             <h2>{t.home.cta.title}</h2>
 *             <p>{t.home.cta.subtitle}</p>
 *             <Link to="/register">
 *               <Button size="xl" variant="accent" iconRight={<ArrowRight size={18} />}>
 *                 {t.home.cta.button}
 *               </Button>
 *             </Link>
 *           </motion.div>
 *         </div>
 *       </section>
 *     </div>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/HomePage.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * .page { overflow: hidden; }
 * 
 * /* ── Hero ── * /
 * .hero {
 *   min-height: 100vh;
 *   display: flex;
 *   flex-direction: column;
 *   position: relative;
 *   padding-top: var(--nav-height);
 * }
 * 
 * .heroBg {
 *   position: absolute;
 *   inset: 0;
 *   z-index: 0;
 *   pointer-events: none;
 * }
 * 
 * .heroBlob1 {
 *   position: absolute;
 *   top: -10%;
 *   right: -5%;
 *   width: 600px;
 *   height: 600px;
 *   background: radial-gradient(ellipse, rgba(45, 106, 79, 0.12) 0%, transparent 70%);
 *   border-radius: 50%;
 * }
 * 
 * .heroBlob2 {
 *   position: absolute;
 *   bottom: 0;
 *   left: -10%;
 *   width: 500px;
 *   height: 500px;
 *   background: radial-gradient(ellipse, rgba(15, 118, 110, 0.08) 0%, transparent 70%);
 *   border-radius: 50%;
 * }
 * 
 * .heroGrid {
 *   position: absolute;
 *   inset: 0;
 *   background-image: linear-gradient(var(--color-border) 1px, transparent 1px),
 *     linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
 *   background-size: 48px 48px;
 *   opacity: 0.4;
 *   mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
 * }
 * 
 * .heroInner {
 *   flex: 1;
 *   display: grid;
 *   grid-template-columns: 1fr 1fr;
 *   gap: 80px;
 *   align-items: center;
 *   padding-top: 80px;
 *   padding-bottom: 60px;
 *   position: relative;
 *   z-index: 1;
 * }
 * 
 * @media (max-width: 960px) {
 *   .heroInner { grid-template-columns: 1fr; gap: 48px; }
 *   .heroVisual { display: none; }
 * }
 * 
 * .heroContent { display: flex; flex-direction: column; gap: 24px; }
 * 
 * .heroBadge {
 *   display: inline-flex;
 *   align-items: center;
 *   gap: 8px;
 *   background: var(--color-primary-muted);
 *   border: 1px solid rgba(45, 106, 79, 0.2);
 *   color: var(--color-primary);
 *   padding: 6px 14px;
 *   border-radius: var(--radius-full);
 *   font-size: 13px;
 *   font-weight: 500;
 *   width: fit-content;
 * }
 * 
 * .heroBadgeDot {
 *   width: 7px;
 *   height: 7px;
 *   background: var(--color-primary);
 *   border-radius: 50%;
 *   animation: pulse 2s ease-in-out infinite;
 * }
 * 
 * .heroTitle {
 *   font-family: var(--font-display);
 *   font-size: clamp(40px, 5vw, 64px);
 *   line-height: 1.1;
 *   letter-spacing: -0.03em;
 *   color: var(--color-text-primary);
 * }
 * 
 * .heroTitle em {
 *   font-style: italic;
 *   color: var(--color-primary);
 * }
 * 
 * .heroSubtitle {
 *   font-size: 17px;
 *   line-height: 1.7;
 *   color: var(--color-text-secondary);
 *   max-width: 520px;
 * }
 * 
 * .heroSearch {
 *   display: flex;
 *   gap: 10px;
 *   background: var(--color-surface);
 *   border: 1.5px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 6px 6px 6px 16px;
 *   box-shadow: var(--shadow-md);
 *   align-items: center;
 *   max-width: 520px;
 * }
 * 
 * .searchInputWrap {
 *   flex: 1;
 *   display: flex;
 *   align-items: center;
 *   gap: 10px;
 * }
 * 
 * .searchIcon { color: var(--color-text-tertiary); flex-shrink: 0; }
 * 
 * .searchInput {
 *   flex: 1;
 *   border: none;
 *   outline: none;
 *   background: transparent;
 *   color: var(--color-text-primary);
 *   font-size: 14px;
 *   font-family: var(--font-body);
 * }
 * 
 * .searchInput::placeholder { color: var(--color-text-tertiary); }
 * 
 * .heroCtas {
 *   display: flex;
 *   align-items: center;
 *   gap: 16px;
 *   flex-wrap: wrap;
 * }
 * 
 * .watchDemo {
 *   display: flex;
 *   align-items: center;
 *   gap: 10px;
 *   font-size: 14px;
 *   color: var(--color-text-secondary);
 *   cursor: pointer;
 *   transition: color var(--transition-fast);
 *   font-family: var(--font-body);
 * }
 * .watchDemo:hover { color: var(--color-text-primary); }
 * 
 * .playBtn {
 *   width: 36px;
 *   height: 36px;
 *   background: var(--color-surface);
 *   border: 1.5px solid var(--color-border);
 *   border-radius: 50%;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   box-shadow: var(--shadow-sm);
 *   color: var(--color-primary);
 *   padding-left: 2px;
 *   transition: all var(--transition-fast);
 * }
 * .watchDemo:hover .playBtn { box-shadow: var(--shadow-md); transform: scale(1.1); }
 * 
 * /* ── Hero Visual ── * /
 * .heroVisual { position: relative; }
 * 
 * .previewCard {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   box-shadow: var(--shadow-xl);
 *   overflow: hidden;
 *   max-width: 380px;
 *   margin: 0 auto;
 * }
 * 
 * .previewHeader {
 *   display: flex;
 *   align-items: center;
 *   gap: 10px;
 *   padding: 14px 18px;
 *   border-bottom: 1px solid var(--color-border);
 *   background: var(--color-bg-tertiary);
 * }
 * 
 * .previewDots { display: flex; gap: 6px; }
 * .previewDots span {
 *   width: 10px;
 *   height: 10px;
 *   border-radius: 50%;
 *   background: var(--color-border-strong);
 * }
 * .previewDots span:first-child { background: #FF5F57; }
 * .previewDots span:nth-child(2) { background: #FFBD2E; }
 * .previewDots span:nth-child(3) { background: #28C840; }
 * 
 * .previewTitle { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-left: 4px; }
 * 
 * .previewChat { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; min-height: 160px; }
 * 
 * .previewMsg {
 *   background: var(--color-bg-tertiary);
 *   border-radius: 14px 14px 14px 4px;
 *   padding: 9px 13px;
 *   font-size: 13px;
 *   line-height: 1.4;
 *   color: var(--color-text-primary);
 *   max-width: 85%;
 *   box-shadow: var(--shadow-sm);
 * }
 * 
 * .previewMsgRight {
 *   background: var(--color-primary);
 *   color: white;
 *   border-radius: 14px 14px 4px 14px;
 *   align-self: flex-end;
 * }
 * 
 * .previewTyping {
 *   display: flex;
 *   gap: 4px;
 *   padding: 6px 0;
 * }
 * 
 * .previewTyping span {
 *   width: 6px;
 *   height: 6px;
 *   border-radius: 50%;
 *   background: var(--color-text-tertiary);
 *   animation: bounce 1.2s ease-in-out infinite;
 * }
 * .previewTyping span:nth-child(2) { animation-delay: 0.2s; }
 * .previewTyping span:nth-child(3) { animation-delay: 0.4s; }
 * 
 * @keyframes bounce {
 *   0%, 80%, 100% { transform: translateY(0); }
 *   40% { transform: translateY(-6px); }
 * }
 * 
 * .previewDoctorRow {
 *   display: flex;
 *   align-items: center;
 *   gap: 10px;
 *   padding: 12px 18px;
 *   border-top: 1px solid var(--color-border);
 *   background: var(--color-bg-tertiary);
 * }
 * 
 * .previewDoctorName { font-size: 13px; font-weight: 600; color: var(--color-text-primary); }
 * .previewDoctorSpec { font-size: 11px; color: var(--color-primary); }
 * 
 * .floatStat {
 *   position: absolute;
 *   display: flex;
 *   align-items: center;
 *   gap: 7px;
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-full);
 *   padding: 8px 14px;
 *   font-size: 13px;
 *   font-weight: 600;
 *   color: var(--color-text-primary);
 *   box-shadow: var(--shadow-md);
 *   white-space: nowrap;
 * }
 * 
 * /* ── Stats Strip ── * /
 * .statsStrip {
 *   background: var(--color-surface);
 *   border-top: 1px solid var(--color-border);
 *   border-bottom: 1px solid var(--color-border);
 *   position: relative;
 *   z-index: 1;
 * }
 * 
 * .statsRow {
 *   display: grid;
 *   grid-template-columns: repeat(4, 1fr);
 *   gap: 0;
 * }
 * 
 * @media (max-width: 600px) { .statsRow { grid-template-columns: repeat(2, 1fr); } }
 * 
 * .statItem {
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   gap: 6px;
 *   padding: 28px 16px;
 *   text-align: center;
 *   border-right: 1px solid var(--color-border);
 * }
 * .statItem:last-child { border-right: none; }
 * 
 * .statIcon { color: var(--color-primary); }
 * 
 * .statNum {
 *   font-family: var(--font-display);
 *   font-size: 32px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 *   letter-spacing: -0.02em;
 * }
 * 
 * .statText { font-size: 13px; color: var(--color-text-tertiary); font-weight: 500; }
 * 
 * /* ── Sections ── * /
 * .features, .howItWorks, .topDoctors, .ctaSection {
 *   padding: 100px 0;
 * }
 * 
 * .howItWorks { background: var(--color-bg-secondary); }
 * .topDoctors { background: var(--color-bg); }
 * 
 * .sectionHeader {
 *   text-align: center;
 *   margin-bottom: 60px;
 * }
 * 
 * .sectionHeaderRow {
 *   display: flex;
 *   align-items: center;
 *   justify-content: space-between;
 *   margin-bottom: 48px;
 * }
 * 
 * .sectionTitle {
 *   font-family: var(--font-display);
 *   font-size: clamp(28px, 3.5vw, 44px);
 *   font-weight: 700;
 *   letter-spacing: -0.025em;
 *   color: var(--color-text-primary);
 *   margin-bottom: 12px;
 * }
 * 
 * .sectionSubtitle {
 *   font-size: 17px;
 *   color: var(--color-text-secondary);
 *   max-width: 500px;
 *   margin: 0 auto;
 *   line-height: 1.6;
 * }
 * 
 * /* ── Features Grid ── * /
 * .featuresGrid {
 *   display: grid;
 *   grid-template-columns: repeat(4, 1fr);
 *   gap: 20px;
 * }
 * 
 * @media (max-width: 960px) { .featuresGrid { grid-template-columns: repeat(2, 1fr); } }
 * @media (max-width: 500px) { .featuresGrid { grid-template-columns: 1fr; } }
 * 
 * .featureCard {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 28px;
 *   transition: all var(--transition-base);
 * }
 * 
 * .featureCard:hover {
 *   border-color: var(--color-primary);
 *   box-shadow: var(--shadow-md);
 * }
 * 
 * .featureIcon {
 *   width: 52px;
 *   height: 52px;
 *   border-radius: var(--radius-md);
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   margin-bottom: 20px;
 * }
 * 
 * .featureCard h3 {
 *   font-size: 16px;
 *   font-weight: 600;
 *   color: var(--color-text-primary);
 *   margin-bottom: 8px;
 * }
 * 
 * .featureCard p {
 *   font-size: 14px;
 *   color: var(--color-text-secondary);
 *   line-height: 1.6;
 * }
 * 
 * /* ── Steps ── * /
 * .stepsRow {
 *   display: grid;
 *   grid-template-columns: repeat(4, 1fr);
 *   gap: 0;
 *   position: relative;
 * }
 * 
 * @media (max-width: 860px) { .stepsRow { grid-template-columns: repeat(2, 1fr); gap: 24px; } }
 * 
 * .step {
 *   padding: 32px 24px;
 *   position: relative;
 *   text-align: center;
 * }
 * 
 * .stepNum {
 *   font-family: var(--font-display);
 *   font-size: 48px;
 *   font-weight: 700;
 *   color: var(--color-primary-muted);
 *   line-height: 1;
 *   margin-bottom: 16px;
 * }
 * 
 * [data-theme="dark"] .stepNum { color: var(--color-primary-dark); }
 * 
 * .step h3 {
 *   font-size: 16px;
 *   font-weight: 600;
 *   color: var(--color-text-primary);
 *   margin-bottom: 8px;
 * }
 * 
 * .step p {
 *   font-size: 14px;
 *   color: var(--color-text-secondary);
 *   line-height: 1.6;
 * }
 * 
 * .stepArrow {
 *   position: absolute;
 *   top: 36px;
 *   right: -10px;
 *   color: var(--color-border-strong);
 *   z-index: 1;
 * }
 * 
 * /* ── Doctors Grid ── * /
 * .doctorsGrid {
 *   display: grid;
 *   grid-template-columns: repeat(3, 1fr);
 *   gap: 20px;
 * }
 * 
 * @media (max-width: 960px) { .doctorsGrid { grid-template-columns: repeat(2, 1fr); } }
 * @media (max-width: 600px) { .doctorsGrid { grid-template-columns: 1fr; } }
 * 
 * .doctorCard {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   overflow: hidden;
 *   transition: all var(--transition-base);
 * }
 * 
 * .doctorCard:hover { box-shadow: var(--shadow-lg); border-color: var(--color-border-strong); }
 * 
 * .doctorCardTop {
 *   background: linear-gradient(135deg, var(--color-primary-muted), var(--color-teal-muted));
 *   padding: 28px 20px 20px;
 *   display: flex;
 *   justify-content: space-between;
 *   align-items: flex-start;
 * }
 * 
 * .doctorAvailBadge {
 *   display: flex;
 *   align-items: center;
 *   gap: 6px;
 *   background: var(--color-surface);
 *   border-radius: var(--radius-full);
 *   padding: 4px 10px;
 *   font-size: 12px;
 *   font-weight: 500;
 *   color: var(--color-text-secondary);
 * }
 * 
 * .availDot {
 *   width: 7px;
 *   height: 7px;
 *   border-radius: 50%;
 * }
 * .availGreen { background: var(--color-success); animation: pulse 2s infinite; }
 * .availGray { background: var(--color-text-tertiary); }
 * 
 * .doctorCardBody {
 *   padding: 20px;
 *   border-bottom: 1px solid var(--color-border);
 * }
 * 
 * .doctorCardBody h3 {
 *   font-size: 17px;
 *   font-weight: 600;
 *   color: var(--color-text-primary);
 *   margin-bottom: 4px;
 * }
 * 
 * .doctorSpecialty {
 *   font-size: 13px;
 *   color: var(--color-primary);
 *   font-weight: 500;
 *   margin-bottom: 12px;
 * }
 * 
 * .doctorMeta {
 *   display: flex;
 *   align-items: center;
 *   gap: 6px;
 *   font-size: 12.5px;
 *   color: var(--color-text-tertiary);
 *   margin-bottom: 12px;
 *   flex-wrap: wrap;
 * }
 * 
 * .doctorMeta svg { color: #F59E0B; }
 * 
 * .doctorLangs { display: flex; gap: 6px; flex-wrap: wrap; }
 * 
 * .langTag {
 *   background: var(--color-bg-tertiary);
 *   border: 1px solid var(--color-border);
 *   color: var(--color-text-tertiary);
 *   padding: 2px 8px;
 *   border-radius: var(--radius-full);
 *   font-size: 11px;
 * }
 * 
 * .doctorCardFooter {
 *   display: flex;
 *   gap: 10px;
 *   padding: 14px 20px;
 * }
 * 
 * /* ── CTA ── * /
 * .ctaSection {
 *   background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 60%, var(--color-teal) 100%);
 * }
 * 
 * .ctaBox {
 *   text-align: center;
 *   color: white;
 *   padding: 20px 0;
 * }
 * 
 * .ctaBox h2 {
 *   font-family: var(--font-display);
 *   font-size: clamp(28px, 4vw, 48px);
 *   font-weight: 700;
 *   letter-spacing: -0.02em;
 *   margin-bottom: 16px;
 * }
 * 
 * .ctaBox p {
 *   font-size: 17px;
 *   color: rgba(255,255,255,0.8);
 *   margin-bottom: 36px;
 *   max-width: 500px;
 *   margin-left: auto;
 *   margin-right: auto;
 * }
 * 
 * @keyframes pulse {
 *   0%, 100% { opacity: 1; transform: scale(1); }
 *   50% { opacity: 0.7; transform: scale(1.1); }
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/AuthPage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { useState } from 'react';
 * import { Link, useNavigate, useLocation } from 'react-router-dom';
 * import { motion, AnimatePresence } from 'framer-motion';
 * import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Stethoscope, HeartPulse } from 'lucide-react';
 * import toast from 'react-hot-toast';
 * import { useAuthStore } from '../store';
 * import { useT } from '../i18n/useT';
 * import { Auth } from '../services';
 * import Button from '../components/common/Button';
 * import Input from '../components/common/Input';
 * import styles from './AuthPage.module.css';
 * 
 * // ─── Shared animated panel ────────────────────────────────────────────────────
 * function AuthLayout({ children, title, subtitle }) {
 *   return (
 *     <div className={styles.page}>
 *       {/* Decorative left panel * /}
 *       <div className={styles.leftPanel}>
 *         <div className={styles.leftContent}>
 *           <div className={styles.brandMark}>
 *             <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
 *               <rect width="28" height="28" rx="8" fill="white" fillOpacity="0.2" />
 *               <path d="M14 7v14M7 14h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
 *             </svg>
 *             <span className={styles.brandName}>Healzy</span>
 *           </div>
 *           <div className={styles.leftHero}>
 *             <h2>Healthcare<br />at your fingertips</h2>
 *             <p>Connect with certified doctors, get AI-powered insights, and take control of your health — all from one platform.</p>
 *           </div>
 *           <div className={styles.leftStats}>
 *             {[
 *               { value: '500+', label: 'Doctors' },
 *               { value: '50K+', label: 'Patients' },
 *               { value: '4.9★', label: 'Rating' },
 *             ].map(s => (
 *               <div key={s.label} className={styles.stat}>
 *                 <span className={styles.statValue}>{s.value}</span>
 *                 <span className={styles.statLabel}>{s.label}</span>
 *               </div>
 *             ))}
 *           </div>
 *           {/* Floating cards decoration * /}
 *           <div className={styles.floatingCards}>
 *             <div className={styles.floatCard} style={{ top: '20%', right: '-20px' }}>
 *               <HeartPulse size={16} />
 *               <span>Live consultation</span>
 *             </div>
 *             <div className={styles.floatCard} style={{ bottom: '30%', right: '-30px' }}>
 *               <Stethoscope size={16} />
 *               <span>AI Diagnosis</span>
 *             </div>
 *           </div>
 *         </div>
 *       </div>
 * 
 *       {/* Right form panel * /}
 *       <div className={styles.rightPanel}>
 *         <motion.div
 *           className={styles.formBox}
 *           initial={{ opacity: 0, y: 24 }}
 *           animate={{ opacity: 1, y: 0 }}
 *           transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
 *         >
 *           <div className={styles.formHeader}>
 *             <h1 className={styles.formTitle}>{title}</h1>
 *             <p className={styles.formSubtitle}>{subtitle}</p>
 *           </div>
 *           {children}
 *         </motion.div>
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // ─── Login ────────────────────────────────────────────────────────────────────
 * export function LoginPage() {
 *   const { t } = useT();
 *   const navigate = useNavigate();
 *   const location = useLocation();
 *   const login = useAuthStore(s => s.login);
 *   const from = location.state?.from?.pathname || '/dashboard';
 * 
 *   const [form, setForm] = useState({ email: '', password: '' });
 *   const [showPass, setShowPass] = useState(false);
 *   const [errors, setErrors] = useState({});
 *   const [loading, setLoading] = useState(false);
 * 
 *   const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };
 * 
 *   const validate = () => {
 *     const e = {};
 *     if (!form.email) e.email = 'Email is required';
 *     else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
 *     if (!form.password) e.password = 'Password is required';
 *     setErrors(e);
 *     return !Object.keys(e).length;
 *   };
 * 
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     if (!validate()) return;
 *     setLoading(true);
 *     try {
 *       await Auth.getCSRF();
 *       const res = await Auth.login(form);
 *       login(res.data.user, res.data.token);
 *       toast.success(`Welcome back, ${res.data.user.firstName}!`);
 *       navigate(from, { replace: true });
 *     } catch (err) {
 *       const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Invalid credentials';
 *       toast.error(msg);
 *       setErrors({ password: msg });
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 * 
 *   const demoLogin = async (role) => {
 *     const creds = {
 *       patient: { email: 'patient@healzy.uz', password: 'password123' },
 *       doctor: { email: 'doctor@healzy.uz', password: 'password123' },
 *       admin: { email: 'admin@healzy.uz', password: 'password123' },
 *     };
 *     setForm(creds[role]);
 *     setLoading(true);
 *     try {
 *       await Auth.getCSRF();
 *       const res = await Auth.login(creds[role]);
 *       login(res.data.user, res.data.token);
 *       toast.success(`Signed in as ${role}!`);
 *       navigate(from, { replace: true });
 *     } catch {
 *       toast.error('Demo login failed');
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 * 
 *   return (
 *     <AuthLayout title={t.auth.login.title} subtitle={t.auth.login.subtitle}>
 *       {/* Demo accounts * /}
 *       <div className={styles.demoSection}>
 *         <span className={styles.demoLabel}>Demo accounts</span>
 *         <div className={styles.demoBtns}>
 *           {['patient', 'doctor', 'admin'].map(role => (
 *             <button key={role} className={styles.demoBtn} onClick={() => demoLogin(role)} disabled={loading}>
 *               {role.charAt(0).toUpperCase() + role.slice(1)}
 *             </button>
 *           ))}
 *         </div>
 *       </div>
 * 
 *       <form onSubmit={handleSubmit} className={styles.form}>
 *         <Input
 *           label={t.auth.login.email}
 *           type="email"
 *           value={form.email}
 *           onChange={e => set('email', e.target.value)}
 *           icon={<Mail size={16} />}
 *           error={errors.email}
 *           placeholder="you@example.com"
 *           autoComplete="email"
 *         />
 *         <Input
 *           label={t.auth.login.password}
 *           type={showPass ? 'text' : 'password'}
 *           value={form.password}
 *           onChange={e => set('password', e.target.value)}
 *           icon={<Lock size={16} />}
 *           iconRight={
 *             <button type="button" onClick={() => setShowPass(s => !s)} className={styles.passToggle}>
 *               {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
 *             </button>
 *           }
 *           error={errors.password}
 *           placeholder="••••••••"
 *           autoComplete="current-password"
 *         />
 * 
 *         <div className={styles.forgotRow}>
 *           <Link to="/reset-password" className={styles.forgot}>{t.auth.login.forgotPassword}</Link>
 *         </div>
 * 
 *         <Button type="submit" fullWidth loading={loading} size="lg" iconRight={<ArrowRight size={16} />}>
 *           {t.auth.login.submit}
 *         </Button>
 *       </form>
 * 
 *       <p className={styles.switchAuth}>
 *         {t.auth.login.noAccount}{' '}
 *         <Link to="/register">{t.auth.login.register}</Link>
 *       </p>
 *     </AuthLayout>
 *   );
 * }
 * 
 * // ─── Register ─────────────────────────────────────────────────────────────────
 * export function RegisterPage() {
 *   const { t } = useT();
 *   const navigate = useNavigate();
 *   const login = useAuthStore(s => s.login);
 * 
 *   const [step, setStep] = useState(1); // 1: details, 2: role select
 *   const [form, setForm] = useState({
 *     firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'patient',
 *   });
 *   const [showPass, setShowPass] = useState(false);
 *   const [errors, setErrors] = useState({});
 *   const [loading, setLoading] = useState(false);
 * 
 *   const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };
 * 
 *   const validateStep1 = () => {
 *     const e = {};
 *     if (!form.firstName.trim()) e.firstName = 'Required';
 *     if (!form.lastName.trim()) e.lastName = 'Required';
 *     if (!form.email) e.email = 'Required';
 *     else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
 *     if (!form.password) e.password = 'Required';
 *     else if (form.password.length < 8) e.password = 'Min 8 characters';
 *     if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
 *     setErrors(e);
 *     return !Object.keys(e).length;
 *   };
 * 
 *   const handleNext = () => { if (validateStep1()) setStep(2); };
 * 
 *   const handleSubmit = async () => {
 *     setLoading(true);
 *     try {
 *       await Auth.getCSRF();
 *       const res = await Auth.register(form);
 *       login(res.data.user, res.data.token);
 *       toast.success(`Welcome to Healzy, ${res.data.user.firstName}!`);
 *       navigate('/dashboard');
 *     } catch (err) {
 *       const data = err?.response?.data || {};
 *       const msg = data.email?.[0] || data.error || 'Registration failed';
 *       toast.error(msg);
 *       setStep(1);
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 * 
 *   return (
 *     <AuthLayout title={t.auth.register.title} subtitle={t.auth.register.subtitle}>
 *       {/* Progress * /}
 *       <div className={styles.progress}>
 *         {[1, 2].map(i => (
 *           <div key={i} className={[styles.progressStep, step >= i ? styles.progressActive : ''].join(' ')} />
 *         ))}
 *       </div>
 * 
 *       <AnimatePresence mode="wait">
 *         {step === 1 ? (
 *           <motion.div
 *             key="step1"
 *             initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
 *             className={styles.form}
 *           >
 *             <div className={styles.nameRow}>
 *               <Input label={t.auth.register.firstName} value={form.firstName}
 *                 onChange={e => set('firstName', e.target.value)} error={errors.firstName}
 *                 icon={<User size={16} />} placeholder="Amir" />
 *               <Input label={t.auth.register.lastName} value={form.lastName}
 *                 onChange={e => set('lastName', e.target.value)} error={errors.lastName}
 *                 placeholder="Karimov" />
 *             </div>
 *             <Input label={t.auth.register.email} type="email" value={form.email}
 *               onChange={e => set('email', e.target.value)} error={errors.email}
 *               icon={<Mail size={16} />} placeholder="you@example.com" />
 *             <Input label={t.auth.register.password}
 *               type={showPass ? 'text' : 'password'} value={form.password}
 *               onChange={e => set('password', e.target.value)} error={errors.password}
 *               icon={<Lock size={16} />}
 *               iconRight={<button type="button" onClick={() => setShowPass(s => !s)} className={styles.passToggle}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
 *               placeholder="Min 8 characters" />
 *             <Input label={t.auth.register.confirmPassword}
 *               type={showPass ? 'text' : 'password'} value={form.confirmPassword}
 *               onChange={e => set('confirmPassword', e.target.value)} error={errors.confirmPassword}
 *               icon={<Lock size={16} />} placeholder="Repeat password" />
 *             <Button onClick={handleNext} fullWidth size="lg" iconRight={<ArrowRight size={16} />}>
 *               {t.common.next}
 *             </Button>
 *           </motion.div>
 *         ) : (
 *           <motion.div
 *             key="step2"
 *             initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
 *             className={styles.form}
 *           >
 *             <p className={styles.roleLabel}>{t.auth.register.role}</p>
 *             <div className={styles.roleCards}>
 *               {[
 *                 { value: 'patient', label: t.auth.register.patient, icon: '🏥', desc: 'Find doctors, get consultations, track your health' },
 *                 { value: 'doctor', label: t.auth.register.doctor, icon: '👨‍⚕️', desc: 'See patients, manage consultations, grow your practice' },
 *               ].map(r => (
 *                 <button
 *                   key={r.value}
 *                   type="button"
 *                   className={[styles.roleCard, form.role === r.value ? styles.roleCardActive : ''].join(' ')}
 *                   onClick={() => set('role', r.value)}
 *                 >
 *                   <span className={styles.roleIcon}>{r.icon}</span>
 *                   <span className={styles.roleName}>{r.label}</span>
 *                   <span className={styles.roleDesc}>{r.desc}</span>
 *                   {form.role === r.value && <span className={styles.roleCheck}>✓</span>}
 *                 </button>
 *               ))}
 *             </div>
 *             <p className={styles.terms}>{t.auth.register.terms}</p>
 *             <div className={styles.stepBtns}>
 *               <Button variant="secondary" onClick={() => setStep(1)} size="lg">{t.common.back}</Button>
 *               <Button onClick={handleSubmit} loading={loading} size="lg" iconRight={<ArrowRight size={16} />} fullWidth>
 *                 {t.auth.register.submit}
 *               </Button>
 *             </div>
 *           </motion.div>
 *         )}
 *       </AnimatePresence>
 * 
 *       <p className={styles.switchAuth}>
 *         {t.auth.register.hasAccount}{' '}
 *         <Link to="/login">{t.auth.register.login}</Link>
 *       </p>
 *     </AuthLayout>
 *   );
 * }
 * 
 * // ─── Reset Password ───────────────────────────────────────────────────────────
 * export function ResetPasswordPage() {
 *   const { t } = useT();
 *   const [email, setEmail] = useState('');
 *   const [sent, setSent] = useState(false);
 *   const [loading, setLoading] = useState(false);
 * 
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     if (!email) return;
 *     setLoading(true);
 *     try {
 *       await Auth.resetPasswordRequest(email);
 *       setSent(true);
 *       toast.success(t.auth.resetPassword.success);
 *     } catch {
 *       toast.error('Failed to send reset link. Check the email address.');
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 * 
 *   return (
 *     <AuthLayout title={t.auth.resetPassword.title} subtitle={t.auth.resetPassword.subtitle}>
 *       {sent ? (
 *         <motion.div className={styles.successBox} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
 *           <div className={styles.successIcon}>✉️</div>
 *           <h3>Check your email</h3>
 *           <p>We sent a password reset link to <strong>{email}</strong></p>
 *           <Link to="/login">
 *             <Button variant="outline" fullWidth>{t.auth.resetPassword.back}</Button>
 *           </Link>
 *         </motion.div>
 *       ) : (
 *         <form onSubmit={handleSubmit} className={styles.form}>
 *           <Input
 *             label={t.auth.resetPassword.email}
 *             type="email"
 *             value={email}
 *             onChange={e => setEmail(e.target.value)}
 *             icon={<Mail size={16} />}
 *             placeholder="you@example.com"
 *           />
 *           <Button type="submit" fullWidth loading={loading} size="lg">{t.auth.resetPassword.submit}</Button>
 *           <Link to="/login">
 *             <Button variant="ghost" fullWidth>{t.auth.resetPassword.back}</Button>
 *           </Link>
 *         </form>
 *       )}
 *     </AuthLayout>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/AuthPage.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * .page {
 *   min-height: 100vh;
 *   display: flex;
 * }
 * 
 * /* ── Left Panel ── * /
 * .leftPanel {
 *   flex: 0 0 44%;
 *   background: linear-gradient(150deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-teal) 100%);
 *   position: relative;
 *   overflow: hidden;
 *   display: flex;
 *   align-items: center;
 *   padding: 48px;
 * }
 * 
 * @media (max-width: 900px) { .leftPanel { display: none; } }
 * 
 * .leftPanel::before {
 *   content: '';
 *   position: absolute;
 *   inset: 0;
 *   background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
 * }
 * 
 * .leftContent {
 *   position: relative;
 *   z-index: 1;
 *   color: white;
 *   width: 100%;
 * }
 * 
 * .brandMark {
 *   display: flex;
 *   align-items: center;
 *   gap: 12px;
 *   margin-bottom: 64px;
 * }
 * 
 * .brandName {
 *   font-family: var(--font-display);
 *   font-size: 26px;
 *   font-weight: 700;
 *   color: white;
 * }
 * 
 * .leftHero h2 {
 *   font-family: var(--font-display);
 *   font-size: 42px;
 *   line-height: 1.15;
 *   font-weight: 700;
 *   margin-bottom: 20px;
 *   letter-spacing: -0.02em;
 * }
 * 
 * .leftHero p {
 *   font-size: 16px;
 *   line-height: 1.7;
 *   color: rgba(255, 255, 255, 0.75);
 *   max-width: 340px;
 * }
 * 
 * .leftStats {
 *   display: flex;
 *   gap: 40px;
 *   margin-top: 56px;
 * }
 * 
 * .stat { display: flex; flex-direction: column; gap: 4px; }
 * 
 * .statValue {
 *   font-family: var(--font-display);
 *   font-size: 28px;
 *   font-weight: 700;
 *   color: white;
 * }
 * 
 * .statLabel {
 *   font-size: 13px;
 *   color: rgba(255, 255, 255, 0.65);
 *   text-transform: uppercase;
 *   letter-spacing: 0.06em;
 * }
 * 
 * .floatingCards {
 *   position: absolute;
 *   right: 0;
 *   top: 50%;
 *   transform: translateY(-50%);
 *   width: 200px;
 * }
 * 
 * .floatCard {
 *   display: flex;
 *   align-items: center;
 *   gap: 8px;
 *   background: rgba(255,255,255,0.15);
 *   backdrop-filter: blur(10px);
 *   border: 1px solid rgba(255,255,255,0.25);
 *   border-radius: 12px;
 *   padding: 10px 14px;
 *   font-size: 13px;
 *   color: white;
 *   margin-bottom: 12px;
 *   position: absolute;
 *   white-space: nowrap;
 *   animation: breathe 4s ease-in-out infinite;
 * }
 * 
 * .floatCard:last-child { animation-delay: 2s; }
 * 
 * /* ── Right Panel ── * /
 * .rightPanel {
 *   flex: 1;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   padding: 48px var(--space-6);
 *   overflow-y: auto;
 * }
 * 
 * .formBox {
 *   width: 100%;
 *   max-width: 420px;
 * }
 * 
 * .formHeader { margin-bottom: 32px; }
 * 
 * .formTitle {
 *   font-family: var(--font-display);
 *   font-size: 32px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 *   letter-spacing: -0.02em;
 *   margin-bottom: 8px;
 * }
 * 
 * .formSubtitle {
 *   font-size: 15px;
 *   color: var(--color-text-secondary);
 * }
 * 
 * /* ── Form Elements ── * /
 * .form {
 *   display: flex;
 *   flex-direction: column;
 *   gap: 16px;
 * }
 * 
 * .nameRow {
 *   display: grid;
 *   grid-template-columns: 1fr 1fr;
 *   gap: 12px;
 * }
 * 
 * .forgotRow {
 *   display: flex;
 *   justify-content: flex-end;
 *   margin-top: -4px;
 * }
 * 
 * .forgot {
 *   font-size: 13px;
 *   color: var(--color-text-tertiary);
 *   text-decoration: none;
 * }
 * .forgot:hover { color: var(--color-primary); }
 * 
 * .passToggle {
 *   display: flex;
 *   align-items: center;
 *   color: var(--color-text-tertiary);
 *   cursor: pointer;
 *   pointer-events: all;
 *   transition: color var(--transition-fast);
 * }
 * .passToggle:hover { color: var(--color-text-primary); }
 * 
 * /* ── Demo ── * /
 * .demoSection {
 *   background: var(--color-bg-tertiary);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-md);
 *   padding: 12px 16px;
 *   margin-bottom: 24px;
 *   display: flex;
 *   align-items: center;
 *   gap: 12px;
 *   flex-wrap: wrap;
 * }
 * 
 * .demoLabel {
 *   font-size: 12px;
 *   color: var(--color-text-tertiary);
 *   font-weight: 500;
 *   text-transform: uppercase;
 *   letter-spacing: 0.06em;
 *   flex-shrink: 0;
 * }
 * 
 * .demoBtns { display: flex; gap: 8px; }
 * 
 * .demoBtn {
 *   padding: 5px 14px;
 *   font-size: 12px;
 *   font-weight: 500;
 *   border: 1px solid var(--color-border-strong);
 *   border-radius: var(--radius-full);
 *   background: var(--color-surface);
 *   color: var(--color-text-secondary);
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 *   font-family: var(--font-body);
 * }
 * .demoBtn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-muted); }
 * .demoBtn:disabled { opacity: 0.5; cursor: not-allowed; }
 * 
 * /* ── Progress ── * /
 * .progress {
 *   display: flex;
 *   gap: 8px;
 *   margin-bottom: 28px;
 * }
 * 
 * .progressStep {
 *   height: 4px;
 *   flex: 1;
 *   border-radius: var(--radius-full);
 *   background: var(--color-border);
 *   transition: background var(--transition-base);
 * }
 * 
 * .progressActive { background: var(--color-primary); }
 * 
 * /* ── Role Cards ── * /
 * .roleLabel {
 *   font-size: 13px;
 *   font-weight: 500;
 *   color: var(--color-text-secondary);
 *   margin-bottom: -4px;
 * }
 * 
 * .roleCards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
 * 
 * .roleCard {
 *   position: relative;
 *   display: flex;
 *   flex-direction: column;
 *   align-items: flex-start;
 *   gap: 6px;
 *   padding: 16px;
 *   border: 1.5px solid var(--color-border);
 *   border-radius: var(--radius-lg);
 *   background: var(--color-surface);
 *   cursor: pointer;
 *   text-align: left;
 *   transition: all var(--transition-fast);
 *   font-family: var(--font-body);
 * }
 * 
 * .roleCard:hover { border-color: var(--color-primary-light); background: var(--color-primary-muted); }
 * 
 * .roleCardActive {
 *   border-color: var(--color-primary) !important;
 *   background: var(--color-primary-muted) !important;
 *   box-shadow: 0 0 0 3px var(--color-primary-muted);
 * }
 * 
 * .roleIcon { font-size: 24px; }
 * 
 * .roleName {
 *   font-weight: 600;
 *   font-size: 14px;
 *   color: var(--color-text-primary);
 * }
 * 
 * .roleDesc {
 *   font-size: 12px;
 *   color: var(--color-text-tertiary);
 *   line-height: 1.4;
 * }
 * 
 * .roleCheck {
 *   position: absolute;
 *   top: 12px;
 *   right: 12px;
 *   width: 20px;
 *   height: 20px;
 *   background: var(--color-primary);
 *   color: white;
 *   border-radius: 50%;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   font-size: 11px;
 *   font-weight: 700;
 * }
 * 
 * .terms {
 *   font-size: 12px;
 *   color: var(--color-text-tertiary);
 *   line-height: 1.6;
 *   text-align: center;
 * }
 * 
 * .stepBtns {
 *   display: grid;
 *   grid-template-columns: auto 1fr;
 *   gap: 10px;
 * }
 * 
 * /* ── Switch ── * /
 * .switchAuth {
 *   text-align: center;
 *   font-size: 14px;
 *   color: var(--color-text-tertiary);
 *   margin-top: 24px;
 * }
 * 
 * .switchAuth a { color: var(--color-primary); font-weight: 500; }
 * 
 * /* ── Success Box ── * /
 * .successBox {
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   gap: 16px;
 *   text-align: center;
 * }
 * 
 * .successIcon { font-size: 48px; }
 * 
 * .successBox h3 {
 *   font-family: var(--font-display);
 *   font-size: 22px;
 *   color: var(--color-text-primary);
 * }
 * 
 * .successBox p {
 *   color: var(--color-text-secondary);
 *   font-size: 15px;
 * }
 * 
 * @keyframes breathe {
 *   0%, 100% { transform: translateY(0); }
 *   50% { transform: translateY(-6px); }
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/DoctorsPage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { useState, useEffect, useCallback } from 'react';
 * import { useNavigate, useSearchParams, Link } from 'react-router-dom';
 * import { motion, AnimatePresence } from 'framer-motion';
 * import { Search, SlidersHorizontal, Star, X, ChevronDown, MessageSquare, ArrowLeft } from 'lucide-react';
 * import { useT } from '../i18n/useT';
 * import { Doctors, Chat } from '../services';
 * import { useAuthStore } from '../store';
 * import Avatar from '../components/common/Avatar';
 * import Button from '../components/common/Button';
 * import styles from './DoctorsPage.module.css';
 * import toast from 'react-hot-toast';
 * 
 * // ─── Doctor Card ──────────────────────────────────────────────────────────────
 * function DoctorCard({ doctor }) {
 *   const { t, language } = useT();
 *   const navigate = useNavigate();
 *   const { isAuthenticated } = useAuthStore();
 *   const [starting, setStarting] = useState(false);
 * 
 *   const specialty = language === 'ru' ? doctor.specialtyRu : language === 'uz' ? doctor.specialtyUz : doctor.specialty;
 * 
 *   const handleConsult = async (e) => {
 *     e.stopPropagation();
 *     if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: '/doctors' } } }); return; }
 *     setStarting(true);
 *     try {
 *       const res = await Chat.startConsultation(doctor.id);
 *       navigate(`/chat?conversation=${res.data.id}`);
 *       toast.success(`Consultation started with Dr. ${doctor.firstName}!`);
 *     } catch {
 *       toast.error('Failed to start consultation. Please try again.');
 *     } finally { setStarting(false); }
 *   };
 * 
 *   return (
 *     <motion.div
 *       className={styles.card}
 *       layout
 *       initial={{ opacity: 0, y: 20 }}
 *       animate={{ opacity: 1, y: 0 }}
 *       exit={{ opacity: 0, scale: 0.96 }}
 *       whileHover={{ y: -4 }}
 *       onClick={() => navigate(`/doctors/${doctor.id}`)}
 *     >
 *       <div className={styles.cardLeft}>
 *         <div className={styles.cardAvatar}>
 *           <Avatar name={`${doctor.firstName} ${doctor.lastName}`} size="lg" />
 *           {doctor.isVerified && <span className={styles.verifiedBadge} title="Verified">✓</span>}
 *         </div>
 *         <div className={styles.onlineRow}>
 *           <span className={[styles.onlineDot, doctor.isAvailable ? styles.online : styles.offline].join(' ')} />
 *           <span className={styles.onlineText}>{doctor.isAvailable ? t.doctors.card.available : t.doctors.card.busy}</span>
 *         </div>
 *       </div>
 * 
 *       <div className={styles.cardBody}>
 *         <div className={styles.cardHeader}>
 *           <div>
 *             <h3 className={styles.cardName}>Dr. {doctor.firstName} {doctor.lastName}</h3>
 *             <p className={styles.cardSpec}>{specialty}</p>
 *           </div>
 *           <div className={styles.ratingBadge}>
 *             <Star size={13} fill="currentColor" />
 *             <span>{doctor.rating}</span>
 *             <span className={styles.ratingCount}>({doctor.reviewCount})</span>
 *           </div>
 *         </div>
 * 
 *         <p className={styles.cardBio} onClick={e => e.stopPropagation()}>
 *           {(language === 'ru' ? doctor.bioRu : language === 'uz' ? doctor.bioUz : doctor.bio)?.slice(0, 120)}...
 *         </p>
 * 
 *         <div className={styles.cardStats}>
 *           <span className={styles.cardStat}><strong>{doctor.experience}</strong> {t.doctors.card.experience}</span>
 *           <span className={styles.cardStatDiv} />
 *           <span className={styles.cardStat}><strong>{doctor.consultationCount.toLocaleString()}</strong> {t.doctors.card.consultations}</span>
 *           <span className={styles.cardStatDiv} />
 *           <div className={styles.langTags}>
 *             {doctor.languages.slice(0, 2).map(l => <span key={l} className={styles.langTag}>{l}</span>)}
 *           </div>
 *         </div>
 *       </div>
 * 
 *       <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
 *         <div className={styles.priceTag}>
 *           {doctor.price?.toLocaleString()} <span>UZS</span>
 *         </div>
 *         <Button variant="outline" size="sm" onClick={() => navigate(`/doctors/${doctor.id}`)}>
 *           {t.doctors.card.viewProfile}
 *         </Button>
 *         <Button size="sm" loading={starting} icon={<MessageSquare size={14} />} onClick={handleConsult}>
 *           {t.doctors.card.bookNow}
 *         </Button>
 *       </div>
 *     </motion.div>
 *   );
 * }
 * 
 * // ─── Doctors Search Page ──────────────────────────────────────────────────────
 * export function DoctorsPage() {
 *   const { t } = useT();
 *   const [searchParams, setSearchParams] = useSearchParams();
 * 
 *   const [doctors, setDoctors] = useState([]);
 *   const [loading, setLoading] = useState(true);
 *   const [total, setTotal] = useState(0);
 *   const [filtersOpen, setFiltersOpen] = useState(false);
 * 
 *   const [filters, setFilters] = useState({
 *     search: searchParams.get('search') || '',
 *     specialty: '',
 *     available: false,
 *     sort: 'rating',
 *     minRating: '',
 *   });
 * 
 *   const fetchDoctors = useCallback(async () => {
 *     setLoading(true);
 *     try {
 *       const params = {};
 *       if (filters.search) params.search = filters.search;
 *       if (filters.specialty) params.specialty = filters.specialty;
 *       if (filters.available) params.available = true;
 *       if (filters.sort) params.sort = filters.sort;
 *       const res = await Doctors.search(params);
 *       setDoctors(res.data.results || res.data);
 *       setTotal(res.data.count || (res.data.results || res.data).length);
 *     } catch {
 *       toast.error('Failed to load doctors');
 *     } finally { setLoading(false); }
 *   }, [filters]);
 * 
 *   useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
 * 
 *   const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
 * 
 *   const clearFilters = () => setFilters({ search: '', specialty: '', available: false, sort: 'rating', minRating: '' });
 * 
 *   const { specialties } = t;
 * 
 *   return (
 *     <div className={styles.page}>
 *       {/* Header * /}
 *       <div className={styles.pageHeader}>
 *         <div className="container">
 *           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
 *             <h1 className={styles.pageTitle}>{t.doctors.search.title}</h1>
 *             <p className={styles.pageSubtitle}>{t.doctors.search.subtitle}</p>
 *           </motion.div>
 *         </div>
 *       </div>
 * 
 *       <div className="container">
 *         <div className={styles.layout}>
 *           {/* Sidebar Filters * /}
 *           <aside className={[styles.sidebar, filtersOpen ? styles.sidebarOpen : ''].join(' ')}>
 *             <div className={styles.sidebarHeader}>
 *               <h3>{t.doctors.search.filter || 'Filters'}</h3>
 *               <button onClick={() => setFiltersOpen(false)} className={styles.closeSidebar}><X size={18} /></button>
 *             </div>
 * 
 *             <div className={styles.filterSection}>
 *               <label className={styles.filterLabel}>{t.doctors.search.filterSpecialty}</label>
 *               <select
 *                 className={styles.filterSelect}
 *                 value={filters.specialty}
 *                 onChange={e => setFilter('specialty', e.target.value)}
 *               >
 *                 <option value="">All Specialties</option>
 *                 {specialties.map(s => <option key={s} value={s}>{s}</option>)}
 *               </select>
 *             </div>
 * 
 *             <div className={styles.filterSection}>
 *               <label className={styles.filterLabel}>{t.doctors.search.sort}</label>
 *               <div className={styles.sortOptions}>
 *                 {Object.entries(t.doctors.search.sortOptions).map(([k, label]) => (
 *                   <button
 *                     key={k}
 *                     className={[styles.sortBtn, filters.sort === k ? styles.sortBtnActive : ''].join(' ')}
 *                     onClick={() => setFilter('sort', k)}
 *                   >
 *                     {label}
 *                   </button>
 *                 ))}
 *               </div>
 *             </div>
 * 
 *             <div className={styles.filterSection}>
 *               <label className={[styles.filterLabel, styles.checkLabel].join(' ')}>
 *                 <input
 *                   type="checkbox"
 *                   checked={filters.available}
 *                   onChange={e => setFilter('available', e.target.checked)}
 *                   className={styles.checkbox}
 *                 />
 *                 {t.doctors.search.filterAvailable}
 *               </label>
 *             </div>
 * 
 *             <Button variant="ghost" size="sm" onClick={clearFilters} fullWidth>
 *               {t.common.clear}
 *             </Button>
 *           </aside>
 * 
 *           {/* Main content * /}
 *           <main className={styles.main}>
 *             {/* Search bar * /}
 *             <div className={styles.searchBar}>
 *               <div className={styles.searchInputWrap}>
 *                 <Search size={18} className={styles.searchIcon} />
 *                 <input
 *                   className={styles.searchInput}
 *                   placeholder={t.doctors.search.placeholder}
 *                   value={filters.search}
 *                   onChange={e => setFilter('search', e.target.value)}
 *                 />
 *                 {filters.search && (
 *                   <button onClick={() => setFilter('search', '')} className={styles.clearSearch}>
 *                     <X size={16} />
 *                   </button>
 *                 )}
 *               </div>
 *               <button className={styles.filterToggle} onClick={() => setFiltersOpen(o => !o)}>
 *                 <SlidersHorizontal size={18} />
 *                 {t.common.filter}
 *               </button>
 *             </div>
 * 
 *             {/* Results count * /}
 *             <div className={styles.resultsRow}>
 *               {!loading && (
 *                 <span className={styles.resultsCount}>
 *                   <strong>{total}</strong> {t.doctors.search.results}
 *                 </span>
 *               )}
 *             </div>
 * 
 *             {/* Doctor list * /}
 *             {loading ? (
 *               <div className={styles.skeletonList}>
 *                 {[1,2,3].map(i => <div key={i} className={[styles.skeletonCard, 'skeleton'].join(' ')} />)}
 *               </div>
 *             ) : doctors.length === 0 ? (
 *               <div className={styles.empty}>
 *                 <div className={styles.emptyIcon}>🔍</div>
 *                 <h3>{t.doctors.search.noResults}</h3>
 *                 <Button variant="outline" onClick={clearFilters}>{t.common.clear}</Button>
 *               </div>
 *             ) : (
 *               <AnimatePresence mode="popLayout">
 *                 <div className={styles.doctorList}>
 *                   {doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)}
 *                 </div>
 *               </AnimatePresence>
 *             )}
 *           </main>
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // ─── Doctor Profile Page ──────────────────────────────────────────────────────
 * export function DoctorProfilePage() {
 *   const { t, language } = useT();
 *   const navigate = useNavigate();
 *   const { isAuthenticated } = useAuthStore();
 *   const id = window.location.pathname.split('/').pop();
 * 
 *   const [doctor, setDoctor] = useState(null);
 *   const [reviews, setReviews] = useState([]);
 *   const [loading, setLoading] = useState(true);
 *   const [starting, setStarting] = useState(false);
 *   const [activeTab, setActiveTab] = useState('about');
 * 
 *   useEffect(() => {
 *     const load = async () => {
 *       setLoading(true);
 *       try {
 *         const [docRes, revRes] = await Promise.all([
 *           Doctors.getById(id),
 *           Doctors.getReviews(id),
 *         ]);
 *         setDoctor(docRes.data);
 *         setReviews(revRes.data.results || revRes.data || []);
 *       } catch {
 *         toast.error('Doctor not found');
 *         navigate('/doctors');
 *       } finally { setLoading(false); }
 *     };
 *     load();
 *   }, [id]);
 * 
 *   const handleConsult = async () => {
 *     if (!isAuthenticated) { navigate('/login'); return; }
 *     setStarting(true);
 *     try {
 *       const res = await Chat.startConsultation(doctor.id);
 *       navigate(`/chat?conversation=${res.data.id}`);
 *       toast.success(`Consultation started!`);
 *     } catch { toast.error('Failed to start consultation'); }
 *     finally { setStarting(false); }
 *   };
 * 
 *   if (loading) return (
 *     <div className={styles.profileLoading}>
 *       <div className={`skeleton ${styles.profileSkeleton}`} />
 *     </div>
 *   );
 * 
 *   if (!doctor) return null;
 * 
 *   const specialty = language === 'ru' ? doctor.specialtyRu : language === 'uz' ? doctor.specialtyUz : doctor.specialty;
 *   const bio = language === 'ru' ? doctor.bioRu : language === 'uz' ? doctor.bioUz : doctor.bio;
 * 
 *   return (
 *     <div className={styles.profilePage}>
 *       <div className="container">
 *         <button className={styles.backBtn} onClick={() => navigate('/doctors')}>
 *           <ArrowLeft size={16} /> {t.common.back}
 *         </button>
 * 
 *         <div className={styles.profileLayout}>
 *           {/* Sidebar * /}
 *           <aside className={styles.profileSidebar}>
 *             <motion.div className={styles.profileCard} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
 *               <div className={styles.profileAvatarWrap}>
 *                 <Avatar name={`${doctor.firstName} ${doctor.lastName}`} size="2xl" />
 *                 {doctor.isVerified && (
 *                   <div className={styles.verifiedBig}>
 *                     <span>✓</span> Verified Doctor
 *                   </div>
 *                 )}
 *                 <div className={[styles.availPill, doctor.isAvailable ? styles.availGreen : styles.availGray].join(' ')}>
 *                   <span className={styles.availDotSmall} />
 *                   {doctor.isAvailable ? t.doctors.card.available : t.doctors.card.busy}
 *                 </div>
 *               </div>
 * 
 *               <h2 className={styles.profileName}>Dr. {doctor.firstName} {doctor.lastName}</h2>
 *               <p className={styles.profileSpec}>{specialty}</p>
 * 
 *               <div className={styles.profileStatGrid}>
 *                 {[
 *                   { label: t.doctors.profile.yearsOfExperience, value: doctor.experience },
 *                   { label: t.doctors.profile.totalConsultations, value: doctor.consultationCount.toLocaleString() },
 *                   { label: t.doctors.profile.averageRating, value: `${doctor.rating} ★` },
 *                 ].map(s => (
 *                   <div key={s.label} className={styles.profileStat}>
 *                     <span className={styles.profileStatVal}>{s.value}</span>
 *                     <span className={styles.profileStatLabel}>{s.label}</span>
 *                   </div>
 *                 ))}
 *               </div>
 * 
 *               <div className={styles.profileInfo}>
 *                 <div className={styles.infoRow}>
 *                   <span className={styles.infoLabel}>{t.doctors.profile.languages}</span>
 *                   <div className={styles.langList}>
 *                     {doctor.languages.map(l => <span key={l} className={styles.langChip}>{l}</span>)}
 *                   </div>
 *                 </div>
 *                 <div className={styles.infoRow}>
 *                   <span className={styles.infoLabel}>{t.doctors.profile.workingHours}</span>
 *                   <span className={styles.infoValue}>{doctor.workingHours}</span>
 *                 </div>
 *               </div>
 * 
 *               <div className={styles.profilePrice}>
 *                 <span className={styles.priceLabel}>Consultation fee</span>
 *                 <span className={styles.priceValue}>{doctor.price?.toLocaleString()} UZS</span>
 *               </div>
 * 
 *               <Button fullWidth size="lg" onClick={handleConsult} loading={starting} icon={<MessageSquare size={16} />}>
 *                 {t.doctors.profile.startConsultation}
 *               </Button>
 *             </motion.div>
 *           </aside>
 * 
 *           {/* Main * /}
 *           <main className={styles.profileMain}>
 *             {/* Tabs * /}
 *             <div className={styles.tabs}>
 *               {['about', 'reviews'].map(tab => (
 *                 <button
 *                   key={tab}
 *                   className={[styles.tab, activeTab === tab ? styles.tabActive : ''].join(' ')}
 *                   onClick={() => setActiveTab(tab)}
 *                 >
 *                   {tab === 'about' ? t.doctors.profile.about : `${t.doctors.profile.reviews} (${reviews.length})`}
 *                 </button>
 *               ))}
 *             </div>
 * 
 *             <AnimatePresence mode="wait">
 *               {activeTab === 'about' ? (
 *                 <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.tabContent}>
 *                   <div className={styles.section}>
 *                     <h3>{t.doctors.profile.about}</h3>
 *                     <p className={styles.bioText}>{bio}</p>
 *                   </div>
 *                   <div className={styles.section}>
 *                     <h3>{t.doctors.profile.education}</h3>
 *                     <pre className={styles.education}>{doctor.education}</pre>
 *                   </div>
 *                   <div className={styles.section}>
 *                     <h3>{t.doctors.profile.specializations}</h3>
 *                     <div className={styles.specTags}>
 *                       {[specialty, 'Preventive Medicine', 'Patient Education'].map(s => (
 *                         <span key={s} className={styles.specTag}>{s}</span>
 *                       ))}
 *                     </div>
 *                   </div>
 *                 </motion.div>
 *               ) : (
 *                 <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.tabContent}>
 *                   {reviews.length === 0 ? (
 *                     <div className={styles.noReviews}>No reviews yet.</div>
 *                   ) : (
 *                     <div className={styles.reviewsList}>
 *                       {reviews.map(r => (
 *                         <div key={r.id} className={styles.reviewCard}>
 *                           <div className={styles.reviewHeader}>
 *                             <Avatar name={r.patientName} size="sm" />
 *                             <div>
 *                               <span className={styles.reviewName}>{r.patientName}</span>
 *                               <span className={styles.reviewDate}>{r.date}</span>
 *                             </div>
 *                             <div className={styles.reviewStars}>
 *                               {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
 *                             </div>
 *                           </div>
 *                           <p className={styles.reviewText}>{r.comment}</p>
 *                         </div>
 *                       ))}
 *                     </div>
 *                   )}
 *                 </motion.div>
 *               )}
 *             </AnimatePresence>
 *           </main>
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/DoctorsPage.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * /* ── Page Header ── * /
 * .page { padding-bottom: 80px; }
 * 
 * .pageHeader {
 *   background: linear-gradient(135deg, var(--color-primary-muted) 0%, var(--color-teal-muted) 100%);
 *   border-bottom: 1px solid var(--color-border);
 *   padding: calc(var(--nav-height) + 48px) 0 48px;
 *   margin-bottom: 40px;
 * }
 * 
 * .pageTitle {
 *   font-family: var(--font-display);
 *   font-size: 40px;
 *   font-weight: 700;
 *   letter-spacing: -0.025em;
 *   color: var(--color-text-primary);
 *   margin-bottom: 8px;
 * }
 * 
 * .pageSubtitle { font-size: 16px; color: var(--color-text-secondary); }
 * 
 * /* ── Layout ── * /
 * .layout { display: grid; grid-template-columns: 260px 1fr; gap: 32px; align-items: start; }
 * 
 * @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }
 * 
 * /* ── Sidebar ── * /
 * .sidebar {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 20px;
 *   position: sticky;
 *   top: calc(var(--nav-height) + 20px);
 *   display: flex;
 *   flex-direction: column;
 *   gap: 20px;
 * }
 * 
 * @media (max-width: 960px) {
 *   .sidebar {
 *     display: none;
 *     position: fixed;
 *     inset: 0;
 *     z-index: 200;
 *     overflow-y: auto;
 *     border-radius: 0;
 *     top: 0;
 *   }
 *   .sidebarOpen { display: flex; }
 * }
 * 
 * .sidebarHeader {
 *   display: flex;
 *   align-items: center;
 *   justify-content: space-between;
 * }
 * .sidebarHeader h3 { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
 * 
 * .closeSidebar {
 *   display: none;
 *   cursor: pointer;
 *   color: var(--color-text-tertiary);
 * }
 * @media (max-width: 960px) { .closeSidebar { display: flex; } }
 * 
 * .filterSection { display: flex; flex-direction: column; gap: 10px; }
 * 
 * .filterLabel {
 *   font-size: 12px;
 *   font-weight: 600;
 *   color: var(--color-text-tertiary);
 *   text-transform: uppercase;
 *   letter-spacing: 0.07em;
 * }
 * 
 * .filterSelect {
 *   padding: 9px 12px;
 *   border: 1.5px solid var(--color-border);
 *   border-radius: var(--radius-md);
 *   background: var(--color-bg);
 *   color: var(--color-text-primary);
 *   font-size: 13px;
 *   font-family: var(--font-body);
 *   outline: none;
 *   cursor: pointer;
 * }
 * .filterSelect:focus { border-color: var(--color-primary); }
 * 
 * .sortOptions { display: flex; flex-direction: column; gap: 4px; }
 * 
 * .sortBtn {
 *   padding: 8px 12px;
 *   border-radius: var(--radius-sm);
 *   font-size: 13px;
 *   color: var(--color-text-secondary);
 *   font-family: var(--font-body);
 *   text-align: left;
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 * }
 * .sortBtn:hover { background: var(--color-bg-tertiary); color: var(--color-text-primary); }
 * .sortBtnActive { background: var(--color-primary-muted); color: var(--color-primary); font-weight: 500; }
 * 
 * .checkLabel {
 *   display: flex;
 *   align-items: center;
 *   gap: 8px;
 *   cursor: pointer;
 *   font-size: 13px;
 *   color: var(--color-text-secondary);
 *   text-transform: none;
 *   letter-spacing: 0;
 *   font-weight: 400;
 * }
 * 
 * .checkbox { width: 16px; height: 16px; accent-color: var(--color-primary); cursor: pointer; }
 * 
 * /* ── Main ── * /
 * .main { display: flex; flex-direction: column; gap: 20px; }
 * 
 * .searchBar {
 *   display: flex;
 *   gap: 12px;
 *   align-items: center;
 * }
 * 
 * .searchInputWrap {
 *   flex: 1;
 *   display: flex;
 *   align-items: center;
 *   gap: 10px;
 *   background: var(--color-surface);
 *   border: 1.5px solid var(--color-border);
 *   border-radius: var(--radius-lg);
 *   padding: 0 16px;
 *   height: 48px;
 *   transition: border-color var(--transition-fast);
 * }
 * .searchInputWrap:focus-within { border-color: var(--color-primary); }
 * 
 * .searchIcon { color: var(--color-text-tertiary); flex-shrink: 0; }
 * 
 * .searchInput {
 *   flex: 1;
 *   border: none;
 *   outline: none;
 *   background: transparent;
 *   color: var(--color-text-primary);
 *   font-size: 14px;
 *   font-family: var(--font-body);
 * }
 * 
 * .clearSearch {
 *   color: var(--color-text-tertiary);
 *   cursor: pointer;
 *   display: flex;
 *   align-items: center;
 * }
 * .clearSearch:hover { color: var(--color-text-primary); }
 * 
 * .filterToggle {
 *   display: flex;
 *   align-items: center;
 *   gap: 8px;
 *   padding: 0 18px;
 *   height: 48px;
 *   background: var(--color-surface);
 *   border: 1.5px solid var(--color-border);
 *   border-radius: var(--radius-lg);
 *   color: var(--color-text-secondary);
 *   font-size: 14px;
 *   font-family: var(--font-body);
 *   font-weight: 500;
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 *   white-space: nowrap;
 * }
 * .filterToggle:hover { border-color: var(--color-primary); color: var(--color-primary); }
 * 
 * @media (min-width: 961px) { .filterToggle { display: none; } }
 * 
 * .resultsRow { display: flex; align-items: center; }
 * 
 * .resultsCount { font-size: 14px; color: var(--color-text-tertiary); }
 * .resultsCount strong { color: var(--color-text-primary); }
 * 
 * /* ── Doctor List Cards ── * /
 * .doctorList { display: flex; flex-direction: column; gap: 16px; }
 * 
 * .card {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 24px;
 *   display: grid;
 *   grid-template-columns: auto 1fr auto;
 *   gap: 20px;
 *   align-items: start;
 *   cursor: pointer;
 *   transition: all var(--transition-base);
 * }
 * 
 * .card:hover { box-shadow: var(--shadow-lg); border-color: var(--color-border-strong); }
 * 
 * @media (max-width: 760px) { .card { grid-template-columns: 1fr; } }
 * 
 * .cardLeft { display: flex; flex-direction: column; align-items: center; gap: 8px; }
 * 
 * .cardAvatar { position: relative; }
 * 
 * .verifiedBadge {
 *   position: absolute;
 *   bottom: 0;
 *   right: 0;
 *   width: 20px;
 *   height: 20px;
 *   background: var(--color-primary);
 *   color: white;
 *   border-radius: 50%;
 *   border: 2px solid var(--color-surface);
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   font-size: 10px;
 *   font-weight: 700;
 * }
 * 
 * .onlineRow { display: flex; align-items: center; gap: 5px; }
 * 
 * .onlineDot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
 * .online { background: var(--color-success); }
 * .offline { background: var(--color-text-tertiary); }
 * .onlineText { font-size: 12px; color: var(--color-text-tertiary); white-space: nowrap; }
 * 
 * .cardBody { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
 * 
 * .cardHeader { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
 * 
 * .cardName {
 *   font-size: 17px;
 *   font-weight: 600;
 *   color: var(--color-text-primary);
 *   margin-bottom: 3px;
 * }
 * 
 * .cardSpec { font-size: 13px; color: var(--color-primary); font-weight: 500; }
 * 
 * .ratingBadge {
 *   display: flex;
 *   align-items: center;
 *   gap: 4px;
 *   background: #FEF3C7;
 *   color: #92400E;
 *   padding: 4px 10px;
 *   border-radius: var(--radius-full);
 *   font-size: 13px;
 *   font-weight: 600;
 *   flex-shrink: 0;
 * }
 * 
 * .ratingCount { font-weight: 400; color: #B45309; }
 * 
 * .cardBio {
 *   font-size: 13.5px;
 *   color: var(--color-text-secondary);
 *   line-height: 1.6;
 * }
 * 
 * .cardStats {
 *   display: flex;
 *   align-items: center;
 *   gap: 12px;
 *   flex-wrap: wrap;
 * }
 * 
 * .cardStat { font-size: 13px; color: var(--color-text-tertiary); }
 * .cardStat strong { color: var(--color-text-primary); font-weight: 600; }
 * 
 * .cardStatDiv { width: 1px; height: 14px; background: var(--color-border); }
 * 
 * .langTags { display: flex; gap: 5px; }
 * .langTag {
 *   background: var(--color-bg-tertiary);
 *   border: 1px solid var(--color-border);
 *   color: var(--color-text-tertiary);
 *   padding: 2px 7px;
 *   border-radius: var(--radius-full);
 *   font-size: 11px;
 * }
 * 
 * .cardActions {
 *   display: flex;
 *   flex-direction: column;
 *   gap: 10px;
 *   min-width: 140px;
 *   align-items: stretch;
 * }
 * 
 * .priceTag {
 *   text-align: center;
 *   font-size: 17px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 * }
 * .priceTag span { font-size: 11px; font-weight: 400; color: var(--color-text-tertiary); }
 * 
 * /* ── Skeleton / Empty ── * /
 * .skeletonList { display: flex; flex-direction: column; gap: 16px; }
 * .skeletonCard { height: 150px; border-radius: var(--radius-xl); }
 * 
 * .empty {
 *   text-align: center;
 *   padding: 80px 20px;
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   gap: 16px;
 * }
 * .emptyIcon { font-size: 48px; }
 * .empty h3 { font-size: 18px; color: var(--color-text-secondary); }
 * 
 * /* ── Profile Page ── * /
 * .profilePage { padding: calc(var(--nav-height) + 32px) 0 80px; }
 * 
 * .backBtn {
 *   display: inline-flex;
 *   align-items: center;
 *   gap: 6px;
 *   font-size: 14px;
 *   color: var(--color-text-secondary);
 *   margin-bottom: 32px;
 *   cursor: pointer;
 *   font-family: var(--font-body);
 *   transition: color var(--transition-fast);
 *   padding: 6px 0;
 * }
 * .backBtn:hover { color: var(--color-primary); }
 * 
 * .profileLayout { display: grid; grid-template-columns: 300px 1fr; gap: 32px; align-items: start; }
 * 
 * @media (max-width: 860px) { .profileLayout { grid-template-columns: 1fr; } }
 * 
 * .profileCard {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 28px;
 *   display: flex;
 *   flex-direction: column;
 *   gap: 20px;
 *   position: sticky;
 *   top: calc(var(--nav-height) + 20px);
 * }
 * 
 * .profileAvatarWrap {
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   gap: 10px;
 * }
 * 
 * .verifiedBig {
 *   display: flex;
 *   align-items: center;
 *   gap: 5px;
 *   font-size: 12px;
 *   color: var(--color-primary);
 *   font-weight: 500;
 *   background: var(--color-primary-muted);
 *   padding: 4px 10px;
 *   border-radius: var(--radius-full);
 * }
 * 
 * .availPill {
 *   display: flex;
 *   align-items: center;
 *   gap: 6px;
 *   font-size: 12px;
 *   padding: 4px 12px;
 *   border-radius: var(--radius-full);
 *   font-weight: 500;
 * }
 * .availGreen { background: var(--color-success-muted); color: var(--color-success); }
 * .availGray { background: var(--color-bg-tertiary); color: var(--color-text-tertiary); }
 * .availDotSmall { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
 * 
 * .profileName { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--color-text-primary); text-align: center; }
 * .profileSpec { font-size: 14px; color: var(--color-primary); font-weight: 500; text-align: center; }
 * 
 * .profileStatGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px 0; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
 * 
 * .profileStat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
 * .profileStatVal { font-size: 18px; font-weight: 700; color: var(--color-text-primary); }
 * .profileStatLabel { font-size: 10px; color: var(--color-text-tertiary); text-align: center; line-height: 1.3; }
 * 
 * .profileInfo { display: flex; flex-direction: column; gap: 12px; }
 * 
 * .infoRow { display: flex; flex-direction: column; gap: 5px; }
 * .infoLabel { font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-tertiary); font-weight: 600; }
 * .infoValue { font-size: 13px; color: var(--color-text-primary); }
 * 
 * .langList { display: flex; flex-wrap: wrap; gap: 5px; }
 * .langChip { background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-text-secondary); padding: 3px 9px; border-radius: var(--radius-full); font-size: 12px; }
 * 
 * .profilePrice { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--color-bg-tertiary); border-radius: var(--radius-md); }
 * .priceLabel { font-size: 13px; color: var(--color-text-tertiary); }
 * .priceValue { font-size: 18px; font-weight: 700; color: var(--color-text-primary); }
 * 
 * /* ── Profile Main ── * /
 * .profileMain { display: flex; flex-direction: column; gap: 24px; }
 * 
 * .tabs { display: flex; border-bottom: 2px solid var(--color-border); gap: 0; }
 * 
 * .tab {
 *   padding: 12px 24px;
 *   font-size: 14px;
 *   font-weight: 500;
 *   color: var(--color-text-tertiary);
 *   border-bottom: 2px solid transparent;
 *   margin-bottom: -2px;
 *   cursor: pointer;
 *   font-family: var(--font-body);
 *   transition: all var(--transition-fast);
 * }
 * .tab:hover { color: var(--color-text-primary); }
 * .tabActive { color: var(--color-primary); border-bottom-color: var(--color-primary); }
 * 
 * .tabContent { display: flex; flex-direction: column; gap: 28px; }
 * 
 * .section h3 {
 *   font-size: 16px;
 *   font-weight: 600;
 *   color: var(--color-text-primary);
 *   margin-bottom: 12px;
 * }
 * 
 * .bioText { font-size: 15px; line-height: 1.8; color: var(--color-text-secondary); }
 * 
 * .education {
 *   font-family: var(--font-body);
 *   font-size: 14px;
 *   color: var(--color-text-secondary);
 *   line-height: 1.7;
 *   white-space: pre-wrap;
 * }
 * 
 * .specTags { display: flex; flex-wrap: wrap; gap: 8px; }
 * .specTag { background: var(--color-primary-muted); color: var(--color-primary); padding: 5px 14px; border-radius: var(--radius-full); font-size: 13px; font-weight: 500; }
 * 
 * .reviewsList { display: flex; flex-direction: column; gap: 16px; }
 * 
 * .reviewCard {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-lg);
 *   padding: 18px;
 *   display: flex;
 *   flex-direction: column;
 *   gap: 10px;
 * }
 * 
 * .reviewHeader {
 *   display: flex;
 *   align-items: center;
 *   gap: 12px;
 * }
 * 
 * .reviewName { font-size: 14px; font-weight: 600; color: var(--color-text-primary); display: block; }
 * .reviewDate { font-size: 12px; color: var(--color-text-tertiary); }
 * 
 * .reviewStars { margin-left: auto; color: #F59E0B; font-size: 14px; letter-spacing: 1px; }
 * 
 * .reviewText { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; }
 * 
 * .noReviews { text-align: center; padding: 48px; color: var(--color-text-tertiary); }
 * 
 * .profileLoading { padding: calc(var(--nav-height) + 80px) 0; display: flex; justify-content: center; }
 * .profileSkeleton { width: 100%; max-width: 800px; height: 400px; border-radius: var(--radius-xl); }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/ChatPage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { useState, useEffect, useRef, useCallback } from 'react';
 * import { useSearchParams, useNavigate } from 'react-router-dom';
 * import { motion, AnimatePresence } from 'framer-motion';
 * import {
 *   Send, Paperclip, Phone, Video, MoreVertical,
 *   Check, CheckCheck, Search, Plus, X, ArrowLeft
 * } from 'lucide-react';
 * import { format, isToday, isYesterday } from 'date-fns';
 * import { useT } from '../i18n/useT';
 * import { useAuthStore, useChatStore } from '../store';
 * import { Chat as ChatAPI } from '../services';
 * import { USE_MOCK, MOCK_MESSAGES } from '../mockData';
 * import { createChatWebSocket } from '../api';
 * import Avatar from '../components/common/Avatar';
 * import styles from './ChatPage.module.css';
 * import toast from 'react-hot-toast';
 * 
 * // Format message time
 * function formatTime(dateStr) {
 *   const d = new Date(dateStr);
 *   if (isNaN(d)) return '';
 *   return format(d, 'HH:mm');
 * }
 * 
 * function formatDay(dateStr) {
 *   const d = new Date(dateStr);
 *   if (isToday(d)) return 'Today';
 *   if (isYesterday(d)) return 'Yesterday';
 *   return format(d, 'MMM d');
 * }
 * 
 * // Group messages by date
 * function groupByDay(messages) {
 *   const groups = {};
 *   messages.forEach(m => {
 *     const day = format(new Date(m.sentAt), 'yyyy-MM-dd');
 *     if (!groups[day]) groups[day] = [];
 *     groups[day].push(m);
 *   });
 *   return Object.entries(groups).map(([day, msgs]) => ({ day, msgs }));
 * }
 * 
 * // ─── Conversation List Item ───────────────────────────────────────────────────
 * function ConvItem({ conv, active, onClick }) {
 *   const { user } = useAuthStore();
 *   const other = user?.role === 'patient' ? conv.doctor : conv.patient;
 *   const name = user?.role === 'patient'
 *     ? `Dr. ${conv.doctor?.firstName} ${conv.doctor?.lastName}`
 *     : `${conv.patient?.firstName} ${conv.patient?.lastName}`;
 * 
 *   return (
 *     <motion.button
 *       className={[styles.convItem, active ? styles.convItemActive : ''].join(' ')}
 *       onClick={onClick}
 *       whileHover={{ x: 2 }}
 *     >
 *       <div className={styles.convAvatar}>
 *         <Avatar name={name} size="md" online={conv.status === 'active'} />
 *       </div>
 *       <div className={styles.convInfo}>
 *         <div className={styles.convTop}>
 *           <span className={styles.convName}>{name}</span>
 *           {conv.lastMessage && (
 *             <span className={styles.convTime}>{formatTime(conv.lastMessage.sentAt)}</span>
 *           )}
 *         </div>
 *         <div className={styles.convBottom}>
 *           <span className={styles.convLastMsg}>
 *             {conv.lastMessage?.text || 'Consultation started'}
 *           </span>
 *           {conv.unreadCount > 0 && (
 *             <span className={styles.unreadBadge}>{conv.unreadCount}</span>
 *           )}
 *         </div>
 *         {conv.status === 'ended' && (
 *           <span className={styles.endedChip}>Ended</span>
 *         )}
 *       </div>
 *     </motion.button>
 *   );
 * }
 * 
 * // ─── Message Bubble ───────────────────────────────────────────────────────────
 * function MessageBubble({ message, isOwn, showAvatar, partnerName }) {
 *   return (
 *     <div className={[styles.msgRow, isOwn ? styles.msgRowOwn : ''].join(' ')}>
 *       {!isOwn && showAvatar && (
 *         <Avatar name={partnerName} size="xs" />
 *       )}
 *       {!isOwn && !showAvatar && <div className={styles.avatarSpacer} />}
 *       <div className={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther].join(' ')}>
 *         {message.type === 'file' ? (
 *           <div className={styles.fileMsg}>
 *             <Paperclip size={14} />
 *             <span>{message.fileName || 'File'}</span>
 *           </div>
 *         ) : (
 *           <p>{message.text}</p>
 *         )}
 *         <div className={styles.msgMeta}>
 *           <span>{formatTime(message.sentAt)}</span>
 *           {isOwn && <CheckCheck size={12} className={styles.readIcon} />}
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // ─── Main Chat Page ───────────────────────────────────────────────────────────
 * export default function ChatPage() {
 *   const { t } = useT();
 *   const { user, token } = useAuthStore();
 *   const [searchParams] = useSearchParams();
 *   const navigate = useNavigate();
 * 
 *   const [conversations, setConversations] = useState([]);
 *   const [activeConvId, setActiveConvId] = useState(null);
 *   const [messages, setMessages] = useState([]);
 *   const [text, setText] = useState('');
 *   const [loading, setLoading] = useState(true);
 *   const [sending, setSending] = useState(false);
 *   const [typing, setTyping] = useState(false);
 *   const [convSearch, setConvSearch] = useState('');
 *   const [showSidebar, setShowSidebar] = useState(true);
 * 
 *   const wsRef = useRef(null);
 *   const bottomRef = useRef(null);
 *   const typingTimerRef = useRef(null);
 *   const inputRef = useRef(null);
 * 
 *   const activeConv = conversations.find(c => c.id === activeConvId);
 *   const partnerName = user?.role === 'patient'
 *     ? `Dr. ${activeConv?.doctor?.firstName} ${activeConv?.doctor?.lastName}`
 *     : `${activeConv?.patient?.firstName} ${activeConv?.patient?.lastName}`;
 * 
 *   // Load conversations
 *   useEffect(() => {
 *     ChatAPI.getConversations().then(res => {
 *       const convs = res.data;
 *       setConversations(convs);
 *       // Open conversation from URL param
 *       const paramId = searchParams.get('conversation');
 *       if (paramId) {
 *         const id = parseInt(paramId);
 *         setActiveConvId(id);
 *       } else if (convs.length > 0) {
 *         setActiveConvId(convs[0].id);
 *       }
 *     }).catch(() => toast.error('Failed to load conversations'))
 *     .finally(() => setLoading(false));
 *   }, []);
 * 
 *   // Load messages when active conversation changes
 *   useEffect(() => {
 *     if (!activeConvId) return;
 *     setMessages([]);
 *     setLoading(true);
 * 
 *     if (USE_MOCK) {
 *       // Simulate loading mock messages
 *       setTimeout(() => {
 *         setMessages(MOCK_MESSAGES[activeConvId] || []);
 *         setLoading(false);
 *       }, 400);
 *     } else {
 *       ChatAPI.getMessages(activeConvId)
 *         .then(res => setMessages(res.data.results || res.data))
 *         .catch(() => toast.error('Failed to load messages'))
 *         .finally(() => setLoading(false));
 *     }
 * 
 *     // Close previous WS
 *     if (wsRef.current) {
 *       wsRef.current.close();
 *       wsRef.current = null;
 *     }
 * 
 *     // Open WebSocket (only when not mocking)
 *     if (!USE_MOCK && token) {
 *       const ws = createChatWebSocket(activeConvId, token);
 *       wsRef.current = ws;
 * 
 *       ws.onmessage = (event) => {
 *         const data = JSON.parse(event.data);
 *         if (data.type === 'chat_message') {
 *           const msg = {
 *             id: Date.now(),
 *             conversationId: activeConvId,
 *             senderId: data.sender_id,
 *             text: data.message,
 *             type: 'text',
 *             sentAt: new Date().toISOString(),
 *           };
 *           setMessages(prev => [...prev, msg]);
 *           // Update conversation last message
 *           setConversations(prev => prev.map(c =>
 *             c.id === activeConvId ? { ...c, lastMessage: msg } : c
 *           ));
 *         }
 *         if (data.type === 'typing') {
 *           if (data.sender_id !== user.id) {
 *             setTyping(true);
 *             clearTimeout(typingTimerRef.current);
 *             typingTimerRef.current = setTimeout(() => setTyping(false), 3000);
 *           }
 *         }
 *       };
 * 
 *       ws.onerror = () => toast.error('Connection error');
 *     }
 * 
 *     return () => {
 *       if (wsRef.current) {
 *         wsRef.current.close();
 *         wsRef.current = null;
 *       }
 *     };
 *   }, [activeConvId, token]);
 * 
 *   // Auto scroll to bottom
 *   useEffect(() => {
 *     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
 *   }, [messages, typing]);
 * 
 *   const handleSend = async () => {
 *     if (!text.trim() || !activeConvId || sending) return;
 * 
 *     const msgText = text.trim();
 *     setText('');
 * 
 *     // Optimistic message
 *     const optimistic = {
 *       id: Date.now(),
 *       conversationId: activeConvId,
 *       senderId: user.id,
 *       text: msgText,
 *       type: 'text',
 *       sentAt: new Date().toISOString(),
 *     };
 *     setMessages(prev => [...prev, optimistic]);
 *     setConversations(prev => prev.map(c =>
 *       c.id === activeConvId ? { ...c, lastMessage: optimistic } : c
 *     ));
 * 
 *     if (USE_MOCK) {
 *       // Mock: simulate doctor response after delay
 *       setTimeout(() => {
 *         const responses = [
 *           "Thank you for sharing that. Can you tell me more?",
 *           "I understand. How long have you been experiencing this?",
 *           "That's helpful information. I'll note that in your record.",
 *           "Based on what you've described, I recommend we run some tests.",
 *           "Please don't worry — this is very common and treatable.",
 *         ];
 *         const reply = {
 *           id: Date.now() + 1,
 *           conversationId: activeConvId,
 *           senderId: activeConv?.doctor?.userId || 2,
 *           text: responses[Math.floor(Math.random() * responses.length)],
 *           type: 'text',
 *           sentAt: new Date().toISOString(),
 *         };
 *         setTyping(false);
 *         setMessages(prev => [...prev, reply]);
 *         setConversations(prev => prev.map(c =>
 *           c.id === activeConvId ? { ...c, lastMessage: reply } : c
 *         ));
 *       }, 1200);
 * 
 *       // Show typing
 *       setTimeout(() => setTyping(true), 300);
 *       setTimeout(() => setTyping(false), 1150);
 *       return;
 *     }
 * 
 *     if (wsRef.current?.readyState === WebSocket.OPEN) {
 *       wsRef.current.send(JSON.stringify({ type: 'chat_message', message: msgText }));
 *     }
 *   };
 * 
 *   const handleKeyDown = (e) => {
 *     if (e.key === 'Enter' && !e.shiftKey) {
 *       e.preventDefault();
 *       handleSend();
 *     }
 *   };
 * 
 *   const handleInputChange = (e) => {
 *     setText(e.target.value);
 *     // Send typing indicator
 *     if (!USE_MOCK && wsRef.current?.readyState === WebSocket.OPEN) {
 *       wsRef.current.send(JSON.stringify({ type: 'typing' }));
 *     }
 *   };
 * 
 *   const filteredConvs = conversations.filter(c => {
 *     const name = user?.role === 'patient'
 *       ? `${c.doctor?.firstName} ${c.doctor?.lastName}`
 *       : `${c.patient?.firstName} ${c.patient?.lastName}`;
 *     return name.toLowerCase().includes(convSearch.toLowerCase());
 *   });
 * 
 *   const grouped = groupByDay(messages);
 * 
 *   return (
 *     <div className={styles.page}>
 *       {/* ── Conversation Sidebar ── * /}
 *       <aside className={[styles.sidebar, showSidebar ? styles.sidebarVisible : ''].join(' ')}>
 *         <div className={styles.sidebarHeader}>
 *           <h2 className={styles.sidebarTitle}>{t.chat.title}</h2>
 *           <button onClick={() => navigate('/doctors')} className={styles.newChatBtn} title={t.chat.newConsultation}>
 *             <Plus size={18} />
 *           </button>
 *         </div>
 *         <div className={styles.convSearch}>
 *           <Search size={15} className={styles.convSearchIcon} />
 *           <input
 *             placeholder="Search..."
 *             value={convSearch}
 *             onChange={e => setConvSearch(e.target.value)}
 *             className={styles.convSearchInput}
 *           />
 *         </div>
 *         <div className={styles.convList}>
 *           {filteredConvs.length === 0 && !loading && (
 *             <div className={styles.noConvs}>
 *               <p>No conversations yet.</p>
 *               <button onClick={() => navigate('/doctors')} className={styles.findDoctorBtn}>Find a Doctor</button>
 *             </div>
 *           )}
 *           {filteredConvs.map(conv => (
 *             <ConvItem
 *               key={conv.id}
 *               conv={conv}
 *               active={conv.id === activeConvId}
 *               onClick={() => { setActiveConvId(conv.id); setShowSidebar(false); }}
 *             />
 *           ))}
 *         </div>
 *       </aside>
 * 
 *       {/* ── Chat Area ── * /}
 *       <main className={styles.chatArea}>
 *         {!activeConvId ? (
 *           <div className={styles.emptyChat}>
 *             <div className={styles.emptyChatIcon}>💬</div>
 *             <h3>{t.chat.noConversation}</h3>
 *             <p>Start a consultation by finding a doctor.</p>
 *           </div>
 *         ) : (
 *           <>
 *             {/* Chat Header * /}
 *             <div className={styles.chatHeader}>
 *               <button className={styles.backToList} onClick={() => setShowSidebar(true)}>
 *                 <ArrowLeft size={18} />
 *               </button>
 *               <Avatar name={partnerName} size="md" online={activeConv?.status === 'active'} />
 *               <div className={styles.chatHeaderInfo}>
 *                 <h3>{partnerName}</h3>
 *                 <span className={styles.chatStatus}>
 *                   {activeConv?.status === 'active'
 *                     ? (typing ? t.chat.typing : t.chat.online)
 *                     : t.chat.offline
 *                   }
 *                 </span>
 *               </div>
 *               <div className={styles.chatHeaderActions}>
 *                 <button className={styles.headerAction}><Phone size={18} /></button>
 *                 <button className={styles.headerAction}><Video size={18} /></button>
 *                 <button className={styles.headerAction}><MoreVertical size={18} /></button>
 *               </div>
 *             </div>
 * 
 *             {/* Messages * /}
 *             <div className={styles.messages}>
 *               {loading ? (
 *                 <div className={styles.msgLoading}>
 *                   {[1,2,3,4].map(i => (
 *                     <div key={i} className={[styles.msgSkeleton, i % 2 === 0 ? styles.msgSkeletonRight : ''].join(' ')} />
 *                   ))}
 *                 </div>
 *               ) : (
 *                 grouped.map(({ day, msgs }) => (
 *                   <div key={day}>
 *                     <div className={styles.dayDivider}>
 *                       <span>{formatDay(msgs[0].sentAt)}</span>
 *                     </div>
 *                     {msgs.map((msg, i) => {
 *                       const isOwn = msg.senderId === user.id;
 *                       const showAvatar = !isOwn && (i === 0 || msgs[i-1].senderId !== msg.senderId);
 *                       return (
 *                         <MessageBubble
 *                           key={msg.id}
 *                           message={msg}
 *                           isOwn={isOwn}
 *                           showAvatar={showAvatar}
 *                           partnerName={partnerName}
 *                         />
 *                       );
 *                     })}
 *                   </div>
 *                 ))
 *               )}
 * 
 *               {/* Typing indicator * /}
 *               <AnimatePresence>
 *                 {typing && (
 *                   <motion.div
 *                     className={styles.typingRow}
 *                     initial={{ opacity: 0, y: 8 }}
 *                     animate={{ opacity: 1, y: 0 }}
 *                     exit={{ opacity: 0, y: 8 }}
 *                   >
 *                     <Avatar name={partnerName} size="xs" />
 *                     <div className={styles.typingBubble}>
 *                       <span className={styles.typingDot} />
 *                       <span className={styles.typingDot} />
 *                       <span className={styles.typingDot} />
 *                     </div>
 *                   </motion.div>
 *                 )}
 *               </AnimatePresence>
 * 
 *               {activeConv?.status === 'ended' && (
 *                 <div className={styles.endedBanner}>{t.chat.consultationEnded}</div>
 *               )}
 * 
 *               <div ref={bottomRef} />
 *             </div>
 * 
 *             {/* Input * /}
 *             {activeConv?.status !== 'ended' && (
 *               <div className={styles.inputArea}>
 *                 <button className={styles.attachBtn} title={t.chat.attachFile}>
 *                   <Paperclip size={18} />
 *                 </button>
 *                 <div className={styles.textInputWrap}>
 *                   <textarea
 *                     ref={inputRef}
 *                     className={styles.textInput}
 *                     placeholder={t.chat.messagePlaceholder}
 *                     value={text}
 *                     onChange={handleInputChange}
 *                     onKeyDown={handleKeyDown}
 *                     rows={1}
 *                   />
 *                 </div>
 *                 <motion.button
 *                   className={[styles.sendBtn, text.trim() ? styles.sendBtnActive : ''].join(' ')}
 *                   onClick={handleSend}
 *                   disabled={!text.trim()}
 *                   whileTap={{ scale: 0.9 }}
 *                 >
 *                   <Send size={18} />
 *                 </motion.button>
 *               </div>
 *             )}
 *           </>
 *         )}
 *       </main>
 *     </div>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/ChatPage.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * .page {
 *   display: grid;
 *   grid-template-columns: 320px 1fr;
 *   height: calc(100vh - var(--nav-height));
 *   margin-top: var(--nav-height);
 *   background: var(--color-bg);
 *   overflow: hidden;
 * }
 * 
 * @media (max-width: 768px) {
 *   .page { grid-template-columns: 1fr; }
 *   .sidebar { position: absolute; z-index: 50; inset: 0; top: var(--nav-height); display: none; }
 *   .sidebarVisible { display: flex !important; }
 * }
 * 
 * /* ── Sidebar ── * /
 * .sidebar {
 *   background: var(--color-surface);
 *   border-right: 1px solid var(--color-border);
 *   display: flex;
 *   flex-direction: column;
 *   overflow: hidden;
 * }
 * 
 * .sidebarHeader {
 *   display: flex;
 *   align-items: center;
 *   justify-content: space-between;
 *   padding: 20px 16px 12px;
 *   border-bottom: 1px solid var(--color-border);
 *   flex-shrink: 0;
 * }
 * 
 * .sidebarTitle {
 *   font-size: 18px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 *   font-family: var(--font-display);
 * }
 * 
 * .newChatBtn {
 *   width: 36px;
 *   height: 36px;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   background: var(--color-primary);
 *   color: white;
 *   border-radius: var(--radius-md);
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 * }
 * .newChatBtn:hover { background: var(--color-primary-light); transform: scale(1.05); }
 * 
 * .convSearch {
 *   display: flex;
 *   align-items: center;
 *   gap: 8px;
 *   padding: 10px 12px;
 *   margin: 8px 12px;
 *   background: var(--color-bg-tertiary);
 *   border-radius: var(--radius-md);
 *   flex-shrink: 0;
 * }
 * 
 * .convSearchIcon { color: var(--color-text-tertiary); flex-shrink: 0; }
 * 
 * .convSearchInput {
 *   flex: 1;
 *   border: none;
 *   outline: none;
 *   background: transparent;
 *   font-size: 13px;
 *   color: var(--color-text-primary);
 *   font-family: var(--font-body);
 * }
 * .convSearchInput::placeholder { color: var(--color-text-tertiary); }
 * 
 * .convList {
 *   flex: 1;
 *   overflow-y: auto;
 *   padding: 4px 0;
 * }
 * 
 * .convItem {
 *   display: flex;
 *   align-items: center;
 *   gap: 12px;
 *   padding: 12px 16px;
 *   width: 100%;
 *   text-align: left;
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 *   border-radius: 0;
 *   font-family: var(--font-body);
 *   border-bottom: 1px solid var(--color-border);
 * }
 * 
 * .convItem:hover { background: var(--color-bg-tertiary); }
 * .convItemActive { background: var(--color-primary-muted) !important; }
 * 
 * .convAvatar { flex-shrink: 0; }
 * 
 * .convInfo { flex: 1; min-width: 0; }
 * 
 * .convTop {
 *   display: flex;
 *   align-items: center;
 *   justify-content: space-between;
 *   margin-bottom: 3px;
 * }
 * 
 * .convName {
 *   font-size: 14px;
 *   font-weight: 600;
 *   color: var(--color-text-primary);
 *   white-space: nowrap;
 *   overflow: hidden;
 *   text-overflow: ellipsis;
 * }
 * 
 * .convTime {
 *   font-size: 11px;
 *   color: var(--color-text-tertiary);
 *   flex-shrink: 0;
 * }
 * 
 * .convBottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
 * 
 * .convLastMsg {
 *   font-size: 13px;
 *   color: var(--color-text-tertiary);
 *   white-space: nowrap;
 *   overflow: hidden;
 *   text-overflow: ellipsis;
 *   flex: 1;
 * }
 * 
 * .unreadBadge {
 *   background: var(--color-primary);
 *   color: white;
 *   border-radius: var(--radius-full);
 *   font-size: 11px;
 *   font-weight: 600;
 *   min-width: 20px;
 *   height: 20px;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   padding: 0 5px;
 *   flex-shrink: 0;
 * }
 * 
 * .endedChip {
 *   font-size: 11px;
 *   background: var(--color-bg-tertiary);
 *   color: var(--color-text-tertiary);
 *   padding: 2px 7px;
 *   border-radius: var(--radius-full);
 * }
 * 
 * .noConvs {
 *   padding: 40px 20px;
 *   text-align: center;
 *   color: var(--color-text-tertiary);
 *   font-size: 14px;
 *   display: flex;
 *   flex-direction: column;
 *   gap: 12px;
 *   align-items: center;
 * }
 * 
 * .findDoctorBtn {
 *   background: var(--color-primary);
 *   color: white;
 *   padding: 8px 18px;
 *   border-radius: var(--radius-md);
 *   font-size: 13px;
 *   font-weight: 500;
 *   cursor: pointer;
 *   font-family: var(--font-body);
 *   transition: background var(--transition-fast);
 * }
 * .findDoctorBtn:hover { background: var(--color-primary-light); }
 * 
 * /* ── Chat Area ── * /
 * .chatArea {
 *   display: flex;
 *   flex-direction: column;
 *   overflow: hidden;
 *   background: var(--color-bg);
 * }
 * 
 * .emptyChat {
 *   flex: 1;
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   justify-content: center;
 *   gap: 12px;
 *   color: var(--color-text-tertiary);
 * }
 * .emptyChatIcon { font-size: 56px; }
 * .emptyChat h3 { font-size: 18px; color: var(--color-text-secondary); }
 * .emptyChat p { font-size: 14px; }
 * 
 * /* ── Chat Header ── * /
 * .chatHeader {
 *   display: flex;
 *   align-items: center;
 *   gap: 12px;
 *   padding: 14px 20px;
 *   background: var(--color-surface);
 *   border-bottom: 1px solid var(--color-border);
 *   flex-shrink: 0;
 *   box-shadow: var(--shadow-sm);
 * }
 * 
 * .backToList {
 *   display: none;
 *   align-items: center;
 *   justify-content: center;
 *   width: 36px;
 *   height: 36px;
 *   border-radius: var(--radius-md);
 *   color: var(--color-text-secondary);
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 * }
 * .backToList:hover { background: var(--color-bg-tertiary); }
 * @media (max-width: 768px) { .backToList { display: flex; } }
 * 
 * .chatHeaderInfo { flex: 1; min-width: 0; }
 * .chatHeaderInfo h3 { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
 * .chatStatus { font-size: 12px; color: var(--color-success); }
 * 
 * .chatHeaderActions { display: flex; gap: 4px; }
 * .headerAction {
 *   width: 38px;
 *   height: 38px;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   border-radius: var(--radius-md);
 *   color: var(--color-text-tertiary);
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 * }
 * .headerAction:hover { background: var(--color-bg-tertiary); color: var(--color-text-primary); }
 * 
 * /* ── Messages ── * /
 * .messages {
 *   flex: 1;
 *   overflow-y: auto;
 *   padding: 20px;
 *   display: flex;
 *   flex-direction: column;
 *   gap: 4px;
 * }
 * 
 * .dayDivider {
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   margin: 16px 0 12px;
 * }
 * .dayDivider span {
 *   background: var(--color-bg-tertiary);
 *   border: 1px solid var(--color-border);
 *   color: var(--color-text-tertiary);
 *   font-size: 11px;
 *   padding: 4px 12px;
 *   border-radius: var(--radius-full);
 * }
 * 
 * .msgRow { display: flex; align-items: flex-end; gap: 7px; margin-bottom: 3px; }
 * .msgRowOwn { flex-direction: row-reverse; }
 * .avatarSpacer { width: 24px; flex-shrink: 0; }
 * 
 * .bubble {
 *   max-width: min(480px, 70%);
 *   padding: 9px 14px;
 *   border-radius: 18px;
 *   position: relative;
 *   word-break: break-word;
 * }
 * 
 * .bubble p { font-size: 14px; line-height: 1.5; margin: 0; }
 * 
 * .bubbleOther {
 *   background: var(--color-surface);
 *   color: var(--color-text-primary);
 *   border: 1px solid var(--color-border);
 *   border-bottom-left-radius: 4px;
 *   box-shadow: var(--shadow-sm);
 * }
 * 
 * .bubbleOwn {
 *   background: var(--color-primary);
 *   color: white;
 *   border-bottom-right-radius: 4px;
 * }
 * 
 * .msgMeta {
 *   display: flex;
 *   align-items: center;
 *   gap: 4px;
 *   margin-top: 4px;
 *   justify-content: flex-end;
 * }
 * .msgMeta span { font-size: 10px; opacity: 0.65; }
 * .readIcon { opacity: 0.7; }
 * 
 * .fileMsg {
 *   display: flex;
 *   align-items: center;
 *   gap: 8px;
 *   font-size: 13px;
 *   padding: 4px 0;
 * }
 * 
 * /* Typing indicator * /
 * .typingRow { display: flex; align-items: flex-end; gap: 7px; margin-bottom: 4px; }
 * 
 * .typingBubble {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: 18px 18px 18px 4px;
 *   padding: 12px 16px;
 *   display: flex;
 *   gap: 4px;
 *   align-items: center;
 *   box-shadow: var(--shadow-sm);
 * }
 * 
 * .typingDot {
 *   width: 7px;
 *   height: 7px;
 *   border-radius: 50%;
 *   background: var(--color-text-tertiary);
 *   animation: bounce 1.2s ease-in-out infinite;
 * }
 * .typingDot:nth-child(2) { animation-delay: 0.2s; }
 * .typingDot:nth-child(3) { animation-delay: 0.4s; }
 * 
 * @keyframes bounce {
 *   0%, 80%, 100% { transform: translateY(0); }
 *   40% { transform: translateY(-5px); }
 * }
 * 
 * .endedBanner {
 *   text-align: center;
 *   padding: 10px 20px;
 *   background: var(--color-bg-tertiary);
 *   border-radius: var(--radius-full);
 *   font-size: 13px;
 *   color: var(--color-text-tertiary);
 *   margin: 10px auto;
 *   border: 1px solid var(--color-border);
 * }
 * 
 * /* Skeleton loading * /
 * .msgLoading { display: flex; flex-direction: column; gap: 12px; }
 * .msgSkeleton { height: 44px; border-radius: 18px; background: var(--color-bg-tertiary); width: 60%; animation: shimmer 1.5s infinite; background-size: 200% 100%; background-image: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-border) 50%, var(--color-bg-tertiary) 75%); }
 * .msgSkeletonRight { align-self: flex-end; }
 * 
 * /* ── Input Area ── * /
 * .inputArea {
 *   display: flex;
 *   align-items: flex-end;
 *   gap: 10px;
 *   padding: 14px 16px;
 *   background: var(--color-surface);
 *   border-top: 1px solid var(--color-border);
 *   flex-shrink: 0;
 * }
 * 
 * .attachBtn {
 *   width: 40px;
 *   height: 40px;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   border-radius: var(--radius-md);
 *   color: var(--color-text-tertiary);
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 *   flex-shrink: 0;
 * }
 * .attachBtn:hover { background: var(--color-bg-tertiary); color: var(--color-text-primary); }
 * 
 * .textInputWrap {
 *   flex: 1;
 *   background: var(--color-bg-tertiary);
 *   border: 1.5px solid var(--color-border);
 *   border-radius: var(--radius-lg);
 *   padding: 10px 14px;
 *   transition: border-color var(--transition-fast);
 * }
 * .textInputWrap:focus-within { border-color: var(--color-primary); }
 * 
 * .textInput {
 *   width: 100%;
 *   border: none;
 *   outline: none;
 *   background: transparent;
 *   color: var(--color-text-primary);
 *   font-size: 14px;
 *   font-family: var(--font-body);
 *   resize: none;
 *   max-height: 120px;
 *   line-height: 1.5;
 * }
 * .textInput::placeholder { color: var(--color-text-tertiary); }
 * 
 * .sendBtn {
 *   width: 44px;
 *   height: 44px;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   border-radius: var(--radius-md);
 *   background: var(--color-bg-tertiary);
 *   color: var(--color-text-tertiary);
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 *   flex-shrink: 0;
 * }
 * 
 * .sendBtnActive {
 *   background: var(--color-primary);
 *   color: white;
 *   box-shadow: var(--shadow-primary);
 * }
 * .sendBtnActive:hover { background: var(--color-primary-light); }
 * 
 * @keyframes shimmer {
 *   0% { background-position: -200% 0; }
 *   100% { background-position: 200% 0; }
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/AIPage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { useState, useRef, useEffect } from 'react';
 * import { motion, AnimatePresence } from 'framer-motion';
 * import { Send, Mic, MicOff, Volume2, VolumeX, Plus, Trash2, Image, AlertCircle } from 'lucide-react';
 * import { useT } from '../i18n/useT';
 * import { useAIStore } from '../store';
 * import Button from '../components/common/Button';
 * import styles from './AIPage.module.css';
 * 
 * // ─── Mock AI Response Generator ───────────────────────────────────────────────
 * const MOCK_RESPONSES = {
 *   headache: "Based on your description, there are several possible causes for your headache:\n\n**Tension headache** — the most common type, often caused by stress, poor posture, or eye strain.\n\n**Dehydration** — even mild dehydration can cause headaches. Try drinking 2-3 glasses of water.\n\n**Recommendation:** Rest in a quiet, dark room, apply a cold compress, and take an OTC pain reliever if needed. If the headache is severe, sudden, or accompanied by fever/vision changes, please see a doctor immediately.\n\n⚠️ *This is general information only. Please consult a doctor for proper diagnosis.*",
 *   cold: "Common cold symptoms typically include:\n\n• Runny or stuffy nose\n• Sore throat\n• Cough\n• Mild headache\n• Low-grade fever (usually below 38.5°C)\n• Sneezing\n• Fatigue\n\n**Treatment:** Rest, fluids, and OTC cold medicines can help manage symptoms. Most colds resolve within 7-10 days.\n\n⚠️ *See a doctor if symptoms worsen or persist beyond 10 days.*",
 *   pressure: "Managing high blood pressure (hypertension) involves several strategies:\n\n1. **Diet** — Reduce sodium, eat more fruits, vegetables, and whole grains (DASH diet)\n2. **Exercise** — 150 minutes of moderate activity per week\n3. **Weight management** — Even 5-10 lbs loss can lower BP significantly\n4. **Limit alcohol** and **quit smoking**\n5. **Stress management** — Meditation, yoga, deep breathing\n6. **Medication** — If prescribed, take consistently\n\nRegular monitoring at home is important. Target: below 130/80 mmHg.\n\n⚠️ *Always follow your doctor's specific advice for your situation.*",
 *   vitamins: "Essential daily vitamins and minerals for general health:\n\n**For most adults:**\n• **Vitamin D** (1000-2000 IU) — Most people are deficient\n• **Vitamin B12** (2.4 mcg) — Especially important for vegetarians\n• **Magnesium** (310-420 mg) — Supports 300+ body functions\n• **Omega-3 fatty acids** — Heart and brain health\n• **Vitamin C** (75-90 mg) — Immune support\n\n**Best source:** A balanced diet with varied whole foods. Supplements should complement, not replace, good nutrition.\n\n⚠️ *Consult your doctor before starting any supplement regimen, especially if you take medications.*",
 *   default: "Thank you for your question. As an AI health assistant, I can provide general health information, but please remember that this is not a substitute for professional medical advice.\n\nBased on what you've described, I'd recommend:\n\n1. **Monitor your symptoms** carefully and note any changes\n2. **Stay hydrated** and get adequate rest\n3. **Consult a doctor** if symptoms persist or worsen\n4. **Avoid self-medicating** without professional guidance\n\nFor a proper diagnosis and personalized treatment plan, I encourage you to book a consultation with one of our qualified doctors on the Healzy platform.\n\n⚠️ *This information is for educational purposes only and does not constitute medical advice.*",
 * };
 * 
 * async function getMockResponse(text) {
 *   await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
 *   const lower = text.toLowerCase();
 *   if (lower.includes('headache') || lower.includes('голова') || lower.includes('bosh')) return MOCK_RESPONSES.headache;
 *   if (lower.includes('cold') || lower.includes('flu') || lower.includes('простуд') || lower.includes('shamollash')) return MOCK_RESPONSES.cold;
 *   if (lower.includes('pressure') || lower.includes('hypertension') || lower.includes('давлени') || lower.includes('bosim')) return MOCK_RESPONSES.pressure;
 *   if (lower.includes('vitamin') || lower.includes('витамин')) return MOCK_RESPONSES.vitamins;
 *   return MOCK_RESPONSES.default;
 * }
 * 
 * // ─── Markdown-ish renderer ─────────────────────────────────────────────────────
 * function MessageText({ text }) {
 *   const lines = text.split('\n');
 *   return (
 *     <div className={styles.msgText}>
 *       {lines.map((line, i) => {
 *         if (!line.trim()) return <br key={i} />;
 *         const bold = line.replace(/\*\*(.*?)\*\* /g, '<strong>$1</strong>');
 *         if (line.startsWith('• ') || line.startsWith('- ')) {
 *           return <li key={i} dangerouslySetInnerHTML={{ __html: bold.slice(2) }} />;
 *         }
 *         if (/^\d+\./.test(line)) {
 *           return <li key={i} dangerouslySetInnerHTML={{ __html: bold.replace(/^\d+\.\s/, '') }} />;
 *         }
 *         return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} />;
 *       })}
 *     </div>
 *   );
 * }
 * 
 * // ─── Main AI Page ─────────────────────────────────────────────────────────────
 * export default function AIPage() {
 *   const { t } = useT();
 *   const { dialogues, activeDialogueId, isLoading, createDialogue, addMessage, setActiveDialogue, setLoading } = useAIStore();
 * 
 *   const [text, setText] = useState('');
 *   const [isRecording, setIsRecording] = useState(false);
 *   const [isSpeaking, setIsSpeaking] = useState(false);
 *   const [voiceEnabled, setVoiceEnabled] = useState(false);
 *   const [imageFile, setImageFile] = useState(null);
 * 
 *   const bottomRef = useRef(null);
 *   const textareaRef = useRef(null);
 *   const recognitionRef = useRef(null);
 *   const fileInputRef = useRef(null);
 * 
 *   const activeDialogue = dialogues.find(d => d.id === activeDialogueId);
 * 
 *   // Auto scroll
 *   useEffect(() => {
 *     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
 *   }, [activeDialogue?.messages]);
 * 
 *   // Voice Recognition setup
 *   useEffect(() => {
 *     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 *     if (SpeechRecognition) {
 *       recognitionRef.current = new SpeechRecognition();
 *       recognitionRef.current.continuous = false;
 *       recognitionRef.current.interimResults = false;
 * 
 *       recognitionRef.current.onresult = (event) => {
 *         const transcript = event.results[0][0].transcript;
 *         setText(prev => prev + (prev ? ' ' : '') + transcript);
 *         setIsRecording(false);
 *       };
 * 
 *       recognitionRef.current.onerror = () => {
 *         setIsRecording(false);
 *       };
 * 
 *       recognitionRef.current.onend = () => {
 *         setIsRecording(false);
 *       };
 *     }
 *   }, []);
 * 
 *   const startNewDialogue = () => {
 *     const newDialogue = {
 *       id: Date.now(),
 *       title: 'New consultation',
 *       createdAt: new Date().toISOString(),
 *       messages: [],
 *     };
 *     createDialogue(newDialogue);
 *   };
 * 
 *   const handleSend = async () => {
 *     if ((!text.trim() && !imageFile) || isLoading) return;
 * 
 *     let dialogue = activeDialogue;
 *     if (!dialogue) {
 *       const newDialogue = {
 *         id: Date.now(),
 *         title: text.slice(0, 40) || 'Image consultation',
 *         createdAt: new Date().toISOString(),
 *         messages: [],
 *       };
 *       createDialogue(newDialogue);
 *       dialogue = newDialogue;
 *     }
 * 
 *     const userMsg = {
 *       id: Date.now(),
 *       role: 'user',
 *       text: text.trim(),
 *       imageFile: imageFile ? URL.createObjectURL(imageFile) : null,
 *       sentAt: new Date().toISOString(),
 *     };
 * 
 *     addMessage(dialogue.id, userMsg);
 *     setText('');
 *     setImageFile(null);
 *     setLoading(true);
 * 
 *     try {
 *       // Use mock response; swap getMockResponse for real API call when backend ready
 *       const responseText = await getMockResponse(userMsg.text);
 * 
 *       const aiMsg = {
 *         id: Date.now() + 1,
 *         role: 'assistant',
 *         text: responseText,
 *         sentAt: new Date().toISOString(),
 *       };
 *       addMessage(dialogue.id, aiMsg);
 * 
 *       // TTS
 *       if (voiceEnabled && 'speechSynthesis' in window) {
 *         const utterance = new SpeechSynthesisUtterance(
 *           responseText.replace(/\*\*(.*?)\*\* /g, '$1').replace(/[•⚠️]/g, '').trim()
 *         );
 *         utterance.rate = 0.9;
 *         utterance.onstart = () => setIsSpeaking(true);
 *         utterance.onend = () => setIsSpeaking(false);
 *         window.speechSynthesis.speak(utterance);
 *       }
 *     } catch {
 *       addMessage(dialogue.id, {
 *         id: Date.now() + 1,
 *         role: 'assistant',
 *         text: t.ai.errorMessage,
 *         sentAt: new Date().toISOString(),
 *         isError: true,
 *       });
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 * 
 *   const handleKeyDown = (e) => {
 *     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
 *   };
 * 
 *   const toggleRecording = () => {
 *     if (!recognitionRef.current) {
 *       alert('Voice recognition not supported in your browser. Try Chrome.');
 *       return;
 *     }
 *     if (isRecording) {
 *       recognitionRef.current.stop();
 *       setIsRecording(false);
 *     } else {
 *       recognitionRef.current.start();
 *       setIsRecording(true);
 *     }
 *   };
 * 
 *   const stopSpeaking = () => {
 *     window.speechSynthesis?.cancel();
 *     setIsSpeaking(false);
 *   };
 * 
 *   const messages = activeDialogue?.messages || [];
 * 
 *   return (
 *     <div className={styles.page}>
 *       {/* ── Left sidebar - history ── * /}
 *       <aside className={styles.sidebar}>
 *         <div className={styles.sidebarHeader}>
 *           <h2>{t.ai.history}</h2>
 *           <button className={styles.newChatBtn} onClick={startNewDialogue}>
 *             <Plus size={16} />
 *             {t.ai.newChat}
 *           </button>
 *         </div>
 *         <div className={styles.dialogueList}>
 *           {dialogues.length === 0 && (
 *             <div className={styles.noDialogues}>Start your first AI health conversation</div>
 *           )}
 *           {dialogues.map(d => (
 *             <button
 *               key={d.id}
 *               className={[styles.dialogueItem, d.id === activeDialogueId ? styles.dialogueActive : ''].join(' ')}
 *               onClick={() => setActiveDialogue(d.id)}
 *             >
 *               <span className={styles.dialogueTitle}>{d.title}</span>
 *               <span className={styles.dialogueDate}>{new Date(d.createdAt).toLocaleDateString()}</span>
 *             </button>
 *           ))}
 *         </div>
 *       </aside>
 * 
 *       {/* ── Main chat ── * /}
 *       <main className={styles.main}>
 *         {/* Header * /}
 *         <div className={styles.header}>
 *           <div className={styles.headerLeft}>
 *             <div className={styles.aiLogo}>
 *               <span>✦</span>
 *             </div>
 *             <div>
 *               <h1 className={styles.headerTitle}>{t.ai.title}</h1>
 *               <p className={styles.headerSub}>{t.ai.subtitle}</p>
 *             </div>
 *           </div>
 *           <div className={styles.headerActions}>
 *             <button
 *               className={[styles.voiceToggle, voiceEnabled ? styles.voiceToggleOn : ''].join(' ')}
 *               onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) stopSpeaking(); }}
 *               title="Toggle voice responses"
 *             >
 *               {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
 *               {voiceEnabled ? 'Voice On' : 'Voice Off'}
 *             </button>
 *           </div>
 *         </div>
 * 
 *         {/* Messages * /}
 *         <div className={styles.messages}>
 *           {messages.length === 0 ? (
 *             <div className={styles.welcome}>
 *               <motion.div className={styles.welcomeIcon} animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
 *                 🏥
 *               </motion.div>
 *               <h2>How can I help you today?</h2>
 *               <p className={styles.welcomeDesc}>{t.ai.subtitle}</p>
 * 
 *               {/* Quick suggestions * /}
 *               <div className={styles.suggestions}>
 *                 <p className={styles.suggestLabel}>{t.ai.suggestions.title}</p>
 *                 <div className={styles.suggestGrid}>
 *                   {t.ai.suggestions.items.map((item, i) => (
 *                     <button key={i} className={styles.suggestBtn} onClick={() => setText(item)}>
 *                       {item}
 *                     </button>
 *                   ))}
 *                 </div>
 *               </div>
 *             </div>
 *           ) : (
 *             messages.map((msg, i) => (
 *               <motion.div
 *                 key={msg.id}
 *                 className={[styles.msgRow, msg.role === 'user' ? styles.msgUser : styles.msgAI].join(' ')}
 *                 initial={{ opacity: 0, y: 12 }}
 *                 animate={{ opacity: 1, y: 0 }}
 *                 transition={{ duration: 0.3 }}
 *               >
 *                 {msg.role === 'assistant' && (
 *                   <div className={styles.aiAvatar}><span>✦</span></div>
 *                 )}
 *                 <div className={[styles.bubble, msg.isError ? styles.bubbleError : ''].join(' ')}>
 *                   {msg.imageFile && (
 *                     <img src={msg.imageFile} alt="Uploaded" className={styles.uploadedImg} />
 *                   )}
 *                   {msg.role === 'user' ? (
 *                     <p>{msg.text}</p>
 *                   ) : (
 *                     <MessageText text={msg.text} />
 *                   )}
 *                   <span className={styles.time}>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
 *                 </div>
 *               </motion.div>
 *             ))
 *           )}
 * 
 *           {/* Loading * /}
 *           <AnimatePresence>
 *             {isLoading && (
 *               <motion.div className={[styles.msgRow, styles.msgAI].join(' ')}
 *                 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
 *                 <div className={styles.aiAvatar}><span>✦</span></div>
 *                 <div className={styles.thinkingBubble}>
 *                   <span className={styles.thinkingDot} />
 *                   <span className={styles.thinkingDot} />
 *                   <span className={styles.thinkingDot} />
 *                   <span className={styles.thinkingLabel}>{t.ai.thinking}</span>
 *                 </div>
 *               </motion.div>
 *             )}
 *           </AnimatePresence>
 * 
 *           <div ref={bottomRef} />
 *         </div>
 * 
 *         {/* Disclaimer * /}
 *         <div className={styles.disclaimer}>
 *           <AlertCircle size={13} />
 *           <span>{t.ai.disclaimer}</span>
 *         </div>
 * 
 *         {/* Input * /}
 *         <div className={styles.inputArea}>
 *           {/* Image preview * /}
 *           <AnimatePresence>
 *             {imageFile && (
 *               <motion.div className={styles.imagePreview} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
 *                 <img src={URL.createObjectURL(imageFile)} alt="Preview" />
 *                 <button onClick={() => setImageFile(null)} className={styles.removeImage}><X size={14} /></button>
 *                 <span className={styles.imageName}>{imageFile.name}</span>
 *               </motion.div>
 *             )}
 *           </AnimatePresence>
 * 
 *           <div className={styles.inputRow}>
 *             <div className={styles.textWrap}>
 *               <textarea
 *                 ref={textareaRef}
 *                 className={styles.textarea}
 *                 placeholder={isRecording ? '🎙 Listening...' : t.ai.placeholder}
 *                 value={text}
 *                 onChange={e => setText(e.target.value)}
 *                 onKeyDown={handleKeyDown}
 *                 rows={1}
 *                 disabled={isLoading}
 *               />
 *             </div>
 * 
 *             <div className={styles.inputActions}>
 *               {/* Image upload * /}
 *               <button className={styles.actionBtn} onClick={() => fileInputRef.current?.click()} title={t.ai.uploadImage}>
 *                 <Image size={18} />
 *               </button>
 *               <input
 *                 ref={fileInputRef}
 *                 type="file"
 *                 accept="image/*"
 *                 className={styles.hiddenInput}
 *                 onChange={e => setImageFile(e.target.files[0])}
 *               />
 * 
 *               {/* Voice * /}
 *               <motion.button
 *                 className={[styles.actionBtn, isRecording ? styles.recording : ''].join(' ')}
 *                 onClick={toggleRecording}
 *                 title={isRecording ? t.ai.voiceStop : t.ai.voiceStart}
 *                 animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
 *                 transition={{ repeat: Infinity, duration: 1 }}
 *               >
 *                 {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
 *               </motion.button>
 * 
 *               {/* Stop speaking * /}
 *               {isSpeaking && (
 *                 <button className={[styles.actionBtn, styles.speakingBtn].join(' ')} onClick={stopSpeaking}>
 *                   <VolumeX size={18} />
 *                 </button>
 *               )}
 * 
 *               {/* Send * /}
 *               <motion.button
 *                 className={[styles.sendBtn, (text.trim() || imageFile) ? styles.sendBtnActive : ''].join(' ')}
 *                 onClick={handleSend}
 *                 disabled={(!text.trim() && !imageFile) || isLoading}
 *                 whileTap={{ scale: 0.9 }}
 *               >
 *                 <Send size={18} />
 *               </motion.button>
 *             </div>
 *           </div>
 *         </div>
 *       </main>
 *     </div>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/AIPage.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * .page {
 *   display: grid;
 *   grid-template-columns: 260px 1fr;
 *   height: calc(100vh - var(--nav-height));
 *   margin-top: var(--nav-height);
 *   overflow: hidden;
 * }
 * 
 * @media (max-width: 768px) { .page { grid-template-columns: 1fr; } }
 * 
 * /* ── Sidebar ── * /
 * .sidebar {
 *   background: var(--color-surface);
 *   border-right: 1px solid var(--color-border);
 *   display: flex;
 *   flex-direction: column;
 *   overflow: hidden;
 * }
 * 
 * @media (max-width: 768px) { .sidebar { display: none; } }
 * 
 * .sidebarHeader {
 *   padding: 20px 16px;
 *   border-bottom: 1px solid var(--color-border);
 *   display: flex;
 *   flex-direction: column;
 *   gap: 12px;
 *   flex-shrink: 0;
 * }
 * 
 * .sidebarHeader h2 { font-size: 16px; font-weight: 700; color: var(--color-text-primary); }
 * 
 * .newChatBtn {
 *   display: flex;
 *   align-items: center;
 *   gap: 8px;
 *   padding: 9px 14px;
 *   background: var(--color-primary);
 *   color: white;
 *   border-radius: var(--radius-md);
 *   font-size: 13px;
 *   font-weight: 500;
 *   cursor: pointer;
 *   font-family: var(--font-body);
 *   transition: background var(--transition-fast);
 * }
 * .newChatBtn:hover { background: var(--color-primary-light); }
 * 
 * .dialogueList { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
 * 
 * .noDialogues { padding: 32px 16px; text-align: center; font-size: 13px; color: var(--color-text-tertiary); line-height: 1.6; }
 * 
 * .dialogueItem {
 *   display: flex;
 *   flex-direction: column;
 *   gap: 3px;
 *   padding: 10px 12px;
 *   border-radius: var(--radius-md);
 *   text-align: left;
 *   cursor: pointer;
 *   font-family: var(--font-body);
 *   transition: all var(--transition-fast);
 *   border: 1px solid transparent;
 * }
 * .dialogueItem:hover { background: var(--color-bg-tertiary); }
 * .dialogueActive { background: var(--color-primary-muted); border-color: rgba(45,106,79,0.2); }
 * 
 * .dialogueTitle { font-size: 13px; font-weight: 500; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
 * .dialogueDate { font-size: 11px; color: var(--color-text-tertiary); }
 * 
 * /* ── Main ── * /
 * .main {
 *   display: flex;
 *   flex-direction: column;
 *   overflow: hidden;
 *   background: var(--color-bg);
 * }
 * 
 * .header {
 *   display: flex;
 *   align-items: center;
 *   justify-content: space-between;
 *   padding: 16px 24px;
 *   background: var(--color-surface);
 *   border-bottom: 1px solid var(--color-border);
 *   flex-shrink: 0;
 * }
 * 
 * .headerLeft { display: flex; align-items: center; gap: 14px; }
 * 
 * .aiLogo {
 *   width: 44px;
 *   height: 44px;
 *   background: linear-gradient(135deg, var(--color-primary), var(--color-teal));
 *   border-radius: var(--radius-lg);
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   font-size: 22px;
 *   color: white;
 *   box-shadow: var(--shadow-primary);
 * }
 * 
 * .headerTitle { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--color-text-primary); }
 * .headerSub { font-size: 12px; color: var(--color-text-tertiary); margin-top: 2px; }
 * 
 * .headerActions { display: flex; gap: 10px; }
 * 
 * .voiceToggle {
 *   display: flex;
 *   align-items: center;
 *   gap: 6px;
 *   padding: 7px 14px;
 *   border: 1.5px solid var(--color-border);
 *   border-radius: var(--radius-full);
 *   font-size: 12px;
 *   font-weight: 500;
 *   color: var(--color-text-tertiary);
 *   cursor: pointer;
 *   font-family: var(--font-body);
 *   transition: all var(--transition-fast);
 * }
 * .voiceToggle:hover { border-color: var(--color-primary); color: var(--color-primary); }
 * .voiceToggleOn { background: var(--color-primary-muted); border-color: var(--color-primary); color: var(--color-primary); }
 * 
 * /* ── Messages ── * /
 * .messages {
 *   flex: 1;
 *   overflow-y: auto;
 *   padding: 24px;
 *   display: flex;
 *   flex-direction: column;
 *   gap: 16px;
 * }
 * 
 * /* Welcome state * /
 * .welcome {
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   gap: 16px;
 *   padding: 40px 20px;
 *   text-align: center;
 *   max-width: 560px;
 *   margin: auto;
 * }
 * 
 * .welcomeIcon { font-size: 56px; }
 * 
 * .welcome h2 {
 *   font-family: var(--font-display);
 *   font-size: 28px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 * }
 * 
 * .welcomeDesc { font-size: 15px; color: var(--color-text-secondary); line-height: 1.6; }
 * 
 * .suggestions { width: 100%; text-align: left; }
 * 
 * .suggestLabel { font-size: 12px; font-weight: 600; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
 * 
 * .suggestGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
 * 
 * .suggestBtn {
 *   padding: 12px 16px;
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-lg);
 *   font-size: 13px;
 *   color: var(--color-text-secondary);
 *   cursor: pointer;
 *   text-align: left;
 *   font-family: var(--font-body);
 *   transition: all var(--transition-fast);
 *   line-height: 1.4;
 * }
 * .suggestBtn:hover { border-color: var(--color-primary); background: var(--color-primary-muted); color: var(--color-primary); }
 * 
 * /* Message rows * /
 * .msgRow { display: flex; gap: 12px; align-items: flex-start; }
 * .msgUser { flex-direction: row-reverse; }
 * 
 * .aiAvatar {
 *   width: 36px;
 *   height: 36px;
 *   background: linear-gradient(135deg, var(--color-primary), var(--color-teal));
 *   border-radius: var(--radius-md);
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   font-size: 16px;
 *   color: white;
 *   flex-shrink: 0;
 * }
 * 
 * .bubble {
 *   max-width: min(600px, 75%);
 *   padding: 13px 16px;
 *   border-radius: 18px;
 *   position: relative;
 * }
 * 
 * .msgAI .bubble {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-top-left-radius: 4px;
 *   box-shadow: var(--shadow-sm);
 * }
 * 
 * .msgUser .bubble {
 *   background: var(--color-primary);
 *   color: white;
 *   border-top-right-radius: 4px;
 * }
 * 
 * .msgUser .bubble p { font-size: 14px; line-height: 1.5; color: white; margin: 0; }
 * 
 * .bubbleError { border-color: var(--color-error) !important; background: var(--color-error-muted) !important; }
 * 
 * .msgText { font-size: 14px; line-height: 1.7; color: var(--color-text-primary); }
 * .msgText p { margin: 0 0 6px; }
 * .msgText li { margin: 3px 0 3px 18px; color: var(--color-text-secondary); }
 * .msgText strong { color: var(--color-text-primary); }
 * 
 * .uploadedImg { max-width: 200px; border-radius: 10px; margin-bottom: 8px; }
 * 
 * .time { display: block; font-size: 10px; color: var(--color-text-tertiary); margin-top: 6px; text-align: right; }
 * .msgUser .time { color: rgba(255,255,255,0.6); }
 * 
 * /* Thinking bubble * /
 * .thinkingBubble {
 *   display: flex;
 *   align-items: center;
 *   gap: 6px;
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: 18px 18px 18px 4px;
 *   padding: 14px 18px;
 *   box-shadow: var(--shadow-sm);
 * }
 * 
 * .thinkingDot {
 *   width: 7px;
 *   height: 7px;
 *   border-radius: 50%;
 *   background: var(--color-primary);
 *   animation: bounce 1.2s ease-in-out infinite;
 * }
 * .thinkingDot:nth-child(2) { animation-delay: 0.2s; background: var(--color-teal); }
 * .thinkingDot:nth-child(3) { animation-delay: 0.4s; }
 * 
 * .thinkingLabel { font-size: 12px; color: var(--color-text-tertiary); margin-left: 4px; }
 * 
 * @keyframes bounce {
 *   0%, 80%, 100% { transform: translateY(0); }
 *   40% { transform: translateY(-5px); }
 * }
 * 
 * /* ── Disclaimer ── * /
 * .disclaimer {
 *   display: flex;
 *   align-items: center;
 *   gap: 7px;
 *   padding: 8px 24px;
 *   font-size: 11px;
 *   color: var(--color-text-tertiary);
 *   background: var(--color-bg-tertiary);
 *   border-top: 1px solid var(--color-border);
 *   flex-shrink: 0;
 * }
 * 
 * /* ── Input Area ── * /
 * .inputArea {
 *   background: var(--color-surface);
 *   border-top: 1px solid var(--color-border);
 *   padding: 14px 20px;
 *   flex-shrink: 0;
 *   display: flex;
 *   flex-direction: column;
 *   gap: 10px;
 * }
 * 
 * .imagePreview {
 *   display: flex;
 *   align-items: center;
 *   gap: 10px;
 *   padding: 8px;
 *   background: var(--color-bg-tertiary);
 *   border-radius: var(--radius-md);
 *   overflow: hidden;
 * }
 * 
 * .imagePreview img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; }
 * 
 * .imageName { font-size: 12px; color: var(--color-text-secondary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
 * 
 * .removeImage {
 *   width: 24px;
 *   height: 24px;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   border-radius: 50%;
 *   background: var(--color-border-strong);
 *   color: var(--color-text-secondary);
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 *   flex-shrink: 0;
 * }
 * .removeImage:hover { background: var(--color-error); color: white; }
 * 
 * .inputRow {
 *   display: flex;
 *   gap: 10px;
 *   align-items: flex-end;
 * }
 * 
 * .textWrap {
 *   flex: 1;
 *   background: var(--color-bg-tertiary);
 *   border: 1.5px solid var(--color-border);
 *   border-radius: var(--radius-lg);
 *   padding: 10px 14px;
 *   transition: border-color var(--transition-fast);
 * }
 * .textWrap:focus-within { border-color: var(--color-primary); }
 * 
 * .textarea {
 *   width: 100%;
 *   border: none;
 *   outline: none;
 *   background: transparent;
 *   color: var(--color-text-primary);
 *   font-size: 14px;
 *   font-family: var(--font-body);
 *   resize: none;
 *   max-height: 120px;
 *   line-height: 1.5;
 * }
 * .textarea::placeholder { color: var(--color-text-tertiary); }
 * 
 * .inputActions { display: flex; gap: 6px; align-items: flex-end; }
 * 
 * .actionBtn {
 *   width: 40px;
 *   height: 40px;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   border-radius: var(--radius-md);
 *   color: var(--color-text-tertiary);
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 *   border: 1.5px solid var(--color-border);
 *   background: var(--color-surface);
 * }
 * .actionBtn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-muted); }
 * 
 * .recording {
 *   background: var(--color-error-muted);
 *   border-color: var(--color-error);
 *   color: var(--color-error);
 *   animation: recordPulse 1.5s infinite;
 * }
 * 
 * .speakingBtn { border-color: var(--color-teal); color: var(--color-teal); }
 * 
 * .hiddenInput { display: none; }
 * 
 * .sendBtn {
 *   width: 44px;
 *   height: 44px;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   border-radius: var(--radius-md);
 *   background: var(--color-bg-tertiary);
 *   color: var(--color-text-tertiary);
 *   cursor: not-allowed;
 *   transition: all var(--transition-fast);
 *   border: none;
 * }
 * 
 * .sendBtnActive {
 *   background: linear-gradient(135deg, var(--color-primary), var(--color-teal));
 *   color: white;
 *   cursor: pointer;
 *   box-shadow: var(--shadow-primary);
 * }
 * .sendBtnActive:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(45,106,79,0.35); }
 * 
 * @keyframes recordPulse {
 *   0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.3); }
 *   50% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/AdminPage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { useState, useEffect } from 'react';
 * import { motion, AnimatePresence } from 'framer-motion';
 * import { Users, Stethoscope, Activity, Clock, Check, X, Eye, Ban, ShieldCheck, ChevronDown } from 'lucide-react';
 * import { useT } from '../i18n/useT';
 * import { useAuthStore } from '../store';
 * import { Admin } from '../services';
 * import Avatar from '../components/common/Avatar';
 * import Button from '../components/common/Button';
 * import styles from './AdminPage.module.css';
 * import toast from 'react-hot-toast';
 * import { useNavigate } from 'react-router-dom';
 * 
 * // ─── Stat Card ────────────────────────────────────────────────────────────────
 * function StatCard({ icon, label, value, color, trend }) {
 *   return (
 *     <motion.div className={styles.statCard} whileHover={{ y: -3 }}>
 *       <div className={styles.statIcon} style={{ background: `${color}15`, color }}>{icon}</div>
 *       <div className={styles.statContent}>
 *         <div className={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
 *         <div className={styles.statLabel}>{label}</div>
 *       </div>
 *       {trend && (
 *         <div className={[styles.statTrend, trend > 0 ? styles.trendUp : styles.trendDown].join(' ')}>
 *           {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
 *         </div>
 *       )}
 *     </motion.div>
 *   );
 * }
 * 
 * // ─── Admin Tabs ───────────────────────────────────────────────────────────────
 * const TABS = ['dashboard', 'doctors', 'users'];
 * 
 * export default function AdminPage() {
 *   const { t } = useT();
 *   const { user } = useAuthStore();
 *   const navigate = useNavigate();
 * 
 *   const [activeTab, setActiveTab] = useState('dashboard');
 *   const [stats, setStats] = useState(null);
 *   const [applications, setApplications] = useState([]);
 *   const [users, setUsers] = useState([]);
 *   const [appFilter, setAppFilter] = useState('pending');
 *   const [loading, setLoading] = useState(true);
 * 
 *   // Guard: only admins
 *   useEffect(() => {
 *     if (user?.role !== 'admin') {
 *       navigate('/dashboard');
 *       toast.error('Admin access required');
 *     }
 *   }, [user]);
 * 
 *   // Load data
 *   useEffect(() => {
 *     const loadAll = async () => {
 *       setLoading(true);
 *       try {
 *         const [statsRes, appsRes, usersRes] = await Promise.all([
 *           Admin.getStats(),
 *           Admin.getDoctorApplications('pending'),
 *           Admin.getUsers(),
 *         ]);
 *         setStats(statsRes.data);
 *         setApplications(appsRes.data);
 *         setUsers(usersRes.data.results || usersRes.data);
 *       } catch { toast.error('Failed to load admin data'); }
 *       finally { setLoading(false); }
 *     };
 *     if (user?.role === 'admin') loadAll();
 *   }, [user]);
 * 
 *   const loadApplications = async (status) => {
 *     setAppFilter(status);
 *     try {
 *       const res = await Admin.getDoctorApplications(status);
 *       setApplications(res.data);
 *     } catch { toast.error('Failed to load applications'); }
 *   };
 * 
 *   const handleApprove = async (id) => {
 *     try {
 *       await Admin.approveDoctor(id);
 *       toast.success('Doctor approved!');
 *       setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
 *     } catch { toast.error('Failed to approve doctor'); }
 *   };
 * 
 *   const handleReject = async (id) => {
 *     try {
 *       await Admin.rejectDoctor(id);
 *       toast.success('Application rejected');
 *       setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
 *     } catch { toast.error('Failed to reject application'); }
 *   };
 * 
 *   const handleBanUser = async (id, currentStatus) => {
 *     try {
 *       if (currentStatus === 'banned') {
 *         await Admin.unbanUser(id);
 *         toast.success('User unbanned');
 *         setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u));
 *       } else {
 *         await Admin.banUser(id);
 *         toast.success('User banned');
 *         setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'banned' } : u));
 *       }
 *     } catch { toast.error('Action failed'); }
 *   };
 * 
 *   const tabLabels = {
 *     dashboard: t.admin.dashboard,
 *     doctors: t.admin.doctors,
 *     users: t.admin.users,
 *   };
 * 
 *   return (
 *     <div className={styles.page}>
 *       {/* Header * /}
 *       <div className={styles.header}>
 *         <div className="container">
 *           <h1 className={styles.pageTitle}>{t.admin.title}</h1>
 *           <div className={styles.tabs}>
 *             {TABS.map(tab => (
 *               <button
 *                 key={tab}
 *                 className={[styles.tab, activeTab === tab ? styles.tabActive : ''].join(' ')}
 *                 onClick={() => setActiveTab(tab)}
 *               >
 *                 {tabLabels[tab]}
 *               </button>
 *             ))}
 *           </div>
 *         </div>
 *       </div>
 * 
 *       <div className="container">
 *         <div className={styles.content}>
 *           <AnimatePresence mode="wait">
 *             {/* ── Dashboard Tab ── * /}
 *             {activeTab === 'dashboard' && (
 *               <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
 *                 {loading || !stats ? (
 *                   <div className={styles.statsGrid}>
 *                     {[1,2,3,4].map(i => <div key={i} className={['skeleton', styles.statSkeleton].join(' ')} />)}
 *                   </div>
 *                 ) : (
 *                   <div className={styles.statsGrid}>
 *                     <StatCard icon={<Users size={22} />} label={t.admin.stats.totalUsers} value={stats.totalUsers} color="#2D6A4F" trend={12} />
 *                     <StatCard icon={<Stethoscope size={22} />} label={t.admin.stats.activeDoctors} value={stats.activeDoctors} color="#0F766E" trend={5} />
 *                     <StatCard icon={<Clock size={22} />} label={t.admin.stats.pendingApps} value={stats.pendingApplications} color="#D97706" />
 *                     <StatCard icon={<Activity size={22} />} label={t.admin.stats.todayConsultations} value={stats.todayConsultations} color="#7C3AED" trend={8} />
 *                   </div>
 *                 )}
 * 
 *                 {/* Recent applications summary * /}
 *                 <div className={styles.dashSection}>
 *                   <div className={styles.sectionHeader}>
 *                     <h2>{t.admin.doctorApps.title}</h2>
 *                     <Button variant="ghost" size="sm" onClick={() => setActiveTab('doctors')}>View all →</Button>
 *                   </div>
 *                   <div className={styles.recentApps}>
 *                     {applications.slice(0, 3).map(app => (
 *                       <div key={app.id} className={styles.recentApp}>
 *                         <Avatar name={`${app.user.firstName} ${app.user.lastName}`} size="sm" />
 *                         <div className={styles.recentAppInfo}>
 *                           <span className={styles.recentAppName}>{app.user.firstName} {app.user.lastName}</span>
 *                           <span className={styles.recentAppSpec}>{app.specialty}</span>
 *                         </div>
 *                         <span className={[styles.statusBadge, styles[`status_${app.status}`]].join(' ')}>
 *                           {t.admin.doctorApps[app.status]}
 *                         </span>
 *                         {app.status === 'pending' && (
 *                           <div className={styles.quickActions}>
 *                             <button className={styles.approveBtn} onClick={() => handleApprove(app.id)}><Check size={14} /></button>
 *                             <button className={styles.rejectBtn} onClick={() => handleReject(app.id)}><X size={14} /></button>
 *                           </div>
 *                         )}
 *                       </div>
 *                     ))}
 *                   </div>
 *                 </div>
 * 
 *                 {/* Stats cards * /}
 *                 <div className={styles.dashSection}>
 *                   <h2>Platform Overview</h2>
 *                   <div className={styles.overviewGrid}>
 *                     {[
 *                       { label: 'Total Consultations', value: stats?.totalConsultations, icon: '💬' },
 *                       { label: 'New Users This Week', value: stats?.newUsersThisWeek, icon: '👤' },
 *                       { label: 'Revenue This Month', value: stats ? `${(stats.revenueThisMonth / 1000000).toFixed(1)}M UZS` : '—', icon: '💰' },
 *                     ].map(s => (
 *                       <div key={s.label} className={styles.overviewCard}>
 *                         <span className={styles.overviewIcon}>{s.icon}</span>
 *                         <div className={styles.overviewVal}>{s.value?.toLocaleString?.() || s.value}</div>
 *                         <div className={styles.overviewLabel}>{s.label}</div>
 *                       </div>
 *                     ))}
 *                   </div>
 *                 </div>
 *               </motion.div>
 *             )}
 * 
 *             {/* ── Doctors Tab ── * /}
 *             {activeTab === 'doctors' && (
 *               <motion.div key="doctors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
 *                 <div className={styles.tabHeader}>
 *                   <h2 className={styles.tabTitle}>{t.admin.doctorApps.title}</h2>
 *                   <div className={styles.filterRow}>
 *                     {['pending', 'approved', 'rejected'].map(status => (
 *                       <button
 *                         key={status}
 *                         className={[styles.filterBtn, appFilter === status ? styles.filterBtnActive : ''].join(' ')}
 *                         onClick={() => loadApplications(status)}
 *                       >
 *                         {t.admin.doctorApps[status]}
 *                       </button>
 *                     ))}
 *                   </div>
 *                 </div>
 * 
 *                 <div className={styles.applicationList}>
 *                   {applications.length === 0 && (
 *                     <div className={styles.empty}>
 *                       <span style={{ fontSize: 40 }}>🩺</span>
 *                       <p>No {appFilter} applications</p>
 *                     </div>
 *                   )}
 *                   {applications.map(app => (
 *                     <motion.div key={app.id} className={styles.applicationCard} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
 *                       <div className={styles.appLeft}>
 *                         <Avatar name={`${app.user.firstName} ${app.user.lastName}`} size="lg" />
 *                         <div>
 *                           <h3 className={styles.appName}>{app.user.firstName} {app.user.lastName}</h3>
 *                           <p className={styles.appEmail}>{app.user.email}</p>
 *                         </div>
 *                       </div>
 * 
 *                       <div className={styles.appDetails}>
 *                         <div className={styles.appDetail}>
 *                           <span className={styles.detailLabel}>{t.admin.doctorApps.specialty}</span>
 *                           <span className={styles.detailValue}>{app.specialty}</span>
 *                         </div>
 *                         <div className={styles.appDetail}>
 *                           <span className={styles.detailLabel}>{t.admin.doctorApps.experience}</span>
 *                           <span className={styles.detailValue}>{app.experience} years</span>
 *                         </div>
 *                         <div className={styles.appDetail}>
 *                           <span className={styles.detailLabel}>{t.admin.doctorApps.education}</span>
 *                           <span className={styles.detailValue}>{app.education}</span>
 *                         </div>
 *                         <div className={styles.appDetail}>
 *                           <span className={styles.detailLabel}>{t.admin.doctorApps.appliedAt}</span>
 *                           <span className={styles.detailValue}>{new Date(app.appliedAt).toLocaleDateString()}</span>
 *                         </div>
 *                       </div>
 * 
 *                       <div className={styles.appRight}>
 *                         <span className={[styles.statusBadge, styles[`status_${app.status}`]].join(' ')}>
 *                           {t.admin.doctorApps[app.status]}
 *                         </span>
 *                         <div className={styles.appDocs}>
 *                           <Eye size={13} />
 *                           {app.documents.length} docs
 *                         </div>
 *                         {app.status === 'pending' && (
 *                           <div className={styles.appActions}>
 *                             <Button size="sm" onClick={() => handleApprove(app.id)} icon={<Check size={14} />}>
 *                               {t.admin.doctorApps.approve}
 *                             </Button>
 *                             <Button size="sm" variant="danger" onClick={() => handleReject(app.id)} icon={<X size={14} />}>
 *                               {t.admin.doctorApps.reject}
 *                             </Button>
 *                           </div>
 *                         )}
 *                       </div>
 *                     </motion.div>
 *                   ))}
 *                 </div>
 *               </motion.div>
 *             )}
 * 
 *             {/* ── Users Tab ── * /}
 *             {activeTab === 'users' && (
 *               <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
 *                 <div className={styles.tabHeader}>
 *                   <h2 className={styles.tabTitle}>{t.admin.users.title}</h2>
 *                 </div>
 *                 <div className={styles.usersTable}>
 *                   <div className={styles.tableHeader}>
 *                     <span>{t.admin.users.name}</span>
 *                     <span>{t.admin.users.email}</span>
 *                     <span>{t.admin.users.role}</span>
 *                     <span>{t.admin.users.status}</span>
 *                     <span>{t.admin.users.joined}</span>
 *                     <span>{t.admin.users.actions}</span>
 *                   </div>
 *                   {users.map(u => (
 *                     <motion.div key={u.id} className={styles.tableRow} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
 *                       <span className={styles.userNameCell}>
 *                         <Avatar name={`${u.firstName} ${u.lastName}`} size="xs" />
 *                         {u.firstName} {u.lastName}
 *                       </span>
 *                       <span className={styles.email}>{u.email}</span>
 *                       <span>
 *                         <span className={[styles.roleBadge, styles[`role_${u.role}`]].join(' ')}>{u.role}</span>
 *                       </span>
 *                       <span>
 *                         <span className={[styles.statusBadge, u.status === 'active' ? styles.status_approved : styles.status_rejected].join(' ')}>
 *                           {u.status}
 *                         </span>
 *                       </span>
 *                       <span className={styles.dateCell}>{u.joinedAt}</span>
 *                       <span className={styles.actionsCell}>
 *                         <button
 *                           className={[styles.actionBtn, u.status === 'banned' ? styles.unbanBtn : styles.banBtn].join(' ')}
 *                           onClick={() => handleBanUser(u.id, u.status)}
 *                           title={u.status === 'banned' ? t.admin.users.unban : t.admin.users.ban}
 *                         >
 *                           <Ban size={14} />
 *                         </button>
 *                         <button className={[styles.actionBtn, styles.adminBtn].join(' ')} title={t.admin.users.makeAdmin}>
 *                           <ShieldCheck size={14} />
 *                         </button>
 *                       </span>
 *                     </motion.div>
 *                   ))}
 *                 </div>
 *               </motion.div>
 *             )}
 *           </AnimatePresence>
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/AdminPage.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * .page { padding-bottom: 80px; min-height: 100vh; }
 * 
 * .header {
 *   background: var(--color-surface);
 *   border-bottom: 1px solid var(--color-border);
 *   padding-top: calc(var(--nav-height) + 32px);
 *   padding-bottom: 0;
 *   position: sticky;
 *   top: var(--nav-height);
 *   z-index: 10;
 *   box-shadow: var(--shadow-sm);
 * }
 * 
 * .pageTitle {
 *   font-family: var(--font-display);
 *   font-size: 28px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 *   margin-bottom: 20px;
 * }
 * 
 * .tabs { display: flex; gap: 0; border-bottom: 2px solid var(--color-border); margin: 0 -24px; padding: 0 24px; }
 * 
 * .tab {
 *   padding: 12px 20px;
 *   font-size: 14px;
 *   font-weight: 500;
 *   color: var(--color-text-tertiary);
 *   border-bottom: 2px solid transparent;
 *   margin-bottom: -2px;
 *   cursor: pointer;
 *   font-family: var(--font-body);
 *   transition: all var(--transition-fast);
 * }
 * .tab:hover { color: var(--color-text-primary); }
 * .tabActive { color: var(--color-primary); border-bottom-color: var(--color-primary); }
 * 
 * .content { padding: 32px 0; }
 * 
 * /* ── Stats Grid ── * /
 * .statsGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
 * 
 * @media (max-width: 1024px) { .statsGrid { grid-template-columns: repeat(2, 1fr); } }
 * @media (max-width: 480px) { .statsGrid { grid-template-columns: 1fr; } }
 * 
 * .statSkeleton { height: 100px; border-radius: var(--radius-xl); }
 * 
 * .statCard {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 20px;
 *   display: flex;
 *   align-items: center;
 *   gap: 16px;
 *   transition: all var(--transition-base);
 * }
 * .statCard:hover { box-shadow: var(--shadow-md); }
 * 
 * .statIcon {
 *   width: 48px;
 *   height: 48px;
 *   border-radius: var(--radius-md);
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   flex-shrink: 0;
 * }
 * 
 * .statContent { flex: 1; }
 * 
 * .statValue { font-size: 28px; font-weight: 700; color: var(--color-text-primary); font-family: var(--font-display); line-height: 1; }
 * 
 * .statLabel { font-size: 12px; color: var(--color-text-tertiary); margin-top: 4px; }
 * 
 * .statTrend { font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: var(--radius-full); flex-shrink: 0; }
 * .trendUp { background: var(--color-success-muted); color: var(--color-success); }
 * .trendDown { background: var(--color-error-muted); color: var(--color-error); }
 * 
 * /* ── Dashboard Sections ── * /
 * .dashSection { margin-bottom: 32px; }
 * 
 * .sectionHeader {
 *   display: flex;
 *   align-items: center;
 *   justify-content: space-between;
 *   margin-bottom: 16px;
 * }
 * 
 * .dashSection h2 {
 *   font-size: 18px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 * }
 * 
 * /* Recent apps * /
 * .recentApps { display: flex; flex-direction: column; gap: 10px; }
 * 
 * .recentApp {
 *   display: flex;
 *   align-items: center;
 *   gap: 12px;
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-lg);
 *   padding: 14px 16px;
 * }
 * 
 * .recentAppInfo { flex: 1; }
 * .recentAppName { font-size: 14px; font-weight: 600; color: var(--color-text-primary); display: block; }
 * .recentAppSpec { font-size: 12px; color: var(--color-text-tertiary); }
 * 
 * .quickActions { display: flex; gap: 6px; }
 * 
 * .approveBtn, .rejectBtn {
 *   width: 30px;
 *   height: 30px;
 *   border-radius: var(--radius-sm);
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 * }
 * 
 * .approveBtn { background: var(--color-success-muted); color: var(--color-success); }
 * .approveBtn:hover { background: var(--color-success); color: white; }
 * .rejectBtn { background: var(--color-error-muted); color: var(--color-error); }
 * .rejectBtn:hover { background: var(--color-error); color: white; }
 * 
 * /* Overview grid * /
 * .overviewGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
 * 
 * @media (max-width: 640px) { .overviewGrid { grid-template-columns: 1fr; } }
 * 
 * .overviewCard {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 24px;
 *   text-align: center;
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   gap: 8px;
 * }
 * 
 * .overviewIcon { font-size: 32px; }
 * .overviewVal { font-size: 24px; font-weight: 700; color: var(--color-text-primary); font-family: var(--font-display); }
 * .overviewLabel { font-size: 13px; color: var(--color-text-tertiary); }
 * 
 * /* ── Tab header ── * /
 * .tabHeader {
 *   display: flex;
 *   align-items: center;
 *   justify-content: space-between;
 *   margin-bottom: 20px;
 *   gap: 16px;
 *   flex-wrap: wrap;
 * }
 * 
 * .tabTitle { font-size: 22px; font-weight: 700; color: var(--color-text-primary); }
 * 
 * .filterRow { display: flex; gap: 6px; }
 * 
 * .filterBtn {
 *   padding: 7px 16px;
 *   border-radius: var(--radius-full);
 *   font-size: 13px;
 *   font-weight: 500;
 *   color: var(--color-text-secondary);
 *   border: 1.5px solid var(--color-border);
 *   background: var(--color-surface);
 *   cursor: pointer;
 *   font-family: var(--font-body);
 *   transition: all var(--transition-fast);
 * }
 * .filterBtn:hover { border-color: var(--color-primary); color: var(--color-primary); }
 * .filterBtnActive { background: var(--color-primary-muted); border-color: var(--color-primary); color: var(--color-primary); }
 * 
 * /* ── Application List ── * /
 * .applicationList { display: flex; flex-direction: column; gap: 14px; }
 * 
 * .applicationCard {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 20px;
 *   display: grid;
 *   grid-template-columns: auto 1fr auto;
 *   gap: 20px;
 *   align-items: start;
 * }
 * 
 * @media (max-width: 760px) { .applicationCard { grid-template-columns: 1fr; } }
 * 
 * .appLeft { display: flex; align-items: center; gap: 12px; }
 * 
 * .appName { font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
 * .appEmail { font-size: 13px; color: var(--color-text-tertiary); }
 * 
 * .appDetails { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
 * 
 * .appDetail { display: flex; flex-direction: column; gap: 2px; }
 * .detailLabel { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-tertiary); font-weight: 600; }
 * .detailValue { font-size: 13px; color: var(--color-text-primary); }
 * 
 * .appRight { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
 * 
 * .appDocs {
 *   display: flex;
 *   align-items: center;
 *   gap: 5px;
 *   font-size: 12px;
 *   color: var(--color-text-tertiary);
 *   background: var(--color-bg-tertiary);
 *   padding: 4px 10px;
 *   border-radius: var(--radius-full);
 * }
 * 
 * .appActions { display: flex; gap: 8px; }
 * 
 * /* Status Badges * /
 * .statusBadge {
 *   display: inline-flex;
 *   align-items: center;
 *   padding: 4px 10px;
 *   border-radius: var(--radius-full);
 *   font-size: 12px;
 *   font-weight: 500;
 * }
 * 
 * .status_pending { background: var(--color-warning-muted); color: var(--color-warning); }
 * .status_approved { background: var(--color-success-muted); color: var(--color-success); }
 * .status_rejected { background: var(--color-error-muted); color: var(--color-error); }
 * 
 * /* ── Users Table ── * /
 * .usersTable {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   overflow: hidden;
 * }
 * 
 * .tableHeader {
 *   display: grid;
 *   grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
 *   gap: 16px;
 *   padding: 12px 20px;
 *   background: var(--color-bg-tertiary);
 *   border-bottom: 1px solid var(--color-border);
 *   font-size: 12px;
 *   font-weight: 600;
 *   color: var(--color-text-tertiary);
 *   text-transform: uppercase;
 *   letter-spacing: 0.06em;
 * }
 * 
 * .tableRow {
 *   display: grid;
 *   grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
 *   gap: 16px;
 *   padding: 14px 20px;
 *   border-bottom: 1px solid var(--color-border);
 *   align-items: center;
 *   font-size: 13.5px;
 *   color: var(--color-text-secondary);
 *   transition: background var(--transition-fast);
 * }
 * .tableRow:last-child { border-bottom: none; }
 * .tableRow:hover { background: var(--color-bg-tertiary); }
 * 
 * .userNameCell { display: flex; align-items: center; gap: 8px; font-weight: 500; color: var(--color-text-primary); }
 * 
 * .email { color: var(--color-text-tertiary); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
 * 
 * .roleBadge {
 *   display: inline-flex;
 *   padding: 3px 9px;
 *   border-radius: var(--radius-full);
 *   font-size: 11px;
 *   font-weight: 600;
 *   text-transform: capitalize;
 * }
 * .role_patient { background: var(--color-primary-muted); color: var(--color-primary); }
 * .role_doctor { background: var(--color-teal-muted); color: var(--color-teal); }
 * .role_admin { background: #f3e8ff; color: #7C3AED; }
 * [data-theme="dark"] .role_admin { background: #2e1065; color: #a78bfa; }
 * 
 * .dateCell { font-size: 12px; }
 * 
 * .actionsCell { display: flex; gap: 6px; }
 * 
 * .actionBtn {
 *   width: 30px;
 *   height: 30px;
 *   border-radius: var(--radius-sm);
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 *   border: none;
 * }
 * 
 * .banBtn { background: var(--color-error-muted); color: var(--color-error); }
 * .banBtn:hover { background: var(--color-error); color: white; }
 * .unbanBtn { background: var(--color-success-muted); color: var(--color-success); }
 * .unbanBtn:hover { background: var(--color-success); color: white; }
 * .adminBtn { background: #f3e8ff; color: #7C3AED; }
 * .adminBtn:hover { background: #7C3AED; color: white; }
 * 
 * .empty {
 *   text-align: center;
 *   padding: 60px 20px;
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   gap: 12px;
 *   color: var(--color-text-tertiary);
 * }
 * 
 * @media (max-width: 768px) {
 *   .tableHeader, .tableRow { grid-template-columns: 2fr 1fr 1fr 1fr; }
 *   .tableHeader span:nth-child(2), .tableRow span:nth-child(2),
 *   .tableHeader span:nth-child(5), .tableRow span:nth-child(5) { display: none; }
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/DashboardPage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 *
 * import { useState } from 'react';
 * import { Link, useNavigate } from 'react-router-dom';
 * import { motion } from 'framer-motion';
 * import { MessageSquare, Search, Brain, Upload, CheckCircle, Star, Calendar, Users } from 'lucide-react';
 * import { useT } from '../i18n/useT';
 * import { useAuthStore } from '../store';
 * import { Doctors } from '../services';
 * import Avatar from '../components/common/Avatar';
 * import Button from '../components/common/Button';
 * import Input from '../components/common/Input';
 * import styles from './DashboardPage.module.css';
 * import toast from 'react-hot-toast';
 * 
 * const fadeUp = {
 *   hidden: { opacity: 0, y: 20 },
 *   visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
 * };
 * 
 * // ─── Patient Dashboard ────────────────────────────────────────────────────────
 * function PatientDashboard({ user, t }) {
 *   const navigate = useNavigate();
 * 
 *   const quickActions = [
 *     { icon: <Search size={22} />, label: t.nav.doctors, to: '/doctors', color: '#2D6A4F', bg: 'var(--color-primary-muted)' },
 *     { icon: <MessageSquare size={22} />, label: t.nav.consultations, to: '/chat', color: '#0F766E', bg: 'var(--color-teal-muted)' },
 *     { icon: <Brain size={22} />, label: t.nav.aiAssistant, to: '/ai', color: '#7C3AED', bg: '#f3e8ff' },
 *   ];
 * 
 *   const recentConsultations = [
 *     { doctor: 'Dr. Dilnoza Yusupova', spec: 'Cardiologist', date: 'Jan 20, 2025', status: 'active', id: 1 },
 *     { doctor: 'Dr. Malika Rashidova', spec: 'Pediatrician', date: 'Jan 15, 2025', status: 'ended', id: 2 },
 *   ];
 * 
 *   return (
 *     <div className={styles.dashContent}>
 *       {/* Welcome Banner * /}
 *       <motion.div className={styles.welcomeBanner} variants={fadeUp} initial="hidden" animate="visible">
 *         <div className={styles.welcomeLeft}>
 *           <Avatar name={`${user.firstName} ${user.lastName}`} size="xl" />
 *           <div>
 *             <p className={styles.welcomeGreeting}>{t.patient.dashboard.welcome} 👋</p>
 *             <h1 className={styles.welcomeName}>{user.firstName} {user.lastName}</h1>
 *             <p className={styles.welcomeEmail}>{user.email}</p>
 *           </div>
 *         </div>
 *         <div className={styles.welcomeStats}>
 *           {[
 *             { val: '3', label: 'Consultations' },
 *             { val: '2', label: t.patient.dashboard.myDoctors },
 *             { val: '12', label: 'AI Chats' },
 *           ].map((s, i) => (
 *             <div key={i} className={styles.wStat}>
 *               <span className={styles.wStatVal}>{s.val}</span>
 *               <span className={styles.wStatLabel}>{s.label}</span>
 *             </div>
 *           ))}
 *         </div>
 *       </motion.div>
 * 
 *       {/* Quick Actions * /}
 *       <div className={styles.section}>
 *         <h2 className={styles.sectionTitle}>Quick Actions</h2>
 *         <div className={styles.quickActions}>
 *           {quickActions.map((a, i) => (
 *             <motion.div
 *               key={a.to}
 *               className={styles.quickAction}
 *               custom={i}
 *               variants={fadeUp}
 *               initial="hidden"
 *               animate="visible"
 *               whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
 *               onClick={() => navigate(a.to)}
 *             >
 *               <div className={styles.qaIcon} style={{ background: a.bg, color: a.color }}>{a.icon}</div>
 *               <span className={styles.qaLabel}>{a.label}</span>
 *             </motion.div>
 *           ))}
 *         </div>
 *       </div>
 * 
 *       <div className={styles.twoCol}>
 *         {/* Recent Consultations * /}
 *         <div className={styles.section}>
 *           <div className={styles.sectionHeader}>
 *             <h2 className={styles.sectionTitle}>{t.patient.dashboard.recentConsultations}</h2>
 *             <Link to="/chat" className={styles.viewAll}>View all →</Link>
 *           </div>
 *           <div className={styles.cardList}>
 *             {recentConsultations.map((c, i) => (
 *               <motion.div key={i} className={styles.listCard} custom={i} variants={fadeUp} initial="hidden" animate="visible">
 *                 <Avatar name={c.doctor} size="md" online={c.status === 'active'} />
 *                 <div className={styles.listCardInfo}>
 *                   <span className={styles.listCardTitle}>{c.doctor}</span>
 *                   <span className={styles.listCardSub}>{c.spec} · {c.date}</span>
 *                 </div>
 *                 <span className={[styles.statusPill, c.status === 'active' ? styles.pillActive : styles.pillEnded].join(' ')}>
 *                   {c.status}
 *                 </span>
 *                 <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>Open</Button>
 *               </motion.div>
 *             ))}
 *             {recentConsultations.length === 0 && (
 *               <div className={styles.emptyState}>
 *                 <p>{t.patient.dashboard.noConsultations}</p>
 *                 <Button size="sm" onClick={() => navigate('/doctors')}>{t.patient.dashboard.findDoctor}</Button>
 *               </div>
 *             )}
 *           </div>
 *         </div>
 * 
 *         {/* Health Tip + AI promo * /}
 *         <div className={styles.sideWidgets}>
 *           <motion.div className={styles.tipCard} variants={fadeUp} initial="hidden" animate="visible" custom={1}>
 *             <div className={styles.tipIcon}>💡</div>
 *             <div>
 *               <h3>Daily Health Tip</h3>
 *               <p>Drink at least 8 glasses of water daily. Proper hydration improves energy levels, concentration, and organ function.</p>
 *             </div>
 *           </motion.div>
 * 
 *           <motion.div className={styles.aiPromoCard} variants={fadeUp} initial="hidden" animate="visible" custom={2}
 *             onClick={() => navigate('/ai')} style={{ cursor: 'pointer' }}>
 *             <div className={styles.aiPromoIcon}>✦</div>
 *             <div>
 *               <h3>Try Healzy AI</h3>
 *               <p>Ask about symptoms, medications, or get instant health advice — available 24/7.</p>
 *             </div>
 *             <span className={styles.aiPromoArrow}>→</span>
 *           </motion.div>
 * 
 *           <motion.div className={styles.ratingCard} variants={fadeUp} initial="hidden" animate="visible" custom={3}>
 *             <Star size={18} fill="currentColor" style={{ color: '#F59E0B' }} />
 *             <div>
 *               <h3>Rate your last consultation</h3>
 *               <p>How was your visit with Dr. Dilnoza?</p>
 *             </div>
 *             <div className={styles.starRow}>
 *               {[1,2,3,4,5].map(n => (
 *                 <button key={n} className={styles.starBtn}>★</button>
 *               ))}
 *             </div>
 *           </motion.div>
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // ─── Doctor Application Form ──────────────────────────────────────────────────
 * function DoctorApplicationForm({ t }) {
 *   const [form, setForm] = useState({ specialty: '', experience: '', education: '', bio: '' });
 *   const [files, setFiles] = useState([]);
 *   const [loading, setLoading] = useState(false);
 *   const [submitted, setSubmitted] = useState(false);
 *   const { specialties } = t;
 * 
 *   const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
 * 
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     if (!form.specialty || !form.experience || !form.education) {
 *       toast.error('Please fill all required fields');
 *       return;
 *     }
 *     setLoading(true);
 *     try {
 *       const formData = new FormData();
 *       Object.entries(form).forEach(([k, v]) => formData.append(k, v));
 *       files.forEach(f => formData.append('documents', f));
 *       await Doctors.submitApplication(formData);
 *       setSubmitted(true);
 *       toast.success('Application submitted!');
 *     } catch {
 *       toast.error('Failed to submit. Please try again.');
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 * 
 *   if (submitted) return (
 *     <motion.div className={styles.pendingCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
 *       <CheckCircle size={60} className={styles.pendingIcon} />
 *       <h2>{t.doctorDashboard.becomeDoctor.pending}</h2>
 *       <p>{t.doctorDashboard.becomeDoctor.pendingDesc}</p>
 *       <div className={styles.pendingTimeline}>
 *         {['Application received', 'Document review (1–2 days)', 'Approval & activation'].map((step, i) => (
 *           <div key={i} className={styles.timelineStep}>
 *             <div className={[styles.timelineDot, i === 0 ? styles.timelineDotDone : ''].join(' ')}>
 *               {i === 0 ? '✓' : i + 1}
 *             </div>
 *             <span className={styles.timelineLabel}>{step}</span>
 *             {i < 2 && <div className={styles.timelineLine} />}
 *           </div>
 *         ))}
 *       </div>
 *     </motion.div>
 *   );
 * 
 *   return (
 *     <div className={styles.applyWrapper}>
 *       <motion.div className={styles.applyHeader} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
 *         <div className={styles.applyBadge}>🩺 Doctor Application</div>
 *         <h1>{t.doctorDashboard.becomeDoctor.title}</h1>
 *         <p>{t.doctorDashboard.becomeDoctor.subtitle}</p>
 *       </motion.div>
 * 
 *       <motion.form
 *         className={styles.applyForm}
 *         onSubmit={handleSubmit}
 *         initial={{ opacity: 0 }}
 *         animate={{ opacity: 1 }}
 *         transition={{ delay: 0.15 }}
 *       >
 *         <div className={styles.formRow}>
 *           <div className={styles.formField}>
 *             <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.specialty} *</label>
 *             <select
 *               className={styles.formSelect}
 *               value={form.specialty}
 *               onChange={e => set('specialty', e.target.value)}
 *               required
 *             >
 *               <option value="">Select specialty...</option>
 *               {specialties.map(s => <option key={s} value={s}>{s}</option>)}
 *             </select>
 *           </div>
 *           <Input
 *             label={`${t.doctorDashboard.becomeDoctor.experience} *`}
 *             type="number"
 *             value={form.experience}
 *             onChange={e => set('experience', e.target.value)}
 *             placeholder="e.g. 10"
 *             min="0" max="60"
 *             required
 *           />
 *         </div>
 * 
 *         <div className={styles.formField}>
 *           <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.education} *</label>
 *           <textarea
 *             className={styles.formTextarea}
 *             value={form.education}
 *             onChange={e => set('education', e.target.value)}
 *             placeholder="e.g. Tashkent Medical Academy, MD — 2010&#10;Residency: National Cardiology Center — 2014"
 *             rows={3}
 *             required
 *           />
 *         </div>
 * 
 *         <div className={styles.formField}>
 *           <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.bio}</label>
 *           <textarea
 *             className={styles.formTextarea}
 *             value={form.bio}
 *             onChange={e => set('bio', e.target.value)}
 *             placeholder="Tell patients about your experience and approach to care..."
 *             rows={4}
 *           />
 *         </div>
 * 
 *         <div className={styles.formField}>
 *           <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.documents}</label>
 *           <div
 *             className={styles.uploadZone}
 *             onClick={() => document.getElementById('docUpload').click()}
 *           >
 *             <Upload size={30} className={styles.uploadIcon} />
 *             <p>Click to upload or drag & drop</p>
 *             <span>Diploma, license, certificates — PDF, JPG, PNG (max 10MB each)</span>
 *             <input
 *               id="docUpload"
 *               type="file"
 *               multiple
 *               accept=".pdf,.jpg,.jpeg,.png"
 *               style={{ display: 'none' }}
 *               onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)])}
 *             />
 *           </div>
 *           {files.length > 0 && (
 *             <div className={styles.fileList}>
 *               {files.map((f, i) => (
 *                 <div key={i} className={styles.fileChip}>
 *                   <span>📄 {f.name}</span>
 *                   <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>✕</button>
 *                 </div>
 *               ))}
 *             </div>
 *           )}
 *         </div>
 * 
 *         <Button type="submit" size="lg" loading={loading} fullWidth>
 *           {t.doctorDashboard.becomeDoctor.submit}
 *         </Button>
 *       </motion.form>
 *     </div>
 *   );
 * }
 * 
 * // ─── Doctor Dashboard (approved) ─────────────────────────────────────────────
 * function DoctorDashboard({ user, t }) {
 *   const navigate = useNavigate();
 *   return (
 *     <div className={styles.dashContent}>
 *       <motion.div className={styles.welcomeBanner} variants={fadeUp} initial="hidden" animate="visible">
 *         <div className={styles.welcomeLeft}>
 *           <Avatar name={`${user.firstName} ${user.lastName}`} size="xl" />
 *           <div>
 *             <p className={styles.welcomeGreeting}>Doctor Dashboard 👨‍⚕️</p>
 *             <h1 className={styles.welcomeName}>Dr. {user.firstName} {user.lastName}</h1>
 *             <p className={styles.welcomeEmail}>{user.email}</p>
 *           </div>
 *         </div>
 *         <div className={styles.welcomeStats}>
 *           {[
 *             { val: '0', label: t.doctorDashboard.myPatients },
 *             { val: '0', label: t.doctorDashboard.pendingRequests },
 *           ].map((s, i) => (
 *             <div key={i} className={styles.wStat}>
 *               <span className={styles.wStatVal}>{s.val}</span>
 *               <span className={styles.wStatLabel}>{s.label}</span>
 *             </div>
 *           ))}
 *         </div>
 *       </motion.div>
 * 
 *       <div className={styles.section}>
 *         <h2 className={styles.sectionTitle}>{t.doctorDashboard.myPatients}</h2>
 *         <div className={styles.emptyState}>
 *           <Users size={40} style={{ color: 'var(--color-text-tertiary)', marginBottom: 12 }} />
 *           <p>No patients yet. Your profile is live — patients can find and contact you.</p>
 *           <Button variant="outline" size="sm" onClick={() => navigate('/doctors')}>View your profile</Button>
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // ─── Main Dashboard Page ──────────────────────────────────────────────────────
 * export default function DashboardPage() {
 *   const { t } = useT();
 *   const { user } = useAuthStore();
 *   const navigate = useNavigate();
 * 
 *   if (!user) {
 *     navigate('/login');
 *     return null;
 *   }
 * 
 *   // Doctor who hasn't applied yet → show application form
 *   if (user.role === 'doctor' && !user.isApproved && !user.isPending) {
 *     return (
 *       <div className={styles.page}>
 *         <div className="container">
 *           <DoctorApplicationForm t={t} />
 *         </div>
 *       </div>
 *     );
 *   }
 * 
 *   // Doctor pending approval
 *   if (user.role === 'doctor' && user.isPending) {
 *     return (
 *       <div className={styles.page}>
 *         <div className="container">
 *           <motion.div className={styles.pendingCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
 *             <CheckCircle size={60} className={styles.pendingIcon} />
 *             <h2>{t.doctorDashboard.becomeDoctor.pending}</h2>
 *             <p>{t.doctorDashboard.becomeDoctor.pendingDesc}</p>
 *           </motion.div>
 *         </div>
 *       </div>
 *     );
 *   }
 * 
 *   return (
 *     <div className={styles.page}>
 *       <div className="container">
 *         {user.role === 'patient' && <PatientDashboard user={user} t={t} />}
 *         {user.role === 'doctor' && <DoctorDashboard user={user} t={t} />}
 *         {user.role === 'admin' && (
 *           <div className={styles.dashContent}>
 *             <motion.div className={styles.welcomeBanner} variants={fadeUp} initial="hidden" animate="visible">
 *               <div className={styles.welcomeLeft}>
 *                 <Avatar name={`${user.firstName} ${user.lastName}`} size="xl" />
 *                 <div>
 *                   <p className={styles.welcomeGreeting}>Admin Panel 🛡️</p>
 *                   <h1 className={styles.welcomeName}>{user.firstName} {user.lastName}</h1>
 *                   <p className={styles.welcomeEmail}>{user.email}</p>
 *                 </div>
 *               </div>
 *             </motion.div>
 *             <div className={styles.section}>
 *               <Button onClick={() => navigate('/admin')} size="lg" icon={<Search size={16}/>}>
 *                 Go to Admin Panel
 *               </Button>
 *             </div>
 *           </div>
 *         )}
 *       </div>
 *     </div>
 *   );
 * }
 * 
 */

/*
 * ──────────────────────────────────────────────────────────────────────────
 * FILE: src/pages/DashboardPage.module.css
 * ──────────────────────────────────────────────────────────────────────────
 *
 * .page {
 *   padding: calc(var(--nav-height) + 40px) 0 80px;
 *   min-height: 100vh;
 * }
 * 
 * .dashContent { display: flex; flex-direction: column; gap: 32px; }
 * 
 * /* ── Welcome Banner ── * /
 * .welcomeBanner {
 *   background: linear-gradient(135deg, var(--color-primary-muted) 0%, var(--color-teal-muted) 100%);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 28px 32px;
 *   display: flex;
 *   align-items: center;
 *   justify-content: space-between;
 *   gap: 24px;
 *   flex-wrap: wrap;
 * }
 * 
 * .welcomeLeft { display: flex; align-items: center; gap: 16px; }
 * 
 * .welcomeGreeting { font-size: 13px; color: var(--color-text-tertiary); margin-bottom: 4px; font-weight: 500; }
 * 
 * .welcomeName {
 *   font-family: var(--font-display);
 *   font-size: 26px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 *   letter-spacing: -0.02em;
 *   margin-bottom: 4px;
 * }
 * 
 * .welcomeEmail { font-size: 13px; color: var(--color-text-secondary); }
 * 
 * .welcomeStats { display: flex; gap: 28px; }
 * 
 * .wStat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
 * .wStatVal { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--color-text-primary); }
 * .wStatLabel { font-size: 12px; color: var(--color-text-tertiary); text-align: center; }
 * 
 * /* ── Section ── * /
 * .section { display: flex; flex-direction: column; gap: 16px; }
 * 
 * .sectionHeader { display: flex; align-items: center; justify-content: space-between; }
 * 
 * .sectionTitle {
 *   font-size: 18px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 * }
 * 
 * .viewAll { font-size: 13px; color: var(--color-primary); font-weight: 500; }
 * .viewAll:hover { text-decoration: underline; }
 * 
 * /* ── Quick Actions ── * /
 * .quickActions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
 * 
 * @media (max-width: 640px) { .quickActions { grid-template-columns: repeat(3, 1fr); } }
 * 
 * .quickAction {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 24px 16px;
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   gap: 12px;
 *   cursor: pointer;
 *   transition: all var(--transition-base);
 * }
 * 
 * .qaIcon {
 *   width: 52px;
 *   height: 52px;
 *   border-radius: var(--radius-lg);
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 * }
 * 
 * .qaLabel { font-size: 13px; font-weight: 600; color: var(--color-text-primary); text-align: center; }
 * 
 * /* ── Two Col ── * /
 * .twoCol { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
 * 
 * @media (max-width: 960px) { .twoCol { grid-template-columns: 1fr; } }
 * 
 * /* ── Card List ── * /
 * .cardList { display: flex; flex-direction: column; gap: 10px; }
 * 
 * .listCard {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-lg);
 *   padding: 14px 16px;
 *   display: flex;
 *   align-items: center;
 *   gap: 12px;
 *   transition: box-shadow var(--transition-fast);
 * }
 * .listCard:hover { box-shadow: var(--shadow-sm); }
 * 
 * .listCardInfo { flex: 1; min-width: 0; }
 * .listCardTitle { font-size: 14px; font-weight: 600; color: var(--color-text-primary); display: block; }
 * .listCardSub { font-size: 12px; color: var(--color-text-tertiary); }
 * 
 * .statusPill {
 *   padding: 3px 10px;
 *   border-radius: var(--radius-full);
 *   font-size: 11px;
 *   font-weight: 600;
 *   text-transform: capitalize;
 *   flex-shrink: 0;
 * }
 * .pillActive { background: var(--color-success-muted); color: var(--color-success); }
 * .pillEnded { background: var(--color-bg-tertiary); color: var(--color-text-tertiary); }
 * 
 * .emptyState {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 40px 24px;
 *   text-align: center;
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   gap: 12px;
 *   color: var(--color-text-secondary);
 *   font-size: 14px;
 * }
 * 
 * /* ── Side Widgets ── * /
 * .sideWidgets { display: flex; flex-direction: column; gap: 14px; }
 * 
 * .tipCard {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 20px;
 *   display: flex;
 *   gap: 14px;
 *   align-items: flex-start;
 * }
 * 
 * .tipIcon { font-size: 28px; flex-shrink: 0; }
 * 
 * .tipCard h3 { font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 6px; }
 * .tipCard p { font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; }
 * 
 * .aiPromoCard {
 *   background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal) 100%);
 *   border-radius: var(--radius-xl);
 *   padding: 20px;
 *   display: flex;
 *   gap: 14px;
 *   align-items: center;
 *   transition: all var(--transition-base);
 * }
 * .aiPromoCard:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
 * 
 * .aiPromoIcon {
 *   font-size: 24px;
 *   color: white;
 *   width: 44px;
 *   height: 44px;
 *   background: rgba(255,255,255,0.15);
 *   border-radius: var(--radius-md);
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   flex-shrink: 0;
 * }
 * 
 * .aiPromoCard h3 { font-size: 14px; font-weight: 600; color: white; margin-bottom: 4px; }
 * .aiPromoCard p { font-size: 12px; color: rgba(255,255,255,0.8); line-height: 1.5; }
 * .aiPromoArrow { font-size: 20px; color: white; margin-left: auto; flex-shrink: 0; }
 * 
 * .ratingCard {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 18px;
 *   display: flex;
 *   flex-direction: column;
 *   gap: 10px;
 * }
 * 
 * .ratingCard h3 { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
 * .ratingCard p { font-size: 12px; color: var(--color-text-secondary); }
 * 
 * .starRow { display: flex; gap: 6px; }
 * 
 * .starBtn {
 *   font-size: 22px;
 *   color: var(--color-border-strong);
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 *   line-height: 1;
 * }
 * .starBtn:hover { color: #F59E0B; transform: scale(1.2); }
 * 
 * /* ── Doctor Application Form ── * /
 * .applyWrapper { max-width: 680px; margin: 0 auto; }
 * 
 * .applyHeader {
 *   text-align: center;
 *   margin-bottom: 40px;
 * }
 * 
 * .applyBadge {
 *   display: inline-flex;
 *   background: var(--color-primary-muted);
 *   color: var(--color-primary);
 *   border-radius: var(--radius-full);
 *   padding: 6px 16px;
 *   font-size: 13px;
 *   font-weight: 600;
 *   margin-bottom: 16px;
 * }
 * 
 * .applyHeader h1 {
 *   font-family: var(--font-display);
 *   font-size: 34px;
 *   font-weight: 700;
 *   letter-spacing: -0.025em;
 *   color: var(--color-text-primary);
 *   margin-bottom: 10px;
 * }
 * 
 * .applyHeader p { font-size: 16px; color: var(--color-text-secondary); }
 * 
 * .applyForm {
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 36px;
 *   display: flex;
 *   flex-direction: column;
 *   gap: 22px;
 *   box-shadow: var(--shadow-md);
 * }
 * 
 * .formRow { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
 * @media (max-width: 580px) { .formRow { grid-template-columns: 1fr; } }
 * 
 * .formField { display: flex; flex-direction: column; gap: 6px; }
 * 
 * .formLabel {
 *   font-size: 13px;
 *   font-weight: 500;
 *   color: var(--color-text-secondary);
 *   letter-spacing: 0.01em;
 * }
 * 
 * .formSelect {
 *   padding: 11px 14px;
 *   border: 1.5px solid var(--color-border);
 *   border-radius: var(--radius-md);
 *   background: var(--color-surface);
 *   color: var(--color-text-primary);
 *   font-size: 14px;
 *   font-family: var(--font-body);
 *   outline: none;
 *   transition: border-color var(--transition-fast);
 *   cursor: pointer;
 * }
 * .formSelect:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-muted); }
 * 
 * .formTextarea {
 *   padding: 11px 14px;
 *   border: 1.5px solid var(--color-border);
 *   border-radius: var(--radius-md);
 *   background: var(--color-surface);
 *   color: var(--color-text-primary);
 *   font-size: 14px;
 *   font-family: var(--font-body);
 *   outline: none;
 *   resize: vertical;
 *   transition: border-color var(--transition-fast);
 *   line-height: 1.6;
 * }
 * .formTextarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-muted); }
 * 
 * .uploadZone {
 *   border: 2px dashed var(--color-border-strong);
 *   border-radius: var(--radius-lg);
 *   padding: 36px 20px;
 *   text-align: center;
 *   cursor: pointer;
 *   transition: all var(--transition-fast);
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   gap: 8px;
 * }
 * .uploadZone:hover { border-color: var(--color-primary); background: var(--color-primary-muted); }
 * 
 * .uploadIcon { color: var(--color-text-tertiary); }
 * .uploadZone:hover .uploadIcon { color: var(--color-primary); }
 * 
 * .uploadZone p { font-size: 14px; font-weight: 500; color: var(--color-text-secondary); }
 * .uploadZone span { font-size: 12px; color: var(--color-text-tertiary); }
 * 
 * .fileList { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
 * 
 * .fileChip {
 *   display: flex;
 *   align-items: center;
 *   gap: 8px;
 *   background: var(--color-bg-tertiary);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-full);
 *   padding: 5px 12px;
 *   font-size: 12px;
 *   color: var(--color-text-secondary);
 * }
 * 
 * .fileChip button {
 *   color: var(--color-text-tertiary);
 *   cursor: pointer;
 *   font-size: 13px;
 *   line-height: 1;
 *   transition: color var(--transition-fast);
 * }
 * .fileChip button:hover { color: var(--color-error); }
 * 
 * /* ── Pending Card ── * /
 * .pendingCard {
 *   max-width: 480px;
 *   margin: 80px auto;
 *   text-align: center;
 *   background: var(--color-surface);
 *   border: 1px solid var(--color-border);
 *   border-radius: var(--radius-xl);
 *   padding: 48px 36px;
 *   display: flex;
 *   flex-direction: column;
 *   align-items: center;
 *   gap: 16px;
 *   box-shadow: var(--shadow-lg);
 * }
 * 
 * .pendingIcon { color: var(--color-success); }
 * 
 * .pendingCard h2 {
 *   font-family: var(--font-display);
 *   font-size: 24px;
 *   font-weight: 700;
 *   color: var(--color-text-primary);
 * }
 * 
 * .pendingCard p { font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; }
 * 
 * .pendingTimeline {
 *   display: flex;
 *   align-items: center;
 *   gap: 0;
 *   margin-top: 8px;
 *   flex-wrap: wrap;
 *   justify-content: center;
 *   gap: 8px;
 * }
 * 
 * .timelineStep {
 *   display: flex;
 *   align-items: center;
 *   gap: 8px;
 * }
 * 
 * .timelineDot {
 *   width: 28px;
 *   height: 28px;
 *   border-radius: 50%;
 *   background: var(--color-bg-tertiary);
 *   border: 2px solid var(--color-border-strong);
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   font-size: 12px;
 *   font-weight: 700;
 *   color: var(--color-text-tertiary);
 *   flex-shrink: 0;
 * }
 * 
 * .timelineDotDone {
 *   background: var(--color-success);
 *   border-color: var(--color-success);
 *   color: white;
 * }
 * 
 * .timelineLabel { font-size: 12px; color: var(--color-text-secondary); white-space: nowrap; }
 * .timelineLine { width: 32px; height: 2px; background: var(--color-border); }
 * 
 */
