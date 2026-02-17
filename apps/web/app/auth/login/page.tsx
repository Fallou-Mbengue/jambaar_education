'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      await authApi.login(data);
      const meRes = await authApi.getMe();
      setUser(meRes.data.data);
      const from = searchParams.get('from') ?? '/home';
      router.push(from);
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const msg = res?.message;
      const text =
        typeof msg === 'string'
          ? msg
          : Array.isArray(msg)
            ? msg[0]
            : 'Email ou mot de passe incorrect.';
      setError(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-brand-orange mb-1">JAMBAAR</div>
          <div className="text-sm text-dark-text">Les soft skills qui ouvrent les portes.</div>
        </div>

        <div className="bg-white border border-dark-border rounded-2xl p-6 shadow-card space-y-4">
          <h1 className="text-xl font-semibold text-center text-gray-800">Connexion</h1>

          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                {...register('password')}
                type="password"
                placeholder="Mot de passe"
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-dark-text text-sm">
            Pas encore de compte ?{' '}
            <Link href="/auth/signup" className="text-brand-orange hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center p-4">
        <div className="text-brand-orange">Chargement...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
