'use client';

import { HelpCircle } from 'lucide-react';

const COACHES = [
  { name: 'Awa Diop', role: 'Coach et Expert en Développement de Carrière' },
  { name: 'Maimouna Ndiaye', role: 'Experte en Leadership et Communication' },
  { name: 'Dr. Aida Sy', role: 'Coach Stratégie et Management' },
  { name: 'Prof. Khadija Diallo', role: 'Experte en Transformation Digitale' },
];

function CoachCard({ name, role }: { name: string; role: string }) {
  return (
    <article className="rounded-xl overflow-hidden bg-white/5 border border-white/10 flex flex-col">
      <div className="relative aspect-[3/4] min-h-[240px] bg-gradient-to-br from-[#3B82F6] via-[#9333EA] to-landing-orange">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 text-white/90 text-sm font-semibold">Jambaar.</div>
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#9333EA]/90 flex items-center justify-center">
          <HelpCircle size={18} className="text-white" />
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded bg-landing-orange text-white text-xs font-bold">NOUVEAU</span>
        </div>
      </div>
      <div className="p-4 flex-1">
        <h3 className="font-bold text-white text-lg">{name}</h3>
        <p className="text-sm text-white/80 mt-1">{role}</p>
      </div>
    </article>
  );
}

export function CoachesSection() {
  return (
    <section className="py-16 lg:py-20 landing-section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] via-[#5B21B6] to-[#7C3AED]" />
      <div className="landing-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-2">
            Apprenez auprès de grands{' '}
            <span className="text-landing-orange">Coaches et Experts</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COACHES.map((c) => (
            <CoachCard key={c.name} name={c.name} role={c.role} />
          ))}
        </div>
      </div>
    </section>
  );
}
