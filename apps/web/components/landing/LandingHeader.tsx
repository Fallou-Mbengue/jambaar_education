'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';

const NAV_LINKS = [
  { label: 'Programmes', href: '#programmes' },
  { label: 'Challenges', href: '#challenges' },
  { label: 'Assistant IA', href: '#assistant' },
  { label: 'Tarifs', href: '#tarifs' },
  { label: 'FAQ', href: '#faq' },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      setMobileOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setMobileOpen(false);
  }, []);

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
          : 'bg-transparent'
      )}
    >
      <div className="landing-container">
        <nav className="flex items-center justify-between h-[72px]" aria-label="Navigation principale">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-landing-blue flex items-center justify-center">
              <span className="text-landing-yellow font-extrabold text-lg leading-none">J</span>
            </div>
            <span className="text-xl font-bold text-landing-blue tracking-tight">
              Jambaar
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-landing-blue rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2.5 text-sm font-semibold text-landing-blue hover:bg-gray-50 rounded-xl transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-landing-orange hover:bg-landing-orange-hover rounded-xl transition-colors shadow-sm"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            type="button"
            className="lg:hidden p-2 -mr-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
          onKeyDown={handleKeyDown}
          className="lg:hidden fixed inset-0 top-[72px] bg-white z-40 animate-fade-in"
        >
          <div className="flex flex-col p-6 gap-2">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-4 py-3 text-base font-medium text-gray-700 hover:text-landing-blue hover:bg-gray-50 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="my-4 border-gray-100" />
            <Link
              href="/auth/login"
              className="px-4 py-3 text-base font-semibold text-landing-blue text-center border border-landing-blue/20 rounded-xl hover:bg-landing-blue/5 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Se connecter
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-3.5 text-base font-semibold text-white text-center bg-landing-orange hover:bg-landing-orange-hover rounded-xl transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
