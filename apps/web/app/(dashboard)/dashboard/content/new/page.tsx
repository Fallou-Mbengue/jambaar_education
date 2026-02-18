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
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-700 hover:text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Nouveau contenu</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Titre *</label>
          <input
            {...register('title', { required: true })}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
            placeholder="Titre du contenu"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 resize-none"
            placeholder="Description du contenu"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Type *</label>
          <select
            {...register('type', { required: true })}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
          >
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Tags (séparés par virgule)</label>
          <input
            {...register('tags')}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
            placeholder="leadership, communication, productivité"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Durée (secondes)</label>
          <input
            type="number"
            {...register('durationSeconds')}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
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
          <label htmlFor="isPremium" className="text-gray-700 text-sm font-medium">Contenu Premium</label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-white border border-gray-300 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-xl py-3 font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'Création...' : 'Créer le contenu'}
          </button>
        </div>
      </form>
    </div>
  );
}
