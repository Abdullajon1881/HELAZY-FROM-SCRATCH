import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'healzy-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────────────────
export const useUIStore = create(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      sidebarOpen: false,
      notifications: [],

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
      }),
      setLanguage: (language) => set({ language }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { id: Date.now(), ...notification }]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
    }),
    {
      name: 'healzy-ui',
      partialize: (state) => ({ theme: state.theme, language: state.language }),
    }
  )
);

// ─── Chat Store ───────────────────────────────────────────────────────────────
export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  onlineUsers: new Set(),
  typingUsers: {},
  wsConnection: null,

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  addMessage: (conversationId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: [...(state.messages[conversationId] || []), message]
    }
  })),
  setMessages: (conversationId, messages) => set((state) => ({
    messages: { ...state.messages, [conversationId]: messages }
  })),
  setUserOnline: (userId, online) => set((state) => {
    const onlineUsers = new Set(state.onlineUsers);
    if (online) onlineUsers.add(userId);
    else onlineUsers.delete(userId);
    return { onlineUsers };
  }),
  setTyping: (conversationId, userId, isTyping) => set((state) => ({
    typingUsers: {
      ...state.typingUsers,
      [conversationId]: isTyping
        ? { ...state.typingUsers[conversationId], [userId]: true }
        : Object.fromEntries(
            Object.entries(state.typingUsers[conversationId] || {}).filter(([k]) => k !== String(userId))
          )
    }
  })),
  setWsConnection: (ws) => set({ wsConnection: ws }),
  updateConversationLastMessage: (conversationId, message) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.id === conversationId ? { ...c, lastMessage: message, updatedAt: new Date().toISOString() } : c
    )
  })),
}));

// ─── AI Store ─────────────────────────────────────────────────────────────────
export const useAIStore = create(
  persist(
    (set, get) => ({
      dialogues: [],
      activeDialogueId: null,
      isLoading: false,

      setDialogues: (dialogues) => set({ dialogues }),
      setActiveDialogue: (id) => set({ activeDialogueId: id }),
      addMessage: (dialogueId, message) => set((state) => ({
        dialogues: state.dialogues.map(d =>
          d.id === dialogueId
            ? { ...d, messages: [...(d.messages || []), message] }
            : d
        )
      })),
      createDialogue: (dialogue) => set((state) => ({
        dialogues: [dialogue, ...state.dialogues],
        activeDialogueId: dialogue.id,
      })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'healzy-ai',
      partialize: (state) => ({ dialogues: state.dialogues.slice(0, 20), activeDialogueId: state.activeDialogueId }),
    }
  )
);
