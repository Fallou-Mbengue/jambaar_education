'use client';

import { FileText, Calendar, PlusCircle } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';
import clsx from 'clsx';

const BENEFITS = [
  {
    icon: FileText,
    title: 'Apprentissage agile',
    description: 'Une approche flexible qui s\'adapte à votre rythme et à vos objectifs pour des résultats concrets.',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
  },
  {
    icon: Calendar,
    title: 'Progression continue',
    description: 'Suivez votre avancement et validez vos compétences étape par étape avec un accompagnement dédié.',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
  },
  {
    icon: PlusCircle,
    title: 'Coaching personnalisé',
    description: 'Bénéficiez d\'un suivi sur mesure avec des experts pour maximiser votre développement.',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
  },
];

export function WhyJambaar() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-16 lg:py-20 bg-white landing-section" id="pourquoi">
      <div className="landing-container">
        <div
          ref={ref}
          className={clsx(
            'transition-all duration-700 ease-out',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          )}
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1E1E] mb-4">
              Pourquoi choisir Jambaar
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              Nous proposons une approche d&apos;apprentissage unique et innovante, axée sur la pratique et l&apos;interactivité.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {BENEFITS.map((benefit, i) => (
              <div
                key={benefit.title}
                className="bg-gray-50/80 border border-gray-100 rounded-xl p-6 lg:p-8 hover:shadow-md transition-shadow"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center mb-5', benefit.bg)}>
                  <benefit.icon size={24} className={benefit.color} />
                </div>
                <h3 className="text-lg font-bold text-[#1E1E1E] mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
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
