'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Notification, PaginatedResult } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const notifSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  body: z.string().min(1, 'Message requis'),
  deepLink: z.string().optional(),
  segment: z.enum(['ALL', 'PREMIUM', 'NON_PREMIUM', 'CHALLENGE_PARTICIPANTS', 'CUSTOM']),
  challengeId: z.string().optional(),
  userIds: z.string().optional(),
});

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery<PaginatedResult<Notification>>({
    queryKey: ['admin-notifications', page],
    queryFn: () => api.get('/dashboard/notifications', { page, pageSize: 20 }),
  });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(notifSchema),
    defaultValues: { segment: 'ALL' as const },
  });

  const segment = watch('segment');

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        userIds: data.userIds ? data.userIds.split(',').map((id: string) => id.trim()).filter(Boolean) : undefined,
      };
      return api.post('/dashboard/notifications', payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success(`Notification envoyée à ${result.targetCount} utilisateurs`);
      setShowCreate(false);
      reset();
    },
  });

  const columns = [
    { key: 'title', header: 'Titre' },
    { key: 'segment', header: 'Segment', render: (item: Notification) => <span className="badge-gray">{item.segment}</span> },
    { key: 'targets', header: 'Destinataires', render: (item: Notification) => item._count?.targets || 0 },
    { key: 'deepLink', header: 'Deep Link', render: (item: Notification) => item.deepLink || '-' },
    { key: 'createdAt', header: 'Envoyée le', render: (item: Notification) => new Date(item.createdAt).toLocaleDateString('fr') },
  ];

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Envoyer des notifications in-app"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvelle notification
          </button>
        }
      />

      <DataTable columns={columns} data={data?.data || []} total={data?.meta.total || 0} page={page} pageSize={20} onPageChange={setPage} loading={isLoading} />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Envoyer notification">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label-field">Titre *</label>
            <input {...register('title')} className="input-field" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label-field">Message *</label>
            <textarea {...register('body')} className="input-field" rows={3} />
            {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body.message}</p>}
          </div>
          <div>
            <label className="label-field">Deep Link</label>
            <input {...register('deepLink')} className="input-field" placeholder="/challenges/abc123" />
          </div>
          <div>
            <label className="label-field">Segment</label>
            <select {...register('segment')} className="input-field">
              <option value="ALL">Tous les utilisateurs</option>
              <option value="PREMIUM">Premium uniquement</option>
              <option value="NON_PREMIUM">Non-premium</option>
              <option value="CHALLENGE_PARTICIPANTS">Participants challenge</option>
              <option value="CUSTOM">Liste personnalisée</option>
            </select>
          </div>
          {segment === 'CHALLENGE_PARTICIPANTS' && (
            <div>
              <label className="label-field">Challenge ID</label>
              <input {...register('challengeId')} className="input-field" />
            </div>
          )}
          {segment === 'CUSTOM' && (
            <div>
              <label className="label-field">User IDs (séparés par virgule)</label>
              <textarea {...register('userIds')} className="input-field" rows={2} />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary flex items-center gap-1" disabled={createMutation.isPending}>
              <Send className="w-4 h-4" /> {createMutation.isPending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
