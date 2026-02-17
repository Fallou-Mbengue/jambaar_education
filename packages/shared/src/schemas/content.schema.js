"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedQuerySchema = exports.UpdateContentSchema = exports.CreateContentSchema = exports.ContentStatusEnum = exports.ContentTypeEnum = void 0;
const zod_1 = require("zod");
exports.ContentTypeEnum = zod_1.z.enum(['VIDEO', 'ARTICLE', 'QUIZ', 'MICRO_LEARNING']);
exports.ContentStatusEnum = zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
exports.CreateContentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(2000).optional(),
    type: exports.ContentTypeEnum,
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    durationSeconds: zod_1.z.number().int().positive().optional(),
    isPremium: zod_1.z.boolean().default(false),
    thumbnailKey: zod_1.z.string().optional(),
    videoKey: zod_1.z.string().optional(),
    articleBody: zod_1.z.string().optional(),
});
exports.UpdateContentSchema = exports.CreateContentSchema.partial().extend({
    status: exports.ContentStatusEnum.optional(),
});
exports.FeedQuerySchema = zod_1.z.object({
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(10),
});
//# sourceMappingURL=content.schema.js.map