'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, Bell, User, LogOut, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth.api';

export function LandingHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const NAV_LINKS = [
    { label: 'Accueil', href: '/', active: pathname === '/' },
    { label: 'Nos parcours', href: '/parcours', active: pathname.startsWith('/parcours'), dropdown: true },
    { label: 'Contact', href: '/#contact', active: false },
  ];

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [parcoursOpen, setParcoursOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push('/');
  };

  const initials = user?.profile
    ? `${user.profile.firstName?.[0] ?? ''}${user.profile.lastName?.[0] ?? ''}`
    : user?.email?.[0]?.toUpperCase() ?? '';
  const displayName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName ?? ''}`.trim()
    : user?.email ?? '';
  const roleName =
    user?.role === 'ADMIN' ? 'Administrateur'
    : user?.role === 'COACH' ? 'Coach Jambaar'
    : 'Apprenti Jambaar';

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        'bg-[#FFFFFF] border-b border-transparent',
        scrolled && 'shadow-[0_1px_3px_rgba(0,0,0,0.08)]',
      )}
    >
      <div className="landing-container">
        <nav className="flex items-center justify-between h-[72px]" aria-label="Navigation principale">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-[#5D2A87] tracking-tight inline-flex items-baseline">
              Jambaar
              <span className="inline-block w-2 h-2 rounded-full bg-landing-orange align-middle ml-0.5 shrink-0" aria-hidden />
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-0">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="relative">
                {link.dropdown ? (
                  <button
                    type="button"
                    onClick={() => setParcoursOpen(!parcoursOpen)}
                    className={clsx(
                      'flex items-center gap-1 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors',
                      link.active
                        ? 'bg-landing-orange text-white'
                        : 'text-[#1E1E1E] hover:bg-gray-100',
                    )}
                    aria-expanded={parcoursOpen}
                    aria-haspopup="true"
                  >
                    {link.label}
                    <ChevronDown size={16} className={clsx('transition-transform', parcoursOpen && 'rotate-180')} />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={clsx(
                      'block px-5 py-2.5 text-sm font-medium rounded-lg transition-colors',
                      link.active
                        ? 'text-[#1E1E1E] bg-landing-orange/10 border-b-2 border-landing-orange'
                        : 'text-[#1E1E1E] hover:bg-gray-100',
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Desktop right area */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {/* Notifications */}
                <button
                  className="relative p-2 rounded-lg text-[#1E1E1E] hover:bg-gray-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-landing-orange rounded-full" />
                </button>

                {/* Separator */}
                <div className="w-px h-8 bg-gray-200 mx-1" />

                {/* Profile dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-right hidden xl:block">
                      <p className="text-[13px] font-medium text-[#1E1E1E] leading-tight">{displayName}</p>
                      <p className="text-[11px] text-gray-500 leading-tight">{roleName}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-landing-orange flex items-center justify-center shrink-0">
                      {user.profile?.avatarUrl ? (
                        <img src={user.profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-[13px] font-bold text-white">{initials}</span>
                      )}
                    </div>
                    <ChevronDown
                      size={14}
                      className={clsx('text-gray-400 transition-transform', profileOpen && 'rotate-180')}
                    />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-56 py-2 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-[#1E1E1E] truncate">{displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/home"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E1E1E] hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <BookOpen size={16} className="text-gray-400" />
                          Tableau de bord
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E1E1E] hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User size={16} className="text-gray-400" />
                          Mon profil
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                          >
                            <LogOut size={16} />
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2.5 text-sm font-medium text-[#1E1E1E] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  S&apos;inscrire
                </Link>
                <Link
                  href="/auth/login"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-landing-orange hover:bg-landing-orange-hover rounded-lg transition-colors"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>

          {/* Mobile right area */}
          <div className="flex lg:hidden items-center gap-2">
            {user && (
              <button
                className="relative p-2 rounded-lg text-[#1E1E1E] hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-landing-orange rounded-full" />
              </button>
            )}
            <button
              type="button"
              className="p-2 -mr-2 text-[#1E1E1E] hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Dropdown Parcours (desktop) */}
      {parcoursOpen && (
        <>
          <div className="absolute inset-0 top-full z-10" aria-hidden onClick={() => setParcoursOpen(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0 w-48 py-2 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <Link href="/parcours" className="block px-4 py-2.5 text-sm text-[#1E1E1E] hover:bg-gray-50" onClick={() => setParcoursOpen(false)}>
              Tous les parcours
            </Link>
            <Link href="/parcours?filter=free" className="block px-4 py-2.5 text-sm text-[#1E1E1E] hover:bg-gray-50" onClick={() => setParcoursOpen(false)}>
              Parcours gratuits
            </Link>
            <Link href="/parcours?filter=paid" className="block px-4 py-2.5 text-sm text-[#1E1E1E] hover:bg-gray-50" onClick={() => setParcoursOpen(false)}>
              Parcours payants
            </Link>
          </div>
        </>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 top-[72px] bg-white z-40 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="landing-container py-6 flex flex-col gap-1">
            {/* User card (mobile) */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-landing-orange flex items-center justify-center shrink-0">
                  {user.profile?.avatarUrl ? (
                    <img src={user.profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white">{initials}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E1E1E] truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{roleName}</p>
                </div>
              </div>
            )}

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.dropdown ? '/parcours' : link.href}
                className={clsx(
                  'px-4 py-3 text-base font-medium rounded-lg',
                  link.active ? 'text-[#1E1E1E] bg-landing-orange/10' : 'text-[#1E1E1E] hover:bg-gray-100',
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <hr className="my-3 border-gray-200" />
                <Link href="/home" className="px-4 py-3 text-base font-medium text-[#1E1E1E] hover:bg-gray-100 rounded-lg flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                  <BookOpen size={18} className="text-gray-400" /> Tableau de bord
                </Link>
                <Link href="/profile" className="px-4 py-3 text-base font-medium text-[#1E1E1E] hover:bg-gray-100 rounded-lg flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                  <User size={18} className="text-gray-400" /> Mon profil
                </Link>
              </>
            )}

            <hr className="my-3 border-gray-200" />

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 w-full"
              >
                <LogOut size={18} /> Déconnexion
              </button>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="px-4 py-3 text-center font-medium text-[#1E1E1E] border border-gray-200 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  S&apos;inscrire
                </Link>
                <Link
                  href="/auth/login"
                  className="px-4 py-3.5 text-center font-semibold text-white bg-landing-orange rounded-lg hover:bg-landing-orange-hover"
                  onClick={() => setMobileOpen(false)}
                >
                  Connexion
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
