'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/api/client';
import { OBJECTIVES, INTERESTS } from '@jambaar/shared';

const LEVELS = [
  { value: 'beginner', label: 'Débutant', icon: '🌱', desc: 'Je commence ma carrière' },
  { value: 'intermediate', label: 'Intermédiaire', icon: '🌿', desc: '1-3 ans d\'expérience' },
  { value: 'advanced', label: 'Confirmé', icon: '🌳', desc: '3+ ans d\'expérience' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(1);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [level, setLevel] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleObjective = (val: string) =>
    setObjectives((prev) =>
      prev.includes(val) ? prev.filter((o) => o !== val) : [...prev, val],
    );

  const toggleInterest = (val: string) =>
    setInterests((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val],
    );

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await apiClient.post('/users/onboarding', { objectives, interests, level });
      if (user) {
        setUser({
          ...user,
          profile: { ...user.profile!, onboardingDone: true },
        });
      }
      router.push('/home');
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-[#0D0D0D] p-4 flex flex-col">
      {/* Progress */}
      <div className="flex gap-2 mb-8 mt-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-[#FF7A00]' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2 text-white">Quel est ton objectif ?</h1>
          <p className="text-white/80 mb-6">Sélectionne ce qui te correspond le mieux.</p>
          <div className="space-y-3">
            {OBJECTIVES.map((obj) => (
              <button
                key={obj.value}
                onClick={() => toggleObjective(obj.value)}
                className={`w-full text-left px-4 py-4 rounded-xl border transition-all text-white ${
                  objectives.includes(obj.value)
                    ? 'border-[#FF7A00] bg-[#FF7A00]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                {obj.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2 text-white">Ton niveau actuel ?</h1>
          <p className="text-white/80 mb-6">Pour personnaliser ton parcours.</p>
          <div className="space-y-3">
            {LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setLevel(lvl.value)}
                className={`w-full text-left px-4 py-4 rounded-xl border transition-all flex items-center gap-4 text-white ${
                  level === lvl.value
                    ? 'border-[#FF7A00] bg-[#FF7A00]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                <span className="text-2xl">{lvl.icon}</span>
                <div>
                  <div className="font-semibold">{lvl.label}</div>
                  <div className="text-sm text-white/70">{lvl.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2 text-white">Tes centres d&apos;intérêt</h1>
          <p className="text-white/80 mb-6">Choisis au moins 2 domaines à explorer.</p>
          <div className="grid grid-cols-2 gap-3">
            {INTERESTS.map((interest) => (
              <button
                key={interest.value}
                onClick={() => toggleInterest(interest.value)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  interests.includes(interest.value)
                    ? 'border-[#FF7A00] bg-[#FF7A00]/10 text-[#FF7A00]'
                    : 'border-white/10 bg-white/5 text-white hover:border-white/30'
                }`}
              >
                {interest.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 pb-4 flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
          >
            Retour
          </button>
        )}
        <button
          onClick={() => {
            if (step < 3) {
              if (step === 1 && objectives.length === 0) return;
              if (step === 2 && !level) return;
              setStep((s) => s + 1);
            } else {
              if (interests.length < 1) return;
              handleSubmit();
            }
          }}
          disabled={
            (step === 1 && objectives.length === 0) ||
            (step === 2 && !level) ||
            (step === 3 && interests.length < 1) ||
            loading
          }
          className="flex-1 bg-[#FF7A00] hover:bg-[#E86E00] disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {step === 3 ? (loading ? 'Chargement...' : 'Commencer 🚀') : 'Continuer'}
        </button>
      </div>
    </div>
  );
}
