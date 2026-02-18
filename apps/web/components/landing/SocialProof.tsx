'use client';

import { Quote, Users, BookOpen, Star, TrendingUp } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';
import clsx from 'clsx';

const TESTIMONIALS = [
  {
    quote: 'Grâce à Jambaar, j\'ai appris à gérer mon temps et à communiquer efficacement. En 3 mois, j\'ai décroché une promotion.',
    name: 'Aminata D.',
    role: 'Chargée de projet, Dakar',
    initials: 'AD',
    color: 'bg-landing-orange/10 text-landing-orange',
  },
  {
    quote: 'Les challenges de 7 jours sont addictifs. J\'ai pris l\'habitude de m\'améliorer chaque jour. Le système de niveaux me motive énormément.',
    name: 'Moussa K.',
    role: 'Développeur, Abidjan',
    initials: 'MK',
    color: 'bg-landing-blue/10 text-landing-blue',
  },
  {
    quote: 'L\'assistant IA est incroyable. Il résume mes cours et me recommande exactement ce dont j\'ai besoin. C\'est comme un coach personnel.',
    name: 'Fatou S.',
    role: 'Étudiante en management, Bamako',
    initials: 'FS',
    color: 'bg-purple-100 text-purple-600',
  },
];

const METRICS = [
  { icon: Users, value: '2 500+', label: 'Apprenants actifs' },
  { icon: BookOpen, value: '15+', label: 'Programmes' },
  { icon: Star, value: '4.8/5', label: 'Satisfaction' },
  { icon: TrendingUp, value: '89%', label: 'Taux de complétion' },
];

export function SocialProof() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-28 bg-gray-50 landing-section" id="temoignages">
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
              Ils progressent avec Jambaar
            </h2>
            <p className="text-lg text-gray-500">
              Des milliers de jeunes professionnels africains font confiance à Jambaar.
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-14">
            {METRICS.map(m => (
              <div key={m.label} className="bg-white rounded-2xl p-5 text-center border border-gray-100">
                <div className="inline-flex w-10 h-10 rounded-xl bg-landing-blue/5 items-center justify-center mb-3">
                  <m.icon size={20} className="text-landing-blue" />
                </div>
                <div className="text-2xl font-bold text-landing-blue">{m.value}</div>
                <div className="text-xs text-gray-400 mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <Quote size={24} className="text-landing-yellow/60 mb-4" />
                <p className="text-gray-600 leading-relaxed mb-6 text-sm lg:text-base">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold', t.color)}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
