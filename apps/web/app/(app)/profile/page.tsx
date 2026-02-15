'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';
import { LogOut, Settings, Crown, Flame, Star } from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';
import { useRouter } from 'next/navigation';

const LEVEL_COLORS: Record<string, string> = {
  Starter: 'from-gray-400 to-gray-600',
  Warrior: 'from-blue-400 to-blue-600',
  Lion: 'from-amber-400 to-amber-600',
  GOAT: 'from-brand-orange to-red-600',
};

const LEVEL_ICONS: Record<string, string> = {
  Starter: '🌱',
  Warrior: '⚔️',
  Lion: '🦁',
  GOAT: '🐐',
};

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const res = await apiClient.get('/gamification/profile');
      return res.data.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/users/me');
      return res.data.data;
    },
  });

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    router.push('/auth/login');
  };

  const level = gamification?.currentLevel ?? 'Starter';
  const xpPercent = gamification?.xpToNextLevel
    ? Math.min(
        ((gamification.totalXp - (gamification.xpInCurrentLevel ?? 0)) /
          (gamification.xpToNextLevel + (gamification.totalXp - (gamification.xpInCurrentLevel ?? 0)))) *
          100,
        100,
      )
    : 100;

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className={`bg-gradient-to-b ${LEVEL_COLORS[level] ?? LEVEL_COLORS.Starter} p-6 pt-10`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
              {LEVEL_ICONS[level] ?? '🌱'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </h1>
              <p className="text-white/70 text-sm">{user?.email}</p>
              <span className="inline-block bg-white/20 text-white text-xs px-2 py-0.5 rounded-full mt-1 font-semibold">
                {level}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-white/70 hover:text-white">
            <LogOut size={20} />
          </button>
        </div>

        {/* XP Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-white/80 text-xs mb-1">
            <span>{gamification?.totalXp ?? 0} XP</span>
            {gamification?.xpToNextLevel > 0 && (
              <span>+{gamification.xpToNextLevel} XP pour le prochain niveau</span>
            )}
          </div>
          <div className="bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full xp-bar-fill"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 py-4">
        <div className="glass rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-brand-orange mb-1">
            <Flame size={16} />
            <span className="font-bold">{gamification?.currentStreak ?? 0}</span>
          </div>
          <p className="text-xs text-dark-text">Streak</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-brand-gold mb-1">
            <Star size={16} />
            <span className="font-bold">{gamification?.totalXp ?? 0}</span>
          </div>
          <p className="text-xs text-dark-text">XP Total</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-brand-orange mb-1">
            <Crown size={16} />
            <span className="font-bold">{gamification?.badges?.length ?? 0}</span>
          </div>
          <p className="text-xs text-dark-text">Badges</p>
        </div>
      </div>

      {/* Badges */}
      {(gamification?.badges?.length ?? 0) > 0 && (
        <div className="px-4 mb-4">
          <h2 className="text-lg font-bold mb-3">Mes Badges</h2>
          <div className="grid grid-cols-3 gap-3">
            {(gamification?.badges ?? []).map((badge: { id: string; name: string; description: string; iconUrl?: string }) => (
              <div key={badge.id} className="glass rounded-xl p-3 text-center">
                <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Crown size={20} className="text-brand-gold" />
                </div>
                <p className="text-xs font-medium text-white line-clamp-2">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 space-y-3">
        <button
          onClick={() => router.push('/billing')}
          className="w-full glass rounded-xl p-4 flex items-center justify-between hover:border-brand-orange/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <Crown size={20} className="text-brand-gold" />
            <span className="font-medium">Abonnement Premium</span>
          </div>
          <span className="text-dark-text text-sm">→</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full glass rounded-xl p-4 flex items-center gap-3 text-red-400 hover:border-red-500/30 transition-all"
        >
          <LogOut size={20} />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
