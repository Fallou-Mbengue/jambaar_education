'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/content.api';
import { ArrowLeft } from 'lucide-react';

const CONTENT_TYPES = ['VIDEO', 'ARTICLE', 'QUIZ', 'MICRO_LEARNING'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

interface ContentForm {
  title: string;
  description: string;
  type: string;
  status: string;
  tags: string;
  durationSeconds: number;
  isPremium: boolean;
}

export default function EditContentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState('');

  const { data: content, isLoading } = useQuery({
    queryKey: ['dashboard-content', id],
    queryFn: async () => {
      const res = await dashboardApi.getContent({ status: undefined });
      const all = res.data.data as any[];
      return all.find((c) => c.id === id);
    },
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ContentForm>();

  useEffect(() => {
    if (content) {
      reset({
        title: content.title,
        description: content.description ?? '',
        type: content.type,
        status: content.status,
        tags: content.tags?.join(', ') ?? '',
        durationSeconds: content.durationSeconds ?? 0,
        isPremium: content.isPremium ?? false,
      });
    }
  }, [content, reset]);

  const onSubmit = async (data: ContentForm) => {
    setError('');
    try {
      await dashboardApi.updateContent(id, {
        ...data,
        tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        durationSeconds: Number(data.durationSeconds),
      });
      router.push('/dashboard/content');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la mise à jour.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-brand-orange">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Modifier le contenu</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-white text-sm font-medium mb-1">Titre *</label>
          <input
            {...register('title', { required: true })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-orange/50"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-orange/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-1">Type</label>
            <select
              {...register('type')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-orange/50"
            >
              {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-1">Statut</label>
            <select
              {...register('status')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-orange/50"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-1">Tags (séparés par virgule)</label>
          <input
            {...register('tags')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-orange/50"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-1">Durée (secondes)</label>
          <input
            type="number"
            {...register('durationSeconds')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-orange/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register('isPremium')}
            id="isPremium"
            className="w-4 h-4 accent-orange-500"
          />
          <label htmlFor="isPremium" className="text-white text-sm">Contenu Premium</label>
        </div>

        {error && (
          <div className="glass border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-white/10 text-white rounded-xl py-3"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-brand-orange text-white rounded-xl py-3 font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
}
