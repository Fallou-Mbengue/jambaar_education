'use client';

import {
  Play, Heart, Bookmark, ChevronRight, Sparkles,
  Trophy, Flame, CheckCircle2, Lock, MessageCircle,
  Send, Star, ArrowRight, BarChart3, Clock
} from 'lucide-react';
import { useScrollReveal } from './useScrollReveal';
import clsx from 'clsx';

/* ────── Feed immersif mock ────── */
function FeedMock() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,28,74,0.1)] border border-gray-100 overflow-hidden">
      <div className="p-3 border-b border-gray-50 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
        </div>
        <div className="h-4 flex-1 bg-gray-50 rounded mx-6" />
      </div>
      <div className="p-4 space-y-3">
        {/* Card 1 - video */}
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="h-28 bg-gradient-to-br from-landing-blue via-landing-blue-muted to-landing-blue-light relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Play size={18} className="text-white ml-0.5" />
            </div>
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-landing-orange text-[8px] font-bold text-white">
              VIDEO
            </div>
            <div className="absolute bottom-2 right-2 text-[9px] text-white/70">3:24</div>
          </div>
          <div className="p-3">
            <div className="text-xs font-semibold text-gray-800 mb-1">Maîtriser l&apos;art du feedback</div>
            <div className="text-[10px] text-gray-400 mb-2">Programme Leadership</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Flame size={10} className="text-landing-orange" />
                <span className="text-[9px] text-gray-500">+50 XP</span>
              </div>
              <div className="flex gap-2">
                <Heart size={12} className="text-gray-300" />
                <Bookmark size={12} className="text-gray-300" />
              </div>
            </div>
          </div>
        </div>
        {/* Card 2 - article */}
        <div className="rounded-xl border border-gray-100 p-3">
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-100 to-pink-50 flex-shrink-0 flex items-center justify-center">
              <BarChart3 size={20} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="px-1.5 py-0.5 rounded bg-purple-50 text-[8px] font-semibold text-purple-600 inline-block mb-1">ARTICLE</div>
              <div className="text-xs font-semibold text-gray-800">5 techniques de négociation</div>
              <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                <Clock size={8} /> 4 min
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────── Cours Netflix mock ────── */
function NetflixMock() {
  const courses = [
    { title: 'Leadership', progress: 65, color: 'from-landing-orange to-landing-yellow' },
    { title: 'Communication', progress: 30, color: 'from-blue-500 to-cyan-400' },
    { title: 'Négociation', progress: 0, color: 'from-purple-500 to-pink-400' },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,28,74,0.1)] border border-gray-100 overflow-hidden">
      <div className="p-3 border-b border-gray-50 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs font-bold text-gray-800 mb-3">Mes Programmes</div>
        <div className="space-y-2.5">
          {courses.map(c => (
            <div key={c.title} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
              <div className={clsx('w-12 h-12 rounded-lg bg-gradient-to-br flex-shrink-0 flex items-center justify-center', c.color)}>
                <Star size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800">{c.title}</div>
                {c.progress > 0 ? (
                  <div className="mt-1.5">
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full bg-gradient-to-r', c.color)}
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-gray-400 mt-0.5">{c.progress}% terminé</div>
                  </div>
                ) : (
                  <div className="text-[9px] text-landing-orange font-medium mt-1">Commencer</div>
                )}
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────── Challenges mock ────── */
function ChallengeMock() {
  const days = [
    { day: 1, done: true },
    { day: 2, done: true },
    { day: 3, done: true },
    { day: 4, current: true },
    { day: 5, locked: true },
    { day: 6, locked: true },
    { day: 7, locked: true },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,28,74,0.1)] border border-gray-100 overflow-hidden">
      <div className="p-3 border-b border-gray-50 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
        </div>
      </div>
      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-br from-landing-blue to-landing-blue-light p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={14} className="text-landing-yellow" />
            <span className="text-xs font-bold text-white">Challenge Confiance en soi</span>
          </div>
          <div className="text-[10px] text-white/60">7 jours pour transformer tes habitudes</div>
        </div>
        <div className="flex justify-between px-1">
          {days.map(d => (
            <div key={d.day} className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2',
                  d.done && 'bg-landing-green border-landing-green text-white',
                  d.current && 'bg-white border-landing-orange text-landing-orange',
                  d.locked && 'bg-gray-50 border-gray-200 text-gray-300',
                )}
              >
                {d.done ? <CheckCircle2 size={14} /> : d.locked ? <Lock size={10} /> : d.day}
              </div>
              <span className="text-[8px] text-gray-400">J{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────── Assistant IA mock ────── */
function AssistantMock() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,28,74,0.1)] border border-gray-100 overflow-hidden">
      <div className="p-3 border-b border-gray-50 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
        </div>
        <span className="text-[10px] font-semibold text-gray-500 ml-2">Assistant IA</span>
      </div>
      <div className="p-4 space-y-3">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[75%] bg-landing-blue rounded-2xl rounded-tr-md px-3 py-2">
            <p className="text-[11px] text-white leading-relaxed">
              Comment améliorer mon leadership au quotidien ?
            </p>
          </div>
        </div>
        {/* AI response */}
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-landing-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={12} className="text-landing-orange" />
          </div>
          <div className="max-w-[80%] bg-gray-50 rounded-2xl rounded-tl-md px-3 py-2">
            <p className="text-[11px] text-gray-700 leading-relaxed">
              Voici 3 actions concrètes :<br />
              <strong>1.</strong> Pratique l&apos;écoute active<br />
              <strong>2.</strong> Donne du feedback régulier<br />
              <strong>3.</strong> Délègue avec confiance
            </p>
          </div>
        </div>
        {/* Input */}
        <div className="flex gap-2 items-center border border-gray-100 rounded-xl px-3 py-2 bg-gray-50/50">
          <MessageCircle size={14} className="text-gray-300" />
          <span className="text-[10px] text-gray-300 flex-1">Pose ta question…</span>
          <Send size={14} className="text-landing-orange" />
        </div>
      </div>
    </div>
  );
}

/* ────── Showcase blocks ────── */
const BLOCKS = [
  {
    id: 'feed',
    sectionId: 'produit',
    title: 'Un feed immersif',
    subtitle: 'Ton contenu, personnalisé',
    description: 'Découvre chaque jour du contenu adapté à tes objectifs. Swipe, like, sauvegarde — le meilleur du micro-learning à portée de scroll.',
    bullets: [
      'Contenu personnalisé par l\'IA',
      'Vidéos, articles et quiz en 5 min',
      'Like et sauvegarde tes favoris',
    ],
    Mock: FeedMock,
  },
  {
    id: 'programmes',
    sectionId: 'programmes',
    title: 'Des cours type Netflix',
    subtitle: 'Programmes structurés',
    description: 'Des programmes complets avec modules progressifs. Avance à ton rythme, suis ta progression, et ne perds jamais le fil.',
    bullets: [
      'Modules débloqués progressivement',
      'Barre de progression par programme',
      'Contenus premium haute qualité',
    ],
    Mock: NetflixMock,
  },
  {
    id: 'challenges',
    sectionId: 'challenges',
    title: 'Challenges de 7 jours',
    subtitle: 'Action quotidienne',
    description: 'Des défis courts et concrets pour ancrer de nouvelles habitudes. Chaque jour validé te rapproche de la maîtrise.',
    bullets: [
      'Un objectif clair chaque jour',
      'Validation + réflexion quotidienne',
      'Récompenses XP et badges à la clé',
    ],
    Mock: ChallengeMock,
  },
  {
    id: 'assistant',
    sectionId: 'assistant',
    title: 'Un assistant IA personnel',
    subtitle: 'Toujours disponible',
    description: 'Pose n\'importe quelle question sur les soft skills. L\'IA résume tes cours, recommande du contenu et t\'accompagne.',
    bullets: [
      'Résumés IA de tes contenus',
      'Recommandations personnalisées',
      'Réponses instantanées 24/7',
    ],
    Mock: AssistantMock,
  },
];

function ShowcaseBlock({ block, reversed }: { block: typeof BLOCKS[number]; reversed: boolean }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      id={block.sectionId}
      className={clsx(
        'landing-section grid lg:grid-cols-2 gap-10 lg:gap-16 items-center',
        'transition-all duration-700 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      )}
    >
      {/* Text */}
      <div className={clsx(reversed && 'lg:order-2')}>
        <div className="inline-block px-3 py-1 rounded-full bg-landing-blue/5 text-xs font-medium text-landing-blue mb-4">
          {block.subtitle}
        </div>
        <h3 className="text-2xl lg:text-3xl font-extrabold text-landing-blue mb-4">
          {block.title}
        </h3>
        <p className="text-gray-500 leading-relaxed mb-6">
          {block.description}
        </p>
        <ul className="space-y-3">
          {block.bullets.map(b => (
            <li key={b} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-landing-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={12} className="text-landing-green" />
              </div>
              <span className="text-sm text-gray-600">{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <a
            href={`/${block.id === 'feed' ? 'home' : block.id === 'assistant' ? 'assistant' : block.sectionId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-landing-orange hover:text-landing-orange-hover transition-colors group"
          >
            Découvrir
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Mock */}
      <div className={clsx(reversed && 'lg:order-1', 'max-w-md mx-auto lg:mx-0 w-full')}>
        <block.Mock />
      </div>
    </div>
  );
}

export function ShowcaseProduct() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="landing-container space-y-20 lg:space-y-28">
        {BLOCKS.map((block, i) => (
          <ShowcaseBlock key={block.id} block={block} reversed={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
