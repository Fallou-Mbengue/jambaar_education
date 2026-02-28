'use client';

import { useState } from 'react';
import { AlertCircle, Rocket, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { ProgramFormData } from '../page';

interface StepThreeProps {
  data: ProgramFormData;
  onUpdate: (data: Partial<ProgramFormData>) => void;
  onBack: () => void;
}

const ACCESS_DURATIONS = [
  { value: 'lifetime', label: 'Accès à vie' },
  { value: '30days', label: '30 jours' },
  { value: '90days', label: '90 jours' },
  { value: '1year', label: '1 an' },
];

export default function StepThree({ data, onUpdate, onBack }: StepThreeProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Préparation des données pour l'API
      const programData = {
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        thumbnailKey: data.thumbnailKey,
        modules: data.modules.map((module) => ({
          title: module.title,
          description: module.description,
          lessons: module.lessons.map((lesson) => ({
            title: lesson.title,
            type: lesson.type,
            description: lesson.description,
            durationSeconds: lesson.durationSeconds,
            isFreePreview: lesson.isFreePreview,
            videoKey: lesson.videoKey,
            pdfKey: lesson.pdfKey,
            exerciseBody: lesson.exerciseBody,
          })),
        })),
        price: data.isFree ? 0 : data.price,
        isFree: data.isFree,
        accessDuration: data.accessDuration,
        hasCertification: data.hasCertification,
        paywallLessonIndex: data.paywallLessonIndex,
      };

      // Création du programme via l'API Nest (proxy /api/v1)
      const createRes = await apiClient.post('/programs/admin/create', programData);
      const program = createRes.data.data as { id: string };

      // Si ce n'est pas un brouillon, on publie immédiatement
      if (!isDraft) {
        await apiClient.post(`/programs/admin/${program.id}/publish`);
      }

      // Redirection vers la page détail du parcours créé pour afficher toutes les informations
      router.push(`/dashboard/parcours/${program.id}`);
    } catch (error: any) {
      console.error('Submit error:', error);
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'Erreur lors de la création du parcours';
      alert(Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paywallLesson = (() => {
    let index = 0;
    for (const module of data.modules) {
      for (const lesson of module.lessons) {
        if (index === data.paywallLessonIndex) {
          return lesson;
        }
        index++;
      }
    }
    return null;
  })();

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <div className="bg-[#1A1A1A] rounded-xl p-8 border border-white/[0.06]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#FF7A00] flex items-center justify-center">
            <span className="text-white font-bold">💰</span>
          </div>
          <h2 className="text-xl font-bold text-white">Prix & Accès</h2>
        </div>

        <div className="space-y-6">
          {/* Pricing */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tarification du parcours
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={data.price}
                  onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
                  disabled={data.isFree}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#FF7A00] disabled:opacity-50"
                  min="0"
                  step="0.01"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">
                  FCFA
                </div>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.isFree}
                  onChange={(e) => onUpdate({ isFree: e.target.checked })}
                  className="w-4 h-4 rounded border-white/[0.12] bg-[#0D0D0D] text-[#FF7A00] focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-sm text-white/80">Définir ce cours comme gratuit</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Durée de l'accès
              </label>
              <select
                value={data.accessDuration}
                onChange={(e) => onUpdate({ accessDuration: e.target.value })}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#FF7A00] appearance-none cursor-pointer"
              >
                {ACCESS_DURATIONS.map((duration) => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/40 mt-2">
                Les étudiants perdent l'accès au contenu après cette période.
              </p>
            </div>
          </div>

          {/* Paywall Info */}
          {paywallLesson && !data.isFree && (
            <div className="bg-[#0D0D0D] border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <p className="text-white/90 text-sm mb-1">
                    L'accès devient payant à partir de :{' '}
                    <span className="text-[#FF7A00] font-medium">{paywallLesson.title}</span>
                  </p>
                  <p className="text-white/40 text-xs">
                    Les leçons précédentes seront accessibles en tant qu'aperçu gratuit (Free Preview).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Certification */}
          <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-medium">Certification Jambaar</h3>
                  <div className="w-5 h-5 rounded-full bg-[#FF7A00]/15 flex items-center justify-center">
                    <Info className="w-3 h-3 text-[#FF7A00]" />
                  </div>
                </div>
                <p className="text-sm text-white/60 mb-4">
                  En activant cette option, un certificat de réussite généré automatiquement sera
                  délivré aux étudiants ayant complété 100% des modules et réussi le challenge
                  final.
                </p>
                <button
                  type="button"
                  onClick={() => onUpdate({ hasCertification: !data.hasCertification })}
                  className={`
                    relative w-16 h-8 rounded-full transition-colors
                    ${data.hasCertification ? 'bg-[#FF7A00]' : 'bg-white/[0.12]'}
                  `}
                >
                  <div
                    className={`
                      absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-lg
                      ${data.hasCertification ? 'translate-x-9' : 'translate-x-1'}
                    `}
                  />
                </button>
                <span
                  className={`
                    ml-3 text-sm font-medium
                    ${data.hasCertification ? 'text-[#FF7A00]' : 'text-white/40'}
                  `}
                >
                  {data.hasCertification ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-3 bg-white/[0.06] hover:bg-white/[0.08] text-white/80 font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          Retour
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className="px-6 py-3 border border-white/[0.12] hover:border-white/[0.20] text-white/80 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le brouillon'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#FF7A00] hover:bg-[#FF8A10] text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Rocket className="w-5 h-5" />
            {isSubmitting ? 'Publication...' : 'Publier le parcours'}
          </button>
        </div>
      </div>
    </form>
  );
}
