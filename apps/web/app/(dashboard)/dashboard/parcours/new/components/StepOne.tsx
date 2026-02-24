'use client';

import { useState, useCallback } from 'react';
import { Bold, Italic, AlignLeft, Link as LinkIcon, Upload } from 'lucide-react';
import { ProgramFormData } from '../page';

interface StepOneProps {
  data: ProgramFormData;
  onUpdate: (data: Partial<ProgramFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

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

export default function StepOne({ data, onUpdate, onNext, onBack }: StepOneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await uploadImage(file);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  }, []);

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      // Get presigned URL
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          prefix: 'programs',
        }),
      });

      if (!presignRes.ok) throw new Error('Failed to get upload URL');

      const { uploadUrl, objectKey } = await presignRes.json();

      // Upload to MinIO
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload file');

      // Confirm upload
      const confirmRes = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectKey }),
      });

      if (!confirmRes.ok) throw new Error('Failed to confirm upload');

      const { readUrl } = await confirmRes.json();

      setUploadedImage(readUrl);
      onUpdate({ thumbnailKey: objectKey });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors du téléchargement de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.title.trim()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[#1A1A1A] rounded-xl p-8 border border-white/[0.06]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#FF7A00] flex items-center justify-center">
            <span className="text-white font-bold">📄</span>
          </div>
          <h2 className="text-xl font-bold text-white">Informations générales</h2>
        </div>

        <div className="space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Titre du parcours
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Ex. Masterclass Développement Fullstack"
              className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF7A00]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description détaillée
            </label>
            <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-lg overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.08]">
                <button
                  type="button"
                  className="p-2 text-white/60 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 text-white/60 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 text-white/60 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
                  title="Align"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 text-white/60 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
                  title="Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
              {/* Textarea */}
              <textarea
                value={data.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Décrivez les objectifs et prérequis du cours..."
                rows={8}
                className="w-full px-4 py-3 bg-transparent text-white placeholder:text-white/30 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Catégorie
              </label>
              <select
                value={data.category}
                onChange={(e) => onUpdate({ category: e.target.value })}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#FF7A00] appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Difficulté
              </label>
              <select
                value={data.difficulty}
                onChange={(e) => onUpdate({ difficulty: e.target.value })}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#FF7A00] appearance-none cursor-pointer"
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Image de couverture
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg transition-colors cursor-pointer overflow-hidden
                ${isDragging
                  ? 'border-[#FF7A00] bg-[#FF7A00]/10'
                  : 'border-white/[0.12] bg-[#0D0D0D] hover:border-white/[0.20]'
                }
              `}
            >
              {uploadedImage ? (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedImage(null);
                      onUpdate({ thumbnailKey: undefined });
                    }}
                    className="absolute top-4 right-4 px-4 py-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-16 cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-[#FF7A00]/15 flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-[#FF7A00]" />
                  </div>
                  <p className="text-white/80 font-medium mb-1">
                    Cliquez pour téléverser ou glissez-déposez
                  </p>
                  <p className="text-white/40 text-sm">
                    PNG, JPG ou WEBP (Max. 5MB - 1280x720 recommandé)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-white text-sm">Téléchargement...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
            className="px-6 py-3 bg-[#FF7A00] hover:bg-[#FF8A10] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            Suivant
            <span>→</span>
          </button>
        </div>
      </div>
    </form>
  );
}
