import { z } from 'zod';

export const SubscribeSchema = z.object({
  planId: z.string().uuid(),
  provider: z.enum(['WAVE', 'ORANGE_MONEY']),
  phoneNumber: z.string().min(8).max(15),
});

export const WebhookEventSchema = z.object({
  provider: z.string(),
  eventType: z.string(),
  transactionId: z.string(),
  status: z.string(),
  amount: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type SubscribeDto = z.infer<typeof SubscribeSchema>;
export type WebhookEventDto = z.infer<typeof WebhookEventSchema>;
