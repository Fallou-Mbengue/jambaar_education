import { z } from 'zod';
export declare const OnboardingSchema: z.ZodObject<{
    objectives: z.ZodArray<z.ZodString, "many">;
    interests: z.ZodArray<z.ZodString, "many">;
    level: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    objectives: string[];
    interests: string[];
    level: "beginner" | "intermediate" | "advanced";
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    objectives: string[];
    interests: string[];
    level: "beginner" | "intermediate" | "advanced";
    firstName?: string | undefined;
    lastName?: string | undefined;
}>;
export declare const UpdateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    jobTitle: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    jobTitle?: string | undefined;
    company?: string | undefined;
    country?: string | undefined;
    language?: string | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    bio?: string | undefined;
    jobTitle?: string | undefined;
    company?: string | undefined;
    country?: string | undefined;
    language?: string | undefined;
}>;
export type OnboardingDto = z.infer<typeof OnboardingSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export declare const OBJECTIVES: readonly [{
    readonly value: "job_search";
    readonly label: "Trouver un emploi";
}, {
    readonly value: "career_growth";
    readonly label: "Évoluer en entreprise";
}, {
    readonly value: "entrepreneurship";
    readonly label: "Lancer mon business";
}];
export declare const INTERESTS: readonly [{
    readonly value: "communication";
    readonly label: "Communication";
}, {
    readonly value: "leadership";
    readonly label: "Leadership";
}, {
    readonly value: "productivity";
    readonly label: "Productivité";
}, {
    readonly value: "public_speaking";
    readonly label: "Prise de parole";
}, {
    readonly value: "stress_management";
    readonly label: "Gestion du stress";
}, {
    readonly value: "teamwork";
    readonly label: "Travail en équipe";
}, {
    readonly value: "negotiation";
    readonly label: "Négociation";
}, {
    readonly value: "time_management";
    readonly label: "Gestion du temps";
}, {
    readonly value: "entrepreneurship";
    readonly label: "Entrepreneuriat";
}, {
    readonly value: "sales";
    readonly label: "Vente & pitch";
}];
//# sourceMappingURL=user.schema.d.ts.map