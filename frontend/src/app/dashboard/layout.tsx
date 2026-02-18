'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import {
  LayoutDashboard, FileText, BookOpen, Trophy, HelpCircle,
  Users, CreditCard, Bell, ScrollText, LogOut, ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/content', label: 'Contenus', icon: FileText },
  { href: '/dashboard/programs', label: 'Programmes', icon: BookOpen },
  { href: '/dashboard/challenges', label: 'Challenges', icon: Trophy },
  { href: '/dashboard/quizzes', label: 'Quizzes', icon: HelpCircle },
  { href: '/dashboard/users', label: 'Utilisateurs', icon: Users },
  { href: '/dashboard/billing/plans', label: 'Plans', icon: CreditCard },
  { href: '/dashboard/billing/subscriptions', label: 'Abonnements', icon: CreditCard },
  { href: '/dashboard/billing/payments', label: 'Paiements', icon: CreditCard },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (user.role !== 'ADMIN' && user.role !== 'COACH') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
          <p className="text-gray-500">Vous n'avez pas les permissions pour accéder à l'admin.</p>
        </div>
      </div>
    );
  }

  const isCoach = user.role === 'COACH';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-brand-700">Jambaar Admin</h1>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-medium border-r-2 border-brand-600'
                    : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="text-xs text-gray-500 mb-1">{user.email}</div>
          <div className="flex items-center justify-between">
            <span className={clsx('badge', user.role === 'ADMIN' ? 'badge-blue' : 'badge-green')}>
              {user.role}
            </span>
            <button onClick={handleLogout} className="p-1.5 hover:bg-gray-100 rounded" aria-label="Déconnexion">
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60">
        <div className="p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
