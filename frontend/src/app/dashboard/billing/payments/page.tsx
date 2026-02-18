'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Payment, PaginatedResult } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, StatusBadge } from '@/components/ui/data-table';
import { ConfirmModal } from '@/components/ui/modal';
import { useAuthStore } from '@/stores/auth';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [reconcileId, setReconcileId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PaginatedResult<Payment>>({
    queryKey: ['admin-payments', page, statusFilter, providerFilter],
    queryFn: () => api.get('/dashboard/billing/payments', { page, pageSize: 20, status: statusFilter, provider: providerFilter }),
  });

  const reconcileMutation = useMutation({
    mutationFn: (id: string) => api.post(`/dashboard/billing/payments/${id}/reconcile`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast.success('Paiement réconcilié');
      setReconcileId(null);
    },
  });

  const columns = [
    { key: 'user', header: 'Utilisateur', render: (item: Payment) => (
      <Link href={`/dashboard/users/${item.user.id}`} className="text-brand-600 hover:underline">{item.user.firstName} {item.user.lastName}</Link>
    )},
    { key: 'amount', header: 'Montant', render: (item: Payment) => `${item.amount.toLocaleString()} ${item.currency}` },
    { key: 'provider', header: 'Provider', render: (item: Payment) => <span className="badge-gray">{item.provider}</span> },
    { key: 'status', header: 'Statut', render: (item: Payment) => <StatusBadge status={item.status} /> },
    { key: 'ref', header: 'Référence', render: (item: Payment) => item.providerReference || '-' },
    { key: 'createdAt', header: 'Date', render: (item: Payment) => new Date(item.createdAt).toLocaleDateString('fr') },
  ];

  return (
    <div>
      <PageHeader title="Paiements" description="Historique des paiements" />

      <DataTable
        columns={columns} data={data?.data || []} total={data?.meta.total || 0} page={page} pageSize={20} onPageChange={setPage} loading={isLoading}
        filters={
          <>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto">
              <option value="">Tous statuts</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success</option>
              <option value="FAIL">Fail</option>
            </select>
            <select value={providerFilter} onChange={(e) => { setProviderFilter(e.target.value); setPage(1); }} className="input-field w-auto">
              <option value="">Tous providers</option>
              <option value="WAVE">Wave</option>
              <option value="ORANGE_MONEY">Orange Money</option>
            </select>
          </>
        }
        actions={isAdmin ? (item) => (
          <>
            {item.status === 'PENDING' && (
              <button onClick={() => setReconcileId(item.id)} className="p-1.5 hover:bg-green-50 rounded text-green-600" title="Réconcilier">
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </>
        ) : undefined}
      />

      <ConfirmModal
        open={!!reconcileId}
        onClose={() => setReconcileId(null)}
        onConfirm={() => reconcileId && reconcileMutation.mutate(reconcileId)}
        title="Réconcilier le paiement"
        message="Marquer ce paiement comme SUCCESS ?"
        confirmLabel="Confirmer"
        loading={reconcileMutation.isPending}
      />
    </div>
  );
}
