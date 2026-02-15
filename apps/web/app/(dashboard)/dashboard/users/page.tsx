'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  profile?: { firstName: string; lastName: string };
  gamification?: { totalXp: number; currentLevel: string; currentStreak: number };
  completedContent: number;
  completedChallenges: number;
  activeSubscription?: { plan: { name: string } } | null;
  createdAt: string;
}

export default function DashboardUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-users', search, page],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/users', {
        params: { search: search || undefined, page },
      });
      return res.data.data;
    },
    staleTime: 30000,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
        <span className="text-dark-text text-sm">{data?.total ?? 0} au total</span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher par nom ou email..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-dark-text focus:outline-none focus:border-brand-orange transition-colors text-sm"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-dark-text">
              <th className="text-left px-4 py-3">Utilisateur</th>
              <th className="text-left px-4 py-3">Niveau</th>
              <th className="text-left px-4 py-3">Contenus</th>
              <th className="text-left px-4 py-3">Streak</th>
              <th className="text-left px-4 py-3">Abonnement</th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-dark-text">Chargement...</td>
              </tr>
            ) : (
              (data?.items ?? []).map((user: UserItem) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </div>
                    <div className="text-dark-text text-xs">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-brand-orange text-xs font-medium">
                      {user.gamification?.currentLevel ?? 'Starter'}
                    </span>
                    <div className="text-dark-text text-xs">{user.gamification?.totalXp ?? 0} XP</div>
                  </td>
                  <td className="px-4 py-3 text-white">{user.completedContent}</td>
                  <td className="px-4 py-3">
                    <span className="text-brand-orange">🔥 {user.gamification?.currentStreak ?? 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.activeSubscription ? (
                      <span className="text-brand-green text-xs">{user.activeSubscription.plan.name}</span>
                    ) : (
                      <span className="text-dark-text text-xs">Gratuit</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/users/${user.id}`}
                      className="text-brand-orange text-xs hover:underline"
                    >
                      Détails →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-white/10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 glass hover:border-white/30"
            >
              ← Prev
            </button>
            <span className="text-dark-text text-sm">
              Page {page} / {data.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page >= data.pages}
              className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 glass hover:border-white/30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
