'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Content, PaginatedResult, ContentStatus } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, StatusBadge, PremiumBadge } from '@/components/ui/data-table';
import { ConfirmModal } from '@/components/ui/modal';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuthStore } from '@/stores/auth';
import { Plus, Pencil, Archive, Send, Copy, ArchiveRestore } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContentListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const debouncedSearch = useDebounce(search);

  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string } | null>(null);

  const { data, isLoading } = useQuery<PaginatedResult<Content>>({
    queryKey: ['admin-content', page, debouncedSearch, statusFilter],
    queryFn: () => api.get('/dashboard/content', { page, pageSize: 20, q: debouncedSearch, status: statusFilter }),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => {
      if (action === 'duplicate') return api.post(`/dashboard/content/${id}/duplicate`);
      return api.post(`/dashboard/content/${id}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      toast.success('Action effectuée');
      setConfirmAction(null);
    },
  });

  const columns = [
    { key: 'title', header: 'Titre', render: (item: Content) => (
      <Link href={`/dashboard/content/${item.id}`} className="text-brand-600 hover:underline font-medium">
        {item.title}
      </Link>
    )},
    { key: 'status', header: 'Statut', render: (item: Content) => <StatusBadge status={item.status} /> },
    { key: 'level', header: 'Niveau', render: (item: Content) => <span className="badge-gray">{item.level}</span> },
    { key: 'isPremium', header: 'Type', render: (item: Content) => <PremiumBadge isPremium={item.isPremium} /> },
    { key: 'duration', header: 'Durée', render: (item: Content) => item.duration ? `${item.duration} min` : '-' },
    { key: 'createdAt', header: 'Créé le', render: (item: Content) => new Date(item.createdAt).toLocaleDateString('fr') },
  ];

  return (
    <div>
      <PageHeader
        title="Contenus"
        description="Gérer les micro-contenus du feed"
        action={isAdmin && (
          <Link href="/dashboard/content/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouveau contenu
          </Link>
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
        searchPlaceholder="Rechercher un contenu..."
        loading={isLoading}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field w-auto"
          >
            <option value="">Tous les statuts</option>
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        }
        actions={isAdmin ? (item) => (
          <>
            <button onClick={() => router.push(`/dashboard/content/${item.id}`)} className="p-1.5 hover:bg-gray-100 rounded" title="Éditer">
              <Pencil className="w-4 h-4" />
            </button>
            {item.status === 'DRAFT' && (
              <button onClick={() => setConfirmAction({ id: item.id, action: 'publish' })} className="p-1.5 hover:bg-green-50 rounded text-green-600" title="Publier">
                <Send className="w-4 h-4" />
              </button>
            )}
            {item.status === 'PUBLISHED' && (
              <button onClick={() => setConfirmAction({ id: item.id, action: 'archive' })} className="p-1.5 hover:bg-yellow-50 rounded text-yellow-600" title="Archiver">
                <Archive className="w-4 h-4" />
              </button>
            )}
            {item.status === 'ARCHIVED' && (
              <button onClick={() => setConfirmAction({ id: item.id, action: 'unarchive' })} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Désarchiver">
                <ArchiveRestore className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => setConfirmAction({ id: item.id, action: 'duplicate' })} className="p-1.5 hover:bg-gray-100 rounded" title="Dupliquer">
              <Copy className="w-4 h-4" />
            </button>
          </>
        ) : undefined}
      />

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && actionMutation.mutate(confirmAction)}
        title={`Confirmer ${confirmAction?.action}`}
        message={`Êtes-vous sûr de vouloir ${confirmAction?.action} ce contenu ?`}
        confirmLabel="Confirmer"
        loading={actionMutation.isPending}
      />
    </div>
  );
}
