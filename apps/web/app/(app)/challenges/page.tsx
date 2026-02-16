'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Zap, Lock, Search, CheckCircle, Clock, Trophy } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgramCardSkeleton, EmptyState } from '@/components/ui';
import { PremiumBadge } from '@/components/ui/Badge';
import clsx from 'clsx';

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

type StatusFilter = 'all' | 'in_progress' | 'completed' | 'available';

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'in_progress', label: 'En cours' },
  { id: 'available', label: 'Disponibles' },
  { id: 'completed', label: 'Terminés' },
];

export default function ChallengesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const res = await apiClient.get('/challenges');
      return res.data.data as Challenge[];
    },
  });

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    if (statusFilter === 'in_progress') list = list.filter((c) => c.userProgress?.status === 'IN_PROGRESS');
    else if (statusFilter === 'completed') list = list.filter((c) => c.userProgress?.status === 'COMPLETED');
    else if (statusFilter === 'available') list = list.filter((c) => !c.userProgress);
    return list;
  }, [data, search, statusFilter]);

  const inProgress = (data ?? []).filter((c) => c.userProgress?.status === 'IN_PROGRESS');
  const completed = (data ?? []).filter((c) => c.userProgress?.status === 'COMPLETED');

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-8 max-w-content-area mx-auto">
      <PageHeader
        title="Challenges 7 Jours"
        description="Un résultat concret en 7 jours. Progresse jour après jour."
        icon={Zap}
        actions={
          <div className="flex items-center gap-2 text-xs text-dark-text">
            {inProgress.length > 0 && (
              <span className="bg-brand-orange/10 text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-full font-medium">
                {inProgress.length} en cours
              </span>
            )}
            {completed.length > 0 && (
              <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-full font-medium">
                {completed.length} terminés
              </span>
            )}
          </div>
        }
      />

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text pointer-events-none" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un challenge..."
            className="w-full bg-surface-2 border border-dark-border rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-dark-text focus:outline-none focus:border-brand-orange/50 transition-colors"
            aria-label="Rechercher"
          />
        </div>
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setStatusFilter(id)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                statusFilter === id
                  ? 'bg-brand-orange text-white'
                  : 'bg-surface-2 text-dark-text hover:text-white border border-dark-border',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ProgramCardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={Zap}
          title="Aucun challenge trouvé"
          description={search ? `Aucun résultat pour "${search}"` : 'Aucun challenge disponible.'}
          action={search ? { label: 'Effacer la recherche', onClick: () => setSearch('') } : undefined}
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const progress = challenge.userProgress;
  const isCompleted = progress?.status === 'COMPLETED';
  const isInProgress = progress?.status === 'IN_PROGRESS';
  const dayPercent = isInProgress
    ? ((progress!.currentDay - 1) / challenge.durationDays) * 100
    : isCompleted ? 100 : 0;

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className="card card-interactive block group overflow-hidden"
      aria-label={`Challenge: ${challenge.title}`}
    >
      {/* Thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-brand-orange/15 to-surface-3 overflow-hidden rounded-t-card">
        {challenge.thumbnailUrl ? (
          <img
            src={challenge.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Zap size={36} className="text-brand-orange/40" aria-hidden="true" />
          </div>
        )}
        {/* Status overlay */}
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <div className="flex gap-1.5">
            {challenge.isPremium && <PremiumBadge />}
            {challenge.badge && (
              <span className="flex items-center gap-0.5 bg-brand-gold/90 text-black text-[10px] font-black px-1.5 py-0.5 rounded">
                <Trophy size={9} /> Badge
              </span>
            )}
          </div>
          {isCompleted && (
            <span className="flex items-center gap-1 bg-brand-green text-black text-[10px] font-black px-1.5 py-0.5 rounded">
              <CheckCircle size={9} /> TERMINÉ
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm leading-snug mb-1.5 group-hover:text-brand-orange transition-colors line-clamp-2">
          {challenge.title}
        </h3>
        {challenge.description && (
          <p className="text-dark-text text-xs leading-relaxed line-clamp-2 mb-3">
            {challenge.description}
          </p>
        )}

        <div className="flex items-center justify-between text-[11px] text-dark-text mb-3">
          <span className="flex items-center gap-1">
            <Zap size={11} className="text-brand-orange" aria-hidden="true" />
            {challenge.durationDays} jours
          </span>
          {isInProgress && (
            <span className="text-brand-orange font-semibold">
              Jour {progress!.currentDay}/{challenge.durationDays}
            </span>
          )}
          {isCompleted && (
            <span className="text-brand-green font-semibold flex items-center gap-1">
              <CheckCircle size={11} /> Terminé
            </span>
          )}
          {!isInProgress && !isCompleted && (
            <span className="bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full font-medium">
              Commencer
            </span>
          )}
        </div>

        {/* Progress bar */}
        {(isInProgress || isCompleted) && (
          <div className="bg-surface-3 rounded-full h-1">
            <div
              className={clsx(
                'h-1 rounded-full xp-bar-fill',
                isCompleted ? 'bg-brand-green' : 'bg-brand-orange',
              )}
              style={{ width: `${dayPercent}%` }}
              role="progressbar"
              aria-valuenow={dayPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}

        {/* Tags */}
        {challenge.tags.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {challenge.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] text-brand-orange">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
