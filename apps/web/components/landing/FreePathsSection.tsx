'use client';

import Link from 'next/link';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PublicProgram {
  id: string;
  title: string;
  description: string | null;
  isPremium: boolean;
  durationDays: number | null;
  tags: string[];
  thumbnailUrl: string | null;
  _count: { modules: number };
}

function FreePathCard({ program }: { program: PublicProgram }) {
  const category = program.tags[0] || 'Formation';

  return (
    <article className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#5D2A87] to-[#FF7A00]">
        {program.thumbnailUrl ? (
          <img
            src={program.thumbnailUrl}
            alt={program.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/20 text-6xl font-bold">
              {program.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded bg-[#FF7A00] text-white text-xs font-bold uppercase">
            {category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded bg-green-500 text-white text-xs font-bold">
            GRATUIT
          </span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-[#1E1E1E] text-sm mb-2 line-clamp-2 group-hover:text-[#5D2A87] transition-colors">
          {program.title}
        </h3>
        {program.description && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-2">{program.description}</p>
        )}
        <div className="flex items-center gap-4 text-gray-400 text-xs mb-4 mt-auto">
          <span className="flex items-center gap-1">
            <BookOpen size={14} />
            {program._count.modules} module{program._count.modules > 1 ? 's' : ''}
          </span>
          {program.durationDays && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {program.durationDays}j
            </span>
          )}
        </div>
        <Link
          href={`/parcours/${program.id}`}
          className="inline-flex items-center justify-center gap-2 h-10 w-full text-sm font-semibold text-white bg-[#5D2A87] hover:bg-[#4A1F6E] rounded-lg transition-colors"
        >
          Découvrir
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

function FreePathCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-10 bg-gray-200 rounded-lg mt-4" />
      </div>
    </div>
  );
}

export function FreePathsSection() {
  const [programs, setPrograms] = useState<PublicProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch('/api/v1/programs/public');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        const all: PublicProgram[] = json.data ?? [];
        const freePrograms = all.filter((p) => !p.isPremium);
        setPrograms(freePrograms.slice(0, 8));
      } catch {
        setPrograms([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  if (!isLoading && programs.length === 0) return null;

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
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <FreePathCardSkeleton key={i} />)
            : programs.map((p) => <FreePathCard key={p.id} program={p} />)}
        </div>
        <div className="text-center">
          <Link
            href="/parcours"
            className="inline-flex items-center justify-center h-12 px-8 text-base font-semibold text-white bg-[#FF7A00] hover:bg-[#E86E00] rounded-lg transition-colors"
          >
            Toutes les formations
          </Link>
        </div>
      </div>
    </section>
  );
}
