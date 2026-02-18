'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  billingPeriod: string;
  priceXof: number;
  features: string[];
}

const PERIOD_LABELS: Record<string, string> = {
  WEEKLY: 'Hebdomadaire',
  MONTHLY: 'Mensuel',
  QUARTERLY: 'Trimestriel',
};

export default function BillingPage() {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'WAVE' | 'ORANGE_MONEY'>('WAVE');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await apiClient.get('/billing/plans');
      return res.data.data as Plan[];
    },
  });

  const { data: status } = useQuery({
    queryKey: ['billing-status'],
    queryFn: async () => {
      const res = await apiClient.get('/billing/status');
      return res.data.data;
    },
  });

  const handleSubscribe = async () => {
    if (!selectedPlanId || !phone) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/billing/subscribe', {
        planId: selectedPlanId,
        provider: selectedProvider,
        phoneNumber: phone,
      });
      const { paymentId } = res.data.data;
      router.push(`/billing/status?paymentId=${paymentId}`);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur de paiement');
    } finally {
      setLoading(false);
    }
  };

  if (status?.isActive) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto text-center">
        <div className="mt-16">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-2xl font-bold text-brand-orange">Abonnement Actif !</h1>
          <p className="text-dark-text mt-2">
            {status.subscription?.plan?.name} — Expire le{' '}
            {new Date(status.subscription?.endDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Choisir un abonnement</h1>
      <p className="text-dark-text text-sm mb-6">Accède à tout le contenu premium.</p>

      {/* Plans */}
      <div className="space-y-3 mb-6">
        {(plans ?? []).map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlanId(plan.id)}
            className={`w-full glass rounded-2xl p-4 text-left transition-all ${
              selectedPlanId === plan.id
                ? 'border-brand-orange bg-brand-orange/10'
                : 'hover:border-white/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-bold text-dark-text">{plan.name}</span>
                <span className="text-dark-text text-sm ml-2">
                  ({PERIOD_LABELS[plan.billingPeriod]})
                </span>
              </div>
              <div className="text-right">
                <span className="text-brand-orange font-bold text-lg">
                  {plan.priceXof.toLocaleString()} F
                </span>
              </div>
            </div>
            <ul className="space-y-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-dark-text">
                  <Check size={14} className="text-brand-green flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Payment method */}
      {selectedPlanId && (
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-text">Mode de paiement</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['WAVE', 'ORANGE_MONEY'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedProvider(p)}
                className={`glass rounded-xl p-3 text-center transition-all ${
                  selectedProvider === p ? 'border-brand-orange bg-brand-orange/10' : 'hover:border-white/30'
                }`}
              >
                <div className="text-2xl mb-1">{p === 'WAVE' ? '🌊' : '🟠'}</div>
                <p className="text-sm font-medium text-dark-text">
                  {p === 'WAVE' ? 'Wave' : 'Orange Money'}
                </p>
              </button>
            ))}
          </div>

          <div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="Numéro de téléphone"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-dark-text placeholder-dark-text focus:outline-none focus:border-brand-orange transition-colors"
            />
          </div>

          <button
            onClick={handleSubscribe}
            disabled={!phone || loading}
            className="w-full bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-40 text-dark-text font-bold py-4 rounded-xl transition-colors"
          >
            {loading ? 'Traitement...' : 'Confirmer le paiement'}
          </button>

          <p className="text-xs text-dark-text text-center">
            En confirmant, vous acceptez nos conditions d&apos;utilisation. Paiement sécurisé.
          </p>
        </div>
      )}
    </div>
  );
}
