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
  Search,
  Settings,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/users', icon: Users, label: 'Utilisateurs' },
  { href: '/dashboard/parcours', icon: BookOpen, label: 'Parcours (Cours)' },
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
    : 'MS';

  const userName = user?.profile?.firstName && user?.profile?.lastName
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : 'Mamadou Sy';

  const userId = user?.id ? `#${user.id.slice(0, 3).toUpperCase()}-JA` : '#892-JA';

  return (
    <div className="flex h-screen bg-[#111111]">
      {/* Sidebar */}
      <aside className="w-[250px] bg-[#0D0D0D] border-r border-white/[0.06] flex flex-col py-6 flex-shrink-0">
        {/* Logo */}
        <div className="px-5 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-base">J</span>
            </div>
            <div>
              <div className="text-[15px] font-bold text-white leading-tight">Jambaar Admin</div>
              <div className="text-[11px] text-gray-500 leading-tight">E-learning Platform</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-orange-400' : ''} />
                {label}
              </Link>
            );
          })}

          {/* Configuration section */}
          <div className="pt-6 pb-1">
            <div className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              Configuration
            </div>
          </div>
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all ${
              pathname === '/dashboard/settings'
                ? 'bg-orange-500/15 text-orange-400 font-semibold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
            }`}
          >
            <Settings size={18} />
            Paramètres
          </Link>
        </nav>

        {/* Logout */}
        <div className="px-3 mt-4 pt-4 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-[60px] bg-[#0D0D0D] border-b border-white/[0.06] flex items-center justify-between px-6 flex-shrink-0">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur, un cours..."
                className="w-full h-10 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Bell */}
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>

            {/* User profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 hover:bg-white/[0.04] rounded-lg px-2.5 py-1.5 transition-colors"
              >
                <div className="text-right hidden md:block">
                  <div className="text-[13px] font-medium text-white leading-tight">{userName}</div>
                  <div className="text-[11px] text-gray-500 leading-tight">ID: {userId}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10">
                  {userInitials}
                </div>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl py-1.5 z-20">
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Paramètres
                    </Link>
                    <button
                      onClick={() => { setShowUserMenu(false); handleLogout(); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-8 bg-[#111111]">{children}</main>
      </div>
    </div>
  );
}
