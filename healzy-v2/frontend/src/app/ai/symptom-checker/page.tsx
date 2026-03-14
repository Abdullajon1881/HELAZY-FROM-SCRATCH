'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, Volume2, VolumeX, Plus, Trash2,
  Image as ImageIcon, Sparkles, AlertCircle, X, Stethoscope,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useT } from '@/i18n/useT';
import { useAIStore, type AISession } from '@/store/appStore';
import { Avatar, Spinner } from '@/components/ui';
import { fileToBase64, formatRelativeTime } from '@/utils/helpers';
import Link from 'next/link';

const QUICK_PROMPTS = [
  'I have a headache and fever',
  'My blood pressure is high',
  'What vitamins should I take daily?',
  'I have chest pain, is it serious?',
  'My child has a rash',
];

function MessageBubble({ msg }: { msg: any }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-glow">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {msg.imageUrl && (
          <img src={msg.imageUrl} alt="uploaded" className="max-w-xs rounded-xl mb-1 border border-[var(--border-color)]" />
        )}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-primary-600 text-white bubble-sent'
            : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] bubble-received'
        }`}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="prose-healzy">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-xs text-[var(--text-muted)] px-1">{formatRelativeTime(msg.createdAt)}</span>
      </div>
    </motion.div>
  );
}

export default function AIPage() {
  const { t } = useT();
  const { sessions, activeSessionId, isGenerating, createSession, setActiveSession, addMessage, setGenerating, clearSession } = useAIStore();

  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isGenerating]);

  /// Real API call to backend — Claude Sonnet 4.6
const callAI = async (
  text: string,
  img?: string,
  history: any[] = []
): Promise<string> => {
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    {
      role: 'user',
      content: text,
      ...(img && { imageBase64: img }),
    },
  ];

  const token = localStorage.getItem('accessToken');

  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      messages,
      lang: localStorage.getItem('locale') || 'en',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'AI request failed');
  }

  const data = await res.json();
  return data.message;
};

  const sendMessage = async () => {
    if ((!input.trim() && !imageBase64) || isGenerating) return;

    let sessionId = activeSessionId;
    if (!sessionId) sessionId = createSession();

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: input.trim() || (imageBase64 ? 'Analyze this image' : ''),
      imageUrl: imagePreview || undefined,
      createdAt: new Date().toISOString(),
    };

    addMessage(sessionId, userMsg);
    const capturedInput = input.trim();
    const capturedImage = imageBase64;
    setInput('');
    setImagePreview(null);
    setImageBase64(null);
    setGenerating(true);

    try {
  const history = activeSession?.messages || [];
  const response = await callAI(
    capturedInput,
    capturedImage || undefined,
    history
  );
  addMessage(sessionId, {
    id: `msg-${Date.now()}-ai`,
    role: 'assistant',
    content: response,
    createdAt: new Date().toISOString(),
  });
} catch (err) {
  addMessage(sessionId, {
    id: `msg-${Date.now()}-err`,
    role: 'assistant',
    content:
      '⚠️ Sorry, the AI assistant is temporarily unavailable. Please check your connection or try again shortly.',
    createdAt: new Date().toISOString(),
  });
} finally {
  setGenerating(false);
}
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setImageBase64(b64);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const toggleRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: any) => {
      setInput((prev) => prev + ' ' + e.results[0][0].transcript);
      setIsRecording(false);
    };
    r.onerror = () => setIsRecording(false);
    r.start();
    recognitionRef.current = r;
    setIsRecording(true);
  };

  const speakLast = () => {
    if (!activeSession?.messages.length) return;
    const last = [...activeSession.messages].reverse().find((m) => m.role === 'assistant');
    if (!last) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(last.content.replace(/[*#`]/g, ''));
    u.onend = () => setIsSpeaking(false);
    synthRef.current = u;
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[var(--bg-primary)]">
      {/* Sidebar — session history */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="p-4 border-b border-[var(--border-color)]">
          <button
            onClick={() => { const id = createSession(); setActiveSession(id); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> {t.ai.newChat}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center py-8">No conversations yet</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSession(s.id)}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors mb-1 ${
                  s.id === activeSessionId ? 'bg-primary-50 dark:bg-primary-950/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <span className="text-sm flex-1 truncate">{s.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); clearSession(s.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
        {/* Disclaimer */}
        <div className="p-3 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">{t.ai.disclaimer}</p>
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-base">{t.ai.title}</h1>
              <p className="text-xs text-[var(--text-muted)]">{t.ai.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeSession && (
              <button
                onClick={speakLast}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isSpeaking ? t.ai.stopSpeak : t.ai.speak}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
            <Link href="/doctors" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 rounded-xl hover:bg-primary-100 transition-colors">
              <Stethoscope className="w-3.5 h-3.5" /> {t.ai.findDoctor}
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold mb-2">{t.ai.title}</h2>
                <p className="text-[var(--text-secondary)] max-w-sm">{t.ai.subtitle}</p>
              </div>
              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); textareaRef.current?.focus(); }}
                    className="px-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="flex items-start gap-2 text-xs text-[var(--text-muted)] max-w-sm bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                {t.ai.disclaimer}
              </div>
            </div>
          ) : (
            <>
              {activeSession.messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
              {isGenerating && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-glow">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] bubble-received">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Spinner size="sm" />
                      {t.ai.thinking}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="px-4 pb-2">
            <div className="relative inline-block">
              <img src={imagePreview} alt="preview" className="h-16 w-16 object-cover rounded-xl border border-[var(--border-color)]" />
              <button
                onClick={() => { setImagePreview(null); setImageBase64(null); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 pb-4 pt-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-end gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
            {/* Image upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-primary-600 flex-shrink-0"
              title={t.ai.image}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t.ai.placeholder}
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none focus:outline-none max-h-32 leading-relaxed py-1"
              style={{ minHeight: '36px' }}
            />

            {/* Voice */}
            <button
              onClick={toggleRecording}
              className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors flex-shrink-0 ${
                isRecording ? 'bg-red-500 text-white animate-pulse-slow' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-600'
              }`}
              title={isRecording ? t.ai.stopVoice : t.ai.voice}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={(!input.trim() && !imageBase64) || isGenerating}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
