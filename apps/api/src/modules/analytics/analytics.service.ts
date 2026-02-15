import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

interface TrackEventPayload {
  userId?: string;
  sessionId?: string;
  eventName: string;
  properties?: Record<string, unknown>;
  platform?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  @OnEvent('analytics.track')
  async handleTrack(payload: TrackEventPayload) {
    await this.track(payload);
  }

  async track(payload: TrackEventPayload): Promise<void> {
    await this.prisma.analyticsEvent.create({
      data: {
        userId: payload.userId,
        sessionId: payload.sessionId,
        eventName: payload.eventName,
        properties: (payload.properties ?? {}) as object,
        platform: payload.platform ?? 'web',
      },
    });
  }

  async batchTrack(userId: string, events: TrackEventPayload[]): Promise<void> {
    await this.prisma.analyticsEvent.createMany({
      data: events.map((e) => ({
        userId,
        sessionId: e.sessionId,
        eventName: e.eventName,
        properties: (e.properties ?? {}) as object,
        platform: e.platform ?? 'web',
      })),
    });
  }
}
