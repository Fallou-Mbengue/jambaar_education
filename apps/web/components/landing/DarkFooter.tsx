'use client';

import { useState } from 'react';
import Link from 'next/link';

export function DarkFooter() {
  const [email, setEmail] = useState('');
  const submit = (e: React.FormEvent) => { e.preventDefault(); };

  return (
    <footer className="bg-[#181818] text-white pt-20 pb-0">
      <div className="landing-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 items-start">
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block">
              <span className="text-[28px] sm:text-[32px] font-bold tracking-tight text-white">
                <span className="text-[#9333EA] text-[1.15em]">J</span>ambaar
                <span className="text-landing-orange">.</span>
              </span>
            </Link>
            <p className="text-[18px] leading-[22px] text-white/85">
              L&apos;Excellence à l&apos;Africaine
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2.5">
            <h4 className="text-base font-bold text-[#F2F0F5] leading-6">Communauté</h4>
            <p className="text-base text-white/85 leading-6">Rejoignez nos Jambaars</p>
            <a href="#" className="text-base text-[#397B21] font-semibold leading-6 hover:underline">
              Je rejoins la communauté WhatsApp
            </a>
            <p className="text-base text-[#F2F0F5] leading-6 mt-1">
              Soyez les premiers à être informés des nouveautés
            </p>
            <form onSubmit={submit} className="flex overflow-hidden rounded-md">
              <input
                type="email"
                placeholder="votre adresse email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 h-10 px-3 bg-[#2A2A2A] border border-white/10 rounded-l-md text-white text-base placeholder:text-gray-400 focus:outline-none focus:border-landing-orange"
              />
              <button
                type="submit"
                className="h-10 px-3.5 bg-landing-orange hover:bg-landing-orange-hover border border-landing-orange text-[#212529] text-base font-semibold whitespace-nowrap transition-colors"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-2 pt-2.5">
            <h4 className="text-base font-bold text-[#F2F0F5] leading-6">Contact</h4>
            <a href="mailto:contact@jambaar.io" className="text-[18px] text-white/85 leading-[22px] hover:text-white">
              contact@jambaar.io
            </a>
            <a href="#" className="text-base text-landing-orange font-semibold underline leading-6 hover:no-underline">
              Devenir formateur
            </a>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 h-[60px] mt-6 text-base text-white/70">
          <span>© 2025 Jambaar</span>
          <span>|</span>
          <span>Tous droits réservés!</span>
        </div>
      </div>
    </footer>
  );
}
