import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Phone, Video, MoreVertical,
  Check, CheckCheck, Search, Plus, X, ArrowLeft
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { useT } from '../../hooks/useT';
import { useAuthStore } from '../../features/auth/store';
import { useChatStore } from '../../features/chat/store';
import { Chat as ChatAPI } from '../../services';
import { USE_MOCK, MOCK_MESSAGES } from '../../services/mockData';
import { createChatWebSocket } from '../../services/chatApi';
import Avatar from '../../components/Avatar';
import styles from './ChatPage.module.css';
import toast from 'react-hot-toast';

// Format message time
function formatTime(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return format(d, 'HH:mm');
}

function formatDay(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

// Group messages by date
function groupByDay(messages) {
  const groups = {};
  messages.forEach(m => {
    const day = format(new Date(m.sentAt), 'yyyy-MM-dd');
    if (!groups[day]) groups[day] = [];
    groups[day].push(m);
  });
  return Object.entries(groups).map(([day, msgs]) => ({ day, msgs }));
}

// ─── Conversation List Item ───────────────────────────────────────────────────
function ConvItem({ conv, active, onClick }) {
  const { user } = useAuthStore();
  const other = user?.role === 'patient' ? conv.doctor : conv.patient;
  const name = user?.role === 'patient'
    ? `Dr. ${conv.doctor?.firstName} ${conv.doctor?.lastName}`
    : `${conv.patient?.firstName} ${conv.patient?.lastName}`;

  return (
    <motion.button
      className={[styles.convItem, active ? styles.convItemActive : ''].join(' ')}
      onClick={onClick}
      whileHover={{ x: 2 }}
    >
      <div className={styles.convAvatar}>
        <Avatar name={name} size="md" online={conv.status === 'active'} />
      </div>
      <div className={styles.convInfo}>
        <div className={styles.convTop}>
          <span className={styles.convName}>{name}</span>
          {conv.lastMessage && (
            <span className={styles.convTime}>{formatTime(conv.lastMessage.sentAt)}</span>
          )}
        </div>
        <div className={styles.convBottom}>
          <span className={styles.convLastMsg}>
            {conv.lastMessage?.text || 'Consultation started'}
          </span>
          {conv.unreadCount > 0 && (
            <span className={styles.unreadBadge}>{conv.unreadCount}</span>
          )}
        </div>
        {conv.status === 'ended' && (
          <span className={styles.endedChip}>Ended</span>
        )}
      </div>
    </motion.button>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, isOwn, showAvatar, partnerName }) {
  return (
    <div className={[styles.msgRow, isOwn ? styles.msgRowOwn : ''].join(' ')}>
      {!isOwn && showAvatar && (
        <Avatar name={partnerName} size="xs" />
      )}
      {!isOwn && !showAvatar && <div className={styles.avatarSpacer} />}
      <div className={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther].join(' ')}>
        {message.type === 'file' ? (
          <div className={styles.fileMsg}>
            <Paperclip size={14} />
            <span>{message.fileName || 'File'}</span>
          </div>
        ) : (
          <p>{message.text}</p>
        )}
        <div className={styles.msgMeta}>
          <span>{formatTime(message.sentAt)}</span>
          {isOwn && <CheckCheck size={12} className={styles.readIcon} />}
        </div>
      </div>
    </div>
  );
}

// ─── Main Chat Page ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const { t } = useT();
  const { user, token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [convSearch, setConvSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  const wsRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);
  const inputRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const partnerName = user?.role === 'patient'
    ? `Dr. ${activeConv?.doctor?.firstName} ${activeConv?.doctor?.lastName}`
    : `${activeConv?.patient?.firstName} ${activeConv?.patient?.lastName}`;

  // Load conversations
  useEffect(() => {
    ChatAPI.getConversations().then(res => {
      const convs = res.data;
      setConversations(convs);
      // Open conversation from URL param
      const paramId = searchParams.get('conversation');
      if (paramId) {
        const id = parseInt(paramId);
        setActiveConvId(id);
      } else if (convs.length > 0) {
        setActiveConvId(convs[0].id);
      }
    }).catch(() => toast.error('Failed to load conversations'))
    .finally(() => setLoading(false));
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    setMessages([]);
    setLoading(true);

    if (USE_MOCK) {
      // Simulate loading mock messages
      setTimeout(() => {
        setMessages(MOCK_MESSAGES[activeConvId] || []);
        setLoading(false);
      }, 400);
    } else {
      ChatAPI.getMessages(activeConvId)
        .then(res => setMessages(res.data.results || res.data))
        .catch(() => toast.error('Failed to load messages'))
        .finally(() => setLoading(false));
    }

    // Close previous WS
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Open WebSocket (only when not mocking)
    if (!USE_MOCK && token) {
      const ws = createChatWebSocket(activeConvId, token);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message') {
          const msg = {
            id: Date.now(),
            conversationId: activeConvId,
            senderId: data.sender_id,
            text: data.message,
            type: 'text',
            sentAt: new Date().toISOString(),
          };
          setMessages(prev => [...prev, msg]);
          // Update conversation last message
          setConversations(prev => prev.map(c =>
            c.id === activeConvId ? { ...c, lastMessage: msg } : c
          ));
        }
        if (data.type === 'typing') {
          if (data.sender_id !== user.id) {
            setTyping(true);
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = setTimeout(() => setTyping(false), 3000);
          }
        }
      };

      ws.onerror = () => toast.error('Connection error');
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [activeConvId, token]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async () => {
    if (!text.trim() || !activeConvId || sending) return;

    const msgText = text.trim();
    setText('');

    // Optimistic message
    const optimistic = {
      id: Date.now(),
      conversationId: activeConvId,
      senderId: user.id,
      text: msgText,
      type: 'text',
      sentAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setConversations(prev => prev.map(c =>
      c.id === activeConvId ? { ...c, lastMessage: optimistic } : c
    ));

    if (USE_MOCK) {
      // Mock: simulate doctor response after delay
      setTimeout(() => {
        const responses = [
          "Thank you for sharing that. Can you tell me more?",
          "I understand. How long have you been experiencing this?",
          "That's helpful information. I'll note that in your record.",
          "Based on what you've described, I recommend we run some tests.",
          "Please don't worry — this is very common and treatable.",
        ];
        const reply = {
          id: Date.now() + 1,
          conversationId: activeConvId,
          senderId: activeConv?.doctor?.userId || 2,
          text: responses[Math.floor(Math.random() * responses.length)],
          type: 'text',
          sentAt: new Date().toISOString(),
        };
        setTyping(false);
        setMessages(prev => [...prev, reply]);
        setConversations(prev => prev.map(c =>
          c.id === activeConvId ? { ...c, lastMessage: reply } : c
        ));
      }, 1200);

      // Show typing
      setTimeout(() => setTyping(true), 300);
      setTimeout(() => setTyping(false), 1150);
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat_message', message: msgText }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    // Send typing indicator
    if (!USE_MOCK && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing' }));
    }
  };

  const filteredConvs = conversations.filter(c => {
    const name = user?.role === 'patient'
      ? `${c.doctor?.firstName} ${c.doctor?.lastName}`
      : `${c.patient?.firstName} ${c.patient?.lastName}`;
    return name.toLowerCase().includes(convSearch.toLowerCase());
  });

  const grouped = groupByDay(messages);

  return (
    <div className={styles.page}>
      {/* ── Conversation Sidebar ── */}
      <aside className={[styles.sidebar, showSidebar ? styles.sidebarVisible : ''].join(' ')}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>{t.chat.title}</h2>
          <button onClick={() => navigate('/doctors')} className={styles.newChatBtn} title={t.chat.newConsultation}>
            <Plus size={18} />
          </button>
        </div>
        <div className={styles.convSearch}>
          <Search size={15} className={styles.convSearchIcon} />
          <input
            placeholder="Search..."
            value={convSearch}
            onChange={e => setConvSearch(e.target.value)}
            className={styles.convSearchInput}
          />
        </div>
        <div className={styles.convList}>
          {filteredConvs.length === 0 && !loading && (
            <div className={styles.noConvs}>
              <p>No conversations yet.</p>
              <button onClick={() => navigate('/doctors')} className={styles.findDoctorBtn}>Find a Doctor</button>
            </div>
          )}
          {filteredConvs.map(conv => (
            <ConvItem
              key={conv.id}
              conv={conv}
              active={conv.id === activeConvId}
              onClick={() => { setActiveConvId(conv.id); setShowSidebar(false); }}
            />
          ))}
        </div>
      </aside>

      {/* ── Chat Area ── */}
      <main className={styles.chatArea}>
        {!activeConvId ? (
          <div className={styles.emptyChat}>
            <div className={styles.emptyChatIcon}>💬</div>
            <h3>{t.chat.noConversation}</h3>
            <p>Start a consultation by finding a doctor.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <button className={styles.backToList} onClick={() => setShowSidebar(true)}>
                <ArrowLeft size={18} />
              </button>
              <Avatar name={partnerName} size="md" online={activeConv?.status === 'active'} />
              <div className={styles.chatHeaderInfo}>
                <h3>{partnerName}</h3>
                <span className={styles.chatStatus}>
                  {activeConv?.status === 'active'
                    ? (typing ? t.chat.typing : t.chat.online)
                    : t.chat.offline
                  }
                </span>
              </div>
              <div className={styles.chatHeaderActions}>
                <button className={styles.headerAction}><Phone size={18} /></button>
                <button className={styles.headerAction}><Video size={18} /></button>
                <button className={styles.headerAction}><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {loading ? (
                <div className={styles.msgLoading}>
                  {[1,2,3,4].map(i => (
                    <div key={i} className={[styles.msgSkeleton, i % 2 === 0 ? styles.msgSkeletonRight : ''].join(' ')} />
                  ))}
                </div>
              ) : (
                grouped.map(({ day, msgs }) => (
                  <div key={day}>
                    <div className={styles.dayDivider}>
                      <span>{formatDay(msgs[0].sentAt)}</span>
                    </div>
                    {msgs.map((msg, i) => {
                      const isOwn = msg.senderId === user.id;
                      const showAvatar = !isOwn && (i === 0 || msgs[i-1].senderId !== msg.senderId);
                      return (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isOwn={isOwn}
                          showAvatar={showAvatar}
                          partnerName={partnerName}
                        />
                      );
                    })}
                  </div>
                ))
              )}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    className={styles.typingRow}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                  >
                    <Avatar name={partnerName} size="xs" />
                    <div className={styles.typingBubble}>
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeConv?.status === 'ended' && (
                <div className={styles.endedBanner}>{t.chat.consultationEnded}</div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {activeConv?.status !== 'ended' && (
              <div className={styles.inputArea}>
                <button className={styles.attachBtn} title={t.chat.attachFile}>
                  <Paperclip size={18} />
                </button>
                <div className={styles.textInputWrap}>
                  <textarea
                    ref={inputRef}
                    className={styles.textInput}
                    placeholder={t.chat.messagePlaceholder}
                    value={text}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                </div>
                <motion.button
                  className={[styles.sendBtn, text.trim() ? styles.sendBtnActive : ''].join(' ')}
                  onClick={handleSend}
                  disabled={!text.trim()}
                  whileTap={{ scale: 0.9 }}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}


