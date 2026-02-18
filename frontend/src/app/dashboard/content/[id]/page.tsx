'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import type { Content } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge, PremiumBadge } from '@/components/ui/data-table';
import { useAuthStore } from '@/stores/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

const contentSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  tags: z.string().optional(),
  skills: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  duration: z.coerce.number().min(0).optional(),
  isPremium: z.boolean(),
  coverKey: z.string().optional(),
  videoKey: z.string().optional(),
});

type ContentForm = z.infer<typeof contentSchema>;

export default function ContentEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');

  const { data: content, isLoading } = useQuery<Content & { _count: any }>({
    queryKey: ['admin-content', id],
    queryFn: () => api.get(`/dashboard/content/${id}`),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    values: content ? {
      title: content.title,
      description: content.description || '',
      tags: content.tags.join(', '),
      skills: content.skills.join(', '),
      level: content.level,
      duration: content.duration || 0,
      isPremium: content.isPremium,
      coverKey: content.coverKey || '',
      videoKey: content.videoKey || '',
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ContentForm) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      return api.patch(`/dashboard/content/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      toast.success('Contenu mis à jour');
    },
  });

  const actionMutation = useMutation({
    mutationFn: (action: string) => api.post(`/dashboard/content/${id}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      toast.success('Action effectuée');
    },
  });

  if (isLoading) return <div className="animate-pulse p-6"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;
  if (!content) return <div className="p-6">Contenu non trouvé</div>;

  return (
    <div>
      <PageHeader
        title={`Éditer : ${content.title}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={content.status} />
            <PremiumBadge isPremium={content.isPremium} />
            <Link href="/dashboard/content" className="btn-secondary">Retour</Link>
          </div>
        }
      />

      {isAdmin && (
        <div className="flex gap-2 mb-6">
          {content.status === 'DRAFT' && (
            <button onClick={() => actionMutation.mutate('publish')} className="btn-primary text-sm">Publier</button>
          )}
          {content.status === 'PUBLISHED' && (
            <button onClick={() => actionMutation.mutate('archive')} className="btn-secondary text-sm">Archiver</button>
          )}
          {content.status === 'ARCHIVED' && (
            <button onClick={() => actionMutation.mutate('unarchive')} className="btn-secondary text-sm">Désarchiver</button>
          )}
          <button onClick={() => actionMutation.mutate('duplicate')} className="btn-secondary text-sm">Dupliquer</button>
        </div>
      )}

      <div className="card p-6 max-w-2xl">
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="label-field">Titre *</label>
            <input {...register('title')} className="input-field" disabled={!isAdmin} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label-field">Description</label>
            <textarea {...register('description')} className="input-field" rows={3} disabled={!isAdmin} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Niveau</label>
              <select {...register('level')} className="input-field" disabled={!isAdmin}>
                <option value="BEGINNER">Débutant</option>
                <option value="INTERMEDIATE">Intermédiaire</option>
                <option value="ADVANCED">Avancé</option>
              </select>
            </div>
            <div>
              <label className="label-field">Durée (minutes)</label>
              <input {...register('duration')} type="number" className="input-field" disabled={!isAdmin} />
            </div>
          </div>

          <div>
            <label className="label-field">Tags</label>
            <input {...register('tags')} className="input-field" disabled={!isAdmin} />
          </div>

          <div>
            <label className="label-field">Skills</label>
            <input {...register('skills')} className="input-field" disabled={!isAdmin} />
          </div>

          <div>
            <label className="label-field">Cover Key</label>
            <input {...register('coverKey')} className="input-field" disabled={!isAdmin} />
          </div>

          <div>
            <label className="label-field">Video Key</label>
            <input {...register('videoKey')} className="input-field" disabled={!isAdmin} />
          </div>

          <div className="flex items-center gap-2">
            <input {...register('isPremium')} type="checkbox" id="isPremium" className="w-4 h-4" disabled={!isAdmin} />
            <label htmlFor="isPremium" className="text-sm">Contenu Premium</label>
          </div>

          {isAdmin && (
            <div className="pt-4">
              <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Mise à jour...' : 'Enregistrer'}
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="card p-4 mt-4 max-w-2xl">
        <h3 className="font-medium mb-2">Statistiques</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Likes:</span> {content._count?.likes || 0}</div>
          <div><span className="text-gray-500">Saves:</span> {content._count?.saves || 0}</div>
          <div><span className="text-gray-500">Partages:</span> {content._count?.shares || 0}</div>
        </div>
      </div>
    </div>
  );
}
