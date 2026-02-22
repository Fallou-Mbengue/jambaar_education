'use client';

import { useState } from 'react';
import Link from 'next/link';

const SITE_LINKS = [
  { label: 'Plan du site', href: '#' },
  { label: 'Accueil', href: '/' },
  { label: 'Parcours', href: '/parcours' },
  { label: 'Contact', href: '/#contact' },
];

const LEGAL_LINKS = [
  { label: 'Mentions légales', href: '#' },
  { label: 'Conditions Générales d\'Utilisation', href: '#' },
  { label: 'Politique de Confidentialité', href: '#' },
];

export function LandingFooter() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: submit newsletter
    }
  };

  return (
    <footer id="contact" className="bg-[#1E1E1E] text-white pt-16 pb-10">
      <div className="landing-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 items-start">
          {/* Left — Logo + copyright */}
          <div>
            <Link href="/" className="inline-flex items-center gap-0.5 mb-4">
              <span className="text-xl sm:text-2xl font-bold tracking-tight inline-flex items-baseline">
                <span className="text-[#5D2A87]">Jambaar</span>
                <span className="inline-block w-2 h-2 rounded-full bg-landing-orange align-middle ml-0.5" aria-hidden />
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              © 2024 Jambaar. Tous droits réservés.
            </p>
          </div>

          {/* Middle — Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Newsletter</h4>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 h-11 px-4 rounded-lg bg-[#2A2A2A] border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-landing-orange focus:border-transparent"
                aria-label="Adresse e-mail pour la newsletter"
              />
              <button
                type="submit"
                className="h-11 px-6 font-semibold text-white bg-landing-orange hover:bg-landing-orange-hover rounded-lg transition-colors whitespace-nowrap"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>

          {/* Right — Links */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</h4>
              <ul className="space-y-2">
                {SITE_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/80 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Légal</h4>
              <ul className="space-y-2">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/80 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
