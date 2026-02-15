import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsArray, IsString, IsEnum, IsOptional } from 'class-validator';
import { AiService } from './ai.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

class ChatMessageDto {
  @IsEnum(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

class ChatDto {
  @IsArray()
  messages: ChatMessageDto[];

  @IsOptional()
  @IsString()
  conversationId?: string;
}

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI assistant' })
  chat(@CurrentUser() user: JwtPayload, @Body() dto: ChatDto) {
    return this.aiService.chat(user.sub, dto);
  }

  @Post('summarize/:contentId')
  @ApiOperation({ summary: 'Get AI summary of a content' })
  summarize(@CurrentUser() user: JwtPayload, @Param('contentId') contentId: string) {
    return this.aiService.summarize(user.sub, contentId);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI content recommendations' })
  getRecommendations(@CurrentUser() user: JwtPayload) {
    return this.aiService.getRecommendations(user.sub);
  }

  @Get('quick-prompts')
  @ApiOperation({ summary: 'Get quick prompt suggestions' })
  getQuickPrompts() {
    return this.aiService.getQuickPrompts();
  }
}
