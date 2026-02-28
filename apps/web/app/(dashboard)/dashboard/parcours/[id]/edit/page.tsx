'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

const CATEGORIES = [
  { value: 'DEVELOPPEMENT_WEB', label: 'Développement Web' },
  { value: 'ENTREPRENEURIAT', label: 'Entrepreneuriat' },
  { value: 'SOFT_SKILLS', label: 'Soft Skills' },
  { value: 'LEADERSHIP', label: 'Leadership' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'DESIGN', label: 'Design' },
];

const DIFFICULTIES = [
  { value: 'DEBUTANT', label: 'Débutant' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
  { value: 'AVANCE', label: 'Avancé' },
];

const ACCESS_DURATIONS = [
  { value: 'lifetime', label: 'Accès à vie' },
  { value: '30days', label: '30 jours' },
  { value: '90days', label: '90 jours' },
  { value: '1year', label: '1 an' },
];

const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);
const DIFFICULTY_VALUES = DIFFICULTIES.map((d) => d.value);

interface ProgramDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  isPremium: boolean;
  durationDays: number | null;
  tags: string[];
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
}

function getCategoryFromTags(tags: string[]): string {
  const found = tags.find((t) => CATEGORY_VALUES.includes(t));
  return found ?? 'DEVELOPPEMENT_WEB';
}

function getDifficultyFromTags(tags: string[]): string {
  const found = tags.find((t) => DIFFICULTY_VALUES.includes(t));
  return found ?? 'DEBUTANT';
}

function getAccessDurationFromDays(days: number | null): string {
  if (days === null) return 'lifetime';
  if (days === 30) return '30days';
  if (days === 90) return '90days';
  if (days === 365) return '1year';
  return 'lifetime';
}

export default function EditProgramPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('DEVELOPPEMENT_WEB');
  const [difficulty, setDifficulty] = useState('DEBUTANT');
  const [thumbnailKey, setThumbnailKey] = useState<string | undefined>(undefined);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [accessDuration, setAccessDuration] = useState('lifetime');
  const [hasCertification, setHasCertification] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: program, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      const res = await apiClient.get(`/programs/${id}`);
      return res.data.data as ProgramDetail;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!program) return;
    setTitle(program.title);
    setDescription(program.description ?? '');
    setCategory(getCategoryFromTags(program.tags));
    setDifficulty(getDifficultyFromTags(program.tags));
    setThumbnailKey(program.thumbnailKey ?? undefined);
    setUploadedImage(program.thumbnailUrl ?? null);
    setPrice(0);
    setIsFree(!program.isPremium);
    setAccessDuration(getAccessDurationFromDays(program.durationDays));
  }, [program]);

  const uploadImage = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const presignRes = await apiClient.post('/upload/presign', {
        filename: file.name,
        contentType: file.type,
        prefix: 'programs',
      });
      const { presignedUrl, objectKey } = presignRes.data.data as {
        presignedUrl: string;
        objectKey: string;
      };
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error('Failed to upload file');
      const confirmRes = await apiClient.post('/upload/confirm', { objectKey });
      const { readUrl } = confirmRes.data.data as { readUrl: string };
      setUploadedImage(readUrl);
      setThumbnailKey(objectKey);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError("Erreur lors du téléchargement de l'image.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const tags = [category, difficulty];
      await apiClient.patch(`/programs/admin/${id}`, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        difficulty,
        thumbnailKey: thumbnailKey || undefined,
        price: isFree ? 0 : price,
        isFree,
        accessDuration,
        hasCertification,
        tags,
      });
      await queryClient.invalidateQueries({ queryKey: ['program', id] });
      router.push(`/dashboard/parcours/${id}`);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ??
        error?.message ??
        'Erreur lors de l\'enregistrement';
      alert(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/[0.04] rounded animate-pulse" />
        <div className="bg-[#1A1A1A] rounded-xl p-8 border border-white/[0.06] animate-pulse">
          <div className="h-6 w-64 bg-white/[0.04] rounded mb-4" />
          <div className="h-4 w-full bg-white/[0.04] rounded" />
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-20">
        <p className="text-white/60 text-lg mb-4">Parcours introuvable</p>
        <Link href="/dashboard/parcours" className="text-[#FF7A00] hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/parcours/${id}`}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour au parcours</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#1A1A1A] rounded-xl p-8 border border-white/[0.06]">
          <h2 className="text-xl font-bold text-white mb-6">Informations générales</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Titre du parcours</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Masterclass Développement Fullstack"
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF7A00]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez les objectifs et prérequis..."
                rows={6}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF7A00] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#FF7A00]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Difficulté</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#FF7A00]"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Image de couverture
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file?.type.startsWith('image/')) uploadImage(file);
                }}
                className="border-2 border-dashed border-white/[0.12] rounded-lg bg-[#0D0D0D] overflow-hidden"
              >
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Couverture"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImage(null);
                        setThumbnailKey(undefined);
                      }}
                      className="absolute top-2 right-2 px-3 py-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
                    <Upload className="w-10 h-10 text-[#FF7A00] mb-2" />
                    <span className="text-white/60 text-sm">
                      Cliquez ou glissez une image (PNG, JPG, WEBP)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file);
                      }}
                      disabled={isUploading}
                    />
                  </label>
                )}
                {isUploading && (
                  <div className="py-2 text-center text-white/60 text-sm">Téléchargement...</div>
                )}
                {uploadError && <p className="px-4 py-2 text-sm text-red-400">{uploadError}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-8 border border-white/[0.06]">
          <h2 className="text-xl font-bold text-white mb-6">Prix & Accès</h2>
          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Prix (FCFA)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                disabled={isFree}
                min={0}
                step={1}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white disabled:opacity-50"
              />
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-4 h-4 rounded border-white/[0.12] bg-[#0D0D0D] text-[#FF7A00]"
                />
                <span className="text-sm text-white/80">Parcours gratuit</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Durée de l&apos;accès
              </label>
              <select
                value={accessDuration}
                onChange={(e) => setAccessDuration(e.target.value)}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#FF7A00]"
              >
                {ACCESS_DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setHasCertification(!hasCertification)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                hasCertification ? 'bg-[#FF7A00]' : 'bg-white/[0.12]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  hasCertification ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-white/80">
              Certification Jambaar : {hasCertification ? 'Activée' : 'Désactivée'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/parcours/${id}`}
            className="px-6 py-3 bg-white/[0.06] hover:bg-white/[0.08] text-white/80 font-medium rounded-lg transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#FF7A00] hover:bg-[#E86E00] text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
