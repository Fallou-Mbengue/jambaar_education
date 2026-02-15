'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Zap, MessageSquare, User } from 'lucide-react';
import { useNotificationsStore } from '@/store/notifications.store';

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Feed' },
  { href: '/programs', icon: BookOpen, label: 'Programmes' },
  { href: '/challenges', icon: Zap, label: 'Challenges' },
  { href: '/assistant', icon: MessageSquare, label: 'IA' },
  { href: '/profile', icon: User, label: 'Profil' },
];

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg">
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative ${
                  isActive ? 'text-brand-orange' : 'text-dark-text hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                  {href === '/profile' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
