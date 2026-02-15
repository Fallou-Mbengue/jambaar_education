'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { Users, BookOpen, CreditCard, Flame, TrendingUp, CheckCircle } from 'lucide-react';

interface KpiData {
  users: { total: number; active30d: number; active7d: number; retentionRate30d: number };
  content: { total: number; published: number };
  billing: { activeSubscriptions: number; totalRevenueXof: number };
  learning: { challengesCompleted: number; avgStreak: number };
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ size: number; className: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-dark-text">{label}</div>
      {sub && <div className="text-xs text-brand-green mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/kpis');
      return res.data.data as KpiData;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-brand-orange">Chargement des KPIs...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Vue Globale</h1>
        <p className="text-dark-text mt-1">Indicateurs clés de performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Utilisateurs total"
          value={kpis?.users.total ?? 0}
          sub={`${kpis?.users.active30d ?? 0} actifs (30j)`}
          color="bg-blue-500/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Rétention 30j"
          value={`${kpis?.users.retentionRate30d ?? 0}%`}
          sub={`${kpis?.users.active7d ?? 0} actifs cette semaine`}
          color="bg-brand-green/20"
        />
        <StatCard
          icon={CreditCard}
          label="Abonnements actifs"
          value={kpis?.billing.activeSubscriptions ?? 0}
          sub={`${(kpis?.billing.totalRevenueXof ?? 0).toLocaleString()} F XOF total`}
          color="bg-brand-orange/20"
        />
        <StatCard
          icon={CheckCircle}
          label="Challenges complétés"
          value={kpis?.learning.challengesCompleted ?? 0}
          sub={`Streak moyen: ${kpis?.learning.avgStreak ?? 0} jours`}
          color="bg-brand-gold/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-orange" />
            Contenus
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-text">Total</span>
              <span className="text-white font-medium">{kpis?.content.total ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-text">Publiés</span>
              <span className="text-brand-green font-medium">{kpis?.content.published ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Flame size={18} className="text-brand-orange" />
            Engagement
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-text">Actifs 7j</span>
              <span className="text-white font-medium">{kpis?.users.active7d ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-text">Streak moyen</span>
              <span className="text-brand-orange font-medium">{kpis?.learning.avgStreak ?? 0}j</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
