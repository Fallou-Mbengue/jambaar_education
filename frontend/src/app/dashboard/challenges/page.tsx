'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Challenge, PaginatedResult } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, StatusBadge, PremiumBadge } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuthStore } from '@/stores/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const challengeSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  isPremium: z.boolean(),
});

export default function ChallengesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery<PaginatedResult<Challenge>>({
    queryKey: ['admin-challenges', page, debouncedSearch],
    queryFn: () => api.get('/dashboard/challenges', { page, pageSize: 20, q: debouncedSearch }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(challengeSchema),
    defaultValues: { isPremium: false },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/dashboard/challenges', data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('Challenge créé avec 7 jours');
      setShowCreate(false);
      reset();
      router.push(`/dashboard/challenges/${result.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/dashboard/challenges/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('Challenge archivé');
    },
  });

  const columns = [
    { key: 'title', header: 'Titre', render: (item: Challenge) => (
      <Link href={`/dashboard/challenges/${item.id}`} className="text-brand-600 hover:underline font-medium">{item.title}</Link>
    )},
    { key: 'status', header: 'Statut', render: (item: Challenge) => <StatusBadge status={item.status} /> },
    { key: 'isPremium', header: 'Type', render: (item: Challenge) => <PremiumBadge isPremium={item.isPremium} /> },
    { key: 'days', header: 'Jours', render: (item: Challenge) => item._count?.days || 0 },
    { key: 'participants', header: 'Participants', render: (item: Challenge) => item._count?.progress || 0 },
    { key: 'createdAt', header: 'Créé le', render: (item: Challenge) => new Date(item.createdAt).toLocaleDateString('fr') },
  ];

  return (
    <div>
      <PageHeader
        title="Challenges 7 jours"
        description="Gérer les challenges hebdomadaires"
        action={isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouveau challenge
          </button>
        )}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.meta.total || 0}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        loading={isLoading}
        actions={isAdmin ? (item) => (
          <>
            <button onClick={() => router.push(`/dashboard/challenges/${item.id}`)} className="p-1.5 hover:bg-gray-100 rounded"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => deleteMutation.mutate(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
          </>
        ) : undefined}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau challenge 7 jours">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label-field">Titre *</label>
            <input {...register('title')} className="input-field" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea {...register('description')} className="input-field" rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <input {...register('isPremium')} type="checkbox" id="cp" className="w-4 h-4" />
            <label htmlFor="cp" className="text-sm">Premium</label>
          </div>
          <p className="text-xs text-gray-400">7 jours seront automatiquement créés.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>Créer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
