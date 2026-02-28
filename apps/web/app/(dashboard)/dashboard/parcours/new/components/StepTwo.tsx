'use client';

import { useState, useCallback } from 'react';
import { Plus, GripVertical, Trash2, ChevronDown, ChevronUp, Play, FileText, CheckCircle, Lock, Upload, Link as LinkIcon } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { ProgramFormData, ModuleData, LessonData } from '../page';

interface StepTwoProps {
  data: ProgramFormData;
  onUpdate: (data: Partial<ProgramFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepTwo({ data, onUpdate, onNext, onBack }: StepTwoProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([data.modules[0]?.id]));
  const [paywallIndex, setPaywallIndex] = useState(data.paywallLessonIndex ?? 1);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const addModule = () => {
    const newModule: ModuleData = {
      id: `module-${Date.now()}`,
      title: `Module ${data.modules.length + 1}`,
      lessons: [],
    };
    onUpdate({ modules: [...data.modules, newModule] });
    setExpandedModules(new Set([...expandedModules, newModule.id]));
  };

  const updateModule = (moduleId: string, updates: Partial<ModuleData>) => {
    onUpdate({
      modules: data.modules.map((m) =>
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    });
  };

  const deleteModule = (moduleId: string) => {
    onUpdate({ modules: data.modules.filter((m) => m.id !== moduleId) });
  };

  const [pdfUploadingLessonId, setPdfUploadingLessonId] = useState<string | null>(null);

  const uploadPdf = useCallback(
    async (moduleId: string, lessonId: string, file: File) => {
      if (!file.type.includes('pdf')) return;
      setPdfUploadingLessonId(lessonId);
      try {
        const presignRes = await apiClient.post('/upload/presign', {
          filename: file.name,
          contentType: file.type,
          prefix: 'programs/pdfs',
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
        if (!uploadRes.ok) throw new Error('Upload failed');
        await apiClient.post('/upload/confirm', { objectKey });
        const module = data.modules.find((m) => m.id === moduleId);
        if (module) {
          const updatedLessons = module.lessons.map((l) =>
            l.id === lessonId
              ? { ...l, pdfKey: objectKey, title: file.name.replace(/\.pdf$/i, '') || l.title }
              : l
          );
          updateModule(moduleId, { lessons: updatedLessons });
        }
      } catch (e) {
        console.error(e);
        alert('Erreur lors du téléversement du PDF.');
      } finally {
        setPdfUploadingLessonId(null);
      }
    },
    [data.modules, updateModule],
  );

  const addLesson = (moduleId: string, type: 'VIDEO' | 'PDF' | 'EXERCISE') => {
    const module = data.modules.find((m) => m.id === moduleId);
    if (!module) return;

    const lessonTitles = {
      VIDEO: 'Leçon vidéo',
      PDF: 'Ressource PDF',
      EXERCISE: 'Exercice / Quiz',
    };

    const newLesson: LessonData = {
      id: `lesson-${Date.now()}`,
      title: lessonTitles[type],
      type,
      isFreePreview: false,
    };

    updateModule(moduleId, {
      lessons: [...module.lessons, newLesson],
    });
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<LessonData>) => {
    const module = data.modules.find((m) => m.id === moduleId);
    if (!module) return;

    updateModule(moduleId, {
      lessons: module.lessons.map((l) =>
        l.id === lessonId ? { ...l, ...updates } : l
      ),
    });
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    const module = data.modules.find((m) => m.id === moduleId);
    if (!module) return;

    updateModule(moduleId, {
      lessons: module.lessons.filter((l) => l.id !== lessonId),
    });
  };

  const toggleLessonAccess = (moduleId: string, lessonId: string) => {
    const module = data.modules.find((m) => m.id === moduleId);
    if (!module) return;

    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    updateLesson(moduleId, lessonId, {
      isFreePreview: !lesson.isFreePreview,
    });
  };

  // Get all lessons with their global index
  const getAllLessons = () => {
    const lessons: Array<{ moduleId: string; lesson: LessonData; globalIndex: number }> = [];
    let globalIndex = 0;

    data.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        lessons.push({ moduleId: module.id, lesson, globalIndex });
        globalIndex++;
      });
    });

    return lessons;
  };

  const allLessons = getAllLessons();
  const paywallLesson = allLessons[paywallIndex];

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Play className="w-4 h-4" />;
      case 'PDF':
        return <FileText className="w-4 h-4" />;
      case 'EXERCISE':
      case 'QUIZ':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getLessonIconColor = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'text-[#FF7A00]';
      case 'PDF':
        return 'text-blue-400';
      case 'EXERCISE':
      case 'QUIZ':
        return 'text-green-400';
      default:
        return 'text-white/60';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.modules.length > 0) {
      onUpdate({ paywallLessonIndex: paywallIndex });
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[#1A1A1A] rounded-xl p-8 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF7A00] flex items-center justify-center">
              <span className="text-white font-bold">📚</span>
            </div>
            <h2 className="text-xl font-bold text-white">Contenu du cours (Modules)</h2>
          </div>
          <p className="text-sm text-white/40">
            Glissez le seuil de paiement pour définir l'aperçu gratuit
          </p>
        </div>

        {/* Add Module Button */}
        <button
          type="button"
          onClick={addModule}
          className="w-full mb-4 px-4 py-3 bg-[#FF7A00] hover:bg-[#FF8A10] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter un module
        </button>

        {/* Modules List */}
        <div className="space-y-4">
          {data.modules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.has(module.id);
            const isFree = module.lessons.every((l) => l.isFreePreview);

            return (
              <div
                key={module.id}
                className="bg-[#0D0D0D] border border-white/[0.08] rounded-lg overflow-hidden"
              >
                {/* Module Header */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    type="button"
                    className="text-white/40 hover:text-white/60 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-[#FF7A00] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{moduleIndex + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => updateModule(module.id, { title: e.target.value })}
                    className="flex-1 bg-transparent text-white font-medium focus:outline-none"
                    placeholder="Titre du module"
                  />
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isFree
                        ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                        : 'bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/20'
                    }`}
                  >
                    {isFree ? 'GRATUIT' : 'PAYANT'}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteModule(module.id)}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="p-2 text-white/40 hover:text-white/80 hover:bg-white/[0.06] rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Module Content */}
                {isExpanded && (
                  <div className="border-t border-white/[0.08] px-4 py-4 space-y-2">
                    {/* Lessons */}
                    {module.lessons.map((lesson) => {
                      const lessonGlobalIndex = allLessons.findIndex(
                        (l) => l.moduleId === module.id && l.lesson.id === lesson.id
                      );
                      const isBeforePaywall = lessonGlobalIndex < paywallIndex;
                      const isPaywallLesson = lessonGlobalIndex === paywallIndex;

                      return (
                        <div key={lesson.id}>
                          {isPaywallLesson && (
                            <div className="relative my-4">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-[#FF7A00]"></div>
                              </div>
                              <div className="relative flex justify-center">
                                <span className="px-4 py-1 bg-[#FF7A00] text-white text-xs font-bold rounded-full flex items-center gap-2">
                                  <Lock className="w-3 h-3" />
                                  SEUIL DE PAIEMENT
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="p-3 bg-[#1A1A1A] rounded-lg space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${getLessonIconColor(lesson.type)}`}>
                                {getLessonIcon(lesson.type)}
                              </div>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) =>
                                  updateLesson(module.id, lesson.id, { title: e.target.value })
                                }
                                className="flex-1 bg-transparent text-white/90 text-sm focus:outline-none"
                                placeholder={lesson.type === 'VIDEO' ? 'Titre de la leçon vidéo' : lesson.type === 'PDF' ? 'Titre du document' : 'Titre de l\'exercice'}
                              />
                              {isBeforePaywall ? (
                                <span className="px-3 py-1 bg-[#FF7A00]/15 text-[#FF7A00] text-xs font-medium rounded border border-[#FF7A00]/20">
                                  APERÇU GRATUIT
                                </span>
                              ) : (
                                <span className="px-3 py-1 text-white/40 text-xs font-medium">
                                  VERROUILLÉ
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => toggleLessonAccess(module.id, lesson.id)}
                                className={`
                                  relative w-12 h-6 rounded-full transition-colors flex-shrink-0
                                  ${isBeforePaywall ? 'bg-green-500' : 'bg-white/[0.12]'}
                                `}
                              >
                                <div
                                  className={`
                                    absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                                    ${isBeforePaywall ? 'translate-x-7' : 'translate-x-1'}
                                  `}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteLesson(module.id, lesson.id)}
                                className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {/* Lien vidéo pour Leçon vidéo */}
                            {lesson.type === 'VIDEO' && (
                              <div className="pl-11">
                                <label className="block text-xs text-white/50 mb-1">Lien de la vidéo (YouTube, Vimeo, Dailymotion ou lien direct .mp4)</label>
                                <div className="flex items-center gap-2">
                                  <LinkIcon className="w-4 h-4 text-white/40 flex-shrink-0" />
                                  <input
                                    type="url"
                                    value={lesson.videoKey ?? ''}
                                    onChange={(e) =>
                                      updateLesson(module.id, lesson.id, { videoKey: e.target.value || undefined })
                                    }
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="flex-1 px-3 py-2 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF7A00]"
                                  />
                                </div>
                                {lesson.videoKey && !/youtube|youtu\.be|vimeo|dailymotion/i.test(lesson.videoKey) && !/\.(mp4|webm|ogg|mov)(\?|$)/i.test(lesson.videoKey) && (
                                  <p className="text-amber-400 text-xs mt-1 pl-6">⚠ Ce lien ne semble pas être une vidéo YouTube, Vimeo, Dailymotion ou un fichier vidéo direct (.mp4, .webm). Vérifiez l&apos;URL.</p>
                                )}
                              </div>
                            )}
                            {/* Upload PDF pour Ressource PDF */}
                            {lesson.type === 'PDF' && (
                              <div className="pl-11">
                                <label className="block text-xs text-white/50 mb-1">Fichier PDF</label>
                                {lesson.pdfKey ? (
                                  <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <FileText className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-green-400">PDF téléversé</span>
                                    <button
                                      type="button"
                                      onClick={() => updateLesson(module.id, lesson.id, { pdfKey: undefined })}
                                      className="ml-auto text-xs text-white/60 hover:text-red-400"
                                    >
                                      Changer
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex items-center gap-2 px-3 py-2 bg-[#0D0D0D] border border-white/[0.08] rounded-lg cursor-pointer hover:border-[#FF7A00]/40 transition-colors">
                                    <Upload className="w-4 h-4 text-white/40" />
                                    <span className="text-sm text-white/70">
                                      {pdfUploadingLessonId === lesson.id ? 'Téléversement...' : 'Choisir un fichier PDF'}
                                    </span>
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      className="hidden"
                                      disabled={pdfUploadingLessonId === lesson.id}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadPdf(module.id, lesson.id, file);
                                        e.target.value = '';
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Lesson Buttons */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => addLesson(module.id, 'VIDEO')}
                        className="px-3 py-1.5 bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20 text-[#FF7A00] text-xs font-medium rounded-full border border-[#FF7A00]/20 transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3" />
                        Leçon Vidéo
                      </button>
                      <button
                        type="button"
                        onClick={() => addLesson(module.id, 'PDF')}
                        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20 transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3 h-3" />
                        Ressource PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => addLesson(module.id, 'EXERCISE')}
                        className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/20 transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Exercice/Quiz
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {data.modules.length === 0 && (
          <div className="text-center py-12 text-white/40">
            Aucun module créé. Cliquez sur "Ajouter un module" pour commencer.
          </div>
        )}
      </div>

      {/* Paywall Slider */}
      {allLessons.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-white/[0.06]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white font-medium mb-1">Seuil de paiement</h3>
              <p className="text-sm text-white/40">
                Les leçons avant ce seuil seront gratuites (aperçu)
              </p>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">
                Leçon {paywallIndex + 1} / {allLessons.length}
              </div>
              <div className="text-sm text-white/40">
                {paywallLesson?.lesson.title}
              </div>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={allLessons.length - 1}
            value={paywallIndex}
            onChange={(e) => setPaywallIndex(parseInt(e.target.value))}
            className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#FF7A00]"
          />
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>Tout gratuit</span>
            <span>Tout payant</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-white/[0.06] hover:bg-white/[0.08] text-white/80 font-medium rounded-lg transition-colors"
        >
          Retour
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-6 py-3 border border-white/[0.12] hover:border-white/[0.20] text-white/80 font-medium rounded-lg transition-colors"
          >
            Enregistrer le brouillon
          </button>
          <button
            type="submit"
            disabled={data.modules.length === 0}
            className="px-6 py-3 bg-[#FF7A00] hover:bg-[#FF8A10] text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
            <span>→</span>
          </button>
        </div>
      </div>
    </form>
  );
}
