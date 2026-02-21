'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export function LandingHeader() {
  const pathname = usePathname();

  const NAV_LINKS = [
    { label: 'Accueil', href: '/', active: pathname === '/' },
    { label: 'Nos parcours', href: '/parcours', active: pathname.startsWith('/parcours'), dropdown: true },
    { label: 'Contact', href: '/#contact', active: false },
  ];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [parcoursOpen, setParcoursOpen] = useState(false);

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

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        'bg-[#FFFFFF]',
        scrolled && 'shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
      )}
    >
      <div className="landing-container">
        <nav className="flex items-center justify-between h-[72px]" aria-label="Navigation principale">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-[#1E1E1E] tracking-tight">
              <span className="text-[#9333EA] text-[1.15em]">J</span>ambaar<span className="text-landing-orange">.</span>
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
                        : 'text-[#1E1E1E] hover:bg-gray-100'
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-4">
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
          </div>

          {/* Mobile burger */}
          <button
            type="button"
            className="lg:hidden p-2 -mr-2 text-[#1E1E1E] hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.dropdown ? '#parcours' : link.href}
                className={clsx(
                  'px-4 py-3 text-base font-medium rounded-lg',
                  link.active ? 'text-[#1E1E1E] bg-landing-orange/10' : 'text-[#1E1E1E] hover:bg-gray-100'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-4 border-gray-200" />
            <Link
              href="/auth/signup"
              className="px-4 py-3 text-center font-medium text-[#1E1E1E] border border-gray-200 rounded-lg hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              S&apos;inscrire
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-3.5 text-center font-semibold text-white bg-landing-orange rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Connexion
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
