'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AnalyticsOverview } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { Users, FileText, CreditCard, Trophy, TrendingUp, Zap } from 'lucide-react';

function KPICard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: any; sub?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get('/dashboard/analytics/overview'),
  });

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Vue d'ensemble de la plateforme" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Vue d'ensemble de la plateforme" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard label="Utilisateurs" value={data.users.total} icon={Users} sub={`+${data.users.newToday} aujourd'hui`} />
        <KPICard label="Premium" value={data.users.premium} icon={Zap} sub={`${data.users.conversionRate}% conversion`} />
        <KPICard label="Contenus publiés" value={data.content.published} icon={FileText} sub={`${data.content.total} total`} />
        <KPICard label="Abonnements actifs" value={data.billing.activeSubscriptions} icon={CreditCard} />
        <KPICard label="Revenus total" value={`${data.billing.totalRevenue.toLocaleString()} XOF`} icon={TrendingUp} />
        <KPICard label="Challenges complétés" value={data.engagement.completedChallenges} icon={Trophy} />
        <KPICard label="Quiz ce mois" value={data.engagement.quizAttemptsThisMonth} icon={FileText} />
        <KPICard label="Taux activation" value={`${data.users.activationRate}%`} icon={Users} sub="Onboarding complété" />
      </div>
    </div>
  );
}
