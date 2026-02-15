'use client';

import { useQuery } from '@tanstack/react-query';
import { programsApi } from '@/lib/api/content.api';
import Link from 'next/link';
import { BookOpen, Users } from 'lucide-react';

export default function DashboardProgramsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-programs'],
    queryFn: async () => {
      const res = await programsApi.getAll();
      return res.data.data;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Programmes</h1>
      </div>

      {isLoading ? (
        <div className="text-brand-orange">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data ?? []).map((program: any) => (
            <div key={program.id} className="glass rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-orange/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen size={20} className="text-brand-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium">{program.title}</h3>
                  <p className="text-dark-text text-sm mt-1 line-clamp-2">{program.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-dark-text">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} />
                      {program._count?.modules ?? 0} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {program._count?.enrollments ?? 0} inscrits
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      program.status === 'PUBLISHED'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {program.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!data || data.length === 0) && (
            <p className="text-dark-text col-span-2 text-center py-12">Aucun programme trouvé.</p>
          )}
        </div>
      )}
    </div>
  );
}
