'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  LogOut,
  BarChart3,
  Search,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { JambaarLogo } from '@/components/ui';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/users', icon: Users, label: 'Utilisateurs' },
  { href: '/dashboard/programs', icon: BarChart3, label: 'Parcours (Cours)' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Paiements' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (pathname === '/dashboard/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    router.push('/dashboard/login');
  };

  const userInitials = user?.profile?.firstName && user?.profile?.lastName
    ? `${user.profile.firstName.charAt(0)}${user.profile.lastName.charAt(0)}`
    : 'AD';

  const userName = user?.profile?.firstName && user?.profile?.lastName
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : 'Admin';

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col py-6 flex-shrink-0">
        <div className="px-4 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="text-lg font-bold text-white">Jambaar Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}

          <div className="pt-4">
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors ${
                pathname === '/dashboard/settings'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings size={18} />
              Paramètres
            </Link>
          </div>
        </nav>

        <div className="px-3 mt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* User profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 hover:bg-white/5 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                {userInitials}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-white">{userName}</div>
                <div className="text-xs text-gray-400">Administrateur</div>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* User menu dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl py-2 z-20">
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Paramètres
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-8 bg-black">{children}</main>
      </div>
    </div>
  );
}
