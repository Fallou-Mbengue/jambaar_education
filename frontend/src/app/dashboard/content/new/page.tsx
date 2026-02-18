'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
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

export default function NewContentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    defaultValues: { level: 'BEGINNER', isPremium: false },
  });

  const mutation = useMutation({
    mutationFn: (data: ContentForm) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      return api.post('/dashboard/content', payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      toast.success('Contenu créé');
      router.push(`/dashboard/content/${result.id}`);
    },
  });

  return (
    <div>
      <PageHeader
        title="Nouveau contenu"
        action={<Link href="/dashboard/content" className="btn-secondary">Retour</Link>}
      />

      <div className="card p-6 max-w-2xl">
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <label className="label-field">Titre *</label>
            <input {...register('title')} className="input-field" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label-field">Description</label>
            <textarea {...register('description')} className="input-field" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Niveau</label>
              <select {...register('level')} className="input-field">
                <option value="BEGINNER">Débutant</option>
                <option value="INTERMEDIATE">Intermédiaire</option>
                <option value="ADVANCED">Avancé</option>
              </select>
            </div>
            <div>
              <label className="label-field">Durée (minutes)</label>
              <input {...register('duration')} type="number" className="input-field" />
            </div>
          </div>

          <div>
            <label className="label-field">Tags (séparés par virgule)</label>
            <input {...register('tags')} className="input-field" placeholder="javascript, react, web" />
          </div>

          <div>
            <label className="label-field">Skills (séparés par virgule)</label>
            <input {...register('skills')} className="input-field" placeholder="js-basics, react-hooks" />
          </div>

          <div>
            <label className="label-field">Cover Key (MinIO)</label>
            <input {...register('coverKey')} className="input-field" placeholder="covers/image.jpg" />
          </div>

          <div>
            <label className="label-field">Video Key (MinIO)</label>
            <input {...register('videoKey')} className="input-field" placeholder="videos/video.mp4" />
          </div>

          <div className="flex items-center gap-2">
            <input {...register('isPremium')} type="checkbox" id="isPremium" className="w-4 h-4" />
            <label htmlFor="isPremium" className="text-sm">Contenu Premium</label>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Création...' : 'Créer le contenu'}
            </button>
            <Link href="/dashboard/content" className="btn-secondary">Annuler</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
