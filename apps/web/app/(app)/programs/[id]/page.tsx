'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { programsApi } from '@/lib/api/content.api';
import {
  ArrowLeft, CheckCircle, Lock, PlayCircle, BookOpen,
  Clock, Layers, ChevronRight, Star,
} from 'lucide-react';
import Link from 'next/link';
import { PremiumBadge } from '@/components/ui/Badge';
import { useRightPanelStore } from '@/store/rightPanel.store';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import clsx from 'clsx';

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setPanel = useRightPanelStore((s) => s.setContent);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);

  const { data: program, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      const res = await programsApi.getById(id);
      const data = res.data.data;
      // Push progression to right panel
      setPanel({
        programId: id,
        progression: data.userProgress
          ? {
              percent: Math.round(data.userProgress.progressPercent),
              label: `${data.title}`,
            }
          : null,
      });
      return data;
    },
  });

  const enrollMutation = useMutation({
    mutationFn: () => programsApi.enroll(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['program', id] }),
  });

  const progressMutation = useMutation({
    mutationFn: (data: { moduleId: string; completed: boolean }) =>
      programsApi.updateProgress(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['program', id] }),
  });

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 xl:w-96 flex-shrink-0 border-r border-dark-border p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Programme non trouvé"
        description="Ce programme n'existe pas ou a été supprimé."
        action={{ label: 'Retour aux programmes', onClick: () => router.push('/programs') }}
        className="h-full"
      />
    );
  }

  const progressPct = program.userProgress?.progressPercent ?? 0;
  const isEnrolled = !!program.userProgress;
  const modules: any[] = program.modules ?? [];

  // Auto-select first unlocked module
  const firstUnlocked = modules.find((_, i) => i === 0 || modules[i - 1]?.userCompleted);
  const displayModule = selectedModule ?? firstUnlocked ?? null;

  const getDayStatus = (mod: any, idx: number): 'completed' | 'current' | 'locked' => {
    if (mod.userCompleted) return 'completed';
    if (!isEnrolled) return 'locked';
    if (idx === 0 || modules[idx - 1]?.userCompleted) return 'current';
    return 'locked';
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── LEFT: Module list (split-panel) ── */}
      <div className="hidden md:flex md:flex-col w-80 xl:w-96 flex-shrink-0 border-r border-dark-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-border flex-shrink-0">
          <button
            onClick={() => router.push('/programs')}
            className="text-dark-text hover:text-white transition-colors"
            aria-label="Retour aux programmes"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-sm font-semibold text-white truncate flex-1">{program.title}</h1>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-dark-border bg-surface-1 flex-shrink-0">
          <span className="flex items-center gap-1 text-[11px] text-dark-text">
            <Layers size={11} /> {modules.length} modules
          </span>
          {program.durationDays && (
            <span className="flex items-center gap-1 text-[11px] text-dark-text">
              <Clock size={11} /> {program.durationDays}j
            </span>
          )}
          {isEnrolled && (
            <span className="text-[11px] text-brand-orange ml-auto font-medium">
              {Math.round(progressPct)}%
            </span>
          )}
        </div>

        {/* Progress bar */}
        {isEnrolled && (
          <div className="h-0.5 bg-surface-3 flex-shrink-0">
            <div
              className="h-full bg-brand-orange xp-bar-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Module list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {modules.map((mod, idx) => {
            const status = getDayStatus(mod, idx);
            const isSelected = displayModule?.id === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setSelectedModule(mod)}
                className={clsx(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                  isSelected
                    ? 'bg-brand-orange/10 border border-brand-orange/30'
                    : 'hover:bg-surface-2 border border-transparent',
                  status === 'locked' && 'opacity-50',
                )}
                disabled={status === 'locked'}
                aria-pressed={isSelected}
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    status === 'completed' ? 'bg-brand-green/15' : status === 'current' ? 'bg-brand-orange/15' : 'bg-surface-3',
                  )}
                >
                  {status === 'completed' ? (
                    <CheckCircle size={16} className="text-brand-green" />
                  ) : status === 'current' ? (
                    <PlayCircle size={16} className="text-brand-orange" />
                  ) : (
                    <Lock size={14} className="text-dark-text" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white line-clamp-1">{mod.title}</p>
                  <p className="text-[10px] text-dark-text mt-0.5">
                    Module {idx + 1}
                    {mod.content?.durationSeconds
                      ? ` · ${Math.ceil(mod.content.durationSeconds / 60)} min`
                      : ''}
                  </p>
                </div>
                {status !== 'locked' && (
                  <ChevronRight size={12} className="text-dark-text flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Enroll CTA */}
        {!isEnrolled && (
          <div className="p-3 border-t border-dark-border flex-shrink-0">
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {enrollMutation.isPending ? 'Inscription...' : "S'inscrire au programme"}
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: Module detail ── */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-10 bg-dark-bg/80 backdrop-blur px-4 py-3 flex items-center gap-3 border-b border-dark-border">
          <button onClick={() => router.back()} className="text-dark-text hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white font-semibold flex-1 line-clamp-1">{program.title}</h1>
        </div>

        {displayModule ? (
          <div className="p-4 md:p-6">
            {/* Module header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-dark-text uppercase tracking-wide mb-1">
                  Module {modules.indexOf(displayModule) + 1} / {modules.length}
                </p>
                <h2 className="text-xl font-bold text-white">{displayModule.title}</h2>
              </div>
              {displayModule.userCompleted && (
                <span className="flex items-center gap-1.5 text-brand-green text-sm font-medium flex-shrink-0">
                  <CheckCircle size={16} /> Complété
                </span>
              )}
            </div>

            {/* Content preview */}
            {displayModule.content && (
              <div className="card mb-4 overflow-hidden">
                <div className="relative h-48 md:h-56 bg-gradient-to-br from-brand-orange/15 to-surface-3">
                  {displayModule.content.thumbnailUrl ? (
                    <img
                      src={displayModule.content.thumbnailUrl}
                      alt={displayModule.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircle size={48} className="text-brand-orange/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {displayModule.content.durationSeconds && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                      <Clock size={10} />
                      {Math.ceil(displayModule.content.durationSeconds / 60)} min
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {displayModule.content.description && (
                    <p className="text-dark-text text-sm leading-relaxed mb-4">
                      {displayModule.content.description}
                    </p>
                  )}
                  {displayModule.contentId && isEnrolled && (
                    <Link href={`/content/${displayModule.contentId}`}>
                      <button
                        onClick={() => progressMutation.mutate({ moduleId: displayModule.id, completed: false })}
                        className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-3 rounded-xl transition-colors"
                      >
                        {displayModule.userCompleted ? '↺ Revoir ce module' : '▶ Commencer ce module'}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Mobile modules list */}
            <div className="md:hidden">
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">
                Tous les modules
              </h3>
              <div className="space-y-2">
                {modules.map((mod, idx) => {
                  const status = getDayStatus(mod, idx);
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedModule(mod)}
                      disabled={status === 'locked'}
                      className={clsx(
                        'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border',
                        displayModule?.id === mod.id
                          ? 'bg-brand-orange/10 border-brand-orange/30'
                          : 'border-dark-border hover:border-white/20',
                        status === 'locked' && 'opacity-50',
                      )}
                    >
                      <div className={clsx(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                        status === 'completed' ? 'bg-brand-green/15' : 'bg-brand-orange/15',
                      )}>
                        {status === 'completed' ? (
                          <CheckCircle size={14} className="text-brand-green" />
                        ) : status === 'current' ? (
                          <PlayCircle size={14} className="text-brand-orange" />
                        ) : (
                          <Lock size={12} className="text-dark-text" />
                        )}
                      </div>
                      <p className="text-sm text-white font-medium line-clamp-1 flex-1">{mod.title}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Enroll CTA mobile */}
            {!isEnrolled && (
              <div className="md:hidden mt-4">
                <button
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending}
                  className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-50"
                >
                  {enrollMutation.isPending ? 'Inscription...' : "S'inscrire au programme"}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Program overview when no module selected */
          <div className="p-4 md:p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-brand-orange/15 rounded-2xl flex items-center justify-center flex-shrink-0">
                <BookOpen size={26} className="text-brand-orange" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{program.title}</h2>
                {program.description && (
                  <p className="text-dark-text text-sm leading-relaxed">{program.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {program.tags?.map((tag: string) => (
                <span key={tag} className="text-xs text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="card p-4 text-center">
                <Layers size={18} className="text-brand-orange mx-auto mb-1.5" />
                <p className="text-lg font-bold text-white">{modules.length}</p>
                <p className="text-[11px] text-dark-text">modules</p>
              </div>
              {program.durationDays && (
                <div className="card p-4 text-center">
                  <Clock size={18} className="text-brand-gold mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-white">{program.durationDays}</p>
                  <p className="text-[11px] text-dark-text">jours</p>
                </div>
              )}
            </div>

            {!isEnrolled && (
              <button
                onClick={() => enrollMutation.mutate()}
                disabled={enrollMutation.isPending}
                className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-50"
              >
                {enrollMutation.isPending ? 'Inscription...' : "S'inscrire au programme"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
