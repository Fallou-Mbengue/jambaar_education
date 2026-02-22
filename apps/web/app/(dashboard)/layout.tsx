'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { JambaarLogo } from '@/components/ui';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Vue globale' },
  { href: '/dashboard/users', icon: Users, label: 'Utilisateurs' },
  { href: '/dashboard/content', icon: BookOpen, label: 'Contenus' },
  { href: '/dashboard/programs', icon: BarChart3, label: 'Programmes' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Abonnements' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  if (pathname === '/dashboard/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    router.push('/dashboard/login');
  };

  return (
    <div className="flex h-screen bg-dark-bg">
      {/* Sidebar */}
      <aside className="w-56 glass border-r border-white/10 flex flex-col py-6 flex-shrink-0">
        <div className="px-4 mb-8">
          <JambaarLogo size="md" href="/dashboard" />
          <div className="text-xs text-dark-text mt-1">Dashboard B2B</div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-orange/20 text-brand-orange font-medium'
                    : 'text-dark-text hover:text-dark-text hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 mt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-text hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
