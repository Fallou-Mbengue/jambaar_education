'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Link from 'next/link';
import { Zap, Lock } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  durationDays: number;
  tags: string[];
  userProgress?: { status: string; currentDay: number } | null;
  badge?: { name: string } | null;
  _count: { days: number };
}

export default function ChallengesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const res = await apiClient.get('/challenges');
      return res.data.data as Challenge[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-brand-orange">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Challenges 7 Jours</h1>
      <p className="text-dark-text text-sm mb-6">Un résultat concret en 7 jours.</p>

      <div className="space-y-4">
        {(data ?? []).map((challenge) => {
          const progress = challenge.userProgress;
          const isCompleted = progress?.status === 'COMPLETED';
          const isInProgress = progress?.status === 'IN_PROGRESS';

          return (
            <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
              <div className="glass rounded-2xl overflow-hidden hover:border-brand-orange/30 transition-all">
                {challenge.thumbnailUrl && (
                  <div className="h-32 bg-gradient-to-br from-brand-orange/20 to-dark-card relative">
                    <img
                      src={challenge.thumbnailUrl}
                      alt={challenge.title}
                      className="w-full h-full object-cover"
                    />
                    {challenge.isPremium && (
                      <div className="absolute top-2 right-2 bg-brand-gold text-black text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Lock size={10} /> PREMIUM
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{challenge.title}</h3>
                      {challenge.description && (
                        <p className="text-dark-text text-sm mt-1 line-clamp-2">
                          {challenge.description}
                        </p>
                      )}
                    </div>
                    {isCompleted && (
                      <span className="text-xl flex-shrink-0">🏆</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-brand-orange" />
                      <span className="text-xs text-dark-text">{challenge.durationDays} jours</span>
                      {challenge.badge && (
                        <span className="text-xs text-brand-gold">• Badge inclus</span>
                      )}
                    </div>

                    {isCompleted ? (
                      <span className="text-xs text-brand-green font-medium">Complété ✓</span>
                    ) : isInProgress ? (
                      <span className="text-xs text-brand-orange font-medium">
                        Jour {progress?.currentDay}/{challenge.durationDays}
                      </span>
                    ) : (
                      <span className="text-xs bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full">
                        Commencer
                      </span>
                    )}
                  </div>

                  {isInProgress && (
                    <div className="mt-2 bg-white/10 rounded-full h-1.5">
                      <div
                        className="bg-brand-orange h-1.5 rounded-full xp-bar-fill"
                        style={{
                          width: `${((progress?.currentDay ?? 1) / challenge.durationDays) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
