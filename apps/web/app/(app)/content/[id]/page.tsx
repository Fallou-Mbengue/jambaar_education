'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { contentApi, aiApi } from '@/lib/api/content.api';
import { ArrowLeft, Heart, Bookmark, Share2, Play, Pause, CheckCircle } from 'lucide-react';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      const pct = (video.currentTime / video.duration) * 100;
      setProgress(pct);
      if (pct >= 90 && !content?.isCompleted) {
        progressMutation.mutate({ watchedSeconds: video.currentTime, completed: true });
      }
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [content]);

  const handleLoadSummary = async () => {
    if (aiSummary) return;
    setLoadingSummary(true);
    try {
      const res = await aiApi.summarize(id);
      setAiSummary(res.data.data.summary);
    } catch {
      setAiSummary('Résumé non disponible pour le moment.');
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai-summary') handleLoadSummary();
  }, [activeTab]);

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    const question: QuizQuestion = quiz?.questions?.[0];
    if (question && selectedAnswer === question.correctIndex) {
      progressMutation.mutate({ completed: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-brand-orange">Chargement...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-dark-text">Contenu non trouvé.</p>
      </div>
    );
  }

  const question: QuizQuestion | undefined = quiz?.questions?.[0];

  return (
    <div className="min-h-screen bg-dark-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white font-semibold flex-1 line-clamp-1">{content.title}</h1>
      </div>

      {/* Video Player */}
      {content.type === 'VIDEO' && content.mediaUrl && (
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            src={content.mediaUrl}
            className="w-full h-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
          />
          <button
            onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()}
            className="absolute inset-0 flex items-center justify-center"
          >
            {!isPlaying && (
              <div className="w-16 h-16 bg-brand-orange/90 rounded-full flex items-center justify-center">
                <Play size={28} fill="white" className="text-white ml-1" />
              </div>
            )}
          </button>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-brand-orange transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Non-video content placeholder */}
      {content.type !== 'VIDEO' && (
        <div className="bg-brand-orange/10 mx-4 mt-4 rounded-xl p-8 text-center">
          <span className="text-4xl">
            {content.type === 'ARTICLE' ? '📄' : content.type === 'QUIZ' ? '🧠' : '⚡'}
          </span>
          <p className="text-dark-text mt-2 text-sm">{content.type}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-4 px-4 py-3">
        <button
          onClick={() => likeMutation.mutate()}
          className="flex items-center gap-1 text-sm"
        >
          <Heart
            size={20}
            className={content.isLiked ? 'text-red-500' : 'text-dark-text'}
            fill={content.isLiked ? 'currentColor' : 'none'}
          />
          <span className="text-dark-text">{content.likesCount || 0}</span>
        </button>
        <button onClick={() => saveMutation.mutate()}>
          <Bookmark
            size={20}
            className={content.isSaved ? 'text-brand-orange' : 'text-dark-text'}
            fill={content.isSaved ? 'currentColor' : 'none'}
          />
        </button>
        <button onClick={() => contentApi.share(id)}>
          <Share2 size={20} className="text-dark-text" />
        </button>
        {content.isCompleted && (
          <CheckCircle size={20} className="text-green-500" />
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mx-4">
        {(['description', 'quiz', 'ai-summary'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-brand-orange border-b-2 border-brand-orange'
                : 'text-dark-text'
            }`}
          >
            {tab === 'description' ? 'Description' : tab === 'quiz' ? 'Mini-Quiz' : 'IA Résumé'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 py-6">
        {activeTab === 'description' && (
          <div className="space-y-4">
            <p className="text-white/80 text-sm leading-relaxed">{content.description}</p>
            {content.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag: string) => (
                  <span key={tag} className="text-xs text-brand-orange bg-brand-orange/10 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {content.durationSeconds && (
              <p className="text-dark-text text-xs">
                Durée: {Math.ceil(content.durationSeconds / 60)} min
              </p>
            )}
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-6">
            {!question ? (
              <p className="text-dark-text text-center py-8">Aucun quiz disponible.</p>
            ) : (
              <>
                <h3 className="text-white font-medium">{question.question}</h3>
                <div className="space-y-3">
                  {question.options.map((opt: string, idx: number) => {
                    let className = 'glass rounded-xl p-4 text-sm text-left transition-all ';
                    if (!showResult) {
                      className += selectedAnswer === idx
                        ? 'border-brand-orange text-white'
                        : 'text-dark-text hover:border-white/20';
                    } else if (idx === question.correctIndex) {
                      className += 'border-green-500 text-green-400';
                    } else if (idx === selectedAnswer) {
                      className += 'border-red-500 text-red-400';
                    } else {
                      className += 'text-dark-text opacity-50';
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => !showResult && setSelectedAnswer(idx)}
                        className={className}
                        style={{ width: '100%' }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {showResult && (
                  <div className={`glass rounded-xl p-4 text-sm ${
                    selectedAnswer === question.correctIndex ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'
                  }`}>
                    {selectedAnswer === question.correctIndex ? '✅ Bonne réponse!' : '❌ Mauvaise réponse.'}
                    <p className="text-white/70 mt-1">{question.explanation}</p>
                  </div>
                )}
                {!showResult && selectedAnswer !== null && (
                  <button
                    onClick={handleQuizSubmit}
                    className="w-full bg-brand-orange text-white rounded-xl py-3 font-medium"
                  >
                    Valider
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'ai-summary' && (
          <div className="space-y-4">
            {loadingSummary ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-brand-orange">Génération du résumé...</div>
              </div>
            ) : aiSummary ? (
              <div className="glass rounded-xl p-4">
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
              </div>
            ) : (
              <p className="text-dark-text text-center py-8">Résumé non disponible.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
