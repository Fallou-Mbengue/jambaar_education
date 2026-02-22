'use client';

import Link from 'next/link';
import { Heart, Bookmark, Share2, HelpCircle } from 'lucide-react';

const FREE_PATHS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: 'IMPACTEZ LA COMMUNAUTE MAINTENANT !',
  likes: '1.2k',
  saves: '230',
  shares: '13',
}));

function FreePathCard({
  title,
  likes,
  saves,
  shares,
}: {
  title: string;
  likes: string;
  saves: string;
  shares: string;
}) {
  return (
    <article className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#9333EA] to-landing-orange">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded bg-landing-orange text-white text-xs font-bold">NOUVEAU</span>
        </div>
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#9333EA]/90 flex items-center justify-center">
          <HelpCircle size={18} className="text-white" />
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/80 text-xs font-semibold">Jambaar.</div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-[#1E1E1E] text-sm mb-3 line-clamp-2">{title}</h3>
        <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
          <span className="flex items-center gap-1">
            <Heart size={14} className="text-gray-400" /> {likes}
          </span>
          <span className="flex items-center gap-1">
            <Bookmark size={14} className="text-gray-400" /> {saves}
          </span>
          <span className="flex items-center gap-1">
            <Share2 size={14} className="text-gray-400" /> {shares}
          </span>
        </div>
        <Link
          href="/auth/signup"
          className="mt-auto inline-flex items-center justify-center h-10 w-full text-sm font-semibold text-white bg-[#9333EA] hover:bg-[#7E22CE] rounded-lg transition-colors"
        >
          S&apos;inscrire
        </Link>
      </div>
    </article>
  );
}

export function FreePathsSection() {
  return (
    <section className="py-16 lg:py-20 bg-white landing-section">
      <div className="landing-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1E1E] mb-4">
            Explorer nos parcours gratuits
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Une opportunité unique pour découvrir nos parcours de formation et développer des compétences gratuitement.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {FREE_PATHS.map((p) => (
            <FreePathCard
              key={p.id}
              title={p.title}
              likes={p.likes}
              saves={p.saves}
              shares={p.shares}
            />
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
