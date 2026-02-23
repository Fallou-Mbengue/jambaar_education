'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard.api';
import {
  Users,
  BookOpen,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  iconBg,
}: {
  title: string;
  value: string | number;
  trend: number;
  icon: typeof Users;
  iconBg: string;
}) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'PENDING' | 'SUCCESS' | 'FAILED' }) {
  const styles = {
    SUCCESS: 'bg-green-500/10 text-green-400 border-green-500/20',
    PENDING: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const labels = {
    SUCCESS: 'SUCCÈS',
    PENDING: 'EN ATTENTE',
    FAILED: 'ÉCHOUÉ',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function DashboardPage() {
  const { data: kpis, isLoading: loadingKpis } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardApi.getKpis(),
    refetchInterval: 60000,
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['dashboard-transactions'],
    queryFn: () => dashboardApi.getRecentTransactions(5),
    refetchInterval: 30000,
  });

  const { data: recentUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['dashboard-recent-users'],
    queryFn: () => dashboardApi.getRecentUsers(5),
    refetchInterval: 30000,
  });

  if (loadingKpis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Nombre d'utilisateurs"
          value={kpis?.users.total.toLocaleString() || 0}
          trend={kpis?.users.trend || 0}
          icon={Users}
          iconBg="bg-blue-600"
        />
        <StatCard
          title="Nombre de cours"
          value={kpis?.content.total || 0}
          trend={kpis?.content.trend || 0}
          icon={BookOpen}
          iconBg="bg-purple-600"
        />
        <StatCard
          title="Nombre d'achats"
          value={kpis?.payments.total || 0}
          trend={kpis?.payments.trend || 0}
          icon={CreditCard}
          iconBg="bg-green-600"
        />
        <StatCard
          title="Chiffre d'affaires total"
          value={`${(kpis?.billing.totalRevenueXof || 0).toLocaleString()} FCFA`}
          trend={kpis?.billing.trend || 0}
          icon={DollarSign}
          iconBg="bg-orange-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Transactions - 2/3 width */}
        <div className="lg:col-span-2 bg-[#1A1A1A] rounded-xl border border-white/5">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Ventes récentes</h2>
            <Link
              href="/dashboard/billing"
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              Voir tout
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Cours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingTransactions ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      Chargement...
                    </td>
                  </tr>
                ) : transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">#{tx.transactionRef}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            {tx.user.firstName.charAt(0)}
                            {tx.user.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {tx.user.firstName} {tx.user.lastName}
                            </div>
                            <div className="text-xs text-gray-400">{tx.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white max-w-xs truncate">{tx.courseName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {tx.amount.toLocaleString()} FCFA
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      Aucune transaction récente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users - 1/3 width */}
        <div className="bg-[#1A1A1A] rounded-xl border border-white/5">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white">Nouveaux inscrits</h2>
          </div>
          <div className="p-6 space-y-4">
            {loadingUsers ? (
              <div className="text-center py-8 text-gray-400">Chargement...</div>
            ) : recentUsers && recentUsers.length > 0 ? (
              <>
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-400">
                        Inscrit{' '}
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <Link
                  href="/dashboard/users"
                  className="block w-full mt-4 py-2.5 text-center text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  Voir tous les utilisateurs
                </Link>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">Aucun nouvel utilisateur</div>
            )}
          </div>
        </div>
      </div>

      {/* Create Course CTA */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl p-8 border border-orange-400/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Besoin d&apos;ajouter un nouveau cours ?
            </h3>
            <p className="text-orange-100">
              Créez et publiez du contenu éducatif en quelques clics.
            </p>
          </div>
          <Link
            href="/dashboard/content/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-orange-600 font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            Créer un cours
          </Link>
        </div>
      </div>
    </div>
  );
}
