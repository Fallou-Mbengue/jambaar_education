import { Injectable, Inject, Logger } from '@nestjs/common';
import { LLM_PROVIDER, LLMProvider, ChatMessage } from './providers/llm-provider.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { MinioService } from '../../minio/minio.service';

interface ChatDto {
  messages: ChatMessage[];
  conversationId?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly RATE_LIMIT_TTL = 60; // seconds
  private readonly RATE_LIMIT_MAX = 20; // requests per minute

  constructor(
    @Inject(LLM_PROVIDER) private llm: LLMProvider,
    private prisma: PrismaService,
    private redis: RedisService,
    private minio: MinioService,
  ) {}

  async chat(userId: string, dto: ChatDto): Promise<{ reply: string; recommendedContents: object[] }> {
    // Rate limiting
    const rateLimitKey = `ai:rate:${userId}`;
    const count = await this.redis.incr(rateLimitKey);
    if (count === 1) await this.redis.expire(rateLimitKey, this.RATE_LIMIT_TTL);
    if (count > this.RATE_LIMIT_MAX) {
      return { reply: 'Tu as atteint la limite de messages. Réessaie dans une minute.', recommendedContents: [] };
    }

    const systemMessage: ChatMessage = {
      role: 'system',
      content: `Tu es Jam, l'assistant IA de Jambaar Education. Tu aides les jeunes africains à développer leurs soft skills.
      Réponds en français, de façon concise et motivante.
      Si pertinent, recommande du contenu de la plateforme en mentionnant les tags: communication, leadership, productivity, public_speaking, stress_management, teamwork.`,
    };

    const messages = [systemMessage, ...dto.messages];
    const reply = await this.llm.chat(messages, userId);

    // Find relevant content based on reply
    const relevantTags = this.extractTags(reply);
    const recommendedContents = relevantTags.length > 0
      ? await this.getRecommendedContents(userId, relevantTags)
      : [];

    return { reply, recommendedContents };
  }

  async summarize(userId: string, contentId: string): Promise<{ summary: string }> {
    const cacheKey = `ai:summary:${contentId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return { summary: cached };

    const content = await this.prisma.content.findUnique({ where: { id: contentId } });
    if (!content) return { summary: 'Contenu non trouvé.' };

    const textToSummarize = content.description ?? content.title;
    const summary = await this.llm.summarize(textToSummarize, 80);

    // Cache for 1 hour
    await this.redis.set(cacheKey, summary, 3600);

    return { summary };
  }

  async getRecommendations(userId: string): Promise<object[]> {
    const cacheKey = `ai:reco:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as object[];
    }

    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    const userProfile = {
      objectives: profile?.objectives ?? [],
      interests: profile?.interests ?? [],
      level: profile?.level ?? 'beginner',
    };

    const recommendedTags = await this.llm.recommend(userProfile);
    const contents = await this.getRecommendedContents(userId, recommendedTags);

    // Cache for 30 min
    await this.redis.set(cacheKey, JSON.stringify(contents), 1800);

    return contents;
  }

  private extractTags(text: string): string[] {
    const tagMap: Record<string, string> = {
      communication: 'communication',
      communiquer: 'communication',
      leadership: 'leadership',
      leader: 'leadership',
      stress: 'stress_management',
      productiv: 'productivity',
      parole: 'public_speaking',
      pitch: 'public_speaking',
      équipe: 'teamwork',
      collabor: 'teamwork',
    };

    const lower = text.toLowerCase();
    return [...new Set(
      Object.entries(tagMap)
        .filter(([key]) => lower.includes(key))
        .map(([, tag]) => tag),
    )];
  }

  private async getRecommendedContents(userId: string, tags: string[]) {
    const contents = await this.prisma.content.findMany({
      where: {
        status: 'PUBLISHED',
        tags: { hasSome: tags },
        progresses: { none: { userId, isCompleted: true } },
      },
      take: 3,
      orderBy: { viewCount: 'desc' },
    });

    return Promise.all(
      contents.map(async (c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        durationSeconds: c.durationSeconds,
        thumbnailUrl: c.thumbnailKey
          ? await this.minio.getPresignedReadUrl(c.thumbnailKey)
          : null,
        tags: c.tags,
        isPremium: c.isPremium,
      })),
    );
  }

  async getQuickPrompts(): Promise<{ id: string; label: string; message: string }[]> {
    return [
      { id: '1', label: '💼 Préparer un entretien', message: 'Comment préparer un entretien d\'embauche ?' },
      { id: '2', label: '🧘 Gérer le stress', message: 'Donne-moi des techniques pour gérer le stress au travail.' },
      { id: '3', label: '🎙️ Améliorer ma communication', message: 'Comment améliorer ma communication professionnelle ?' },
      { id: '4', label: '🦁 Développer mon leadership', message: 'Quelles sont les clés du leadership en Afrique ?' },
      { id: '5', label: '📈 Booster ma productivité', message: 'Comment être plus productif chaque jour ?' },
      { id: '6', label: '🗺️ Mon parcours personnalisé', message: 'Propose-moi un plan d\'apprentissage personnalisé.' },
    ];
  }
}
