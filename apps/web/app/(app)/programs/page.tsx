'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, Search, SlidersHorizontal, ChevronRight, Clock, Layers } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgramCardSkeleton, EmptyState } from '@/components/ui';
import { PremiumBadge, StatusBadge } from '@/components/ui/Badge';
import clsx from 'clsx';

interface Program {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  durationDays?: number;
  tags: string[];
  status: string;
  progress?: { progressPercent: number } | null;
  _count: { modules: number };
}

type SortKey = 'recent' | 'progress' | 'duration';

export default function ProgramsPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const res = await apiClient.get('/programs');
      return res.data.data as Program[];
    },
  });

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    (data ?? []).forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).slice(0, 8);
  }, [data]);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (selectedTag) {
      list = list.filter((p) => p.tags.includes(selectedTag));
    }
    return [...list].sort((a, b) => {
      if (sort === 'progress') {
        return (b.progress?.progressPercent ?? 0) - (a.progress?.progressPercent ?? 0);
      }
      if (sort === 'duration') {
        return (a.durationDays ?? 0) - (b.durationDays ?? 0);
      }
      return 0;
    });
  }, [data, search, sort, selectedTag]);

  const inProgress = filtered.filter((p) => p.progress && p.progress.progressPercent > 0 && p.progress.progressPercent < 100);
  const notStarted = filtered.filter((p) => !p.progress || p.progress.progressPercent === 0);
  const completed = filtered.filter((p) => p.progress?.progressPercent === 100);

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-8 max-w-content-area mx-auto">
      <PageHeader
        title="Programmes"
        description="Parcours complets pour développer tes soft skills."
        icon={BookOpen}
        actions={
          <span className="text-xs text-dark-text bg-surface-2 border border-dark-border px-3 py-1.5 rounded-full">
            {(data ?? []).length} programmes
          </span>
        }
      />

      {/* Search + sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text pointer-events-none" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un programme..."
            className="w-full bg-surface-2 border border-dark-border rounded-lg pl-8 pr-3 py-2 text-sm text-dark-text placeholder-dark-text focus:outline-none focus:border-brand-orange/50 transition-colors"
            aria-label="Rechercher"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-dark-text flex-shrink-0" aria-hidden="true" />
          {(['recent', 'progress', 'duration'] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                sort === s
                  ? 'bg-brand-orange text-dark-text'
                  : 'bg-surface-2 text-dark-text hover:text-dark-text border border-dark-border',
              )}
            >
              {s === 'recent' ? 'Récents' : s === 'progress' ? 'En cours' : 'Durée'}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedTag(null)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
              !selectedTag ? 'bg-white text-black' : 'bg-surface-2 text-dark-text hover:text-dark-text border border-dark-border',
            )}
          >
            Tous
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                selectedTag === tag
                  ? 'bg-brand-orange text-dark-text'
                  : 'bg-surface-2 text-dark-text hover:text-dark-text border border-dark-border',
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ProgramCardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Aucun programme trouvé"
          description={search ? `Aucun résultat pour "${search}"` : 'Aucun programme disponible.'}
          action={search ? { label: 'Effacer la recherche', onClick: () => setSearch('') } : undefined}
        />
      )}

      {/* In progress section */}
      {inProgress.length > 0 && (
        <section className="mb-6" aria-label="En cours">
          <h2 className="text-sm font-semibold text-dark-text uppercase tracking-wide mb-3">
            En cours · {inProgress.length}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {inProgress.map((p) => <ProgramCard key={p.id} program={p} />)}
          </div>
        </section>
      )}

      {/* Not started */}
      {notStarted.length > 0 && (
        <section className="mb-6" aria-label="Disponibles">
          <h2 className="text-sm font-semibold text-dark-text uppercase tracking-wide mb-3">
            {inProgress.length > 0 ? 'Disponibles' : 'Programmes'} · {notStarted.length}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {notStarted.map((p) => <ProgramCard key={p.id} program={p} />)}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section aria-label="Terminés">
          <h2 className="text-sm font-semibold text-dark-text uppercase tracking-wide mb-3">
            Terminés · {completed.length}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {completed.map((p) => <ProgramCard key={p.id} program={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function ProgramCard({ program }: { program: Program }) {
  const percent = program.progress?.progressPercent ?? 0;
  const isCompleted = percent === 100;
  const isInProgress = percent > 0 && !isCompleted;

  return (
    <Link
      href={`/parcours/${program.id}`}
      className="card card-interactive block group"
      aria-label={`Programme: ${program.title}`}
    >
      {/* Thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-brand-orange/15 to-surface-3 overflow-hidden rounded-t-card">
        {program.thumbnailUrl ? (
          <img
            src={program.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={36} className="text-brand-orange/40" aria-hidden="true" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1.5">
          {program.isPremium && <PremiumBadge />}
          {isCompleted && (
            <span className="bg-brand-green text-black text-[10px] font-black px-1.5 py-0.5 rounded">
              ✓ TERMINÉ
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-dark-text text-sm leading-snug mb-1 group-hover:text-brand-orange transition-colors line-clamp-2">
          {program.title}
        </h3>
        {program.description && (
          <p className="text-dark-text text-xs leading-relaxed line-clamp-2 mb-3">
            {program.description}
          </p>
        )}

        <div className="flex items-center justify-between text-[11px] text-dark-text mb-2">
          <span className="flex items-center gap-1">
            <Layers size={11} aria-hidden="true" /> {program._count.modules} modules
          </span>
          {program.durationDays && (
            <span className="flex items-center gap-1">
              <Clock size={11} aria-hidden="true" /> {program.durationDays} jours
            </span>
          )}
          {isInProgress && (
            <span className="text-brand-orange font-semibold">{percent}%</span>
          )}
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {program.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] text-brand-orange">#{tag}</span>
          ))}
        </div>

        {/* Progress bar */}
        {isInProgress && (
          <div className="bg-surface-3 rounded-full h-1 mb-3">
            <div
              className="bg-brand-orange h-1 rounded-full xp-bar-fill"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span
            className={clsx(
              'text-xs font-medium',
              isCompleted ? 'text-brand-green' : isInProgress ? 'text-brand-orange' : 'text-dark-text',
            )}
          >
            {isCompleted ? '✓ Complété' : isInProgress ? 'Continuer' : 'Commencer'}
          </span>
          <ChevronRight size={14} className="text-dark-text group-hover:text-dark-text transition-colors" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
