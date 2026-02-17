"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERESTS = exports.OBJECTIVES = exports.UpdateProfileSchema = exports.OnboardingSchema = void 0;
const zod_1 = require("zod");
exports.OnboardingSchema = zod_1.z.object({
    objectives: zod_1.z.array(zod_1.z.string()).min(1, 'Select at least one objective'),
    interests: zod_1.z.array(zod_1.z.string()).min(1, 'Select at least one interest'),
    level: zod_1.z.enum(['beginner', 'intermediate', 'advanced']),
    firstName: zod_1.z.string().min(1).max(50).optional(),
    lastName: zod_1.z.string().min(1).max(50).optional(),
});
exports.UpdateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(50).optional(),
    lastName: zod_1.z.string().min(1).max(50).optional(),
    phone: zod_1.z.string().optional(),
    bio: zod_1.z.string().max(500).optional(),
    jobTitle: zod_1.z.string().max(100).optional(),
    company: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().max(50).optional(),
    language: zod_1.z.string().optional(),
});
exports.OBJECTIVES = [
    { value: 'job_search', label: 'Trouver un emploi' },
    { value: 'career_growth', label: 'Évoluer en entreprise' },
    { value: 'entrepreneurship', label: 'Lancer mon business' },
];
exports.INTERESTS = [
    { value: 'communication', label: 'Communication' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'productivity', label: 'Productivité' },
    { value: 'public_speaking', label: 'Prise de parole' },
    { value: 'stress_management', label: 'Gestion du stress' },
    { value: 'teamwork', label: 'Travail en équipe' },
    { value: 'negotiation', label: 'Négociation' },
    { value: 'time_management', label: 'Gestion du temps' },
    { value: 'entrepreneurship', label: 'Entrepreneuriat' },
    { value: 'sales', label: 'Vente & pitch' },
];
//# sourceMappingURL=user.schema.js.map