'use client';

import { UserPlus, BookOpen, Timer, Award } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';
import clsx from 'clsx';

const STEPS = [
  {
    icon: UserPlus,
    title: 'Inscris-toi',
    description: 'Crée ton compte en 30 secondes. C\'est gratuit.',
  },
  {
    icon: BookOpen,
    title: 'Choisis ton programme',
    description: 'Leadership, communication, gestion du temps… à toi de choisir.',
  },
  {
    icon: Timer,
    title: 'Apprends en 5 min/jour',
    description: 'Vidéos courtes, articles, quiz. Apprends à ton rythme.',
  },
  {
    icon: Award,
    title: 'Gagne des récompenses',
    description: 'XP, badges, niveaux. Chaque effort compte et se voit.',
  },
];

export function HowItWorks() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-28 bg-gray-50 landing-section" id="comment">
      <div className="landing-container">
        <div
          ref={ref}
          className={clsx(
            'transition-all duration-700 ease-out',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          )}
        >
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-landing-blue mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-500">
              De l&apos;inscription à ta première récompense en 4 étapes simples.
            </p>
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="hidden md:grid md:grid-cols-4 gap-0 relative">
            {/* Connector line */}
            <div className="absolute top-[28px] left-[12.5%] right-[12.5%] h-0.5 bg-gray-200" aria-hidden="true" />

            {STEPS.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center px-4">
                {/* Step circle */}
                <div className="relative z-10 w-14 h-14 rounded-full bg-white border-2 border-landing-blue flex items-center justify-center mb-5 shadow-sm">
                  <step.icon size={22} className="text-landing-blue" />
                </div>
                {/* Step number */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 w-6 h-6 rounded-full bg-landing-orange text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-landing-blue mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Mobile: vertical timeline */}
          <div className="md:hidden space-y-0 relative pl-8">
            {/* Vertical connector */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200" aria-hidden="true" />

            {STEPS.map((step, i) => (
              <div key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
                {/* Circle */}
                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-landing-blue flex items-center justify-center shadow-sm -ml-8">
                  <span className="text-sm font-bold text-landing-orange">{i + 1}</span>
                </div>
                <div className="pt-1">
                  <h3 className="text-base font-bold text-landing-blue mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
