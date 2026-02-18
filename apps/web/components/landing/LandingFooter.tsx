'use client';

import Link from 'next/link';

const PRODUCT_LINKS = [
  { label: 'Programmes', href: '#programmes' },
  { label: 'Challenges', href: '#challenges' },
  { label: 'Assistant IA', href: '#assistant' },
  { label: 'Tarifs', href: '#tarifs' },
];

const RESOURCE_LINKS = [
  { label: 'FAQ', href: '#faq' },
  { label: 'Blog', href: '#' },
  { label: 'Aide & Support', href: '#' },
  { label: 'Conditions d\'utilisation', href: '#' },
  { label: 'Politique de confidentialité', href: '#' },
];

export function LandingFooter() {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0A1628] text-white/60 pt-16 pb-8">
      <div className="landing-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-landing-yellow flex items-center justify-center">
                <span className="text-landing-blue font-extrabold text-lg leading-none">J</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Jambaar
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              La plateforme de micro-learning qui développe les soft skills
              des jeunes professionnels africains.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Produit</h4>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Ressources</h4>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Commencer</h4>
            <div className="space-y-3">
              <Link
                href="/auth/signup"
                className="block w-full text-center py-2.5 text-sm font-semibold text-landing-blue bg-landing-yellow hover:bg-yellow-300 rounded-xl transition-colors"
              >
                Créer un compte
              </Link>
              <Link
                href="/auth/login"
                className="block w-full text-center py-2.5 text-sm font-semibold text-white border border-white/20 hover:bg-white/5 rounded-xl transition-colors"
              >
                Se connecter
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-[#FF6B00]/20 flex items-center justify-center">
                <span className="text-[9px] font-bold text-[#FF6B00]">OM</span>
              </div>
              <div className="w-7 h-7 rounded bg-[#1BA2E5]/20 flex items-center justify-center">
                <span className="text-[9px] font-bold text-[#1BA2E5]">W</span>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Jambaar Education. Tous droits réservés.
          </p>
          <p className="text-xs text-white/30">
            Fait avec passion depuis l&apos;Afrique 🌍
          </p>
        </div>
      </div>
    </footer>
  );
}
