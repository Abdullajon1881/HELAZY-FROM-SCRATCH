import {
  Injectable, Logger, BadRequestException,
  ServiceUnavailableException, PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '@/database/prisma.service';

// ── Named constants (no magic numbers) ────────────────────────────────────────
const MAX_MESSAGE_LENGTH   = 4000;
const MAX_MESSAGES_PER_REQ = 20;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_SYMPTOMS         = 20;
const MAX_RETRY_ATTEMPTS   = 3;
const RETRY_BASE_DELAY_MS  = 500;
const CLAUDE_MODEL         = 'claude-sonnet-4-6';
const GEMINI_VISION_MODEL  = 'gemini-2.0-flash';
const GEMINI_TTS_MODEL     = 'gemini-2.5-flash-preview-tts';
const MAX_TOKENS           = 1024;
const SESSION_TITLE_LENGTH = 60;

const SUPPORTED_LANGUAGES  = ['en', 'ru', 'uz'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const TTS_VOICES: Record<SupportedLanguage, string> = {
  en: 'Charon',
  ru: 'Kore',
  uz: 'Puck',
};

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Healzy AI, a compassionate and knowledgeable health assistant \
for a medical platform serving patients in Uzbekistan and the surrounding region.

Your role:
- Provide clear, accurate general health information
- Help users understand symptoms and when to seek professional care
- Recommend relevant specialist types when appropriate
- Always recommend professional medical consultation for serious concerns
- Respond in the same language the user writes in (Uzbek, Russian, or English)

Critical rules — never violate these:
- NEVER definitively diagnose a disease
- NEVER prescribe specific medications or dosages
- ALWAYS end responses with a brief disclaimer that your answer is informational only
- For emergency symptoms (chest pain, difficulty breathing, stroke signs, severe bleeding) \
  immediately advise calling emergency services (103 in Uzbekistan)
- Be empathetic, clear, and non-alarmist

Format responses with clear markdown sections when helpful.`;

// ── Retry helper (exponential backoff) ────────────────────────────────────────
async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = MAX_RETRY_ATTEMPTS,
  baseDelayMs = RETRY_BASE_DELAY_MS,
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      const isRetryable =
        err?.status === 429 || err?.status === 503 || err?.status === 502;
      if (!isRetryable || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** i));
    }
  }
  throw lastError!;
}

// ── Input validators ──────────────────────────────────────────────────────────
function validateMessages(messages: any[]): void {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new BadRequestException('Messages array must not be empty');
  }
  if (messages.length > MAX_MESSAGES_PER_REQ) {
    throw new BadRequestException(
      `Too many messages. Maximum is ${MAX_MESSAGES_PER_REQ}`,
    );
  }
  for (const msg of messages) {
    if (!['user', 'assistant'].includes(msg.role)) {
      throw new BadRequestException(`Invalid message role: ${msg.role}`);
    }
    if (typeof msg.content !== 'string' || msg.content.trim().length === 0) {
      throw new BadRequestException('Message content must be a non-empty string');
    }
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`,
      );
    }
  }
}

function validateImageBase64(imageBase64: string): void {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new BadRequestException('imageBase64 must be a non-empty string');
  }
  const sizeBytes = Math.ceil((imageBase64.length * 3) / 4);
  if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    throw new PayloadTooLargeException(
      `Image exceeds maximum size of ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024} MB`,
    );
  }
}

function validateLanguage(lang: string): SupportedLanguage {
  if (!SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    return 'en';
  }
  return lang as SupportedLanguage;
}

function validateSymptoms(symptoms: string[]): void {
  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    throw new BadRequestException('Symptoms array must not be empty');
  }
  if (symptoms.length > MAX_SYMPTOMS) {
    throw new BadRequestException(
      `Too many symptoms. Maximum is ${MAX_SYMPTOMS}`,
    );
  }
  for (const s of symptoms) {
    if (typeof s !== 'string' || s.trim().length === 0) {
      throw new BadRequestException('Each symptom must be a non-empty string');
    }
  }
}

// ── Service ───────────────────────────────────────────────────────────────────
@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly anthropic: Anthropic;
  private readonly gemini: GoogleGenerativeAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const anthropicKey = this.config.get<string>('ANTHROPIC_API_KEY');
    const geminiKey    = this.config.get<string>('GEMINI_API_KEY');

    if (!anthropicKey) {
      this.logger.warn('ANTHROPIC_API_KEY is not set — AI chat will be unavailable');
    }
    if (!geminiKey) {
      this.logger.warn('GEMINI_API_KEY is not set — image analysis and TTS will be unavailable');
    }

    this.anthropic = new Anthropic({ apiKey: anthropicKey ?? 'missing' });
    this.gemini    = new GoogleGenerativeAI(geminiKey ?? 'missing');
  }

  // ── Chat — Claude Sonnet 4.6 ───────────────────────────────────────────────
  async chat(
    userId: string,
    messages: any[],
    sessionId?: string,
    lang = 'en',
  ) {
    validateMessages(messages);
    const validLang = validateLanguage(lang);

    const claudeMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.imageBase64
        ? [
            {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: 'image/jpeg' as const,
                data: m.imageBase64,
              },
            },
            { type: 'text' as const, text: m.content || 'Please analyse this medical image.' },
          ]
        : m.content,
    }));

    let reply: string;
    try {
      const response = await withRetry(() =>
        this.anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          system: SYSTEM_PROMPT,
          messages: claudeMessages,
        }),
      );
      reply = (response.content[0] as Anthropic.TextBlock).text;
    } catch (err) {
      this.logger.error('Claude API error', { error: err.message, userId });
      throw new ServiceUnavailableException(
        'AI service is temporarily unavailable. Please try again shortly.',
      );
    }

    // Persist session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const title = messages[0]?.content?.slice(0, SESSION_TITLE_LENGTH) || 'Health Consultation';
      const session = await this.prisma.aISession.create({
        data: { userId, title },
      });
      activeSessionId = session.id;
    }

    const lastUserMsg = messages[messages.length - 1];
    await this.prisma.aIMessage.createMany({
      data: [
        { sessionId: activeSessionId, role: 'user',      content: lastUserMsg.content },
        { sessionId: activeSessionId, role: 'assistant', content: reply },
      ],
    });

    return {
      message:     reply,
      sessionId:   activeSessionId,
      suggestions: this.extractSpecialtySuggestions(reply),
      language:    validLang,
    };
  }

  // ── Image analysis — Gemini Vision ────────────────────────────────────────
  async analyzeImage(
    userId: string,
    imageBase64: string,
    question?: string,
  ) {
    validateImageBase64(imageBase64);

    const prompt =
      question?.trim() ||
      'Analyse this medical image and provide general health information. ' +
      'Identify any visible concerns, describe what you see, and advise the patient to consult a doctor for a proper diagnosis.';

    let text: string;
    try {
      const model  = this.gemini.getGenerativeModel({ model: GEMINI_VISION_MODEL });
      const result = await withRetry(() =>
        model.generateContent([
          prompt,
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        ]),
      );
      text = result.response.text();
    } catch (err) {
      this.logger.error('Gemini Vision error', { error: err.message, userId });
      throw new ServiceUnavailableException(
        'Image analysis is temporarily unavailable. Please try again shortly.',
      );
    }

    return {
      message:     text,
      suggestions: this.extractSpecialtySuggestions(text),
    };
  }

  // ── Symptom checker ────────────────────────────────────────────────────────
  async checkSymptoms(
    userId: string,
    symptoms: string[],
    age?: number,
    gender?: string,
  ) {
    validateSymptoms(symptoms);

    const ageStr    = age    ? `Age: ${age}`       : '';
    const genderStr = gender ? `Gender: ${gender}` : '';
    const patientInfo = [ageStr, genderStr].filter(Boolean).join(' · ');

    const userMsg =
      `${patientInfo ? `Patient: ${patientInfo}\n` : ''}` +
      `Reported symptoms: ${symptoms.map((s) => s.trim()).join(', ')}\n\n` +
      `Please provide:\n` +
      `1. Possible causes (general information only)\n` +
      `2. Warning signs that require immediate emergency care\n` +
      `3. Recommended specialist type to consult\n` +
      `4. Safe home care suggestions if appropriate\n` +
      `5. A brief disclaimer`;

    return this.chat(userId, [{ role: 'user', content: userMsg }]);
  }

  // ── Text-to-speech — Gemini 2.5 Flash ────────────────────────────────────
  async textToSpeech(text: string, lang = 'en'): Promise<Buffer | null> {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new BadRequestException('Text must be a non-empty string');
    }

    const validLang = validateLanguage(lang);
    const voiceName = TTS_VOICES[validLang];

    try {
      const model  = this.gemini.getGenerativeModel({ model: GEMINI_TTS_MODEL });
      const result = await withRetry(() =>
        model.generateContent({
          contents: [{ role: 'user', parts: [{ text }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } },
            },
          } as any,
        }),
      );

      const audioData =
        result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!audioData) {
        this.logger.warn('TTS returned no audio data', { lang, voiceName });
        return null;
      }

      return Buffer.from(audioData, 'base64');
    } catch (err) {
      this.logger.error('TTS error', { error: err.message, lang });
      return null;
    }
  }

  // ── Medical report interpreter ────────────────────────────────────────────
  async interpretReport(userId: string, reportText: string, lang = 'en') {
    if (!reportText || typeof reportText !== 'string' || reportText.trim().length === 0) {
      throw new BadRequestException('Report text must not be empty');
    }
    if (reportText.length > MAX_MESSAGE_LENGTH * 2) {
      throw new BadRequestException('Report text is too long');
    }

    const prompt =
      `Please interpret the following medical report in simple, patient-friendly language. ` +
      `Explain what each value or finding means, highlight anything that may need attention, ` +
      `and recommend what type of specialist to consult if needed.\n\nReport:\n${reportText}`;

    return this.chat(userId, [{ role: 'user', content: prompt }], undefined, lang);
  }

  // ── Doctor recommendation ─────────────────────────────────────────────────
  async recommendDoctor(userId: string, description: string, lang = 'en') {
    if (!description || description.trim().length === 0) {
      throw new BadRequestException('Description must not be empty');
    }

    const prompt =
      `Based on the following health concern, recommend the most appropriate type of medical specialist. ` +
      `Explain why that specialist is the right choice and what to expect from the consultation.\n\n` +
      `Health concern: ${description}`;

    return this.chat(userId, [{ role: 'user', content: prompt }], undefined, lang);
  }

  // ── Session management ─────────────────────────────────────────────────────
  async getSessions(userId: string) {
    return this.prisma.aISession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true, role: true, createdAt: true },
        },
        _count: { select: { messages: true } },
      },
    });
  }

  async getSession(sessionId: string, userId: string) {
    const session = await this.prisma.aISession.findFirst({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) {
      throw new BadRequestException('Session not found');
    }
    return session;
  }

  async deleteSession(sessionId: string, userId: string) {
    const session = await this.prisma.aISession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new BadRequestException('Session not found');
    }
    await this.prisma.aIMessage.deleteMany({ where: { sessionId } });
    await this.prisma.aISession.delete({ where: { id: sessionId } });
    return { success: true };
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  private extractSpecialtySuggestions(text: string): string[] {
    const specialties = [
      'cardiologist', 'neurologist', 'dermatologist', 'pediatrician',
      'gynecologist', 'orthopedist', 'psychiatrist', 'general practitioner',
      'gastroenterologist', 'endocrinologist', 'urologist', 'ophthalmologist',
      'dentist', 'pulmonologist', 'rheumatologist', 'oncologist',
    ];
    const lower = text.toLowerCase();
    return specialties.filter((s) => lower.includes(s));
  }
}