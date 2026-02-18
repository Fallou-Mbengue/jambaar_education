'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, User, CreditCard, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotificationsStore } from '@/store/notifications.store';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth.api';
import apiClient from '@/lib/api/client';
import clsx from 'clsx';

export function Topbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: string; title: string; body: string; isRead: boolean; type: string }[]
  >([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/programs?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleNotifOpen = async () => {
    setIsNotifOpen((p) => !p);
    if (!isNotifOpen) {
      try {
        const res = await apiClient.get('/notifications?limit=10');
        setNotifications(res.data.data?.items ?? []);
      } catch {
        // silent
      }
    }
  };

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    router.push('/auth/login');
  };

  const displayName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName ?? ''}`.trim()
    : user?.email ?? '';

  const initials = user?.profile?.firstName
    ? `${user.profile.firstName[0]}${user.profile.lastName?.[0] ?? ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header
      className="topbar flex items-center justify-between px-4 gap-4"
      role="banner"
    >
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text pointer-events-none"
            aria-hidden="true"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher programmes, contenu..."
            className="w-full bg-surface-2 border border-dark-border rounded-lg pl-8 pr-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-orange/50 focus:bg-surface-3 transition-colors"
            aria-label="Recherche globale"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-text hover:text-gray-800"
              aria-label="Effacer la recherche"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={handleNotifOpen}
            className="relative p-2 rounded-lg text-dark-text hover:text-gray-800 hover:bg-surface-2 transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
            aria-haspopup="true"
            aria-expanded={isNotifOpen}
          >
            <Bell size={18} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-brand-orange text-dark-text text-[9px] rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5 font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-80 bg-surface-1 border border-dark-border rounded-xl shadow-modal z-50 animate-fade-in overflow-hidden"
              role="menu"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
                <span className="text-sm font-semibold text-gray-800">Notifications</span>
                <Link
                  href="/profile"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs text-brand-orange hover:underline"
                >
                  Voir tout
                </Link>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-dark-text text-sm text-center py-6">Aucune notification</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={clsx(
                        'px-4 py-3 border-b border-dark-border/50 last:border-0',
                        !n.isRead && 'bg-brand-orange/5',
                      )}
                    >
                      <p className="text-sm text-gray-800 font-medium">{n.title}</p>
                      <p className="text-xs text-dark-text mt-0.5 line-clamp-2">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen((p) => !p)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
            aria-haspopup="true"
            aria-expanded={isProfileOpen}
            aria-label="Menu profil"
          >
            <div className="w-7 h-7 bg-brand-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-brand-orange text-xs font-bold">{initials}</span>
            </div>
            <span className="text-sm text-gray-800 max-w-[120px] truncate hidden lg:block">
              {displayName}
            </span>
            <ChevronDown
              size={13}
              className={clsx(
                'text-dark-text transition-transform hidden lg:block',
                isProfileOpen && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </button>

          {isProfileOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-52 bg-surface-1 border border-dark-border rounded-xl shadow-modal z-50 animate-fade-in overflow-hidden"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-dark-border">
                <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
                <p className="text-xs text-dark-text truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark-text hover:text-gray-800 hover:bg-surface-2 transition-colors"
                  role="menuitem"
                >
                  <User size={15} aria-hidden="true" />
                  Mon Profil
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark-text hover:text-gray-800 hover:bg-surface-2 transition-colors"
                  role="menuitem"
                >
                  <CreditCard size={15} aria-hidden="true" />
                  Abonnement
                </Link>
              </div>
              <div className="border-t border-dark-border py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-surface-2 transition-colors"
                  role="menuitem"
                >
                  <LogOut size={15} aria-hidden="true" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
