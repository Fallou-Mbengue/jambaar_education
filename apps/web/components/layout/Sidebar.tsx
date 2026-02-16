'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Zap,
  MessageSquare,
  Bookmark,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNotificationsStore } from '@/store/notifications.store';
import { useAuthStore } from '@/store/auth.store';
import clsx from 'clsx';

interface SidebarProps {
  compact?: boolean;
  onToggle?: () => void;
}

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Feed' },
  { href: '/programs', icon: BookOpen, label: 'Programmes' },
  { href: '/challenges', icon: Zap, label: 'Challenges' },
  { href: '/assistant', icon: MessageSquare, label: 'Assistant IA' },
  { href: '/saved', icon: Bookmark, label: 'Sauvegardés' },
  { href: '/profile', icon: User, label: 'Profil' },
  { href: '/billing', icon: CreditCard, label: 'Abonnement' },
];

export function Sidebar({ compact = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const user = useAuthStore((s) => s.user);

  return (
    <nav
      className={clsx('sidebar flex flex-col', compact && 'sidebar-compact')}
      aria-label="Navigation principale"
    >
      {/* Logo */}
      <div
        className={clsx(
          'flex items-center h-14 border-b border-dark-border flex-shrink-0',
          compact ? 'justify-center px-0' : 'px-4 gap-3',
        )}
      >
        <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-sm">J</span>
        </div>
        {!compact && (
          <span className="text-white font-bold text-lg tracking-tight">JAMBAAR</span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {!compact && (
          <p className="text-label text-dark-text uppercase px-3 mb-2 mt-1">Navigation</p>
        )}
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          const hasNotif = href === '/profile' && unreadCount > 0;

          return (
            <Link
              key={href}
              href={href}
              className={clsx('nav-item block', isActive && 'active')}
              title={compact ? label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex-shrink-0">
                <Icon
                  size={18}
                  className="nav-icon flex-shrink-0"
                  strokeWidth={isActive ? 2.5 : 1.75}
                  aria-hidden="true"
                />
                {hasNotif && (
                  <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[9px] rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5 font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              {!compact && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </div>

      {/* User footer */}
      {!compact && user && (
        <div className="border-t border-dark-border p-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 bg-brand-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-brand-orange text-xs font-bold">
                {user.profile?.firstName?.[0] ?? user.email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {user.profile?.firstName
                  ? `${user.profile.firstName} ${user.profile.lastName ?? ''}`
                  : user.email}
              </p>
              <p className="text-dark-text text-[10px] capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className={clsx(
            'flex items-center justify-center h-9 border-t border-dark-border text-dark-text hover:text-white hover:bg-white/5 transition-colors flex-shrink-0',
            compact ? 'w-full' : 'px-4 gap-2 text-xs',
          )}
          aria-label={compact ? 'Étendre la barre latérale' : 'Réduire la barre latérale'}
        >
          {compact ? <ChevronRight size={14} /> : (
            <>
              <ChevronLeft size={14} />
              <span>Réduire</span>
            </>
          )}
        </button>
      )}
    </nav>
  );
}
