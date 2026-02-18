'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

function BillingStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('paymentId');
  const [status, setStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED'>('PENDING');
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!paymentId) return;

    const poll = async () => {
      try {
        const res = await apiClient.get(`/billing/payment/${paymentId}`);
        const paymentStatus = res.data.data?.status as 'PENDING' | 'SUCCESS' | 'FAILED';
        setStatus(paymentStatus);
        if (paymentStatus === 'PENDING' && pollCount < 12) {
          setPollCount((c) => c + 1);
          setTimeout(poll, 5000); // poll every 5s, max 60s
        }
      } catch {
        setStatus('FAILED');
      }
    };

    poll();
  }, [paymentId]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full glass rounded-2xl p-8">
        {status === 'PENDING' && (
          <>
            <Clock size={64} className="text-brand-gold mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-bold text-dark-text mb-2">Paiement en cours...</h1>
            <p className="text-dark-text text-sm">
              Confirmez la transaction sur votre téléphone.
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-brand-orange rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </>
        )}

        {status === 'SUCCESS' && (
          <>
            <CheckCircle size={64} className="text-brand-green mx-auto mb-4" />
            <h1 className="text-xl font-bold text-dark-text mb-2">Paiement confirmé ! 🎉</h1>
            <p className="text-dark-text text-sm mb-6">
              Ton abonnement est maintenant actif. Bonne chance dans ton apprentissage !
            </p>
            <button
              onClick={() => router.push('/home')}
              className="w-full bg-brand-orange text-dark-text font-bold py-3 rounded-xl"
            >
              Commencer à apprendre
            </button>
          </>
        )}

        {status === 'FAILED' && (
          <>
            <XCircle size={64} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-dark-text mb-2">Paiement échoué</h1>
            <p className="text-dark-text text-sm mb-6">
              Le paiement n&apos;a pas pu être traité. Vérifie ton solde et réessaie.
            </p>
            <button
              onClick={() => router.push('/billing')}
              className="w-full bg-brand-orange text-dark-text font-bold py-3 rounded-xl"
            >
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BillingStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4">
        <Clock size={48} className="text-brand-gold animate-spin" />
      </div>
    }>
      <BillingStatusContent />
    </Suspense>
  );
}
