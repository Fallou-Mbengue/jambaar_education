'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronDown, ChevronRight,
  Clock, Users, CalendarDays, Play, Lock,
} from 'lucide-react';
import { LandingHeader, DarkFooter } from '@/components/landing';
import apiClient from '@/lib/api/client';
import clsx from 'clsx';

/* ── Types ── */
interface Lesson {
  id: string;
  order: number;
  title: string;
  durationSeconds: number | null;
  contentId: string;
}
interface Chapter {
  id: string;
  order: number;
  title: string;
  courseId: string;
  lessons: Lesson[];
  totalDurationSeconds: number;
}
interface ProgramDetail {
  id: string;
  title: string;
  description: string | null;
  isPremium: boolean;
  durationDays: number | null;
  tags: string[];
  status: string;
  createdAt: string;
  thumbnailUrl: string | null;
  participantCount: number;
  totalDurationSeconds: number;
  curriculum: Chapter[];
  _count: { modules: number };
}

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];

function fmtShort(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

/* ════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════ */
export default function ParcoursDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: program, isLoading, error } = useQuery({
    queryKey: ['program-public', id],
    queryFn: async () => {
      const res = await apiClient.get(`/programs/public/${id}`);
      return (res.data?.data ?? res.data) as ProgramDetail;
    },
    enabled: !!id,
  });

  const [openChapter, setOpenChapter] = useState<string | null>(null);
  useEffect(() => {
    if (program?.curriculum?.length && openChapter === null)
      setOpenChapter(program.curriculum[0].id);
  }, [program, openChapter]);

  /* loading */
  if (isLoading || !program) {
    return (
      <Shell>
        <div className="detail-container py-16 animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#333] rounded-full" />
            <div className="h-5 bg-[#333] rounded w-36" />
          </div>
          <div className="h-12 bg-[#333] rounded w-3/4" />
          <div className="h-5 bg-[#333] rounded w-64" />
          <div className="h-[400px] bg-[#333] rounded-lg" />
        </div>
      </Shell>
    );
  }

  /* error */
  if (error) {
    return (
      <Shell>
        <div className="detail-container py-16">
          <p className="text-lg mb-4">Ce parcours est introuvable.</p>
          <Link href="/parcours" className="text-landing-orange hover:underline">
            ← Retour aux parcours
          </Link>
        </div>
      </Shell>
    );
  }

  const pubDate = program.createdAt
    ? (() => {
        const d = new Date(program.createdAt);
        return `PUBLIÉ ${MONTHS[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
      })()
    : '';
  const totalMin = Math.round(program.totalDurationSeconds / 60);

  return (
    <div className="bg-[#242424] min-h-screen flex flex-col text-white">
      <LandingHeader />

      <main className="flex-1 pt-[72px] pb-12">
        {/* ─────────── HERO: back + title + tags ─────────── */}
        <section className="border-b border-white/20">
          <div className="detail-container py-10 sm:py-12 flex flex-col gap-5">
            {/* back */}
            <Link href="/parcours" className="inline-flex items-center gap-3.5 group w-fit">
              <span className="w-10 h-10 rounded-full bg-white border border-black/[0.06] flex items-center justify-center shrink-0 shadow-sm group-hover:bg-gray-50 transition-colors">
                <ChevronLeft size={22} className="text-[#181818]" />
              </span>
              <span className="text-[18px] font-medium leading-normal">Nos parcours</span>
            </Link>

            {/* title + tags */}
            <div className="flex flex-col gap-1">
              <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-bold leading-[1.1] tracking-[-0.5px]">
                {program.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 sm:gap-11 pt-2 pb-1 opacity-80">
                {program.tags.map((t) => (
                  <span key={t} className="text-[15px] sm:text-[18px] font-medium uppercase leading-7">
                    {t.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────── TWO-COLUMN CONTENT ─────────── */}
        <div className="detail-container">
          <div className="flex flex-col lg:flex-row">

            {/* ── LEFT: 74.5 % ── */}
            <div className="w-full lg:w-[74.5%] lg:border-x border-white/20 min-w-0">

              {/* video */}
              <div
                className="relative w-full bg-[#181818] border-b border-white/20 overflow-hidden"
                style={{ aspectRatio: '840 / 500' }}
              >
                {program.thumbnailUrl ? (
                  <img
                    src={program.thumbnailUrl}
                    alt={program.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#9333EA] to-landing-orange" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <button
                    type="button"
                    className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors backdrop-blur-sm"
                    aria-label="Lire la vidéo"
                  >
                    <Play size={30} className="text-white ml-1 fill-white" />
                  </button>
                </div>
                <span className="absolute top-4 right-5 text-white/70 text-xs font-semibold select-none">
                  Jambaar.
                </span>
              </div>

              {/* meta bar */}
              <div className="h-[50px] bg-[#181818] border-b border-white/20 flex items-center px-5 sm:px-6 gap-6 sm:gap-8 overflow-x-auto">
                <MetaItem icon={Clock} label={`${totalMin} MINUTES`} />
                <MetaItem icon={Users} label={`${program.participantCount} PARTICIPANTS`} />
                {pubDate && <MetaItem icon={CalendarDays} label={pubDate} />}
              </div>

              {/* description */}
              <div className="bg-[#181818] border-b border-white/20 px-5 sm:px-6 py-6 text-white/80 text-base leading-[1.65] space-y-5">
                {program.description && (
                  <>
                    <p>{program.description}</p>
                    <p>{program.description}</p>
                  </>
                )}
              </div>

              {/* curriculum */}
              <div className="bg-[#181818] border-b border-white/20 px-5 sm:px-6 py-7">
                <div className="flex flex-col gap-[5px]">
                  {program.curriculum.map((ch) => (
                    <ChapterBlock
                      key={ch.id}
                      chapter={ch}
                      isOpen={openChapter === ch.id}
                      toggle={() => setOpenChapter(openChapter === ch.id ? null : ch.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT SIDEBAR: 25.5 % ── */}
            <div className="hidden lg:block lg:w-[25.5%] flex-shrink-0">
              <div className="sticky top-[72px] bg-[#181818] border-r border-b border-white/20">
                <SidebarCTA program={program} />
              </div>
            </div>
          </div>
        </div>

        {/* mobile / tablet sticky CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#181818] border-t border-white/20 px-4 py-3 safe-area-bottom">
          <Link
            href={program.isPremium ? `/auth/signup?from=/learn/${program.id}` : `/learn/${program.id}`}
            className="flex items-center justify-between w-full bg-landing-orange hover:bg-landing-orange-hover rounded-lg px-5 py-3.5 transition-colors"
          >
            <span className="text-[#181818] text-sm font-semibold">
              {program.isPremium ? 'Débloquer le cours' : 'Accéder au cours'}
            </span>
            <span className="text-[#181818] text-base font-bold">
              {program.isPremium ? '4 500 FCFA' : 'Gratuit'}
            </span>
          </Link>
        </div>
      </main>

      <DarkFooter />
    </div>
  );
}

/* ═══════════════════ SUB-COMPONENTS ═══════════════════ */

function MetaItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="flex items-center gap-2 text-[12px] font-bold tracking-[0.6px] whitespace-nowrap">
      <Icon size={16} className="opacity-60 shrink-0" />
      {label}
    </span>
  );
}

function SidebarCTA({ program }: { program: ProgramDetail }) {
  const ctaHref = program.isPremium
    ? `/auth/signup?from=/learn/${program.id}`
    : `/learn/${program.id}`;

  return (
    <div className="pt-24">
      <Link
        href={ctaHref}
        className="flex items-center justify-between w-full bg-landing-orange hover:bg-landing-orange-hover px-[18px] py-[14px] transition-colors"
      >
        <span className="text-[#181818] text-[14px] font-semibold leading-[21px]">
          {program.isPremium ? 'Débloquer le cours' : 'Accéder au cours'}
        </span>
        <span className="text-[#181818] text-[16px] font-semibold leading-[24px]">
          {program.isPremium ? '4 500 FCFA' : 'Gratuit'}
        </span>
      </Link>
      <div className="px-5 py-5">
        <p className="text-[#B0B0B0] text-[12px] leading-[1.6]">
          {program.isPremium
            ? "Achetez ce cours et accédez-y à vie. C'est un paiement unique, sans abonnements."
            : "Inscrivez-vous gratuitement et accédez à tout le contenu de ce parcours."}
        </p>
      </div>
    </div>
  );
}

function ChapterBlock({
  chapter,
  isOpen,
  toggle,
}: {
  chapter: Chapter;
  isOpen: boolean;
  toggle: () => void;
}) {
  const count = chapter.lessons.length;
  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-3 bg-[#141414] border border-[#383838] px-4 py-[14px] hover:bg-[#1c1c1c] transition-colors"
      >
        {isOpen
          ? <ChevronDown size={16} className="shrink-0 opacity-90" />
          : <ChevronRight size={16} className="shrink-0 opacity-90" />}
        <span className="flex-1 text-left font-semibold text-[14px] leading-5">
          {chapter.title}
        </span>
        <span className="text-[#666] text-[10px] leading-[14px] whitespace-nowrap">
          {count} {count > 1 ? 'modules' : 'cours'}
        </span>
      </button>

      {isOpen && count > 0 && (
        <div className="pl-4 sm:pl-[22px] relative">
          <div className="absolute left-[52px] sm:left-[62px] top-0 bottom-0 w-px bg-[#383838]" />
          {chapter.lessons.map((lesson, idx) => (
            <LessonRow key={lesson.id} lesson={lesson} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

function LessonRow({ lesson, idx }: { lesson: Lesson; idx: number }) {
  const isFree = idx === 0;
  return (
    <div className="pl-4 sm:pl-[22px] py-[4px]">
      <div
        className={clsx(
          'flex items-stretch bg-[#1a1a1a] border border-[#383838] overflow-hidden',
          !isFree && 'opacity-75',
        )}
      >
        {/* icon */}
        <div className="w-12 bg-[#141414] flex items-center justify-center shrink-0 border-r border-[#383838]">
          <Play size={14} className="text-white/50 fill-white/50" />
        </div>

        {/* info */}
        <div className="flex-1 flex flex-col justify-center px-4 py-2.5 gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-[6px]">
            <span className="inline-block px-[6px] py-[2px] bg-[#141414] text-[#666] text-[7.5px] font-bold tracking-[0.19px] uppercase leading-[11px]">
              Video
            </span>
            {isFree && (
              <span className="inline-block px-[6px] py-[2px] bg-[#00E472] text-black text-[7.5px] font-bold leading-[11px]">
                FREE PREVIEW
              </span>
            )}
            {!isFree && (
              <span className="inline-flex items-center gap-1 px-[6px] py-[2px] bg-[#2E2E2E] text-[#888] text-[7.5px] font-bold leading-[11px]">
                <Lock size={8} /> LOCKED
              </span>
            )}
          </div>
          <p className="text-[12px] leading-[18px] truncate">{lesson.title}</p>
        </div>

        {/* duration */}
        {lesson.durationSeconds != null && (
          <div className="flex items-center gap-[6px] pr-4 shrink-0">
            <Clock size={12} className="text-[#666]" />
            <span className="text-[#666] text-[10px] font-medium tabular-nums leading-[14px]">
              {fmtShort(lesson.durationSeconds)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ SHELL ═══════════════════ */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#242424] min-h-screen flex flex-col text-white">
      <LandingHeader />
      <main className="flex-1 pt-[72px] pb-12">{children}</main>
    </div>
  );
}

