'use client';

import { Flame, Star, Trophy, Crown, Zap, Target } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';
import clsx from 'clsx';

const LEVELS = [
  {
    name: 'Starter',
    emoji: '🌱',
    xp: '0 – 500 XP',
    description: 'Tu découvres la plateforme',
    gradient: 'from-gray-100 to-gray-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
  },
  {
    name: 'Warrior',
    emoji: '⚔️',
    xp: '500 – 2 000 XP',
    description: 'Tu prends des habitudes',
    gradient: 'from-orange-50 to-amber-50',
    border: 'border-landing-orange/30',
    badge: 'bg-landing-orange/10 text-landing-orange',
  },
  {
    name: 'Lion',
    emoji: '🦁',
    xp: '2 000 – 5 000 XP',
    description: 'Tu maîtrises les fondamentaux',
    gradient: 'from-yellow-50 to-amber-50',
    border: 'border-landing-yellow/50',
    badge: 'bg-landing-yellow/10 text-amber-700',
  },
  {
    name: 'GOAT',
    emoji: '🏆',
    xp: '5 000+ XP',
    description: 'Tu es une référence',
    gradient: 'from-landing-blue/5 to-purple-50',
    border: 'border-landing-blue/30',
    badge: 'bg-landing-blue/10 text-landing-blue',
  },
];

const STATS = [
  { icon: Flame, label: 'Streak record', value: '30 jours', color: 'text-landing-orange' },
  { icon: Zap, label: 'XP gagnés', value: '12 450', color: 'text-landing-yellow' },
  { icon: Trophy, label: 'Badges débloqués', value: '24', color: 'text-purple-500' },
  { icon: Target, label: 'Challenges terminés', value: '8', color: 'text-landing-green' },
];

export function GamificationSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-28 bg-gray-50 landing-section relative overflow-hidden" id="gamification">
      <div className="absolute inset-0 landing-pattern opacity-50" aria-hidden="true" />

      <div className="landing-container relative">
        <div
          ref={ref}
          className={clsx(
            'transition-all duration-700 ease-out',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          )}
        >
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-landing-blue mb-4">
              Monte de niveau
            </h2>
            <p className="text-lg text-gray-500">
              Chaque action te rapporte de l&apos;XP. Progresse du Starter au GOAT
              et débloque des récompenses exclusives.
            </p>
          </div>

          {/* Levels */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-14">
            {LEVELS.map((level, i) => (
              <div
                key={level.name}
                className={clsx(
                  'relative bg-gradient-to-br rounded-2xl p-6 border transition-all duration-300 hover:shadow-md hover:-translate-y-1',
                  level.gradient,
                  level.border
                )}
              >
                <div className="text-3xl mb-3">{level.emoji}</div>
                <div className={clsx('inline-block px-2.5 py-1 rounded-lg text-xs font-bold mb-3', level.badge)}>
                  {level.name}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">{level.xp}</div>
                <p className="text-xs text-gray-500">{level.description}</p>
                {i < LEVELS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-gray-300" aria-hidden="true">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
            <div className="text-center mb-6">
              <span className="text-sm font-semibold text-gray-500">Exemple de progression</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mb-2">
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <div className="text-2xl font-bold text-landing-blue">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* XP bar mock */}
            <div className="mt-8 max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Niveau Lion</span>
                <span className="text-xs text-gray-400">3 420 / 5 000 XP</span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-landing-orange via-landing-yellow to-amber-300"
                  style={{ width: '68%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
