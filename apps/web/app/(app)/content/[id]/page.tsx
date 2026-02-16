'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { contentApi, aiApi } from '@/lib/api/content.api';
import {
  ArrowLeft, Heart, Bookmark, Share2, Play, Pause,
  CheckCircle, Maximize2, Minimize2, FastForward, Rewind,
  Volume2, VolumeX, Loader2, Sparkles,
} from 'lucide-react';
import { ContentTypeBadge, PremiumBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { useRightPanelStore } from '@/store/rightPanel.store';
import clsx from 'clsx';

type Tab = 'description' | 'quiz' | 'ai-summary';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function ContentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setPanel = useRightPanelStore((s) => s.setContent);
  const setAiSummary = useRightPanelStore((s) => s.setAiSummary);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTheatre, setIsTheatre] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [aiSummary, setAiSummaryLocal] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      const res = await contentApi.getById(id);
      return res.data.data;
    },
  });

  const { data: quiz } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      const res = await contentApi.getQuiz(id);
      return res.data.data;
    },
    enabled: activeTab === 'quiz',
  });

  const progressMutation = useMutation({
    mutationFn: (data: { watchedSeconds?: number; completed?: boolean }) =>
      contentApi.updateProgress(id, data),
  });

  const likeMutation = useMutation({
    mutationFn: () => contentApi.toggleLike(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['content', id] });
      const prev = queryClient.getQueryData(['content', id]);
      queryClient.setQueryData(['content', id], (old: any) => ({
        ...old,
        isLiked: !old?.isLiked,
        likesCount: old?.isLiked ? old.likesCount - 1 : old.likesCount + 1,
      }));
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(['content', id], ctx?.prev),
  });

  const saveMutation = useMutation({
    mutationFn: () => contentApi.toggleSave(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['content', id] });
      const prev = queryClient.getQueryData(['content', id]);
      queryClient.setQueryData(['content', id], (old: any) => ({
        ...old,
        isSaved: !old?.isSaved,
      }));
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(['content', id], ctx?.prev),
  });

  // Video tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
      setProgress(pct);
      setCurrentTime(video.currentTime);
      if (pct >= 90 && !content?.isCompleted) {
        progressMutation.mutate({ watchedSeconds: Math.floor(video.currentTime), completed: true });
      }
    };
    const handleDuration = () => setDuration(video.duration);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleDuration);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleDuration);
    };
  }, [content]);

  // Push to right panel
  useEffect(() => {
    if (!content) return;
    setPanel({ contentId: id, contentTitle: content.title, contentType: content.type });
    setAiSummary(null, true);
    aiApi.summarize(id)
      .then((res) => {
        setAiSummaryLocal(res.data.data.summary);
        setAiSummary(res.data.data.summary);
      })
      .catch(() => {
        setAiSummary('Résumé non disponible.', false);
      });
  }, [content?.id]);

  // AI summary tab
  const handleLoadSummary = useCallback(async () => {
    if (aiSummary || loadingSummary) return;
    setLoadingSummary(true);
    try {
      const res = await aiApi.summarize(id);
      setAiSummaryLocal(res.data.data.summary);
    } catch {
      setAiSummaryLocal('Résumé non disponible.');
    } finally {
      setLoadingSummary(false);
    }
  }, [aiSummary, loadingSummary, id]);

  useEffect(() => {
    if (activeTab === 'ai-summary') handleLoadSummary();
  }, [activeTab]);

  // Theatre mode body class
  useEffect(() => {
    if (isTheatre) document.body.classList.add('theatre-mode');
    else document.body.classList.remove('theatre-mode');
    return () => document.body.classList.remove('theatre-mode');
  }, [isTheatre]);

  // Auto-hide controls
  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const video = videoRef.current;
      if (!video) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isPlaying) video.pause(); else video.play();
          break;
        case 'ArrowLeft':
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'f':
        case 'F':
          setIsTheatre((p) => !p);
          break;
        case 'm':
        case 'M':
          setIsMuted((p) => !p);
          if (video) video.muted = !video.muted;
          break;
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isPlaying]);

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    const question: QuizQuestion = quiz?.questions?.[0];
    if (question && selectedAnswer === question.correctIndex) {
      progressMutation.mutate({ completed: true });
    }
  };

  const formatTime = (s: number) => {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    video.currentTime = (x / rect.width) * duration;
  };

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="flex-1 p-4 md:p-6 space-y-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="hidden lg:block w-80 border-l border-dark-border p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-dark-text">Contenu non trouvé.</p>
      </div>
    );
  }

  const question: QuizQuestion | undefined = quiz?.questions?.[0];

  return (
    <div className={clsx('flex flex-col h-full', isTheatre && 'bg-black')}>
      {/* Mobile / desktop sticky header */}
      <div
        className={clsx(
          'flex items-center gap-3 px-4 py-3 border-b border-dark-border flex-shrink-0',
          isTheatre ? 'bg-black/80 backdrop-blur absolute top-0 left-0 right-0 z-20' : 'bg-dark-bg/80 backdrop-blur',
        )}
      >
        <button
          onClick={() => router.back()}
          className="text-dark-text hover:text-white transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white font-semibold flex-1 line-clamp-1 text-sm">{content.title}</h1>
        <div className="flex items-center gap-2">
          {/* Theatre toggle */}
          <button
            onClick={() => setIsTheatre((p) => !p)}
            className="p-1.5 rounded-lg text-dark-text hover:text-white hover:bg-surface-2 transition-colors hidden md:flex"
            aria-label={isTheatre ? 'Mode normal' : 'Mode théâtre'}
            title="Mode théâtre (f)"
          >
            {isTheatre ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          {/* Like */}
          <button
            onClick={() => likeMutation.mutate()}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
            aria-label={content.isLiked ? 'Ne plus aimer' : 'Aimer'}
          >
            <Heart
              size={16}
              className={content.isLiked ? 'text-red-500' : 'text-dark-text'}
              fill={content.isLiked ? 'currentColor' : 'none'}
            />
            <span className="text-dark-text text-xs hidden sm:block">{content.likesCount ?? 0}</span>
          </button>
          {/* Save */}
          <button
            onClick={() => saveMutation.mutate()}
            className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
            aria-label={content.isSaved ? 'Retirer des favoris' : 'Sauvegarder'}
          >
            <Bookmark
              size={16}
              className={content.isSaved ? 'text-brand-orange' : 'text-dark-text'}
              fill={content.isSaved ? 'currentColor' : 'none'}
            />
          </button>
          {/* Share */}
          <button
            onClick={async () => {
              try {
                await navigator.share({ title: content.title, url: `${window.location.origin}/content/${id}` });
              } catch {
                await navigator.clipboard.writeText(`${window.location.origin}/content/${id}`);
              }
              await contentApi.share(id);
            }}
            className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
            aria-label="Partager"
          >
            <Share2 size={16} className="text-dark-text" />
          </button>
          {content.isCompleted && (
            <CheckCircle size={16} className="text-brand-green" aria-label="Complété" />
          )}
        </div>
      </div>

      {/* Main content layout */}
      <div className={clsx('flex flex-1 overflow-hidden', isTheatre && 'flex-col')}>
        {/* Video + controls */}
        <div className={clsx('flex flex-col', isTheatre ? 'flex-1' : 'lg:flex-1')}>
          {content.type === 'VIDEO' && content.mediaUrl ? (
            <div
              className={clsx(
                'relative bg-black',
                isTheatre ? 'flex-1' : 'aspect-video',
              )}
              onMouseMove={showControlsTemporarily}
              onClick={() => {
                if (isPlaying) videoRef.current?.pause();
                else videoRef.current?.play();
                showControlsTemporarily();
              }}
            >
              <video
                ref={videoRef}
                src={content.mediaUrl}
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                playsInline
                muted={isMuted}
              />

              {/* Controls overlay */}
              <div
                className={clsx(
                  'absolute inset-0 transition-opacity',
                  showControls ? 'opacity-100' : 'opacity-0',
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Center play/pause */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {!isPlaying && (
                    <div className="w-16 h-16 bg-brand-orange/90 rounded-full flex items-center justify-center shadow-modal">
                      <Play size={28} fill="white" className="text-white ml-1" />
                    </div>
                  )}
                </div>

                {/* Bottom controls */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  {/* Seekbar */}
                  <div
                    className="relative h-1 bg-white/20 rounded-full mb-3 cursor-pointer group"
                    onClick={seekTo}
                    role="slider"
                    aria-label="Progression de la vidéo"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-brand-orange rounded-full relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-brand-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Play/pause */}
                    <button
                      onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()}
                      className="text-white hover:text-brand-orange transition-colors"
                      aria-label={isPlaying ? 'Pause (Espace)' : 'Lecture (Espace)'}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    {/* Rewind/forward */}
                    <button
                      onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }}
                      className="text-white/70 hover:text-white transition-colors"
                      aria-label="Reculer 10s (←)"
                    >
                      <Rewind size={16} />
                    </button>
                    <button
                      onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}
                      className="text-white/70 hover:text-white transition-colors"
                      aria-label="Avancer 10s (→)"
                    >
                      <FastForward size={16} />
                    </button>
                    {/* Time */}
                    <span className="text-white/70 text-xs tabular-nums">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    {/* Spacer */}
                    <div className="flex-1" />
                    {/* Volume */}
                    <button
                      onClick={() => {
                        setIsMuted((p) => !p);
                        if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
                      }}
                      className="text-white/70 hover:text-white transition-colors"
                      aria-label={isMuted ? 'Activer le son (m)' : 'Couper le son (m)'}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    {/* Speed */}
                    <select
                      value={speed}
                      onChange={(e) => {
                        const s = parseFloat(e.target.value);
                        setSpeed(s);
                        if (videoRef.current) videoRef.current.playbackRate = s;
                      }}
                      className="bg-transparent text-white/70 text-xs border border-white/20 rounded px-1.5 py-0.5 hover:text-white focus:outline-none"
                      aria-label="Vitesse de lecture"
                    >
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <option key={s} value={s} className="bg-dark-card">
                          {s}×
                        </option>
                      ))}
                    </select>
                    {/* Theatre */}
                    <button
                      onClick={() => setIsTheatre((p) => !p)}
                      className="text-white/70 hover:text-white transition-colors hidden md:block"
                      aria-label="Mode théâtre (f)"
                    >
                      {isTheatre ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-brand-orange/10 mx-4 my-4 rounded-xl p-10 text-center">
              <span className="text-5xl" role="img" aria-hidden="true">
                {content.type === 'ARTICLE' ? '📄' : content.type === 'QUIZ' ? '🧠' : '⚡'}
              </span>
              <p className="text-dark-text mt-3 text-sm">{content.type}</p>
            </div>
          )}

          {/* Tabs (non-theatre mode or theatre mode desktop) */}
          {(!isTheatre) && (
            <div className="flex-1 overflow-hidden flex flex-col lg:hidden">
              <TabsSection
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                content={content}
                quiz={quiz}
                question={question}
                selectedAnswer={selectedAnswer}
                setSelectedAnswer={setSelectedAnswer}
                showResult={showResult}
                handleQuizSubmit={handleQuizSubmit}
                aiSummary={aiSummary}
                loadingSummary={loadingSummary}
              />
            </div>
          )}
        </div>

        {/* Desktop side panel with tabs */}
        {!isTheatre && (
          <div className="hidden lg:flex lg:flex-col w-80 xl:w-96 border-l border-dark-border flex-shrink-0 overflow-hidden">
            <TabsSection
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              content={content}
              quiz={quiz}
              question={question}
              selectedAnswer={selectedAnswer}
              setSelectedAnswer={setSelectedAnswer}
              showResult={showResult}
              handleQuizSubmit={handleQuizSubmit}
              aiSummary={aiSummary}
              loadingSummary={loadingSummary}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TabsSection({
  activeTab, setActiveTab, content, quiz, question,
  selectedAnswer, setSelectedAnswer, showResult, handleQuizSubmit,
  aiSummary, loadingSummary,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  content: any;
  quiz: any;
  question: QuizQuestion | undefined;
  selectedAnswer: number | null;
  setSelectedAnswer: (n: number) => void;
  showResult: boolean;
  handleQuizSubmit: () => void;
  aiSummary: string | null;
  loadingSummary: boolean;
}) {
  return (
    <>
      {/* Tab bar */}
      <div className="flex border-b border-dark-border flex-shrink-0" role="tablist">
        {([
          { id: 'description', label: 'Description' },
          { id: 'quiz', label: 'Mini-Quiz' },
          { id: 'ai-summary', label: 'IA Résumé' },
        ] as { id: Tab; label: string }[]).map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex-1 py-3 text-xs font-medium transition-colors',
              activeTab === id
                ? 'text-brand-orange border-b-2 border-brand-orange'
                : 'text-dark-text hover:text-white',
            )}
          >
            {id === 'ai-summary' && <Sparkles size={10} className="inline mr-1" aria-hidden="true" />}
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4" role="tabpanel">
        {activeTab === 'description' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <ContentTypeBadge type={content.type} />
              {content.isPremium && <PremiumBadge />}
              {content.durationSeconds && (
                <span className="text-xs text-dark-text">
                  {Math.ceil(content.durationSeconds / 60)} min
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-white">{content.title}</h2>
            <p className="text-dark-text text-sm leading-relaxed">{content.description}</p>
            {content.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-2.5 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-5">
            {!question ? (
              <p className="text-dark-text text-sm text-center py-8">Aucun quiz disponible.</p>
            ) : (
              <>
                <h3 className="text-white font-semibold text-sm leading-relaxed">{question.question}</h3>
                <div className="space-y-2.5">
                  {question.options.map((opt: string, idx: number) => {
                    let cls =
                      'w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ';
                    if (!showResult) {
                      cls +=
                        selectedAnswer === idx
                          ? 'border-brand-orange bg-brand-orange/10 text-white'
                          : 'border-dark-border text-dark-text hover:border-white/20 hover:text-white';
                    } else if (idx === question.correctIndex) {
                      cls += 'border-brand-green bg-brand-green/10 text-brand-green';
                    } else if (idx === selectedAnswer) {
                      cls += 'border-red-500 bg-red-500/10 text-red-400';
                    } else {
                      cls += 'border-dark-border text-dark-text opacity-50';
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => !showResult && setSelectedAnswer(idx)}
                        className={cls}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {showResult && (
                  <div
                    className={clsx(
                      'rounded-xl p-4 text-sm border',
                      selectedAnswer === question.correctIndex
                        ? 'border-brand-green bg-brand-green/10 text-brand-green'
                        : 'border-red-500 bg-red-500/10 text-red-400',
                    )}
                  >
                    {selectedAnswer === question.correctIndex ? '✅ Bonne réponse !' : '❌ Mauvaise réponse.'}
                    <p className="text-white/70 mt-1.5 text-xs">{question.explanation}</p>
                  </div>
                )}
                {!showResult && selectedAnswer !== null && (
                  <button
                    onClick={handleQuizSubmit}
                    className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white rounded-xl py-3 text-sm font-semibold transition-colors"
                  >
                    Valider ma réponse
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'ai-summary' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brand-orange" />
              <span className="text-xs font-semibold text-white uppercase tracking-wide">Résumé IA</span>
            </div>
            {loadingSummary ? (
              <div className="flex items-center gap-2 text-dark-text text-sm py-4">
                <Loader2 size={16} className="animate-spin text-brand-orange" />
                <span>Génération du résumé...</span>
              </div>
            ) : aiSummary ? (
              <div className="bg-surface-2 rounded-xl p-4 border border-dark-border">
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
              </div>
            ) : (
              <p className="text-dark-text text-sm text-center py-8">Résumé non disponible.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
