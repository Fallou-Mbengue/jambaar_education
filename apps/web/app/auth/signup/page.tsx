'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { JambaarLogo } from '@/components/ui';

const signupSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Au moins 8 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    setError('');
    try {
      const { confirmPassword: _confirmPassword, ...dto } = data;
      await authApi.signup(dto);
      const meRes = await authApi.getMe();
      setUser(meRes.data.data);
      router.push('/onboarding');
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const msg = res?.message;
      const text =
        typeof msg === 'string'
          ? msg
          : Array.isArray(msg)
            ? msg[0]
            : 'Une erreur est survenue';
      setError(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <JambaarLogo size="lg" href="/" className="text-[#1E1E1E]" />
          <div className="text-sm text-dark-text mt-2">Ton futur commence avec un skill.</div>
        </div>

        <div className="bg-white border border-dark-border rounded-2xl p-6 shadow-card space-y-4">
          <h1 className="text-xl font-semibold text-center text-gray-800">Créer un compte</h1>

          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-dark-text mb-1">Prénom</label>
              <input
                {...register('firstName')}
                placeholder="Prénom"
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
              />
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-text mb-1">Nom</label>
              <input
                {...register('lastName')}
                placeholder="Nom"
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
              />
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-text mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-text mb-1">Téléphone</label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="Téléphone"
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
              />
              {errors.phone && (
                <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-text mb-1">Mot de passe</label>
              <input
                {...register('password')}
                type="password"
                placeholder="Mot de passe"
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-text mb-1">Confirmation mot de passe</label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="Confirmation mot de passe"
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-dark-text font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-dark-text text-sm">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-brand-orange hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
