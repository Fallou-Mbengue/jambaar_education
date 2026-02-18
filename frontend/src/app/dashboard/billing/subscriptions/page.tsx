'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Subscription, PaginatedResult } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, StatusBadge } from '@/components/ui/data-table';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { useAuthStore } from '@/stores/auth';
import { XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [extendId, setExtendId] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState(7);

  const { data, isLoading } = useQuery<PaginatedResult<Subscription>>({
    queryKey: ['admin-subscriptions', page, statusFilter],
    queryFn: () => api.get('/dashboard/billing/subscriptions', { page, pageSize: 20, status: statusFilter }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/dashboard/billing/subscriptions/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Abonnement annulé');
      setCancelId(null);
    },
  });

  const extendMutation = useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) => api.patch(`/dashboard/billing/subscriptions/${id}/extend`, { days }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Abonnement prolongé');
      setExtendId(null);
    },
  });

  const columns = [
    { key: 'user', header: 'Utilisateur', render: (item: Subscription) => (
      <Link href={`/dashboard/users/${item.user.id}`} className="text-brand-600 hover:underline">{item.user.firstName} {item.user.lastName}</Link>
    )},
    { key: 'plan', header: 'Plan', render: (item: Subscription) => `${item.plan.name} (${item.plan.price.toLocaleString()} XOF)` },
    { key: 'status', header: 'Statut', render: (item: Subscription) => <StatusBadge status={item.status} /> },
    { key: 'startDate', header: 'Début', render: (item: Subscription) => new Date(item.startDate).toLocaleDateString('fr') },
    { key: 'endDate', header: 'Fin', render: (item: Subscription) => new Date(item.endDate).toLocaleDateString('fr') },
  ];

  return (
    <div>
      <PageHeader title="Abonnements" description="Gérer les abonnements utilisateurs" />

      <DataTable
        columns={columns} data={data?.data || []} total={data?.meta.total || 0} page={page} pageSize={20} onPageChange={setPage} loading={isLoading}
        filters={
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">Tous</option>
            <option value="ACTIVE">Actif</option>
            <option value="EXPIRED">Expiré</option>
            <option value="CANCELED">Annulé</option>
            <option value="PAST_DUE">Past Due</option>
          </select>
        }
        actions={isAdmin ? (item) => (
          <>
            {item.status === 'ACTIVE' && (
              <>
                <button onClick={() => setExtendId(item.id)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Prolonger">
                  <Clock className="w-4 h-4" />
                </button>
                <button onClick={() => setCancelId(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Annuler">
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </>
        ) : undefined}
      />

      <ConfirmModal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={() => cancelId && cancelMutation.mutate(cancelId)}
        title="Annuler l'abonnement"
        message="L'utilisateur perdra l'accès premium. Confirmer ?"
        confirmLabel="Annuler l'abonnement"
        variant="danger"
        loading={cancelMutation.isPending}
      />

      <Modal open={!!extendId} onClose={() => setExtendId(null)} title="Prolonger l'abonnement">
        <div className="space-y-4">
          <div>
            <label className="label-field">Jours à ajouter</label>
            <input type="number" value={extendDays} onChange={(e) => setExtendDays(Number(e.target.value))} className="input-field" min={1} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setExtendId(null)} className="btn-secondary">Annuler</button>
            <button onClick={() => extendId && extendMutation.mutate({ id: extendId, days: extendDays })} className="btn-primary" disabled={extendMutation.isPending}>
              Prolonger
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
