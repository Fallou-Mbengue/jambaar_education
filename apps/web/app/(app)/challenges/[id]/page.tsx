'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { challengesApi } from '@/lib/api/content.api';
import { ArrowLeft, CheckCircle, Lock, Flame } from 'lucide-react';

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-brand-orange">Chargement...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-dark-text">Challenge non trouvé.</p>
      </div>
    );
  }

  const userProgress = challenge.userProgress;
  const isJoined = !!userProgress;
  const currentDay = userProgress?.currentDay ?? 0;
  const isCompleted = userProgress?.status === 'COMPLETED';
  const days = Array.from({ length: 7 }, (_, i) => i + 1);

  const handleValidate = (dayNumber: number) => {
    setValidatingDay(dayNumber);
    setShowValidateModal(true);
  };

  const getDayStatus = (dayNum: number) => {
    if (!isJoined) return 'locked';
    if (dayNum < currentDay) return 'completed';
    if (dayNum === currentDay) return 'current';
    return 'locked';
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white font-semibold flex-1 line-clamp-1">{challenge.title}</h1>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {/* Hero */}
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h2 className="text-xl font-bold text-white mb-2">{challenge.title}</h2>
          <p className="text-dark-text text-sm mb-4">{challenge.description}</p>

          {isCompleted && (
            <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
              <CheckCircle size={20} />
              <span className="font-medium">Challenge terminé!</span>
            </div>
          )}

          {isJoined && !isCompleted && (
            <div className="flex items-center justify-center gap-2 text-brand-orange mb-4">
              <Flame size={20} />
              <span className="font-medium">Jour {currentDay} / 7</span>
            </div>
          )}

          {!isJoined && (
            <button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className="w-full bg-brand-orange text-white rounded-xl py-3 font-medium disabled:opacity-50"
            >
              {joinMutation.isPending ? 'Inscription...' : 'Rejoindre le challenge'}
            </button>
          )}
        </div>

        {/* 7-Day Timeline */}
        <div>
          <h3 className="text-white font-semibold mb-4">Timeline J1–J7</h3>
          <div className="space-y-3">
            {days.map((dayNum) => {
              const status = getDayStatus(dayNum);
              const dayData = challenge.days?.find((d: any) => d.dayNumber === dayNum);
              const validation = userProgress?.validations?.find((v: any) => v.dayNumber === dayNum);

              return (
                <div key={dayNum} className="flex gap-4 items-start">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      status === 'completed'
                        ? 'bg-green-500/20 border border-green-500'
                        : status === 'current'
                        ? 'bg-brand-orange/20 border border-brand-orange'
                        : 'bg-white/5 border border-white/10'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : status === 'current' ? (
                        <span className="text-brand-orange font-bold text-sm">{dayNum}</span>
                      ) : (
                        <Lock size={16} className="text-dark-text" />
                      )}
                    </div>
                    {dayNum < 7 && (
                      <div className={`w-0.5 h-6 mt-1 ${
                        status === 'completed' ? 'bg-green-500/40' : 'bg-white/10'
                      }`} />
                    )}
                  </div>

                  {/* Day content */}
                  <div className={`flex-1 glass rounded-xl p-4 mb-2 ${
                    status === 'current' ? 'border-brand-orange/30' : ''
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">
                          Jour {dayNum}: {dayData?.title ?? `Mission du jour ${dayNum}`}
                        </p>
                        {dayData?.description && (
                          <p className="text-dark-text text-xs mt-1">{dayData.description}</p>
                        )}
                        {validation?.reflection && (
                          <p className="text-brand-orange/70 text-xs mt-1 italic">
                            &quot;{validation.reflection}&quot;
                          </p>
                        )}
                      </div>
                      {status === 'current' && !isCompleted && (
                        <button
                          onClick={() => handleValidate(dayNum)}
                          className="text-xs bg-brand-orange text-white px-3 py-1.5 rounded-lg ml-2 flex-shrink-0"
                        >
                          Valider
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      {showValidateModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
          <div className="bg-dark-surface w-full rounded-t-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-2">
              Valider Jour {validatingDay}
            </h3>
            <p className="text-dark-text text-sm mb-4">
              Partagez votre réflexion sur cette journée (optionnel).
            </p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Ce que j'ai appris aujourd'hui..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm resize-none outline-none focus:border-brand-orange/50 mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowValidateModal(false);
                  setReflection('');
                  setValidatingDay(null);
                }}
                className="flex-1 border border-white/10 text-white rounded-xl py-3"
              >
                Annuler
              </button>
              <button
                onClick={() =>
                  validateMutation.mutate({
                    dayNumber: validatingDay!,
                    reflection: reflection || undefined,
                  })
                }
                disabled={validateMutation.isPending}
                className="flex-1 bg-brand-orange text-white rounded-xl py-3 font-medium disabled:opacity-50"
              >
                {validateMutation.isPending ? 'Validation...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
