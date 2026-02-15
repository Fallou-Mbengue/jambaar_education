'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/content.api';
import { CreditCard, TrendingUp, Users } from 'lucide-react';

export default function DashboardBillingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-subscriptions'],
    queryFn: async () => {
      const res = await dashboardApi.getSubscriptions();
      return res.data.data;
    },
  });

  const subscriptions: any[] = data?.subscriptions ?? [];
  const total = subscriptions.length;
  const active = subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const revenue = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + (s.plan?.price ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Abonnements</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <Users size={20} className="text-brand-orange mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-dark-text text-xs">Total</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <CreditCard size={20} className="text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{active}</p>
          <p className="text-dark-text text-xs">Actifs</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <TrendingUp size={20} className="text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{(revenue / 1000).toFixed(1)}k</p>
          <p className="text-dark-text text-xs">XOF / mois</p>
        </div>
      </div>

      {/* Subscriptions table */}
      {isLoading ? (
        <div className="text-brand-orange">Chargement...</div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-dark-text font-medium py-3 px-4">Utilisateur</th>
                <th className="text-left text-dark-text font-medium py-3 px-4">Plan</th>
                <th className="text-left text-dark-text font-medium py-3 px-4">Statut</th>
                <th className="text-left text-dark-text font-medium py-3 px-4">Expire le</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub: any) => (
                <tr key={sub.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="py-3 px-4 text-white">
                    {sub.user?.profile?.displayName ?? sub.user?.email ?? '-'}
                  </td>
                  <td className="py-3 px-4 text-dark-text">{sub.plan?.name ?? '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      sub.status === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-400'
                        : sub.status === 'EXPIRED'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-dark-text text-xs">
                    {sub.endsAt ? new Date(sub.endsAt).toLocaleDateString('fr-FR') : '-'}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-dark-text">
                    Aucun abonnement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
