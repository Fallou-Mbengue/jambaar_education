'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { dashboardApi } from '@/lib/api/content.api';
import { ArrowLeft } from 'lucide-react';

const CONTENT_TYPES = ['VIDEO', 'ARTICLE', 'QUIZ', 'MICRO_LEARNING'];

interface ContentForm {
  title: string;
  description: string;
  type: string;
  tags: string;
  durationSeconds: number;
  isPremium: boolean;
}

export default function NewContentPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ContentForm>({
    defaultValues: { type: 'VIDEO', isPremium: false, durationSeconds: 0 },
  });

  const onSubmit = async (data: ContentForm) => {
    setError('');
    try {
      await dashboardApi.createContent({
        ...data,
        tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        durationSeconds: Number(data.durationSeconds),
      });
      router.push('/dashboard/content');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la création.');
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Nouveau contenu</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-white text-sm font-medium mb-1">Titre *</label>
          <input
            {...register('title', { required: true })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-orange/50"
            placeholder="Titre du contenu"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-orange/50 resize-none"
            placeholder="Description du contenu"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-1">Type *</label>
          <select
            {...register('type', { required: true })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-orange/50"
          >
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-1">Tags (séparés par virgule)</label>
          <input
            {...register('tags')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-orange/50"
            placeholder="leadership, communication, productivité"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-1">Durée (secondes)</label>
          <input
            type="number"
            {...register('durationSeconds')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-orange/50"
            placeholder="300"
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
            {isSubmitting ? 'Création...' : 'Créer le contenu'}
          </button>
        </div>
      </form>
    </div>
  );
}
