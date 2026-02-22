'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { dashboardApi } from '@/lib/api/content.api';
import { ArrowLeft, Target } from 'lucide-react';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-user', id],
    queryFn: async () => {
      const res = await dashboardApi.getUserById(id);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-brand-orange">Chargement...</div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-dark-text p-6">Utilisateur non trouvé.</p>;
  }

  const { user, progress, softSkillScores } = data;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-dark-text">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-dark-text">
          {user.profile?.firstName} {user.profile?.lastName} {user.email}
        </h1>
      </div>

      {/* User info */}
      <div className="glass rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Target size={24} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-dark-text">{progress?.completedContent ?? 0}</p>
          <p className="text-dark-text text-xs">Contenus terminés</p>
        </div>
      </div>

      {/* Soft skill scores */}
      {softSkillScores && Object.keys(softSkillScores).length > 0 && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-dark-text font-semibold mb-4">Scores par compétence</h2>
          <div className="space-y-3">
            {Object.entries(softSkillScores).map(([skill, score]: [string, any]) => (
              <div key={skill}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-dark-text capitalize">{skill}</span>
                  <span className="text-brand-orange">{Math.round(score)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-orange rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent progress */}
      {progress?.recent?.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-dark-text font-semibold mb-4">Activité récente</h2>
          <div className="space-y-3">
            {progress.recent.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0" />
                <span className="text-dark-text flex-1">{item.content?.title ?? 'Contenu'}</span>
                <span className="text-dark-text text-xs">
                  {item.completed ? '✅ Terminé' : `${Math.round(item.progressPercent ?? 0)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
