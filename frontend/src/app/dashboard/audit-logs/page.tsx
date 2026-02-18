'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AuditLog, PaginatedResult } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const { data, isLoading } = useQuery<PaginatedResult<AuditLog>>({
    queryKey: ['admin-audit-logs', page, actionFilter, entityFilter],
    queryFn: () => api.get('/dashboard/audit-logs', { page, pageSize: 20, action: actionFilter, entityType: entityFilter }),
  });

  const columns = [
    { key: 'actor', header: 'Acteur', render: (item: AuditLog) => `${item.actor.firstName} ${item.actor.lastName}` },
    { key: 'action', header: 'Action', render: (item: AuditLog) => <span className="badge-blue">{item.action}</span> },
    { key: 'entityType', header: 'Entité', render: (item: AuditLog) => <span className="badge-gray">{item.entityType}</span> },
    { key: 'entityId', header: 'ID', render: (item: AuditLog) => (
      <span className="text-xs font-mono text-gray-500">{item.entityId ? item.entityId.slice(0, 8) + '...' : '-'}</span>
    )},
    { key: 'reason', header: 'Raison', render: (item: AuditLog) => item.reason || '-' },
    { key: 'ip', header: 'IP', render: (item: AuditLog) => <span className="text-xs text-gray-400">{item.ip || '-'}</span> },
    { key: 'createdAt', header: 'Date', render: (item: AuditLog) => new Date(item.createdAt).toLocaleString('fr') },
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" description="Journal de toutes les actions admin" />

      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.meta.total || 0}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        loading={isLoading}
        filters={
          <>
            <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="input-field w-auto">
              <option value="">Toutes les actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="PUBLISH">Publish</option>
              <option value="ARCHIVE">Archive</option>
              <option value="SOFT_DELETE">Soft Delete</option>
              <option value="CHANGE_ROLE">Change Role</option>
              <option value="SUSPEND_USER">Suspend User</option>
              <option value="UNSUSPEND_USER">Unsuspend User</option>
              <option value="ADJUST_GAMIFICATION">Adjust Gamification</option>
              <option value="GRANT_PREMIUM">Grant Premium</option>
              <option value="REVOKE_PREMIUM">Revoke Premium</option>
              <option value="CANCEL_SUBSCRIPTION">Cancel Subscription</option>
              <option value="EXTEND_SUBSCRIPTION">Extend Subscription</option>
              <option value="SEND_NOTIFICATION">Send Notification</option>
            </select>
            <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }} className="input-field w-auto">
              <option value="">Toutes les entités</option>
              <option value="Content">Content</option>
              <option value="Program">Program</option>
              <option value="Challenge">Challenge</option>
              <option value="Quiz">Quiz</option>
              <option value="User">User</option>
              <option value="SubscriptionPlan">SubscriptionPlan</option>
              <option value="Subscription">Subscription</option>
              <option value="Payment">Payment</option>
              <option value="Notification">Notification</option>
            </select>
          </>
        }
      />
    </div>
  );
}
