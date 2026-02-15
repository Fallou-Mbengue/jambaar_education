'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { programsApi } from '@/lib/api/content.api';
import { ArrowLeft, CheckCircle, Lock, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: program, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      const res = await programsApi.getById(id);
      return res.data.data;
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-brand-orange">Chargement...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-dark-text">Programme non trouvé.</p>
      </div>
    );
  }

  const progressPct = program.userProgress?.progressPercent ?? 0;
  const isEnrolled = !!program.userProgress;

  return (
    <div className="min-h-screen bg-dark-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white font-semibold flex-1 line-clamp-1">{program.title}</h1>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {/* Hero card */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">{program.title}</h2>
          <p className="text-dark-text text-sm mb-4">{program.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {program.tags?.map((tag: string) => (
              <span key={tag} className="text-xs text-brand-orange bg-brand-orange/10 px-2 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-dark-text mb-4">
            <span>{program.modules?.length ?? 0} modules</span>
            {program.durationWeeks && <span>{program.durationWeeks} semaines</span>}
          </div>

          {/* Progress */}
          {isEnrolled && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-dark-text mb-1">
                <span>Progression</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-orange rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Enroll button */}
          {!isEnrolled && (
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="w-full bg-brand-orange text-white rounded-xl py-3 font-medium disabled:opacity-50"
            >
              {enrollMutation.isPending ? 'Inscription...' : "S'inscrire au programme"}
            </button>
          )}
        </div>

        {/* Modules list */}
        <div>
          <h3 className="text-white font-semibold mb-3">Modules</h3>
          <div className="space-y-3">
            {program.modules?.map((mod: any, idx: number) => {
              const isCompleted = mod.userCompleted;
              const isPremium = mod.isPremium && !program.userHasPremium;
              const isUnlocked = isEnrolled && (idx === 0 || program.modules[idx - 1]?.userCompleted);

              return (
                <div
                  key={mod.id}
                  className={`glass rounded-xl p-4 flex items-center gap-4 ${
                    isUnlocked && !isPremium ? 'hover:border-brand-orange/30 transition-all' : 'opacity-60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-orange/10">
                    {isCompleted ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : isPremium || !isUnlocked ? (
                      <Lock size={20} className="text-dark-text" />
                    ) : (
                      <PlayCircle size={20} className="text-brand-orange" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1">{mod.title}</p>
                    <p className="text-dark-text text-xs mt-0.5">
                      Module {idx + 1}
                      {mod.content && ` • ${Math.ceil((mod.content.durationSeconds ?? 0) / 60)} min`}
                    </p>
                  </div>
                  {isUnlocked && !isPremium && mod.contentId && (
                    <Link href={`/content/${mod.contentId}`}>
                      <button
                        onClick={() => {
                          if (!isCompleted) {
                            progressMutation.mutate({ moduleId: mod.id, completed: false });
                          }
                        }}
                        className="text-brand-orange text-xs font-medium"
                      >
                        {isCompleted ? 'Revoir' : 'Commencer'}
                      </button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
