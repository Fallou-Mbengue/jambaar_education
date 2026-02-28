'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Edit,
  Trash2,
  Globe,
  Lock,
  Play,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

interface Lesson {
  id: string;
  order: number;
  title: string;
  contentId: string;
  content?: {
    id: string;
    type: string;
    durationSeconds?: number;
  };
}

interface CourseModule {
  id: string;
  order: number;
  title: string;
  courseId: string;
  course: {
    id: string;
    title: string;
    modules: Lesson[];
  };
}

interface ProgramDetail {
  id: string;
  title: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  isPremium: boolean;
  durationDays: number | null;
  tags: string[];
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  modules: CourseModule[];
  progress: {
    progressPercent: number;
    isCompleted: boolean;
  } | null;
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
        isActive
          ? 'bg-green-500/15 text-green-400 border border-green-500/20'
          : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400' : 'bg-yellow-400'}`} />
      {isActive ? 'Publié' : 'Brouillon'}
    </span>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours}h ${remainMins}min` : `${hours}h`;
}

function ContentTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'VIDEO':
      return <Play className="w-4 h-4 text-blue-400" />;
    case 'ARTICLE':
      return <FileText className="w-4 h-4 text-purple-400" />;
    case 'QUIZ':
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    default:
      return <BookOpen className="w-4 h-4 text-gray-400" />;
  }
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const { data: program, isLoading, refetch } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      const res = await apiClient.get(`/programs/${id}`);
      return res.data.data as ProgramDetail;
    },
    enabled: !!id,
  });

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await apiClient.post(`/programs/admin/${id}/publish`);
      await refetch();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Erreur lors de la publication';
      alert(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce parcours ? Cette action est irréversible.')) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/programs/admin/${id}`);
      router.push('/dashboard/parcours');
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Erreur lors de la suppression';
      alert(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalLessons = program?.modules.reduce(
    (acc, m) => acc + (m.course?.modules?.length ?? 0),
    0,
  ) ?? 0;

  const totalDuration = program?.modules.reduce(
    (acc, m) =>
      acc +
      (m.course?.modules ?? []).reduce(
        (a, l) => a + (l.content?.durationSeconds ?? 0),
        0,
      ),
    0,
  ) ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/[0.04] rounded animate-pulse" />
        <div className="bg-[#1A1A1A] rounded-xl p-8 border border-white/[0.06] animate-pulse">
          <div className="h-6 w-64 bg-white/[0.04] rounded mb-4" />
          <div className="h-4 w-full bg-white/[0.04] rounded mb-2" />
          <div className="h-4 w-3/4 bg-white/[0.04] rounded" />
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-20">
        <p className="text-white/60 text-lg mb-4">Parcours introuvable</p>
        <Link
          href="/dashboard/parcours"
          className="text-[#FF7A00] hover:underline"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/parcours"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour aux parcours</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/parcours/${id}/edit`}
            className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E86E00] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
          {program.status === 'INACTIVE' && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              {isPublishing ? 'Publication...' : 'Publier'}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-[#1A1A1A] rounded-xl border border-white/[0.06] overflow-hidden">
        {program.thumbnailUrl && (
          <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800">
            <img
              src={program.thumbnailUrl}
              alt={program.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <StatusBadge status={program.status} />
                {program.isPremium ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FF7A00]/15 text-[#FF7A00] rounded-full text-xs font-semibold border border-[#FF7A00]/20">
                    <Lock className="w-3 h-3" />
                    Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/15 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/20">
                    <Globe className="w-3 h-3" />
                    Gratuit
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{program.title}</h1>
              {program.description && (
                <p className="text-white/60 leading-relaxed">{program.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#0D0D0D] rounded-lg p-4 border border-white/[0.06]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                Modules
              </div>
              <div className="text-xl font-bold text-white">{program.modules.length}</div>
            </div>
            <div className="bg-[#0D0D0D] rounded-lg p-4 border border-white/[0.06]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Play className="w-3.5 h-3.5" />
                Leçons
              </div>
              <div className="text-xl font-bold text-white">{totalLessons}</div>
            </div>
            <div className="bg-[#0D0D0D] rounded-lg p-4 border border-white/[0.06]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Clock className="w-3.5 h-3.5" />
                Durée totale
              </div>
              <div className="text-xl font-bold text-white">
                {totalDuration > 0 ? formatDuration(totalDuration) : '—'}
              </div>
            </div>
            <div className="bg-[#0D0D0D] rounded-lg p-4 border border-white/[0.06]">
              <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                <Users className="w-3.5 h-3.5" />
                Progression
              </div>
              <div className="text-xl font-bold text-white">
                {program.progress?.progressPercent ?? 0}%
              </div>
            </div>
          </div>

          {/* Prix et accès */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <span className="text-white/40">Accès :</span>
            <span className={program.isPremium ? 'text-[#FF7A00] font-medium' : 'text-green-400 font-medium'}>
              {program.isPremium ? 'Premium (payant)' : 'Gratuit'}
            </span>
            {program.durationDays != null && (
              <>
                <span className="text-white/30">·</span>
                <span className="text-white/60">
                  {program.durationDays === 30
                    ? '30 jours'
                    : program.durationDays === 90
                      ? '90 jours'
                      : program.durationDays === 365
                        ? '1 an'
                        : `${program.durationDays} jours`}
                </span>
              </>
            )}
            {program.durationDays == null && (
              <>
                <span className="text-white/30">·</span>
                <span className="text-white/60">Accès à vie</span>
              </>
            )}
          </div>

          {/* Tags */}
          {program.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {program.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/[0.06] text-white/60 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Curriculum */}
      <div className="bg-[#1A1A1A] rounded-xl p-8 border border-white/[0.06]">
        <h2 className="text-lg font-bold text-white mb-6">Programme du parcours</h2>

        {program.modules.length === 0 ? (
          <p className="text-white/40 text-center py-8">
            Aucun module dans ce parcours.
          </p>
        ) : (
          <div className="space-y-4">
            {program.modules.map((mod, idx) => (
              <div
                key={mod.id}
                className="bg-[#0D0D0D] rounded-lg border border-white/[0.06] overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="w-8 h-8 rounded-lg bg-[#FF7A00]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#FF7A00] text-sm font-bold">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {mod.title || mod.course?.title || `Module ${idx + 1}`}
                    </h3>
                    <p className="text-white/40 text-xs">
                      {mod.course?.modules?.length ?? 0} leçon(s)
                    </p>
                  </div>
                </div>

                {mod.course?.modules && mod.course.modules.length > 0 && (
                  <div className="border-t border-white/[0.04]">
                    {mod.course.modules.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-b-0"
                      >
                        <span className="text-white/20 text-xs w-6 text-right flex-shrink-0">
                          {lIdx + 1}
                        </span>
                        <ContentTypeIcon type={lesson.content?.type ?? ''} />
                        <span className="text-white/80 text-sm flex-1 truncate">
                          {lesson.title}
                        </span>
                        {lesson.content?.durationSeconds && lesson.content.durationSeconds > 0 && (
                          <span className="text-white/30 text-xs flex-shrink-0">
                            {formatDuration(lesson.content.durationSeconds)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
