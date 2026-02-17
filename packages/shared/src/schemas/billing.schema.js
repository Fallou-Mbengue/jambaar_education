"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEventSchema = exports.SubscribeSchema = void 0;
const zod_1 = require("zod");
exports.SubscribeSchema = zod_1.z.object({
    planId: zod_1.z.string().uuid(),
    provider: zod_1.z.enum(['WAVE', 'ORANGE_MONEY']),
    phoneNumber: zod_1.z.string().min(8).max(15),
});
exports.WebhookEventSchema = zod_1.z.object({
    provider: zod_1.z.string(),
    eventType: zod_1.z.string(),
    transactionId: zod_1.z.string(),
    status: zod_1.z.string(),
    amount: zod_1.z.number().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
//# sourceMappingURL=billing.schema.js.map