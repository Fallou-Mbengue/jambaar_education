'use client';

import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

const FORMATIONS = [
  {
    title: 'Intégrez à la Communauté "Jambaar" !',
    description: 'Apprenez les compétences clés pour créer une communauté engagée et impactante, développer votre leadership et inspirer le changement positif au sein de votre environnement.',
    tag: 'NOUVEAU',
  },
  {
    title: 'Formation Leadership & Communication',
    description: 'Développez votre capacité à communiquer avec impact et à mener des équipes vers la réussite.',
    tag: 'NOUVEAU',
  },
  {
    title: 'Marketing Digital & Réseaux sociaux',
    description: 'Maîtrisez les outils et stratégies pour promouvoir votre marque et atteindre votre audience.',
    tag: null,
  },
  {
    title: 'Gestion de projet agile',
    description: 'Pilotez vos projets avec les méthodologies agiles et livrez de la valeur en continu.',
    tag: null,
  },
];

function FormationCard({
  title,
  description,
  tag,
}: {
  title: string;
  description: string;
  tag: string | null;
}) {
  return (
    <article className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row">
      <div className="relative w-full sm:w-56 lg:w-64 flex-shrink-0 aspect-[4/5] sm:aspect-auto sm:h-[280px] bg-gradient-to-br from-[#9333EA] to-landing-orange">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          {tag && (
            <span className="px-2.5 py-1 rounded bg-landing-orange text-white text-xs font-bold">
              {tag}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#9333EA]/90 flex items-center justify-center">
          <HelpCircle size={18} className="text-white" />
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-semibold inline-flex items-baseline gap-0.5">
          <span className="text-[#9F7AEA]">Jambaar</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-landing-orange shrink-0" aria-hidden />
        </div>
      </div>
      <div className="flex-1 p-5 lg:p-6 flex flex-col justify-center">
        <h3 className="text-lg font-bold text-[#1E1E1E] mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3 flex-1">
          {description}
        </p>
        <Link
          href="/parcours"
          className="inline-flex items-center justify-center w-full sm:w-auto h-10 px-6 text-sm font-semibold text-white bg-landing-orange hover:bg-landing-orange-hover rounded-lg transition-colors"
        >
          En savoir plus
        </Link>
      </div>
    </article>
  );
}

export function FormationsSection() {
  return (
    <section className="py-16 lg:py-20 bg-white landing-section">
      <div className="landing-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1E1E] mb-4">
            Des formations conçues pour vous guider vers vos objectifs
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Nous vous offrons des formations complètes et personnalisées pour vous aider à atteindre vos ambitions professionnelles.
          </p>
        </div>
        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10">
          {FORMATIONS.map((f) => (
            <FormationCard key={f.title} title={f.title} description={f.description} tag={f.tag} />
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/parcours"
            className="inline-flex items-center justify-center h-12 px-8 text-base font-semibold text-white bg-landing-orange hover:bg-landing-orange-hover rounded-lg transition-colors"
          >
            Toutes les formations
          </Link>
        </div>
      </div>
    </section>
  );
}
