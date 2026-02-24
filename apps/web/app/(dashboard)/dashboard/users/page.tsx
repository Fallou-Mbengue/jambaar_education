'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, DashboardUser } from '@/lib/api/dashboard.api';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'ADMIN',
  COACH: 'COACH',
  USER: 'ÉTUDIANT',
};

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  COACH: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  USER: 'bg-teal-500/15 text-teal-400 border border-teal-500/20',
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${ROLE_STYLES[role] || ROLE_STYLES.USER}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

function StatusDot({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
      <span className={`text-[13px] ${isActive ? 'text-green-400' : 'text-red-400'}`}>
        {isActive ? 'Actif' : 'Banni'}
      </span>
    </div>
  );
}

export default function DashboardUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-users', search, roleFilter, statusFilter, page],
    queryFn: () =>
      dashboardApi.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit,
      }),
    staleTime: 15000,
  });

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => dashboardApi.toggleUserStatus(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => dashboardApi.deleteUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-users'] }),
  });

  const handleDelete = (user: DashboardUser) => {
    const name = user.profile
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user.email;
    if (window.confirm(`Supprimer ${name} ? Cette action est irréversible.`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  // Generate page numbers
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-400 mt-1">
            Gérez les comptes des instructeurs et des étudiants de votre plateforme.
          </p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={18} />
          Ajouter un utilisateur
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher un utilisateur, un cours..."
            className="w-full h-10 pl-10 pr-4 bg-[#1A1A1A] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-10 px-4 bg-[#1A1A1A] border border-white/[0.08] rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500/50 appearance-none cursor-pointer min-w-[140px]"
        >
          <option value="">Rôle: Tous</option>
          <option value="ADMIN">Admin</option>
          <option value="COACH">Coach</option>
          <option value="USER">Étudiant</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 px-4 bg-[#1A1A1A] border border-white/[0.08] rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500/50 appearance-none cursor-pointer min-w-[140px]"
        >
          <option value="">Statut: Tous</option>
          <option value="active">Actif</option>
          <option value="banned">Banni</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[#1A1A1A] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-white/[0.04] rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => {
                  const fullName = user.profile
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.email.split('@')[0];
                  const initials = user.profile
                    ? `${user.profile.firstName.charAt(0)}${user.profile.lastName.charAt(0)}`
                    : user.email.charAt(0).toUpperCase();

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name + Avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <div className="text-[13px] font-medium text-white">{fullName}</div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[13px] text-gray-400">{user.email}</div>
                      </td>
                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusDot isActive={user.isActive} />
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[13px] text-gray-400">
                          {format(new Date(user.createdAt), 'd MMM yyyy', { locale: fr })}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/users/${user.id}`}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="px-6 py-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[13px] text-gray-500">
              Affichage de {startIndex}-{endIndex} sur {total.toLocaleString()} utilisateurs
            </div>

            <div className="flex items-center gap-1">
              {/* Previous */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={14} />
                Précédent
              </button>

              {/* Page numbers */}
              {pageNumbers.map((p, i) =>
                typeof p === 'string' ? (
                  <span key={`ellipsis-${i}`} className="px-1.5 text-gray-500 text-[13px]">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors ${
                      p === page
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              {/* Next */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                Suivant
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
