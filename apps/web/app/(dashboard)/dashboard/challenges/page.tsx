'use client';

import { useQuery } from '@tanstack/react-query';
import { challengesApi } from '@/lib/api/content.api';
import { Flame, Users, Calendar } from 'lucide-react';

export default function DashboardChallengesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-challenges'],
    queryFn: async () => {
      const res = await challengesApi.getAll();
      return res.data.data;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Challenges</h1>

      {isLoading ? (
        <div className="text-brand-orange">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data ?? []).map((challenge: any) => (
            <div key={challenge.id} className="glass rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-orange/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Flame size={20} className="text-brand-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium">{challenge.title}</h3>
                  <p className="text-dark-text text-sm mt-1 line-clamp-2">{challenge.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-dark-text">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      7 jours
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {challenge._count?.participants ?? 0} participants
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      challenge.status === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {challenge.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!data || data.length === 0) && (
            <p className="text-dark-text col-span-2 text-center py-12">Aucun challenge trouvé.</p>
          )}
        </div>
      )}
    </div>
  );
}
