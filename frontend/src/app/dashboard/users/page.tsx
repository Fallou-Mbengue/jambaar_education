'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { User, PaginatedResult } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, StatusBadge, PremiumBadge } from '@/components/ui/data-table';
import { useDebounce } from '@/hooks/use-debounce';
import { Eye } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery<PaginatedResult<User>>({
    queryKey: ['admin-users', page, debouncedSearch, roleFilter, statusFilter],
    queryFn: () => api.get('/dashboard/users', {
      page, pageSize: 20, q: debouncedSearch,
      role: roleFilter, status: statusFilter,
    }),
  });

  const columns = [
    { key: 'name', header: 'Nom', render: (item: User) => (
      <Link href={`/dashboard/users/${item.id}`} className="text-brand-600 hover:underline font-medium">
        {item.firstName} {item.lastName}
      </Link>
    )},
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Rôle', render: (item: User) => (
      <span className={item.role === 'ADMIN' ? 'badge-blue' : item.role === 'COACH' ? 'badge-green' : 'badge-gray'}>{item.role}</span>
    )},
    { key: 'status', header: 'Statut', render: (item: User) => <StatusBadge status={item.status} /> },
    { key: 'isPremium', header: 'Type', render: (item: User) => <PremiumBadge isPremium={item.isPremium} /> },
    { key: 'xp', header: 'XP', render: (item: User) => item.gamificationProfile?.xp || 0 },
    { key: 'streak', header: 'Streak', render: (item: User) => item.gamificationProfile?.streak || 0 },
    { key: 'createdAt', header: 'Inscription', render: (item: User) => new Date(item.createdAt).toLocaleDateString('fr') },
  ];

  return (
    <div>
      <PageHeader title="Utilisateurs" description="Gérer les comptes utilisateurs" />

      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.meta.total || 0}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher email, nom..."
        loading={isLoading}
        filters={
          <>
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="input-field w-auto">
              <option value="">Tous les rôles</option>
              <option value="USER">User</option>
              <option value="COACH">Coach</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto">
              <option value="">Tous les statuts</option>
              <option value="ACTIVE">Actif</option>
              <option value="SUSPENDED">Suspendu</option>
            </select>
          </>
        }
        actions={(item) => (
          <button onClick={() => router.push(`/dashboard/users/${item.id}`)} className="p-1.5 hover:bg-gray-100 rounded" title="Voir">
            <Eye className="w-4 h-4" />
          </button>
        )}
      />
    </div>
  );
}
