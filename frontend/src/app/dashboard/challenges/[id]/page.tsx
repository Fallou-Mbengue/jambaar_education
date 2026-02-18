'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import type { Challenge } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/data-table';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState } from 'react';

const daySchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  exercise: z.string().optional(),
  validationRule: z.string().optional(),
});

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const [editingDay, setEditingDay] = useState<number | null>(null);

  const { data: challenge, isLoading } = useQuery<Challenge>({
    queryKey: ['admin-challenges', id],
    queryFn: () => api.get(`/dashboard/challenges/${id}`),
  });

  const updateChallenge = useMutation({
    mutationFn: (data: any) => api.patch(`/dashboard/challenges/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('Challenge mis à jour');
    },
  });

  const updateDay = useMutation({
    mutationFn: ({ dayNumber, data }: { dayNumber: number; data: any }) =>
      api.patch(`/dashboard/challenges/${id}/days/${dayNumber}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges', id] });
      toast.success('Jour mis à jour');
      setEditingDay(null);
    },
  });

  if (isLoading) return <div className="animate-pulse p-6"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;
  if (!challenge) return <div>Challenge non trouvé</div>;

  return (
    <div>
      <PageHeader
        title={challenge.title}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={challenge.status} />
            <span className="text-sm text-gray-500">{challenge._count?.progress || 0} participants</span>
            <Link href="/dashboard/challenges" className="btn-secondary">Retour</Link>
          </div>
        }
      />

      <div className="space-y-4">
        {challenge.days?.map((day) => (
          <div key={day.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Jour {day.dayNumber} : {day.title}</h3>
              {isAdmin && (
                <button
                  onClick={() => setEditingDay(editingDay === day.dayNumber ? null : day.dayNumber)}
                  className="text-sm text-brand-600 hover:underline"
                >
                  {editingDay === day.dayNumber ? 'Fermer' : 'Éditer'}
                </button>
              )}
            </div>

            {editingDay === day.dayNumber ? (
              <DayEditForm
                day={day}
                onSubmit={(data) => updateDay.mutate({ dayNumber: day.dayNumber, data })}
                loading={updateDay.isPending}
              />
            ) : (
              <div className="text-sm text-gray-600 space-y-1">
                {day.content && <p><span className="text-gray-400">Contenu:</span> {day.content}</p>}
                {day.exercise && <p><span className="text-gray-400">Exercice:</span> {day.exercise}</p>}
                {day.validationRule && <p><span className="text-gray-400">Validation:</span> {day.validationRule}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayEditForm({ day, onSubmit, loading }: { day: any; onSubmit: (data: any) => void; loading: boolean }) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(daySchema),
    defaultValues: {
      title: day.title,
      content: day.content || '',
      exercise: day.exercise || '',
      validationRule: day.validationRule || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-3">
      <div>
        <label className="label-field">Titre</label>
        <input {...register('title')} className="input-field" />
      </div>
      <div>
        <label className="label-field">Contenu</label>
        <textarea {...register('content')} className="input-field" rows={3} />
      </div>
      <div>
        <label className="label-field">Exercice</label>
        <textarea {...register('exercise')} className="input-field" rows={2} />
      </div>
      <div>
        <label className="label-field">Règle de validation</label>
        <input {...register('validationRule')} className="input-field" />
      </div>
      <button type="submit" className="btn-primary text-sm" disabled={loading}>
        {loading ? 'Sauvegarde...' : 'Enregistrer'}
      </button>
    </form>
  );
}
