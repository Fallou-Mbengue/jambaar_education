'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, ChevronRight, BookOpen, Award } from 'lucide-react';
import { LandingHeader, DarkFooter } from '@/components/landing';
import { useAuthStore } from '@/store/auth.store';
import { programsApi, aiApi } from '@/lib/api/content.api';

/* ── Types ──────────────────────────────────────────────── */

interface ProgramProgress {
  progressPercent: number;
  isCompleted: boolean;
}

interface ProgramModule {
  id: string;
  order: number;
  title: string;
  courseId: string;
  course?: {
    title: string;
    modules?: { content?: { durationSeconds?: number | null } | null }[];
  };
}

interface ProgramData {
  id: string;
  title: string;
  description?: string | null;
  isPremium: boolean;
  durationDays: number;
  tags: string[];
  thumbnailUrl?: string | null;
  modules: ProgramModule[];
  progress: ProgramProgress | null;
  _count: { modules: number };
}

interface RecommendedItem {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  type?: string;
  author?: string;
  durationSeconds?: number;
}

/* ── Helpers ─────────────────────────────────────────────── */

function formatHoursMinutes(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h${String(m).padStart(2, '0')}m`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

function getProgramTotalSeconds(p: ProgramData): number {
  if (!p.modules?.length) return (p.durationDays ?? 0) * 3600;
  return p.modules.reduce(
    (total, mod) =>
      total +
      (mod.course?.modules ?? []).reduce(
        (acc, l) => acc + (l.content?.durationSeconds ?? 0),
        0,
      ),
    0,
  );
}

function getRemainingTime(p: ProgramData): string {
  const pct = p.progress?.progressPercent ?? 0;
  if (pct >= 100) return 'Terminé';
  const total = getProgramTotalSeconds(p);
  if (total > 0) {
    const remaining = Math.round(total * ((100 - pct) / 100));
    return `${formatHoursMinutes(remaining)} restantes`;
  }
  if (p.durationDays) {
    const daysLeft = Math.max(1, Math.round(p.durationDays * ((100 - pct) / 100)));
    return `${daysLeft}j restantes`;
  }
  return `${100 - pct}% restant`;
}

function getFirstTag(tags: string[]): string | null {
  return tags.length > 0 ? tags[0] : null;
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  ENTREPRENEURIAT: { bg: 'bg-green-600', text: 'text-white' },
  'SOFT SKILLS': { bg: 'bg-[#9333EA]', text: 'text-white' },
  FINANCE: { bg: 'bg-blue-600', text: 'text-white' },
  LEADERSHIP: { bg: 'bg-amber-600', text: 'text-white' },
  AGRICULTURE: { bg: 'bg-emerald-600', text: 'text-white' },
};

function getTagStyle(tag: string) {
  const upper = tag.toUpperCase();
  return TAG_COLORS[upper] ?? { bg: 'bg-gray-600', text: 'text-white' };
}

/* ── Components ──────────────────────────────────────────── */

function WelcomeBanner({
  firstName,
  coursesInProgress,
  certificatesCount,
}: {
  firstName: string;
  coursesInProgress: number;
  certificatesCount: number;
}) {
  return (
    <div className="bg-[#282828] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-bold text-white leading-tight">
          Bonjour, {firstName} !{' '}
          <span role="img" aria-label="wave">
            👋
          </span>
        </h1>
        <p className="text-white/60 text-sm sm:text-base mt-2 max-w-md">
          Prêt à continuer votre apprentissage ? Vous avez fait d&apos;excellents progrès cette semaine.
        </p>
      </div>

      <div className="flex gap-3 shrink-0">
        <div className="flex flex-col items-center justify-center w-[100px] h-[80px] rounded-xl border border-white/10 bg-[#1E1E1E]">
          <span className="text-2xl font-bold text-landing-orange">{coursesInProgress}</span>
          <span className="text-[11px] text-white/50 mt-0.5">Cours en cours</span>
        </div>
        <div className="flex flex-col items-center justify-center w-[100px] h-[80px] rounded-xl border border-white/10 bg-[#1E1E1E]">
          <span className="text-2xl font-bold text-green-400">{certificatesCount}</span>
          <span className="text-[11px] text-white/50 mt-0.5">Certificats</span>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ program }: { program: ProgramData }) {
  const pct = program.progress?.progressPercent ?? 0;
  const tag = getFirstTag(program.tags);
  const tagStyle = tag ? getTagStyle(tag) : null;
  const remaining = getRemainingTime(program);

  return (
    <Link
      href={`/learn/${program.id}`}
      className="block w-[280px] sm:w-[300px] shrink-0 bg-[#282828] rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/15 transition-colors group"
    >
      {/* Thumbnail */}
      <div className="relative h-[170px] overflow-hidden">
        {program.thumbnailUrl ? (
          <img
            src={program.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#3a3a3a] to-[#282828] flex items-center justify-center">
            <BookOpen size={32} className="text-white/20" />
          </div>
        )}
        {tag && tagStyle && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${tagStyle.bg} ${tagStyle.text}`}
          >
            {tag}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[15px] font-semibold text-white leading-snug line-clamp-2 mb-1.5">
          {program.title}
        </h3>
        {program.description && (
          <p className="text-xs text-white/50 line-clamp-2 mb-4 leading-relaxed">
            {program.description}
          </p>
        )}

        {/* Progress */}
        <div className="flex items-center justify-between text-[11px] text-white/50 mb-2">
          <span>Progression</span>
          <span className="font-medium text-white/70">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-landing-orange rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-white/40">
            <Clock size={12} />
            {remaining}
          </span>
          <span className="px-4 py-1.5 text-xs font-semibold text-white bg-landing-orange rounded-lg group-hover:bg-landing-orange-hover transition-colors">
            Continuer
          </span>
        </div>
      </div>
    </Link>
  );
}

function RecommendedRow({ item }: { item: RecommendedItem }) {
  return (
    <Link
      href={`/parcours/${item.id}`}
      className="flex items-center gap-4 p-4 bg-[#282828] rounded-xl border border-white/[0.06] hover:border-white/15 transition-colors group"
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#3a3a3a]">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={20} className="text-white/20" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
        <div className="flex items-center gap-2 mt-1">
          {item.author && (
            <span className="text-xs text-white/40 flex items-center gap-1">
              <Award size={11} className="text-landing-orange" />
              {item.author}
            </span>
          )}
          {item.durationSeconds && (
            <span className="text-xs text-white/40 flex items-center gap-1">
              <Clock size={11} className="text-green-400" />
              {formatHoursMinutes(item.durationSeconds)}
            </span>
          )}
        </div>
      </div>

      <ChevronRight
        size={20}
        className="text-white/30 shrink-0 group-hover:text-landing-orange transition-colors"
      />
    </Link>
  );
}

/* ── Skeletons ───────────────────────────────────────────── */

function BannerSkeleton() {
  return (
    <div className="bg-[#282828] rounded-2xl p-6 sm:p-8 animate-pulse">
      <div className="h-7 w-60 bg-white/10 rounded mb-3" />
      <div className="h-4 w-96 max-w-full bg-white/10 rounded" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="w-[280px] sm:w-[300px] shrink-0 bg-[#282828] rounded-xl overflow-hidden border border-white/[0.06] animate-pulse">
      <div className="h-[170px] bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-white/10 rounded" />
        <div className="h-3 w-full bg-white/5 rounded" />
        <div className="h-1.5 w-full bg-white/10 rounded-full" />
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-white/5 rounded" />
          <div className="h-7 w-20 bg-white/10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function RecommendedSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#282828] rounded-xl border border-white/[0.06] animate-pulse">
      <div className="w-14 h-14 rounded-lg bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-white/10 rounded" />
        <div className="h-3 w-1/2 bg-white/5 rounded" />
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);

  const firstName =
    user?.profile?.firstName ?? user?.email?.split('@')[0] ?? 'Apprenant';

  useEffect(() => {
    programsApi
      .getAll()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setPrograms(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    aiApi
      .getRecommendations()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setRecommendations(Array.isArray(data) ? data : []);
      })
      .catch(() => setRecommendations([]))
      .finally(() => setRecsLoading(false));
  }, []);

  const enrolledPrograms = programs.filter((p) => p.progress !== null);
  const completedCount = enrolledPrograms.filter(
    (p) => p.progress?.isCompleted,
  ).length;
  const inProgressCount = enrolledPrograms.filter(
    (p) => !p.progress?.isCompleted,
  ).length;

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white flex flex-col">
      <LandingHeader />

      <main className="flex-1 pt-[72px]">
        <div className="landing-container px-4 sm:px-6 py-8 sm:py-10">
          {/* Welcome Banner */}
          {loading ? (
            <BannerSkeleton />
          ) : (
            <WelcomeBanner
              firstName={firstName}
              coursesInProgress={inProgressCount}
              certificatesCount={completedCount}
            />
          )}

          {/* Mes parcours en cours */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Mes parcours en cours
              </h2>
              <Link
                href="/parcours"
                className="text-sm font-medium text-landing-orange hover:text-landing-orange-hover flex items-center gap-1 transition-colors"
              >
                Voir tout <ChevronRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                {[0, 1, 2].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : enrolledPrograms.length === 0 ? (
              <div className="text-center py-16 bg-[#282828] rounded-xl border border-white/[0.06]">
                <BookOpen size={40} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/50 text-sm">
                  Vous n&apos;avez pas encore commencé de parcours.
                </p>
                <Link
                  href="/parcours"
                  className="inline-block mt-4 px-5 py-2.5 bg-landing-orange text-white text-sm font-semibold rounded-lg hover:bg-landing-orange-hover transition-colors"
                >
                  Découvrir les parcours
                </Link>
              </div>
            ) : (
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                {enrolledPrograms.map((p) => (
                  <CourseCard key={p.id} program={p} />
                ))}
              </div>
            )}
          </section>

          {/* Recommandé pour vous */}
          <section className="mt-14 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              Recommandé pour vous
            </h2>

            {recsLoading ? (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <RecommendedSkeleton key={i} />
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              /* Fallback: show non-enrolled programs as recommendations */
              <div className="space-y-3">
                {programs
                  .filter((p) => p.progress === null)
                  .slice(0, 4)
                  .map((p) => (
                    <RecommendedRow
                      key={p.id}
                      item={{
                        id: p.id,
                        title: p.title,
                        description: p.description,
                        thumbnailUrl: p.thumbnailUrl,
                        author: p.tags[0] ?? undefined,
                        durationSeconds: getProgramTotalSeconds(p),
                      }}
                    />
                  ))}
                {programs.filter((p) => p.progress === null).length === 0 && (
                  <p className="text-center text-white/40 text-sm py-8">
                    Aucune recommandation pour le moment.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((item) => (
                  <RecommendedRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <DarkFooter />
    </div>
  );
}
