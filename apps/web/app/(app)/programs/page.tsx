'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function ProgramsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const res = await apiClient.get('/programs');
      return res.data.data;
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-brand-orange">Chargement...</div>
    </div>
  );

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Programmes</h1>
      <p className="text-dark-text text-sm mb-6">Parcours complets pour progresser.</p>

      <div className="space-y-4">
        {(data ?? []).map((program: {
          id: string;
          title: string;
          description?: string;
          thumbnailUrl?: string;
          isPremium: boolean;
          durationDays?: number;
          tags: string[];
          progress?: { progressPercent: number } | null;
          _count: { modules: number };
        }) => (
          <Link key={program.id} href={`/programs/${program.id}`}>
            <div className="glass rounded-2xl overflow-hidden hover:border-brand-orange/30 transition-all">
              <div className="h-28 bg-gradient-to-br from-brand-orange/20 to-dark-card flex items-center justify-center">
                <BookOpen size={40} className="text-brand-orange/60" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white">{program.title}</h3>
                {program.description && (
                  <p className="text-dark-text text-sm mt-1 line-clamp-2">{program.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-dark-text">
                    {program._count.modules} modules
                    {program.durationDays && ` • ${program.durationDays} jours`}
                  </span>
                  {program.progress && (
                    <span className="text-xs text-brand-orange">
                      {program.progress.progressPercent}%
                    </span>
                  )}
                </div>
                {program.progress && (
                  <div className="mt-2 bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-brand-orange h-1.5 rounded-full xp-bar-fill"
                      style={{ width: `${program.progress.progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
