'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronDown, ChevronUp,
  Clock, Users, CalendarDays,
  Play, Pause, Rewind, FastForward, Volume2, VolumeX,
  Maximize2, Minimize2,
  CheckCircle2, PlayCircle, Lock,
  Download, FileText, FileSpreadsheet,
  Lightbulb, Paperclip,
} from 'lucide-react';
import { programsApi, contentApi } from '@/lib/api/content.api';
import { LandingHeader, DarkFooter } from '@/components/landing';
import clsx from 'clsx';

/* ════════════════════ TYPES ════════════════════ */
interface CourseModule {
  id: string;
  order: number;
  title: string;
  contentId: string;
  isLocked: boolean;
  content: {
    id: string;
    title: string;
    durationSeconds: number | null;
    type: string;
    thumbnailKey: string | null;
  } | null;
  userCompleted?: boolean;
}

interface ProgramModule {
  id: string;
  order: number;
  title: string | null;
  courseId: string;
  course: {
    id: string;
    title: string;
    modules: CourseModule[];
  };
}

interface ProgramData {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  isPremium: boolean;
  durationDays: number | null;
  thumbnailUrl: string | null;
  modules: ProgramModule[];
  progress: { progressPercent: number; isCompleted: boolean } | null;
  userProgress?: { progressPercent: number; isCompleted: boolean } | null;
}

interface ContentData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  tags: string[];
  progress: { progressPercent: number; watchedSeconds: number; isCompleted: boolean } | null;
  quiz: unknown;
  isLiked: boolean;
  isSaved: boolean;
}

type Tab = 'description' | 'resources' | 'notes' | 'comments';

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];

function fmtTime(s: number) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/* ════════════════════ MAIN PAGE ════════════════════ */
export default function LearnPage() {
  const { programId } = useParams<{ programId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  /* ── Program data ── */
  const { data: program, isLoading: loadingProgram } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const res = await programsApi.getById(programId);
      return (res.data?.data ?? res.data) as ProgramData;
    },
    enabled: !!programId,
  });

  /* ── State ── */
  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('description');

  /* auto-expand first module + select first lesson */
  useEffect(() => {
    if (!program?.modules?.length) return;
    const first = program.modules[0];
    if (expandedModuleId === null) setExpandedModuleId(first.id);
    if (activeContentId === null && first.course.modules.length > 0) {
      setActiveContentId(first.course.modules[0].contentId);
    }
  }, [program, expandedModuleId, activeContentId]);

  /* ── Active content ── */
  const { data: content, isLoading: loadingContent } = useQuery({
    queryKey: ['content', activeContentId],
    queryFn: async () => {
      const res = await contentApi.getById(activeContentId!);
      return (res.data?.data ?? res.data) as ContentData;
    },
    enabled: !!activeContentId,
  });

  /* ── Progress mutation ── */
  const progressMutation = useMutation({
    mutationFn: (data: { watchedSeconds?: number; progressPercent?: number }) =>
      contentApi.updateProgress(activeContentId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
    },
  });

  /* ── Derived data ── */
  const allLessons = program?.modules?.flatMap((pm) => pm.course.modules) ?? [];
  const totalDurationSec = allLessons.reduce((a, l) => a + (l.content?.durationSeconds ?? 0), 0);
  const totalMin = Math.round(totalDurationSec / 60);
  const progressPct = program?.userProgress?.progressPercent ?? program?.progress?.progressPercent ?? 0;

  const activeLesson = allLessons.find((l) => l.contentId === activeContentId);
  const activeLessonIdx = allLessons.indexOf(activeLesson!);

  /* ── Loading state ── */
  if (loadingProgram || !program) {
    return (
      <div className="bg-[#1E1E1E] min-h-screen flex flex-col text-white">
        <LandingHeader />
        <main className="flex-1 pt-[72px]">
          <div className="landing-container py-12 animate-pulse space-y-6">
            <div className="h-6 bg-[#333] rounded w-48" />
            <div className="h-10 bg-[#333] rounded w-96" />
            <div className="h-[400px] bg-[#333] rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  const selectLesson = (contentId: string) => {
    setActiveContentId(contentId);
    setActiveTab('description');
  };

  const resourceCount = 3;

  return (
    <div className="bg-[#1E1E1E] min-h-screen flex flex-col text-white">
      <LandingHeader />

      <main className="flex-1 pt-[72px]">
        {/* ── HERO: back + title + tags ── */}
        <section className="border-b border-white/10">
          <div className="landing-container py-8 flex flex-col gap-4">
            <button
              onClick={() => router.push('/home')}
              className="inline-flex items-center gap-3 group w-fit"
            >
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ChevronLeft size={20} />
              </span>
              <span className="text-base font-medium opacity-80">Tableau de bord</span>
            </button>

            <div>
              <h1 className="text-[24px] sm:text-[30px] lg:text-[36px] font-bold leading-[1.15] tracking-[-0.3px]">
                {program.title}
              </h1>
              {program.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-5 pt-2 opacity-60">
                  {program.tags.map((t) => (
                    <span key={t} className="text-[13px] font-medium uppercase tracking-wide">
                      {t.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── TWO-COLUMN CONTENT ── */}
        <div className="landing-container">
          <div className="flex flex-col lg:flex-row">

            {/* ══ LEFT COLUMN ══ */}
            <div className="flex-1 min-w-0 lg:border-r border-white/10">

              {/* Video player */}
              <VideoPlayer
                content={content}
                loading={loadingContent}
                onProgress={(watched, pct) => {
                  progressMutation.mutate({ watchedSeconds: watched, progressPercent: pct });
                }}
              />

              {/* Meta bar */}
              <div className="h-[46px] bg-[#181818] border-b border-white/10 flex items-center px-5 gap-6 overflow-x-auto">
                <MetaChip icon={Clock} label={`${totalMin} MINUTES`} />
                <MetaChip icon={Users} label={`${allLessons.length} PARTICIPANTS`} />
                <MetaChip icon={CalendarDays} label={`PUBLIÉ FÉV 2025`} />
              </div>

              {/* Tabs */}
              <div className="bg-[#181818] border-b border-white/10">
                <div className="flex px-5 gap-0" role="tablist">
                  {([
                    { id: 'description' as Tab, label: 'Description' },
                    { id: 'resources' as Tab, label: `Ressources (${resourceCount})` },
                    { id: 'notes' as Tab, label: 'Notes' },
                    { id: 'comments' as Tab, label: 'Commentaires' },
                  ]).map(({ id, label }) => (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={activeTab === id}
                      onClick={() => setActiveTab(id)}
                      className={clsx(
                        'px-4 py-3.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap',
                        activeTab === id
                          ? 'text-landing-orange border-landing-orange'
                          : 'text-white/60 border-transparent hover:text-white/80',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="bg-[#181818] px-5 py-6">
                {activeTab === 'description' && (
                  <DescriptionTab content={content} program={program} />
                )}
                {activeTab === 'resources' && <ResourcesTab />}
                {activeTab === 'notes' && <NotesTab />}
                {activeTab === 'comments' && <CommentsTab />}
              </div>
            </div>

            {/* ══ RIGHT SIDEBAR ══ */}
            <div className="w-full lg:w-[320px] flex-shrink-0">
              <div className="lg:sticky lg:top-[72px] bg-[#1E1E1E]">
                {/* Sidebar header */}
                <div className="px-5 pt-6 pb-4">
                  <h3 className="text-[15px] font-bold">Contenu du cours</h3>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-[6px] bg-[#333] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-landing-orange rounded-full transition-all"
                        style={{ width: `${Math.round(progressPct)}%` }}
                      />
                    </div>
                    <span className="text-[13px] font-semibold text-landing-orange tabular-nums">
                      {Math.round(progressPct)}%
                    </span>
                  </div>
                </div>

                {/* Modules */}
                <div className="pb-6 space-y-[2px]">
                  {program.modules.map((pm) => {
                    const isExpanded = expandedModuleId === pm.id;
                    const lessons = pm.course.modules;
                    return (
                      <div key={pm.id}>
                        <button
                          onClick={() => setExpandedModuleId(isExpanded ? null : pm.id)}
                          className="w-full flex items-center gap-3 px-5 py-3 bg-[#282828] hover:bg-[#2E2E2E] transition-colors"
                        >
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-[10px] font-bold text-landing-orange uppercase tracking-wider">
                              Module {pm.order}
                            </p>
                            <p className="text-[13px] font-semibold leading-snug truncate">
                              {pm.title || pm.course.title}
                            </p>
                          </div>
                          {isExpanded
                            ? <ChevronUp size={16} className="opacity-60 shrink-0" />
                            : <ChevronDown size={16} className="opacity-60 shrink-0" />}
                        </button>

                        {isExpanded && (
                          <div className="bg-[#242424]">
                            {lessons.map((lesson) => {
                              const isActive = lesson.contentId === activeContentId;
                              const isCompleted = lesson.userCompleted;
                              const dur = lesson.content?.durationSeconds;
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => selectLesson(lesson.contentId)}
                                  className={clsx(
                                    'w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors',
                                    isActive ? 'bg-landing-orange/10' : 'hover:bg-white/[0.04]',
                                  )}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                  ) : isActive ? (
                                    <PlayCircle size={18} className="text-landing-orange shrink-0" />
                                  ) : (
                                    <Lock size={16} className="text-white/30 shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className={clsx(
                                      'text-[13px] leading-snug truncate',
                                      isActive ? 'text-white font-medium' : 'text-white/75',
                                    )}>
                                      {lesson.title}
                                    </p>
                                    {dur != null && (
                                      <p className="flex items-center gap-1 text-[11px] text-white/40 mt-0.5">
                                        <Clock size={10} /> {fmtTime(dur)}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DarkFooter />
    </div>
  );
}


/* ════════════════════ VIDEO PLAYER ════════════════════ */
function VideoPlayer({
  content,
  loading,
  onProgress,
}: {
  content: ContentData | undefined;
  loading: boolean;
  onProgress: (watchedSeconds: number, progressPercent: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
      setProgress(pct);
      setCurrentTime(video.currentTime);
    };
    const onMeta = () => setDuration(video.duration);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onMeta);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onMeta);
    };
  }, [content?.videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const interval = setInterval(() => {
      if (!video.paused && video.duration) {
        const pct = Math.round((video.currentTime / video.duration) * 100);
        onProgress(Math.floor(video.currentTime), pct);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [content?.id, onProgress]);

  const showControlsTemp = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  }, [isPlaying]);

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    video.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) video.pause(); else video.play();
  };

  if (loading || !content) {
    return (
      <div className="relative bg-[#181818] border-b border-white/10 overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-landing-orange border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!content.videoUrl) {
    return (
      <div className="relative bg-[#181818] border-b border-white/10 overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16 / 9' }}>
        {content.thumbnailUrl ? (
          <img src={content.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#9333EA]/30 to-landing-orange/30" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-[72px] h-[72px] rounded-full bg-landing-orange flex items-center justify-center">
            <Play size={32} className="text-white ml-1 fill-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative bg-black border-b border-white/10 overflow-hidden"
      style={{ aspectRatio: '16 / 9' }}
      onMouseMove={showControlsTemp}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={content.videoUrl}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
        muted={isMuted}
      />

      {/* overlay */}
      <div
        className={clsx('absolute inset-0 transition-opacity pointer-events-none', showControls ? 'opacity-100' : 'opacity-0')}
        onClick={(e) => e.stopPropagation()}
      >
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[72px] h-[72px] rounded-full bg-landing-orange/90 flex items-center justify-center shadow-lg pointer-events-auto cursor-pointer" onClick={togglePlay}>
              <Play size={32} className="text-white ml-1 fill-white" />
            </div>
          </div>
        )}

        {/* bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className="relative h-1 bg-white/20 rounded-full mb-3 cursor-pointer group" onClick={seekTo}>
            <div className="h-full bg-landing-orange rounded-full" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-landing-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-landing-orange transition-colors">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="text-white/60 hover:text-white"><Rewind size={16} /></button>
            <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="text-white/60 hover:text-white"><FastForward size={16} /></button>
            <span className="text-white/60 text-xs tabular-nums">{fmtTime(currentTime)} / {fmtTime(duration)}</span>
            <div className="flex-1" />
            <button
              onClick={() => { setIsMuted((p) => !p); if (videoRef.current) videoRef.current.muted = !videoRef.current.muted; }}
              className="text-white/60 hover:text-white"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <select
              value={speed}
              onChange={(e) => { const s = parseFloat(e.target.value); setSpeed(s); if (videoRef.current) videoRef.current.playbackRate = s; }}
              className="bg-transparent text-white/60 text-xs border border-white/20 rounded px-1.5 py-0.5 focus:outline-none"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                <option key={s} value={s} className="bg-[#1E1E1E]">{s}×</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════ META CHIP ════════════════════ */
function MetaChip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="flex items-center gap-2 text-[11px] font-bold tracking-[0.5px] whitespace-nowrap text-white/70">
      <Icon size={14} className="opacity-60 shrink-0" />
      {label}
    </span>
  );
}

/* ════════════════════ DESCRIPTION TAB ════════════════════ */
function DescriptionTab({ content, program }: { content?: ContentData; program: ProgramData }) {
  const desc = content?.description ?? program.description ?? '';
  return (
    <div className="space-y-8">
      <div className="text-white/80 text-[15px] leading-[1.7] space-y-5">
        {desc.split('\n').map((p, i) => (
          <p key={i}>{p || desc}</p>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* What you'll learn */}
        <div className="bg-[#242424] rounded-lg p-5 border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-yellow-400" />
            <h4 className="text-[13px] font-bold uppercase tracking-wide">Ce que vous allez apprendre</h4>
          </div>
          <ul className="space-y-2.5 text-[13px] text-white/70 leading-relaxed">
            <li className="flex items-start gap-2"><span className="text-white/40 mt-0.5">•</span> Identifier les 3 piliers de l&apos;impact social</li>
            <li className="flex items-start gap-2"><span className="text-white/40 mt-0.5">•</span> Maîtriser le cadre logique du projet</li>
            <li className="flex items-start gap-2"><span className="text-white/40 mt-0.5">•</span> Utiliser des outils open-source de monitoring</li>
          </ul>
        </div>

        {/* Attached files */}
        <div className="bg-[#242424] rounded-lg p-5 border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-4">
            <Paperclip size={16} className="text-landing-orange" />
            <h4 className="text-[13px] font-bold uppercase tracking-wide">Fichiers attachés</h4>
          </div>
          <div className="space-y-2">
            <FileRow icon={FileText} name="Guide_Impact_v1.pdf" />
            <FileRow icon={FileSpreadsheet} name="Template_KPIs.xlsx" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FileRow({ icon: Icon, name }: { icon: React.ElementType; name: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#1E1E1E] rounded-lg px-4 py-2.5 border border-white/[0.06]">
      <Icon size={16} className="text-white/50 shrink-0" />
      <span className="flex-1 text-[13px] text-white/75 truncate">{name}</span>
      <button className="text-white/40 hover:text-white transition-colors">
        <Download size={14} />
      </button>
    </div>
  );
}

/* ════════════════════ RESOURCES TAB ════════════════════ */
function ResourcesTab() {
  return (
    <div className="space-y-3">
      <p className="text-white/60 text-sm mb-4">Ressources liées à cette leçon :</p>
      <FileRow icon={FileText} name="Guide_Impact_v1.pdf" />
      <FileRow icon={FileSpreadsheet} name="Template_KPIs.xlsx" />
      <FileRow icon={FileText} name="Checklist_Indicateurs.pdf" />
    </div>
  );
}

/* ════════════════════ NOTES TAB ════════════════════ */
function NotesTab() {
  const [note, setNote] = useState('');
  return (
    <div className="space-y-4">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Prenez des notes sur cette leçon..."
        className="w-full min-h-[160px] bg-[#242424] border border-white/10 rounded-lg p-4 text-[14px] text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-landing-orange/50 transition-colors"
      />
      <button className="px-5 py-2.5 bg-landing-orange hover:bg-landing-orange-hover text-white text-[13px] font-semibold rounded-lg transition-colors">
        Sauvegarder
      </button>
    </div>
  );
}

/* ════════════════════ COMMENTS TAB ════════════════════ */
function CommentsTab() {
  const [comment, setComment] = useState('');
  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-landing-orange/20 flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-landing-orange">U</span>
        </div>
        <div className="flex-1">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Laisser un commentaire..."
            className="w-full min-h-[80px] bg-[#242424] border border-white/10 rounded-lg p-3 text-[13px] text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-landing-orange/50 transition-colors"
          />
          <button className="mt-2 px-4 py-2 bg-landing-orange hover:bg-landing-orange-hover text-white text-[12px] font-semibold rounded-lg transition-colors">
            Publier
          </button>
        </div>
      </div>
      <p className="text-white/40 text-[13px] text-center py-6">Aucun commentaire pour le moment.</p>
    </div>
  );
}
