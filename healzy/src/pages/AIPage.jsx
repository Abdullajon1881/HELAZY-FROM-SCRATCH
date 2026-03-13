import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Plus, Trash2, Image, AlertCircle } from 'lucide-react';
import { useT } from '../i18n/useT';
import { useAIStore } from '../store';
import Button from '../components/common/Button';
import styles from './AIPage.module.css';

// ─── Mock AI Response Generator ───────────────────────────────────────────────
const MOCK_RESPONSES = {
  headache: "Based on your description, there are several possible causes for your headache:\n\n**Tension headache** — the most common type, often caused by stress, poor posture, or eye strain.\n\n**Dehydration** — even mild dehydration can cause headaches. Try drinking 2-3 glasses of water.\n\n**Recommendation:** Rest in a quiet, dark room, apply a cold compress, and take an OTC pain reliever if needed. If the headache is severe, sudden, or accompanied by fever/vision changes, please see a doctor immediately.\n\n⚠️ *This is general information only. Please consult a doctor for proper diagnosis.*",
  cold: "Common cold symptoms typically include:\n\n• Runny or stuffy nose\n• Sore throat\n• Cough\n• Mild headache\n• Low-grade fever (usually below 38.5°C)\n• Sneezing\n• Fatigue\n\n**Treatment:** Rest, fluids, and OTC cold medicines can help manage symptoms. Most colds resolve within 7-10 days.\n\n⚠️ *See a doctor if symptoms worsen or persist beyond 10 days.*",
  pressure: "Managing high blood pressure (hypertension) involves several strategies:\n\n1. **Diet** — Reduce sodium, eat more fruits, vegetables, and whole grains (DASH diet)\n2. **Exercise** — 150 minutes of moderate activity per week\n3. **Weight management** — Even 5-10 lbs loss can lower BP significantly\n4. **Limit alcohol** and **quit smoking**\n5. **Stress management** — Meditation, yoga, deep breathing\n6. **Medication** — If prescribed, take consistently\n\nRegular monitoring at home is important. Target: below 130/80 mmHg.\n\n⚠️ *Always follow your doctor's specific advice for your situation.*",
  vitamins: "Essential daily vitamins and minerals for general health:\n\n**For most adults:**\n• **Vitamin D** (1000-2000 IU) — Most people are deficient\n• **Vitamin B12** (2.4 mcg) — Especially important for vegetarians\n• **Magnesium** (310-420 mg) — Supports 300+ body functions\n• **Omega-3 fatty acids** — Heart and brain health\n• **Vitamin C** (75-90 mg) — Immune support\n\n**Best source:** A balanced diet with varied whole foods. Supplements should complement, not replace, good nutrition.\n\n⚠️ *Consult your doctor before starting any supplement regimen, especially if you take medications.*",
  default: "Thank you for your question. As an AI health assistant, I can provide general health information, but please remember that this is not a substitute for professional medical advice.\n\nBased on what you've described, I'd recommend:\n\n1. **Monitor your symptoms** carefully and note any changes\n2. **Stay hydrated** and get adequate rest\n3. **Consult a doctor** if symptoms persist or worsen\n4. **Avoid self-medicating** without professional guidance\n\nFor a proper diagnosis and personalized treatment plan, I encourage you to book a consultation with one of our qualified doctors on the Healzy platform.\n\n⚠️ *This information is for educational purposes only and does not constitute medical advice.*",
};

async function getMockResponse(text) {
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
  const lower = text.toLowerCase();
  if (lower.includes('headache') || lower.includes('голова') || lower.includes('bosh')) return MOCK_RESPONSES.headache;
  if (lower.includes('cold') || lower.includes('flu') || lower.includes('простуд') || lower.includes('shamollash')) return MOCK_RESPONSES.cold;
  if (lower.includes('pressure') || lower.includes('hypertension') || lower.includes('давлени') || lower.includes('bosim')) return MOCK_RESPONSES.pressure;
  if (lower.includes('vitamin') || lower.includes('витамин')) return MOCK_RESPONSES.vitamins;
  return MOCK_RESPONSES.default;
}

// ─── Markdown-ish renderer ─────────────────────────────────────────────────────
function MessageText({ text }) {
  const lines = text.split('\n');
  return (
    <div className={styles.msgText}>
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <li key={i} dangerouslySetInnerHTML={{ __html: bold.slice(2) }} />;
        }
        if (/^\d+\./.test(line)) {
          return <li key={i} dangerouslySetInnerHTML={{ __html: bold.replace(/^\d+\.\s/, '') }} />;
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} />;
      })}
    </div>
  );
}

// ─── Main AI Page ─────────────────────────────────────────────────────────────
export default function AIPage() {
  const { t } = useT();
  const { dialogues, activeDialogueId, isLoading, createDialogue, addMessage, setActiveDialogue, setLoading } = useAIStore();

  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeDialogue = dialogues.find(d => d.id === activeDialogueId);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeDialogue?.messages]);

  // Voice Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const startNewDialogue = () => {
    const newDialogue = {
      id: Date.now(),
      title: 'New consultation',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    createDialogue(newDialogue);
  };

  const handleSend = async () => {
    if ((!text.trim() && !imageFile) || isLoading) return;

    let dialogue = activeDialogue;
    if (!dialogue) {
      const newDialogue = {
        id: Date.now(),
        title: text.slice(0, 40) || 'Image consultation',
        createdAt: new Date().toISOString(),
        messages: [],
      };
      createDialogue(newDialogue);
      dialogue = newDialogue;
    }

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: text.trim(),
      imageFile: imageFile ? URL.createObjectURL(imageFile) : null,
      sentAt: new Date().toISOString(),
    };

    addMessage(dialogue.id, userMsg);
    setText('');
    setImageFile(null);
    setLoading(true);

    try {
      // Use mock response; swap getMockResponse for real API call when backend ready
      const responseText = await getMockResponse(userMsg.text);

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: responseText,
        sentAt: new Date().toISOString(),
      };
      addMessage(dialogue.id, aiMsg);

      // TTS
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          responseText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[•⚠️]/g, '').trim()
        );
        utterance.rate = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      addMessage(dialogue.id, {
        id: Date.now() + 1,
        role: 'assistant',
        text: t.ai.errorMessage,
        sentAt: new Date().toISOString(),
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition not supported in your browser. Try Chrome.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const messages = activeDialogue?.messages || [];

  return (
    <div className={styles.page}>
      {/* ── Left sidebar - history ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>{t.ai.history}</h2>
          <button className={styles.newChatBtn} onClick={startNewDialogue}>
            <Plus size={16} />
            {t.ai.newChat}
          </button>
        </div>
        <div className={styles.dialogueList}>
          {dialogues.length === 0 && (
            <div className={styles.noDialogues}>Start your first AI health conversation</div>
          )}
          {dialogues.map(d => (
            <button
              key={d.id}
              className={[styles.dialogueItem, d.id === activeDialogueId ? styles.dialogueActive : ''].join(' ')}
              onClick={() => setActiveDialogue(d.id)}
            >
              <span className={styles.dialogueTitle}>{d.title}</span>
              <span className={styles.dialogueDate}>{new Date(d.createdAt).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main chat ── */}
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.aiLogo}>
              <span>✦</span>
            </div>
            <div>
              <h1 className={styles.headerTitle}>{t.ai.title}</h1>
              <p className={styles.headerSub}>{t.ai.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              className={[styles.voiceToggle, voiceEnabled ? styles.voiceToggleOn : ''].join(' ')}
              onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) stopSpeaking(); }}
              title="Toggle voice responses"
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {voiceEnabled ? 'Voice On' : 'Voice Off'}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.length === 0 ? (
            <div className={styles.welcome}>
              <motion.div className={styles.welcomeIcon} animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                🏥
              </motion.div>
              <h2>How can I help you today?</h2>
              <p className={styles.welcomeDesc}>{t.ai.subtitle}</p>

              {/* Quick suggestions */}
              <div className={styles.suggestions}>
                <p className={styles.suggestLabel}>{t.ai.suggestions.title}</p>
                <div className={styles.suggestGrid}>
                  {t.ai.suggestions.items.map((item, i) => (
                    <button key={i} className={styles.suggestBtn} onClick={() => setText(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                className={[styles.msgRow, msg.role === 'user' ? styles.msgUser : styles.msgAI].join(' ')}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === 'assistant' && (
                  <div className={styles.aiAvatar}><span>✦</span></div>
                )}
                <div className={[styles.bubble, msg.isError ? styles.bubbleError : ''].join(' ')}>
                  {msg.imageFile && (
                    <img src={msg.imageFile} alt="Uploaded" className={styles.uploadedImg} />
                  )}
                  {msg.role === 'user' ? (
                    <p>{msg.text}</p>
                  ) : (
                    <MessageText text={msg.text} />
                  )}
                  <span className={styles.time}>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </motion.div>
            ))
          )}

          {/* Loading */}
          <AnimatePresence>
            {isLoading && (
              <motion.div className={[styles.msgRow, styles.msgAI].join(' ')}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className={styles.aiAvatar}><span>✦</span></div>
                <div className={styles.thinkingBubble}>
                  <span className={styles.thinkingDot} />
                  <span className={styles.thinkingDot} />
                  <span className={styles.thinkingDot} />
                  <span className={styles.thinkingLabel}>{t.ai.thinking}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Disclaimer */}
        <div className={styles.disclaimer}>
          <AlertCircle size={13} />
          <span>{t.ai.disclaimer}</span>
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          {/* Image preview */}
          <AnimatePresence>
            {imageFile && (
              <motion.div className={styles.imagePreview} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <img src={URL.createObjectURL(imageFile)} alt="Preview" />
                <button onClick={() => setImageFile(null)} className={styles.removeImage}><X size={14} /></button>
                <span className={styles.imageName}>{imageFile.name}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.inputRow}>
            <div className={styles.textWrap}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder={isRecording ? '🎙 Listening...' : t.ai.placeholder}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputActions}>
              {/* Image upload */}
              <button className={styles.actionBtn} onClick={() => fileInputRef.current?.click()} title={t.ai.uploadImage}>
                <Image size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={e => setImageFile(e.target.files[0])}
              />

              {/* Voice */}
              <motion.button
                className={[styles.actionBtn, isRecording ? styles.recording : ''].join(' ')}
                onClick={toggleRecording}
                title={isRecording ? t.ai.voiceStop : t.ai.voiceStart}
                animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </motion.button>

              {/* Stop speaking */}
              {isSpeaking && (
                <button className={[styles.actionBtn, styles.speakingBtn].join(' ')} onClick={stopSpeaking}>
                  <VolumeX size={18} />
                </button>
              )}

              {/* Send */}
              <motion.button
                className={[styles.sendBtn, (text.trim() || imageFile) ? styles.sendBtnActive : ''].join(' ')}
                onClick={handleSend}
                disabled={(!text.trim() && !imageFile) || isLoading}
                whileTap={{ scale: 0.9 }}
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
