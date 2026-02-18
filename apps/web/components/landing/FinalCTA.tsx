'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';
import clsx from 'clsx';

export function FinalCTA() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-28 bg-landing-blue relative overflow-hidden">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(60deg, transparent, transparent 30px, rgba(255,209,0,1) 30px, rgba(255,209,0,1) 31px), repeating-linear-gradient(-60deg, transparent, transparent 30px, rgba(255,209,0,1) 30px, rgba(255,209,0,1) 31px)`,
        }}
        aria-hidden="true"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-landing-blue via-landing-blue-muted to-landing-blue-light opacity-80" aria-hidden="true" />

      <div className="landing-container relative">
        <div
          ref={ref}
          className={clsx(
            'max-w-3xl mx-auto text-center transition-all duration-700 ease-out',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          )}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 mb-6">
            <Sparkles size={14} className="text-landing-yellow" />
            <span className="text-sm font-medium text-white/80">Commence dès maintenant</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Prêt à transformer{' '}
            <span className="text-landing-yellow">ta carrière</span> ?
          </h2>

          <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
            Rejoins des milliers de jeunes professionnels africains qui développent
            leurs soft skills chaque jour avec Jambaar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center h-14 px-8 text-base font-bold text-landing-blue bg-landing-yellow hover:bg-yellow-300 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 gap-2"
            >
              Commencer gratuitement
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-14 px-8 text-base font-semibold text-white border border-white/20 hover:bg-white/10 rounded-xl transition-all"
            >
              Se connecter
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/40">
            Gratuit pour commencer · Paiement Wave &amp; Orange Money · Sans engagement
          </p>
        </div>
      </div>
    </section>
  );
}
