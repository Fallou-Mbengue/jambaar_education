import { z } from 'zod';

export const ContentTypeEnum = z.enum(['VIDEO', 'ARTICLE', 'QUIZ', 'MICRO_LEARNING']);
export const ContentStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const CreateContentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: ContentTypeEnum,
  tags: z.array(z.string()).default([]),
  durationSeconds: z.number().int().positive().optional(),
  isPremium: z.boolean().default(false),
  thumbnailKey: z.string().optional(),
  videoKey: z.string().optional(),
  articleBody: z.string().optional(),
});

export const UpdateContentSchema = CreateContentSchema.partial().extend({
  status: ContentStatusEnum.optional(),
});

export const FeedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateContentDto = z.infer<typeof CreateContentSchema>;
export type UpdateContentDto = z.infer<typeof UpdateContentSchema>;
export type FeedQueryDto = z.infer<typeof FeedQuerySchema>;
