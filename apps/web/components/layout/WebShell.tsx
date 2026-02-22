'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, BookOpen, User } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RightPanel } from './RightPanel';
import { useNotificationsStore } from '@/store/notifications.store';
import clsx from 'clsx';

// Pages that don't show the right panel (section Contexte)
const NO_PANEL_ROUTES = ['/home', '/parcours', '/billing', '/saved', '/onboarding'];
// Pages where we use compact sidebar (tablet) – handled via CSS
const MOBILE_NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Feed' },
  { href: '/parcours', icon: BookOpen, label: 'Programmes' },
  { href: '/profile', icon: User, label: 'Profil' },
];

interface WebShellProps {
  children: React.ReactNode;
}

export function WebShell({ children }: WebShellProps) {
  const pathname = usePathname();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const [sidebarCompact, setSidebarCompact] = useState(false);

  const showPanel = !NO_PANEL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  return (
    <>
      {/* ── Desktop / Tablet layout ─────────────────────── */}
      <div className="app-shell hidden md:flex">
        <Sidebar
          compact={sidebarCompact}
          onToggle={() => setSidebarCompact((p) => !p)}
        />

        <div className="main-area">
          <Topbar />
          <main
            id="main-content"
            className="page-content"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>

        {showPanel && <RightPanel />}
      </div>

      {/* ── Mobile layout ───────────────────────────────── */}
      <div className="flex flex-col min-h-screen bg-dark-bg md:hidden">
        <main className="flex-1 overflow-hidden">{children}</main>

        {/* Mobile bottom nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10"
          aria-label="Navigation mobile"
        >
          <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
            {MOBILE_NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              const hasNotif = href === '/profile' && unreadCount > 0;
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative',
                    isActive ? 'text-brand-orange' : 'text-dark-text hover:text-gray-800',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="relative">
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      aria-hidden="true"
                    />
                    {hasNotif && (
                      <span className="absolute -top-1 -right-1 bg-brand-orange text-dark-text text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={clsx('text-xs', isActive && 'font-semibold')}>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
