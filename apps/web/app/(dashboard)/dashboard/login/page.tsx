'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

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
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-brand-orange">JAMBAAR</div>
          <div className="text-sm text-dark-text mt-1">Dashboard Partenaire</div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h1 className="text-xl font-semibold text-center">Connexion Admin</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register('email')}
              type="email"
              placeholder="Email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-dark-text placeholder-dark-text focus:outline-none focus:border-brand-orange transition-colors"
            />
            <input
              {...register('password')}
              type="password"
              placeholder="Mot de passe"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-dark-text placeholder-dark-text focus:outline-none focus:border-brand-orange transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-dark-text font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Connexion...' : 'Accéder au dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
