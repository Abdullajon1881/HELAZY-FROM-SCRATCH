"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = exports.AIController = exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const sdk_1 = require("@anthropic-ai/sdk");
const generative_ai_1 = require("@google/generative-ai");
const prisma_service_1 = require("../../database/prisma.service");
const guards_1 = require("../../common/guards");
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
let AIService = AIService_1 = class AIService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(AIService_1.name);
        this.anthropic = new sdk_1.default({ apiKey: config.get('ANTHROPIC_API_KEY') });
        this.gemini = new generative_ai_1.GoogleGenerativeAI(config.get('GEMINI_API_KEY', ''));
    }
    async chat(userId, messages, sessionId) {
        const claudeMessages = messages.map((m) => ({
            role: m.role,
            content: m.imageBase64
                ? [
                    { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: m.imageBase64 } },
                    { type: 'text', text: m.content || 'Please analyze this medical image.' },
                ]
                : m.content,
        }));
        const response = await this.anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: claudeMessages,
        });
        const reply = response.content[0].text;
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
        const lastUserMsg = messages[messages.length - 1];
        await this.prisma.aIMessage.createMany({
            data: [
                { sessionId: activeSessionId, role: 'user', content: lastUserMsg.content },
                { sessionId: activeSessionId, role: 'assistant', content: reply },
            ],
        });
        const suggestions = this.extractSuggestions(reply);
        return { message: reply, sessionId: activeSessionId, suggestions };
    }
    async analyzeImage(userId, imageBase64, question) {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = question || 'Analyze this medical image and provide general health information. Remember to advise consulting a doctor for proper diagnosis.';
        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        ]);
        const text = result.response.text();
        return { message: text, sessionId: null, suggestions: this.extractSuggestions(text) };
    }
    async checkSymptoms(userId, symptoms, age, gender) {
        const userMsg = `Patient details: ${age ? `Age: ${age}` : ''} ${gender ? `Gender: ${gender}` : ''}
Symptoms reported: ${symptoms.join(', ')}

Please provide:
1. Possible causes (general information only)
2. When to seek immediate care
3. Recommended specialist type
4. Home care suggestions if appropriate`;
        return this.chat(userId, [{ role: 'user', content: userMsg }]);
    }
    async textToSpeech(text, lang = 'en') {
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
                },
            });
            const audioData = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (audioData)
                return Buffer.from(audioData, 'base64');
        }
        catch (err) {
            this.logger.warn('TTS failed, returning null:', err.message);
        }
        return null;
    }
    async getSessions(userId) {
        return this.prisma.aISession.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
        });
    }
    async getSession(sessionId, userId) {
        const session = await this.prisma.aISession.findFirst({
            where: { id: sessionId, userId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!session)
            throw new common_1.BadRequestException('Session not found');
        return session;
    }
    async deleteSession(sessionId, userId) {
        await this.prisma.aISession.deleteMany({ where: { id: sessionId, userId } });
        return { success: true };
    }
    extractSuggestions(text) {
        const specialties = ['cardiologist', 'neurologist', 'dermatologist', 'pediatrician', 'gynecologist', 'orthopedist', 'psychiatrist', 'general practitioner'];
        const found = [];
        const lower = text.toLowerCase();
        specialties.forEach((s) => { if (lower.includes(s))
            found.push(s); });
        return found;
    }
};
exports.AIService = AIService;
exports.AIService = AIService = AIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService])
], AIService);
let AIController = class AIController {
    constructor(ai) {
        this.ai = ai;
    }
    chat(u, body) {
        return this.ai.chat(u.id, body.messages, body.sessionId);
    }
    analyzeImage(u, body) {
        return this.ai.analyzeImage(u.id, body.imageBase64, body.question);
    }
    checkSymptoms(u, body) {
        return this.ai.checkSymptoms(u.id, body.symptoms, body.age, body.gender);
    }
    async tts(u, body, res) {
        const audio = await this.ai.textToSpeech(body.text, body.lang);
        if (!audio)
            return res.status(503).json({ error: 'TTS unavailable' });
        res.set({ 'Content-Type': 'audio/wav', 'Content-Length': audio.length });
        res.send(audio);
    }
    getSessions(u) {
        return this.ai.getSessions(u.id);
    }
    getSession(id, u) {
        return this.ai.getSession(id, u.id);
    }
    deleteSession(id, u) {
        return this.ai.deleteSession(id, u.id);
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('analyze-image'),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "analyzeImage", null);
__decorate([
    (0, common_1.Post)('symptoms'),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "checkSymptoms", null);
__decorate([
    (0, common_1.Post)('tts'),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "tts", null);
__decorate([
    (0, common_1.Get)('sessions'),
    __param(0, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Get)('sessions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "getSession", null);
__decorate([
    (0, common_1.Delete)('sessions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "deleteSession", null);
exports.AIController = AIController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [AIService])
], AIController);
let AIModule = class AIModule {
};
exports.AIModule = AIModule;
exports.AIModule = AIModule = __decorate([
    (0, common_1.Module)({
        controllers: [AIController],
        providers: [AIService],
        exports: [AIService],
    })
], AIModule);
//# sourceMappingURL=ai.module.js.map