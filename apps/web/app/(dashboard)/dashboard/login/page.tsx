'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { JambaarLogo } from '@/components/ui';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type Form = z.infer<typeof schema>;

export default function DashboardLoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    setError('');
    try {
      await authApi.login(data);
      const meRes = await authApi.getMe();
      const user = meRes.data.data;
      if (!['ADMIN', 'COACH'].includes(user.role)) {
        setError('Accès non autorisé. Compte admin ou coach requis.');
        return;
      }
      setUser(user);
      router.push('/dashboard');
    } catch {
      setError('Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <JambaarLogo size="lg" href="/" className="text-[#1E1E1E]" />
          <div className="text-sm text-gray-600 mt-2">Dashboard Partenaire</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <h1 className="text-xl font-semibold text-center text-gray-800">Connexion Admin</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-colors"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Mot de passe</label>
              <input
                {...register('password')}
                type="password"
                placeholder="Mot de passe"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-colors"
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Connexion...' : 'Accéder au dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
