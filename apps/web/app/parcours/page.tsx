'use client';

import { useState, useMemo, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, ArrowRight, BookOpen } from 'lucide-react';
import { LandingHeader, LandingFooter } from '@/components/landing';
import apiClient from '@/lib/api/client';
import clsx from 'clsx';

interface Program {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  durationDays?: number;
  tags: string[];
  status: string;
  _count: { modules: number };
}

type FilterTab = 'all' | 'paid' | 'free';

const ITEMS_PER_PAGE = 12;

function ParcoursContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter');

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>(
    initialFilter === 'free' ? 'free' : initialFilter === 'paid' ? 'paid' : 'all',
  );
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const { data, isLoading } = useQuery({
    queryKey: ['programs-public'],
    queryFn: async () => {
      const res = await apiClient.get('/programs/public');
      return (res.data?.data ?? res.data) as Program[];
    },
  });

  const filtered = useMemo(() => {
    let list = data ?? [];

    if (activeTab === 'paid') list = list.filter((p) => p.isPremium);
    if (activeTab === 'free') list = list.filter((p) => !p.isPremium);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [data, activeTab, search]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <div className="landing-page bg-[#1E1E1E] min-h-screen flex flex-col">
      <LandingHeader />

      <main className="flex-1 pt-[72px]">
        {/* Hero */}
        <section className="bg-[#1E1E1E] pt-10 pb-6 sm:pt-14 sm:pb-8 lg:pt-16 lg:pb-10">
          <div className="landing-container">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-white leading-tight tracking-tight mb-4">
              Votre Avenir Commence Ici !
            </h1>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-xl">
              Acquérez des compétences recherchées grâce à nos programmes de formation de pointe, conçus pour vous propulser vers le succès professionnel.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <section className="bg-[#1E1E1E] border-b border-white/10">
          <div className="landing-container">
            <div className="flex items-center gap-6 sm:gap-8">
              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className={clsx(
                  'flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === 'all'
                    ? 'text-white border-landing-orange'
                    : 'text-gray-500 border-transparent hover:text-gray-300',
                )}
              >
                Tous nos parcours
                {activeTab === 'all' && <ArrowRight size={14} className="text-landing-orange" />}
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('paid')}
                className={clsx(
                  'pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === 'paid'
                    ? 'text-white border-landing-orange'
                    : 'text-gray-500 border-transparent hover:text-gray-300',
                )}
              >
                Parcours payants
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('free')}
                className={clsx(
                  'pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === 'free'
                    ? 'text-white border-landing-orange'
                    : 'text-gray-500 border-transparent hover:text-gray-300',
                )}
              >
                Parcours gratuits
              </button>
            </div>
          </div>
        </section>

        {/* Search bar */}
        <section className="bg-[#1E1E1E] py-6 sm:py-8">
          <div className="landing-container">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Rechercher un cours"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 rounded-lg bg-[#2A2A2A] border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-landing-orange/50 focus:border-landing-orange/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 sm:px-6 rounded-lg border border-landing-orange text-landing-orange text-sm font-semibold hover:bg-landing-orange hover:text-white transition-colors whitespace-nowrap"
              >
                Rechercher
              </button>
              <button
                type="button"
                className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                aria-label="Filtres avancés"
              >
                <SlidersHorizontal size={18} />
              </button>
            </form>
          </div>
        </section>

        {/* Programs grid */}
        <section className="bg-[#1E1E1E] pb-10 sm:pb-14 lg:pb-16">
          <div className="landing-container">
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden bg-[#2A2A2A] animate-pulse">
                    <div className="aspect-[4/5] bg-[#333]" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-[#333] rounded w-3/4" />
                      <div className="h-3 bg-[#333] rounded w-full" />
                      <div className="h-3 bg-[#333] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-16">
                <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Aucun parcours trouvé</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {search
                    ? `Aucun résultat pour "${search}"`
                    : 'Aucun parcours disponible dans cette catégorie.'}
                </p>
                {search && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); setSearchInput(''); }}
                    className="text-landing-orange text-sm font-medium hover:underline"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            )}

            {!isLoading && visible.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {visible.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-10">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                      className="inline-flex items-center gap-2 h-11 px-8 rounded-lg border border-landing-orange text-landing-orange text-sm font-semibold hover:bg-landing-orange hover:text-white transition-colors"
                    >
                      Voir plus <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <ParcoursFooter />
    </div>
  );
}

function ProgramCard({ program }: { program: Program }) {
  return (
    <article className="rounded-xl overflow-hidden bg-[#2A2A2A] border border-white/5 hover:border-white/15 transition-all group flex flex-col">
      {/* Image / thumbnail */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {program.thumbnailUrl ? (
          <img
            src={program.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#B8860B] via-[#DAA520] to-[#CD853F]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-landing-orange text-white">
            Soft Skills
          </span>
        </div>

        {/* Overlay text */}
        <div className="absolute bottom-10 left-3 right-3">
          <p className="text-white font-extrabold text-sm sm:text-base leading-tight uppercase">
            {program.title.length > 60 ? program.title.slice(0, 60) + '…' : program.title}
          </p>
        </div>

        {/* Bottom badges */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-landing-orange text-white">
            Nouveau
          </span>
          {!program.isPremium && (
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-600 text-white">
              Gratuit
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-white mb-1.5 line-clamp-2 leading-snug">
          {program.title}
        </h3>
        {program.description && (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3 flex-1">
            {program.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <Link
            href={`/parcours/${program.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-landing-orange uppercase tracking-wide hover:underline"
          >
            Voir cours <ArrowRight size={12} />
          </Link>
          <span className="text-xs text-gray-500">
            • {program.isPremium ? 'Payant' : 'Gratuit'}
          </span>
        </div>
      </div>
    </article>
  );
}

function ParcoursFooter() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: submit newsletter
    }
  };

  return (
    <footer className="bg-[#111111] text-white pt-14 pb-8">
      <div className="landing-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 items-start mb-10">
          {/* Left — Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-0.5 mb-3">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                <span className="text-[#5D2A87]">Jambaar</span>
                <span className="inline-block w-2 h-2 rounded-full bg-landing-orange align-middle ml-0.5" aria-hidden />
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              L&apos;Excellence à l&apos;Africaine
            </p>
          </div>

          {/* Center — Communauté + Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Communauté</h4>
            <p className="text-sm text-gray-400 mb-1">Rejoignez nos Jambaars</p>
            <a
              href="#"
              className="text-sm text-landing-orange hover:underline mb-4 block"
            >
              Je rejoins la communauté WhatsApp
            </a>
            <p className="text-xs text-gray-500 mb-2">
              Soyez les premiers à être informés des nouveautés
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 h-10 px-3 rounded-lg bg-[#2A2A2A] border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-landing-orange focus:border-transparent"
              />
              <button
                type="submit"
                className="h-10 px-4 font-semibold text-white bg-landing-orange hover:bg-landing-orange-hover rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>

          {/* Right — Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Contact</h4>
            <a href="mailto:contact@jambaar.io" className="text-sm text-gray-400 hover:text-white block mb-1">
              contact@jambaar.io
            </a>
            <a href="#" className="text-sm text-landing-orange hover:underline">
              Devenir formateur
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Jambaar &nbsp;|&nbsp; Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function ParcoursPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
          <div className="text-white/60">Chargement...</div>
        </div>
      }
    >
      <ParcoursContent />
    </Suspense>
  );
}
