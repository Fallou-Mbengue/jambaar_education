import { z } from 'zod';
export declare const SubscribeSchema: z.ZodObject<{
    planId: z.ZodString;
    provider: z.ZodEnum<["WAVE", "ORANGE_MONEY"]>;
    phoneNumber: z.ZodString;
}, "strip", z.ZodTypeAny, {
    planId: string;
    provider: "WAVE" | "ORANGE_MONEY";
    phoneNumber: string;
}, {
    planId: string;
    provider: "WAVE" | "ORANGE_MONEY";
    phoneNumber: string;
}>;
export declare const WebhookEventSchema: z.ZodObject<{
    provider: z.ZodString;
    eventType: z.ZodString;
    transactionId: z.ZodString;
    status: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    provider: string;
    eventType: string;
    transactionId: string;
    amount?: number | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    status: string;
    provider: string;
    eventType: string;
    transactionId: string;
    amount?: number | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type SubscribeDto = z.infer<typeof SubscribeSchema>;
export type WebhookEventDto = z.infer<typeof WebhookEventSchema>;
//# sourceMappingURL=billing.schema.d.ts.map