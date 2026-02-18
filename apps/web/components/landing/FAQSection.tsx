'use client';

import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';
import clsx from 'clsx';

const FAQ_ITEMS = [
  {
    question: 'Jambaar est-il vraiment gratuit pour commencer ?',
    answer:
      'Oui ! Tu peux créer ton compte gratuitement et accéder à du contenu de découverte. Pour débloquer tous les programmes, les challenges et l\'assistant IA, un abonnement est disponible à partir de 990 FCFA/semaine.',
  },
  {
    question: 'Comment fonctionne le paiement ?',
    answer:
      'Nous acceptons Wave et Orange Money pour que ce soit simple et accessible. Tu choisis ton plan (hebdo, mensuel ou trimestriel), tu payes via mobile money, et ton accès est activé instantanément. Pas de carte bancaire nécessaire.',
  },
  {
    question: 'Combien de temps prend un cours ?',
    answer:
      'Chaque contenu est conçu pour être consommé en 5 minutes maximum. Vidéos courtes, articles concis, mini-quiz. L\'objectif : apprendre sans bouleverser ton emploi du temps.',
  },
  {
    question: 'C\'est quoi un challenge de 7 jours ?',
    answer:
      'C\'est un programme court et intensif sur 7 jours. Chaque jour, tu as un objectif concret à atteindre (exercice, réflexion, action). À la fin, tu gagnes de l\'XP, un badge, et surtout une nouvelle habitude.',
  },
  {
    question: 'L\'assistant IA remplace-t-il un vrai coach ?',
    answer:
      'L\'assistant IA est un complément, pas un remplacement. Il résume tes cours, répond à tes questions sur les soft skills, et te recommande du contenu personnalisé. C\'est disponible 24/7 et inclus dans ton abonnement.',
  },
  {
    question: 'Puis-je utiliser Jambaar sur ordinateur et téléphone ?',
    answer:
      'Absolument ! Jambaar est conçu pour fonctionner parfaitement sur ordinateur (interface premium) et sur mobile (expérience optimisée). Ton progrès est synchronisé entre tous tes appareils.',
  },
  {
    question: 'Comment fonctionne le système de niveaux ?',
    answer:
      'Chaque action (visionner un cours, compléter un quiz, valider un jour de challenge) te rapporte de l\'XP. Tu progresses du niveau Starter au GOAT en passant par Warrior et Lion. Chaque niveau débloque des récompenses.',
  },
  {
    question: 'Puis-je annuler mon abonnement ?',
    answer:
      'Oui, tu peux annuler à tout moment sans frais. Ton accès reste actif jusqu\'à la fin de la période payée. Pas de piège, pas de frais cachés.',
  },
];

function FAQItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: typeof FAQ_ITEMS[number];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
        id={`faq-trigger-${index}`}
      >
        <span className="text-base lg:text-lg font-semibold text-landing-blue pr-4 group-hover:text-landing-blue/80 transition-colors">
          {item.question}
        </span>
        <ChevronDown
          size={20}
          className={clsx(
            'flex-shrink-0 text-gray-400 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        id={`faq-panel-${index}`}
        role="region"
        aria-labelledby={`faq-trigger-${index}`}
        className={clsx(
          'overflow-hidden transition-all duration-300 ease-out',
          isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'
        )}
      >
        <p className="text-gray-500 leading-relaxed pr-10">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { ref, isVisible } = useScrollReveal();

  const handleToggle = useCallback((index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-white landing-section" id="faq">
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
              Questions fréquentes
            </h2>
            <p className="text-lg text-gray-500">
              Tout ce que tu dois savoir avant de commencer.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 px-6 lg:px-8">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => handleToggle(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
