'use client';

import Link from 'next/link';
import { Play, Sparkles, Trophy, Flame, Star, TrendingUp, BookOpen } from 'lucide-react';

function MockAppUI() {
  return (
    <div className="relative w-full max-w-[540px] mx-auto">
      {/* Desktop frame */}
      <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,28,74,0.15)] border border-gray-200/60 overflow-hidden">
        {/* Topbar mock */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 h-6 bg-gray-100 rounded-md mx-8" />
        </div>

        {/* Content area */}
        <div className="flex">
          {/* Mini sidebar */}
          <div className="hidden sm:flex flex-col w-14 bg-gray-50 border-r border-gray-100 py-4 gap-4 items-center">
            <div className="w-7 h-7 rounded-lg bg-landing-blue flex items-center justify-center">
              <span className="text-landing-yellow text-xs font-bold">J</span>
            </div>
            <div className="w-6 h-6 rounded bg-landing-orange/20" />
            <div className="w-6 h-6 rounded bg-gray-200" />
            <div className="w-6 h-6 rounded bg-gray-200" />
            <div className="w-6 h-6 rounded bg-gray-200" />
          </div>

          {/* Feed area */}
          <div className="flex-1 p-4 space-y-3">
            {/* Feed card 1 */}
            <div className="rounded-xl bg-gradient-to-br from-landing-blue to-landing-blue-light p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-landing-yellow/30" />
                <div className="h-2.5 w-20 bg-white/20 rounded" />
              </div>
              <div className="h-2 w-3/4 bg-white/15 rounded mb-1.5" />
              <div className="h-2 w-1/2 bg-white/10 rounded mb-3" />
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 rounded bg-landing-orange/80 text-[9px] font-semibold text-white">
                  VIDEO
                </div>
                <div className="flex items-center gap-1">
                  <Flame size={10} className="text-landing-yellow" />
                  <span className="text-[9px] text-white/60">+50 XP</span>
                </div>
              </div>
            </div>

            {/* Feed card 2 */}
            <div className="rounded-xl bg-white border border-gray-100 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-landing-orange/20" />
                <div className="h-2.5 w-24 bg-gray-200 rounded" />
              </div>
              <div className="h-2 w-full bg-gray-100 rounded mb-1.5" />
              <div className="h-2 w-2/3 bg-gray-100 rounded mb-3" />
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 rounded bg-landing-green/20 text-[9px] font-semibold text-landing-green">
                  CHALLENGE
                </div>
                <div className="flex items-center gap-1">
                  <Trophy size={10} className="text-landing-yellow" />
                  <span className="text-[9px] text-gray-400">Jour 3/7</span>
                </div>
              </div>
            </div>

            {/* Feed card 3 */}
            <div className="rounded-xl bg-white border border-gray-100 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-purple-100" />
                <div className="h-2.5 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-2 w-5/6 bg-gray-100 rounded mb-1.5" />
              <div className="h-2 w-1/2 bg-gray-100 rounded" />
            </div>
          </div>

          {/* Right panel mini */}
          <div className="hidden md:flex flex-col w-36 bg-gray-50/50 border-l border-gray-100 p-3 gap-3">
            <div className="rounded-lg bg-gradient-to-br from-landing-orange/10 to-landing-yellow/10 p-2.5">
              <div className="flex items-center gap-1.5 mb-2">
                <Flame size={12} className="text-landing-orange" />
                <span className="text-[10px] font-semibold text-gray-700">Streak</span>
              </div>
              <div className="text-lg font-bold text-landing-orange leading-none">12j</div>
            </div>
            <div className="rounded-lg bg-white border border-gray-100 p-2.5">
              <div className="flex items-center gap-1.5 mb-2">
                <Star size={12} className="text-landing-yellow" />
                <span className="text-[10px] font-semibold text-gray-700">Niveau</span>
              </div>
              <div className="text-[10px] font-bold text-landing-blue">Warrior</div>
              <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-landing-orange to-landing-yellow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-3 -right-3 lg:-right-6 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2 animate-float">
        <div className="w-7 h-7 rounded-lg bg-landing-green/10 flex items-center justify-center">
          <TrendingUp size={14} className="text-landing-green" />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-gray-700">+250 XP</div>
          <div className="text-[9px] text-gray-400">aujourd&apos;hui</div>
        </div>
      </div>

      <div className="absolute -bottom-2 -left-3 lg:-left-6 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2 animate-float-delayed">
        <div className="w-7 h-7 rounded-lg bg-landing-yellow/10 flex items-center justify-center">
          <Sparkles size={14} className="text-landing-orange" />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-gray-700">IA Résumé</div>
          <div className="text-[9px] text-gray-400">prêt</div>
        </div>
      </div>

      <div className="hidden lg:flex absolute top-1/2 -right-10 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 items-center gap-2 animate-float">
        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
          <BookOpen size={14} className="text-purple-500" />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-gray-700">3 modules</div>
          <div className="text-[9px] text-gray-400">terminés</div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const handleDemoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.querySelector('#produit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-[72px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 landing-pattern" />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-gray-50/80" />

      <div className="relative landing-container w-full py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-landing-blue/5 border border-landing-blue/10 mb-6 opacity-0 animate-fade-up">
              <Sparkles size={14} className="text-landing-orange" />
              <span className="text-xs font-medium text-landing-blue">
                Plateforme n°1 de soft skills en Afrique
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-landing-blue leading-[1.08] tracking-tight mb-6 opacity-0 animate-fade-up-delay-1">
              Les soft skills qui{' '}
              <span className="relative inline-block">
                ouvrent les portes
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none" aria-hidden="true">
                  <path d="M2 8 C60 2, 120 2, 150 6 S240 12, 298 4" stroke="#FFD100" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-md opacity-0 animate-fade-up-delay-2">
              Micro-learning en <strong className="text-gray-800">5 min/jour</strong>,
              assisté par l&apos;IA, avec des challenges de 7 jours pour construire
              de vraies habitudes professionnelles.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8 opacity-0 animate-fade-up-delay-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center h-12 px-7 text-base font-semibold text-white bg-landing-orange hover:bg-landing-orange-hover rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Commencer gratuitement
              </Link>
              <a
                href="#produit"
                onClick={handleDemoClick}
                className="inline-flex items-center justify-center h-12 px-6 text-base font-semibold text-landing-blue bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all gap-2"
              >
                <Play size={16} className="text-landing-orange" />
                Voir une démo
              </a>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 opacity-0 animate-fade-up-delay-3">
              <span className="flex items-center gap-1.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="#28A745" strokeWidth="2" />
                  <path d="m8 12 3 3 5-6" stroke="#28A745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Gratuit pour commencer
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="#28A745" strokeWidth="2" />
                  <path d="m8 12 3 3 5-6" stroke="#28A745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Paiement Wave &amp; Orange Money
              </span>
            </div>
          </div>

          {/* Right — Mock UI */}
          <div className="relative hidden md:block">
            <MockAppUI />
          </div>
        </div>
      </div>
    </section>
  );
}
