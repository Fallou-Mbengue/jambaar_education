'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { UserDetail } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge, PremiumBadge } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Shield, UserX, UserCheck, Zap, ZapOff, Award } from 'lucide-react';

type Tab = 'overview' | 'progress' | 'gamification' | 'billing' | 'activity';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const [tab, setTab] = useState<Tab>('overview');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [xpDelta, setXpDelta] = useState(0);
  const [resetStreak, setResetStreak] = useState(false);
  const [adjustReason, setAdjustReason] = useState('');
  const [premiumDays, setPremiumDays] = useState(30);
  const [premiumReason, setPremiumReason] = useState('');

  const { data: user, isLoading } = useQuery<UserDetail>({
    queryKey: ['admin-users', id],
    queryFn: () => api.get(`/dashboard/users/${id}`),
  });

  const changeRole = useMutation({
    mutationFn: () => api.patch(`/dashboard/users/${id}/role`, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Rôle modifié');
      setShowRoleModal(false);
    },
  });

  const changeStatus = useMutation({
    mutationFn: (status: string) => api.patch(`/dashboard/users/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Statut modifié');
    },
  });

  const adjustGamification = useMutation({
    mutationFn: () => api.post(`/dashboard/users/${id}/gamification/adjust`, { xpDelta, resetStreak, reason: adjustReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Gamification ajustée');
      setShowAdjustModal(false);
      setAdjustReason('');
    },
  });

  const grantPremium = useMutation({
    mutationFn: () => api.post(`/dashboard/users/${id}/premium/grant`, { days: premiumDays, reason: premiumReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Premium accordé');
      setShowPremiumModal(false);
    },
  });

  const revokePremium = useMutation({
    mutationFn: () => api.post(`/dashboard/users/${id}/premium/revoke`, { reason: 'Admin revocation' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Premium retiré');
    },
  });

  if (isLoading) return <div className="animate-pulse p-6"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;
  if (!user) return <div>Utilisateur non trouvé</div>;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Aperçu' },
    { key: 'progress', label: 'Progression' },
    { key: 'gamification', label: 'Gamification' },
    { key: 'billing', label: 'Billing' },
    { key: 'activity', label: 'Activité' },
  ];

  return (
    <div>
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={user.status} />
            <PremiumBadge isPremium={user.isPremium} />
            <span className={`badge ${user.role === 'ADMIN' ? 'badge-blue' : user.role === 'COACH' ? 'badge-green' : 'badge-gray'}`}>{user.role}</span>
            <Link href="/dashboard/users" className="btn-secondary">Retour</Link>
          </div>
        }
      />

      {isAdmin && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => { setNewRole(user.role); setShowRoleModal(true); }} className="btn-secondary text-sm flex items-center gap-1">
            <Shield className="w-4 h-4" /> Changer rôle
          </button>
          {user.status === 'ACTIVE' ? (
            <button onClick={() => changeStatus.mutate('SUSPENDED')} className="btn-danger text-sm flex items-center gap-1">
              <UserX className="w-4 h-4" /> Suspendre
            </button>
          ) : (
            <button onClick={() => changeStatus.mutate('ACTIVE')} className="btn-primary text-sm flex items-center gap-1">
              <UserCheck className="w-4 h-4" /> Réactiver
            </button>
          )}
          <button onClick={() => setShowAdjustModal(true)} className="btn-secondary text-sm flex items-center gap-1">
            <Award className="w-4 h-4" /> Ajuster XP/Streak
          </button>
          {user.isPremium ? (
            <button onClick={() => revokePremium.mutate()} className="btn-danger text-sm flex items-center gap-1">
              <ZapOff className="w-4 h-4" /> Retirer premium
            </button>
          ) : (
            <button onClick={() => setShowPremiumModal(true)} className="btn-primary text-sm flex items-center gap-1">
              <Zap className="w-4 h-4" /> Accorder premium
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx('px-4 py-2.5 text-sm font-medium border-b-2 -mb-px', tab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-medium mb-3">Informations</h3>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500">Email</dt><dd>{user.email}</dd></div>
              <div><dt className="text-gray-500">Inscription</dt><dd>{new Date(user.createdAt).toLocaleDateString('fr')}</dd></div>
              {user.premiumUntil && <div><dt className="text-gray-500">Premium jusqu'au</dt><dd>{new Date(user.premiumUntil).toLocaleDateString('fr')}</dd></div>}
              {user.suspendedAt && <div><dt className="text-gray-500">Suspendu le</dt><dd>{new Date(user.suspendedAt).toLocaleDateString('fr')}</dd></div>}
            </dl>
          </div>
          <div className="card p-5">
            <h3 className="font-medium mb-3">Onboarding</h3>
            {user.profile ? (
              <dl className="space-y-2 text-sm">
                <div><dt className="text-gray-500">Objectif</dt><dd>{user.profile.goal || '-'}</dd></div>
                <div><dt className="text-gray-500">Niveau estimé</dt><dd>{user.profile.levelEstimate || '-'}</dd></div>
                <div><dt className="text-gray-500">Intérêts</dt><dd>{user.profile.interests?.join(', ') || '-'}</dd></div>
                <div><dt className="text-gray-500">Complété</dt><dd>{user.profile.onboardingCompleted ? 'Oui' : 'Non'}</dd></div>
              </dl>
            ) : <p className="text-sm text-gray-400">Pas de profil</p>}
          </div>
        </div>
      )}

      {tab === 'progress' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-medium mb-3">Challenges en cours</h3>
            {user.challengeProgress.length > 0 ? (
              <div className="space-y-2">
                {user.challengeProgress.map((cp) => (
                  <div key={cp.challengeId} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                    <span>{cp.challenge.title}</span>
                    <span className="text-gray-500">Jour {cp.currentDay}/7 ({cp.completedDays.length} complétés)</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">Aucun challenge</p>}
          </div>
          <div className="card p-5">
            <h3 className="font-medium mb-3">Quiz récents</h3>
            {user.quizAttempts.length > 0 ? (
              <div className="space-y-2">
                {user.quizAttempts.map((qa) => (
                  <div key={qa.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                    <span>{qa.quiz.title}</span>
                    <span className="text-gray-500">{qa.score}/{qa.total} - {new Date(qa.createdAt).toLocaleDateString('fr')}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">Aucune tentative</p>}
          </div>
        </div>
      )}

      {tab === 'gamification' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-medium mb-3">Stats</h3>
            {user.gamificationProfile ? (
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-2xl font-bold">{user.gamificationProfile.xp}</span><p className="text-xs text-gray-500">XP</p></div>
                <div><span className="text-2xl font-bold">{user.gamificationProfile.level}</span><p className="text-xs text-gray-500">Niveau</p></div>
                <div><span className="text-2xl font-bold">{user.gamificationProfile.streak}</span><p className="text-xs text-gray-500">Streak actuel</p></div>
                <div><span className="text-2xl font-bold">{user.gamificationProfile.longestStreak}</span><p className="text-xs text-gray-500">Plus long streak</p></div>
              </div>
            ) : <p className="text-sm text-gray-400">Pas de profil gamification</p>}
          </div>
          <div className="card p-5">
            <h3 className="font-medium mb-3">Badges ({user.userBadges.length})</h3>
            {user.userBadges.length > 0 ? (
              <div className="space-y-2">
                {user.userBadges.map((ub) => (
                  <div key={ub.badge.id} className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{ub.badge.name}</span>
                    <span className="text-gray-400">- {ub.badge.description}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">Aucun badge</p>}
          </div>
        </div>
      )}

      {tab === 'billing' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-medium mb-3">Abonnements</h3>
            {user.subscriptions.length > 0 ? (
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2">Plan</th><th>Statut</th><th>Début</th><th>Fin</th></tr></thead>
                <tbody>
                  {user.subscriptions.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2">{s.plan.name}</td>
                      <td><StatusBadge status={s.status} /></td>
                      <td>{new Date(s.startDate).toLocaleDateString('fr')}</td>
                      <td>{new Date(s.endDate).toLocaleDateString('fr')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-sm text-gray-400">Aucun abonnement</p>}
          </div>
          <div className="card p-5">
            <h3 className="font-medium mb-3">Paiements</h3>
            {user.payments.length > 0 ? (
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2">Montant</th><th>Provider</th><th>Statut</th><th>Date</th></tr></thead>
                <tbody>
                  {user.payments.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2">{p.amount} {p.currency}</td>
                      <td>{p.provider}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>{new Date(p.createdAt).toLocaleDateString('fr')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-sm text-gray-400">Aucun paiement</p>}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="card p-5">
          <h3 className="font-medium mb-3">Interactions</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><span className="text-2xl font-bold">{user._count.likes}</span><p className="text-xs text-gray-500">Likes</p></div>
            <div><span className="text-2xl font-bold">{user._count.saves}</span><p className="text-xs text-gray-500">Saves</p></div>
            <div><span className="text-2xl font-bold">{user._count.shareLogs}</span><p className="text-xs text-gray-500">Partages</p></div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal open={showRoleModal} onClose={() => setShowRoleModal(false)} title="Changer le rôle">
        <div className="space-y-4">
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input-field">
            <option value="USER">USER</option>
            <option value="COACH">COACH</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowRoleModal(false)} className="btn-secondary">Annuler</button>
            <button onClick={() => changeRole.mutate()} className="btn-primary" disabled={changeRole.isPending}>Confirmer</button>
          </div>
        </div>
      </Modal>

      <Modal open={showAdjustModal} onClose={() => setShowAdjustModal(false)} title="Ajuster Gamification">
        <div className="space-y-4">
          <div>
            <label className="label-field">Delta XP (positif ou négatif)</label>
            <input type="number" value={xpDelta} onChange={(e) => setXpDelta(Number(e.target.value))} className="input-field" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="rs" checked={resetStreak} onChange={(e) => setResetStreak(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="rs" className="text-sm">Reset streak à 0</label>
          </div>
          <div>
            <label className="label-field">Raison (obligatoire)</label>
            <input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className="input-field" placeholder="Ex: correction erreur système" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdjustModal(false)} className="btn-secondary">Annuler</button>
            <button onClick={() => adjustGamification.mutate()} className="btn-primary" disabled={!adjustReason || adjustGamification.isPending}>Confirmer</button>
          </div>
        </div>
      </Modal>

      <Modal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} title="Accorder Premium">
        <div className="space-y-4">
          <div>
            <label className="label-field">Nombre de jours</label>
            <input type="number" value={premiumDays} onChange={(e) => setPremiumDays(Number(e.target.value))} className="input-field" min={1} />
          </div>
          <div>
            <label className="label-field">Raison</label>
            <input value={premiumReason} onChange={(e) => setPremiumReason(e.target.value)} className="input-field" placeholder="Ex: offre partenaire" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowPremiumModal(false)} className="btn-secondary">Annuler</button>
            <button onClick={() => grantPremium.mutate()} className="btn-primary" disabled={!premiumReason || grantPremium.isPending}>Accorder</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
