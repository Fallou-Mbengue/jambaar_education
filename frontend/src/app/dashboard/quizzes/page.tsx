'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Quiz, PaginatedResult } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, StatusBadge } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuthStore } from '@/stores/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const quizSchema = z.object({ title: z.string().min(1, 'Titre requis') });

export default function QuizzesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery<PaginatedResult<Quiz>>({
    queryKey: ['admin-quizzes', page, debouncedSearch],
    queryFn: () => api.get('/dashboard/quizzes', { page, pageSize: 20, q: debouncedSearch }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(quizSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/dashboard/quizzes', data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      toast.success('Quiz créé');
      setShowCreate(false);
      reset();
      router.push(`/dashboard/quizzes/${result.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/dashboard/quizzes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      toast.success('Quiz archivé');
    },
  });

  const columns = [
    { key: 'title', header: 'Titre', render: (item: Quiz) => (
      <Link href={`/dashboard/quizzes/${item.id}`} className="text-brand-600 hover:underline font-medium">{item.title}</Link>
    )},
    { key: 'status', header: 'Statut', render: (item: Quiz) => <StatusBadge status={item.status} /> },
    { key: 'questions', header: 'Questions', render: (item: Quiz) => item._count?.questions || 0 },
    { key: 'attempts', header: 'Tentatives', render: (item: Quiz) => item._count?.attempts || 0 },
    { key: 'linked', header: 'Lié à', render: (item: Quiz) => item.content?.title || item.module?.title || '-' },
    { key: 'createdAt', header: 'Créé le', render: (item: Quiz) => new Date(item.createdAt).toLocaleDateString('fr') },
  ];

  return (
    <div>
      <PageHeader
        title="Quizzes"
        description="Gérer les quiz et questions"
        action={isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Nouveau quiz</button>
        )}
      />

      <DataTable columns={columns} data={data?.data || []} total={data?.meta.total || 0} page={page} pageSize={20} onPageChange={setPage} searchValue={search} onSearchChange={setSearch} loading={isLoading}
        actions={isAdmin ? (item) => (
          <>
            <button onClick={() => router.push(`/dashboard/quizzes/${item.id}`)} className="p-1.5 hover:bg-gray-100 rounded"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => deleteMutation.mutate(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
          </>
        ) : undefined}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau quiz">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label-field">Titre *</label>
            <input {...register('title')} className="input-field" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>Créer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
