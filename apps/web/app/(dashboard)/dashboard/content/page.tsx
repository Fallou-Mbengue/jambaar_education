'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  isPremium: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'text-dark-text bg-white/10',
  PUBLISHED: 'text-brand-green bg-brand-green/10',
  ARCHIVED: 'text-red-400 bg-red-500/10',
};

export default function DashboardContentPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-content', search, statusFilter, page],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/content', {
        params: { search: search || undefined, status: statusFilter || undefined, page },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Catalogue Contenus</h1>
        <Link
          href="/dashboard/content/new"
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nouveau contenu
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-dark-text focus:outline-none focus:border-brand-orange transition-colors text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-orange"
        >
          <option value="">Tous statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-dark-text">
              <th className="text-left px-4 py-3">Titre</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3">Vues</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-dark-text">Chargement...</td>
              </tr>
            ) : (
              (data?.items ?? []).map((item: ContentItem) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white line-clamp-1">{item.title}</div>
                    {item.isPremium && (
                      <span className="text-xs text-brand-gold">Premium</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-dark-text">{item.type}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status] ?? ''}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{item.viewCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/content/${item.id}/edit`}
                      className="text-brand-orange text-xs hover:underline"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
