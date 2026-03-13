import { Injectable, Logger, BadRequestException, Controller, Post, Body, Get, Param, Delete, UseGuards, Res, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '@/database/prisma.service';
import { JwtAuthGuard, CurrentUser } from '@/common/guards';

const SYSTEM_PROMPT = `You are Healzy AI, a compassionate and knowledgeable health assistant for a medical platform in Uzbekistan.

Your role:
- Provide clear, accurate general health information
- Help users understand symptoms and when to seek care
- Recommend relevant specialist types when appropriate
- Always recommend professional medical consultation for serious concerns
- Support Uzbek, Russian, and English languages — respond in the same language the user writes in

Critical rules:
- NEVER diagnose diseases definitively
- NEVER prescribe specific medications or dosages
- ALWAYS include a disclaimer that your response is informational only
- For emergency symptoms (chest pain, difficulty breathing, stroke signs), immediately advise calling emergency services
- Be empathetic, clear, and non-alarmist

Format your responses with clear sections using markdown when helpful.`;

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private anthropic: Anthropic;
  private gemini: GoogleGenerativeAI;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.anthropic = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
    this.gemini = new GoogleGenerativeAI(config.get('GEMINI_API_KEY', ''));
  }

  // ── Main chat — Claude Sonnet 4.6 ─────────────────────────────────────────
  async chat(userId: string, messages: any[], sessionId?: string) {
    const claudeMessages = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.imageBase64
        ? [
            { type: 'image' as const, source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data: m.imageBase64 } },
            { type: 'text' as const, text: m.content || 'Please analyze this medical image.' },
          ]
        : m.content,
    }));

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: claudeMessages,
    });

    const reply = (response.content[0] as any).text;

    // Persist session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const session = await this.prisma.aISession.create({
        data: {
          userId,
          title: messages[0]?.content?.slice(0, 50) || 'Health Consultation',
        },
      });
      activeSessionId = session.id;
    }

    // Save messages
    const lastUserMsg = messages[messages.length - 1];
    await this.prisma.aIMessage.createMany({
      data: [
        { sessionId: activeSessionId, role: 'user', content: lastUserMsg.content },
        { sessionId: activeSessionId, role: 'assistant', content: reply },
      ],
    });

    // Extract doctor recommendations from reply
    const suggestions = this.extractSuggestions(reply);

    return { message: reply, sessionId: activeSessionId, suggestions };
  }

  // ── Image analysis — Gemini Vision ───────────────────────────────────────
  async analyzeImage(userId: string, imageBase64: string, question?: string) {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = question || 'Analyze this medical image and provide general health information. Remember to advise consulting a doctor for proper diagnosis.';

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
    ]);

    const text = result.response.text();
    return { message: text, sessionId: null, suggestions: this.extractSuggestions(text) };
  }

  // ── Symptom checker ────────────────────────────────────────────────────────
  async checkSymptoms(userId: string, symptoms: string[], age?: number, gender?: string) {
    const userMsg = `Patient details: ${age ? `Age: ${age}` : ''} ${gender ? `Gender: ${gender}` : ''}
Symptoms reported: ${symptoms.join(', ')}

Please provide:
1. Possible causes (general information only)
2. When to seek immediate care
3. Recommended specialist type
4. Home care suggestions if appropriate`;

    return this.chat(userId, [{ role: 'user', content: userMsg }]);
  }

  // ── Text to speech — Gemini 2.5 Flash ───────────────────────────────────
  async textToSpeech(text: string, lang = 'en') {
    // Gemini 2.5 Flash TTS
    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-2.5-flash-preview-tts' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: lang === 'ru' ? 'Kore' : lang === 'uz' ? 'Puck' : 'Charon',
              },
            },
          },
        } as any,
      });

      const audioData = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) return Buffer.from(audioData, 'base64');
    } catch (err) {
      this.logger.warn('TTS failed, returning null:', err.message);
    }
    return null;
  }

  // ── Session management ─────────────────────────────────────────────────────
  async getSessions(userId: string) {
    return this.prisma.aISession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
    });
  }

  async getSession(sessionId: string, userId: string) {
    const session = await this.prisma.aISession.findFirst({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new BadRequestException('Session not found');
    return session;
  }

  async deleteSession(sessionId: string, userId: string) {
    await this.prisma.aISession.deleteMany({ where: { id: sessionId, userId } });
    return { success: true };
  }

  private extractSuggestions(text: string): string[] {
    const specialties = ['cardiologist', 'neurologist', 'dermatologist', 'pediatrician', 'gynecologist', 'orthopedist', 'psychiatrist', 'general practitioner'];
    const found: string[] = [];
    const lower = text.toLowerCase();
    specialties.forEach((s) => { if (lower.includes(s)) found.push(s); });
    return found;
  }
}

// ── AI Controller ─────────────────────────────────────────────────────────────
@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AIController {
  constructor(private ai: AIService) {}

  @Post('chat')
  chat(@CurrentUser() u: any, @Body() body: { messages: any[]; sessionId?: string }) {
    return this.ai.chat(u.id, body.messages, body.sessionId);
  }

  @Post('analyze-image')
  analyzeImage(@CurrentUser() u: any, @Body() body: { imageBase64: string; question?: string }) {
    return this.ai.analyzeImage(u.id, body.imageBase64, body.question);
  }

  @Post('symptoms')
  checkSymptoms(@CurrentUser() u: any, @Body() body: { symptoms: string[]; age?: number; gender?: string }) {
    return this.ai.checkSymptoms(u.id, body.symptoms, body.age, body.gender);
  }

  @Post('tts')
  async tts(@CurrentUser() u: any, @Body() body: { text: string; lang?: string }, @Res() res: any) {
    const audio = await this.ai.textToSpeech(body.text, body.lang);
    if (!audio) return res.status(503).json({ error: 'TTS unavailable' });
    res.set({ 'Content-Type': 'audio/wav', 'Content-Length': audio.length });
    res.send(audio);
  }

  @Get('sessions')
  getSessions(@CurrentUser() u: any) {
    return this.ai.getSessions(u.id);
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string, @CurrentUser() u: any) {
    return this.ai.getSession(id, u.id);
  }

  @Delete('sessions/:id')
  deleteSession(@Param('id') id: string, @CurrentUser() u: any) {
    return this.ai.deleteSession(id, u.id);
  }
}

// ── AI Module ─────────────────────────────────────────────────────────────────
@Module({
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
