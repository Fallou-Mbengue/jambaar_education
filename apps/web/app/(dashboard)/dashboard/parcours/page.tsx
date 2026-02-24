'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProgramKPIs {
  totalCourses: { value: number; trend: number };
  published: { value: number; trend: number };
  paid: { value: number; trend: number };
  free: { value: number; trend: number };
}

interface Program {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  isPremium: boolean;
  tags: string[];
  thumbnailKey?: string;
  _count: { modules: number };
  modules: Array<{ id: string }>;
}

function KPICard({
  title,
  value,
  trend,
  iconBg,
}: {
  title: string;
  value: number;
  trend: number;
  iconBg: string;
}) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] text-gray-400">{title}</span>
        <div
          className={`flex items-center gap-0.5 text-xs font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    ENTREPRENEURIAT: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    'SOFT SKILLS': 'bg-green-500/15 text-green-400 border-green-500/20',
    LEADERSHIP: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    default: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
        styles[category] || styles.default
      }`}
    >
      {category}
    </span>
  );
}

export default function ParcoursPage() {
  const [page, setPage] = useState(1);
  const limit = 8;

  const { data: kpis } = useQuery({
    queryKey: ['program-kpis'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/programs/kpis');
      return res.data.data as ProgramKPIs;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['programs', page],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/programs', {
        params: { page, limit },
      });
      return res.data.data as {
        items: Program[];
        total: number;
        pages: number;
      };
    },
  });

  const programs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

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
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Nombre de cours"
          value={kpis?.totalCourses.value ?? 0}
          trend={kpis?.totalCourses.trend ?? 0}
          iconBg="bg-purple-600"
        />
        <KPICard
          title="Parcours publiés"
          value={kpis?.published.value ?? 0}
          trend={kpis?.published.trend ?? 0}
          iconBg="bg-green-600"
        />
        <KPICard
          title="Parcours payant"
          value={kpis?.paid.value ?? 0}
          trend={kpis?.paid.trend ?? 0}
          iconBg="bg-orange-600"
        />
        <KPICard
          title="Parcours gratuit"
          value={kpis?.free.value ?? 0}
          trend={kpis?.free.trend ?? 0}
          iconBg="bg-blue-600"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Tous les parcours</h2>
        <Link
          href="/dashboard/parcours/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={18} />
          Ajouter un parcours
        </Link>
      </div>

      {/* Programs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#1A1A1A] rounded-xl p-4 border border-white/[0.06] animate-pulse">
              <div className="h-40 bg-white/[0.04] rounded-lg mb-3" />
              <div className="h-4 bg-white/[0.04] rounded mb-2" />
              <div className="h-3 bg-white/[0.04] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : programs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {programs.map((program) => {
              const category = program.tags[0] || 'DÉVELOPPEMENT';
              const moduleCount = program.modules?.length ?? program._count?.modules ?? 0;

              return (
                <Link
                  key={program.id}
                  href={`/dashboard/parcours/${program.id}`}
                  className="group bg-[#1A1A1A] rounded-xl border border-white/[0.06] overflow-hidden hover:border-orange-500/30 transition-all"
                >
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <CategoryBadge category={category} />
                  </div>

                  {/* Image */}
                  <div className="relative h-40 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <span className="text-white/20 text-6xl font-bold">
                      {program.title.charAt(0)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-[15px] font-bold text-white mb-1.5 line-clamp-2 group-hover:text-orange-400 transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-[12px] text-gray-400 line-clamp-2 mb-3">
                      {program.description}
                    </p>

                    {/* Progress bar (mock) */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                        <span>Progression</span>
                        <span>0%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full w-0 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400" />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-gray-400 text-[12px]">
                        <Clock size={12} />
                        <span>{moduleCount} instantanés</span>
                      </div>
                      <button className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-semibold rounded-md transition-colors">
                        Continuer
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-[13px] text-gray-500">
                Affichage de {startIndex}-{endIndex} sur {total} parcours
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-[13px] text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft size={14} />
                  Précédent
                </button>

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
        </>
      ) : (
        <div className="text-center py-16 text-gray-500">
          Aucun parcours trouvé. Créez-en un avec le bouton ci-dessus.
        </div>
      )}
    </div>
  );
}
