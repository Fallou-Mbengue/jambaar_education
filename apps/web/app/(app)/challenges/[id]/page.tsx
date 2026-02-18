'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { challengesApi } from '@/lib/api/content.api';
import { ArrowLeft, CheckCircle, Lock, Flame, Star, Zap, Trophy } from 'lucide-react';
import { useRightPanelStore } from '@/store/rightPanel.store';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import clsx from 'clsx';

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setPanel = useRightPanelStore((s) => s.setContent);

  const [reflection, setReflection] = useState('');
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validatingDay, setValidatingDay] = useState<number | null>(null);

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', id],
    queryFn: async () => {
      const res = await challengesApi.getById(id);
      return res.data.data;
    },
  });

  const joinMutation = useMutation({
    mutationFn: () => challengesApi.join(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenge', id] }),
  });

  const validateMutation = useMutation({
    mutationFn: (data: { dayNumber: number; reflection?: string }) =>
      challengesApi.validateDay(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
      setShowValidateModal(false);
      setReflection('');
      setValidatingDay(null);
    },
  });

  // Push challenge du jour to right panel
  useEffect(() => {
    if (!challenge) return;
    const userProgress = challenge.userProgress;
    const currentDay = userProgress?.currentDay ?? 1;
    const currentDayData = challenge.days?.find((d: any) => d.dayNumber === currentDay);
    if (userProgress?.status === 'IN_PROGRESS' && currentDayData) {
      setPanel({
        challengeId: id,
        challengeDay: {
          dayNumber: currentDay,
          total: challenge.durationDays ?? 7,
          title: currentDayData.title ?? `Mission du jour ${currentDay}`,
          xpReward: currentDayData.xpReward ?? 30,
        },
      });
    } else {
      setPanel({ challengeId: id, challengeDay: null });
    }
  }, [challenge, id, setPanel]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-32 w-full rounded-xl" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!challenge) {
    return (
      <EmptyState
        icon={Zap}
        title="Challenge non trouvé"
        description="Ce challenge n'existe pas ou a été supprimé."
        action={{ label: 'Retour aux challenges', onClick: () => router.push('/challenges') }}
        className="h-full"
      />
    );
  }

  const userProgress = challenge.userProgress;
  const isJoined = !!userProgress;
  const currentDay = userProgress?.currentDay ?? 0;
  const isCompleted = userProgress?.status === 'COMPLETED';
  const days = Array.from({ length: challenge.durationDays ?? 7 }, (_, i) => i + 1);

  const handleValidate = (dayNumber: number) => {
    setValidatingDay(dayNumber);
    setShowValidateModal(true);
  };

  const getDayStatus = (dayNum: number): 'completed' | 'current' | 'locked' => {
    if (!isJoined) return 'locked';
    if (dayNum < currentDay) return 'completed';
    if (dayNum === currentDay) return 'current';
    return 'locked';
  };

  return (
    <div className="pb-24 md:pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-bg/90 backdrop-blur px-4 md:px-6 py-3 flex items-center gap-3 border-b border-dark-border md:border-transparent">
        <button
          onClick={() => router.push('/challenges')}
          className="text-dark-text hover:text-dark-text transition-colors"
          aria-label="Retour aux challenges"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-dark-text font-semibold flex-1 line-clamp-1 text-sm md:text-base">
          {challenge.title}
        </h1>
        {isCompleted && (
          <span className="flex items-center gap-1 text-brand-green text-xs font-semibold">
            <CheckCircle size={14} /> Terminé
          </span>
        )}
        {isJoined && !isCompleted && (
          <span className="flex items-center gap-1 text-brand-orange text-xs font-semibold">
            <Flame size={14} /> J{currentDay}/7
          </span>
        )}
      </div>

      <div className="px-4 md:px-6 pt-4 space-y-5">
        {/* Hero card */}
        <div className="card p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-brand-orange/15 rounded-2xl flex items-center justify-center flex-shrink-0">
              {isCompleted ? (
                <Trophy size={26} className="text-brand-gold" />
              ) : (
                <Zap size={26} className="text-brand-orange" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-dark-text mb-1">{challenge.title}</h2>
              {challenge.description && (
                <p className="text-dark-text text-sm leading-relaxed">{challenge.description}</p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-border">
            <div className="flex items-center gap-1.5 text-xs text-dark-text">
              <Zap size={13} className="text-brand-orange" /> {challenge.durationDays ?? 7} jours
            </div>
            {challenge.badge && (
              <div className="flex items-center gap-1.5 text-xs text-brand-gold">
                <Trophy size={13} /> Badge : {challenge.badge.name}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-brand-gold ml-auto">
              <Star size={13} /> +{(challenge.durationDays ?? 7) * 30 + 200} XP max
            </div>
          </div>

          {/* Progress bar */}
          {isJoined && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-dark-text mb-1">
                <span>Progression</span>
                <span>{isCompleted ? 100 : Math.round(((currentDay - 1) / (challenge.durationDays ?? 7)) * 100)}%</span>
              </div>
              <div className="bg-surface-3 rounded-full h-1.5">
                <div
                  className={clsx('h-1.5 rounded-full xp-bar-fill', isCompleted ? 'bg-brand-green' : 'bg-brand-orange')}
                  style={{
                    width: isCompleted
                      ? '100%'
                      : `${((currentDay - 1) / (challenge.durationDays ?? 7)) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* CTA */}
          {!isJoined && (
            <button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className="w-full mt-4 bg-brand-orange hover:bg-brand-orange-dark text-dark-text rounded-xl py-3 font-semibold transition-colors disabled:opacity-50"
            >
              {joinMutation.isPending ? 'Inscription...' : 'Rejoindre le challenge'}
            </button>
          )}
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-dark-text uppercase tracking-wide mb-3">
            Programme J1–J{challenge.durationDays ?? 7}
          </h3>

          <div className="space-y-2">
            {days.map((dayNum) => {
              const status = getDayStatus(dayNum);
              const dayData = challenge.days?.find((d: any) => d.dayNumber === dayNum);
              const validation = userProgress?.validations?.find((v: any) => v.dayNumber === dayNum);

              return (
                <div key={dayNum} className="flex gap-3">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center pt-3.5">
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border',
                        status === 'completed'
                          ? 'bg-brand-green/15 border-brand-green/40'
                          : status === 'current'
                          ? 'bg-brand-orange/15 border-brand-orange/60'
                          : 'bg-surface-2 border-dark-border',
                      )}
                    >
                      {status === 'completed' ? (
                        <CheckCircle size={15} className="text-brand-green" />
                      ) : status === 'current' ? (
                        <span className="text-brand-orange font-bold text-xs">{dayNum}</span>
                      ) : (
                        <Lock size={13} className="text-dark-text" />
                      )}
                    </div>
                    {dayNum < days.length && (
                      <div
                        className={clsx(
                          'w-px flex-1 min-h-[16px] mt-1',
                          status === 'completed' ? 'bg-brand-green/30' : 'bg-dark-border',
                        )}
                      />
                    )}
                  </div>

                  {/* Day card */}
                  <div
                    className={clsx(
                      'flex-1 card p-3.5 mb-2',
                      status === 'current' && 'border-brand-orange/30 bg-brand-orange/5',
                      status === 'locked' && 'opacity-60',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p
                          className={clsx(
                            'text-sm font-semibold',
                            status === 'current' ? 'text-brand-orange' : 'text-dark-text',
                          )}
                        >
                          Jour {dayNum}{dayData?.title ? ` — ${dayData.title}` : ''}
                        </p>
                        {dayData?.description && (
                          <p className="text-xs text-dark-text mt-1 leading-relaxed">
                            {dayData.description}
                          </p>
                        )}
                        {validation?.reflection && (
                          <p className="text-xs text-brand-orange/70 mt-1.5 italic bg-brand-orange/5 px-2 py-1 rounded-lg border border-brand-orange/10">
                            &ldquo;{validation.reflection}&rdquo;
                          </p>
                        )}
                        {dayData?.xpReward && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star size={10} className="text-brand-gold" />
                            <span className="text-[10px] text-brand-gold font-medium">
                              +{dayData.xpReward} XP
                            </span>
                          </div>
                        )}
                      </div>
                      {status === 'current' && !isCompleted && (
                        <button
                          onClick={() => handleValidate(dayNum)}
                          className="flex-shrink-0 bg-brand-orange hover:bg-brand-orange-dark text-dark-text text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Valider
                        </button>
                      )}
                      {status === 'completed' && (
                        <span className="flex-shrink-0 flex items-center gap-1 text-brand-green text-xs font-medium">
                          <CheckCircle size={13} /> OK
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validation modal */}
      {showValidateModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center md:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="validate-modal-title"
        >
          <div className="bg-surface-1 border border-dark-border w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 shadow-modal">
            <h3 id="validate-modal-title" className="text-dark-text font-bold text-base mb-1">
              Valider — Jour {validatingDay}
            </h3>
            <p className="text-dark-text text-sm mb-4">
              Partagez votre réflexion sur cette journée (optionnel).
            </p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Ce que j'ai appris aujourd'hui..."
              className="w-full bg-surface-2 border border-dark-border rounded-xl p-3 text-dark-text text-sm resize-none focus:outline-none focus:border-brand-orange/50 transition-colors mb-4"
              rows={3}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowValidateModal(false);
                  setReflection('');
                  setValidatingDay(null);
                }}
                className="flex-1 border border-dark-border text-dark-text rounded-xl py-3 text-sm font-medium hover:bg-surface-2 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => validateMutation.mutate({ dayNumber: validatingDay!, reflection: reflection || undefined })}
                disabled={validateMutation.isPending}
                className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-dark-text rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {validateMutation.isPending ? 'Validation...' : 'Confirmer ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
