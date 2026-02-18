'use client';

import Link from 'next/link';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';
import clsx from 'clsx';

const PLANS = [
  {
    name: 'Hebdo',
    price: '990',
    period: '/ semaine',
    icon: Zap,
    description: 'Idéal pour tester la plateforme',
    popular: false,
    bestValue: false,
    features: [
      'Accès à tous les contenus',
      'Feed personnalisé',
      'Challenges 7 jours',
      'Progression & gamification',
    ],
    cta: 'Choisir Hebdo',
  },
  {
    name: 'Mensuel',
    price: '2 990',
    period: '/ mois',
    icon: Star,
    description: 'Le plus populaire — rapport qualité-prix optimal',
    popular: true,
    bestValue: false,
    features: [
      'Tout du plan Hebdo',
      'Assistant IA illimité',
      'Résumés IA des cours',
      'Badges et certificats',
      'Contenu premium exclusif',
    ],
    cta: 'Choisir Mensuel',
  },
  {
    name: 'Trimestriel',
    price: '6 990',
    period: '/ 3 mois',
    icon: Crown,
    description: 'Le meilleur rapport — économise 22%',
    popular: false,
    bestValue: true,
    features: [
      'Tout du plan Mensuel',
      'Assistant IA prioritaire',
      'Accès anticipé nouveautés',
      'Support prioritaire',
      'Certificats téléchargeables',
      'Économise 2 970 FCFA',
    ],
    cta: 'Choisir Trimestriel',
  },
];

export function PricingSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-28 bg-white landing-section" id="tarifs">
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
              Des tarifs pensés pour l&apos;Afrique
            </h2>
            <p className="text-lg text-gray-500">
              Pas d&apos;engagement. Annule quand tu veux. Paye simplement avec Wave ou Orange Money.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={clsx(
                  'relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-lg',
                  plan.popular
                    ? 'border-landing-orange shadow-[0_8px_30px_rgba(255,122,0,0.12)] scale-[1.02] lg:scale-105'
                    : 'border-gray-100 hover:border-gray-200'
                )}
              >
                {/* Badges */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-landing-orange text-white text-xs font-bold shadow-sm">
                    Populaire
                  </div>
                )}
                {plan.bestValue && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-landing-green text-white text-xs font-bold shadow-sm">
                    Meilleur rapport
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    plan.popular ? 'bg-landing-orange/10' : 'bg-gray-50'
                  )}>
                    <plan.icon size={20} className={plan.popular ? 'text-landing-orange' : 'text-gray-500'} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-landing-blue">{plan.name}</div>
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-3xl lg:text-4xl font-extrabold text-landing-blue">{plan.price}</span>
                  <span className="text-sm text-gray-400 ml-1">FCFA{plan.period}</span>
                </div>

                <p className="text-sm text-gray-500 mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={16} className={clsx('flex-shrink-0 mt-0.5', plan.popular ? 'text-landing-orange' : 'text-landing-green')} />
                      <span className="text-sm text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/signup"
                  className={clsx(
                    'block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all',
                    plan.popular
                      ? 'bg-landing-orange hover:bg-landing-orange-hover text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100 text-landing-blue border border-gray-200'
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Mobile Money trust */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                <span className="text-xs font-bold text-[#FF6B00]">OM</span>
              </div>
              <span>Orange Money</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1BA2E5]/10 flex items-center justify-center">
                <span className="text-xs font-bold text-[#1BA2E5]">W</span>
              </div>
              <span>Wave</span>
            </div>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs">Paiement sécurisé · Sans engagement</span>
          </div>
        </div>
      </div>
    </section>
  );
}
