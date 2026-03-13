import { Controller, Get, Post, Body, Param, Query, UseGuards, Module } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtAuthGuard, CurrentUser } from '@/common/guards';

// ── Chat Controller ───────────────────────────────────────────────────────────
@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chat: ChatService) {}

  @Get('conversations')
  getConversations(@CurrentUser() u: any) {
    return this.chat.getMyConversations(u.id, u.role);
  }

  @Post('conversations')
  createConversation(@CurrentUser() u: any, @Body() body: { doctorId: string; appointmentId?: string }) {
    return this.chat.createOrGetConversation(u.id, body.doctorId, body.appointmentId);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string, @CurrentUser() u: any, @Query('page') page = 1) {
    return this.chat.getMessages(id, u.id, +page);
  }

  @Post('conversations/:id/end')
  endConversation(@Param('id') id: string, @CurrentUser() u: any) {
    return this.chat.endConversation(id, u.id);
  }
}

// ── Chat Module ───────────────────────────────────────────────────────────────
@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}