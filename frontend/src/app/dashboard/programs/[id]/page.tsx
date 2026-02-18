'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import type { Program } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/data-table';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { GripVertical } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isPremium: z.boolean(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');

  const { data: program, isLoading } = useQuery<Program>({
    queryKey: ['admin-programs', id],
    queryFn: () => api.get(`/dashboard/programs/${id}`),
  });

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    values: program ? {
      title: program.title,
      description: program.description || '',
      isPremium: program.isPremium,
      status: program.status,
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/dashboard/programs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-programs'] });
      toast.success('Programme mis à jour');
    },
  });

  if (isLoading) return <div className="animate-pulse p-6"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;
  if (!program) return <div>Programme non trouvé</div>;

  return (
    <div>
      <PageHeader
        title={program.title}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={program.status} />
            <Link href="/dashboard/programs" className="btn-secondary">Retour</Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-medium mb-4">Détails du programme</h3>
          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label-field">Titre</label>
              <input {...register('title')} className="input-field" disabled={!isAdmin} />
            </div>
            <div>
              <label className="label-field">Description</label>
              <textarea {...register('description')} className="input-field" rows={3} disabled={!isAdmin} />
            </div>
            <div>
              <label className="label-field">Statut</label>
              <select {...register('status')} className="input-field" disabled={!isAdmin}>
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input {...register('isPremium')} type="checkbox" id="pm" className="w-4 h-4" disabled={!isAdmin} />
              <label htmlFor="pm" className="text-sm">Premium</label>
            </div>
            {isAdmin && (
              <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            )}
          </form>
        </div>

        <div className="card p-6">
          <h3 className="font-medium mb-4">Modules ({program.modules?.length || 0})</h3>
          {program.modules && program.modules.length > 0 ? (
            <ul className="space-y-2">
              {program.modules.map((pm, idx) => (
                <li key={pm.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500 w-6">{idx + 1}.</span>
                  <span className="text-sm">{pm.module.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Aucun module attaché</p>
          )}
        </div>
      </div>
    </div>
  );
}
