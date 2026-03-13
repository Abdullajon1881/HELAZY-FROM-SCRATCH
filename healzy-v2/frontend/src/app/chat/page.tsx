'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Phone, Video, MoreVertical, Search,
  Plus, ArrowLeft, Check, CheckCheck, X, Smile,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { Avatar, Badge, EmptyState } from '@/components/ui';
import { cn, formatTime } from '@/utils/helpers';

interface Message {
  id: string;
  senderId: string;
  text: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  status: 'active' | 'ended';
  isOnline: boolean;
  unreadCount: number;
  messages: Message[];
  lastMessage?: Message;
}

const MOCK_CONVS: Conversation[] = [
  {
    id: 'c1', doctorName: 'Dilnoza Yusupova', doctorSpecialty: 'Cardiologist',
    patientName: 'Amir Karimov', status: 'active', isOnline: true, unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'doctor', text: 'Hello! How can I help you today?', sentAt: new Date(Date.now() - 3600000).toISOString(), status: 'read' },
      { id: 'm2', senderId: 'patient', text: 'I have been having chest pain for the past few days.', sentAt: new Date(Date.now() - 3500000).toISOString(), status: 'read' },
      { id: 'm3', senderId: 'doctor', text: 'I understand. Can you describe the pain? Is it sharp or dull? Does it radiate to your arm or jaw?', sentAt: new Date(Date.now() - 3400000).toISOString(), status: 'read' },
      { id: 'm4', senderId: 'patient', text: 'It\'s more of a dull ache. Sometimes it goes to my left arm.', sentAt: new Date(Date.now() - 3300000).toISOString(), status: 'read' },
      { id: 'm5', senderId: 'doctor', text: 'That pattern can sometimes indicate angina. I want you to come in immediately for an ECG and blood tests. This is important.', sentAt: new Date(Date.now() - 60000).toISOString(), status: 'delivered' },
      { id: 'm6', senderId: 'doctor', text: 'Also, please avoid strenuous activity until we see the results.', sentAt: new Date(Date.now() - 30000).toISOString(), status: 'delivered' },
    ],
  },
  {
    id: 'c2', doctorName: 'Bobur Toshmatov', doctorSpecialty: 'Neurologist',
    patientName: 'Amir Karimov', status: 'active', isOnline: false, unreadCount: 0,
    messages: [
      { id: 'm7', senderId: 'doctor', text: 'Thank you for the test results. The MRI looks normal. Your headaches are likely tension-type.', sentAt: new Date(Date.now() - 86400000).toISOString(), status: 'read' },
      { id: 'm8', senderId: 'patient', text: 'That\'s a relief! What do you recommend?', sentAt: new Date(Date.now() - 85000000).toISOString(), status: 'read' },
      { id: 'm9', senderId: 'doctor', text: 'Try relaxation techniques, regular sleep schedule, and ibuprofen for acute episodes. Follow up in 2 weeks.', sentAt: new Date(Date.now() - 84000000).toISOString(), status: 'read' },
    ],
  },
];

function formatDay(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

function groupByDay(messages: Message[]) {
  const groups: Record<string, Message[]> = {};
  messages.forEach((m) => {
    const day = format(new Date(m.sentAt), 'yyyy-MM-dd');
    if (!groups[day]) groups[day] = [];
    groups[day].push(m);
  });
  return Object.entries(groups).map(([day, msgs]) => ({ day, msgs }));
}

export default function ChatPage() {
  const { t } = useT();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState(MOCK_CONVS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId);
  const isPatient = user?.role === 'patient';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages]);

  const sendMessage = useCallback(() => {
    if (!message.trim() || !activeId) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: isPatient ? 'patient' : 'doctor',
      text: message.trim(),
      sentAt: new Date().toISOString(),
      status: 'sent',
    };
    setConversations((prev) => prev.map((c) =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg }
        : c
    ));
    setMessage('');

    // Simulate response after 1.5s
    setTimeout(() => {
      const reply: Message = {
        id: `m-${Date.now()}-r`,
        senderId: isPatient ? 'doctor' : 'patient',
        text: 'Thank you for your message. I\'ll respond shortly.',
        sentAt: new Date().toISOString(),
        status: 'delivered',
      };
      setConversations((prev) => prev.map((c) =>
        c.id === activeId ? { ...c, messages: [...c.messages, reply] } : c
      ));
    }, 1500);
  }, [message, activeId, isPatient]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const selectConv = (id: string) => {
    setActiveId(id);
    setShowMobileList(false);
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, unreadCount: 0 } : c));
  };

  const filtered = conversations.filter((c) =>
    !search || c.doctorName.toLowerCase().includes(search.toLowerCase()) || c.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[var(--bg-primary)]">
      {/* Conversation list */}
      <aside className={cn(
        'flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] w-full md:w-80 lg:w-96 flex-shrink-0',
        !showMobileList && 'hidden md:flex'
      )}>
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-heading font-bold text-lg">{t.chat.title}</h1>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.chat.searchConv}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState icon="💬" title={t.chat.noConversations} />
          ) : (
            filtered.map((conv) => {
              const name = isPatient ? `Dr. ${conv.doctorName}` : conv.patientName;
              const sub = isPatient ? conv.doctorSpecialty : 'Patient';
              return (
                <motion.button
                  key={conv.id}
                  onClick={() => selectConv(conv.id)}
                  whileHover={{ x: 2 }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-[var(--border-color)]',
                    activeId === conv.id ? 'bg-primary-50 dark:bg-primary-950/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <Avatar name={name} size="md" online={conv.isOnline} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate">{name}</span>
                      {conv.lastMessage && (
                        <span className="text-xs text-[var(--text-muted)] flex-shrink-0 ml-2">
                          {formatTime(conv.lastMessage.sentAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-[var(--text-muted)] truncate">{conv.lastMessage?.text || sub}</p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center flex-shrink-0 ml-2">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat window */}
      <div className={cn('flex-1 flex flex-col', showMobileList && 'hidden md:flex')}>
        {!active ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon="💬"
              title="Select a conversation"
              description="Choose a consultation from the list to start messaging."
            />
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <Avatar
                  name={isPatient ? `Dr. ${active.doctorName}` : active.patientName}
                  size="sm"
                  online={active.isOnline}
                />
                <div>
                  <p className="font-semibold text-sm font-heading">
                    {isPatient ? `Dr. ${active.doctorName}` : active.patientName}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {active.isOnline ? t.chat.online : t.chat.offline}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-secondary)] transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-secondary)] transition-colors">
                  <Video className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-secondary)] transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
              {active.status === 'ended' && (
                <div className="text-center py-2">
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] px-3 py-1 rounded-full">
                    {t.chat.consultationEnded}
                  </span>
                </div>
              )}
              {groupByDay(active.messages).map(({ day, msgs }) => (
                <div key={day}>
                  <div className="text-center mb-4">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] px-3 py-1 rounded-full">
                      {formatDay(msgs[0].sentAt)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {msgs.map((msg) => {
                      const isMine = (isPatient && msg.senderId === 'patient') || (!isPatient && msg.senderId === 'doctor');
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[72%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                              isMine
                                ? 'bg-primary-600 text-white bubble-sent'
                                : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] bubble-received'
                            }`}>
                              {msg.text}
                            </div>
                            <div className="flex items-center gap-1 px-1">
                              <span className="text-xs text-[var(--text-muted)]">{formatTime(msg.sentAt)}</span>
                              {isMine && (
                                msg.status === 'read'
                                  ? <CheckCheck className="w-3.5 h-3.5 text-primary-500" />
                                  : <Check className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {active.status === 'ended' ? (
              <div className="px-4 pb-4 pt-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] text-center">
                <p className="text-sm text-[var(--text-muted)]">{t.chat.consultationEnded}</p>
              </div>
            ) : (
              <div className="px-4 pb-4 pt-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <div className="flex items-end gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                  <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary-600 transition-colors flex-shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={t.chat.typeMessage}
                    rows={1}
                    className="flex-1 bg-transparent text-sm resize-none focus:outline-none max-h-28 leading-relaxed py-1"
                    style={{ minHeight: '36px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white transition-colors flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
