import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../../minio/minio.service';
import { PaginatedResult, encodeCursor, decodeCursor } from '../../common/dto/pagination.dto';

interface FeedCursor {
  score: number;
  id: string;
}

interface FeedContent {
  id: string;
  title: string;
  description: string | null;
  type: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  durationSeconds: number | null;
  tags: string[];
  isPremium: boolean;
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  saveCount: number;
  viewCount: number;
  score: number;
}

@Injectable()
export class FeedService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async getFeed(
    userId: string,
    cursor?: string,
    limit = 10,
  ): Promise<PaginatedResult<FeedContent>> {
    // Get user profile for personalization
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    const interests = profile?.interests ?? [];

    // Get viewed content IDs (exclude recently viewed)
    const recentViews = await this.prisma.userProgress.findMany({
      where: { userId },
      select: { contentId: true },
      orderBy: { lastAccessedAt: 'desc' },
      take: 50,
    });
    const viewedIds = recentViews.map((v) => v.contentId).filter(Boolean) as string[];

    let decodedCursor: FeedCursor | undefined;
    if (cursor) {
      try {
        decodedCursor = decodeCursor<FeedCursor>(cursor);
      } catch {
        decodedCursor = undefined;
      }
    }

    // Fetch published content
    const contents = await this.prisma.content.findMany({
      where: {
        status: 'PUBLISHED',
        ...(decodedCursor && {
          OR: [
            { viewCount: { lt: decodedCursor.score } },
            { viewCount: { equals: Math.floor(decodedCursor.score) }, id: { lt: decodedCursor.id } },
          ],
        }),
      },
      take: limit + 1,
      orderBy: [{ viewCount: 'desc' }, { id: 'desc' }],
      include: { likes: { where: { userId } }, saves: { where: { userId } } },
    });

    const hasMore = contents.length > limit;
    const items = contents.slice(0, limit);

    // Score and sort items
    const scoredItems = items.map((content) => {
      const score = this.calculateScore(content, interests, viewedIds);
      return { ...content, score };
    });

    scoredItems.sort((a, b) => b.score - a.score);

    const lastItem = scoredItems[scoredItems.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? encodeCursor({ score: lastItem.score, id: lastItem.id })
        : null;

    const feedItems = await Promise.all(
      scoredItems.map(async (content) => ({
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type,
        thumbnailUrl: content.thumbnailKey
          ? await this.minio.getPresignedReadUrl(content.thumbnailKey)
          : null,
        videoUrl: content.videoKey
          ? await this.minio.getPresignedReadUrl(content.videoKey)
          : null,
        durationSeconds: content.durationSeconds,
        tags: content.tags,
        isPremium: content.isPremium,
        isLiked: content.likes.length > 0,
        isSaved: content.saves.length > 0,
        likeCount: content.likeCount,
        saveCount: content.saveCount,
        viewCount: content.viewCount,
        score: content.score,
      })),
    );

    return { items: feedItems, nextCursor, hasMore };
  }

  private calculateScore(
    content: {
      id: string;
      tags: string[];
      likeCount: number;
      saveCount: number;
      shareCount: number;
      viewCount: number;
      publishedAt: Date | null;
    },
    userInterests: string[],
    viewedIds: string[],
  ): number {
    // Recency decay (exponential, half-life ~48h)
    const publishedAt = content.publishedAt ?? new Date();
    const ageHours = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
    const recencyWeight = Math.exp(-ageHours / 48) * 0.4;

    // Engagement weight
    const maxEngagement = 1000;
    const engagementScore =
      (content.likeCount * 0.4 + content.saveCount * 0.6 + content.shareCount) / maxEngagement;
    const engagementWeight = Math.min(engagementScore, 1) * 0.3;

    // Personalization: tag overlap
    const tagOverlap =
      userInterests.length > 0
        ? content.tags.filter((t) => userInterests.includes(t)).length / userInterests.length
        : 0;
    const personalizationWeight = tagOverlap * 0.3;

    // Seen penalty
    const seenPenalty = viewedIds.includes(content.id) ? -0.3 : 0;

    return recencyWeight + engagementWeight + personalizationWeight + seenPenalty;
  }
}
