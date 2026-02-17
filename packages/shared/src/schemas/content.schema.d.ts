import { z } from 'zod';
export declare const ContentTypeEnum: z.ZodEnum<["VIDEO", "ARTICLE", "QUIZ", "MICRO_LEARNING"]>;
export declare const ContentStatusEnum: z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>;
export declare const CreateContentSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["VIDEO", "ARTICLE", "QUIZ", "MICRO_LEARNING"]>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    durationSeconds: z.ZodOptional<z.ZodNumber>;
    isPremium: z.ZodDefault<z.ZodBoolean>;
    thumbnailKey: z.ZodOptional<z.ZodString>;
    videoKey: z.ZodOptional<z.ZodString>;
    articleBody: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "VIDEO" | "ARTICLE" | "QUIZ" | "MICRO_LEARNING";
    title: string;
    tags: string[];
    isPremium: boolean;
    description?: string | undefined;
    durationSeconds?: number | undefined;
    thumbnailKey?: string | undefined;
    videoKey?: string | undefined;
    articleBody?: string | undefined;
}, {
    type: "VIDEO" | "ARTICLE" | "QUIZ" | "MICRO_LEARNING";
    title: string;
    description?: string | undefined;
    tags?: string[] | undefined;
    durationSeconds?: number | undefined;
    isPremium?: boolean | undefined;
    thumbnailKey?: string | undefined;
    videoKey?: string | undefined;
    articleBody?: string | undefined;
}>;
export declare const UpdateContentSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodEnum<["VIDEO", "ARTICLE", "QUIZ", "MICRO_LEARNING"]>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    durationSeconds: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isPremium: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    thumbnailKey: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    videoKey: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    articleBody: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "VIDEO" | "ARTICLE" | "QUIZ" | "MICRO_LEARNING" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    tags?: string[] | undefined;
    durationSeconds?: number | undefined;
    isPremium?: boolean | undefined;
    thumbnailKey?: string | undefined;
    videoKey?: string | undefined;
    articleBody?: string | undefined;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
}, {
    type?: "VIDEO" | "ARTICLE" | "QUIZ" | "MICRO_LEARNING" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    tags?: string[] | undefined;
    durationSeconds?: number | undefined;
    isPremium?: boolean | undefined;
    thumbnailKey?: string | undefined;
    videoKey?: string | undefined;
    articleBody?: string | undefined;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
}>;
export declare const FeedQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    cursor?: string | undefined;
}, {
    cursor?: string | undefined;
    limit?: number | undefined;
}>;
export type CreateContentDto = z.infer<typeof CreateContentSchema>;
export type UpdateContentDto = z.infer<typeof UpdateContentSchema>;
export type FeedQueryDto = z.infer<typeof FeedQuerySchema>;
//# sourceMappingURL=content.schema.d.ts.map