'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SubscriptionPlan, PaginatedResult } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, StatusBadge } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { useAuthStore } from '@/stores/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const planSchema = z.object({
  name: z.string().min(1),
  interval: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY']),
  price: z.coerce.number().min(0),
  currency: z.string().default('XOF'),
  durationDays: z.coerce.number().min(1),
  features: z.string().optional(),
});

export default function PlansPage() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PaginatedResult<SubscriptionPlan>>({
    queryKey: ['admin-plans', page],
    queryFn: () => api.get('/dashboard/billing/plans', { page, pageSize: 20 }),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: { currency: 'XOF' },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        features: data.features ? data.features.split(',').map((f: string) => f.trim()).filter(Boolean) : [],
      };
      return editId
        ? api.patch(`/dashboard/billing/plans/${editId}`, payload)
        : api.post('/dashboard/billing/plans', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success(editId ? 'Plan mis à jour' : 'Plan créé');
      setShowCreate(false);
      setEditId(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/dashboard/billing/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success('Plan désactivé');
    },
  });

  const openEdit = (plan: SubscriptionPlan) => {
    setEditId(plan.id);
    setValue('name', plan.name);
    setValue('interval', plan.interval);
    setValue('price', plan.price);
    setValue('currency', plan.currency);
    setValue('durationDays', plan.durationDays);
    setValue('features', plan.features.join(', '));
    setShowCreate(true);
  };

  const columns = [
    { key: 'name', header: 'Nom' },
    { key: 'interval', header: 'Intervalle', render: (item: SubscriptionPlan) => <span className="badge-gray">{item.interval}</span> },
    { key: 'price', header: 'Prix', render: (item: SubscriptionPlan) => `${item.price.toLocaleString()} ${item.currency}` },
    { key: 'durationDays', header: 'Durée', render: (item: SubscriptionPlan) => `${item.durationDays}j` },
    { key: 'isActive', header: 'Statut', render: (item: SubscriptionPlan) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'ARCHIVED'} /> },
    { key: 'subs', header: 'Abonnés', render: (item: SubscriptionPlan) => item._count?.subscriptions || 0 },
  ];

  return (
    <div>
      <PageHeader
        title="Plans d'abonnement"
        description="Gérer les offres d'abonnement"
        action={isAdmin && (
          <button onClick={() => { setEditId(null); reset(); setShowCreate(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouveau plan
          </button>
        )}
      />

      <DataTable
        columns={columns} data={data?.data || []} total={data?.meta.total || 0} page={page} pageSize={20} onPageChange={setPage} loading={isLoading}
        actions={isAdmin ? (item) => (
          <>
            <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded"><Pencil className="w-4 h-4" /></button>
            {item.isActive && <button onClick={() => deleteMutation.mutate(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>}
          </>
        ) : undefined}
      />

      <Modal open={showCreate} onClose={() => { setShowCreate(false); setEditId(null); }} title={editId ? 'Modifier plan' : 'Nouveau plan'}>
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div><label className="label-field">Nom *</label><input {...register('name')} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-field">Intervalle</label><select {...register('interval')} className="input-field"><option value="WEEKLY">Hebdo</option><option value="MONTHLY">Mensuel</option><option value="QUARTERLY">Trimestriel</option></select></div>
            <div><label className="label-field">Durée (jours)</label><input {...register('durationDays')} type="number" className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-field">Prix</label><input {...register('price')} type="number" className="input-field" /></div>
            <div><label className="label-field">Devise</label><input {...register('currency')} className="input-field" /></div>
          </div>
          <div><label className="label-field">Features (séparées par virgule)</label><input {...register('features')} className="input-field" /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setShowCreate(false); setEditId(null); }} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>{editId ? 'Sauvegarder' : 'Créer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
