'use client';

import { Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';
import clsx from 'clsx';

const BENEFITS = [
  {
    icon: Zap,
    title: 'Apprends vite',
    description:
      'Des contenus de 5 minutes pensés pour ton emploi du temps. Vidéos, articles, micro-quiz — apprends partout, tout le temps.',
    color: 'text-landing-orange',
    bg: 'bg-landing-orange/10',
  },
  {
    icon: TrendingUp,
    title: 'Progresse chaque jour',
    description:
      'Challenges de 7 jours, streaks, XP et niveaux. Chaque action te fait avancer. La régularité est récompensée.',
    color: 'text-landing-green',
    bg: 'bg-landing-green/10',
  },
  {
    icon: Sparkles,
    title: 'Guidé par l\'IA',
    description:
      'Un assistant IA qui résume tes cours, te recommande du contenu personnalisé et répond à tes questions.',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
];

export function WhyJambaar() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-28 bg-white landing-section" id="pourquoi">
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
              Pourquoi Jambaar ?
            </h2>
            <p className="text-lg text-gray-500">
              Une plateforme conçue pour les jeunes professionnels africains
              qui veulent se démarquer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {BENEFITS.map((benefit, i) => (
              <div
                key={benefit.title}
                className="group relative bg-white border border-gray-100 rounded-2xl p-8 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center mb-5', benefit.bg)}>
                  <benefit.icon size={24} className={benefit.color} />
                </div>
                <h3 className="text-xl font-bold text-landing-blue mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
