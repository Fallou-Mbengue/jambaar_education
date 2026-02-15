import { z } from 'zod';

export const OnboardingSchema = z.object({
  objectives: z.array(z.string()).min(1, 'Select at least one objective'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  jobTitle: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  country: z.string().max(50).optional(),
  language: z.string().optional(),
});

export type OnboardingDto = z.infer<typeof OnboardingSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const OBJECTIVES = [
  { value: 'job_search', label: 'Trouver un emploi' },
  { value: 'career_growth', label: 'Évoluer en entreprise' },
  { value: 'entrepreneurship', label: 'Lancer mon business' },
] as const;

export const INTERESTS = [
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
] as const;
