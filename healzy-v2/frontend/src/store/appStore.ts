import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/i18n/translations';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
}

interface ChatState {
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;
  conversations: any[];
  setConversations: (convs: any[]) => void;
  addMessage: (convId: string, message: any) => void;
}

interface AIState {
  sessions: AISession[];
  activeSessionId: string | null;
  isGenerating: boolean;
  createSession: () => string;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, msg: AIMessage) => void;
  setGenerating: (v: boolean) => void;
  clearSession: (id: string) => void;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface AISession {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en' as Locale,
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'healzy-locale' }
  )
);

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}));

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  clearUnread: () => set({ unreadCount: 0 }),
}));

export const useChatStore = create<ChatState>()((set) => ({
  activeConversationId: null,
  setActiveConversation: (id) => set({ activeConversationId: id }),
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  addMessage: (convId, message) => set((state) => ({
    conversations: state.conversations.map((c) =>
      c.id === convId
        ? { ...c, messages: [...(c.messages || []), message], lastMessage: message }
        : c
    ),
  })),
}));

export const useAIStore = create<AIState>()((set, get) => ({
  sessions: [],
  activeSessionId: null,
  isGenerating: false,
  createSession: () => {
    const id = `session-${Date.now()}`;
    const session: AISession = {
      id,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ sessions: [session, ...s.sessions], activeSessionId: id }));
    return id;
  },
  setActiveSession: (id) => set({ activeSessionId: id }),
  addMessage: (sessionId, msg) => set((state) => ({
    sessions: state.sessions.map((s) =>
      s.id === sessionId
        ? {
            ...s,
            messages: [...s.messages, msg],
            title: s.messages.length === 0 && msg.role === 'user'
              ? msg.content.slice(0, 40) + (msg.content.length > 40 ? '...' : '')
              : s.title,
          }
        : s
    ),
  })),
  setGenerating: (isGenerating) => set({ isGenerating }),
  clearSession: (id) => set((s) => ({
    sessions: s.sessions.filter((sess) => sess.id !== id),
    activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
  })),
}));
