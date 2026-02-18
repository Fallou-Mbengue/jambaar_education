'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';
import { useGamificationStore } from '@/store/gamification.store';
import {
  LogOut, Crown, Flame, Star, Trophy, Shield,
  CreditCard, BookOpen, Zap, TrendingUp,
} from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import clsx from 'clsx';

const LEVEL_CONFIGS: Record<string, { gradient: string; icon: string }> = {
  Starter: { gradient: 'from-gray-600 to-gray-800', icon: '🌱' },
  Warrior: { gradient: 'from-blue-600 to-blue-900', icon: '⚔️' },
  Lion: { gradient: 'from-amber-500 to-amber-800', icon: '🦁' },
  GOAT: { gradient: 'from-orange-500 to-red-700', icon: '🐐' },
};

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const res = await apiClient.get('/gamification/profile');
      const data = res.data.data;
      useGamificationStore.getState().setProfile(data);
      return data;
    },
  });

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    router.push('/auth/login');
  };

  const level = gamification?.currentLevel ?? 'Starter';
  const cfg = LEVEL_CONFIGS[level] ?? LEVEL_CONFIGS.Starter;
  const xpTotal = gamification?.totalXp ?? 0;
  const xpToNext = gamification?.xpToNextLevel ?? 0;
  const xpPercent = xpToNext > 0 ? Math.min((xpTotal / (xpTotal + xpToNext)) * 100, 100) : 100;

  const displayName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName ?? ''}`.trim()
    : user?.email ?? '';

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-8 max-w-content-area mx-auto">
      <PageHeader
        title="Mon Profil"
        description="Tes statistiques, badges et progression."
        icon={Shield}
        actions={
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 bg-surface-2 border border-dark-border hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Déconnexion</span>
          </button>
        }
      />

      {/* ── Hero card ── */}
      <div className="card overflow-hidden mb-5">
        <div className={clsx('h-20 bg-gradient-to-r pattern-bg', cfg.gradient)} />
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="w-16 h-16 bg-surface-2 rounded-2xl border-2 border-dark-card flex items-center justify-center text-2xl relative">
              <span role="img" aria-label={`Niveau ${level}`}>{cfg.icon}</span>
              <div className="absolute -bottom-1 -right-1 bg-brand-orange text-dark-text text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {level.toUpperCase()}
              </div>
            </div>
            <button
              onClick={() => router.push('/billing')}
              className="flex items-center gap-1.5 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-gold/20 transition-colors"
            >
              <Crown size={12} /> Premium
            </button>
          </div>

          <h2 className="text-lg font-bold text-dark-text">{displayName}</h2>
          <p className="text-dark-text text-sm">{user?.email}</p>
          {user?.profile?.jobTitle && (
            <p className="text-dark-text text-xs mt-0.5">{user.profile.jobTitle}</p>
          )}

          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-dark-text font-medium">{xpTotal.toLocaleString()} XP</span>
              {xpToNext > 0 && (
                <span className="text-dark-text">+{xpToNext.toLocaleString()} XP prochain niveau</span>
              )}
            </div>
            <div className="bg-surface-3 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-brand-orange to-brand-gold h-2 rounded-full xp-bar-fill"
                style={{ width: `${xpPercent}%` }}
                role="progressbar"
                aria-valuenow={Math.round(xpPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progression XP"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Flame, color: 'text-brand-orange', bg: 'bg-brand-orange/10', value: gamification?.currentStreak ?? 0, label: 'Streak actuel' },
          { icon: Star, color: 'text-brand-gold', bg: 'bg-brand-gold/10', value: xpTotal.toLocaleString(), label: 'XP Total' },
          { icon: Trophy, color: 'text-brand-green', bg: 'bg-brand-green/10', value: gamification?.badges?.length ?? 0, label: 'Badges' },
          { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10', value: gamification?.longestStreak ?? 0, label: 'Meilleure série' },
        ].map(({ icon: Icon, color, bg, value, label }) => (
          <div key={label} className="card p-4 flex flex-col items-center text-center">
            <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center mb-2', bg)}>
              <Icon size={18} className={color} aria-hidden="true" />
            </div>
            <p className="text-xl font-bold text-dark-text">{value}</p>
            <p className="text-[11px] text-dark-text mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Badges ── */}
      {(gamification?.badges?.length ?? 0) > 0 && (
        <div className="card p-4 mb-5">
          <h3 className="text-sm font-semibold text-dark-text mb-3 flex items-center gap-2">
            <Trophy size={14} className="text-brand-gold" />
            Mes Badges ({gamification!.badges.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {gamification!.badges.map((badge: { id: string; name: string; description: string; iconUrl?: string }) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1.5 p-2.5 bg-surface-2 rounded-xl border border-dark-border hover:border-brand-gold/30 transition-colors group"
                title={badge.description}
              >
                <div className="w-10 h-10 bg-brand-gold/15 rounded-xl flex items-center justify-center">
                  <Crown size={18} className="text-brand-gold" aria-hidden="true" />
                </div>
                <p className="text-[10px] font-medium text-dark-text text-center line-clamp-2 leading-tight">
                  {badge.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick actions ── */}
      <div className="card p-4 mb-5">
        <h3 className="text-sm font-semibold text-dark-text mb-3">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { href: '/programs', icon: BookOpen, label: 'Mes Programmes', desc: 'Voir ta progression', color: 'text-brand-orange' },
            { href: '/challenges', icon: Zap, label: 'Mes Challenges', desc: 'Challenges actifs', color: 'text-brand-gold' },
            { href: '/saved', icon: Star, label: 'Contenus sauvegardés', desc: 'Ta liste de lecture', color: 'text-blue-400' },
            { href: '/billing', icon: CreditCard, label: 'Abonnement Premium', desc: 'Gérer ton abonnement', color: 'text-brand-green' },
          ].map(({ href, icon: Icon, label, desc, color }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex items-center gap-3 p-3 bg-surface-2 hover:bg-surface-3 border border-dark-border hover:border-white/20 rounded-xl transition-all text-left group"
            >
              <div className="w-9 h-9 bg-surface-3 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={16} className={color} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-text group-hover:text-brand-orange transition-colors">{label}</p>
                <p className="text-[10px] text-dark-text mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl text-sm font-medium transition-colors"
      >
        <LogOut size={16} aria-hidden="true" />
        Se déconnecter
      </button>
    </div>
  );
}
