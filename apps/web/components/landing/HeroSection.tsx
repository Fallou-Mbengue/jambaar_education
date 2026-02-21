'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-[72px] bg-[#1E1E1E] overflow-hidden">
      <div className="landing-container w-full py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — Text */}
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-white leading-[1.15] tracking-tight mb-6">
              Les Compétences de Domain, Accessibles Aujourd&apos;hui !
            </h1>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8">
              Découvrez une approche unique de l&apos;apprentissage pour développer vos compétences et accélérer votre carrière professionnelle.
            </p>
            <Link
              href="#parcours"
              className="inline-flex items-center justify-center h-12 px-8 text-base font-semibold text-white bg-landing-orange hover:bg-landing-orange-hover rounded-lg transition-colors shadow-lg"
            >
              Explorer nos parcours
            </Link>
          </div>

          {/* Right — Video placeholder */}
          <div className="relative w-full aspect-video max-w-[560px] mx-auto lg:mx-0 lg:ml-auto bg-[#2A2A2A] rounded-xl flex items-center justify-center border border-white/5 overflow-hidden">
            <button
              type="button"
              className="w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors group"
              aria-label="Lire la vidéo"
            >
              <Play size={36} className="text-white ml-1 fill-white" />
            </button>
            <span className="absolute bottom-3 right-3 text-xs text-white/50 font-medium">b</span>
          </div>
        </div>
      </div>
    </section>
  );
}
