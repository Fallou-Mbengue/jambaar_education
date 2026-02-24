'use client';

import { useState } from 'react';
import { ArrowLeft, FileText, Grid3x3, DollarSign, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StepOne from './components/StepOne';
import StepTwo from './components/StepTwo';
import StepThree from './components/StepThree';

export interface LessonData {
  id: string;
  title: string;
  type: 'VIDEO' | 'PDF' | 'EXERCISE' | 'QUIZ';
  description?: string;
  durationSeconds?: number;
  isFreePreview: boolean;
  videoKey?: string;
  pdfKey?: string;
  exerciseBody?: string;
}

export interface ModuleData {
  id: string;
  title: string;
  description?: string;
  lessons: LessonData[];
}

export interface ProgramFormData {
  // Step 1
  title: string;
  description: string;
  category: string;
  difficulty: string;
  thumbnailKey?: string;

  // Step 2
  modules: ModuleData[];
  paywallLessonIndex?: number;

  // Step 3
  price: number;
  isFree: boolean;
  accessDuration: string;
  hasCertification: boolean;
}

const STEPS = [
  { id: 1, name: 'Informations générales', icon: FileText },
  { id: 2, name: 'Contenu du cours', icon: Grid3x3 },
  { id: 3, name: 'Prix & Accès', icon: DollarSign },
  { id: 4, name: 'Paramètres avancés', icon: Settings },
];

export default function NewProgramPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProgramFormData>({
    title: '',
    description: '',
    category: 'DEVELOPPEMENT_WEB',
    difficulty: 'DEBUTANT',
    modules: [],
    price: 0,
    isFree: false,
    accessDuration: 'lifetime',
    hasCertification: true,
  });

  const updateFormData = (data: Partial<ProgramFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/dashboard/parcours');
    }
  };

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Header */}
      <div className="border-b border-white/[0.08] bg-[#0D0D0D]">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/dashboard/parcours"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.06] hover:bg-white/[0.08] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Quitter création</h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            {STEPS.slice(0, 3).map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all
                    ${isActive
                      ? 'bg-[#FF7A00] text-white'
                      : isCompleted
                      ? 'bg-white/[0.06] text-white/80 hover:bg-white/[0.08]'
                      : 'bg-white/[0.04] text-white/40'
                    }
                  `}
                  disabled={!isCompleted && !isActive}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{step.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {currentStep === 1 && (
            <StepOne
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 2 && (
            <StepTwo
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <StepThree
              data={formData}
              onUpdate={updateFormData}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
