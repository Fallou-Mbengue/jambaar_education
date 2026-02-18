'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Program, PaginatedResult } from '@/lib/types';
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

const programSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  isPremium: z.boolean(),
});
type ProgramForm = z.infer<typeof programSchema>;

export default function ProgramsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery<PaginatedResult<Program>>({
    queryKey: ['admin-programs', page, debouncedSearch],
    queryFn: () => api.get('/dashboard/programs', { page, pageSize: 20, q: debouncedSearch }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProgramForm>({
    resolver: zodResolver(programSchema),
    defaultValues: { isPremium: false },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProgramForm) => api.post('/dashboard/programs', data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-programs'] });
      toast.success('Programme créé');
      setShowCreate(false);
      reset();
      router.push(`/dashboard/programs/${result.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/dashboard/programs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-programs'] });
      toast.success('Programme archivé');
    },
  });

  const columns = [
    { key: 'title', header: 'Titre', render: (item: Program) => (
      <Link href={`/dashboard/programs/${item.id}`} className="text-brand-600 hover:underline font-medium">{item.title}</Link>
    )},
    { key: 'status', header: 'Statut', render: (item: Program) => <StatusBadge status={item.status} /> },
    { key: 'isPremium', header: 'Type', render: (item: Program) => <PremiumBadge isPremium={item.isPremium} /> },
    { key: 'modules', header: 'Modules', render: (item: Program) => item._count?.modules || 0 },
    { key: 'createdAt', header: 'Créé le', render: (item: Program) => new Date(item.createdAt).toLocaleDateString('fr') },
  ];

  return (
    <div>
      <PageHeader
        title="Programmes"
        description="Gérer les parcours d'apprentissage"
        action={isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouveau programme
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
            <button onClick={() => router.push(`/dashboard/programs/${item.id}`)} className="p-1.5 hover:bg-gray-100 rounded" title="Éditer">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => deleteMutation.mutate(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Archiver">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : undefined}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau programme">
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
            <input {...register('isPremium')} type="checkbox" id="pm" className="w-4 h-4" />
            <label htmlFor="pm" className="text-sm">Premium</label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
