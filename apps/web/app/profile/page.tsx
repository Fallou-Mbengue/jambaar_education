'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  CreditCard,
  Bell,
  LogOut,
  Check,
  Loader2,
  Plus,
  Trash2,
  Download,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import { LandingHeader, DarkFooter } from '@/components/landing';
import { useAuthStore } from '@/store/auth.store';
import { authApi, usersApi } from '@/lib/api/auth.api';
import { billingApi } from '@/lib/api/content.api';

/* ── Types ──────────────────────────────────────────────── */

type SidebarTab = 'profil' | 'paiements' | 'notifications';

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  jobTitle: string;
  avatarUrl?: string | null;
}

/* ── Sidebar ─────────────────────────────────────────────── */

const TABS: { id: SidebarTab; label: string; icon: React.ElementType }[] = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'paiements', label: 'Paiements & Abonnements', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

function ProfileSidebar({
  active,
  onChange,
  onLogout,
}: {
  active: SidebarTab;
  onChange: (tab: SidebarTab) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="w-full lg:w-[240px] shrink-0">
      <div className="bg-[#282828] rounded-xl border border-white/[0.06] p-3 lg:p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-3 mb-3">
          Paramètres du compte
        </p>

        <nav className="space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                active === id
                  ? 'bg-landing-orange/15 text-landing-orange'
                  : 'text-white/60 hover:text-white hover:bg-white/5',
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 mt-4 pt-3">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── Avatar ──────────────────────────────────────────────── */

function AvatarSection({
  initials,
  avatarUrl,
}: {
  initials: string;
  avatarUrl?: string | null;
}) {
  return (
    <div className="flex items-center gap-5 mb-8">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-[#3C3C3C] flex items-center justify-center shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-white/70">{initials}</span>
          )}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-[#282828] rounded-full" />
      </div>

      <div>
        <p className="text-sm font-medium text-white mb-0.5">Photo de profil</p>
        <p className="text-[11px] text-white/40 mb-2.5">
          JPG, GIF o. PNG. Max 2Mo.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-landing-orange hover:bg-landing-orange-hover rounded-md transition-colors"
          >
            Modifier
          </button>
          <button
            type="button"
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#3C3C3C] hover:bg-[#4a4a4a] rounded-md border border-white/10 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Form Field ──────────────────────────────────────────── */

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-white/60 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full h-11 px-4 bg-[#3C3C3C] border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-landing-orange focus:ring-1 focus:ring-landing-orange/30 transition-colors';

/* ── Profile Tab Content ─────────────────────────────────── */

function ProfileTabContent({
  profile,
  email,
  emailVerified,
  saving,
  saved,
  onSave,
  onCancel,
  onChange,
}: {
  profile: ProfileData;
  email: string;
  emailVerified: boolean;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: keyof ProfileData, value: string) => void;
}) {
  const initials =
    `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() ||
    email[0]?.toUpperCase() ||
    '';

  return (
    <div className="space-y-8">
      {/* Personal Info */}
      <div className="bg-[#282828] rounded-xl border border-white/[0.06] p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          Informations personnelles
        </h2>
        <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-6">
          Mettez à jour vos informations personnelles et bio
        </p>

        <AvatarSection initials={initials} avatarUrl={profile.avatarUrl} />

        {/* Form grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Nom complet">
            <input
              type="text"
              value={`${profile.firstName} ${profile.lastName}`.trim()}
              onChange={(e) => {
                const parts = e.target.value.split(' ');
                onChange('firstName', parts[0] ?? '');
                onChange('lastName', parts.slice(1).join(' '));
              }}
              className={inputClass}
              placeholder="Votre nom complet"
            />
          </Field>

          <Field label="Email">
            <div className="relative">
              <input
                type="email"
                value={email}
                disabled
                className={clsx(inputClass, 'pr-10 opacity-70 cursor-not-allowed')}
              />
              {emailVerified && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
          </Field>

          <Field label="Numéro de téléphone">
            <div className="flex">
              <span className="inline-flex items-center px-3 h-11 bg-[#4a4a4a] border border-white/10 border-r-0 rounded-l-lg text-xs font-medium text-white/70">
                +221
              </span>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                className={clsx(inputClass, 'rounded-l-none')}
                placeholder="77 123 45 67"
              />
            </div>
          </Field>

          <Field label="Profession">
            <input
              type="text"
              value={profile.jobTitle}
              onChange={(e) => onChange('jobTitle', e.target.value)}
              className={inputClass}
              placeholder="Ingénieur Logiciel"
            />
          </Field>
        </div>

        <Field label="Bio" className="mt-5">
          <textarea
            value={profile.bio}
            onChange={(e) => onChange('bio', e.target.value)}
            rows={4}
            className={clsx(
              inputClass,
              'h-auto py-3 resize-none leading-relaxed',
            )}
            placeholder="Bref résumé de votre parcours..."
          />
        </Field>
        <p className="text-[11px] text-white/30 mt-1.5">
          Bref résumé de votre parcours pour votre profil public.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-landing-orange hover:bg-landing-orange-hover disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saved ? 'Enregistré !' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-[#282828] rounded-xl border border-white/[0.06] p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-1">Sécurité</h2>
        <p className="text-xs text-white/40 mb-6">
          Gérez l&apos;accès et la protection de votre compte
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Ancien mot de passe">
            <input
              type="password"
              placeholder="••••••••"
              className={inputClass}
            />
          </Field>
          <Field label="Nouveau mot de passe">
            <input
              type="password"
              placeholder="••••••••"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="flex justify-end mt-5">
          <button
            type="button"
            className="text-sm font-semibold text-landing-orange hover:text-landing-orange-hover transition-colors"
          >
            Mettre à jour le mot de passe
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Placeholder tabs ────────────────────────────────────── */

/* ── Payment types ────────────────────────────────────────── */

interface PaymentRecord {
  id: string;
  provider: string;
  amountXof: number;
  status: string;
  phoneNumber?: string | null;
  createdAt: string;
}

interface SubscriptionData {
  id: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  plan?: { name: string; priceXof: number; billingPeriod: string } | null;
  payments?: PaymentRecord[];
}

const PROVIDER_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  WAVE: { label: 'WAVE', color: 'text-[#1DC4E9]', bg: 'bg-[#1DC4E9]' },
  ORANGE_MONEY: { label: 'OM', color: 'text-[#FF6600]', bg: 'bg-[#FF6600]' },
  VISA: { label: 'VISA', color: 'text-[#1A1F71]', bg: 'bg-[#1A1F71]' },
};

const STATUS_LABELS: Record<string, { label: string; dot: string }> = {
  SUCCESS: { label: 'Payé', dot: 'bg-green-400' },
  PENDING: { label: 'En attente', dot: 'bg-yellow-400' },
  FAILED: { label: 'Échoué', dot: 'bg-red-400' },
  REFUNDED: { label: 'Remboursé', dot: 'bg-blue-400' },
};

function formatDateFr(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatAmount(xof: number): string {
  return `${xof.toLocaleString('fr-FR')} FCFA`;
}

function PaiementsTab() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    billingApi
      .getStatus()
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setSubscription(data?.subscription ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const payments = subscription?.payments ?? [];
  const displayedPayments = showAll ? payments : payments.slice(0, 3);
  const lastPayment = payments[0];
  const provider = lastPayment
    ? PROVIDER_LABELS[lastPayment.provider] ?? PROVIDER_LABELS.WAVE
    : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-[#282828] rounded-xl border border-white/[0.06] p-6 sm:p-8 animate-pulse">
          <div className="h-5 w-48 bg-white/10 rounded mb-2" />
          <div className="h-3 w-72 bg-white/5 rounded mb-6" />
          <div className="h-16 bg-white/5 rounded-lg" />
        </div>
        <div className="bg-[#282828] rounded-xl border border-white/[0.06] p-6 sm:p-8 animate-pulse">
          <div className="h-5 w-40 bg-white/10 rounded mb-6" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded mb-3" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Méthodes de paiement */}
      <div className="bg-[#282828] rounded-xl border border-white/[0.06] p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Méthodes de paiement
            </h2>
            <p className="text-xs text-white/40 mt-1">
              Gérez vos cartes et moyens de paiement enregistrés.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#3C3C3C] hover:bg-[#4a4a4a] border border-white/10 rounded-lg transition-colors shrink-0"
          >
            <Plus size={14} />
            Ajouter
          </button>
        </div>

        {lastPayment && provider ? (
          <div className="flex items-center gap-4 p-4 bg-[#1E1E1E] rounded-lg border border-white/[0.06]">
            <span
              className={clsx(
                'px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded text-white shrink-0',
                provider.bg,
              )}
            >
              {provider.label}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {lastPayment.provider === 'WAVE'
                  ? 'Wave'
                  : lastPayment.provider === 'ORANGE_MONEY'
                    ? 'Orange Money'
                    : 'Visa'}{' '}
                {lastPayment.phoneNumber
                  ? `se terminant par ${lastPayment.phoneNumber.slice(-4)}`
                  : ''}
              </p>
              {subscription?.endDate && (
                <p className="text-[11px] text-white/40 mt-0.5">
                  Expire le{' '}
                  {new Date(subscription.endDate).toLocaleDateString('fr-FR', {
                    month: '2-digit',
                    year: '2-digit',
                  })}
                </p>
              )}
            </div>
            <span className="text-[10px] font-semibold text-green-400 border border-green-400/20 bg-green-400/10 px-2 py-0.5 rounded shrink-0">
              Par défaut
            </span>
            <button
              type="button"
              className="p-1.5 text-white/30 hover:text-red-400 transition-colors shrink-0"
              aria-label="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard size={32} className="text-white/15 mx-auto mb-2" />
            <p className="text-sm text-white/40">
              Aucun moyen de paiement enregistré.
            </p>
          </div>
        )}
      </div>

      {/* Historique des factures */}
      <div className="bg-[#282828] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="p-6 sm:p-8 pb-0">
          <h2 className="text-xl font-bold text-white">
            Historique des factures
          </h2>
          <p className="text-xs text-white/40 mt-1 mb-6">
            Téléchargez vos factures précédentes au format PDF.
          </p>
        </div>

        {payments.length > 0 ? (
          <>
            {/* Table header */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-3 border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-widest text-white/30">
              <span>Date</span>
              <span>Montant</span>
              <span>Statut</span>
              <span className="text-right">Facture</span>
            </div>

            {/* Table rows */}
            {displayedPayments.map((p) => {
              const st = STATUS_LABELS[p.status] ?? STATUS_LABELS.PENDING;
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-4 items-center px-6 sm:px-8 py-4 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm text-white/70">
                    {formatDateFr(p.createdAt)}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {formatAmount(p.amountXof)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={clsx('w-1.5 h-1.5 rounded-full', st.dot)}
                    />
                    <span className="text-xs text-white/60">{st.label}</span>
                  </span>
                  <span className="text-right">
                    <button
                      type="button"
                      className="p-1.5 text-landing-orange hover:text-landing-orange-hover transition-colors"
                      aria-label="Télécharger"
                    >
                      <Download size={16} />
                    </button>
                  </span>
                </div>
              );
            })}

            {/* Footer */}
            {payments.length > 3 && !showAll && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="w-full flex items-center justify-center gap-2 py-4 text-sm font-medium text-white/50 hover:text-white bg-[#232323] transition-colors"
              >
                Voir tout l&apos;historique
                <ChevronRight size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="px-6 sm:px-8 pb-8">
            <p className="text-sm text-white/40 text-center py-8">
              Aucune facture pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Toggle switch ────────────────────────────────────────── */

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? 'bg-landing-orange' : 'bg-white/20',
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

/* ── Notification preference row ─────────────────────────── */

function NotifRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-5 border-b border-white/[0.06] last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ── Channel card ────────────────────────────────────────── */

function ChannelCard({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={clsx(
        'flex items-center gap-3.5 p-4 rounded-lg border transition-colors text-left w-full',
        checked
          ? 'border-landing-orange/40 bg-landing-orange/5'
          : 'border-white/[0.06] bg-[#1E1E1E] hover:border-white/15',
      )}
    >
      <div
        className={clsx(
          'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
          checked
            ? 'border-landing-orange bg-landing-orange'
            : 'border-white/30 bg-transparent',
        )}
      >
        {checked && <Check size={12} className="text-white" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-[11px] text-white/40 mt-0.5">{description}</p>
      </div>
    </button>
  );
}

function NotificationsTab({ email }: { email: string }) {
  const [prefs, setPrefs] = useState({
    newCourses: true,
    weeklyReminders: true,
    commentReplies: false,
    promotions: false,
  });
  const [channels, setChannels] = useState({
    email: true,
    push: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Préférences de notification */}
      <div className="bg-[#282828] rounded-xl border border-white/[0.06] p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white">
          Préférences de notification
        </h2>
        <p className="text-xs text-white/40 mt-1 mb-2">
          Choisissez les types de mises à jour que vous souhaitez recevoir.
        </p>

        <div>
          <NotifRow
            title="Nouveaux cours et recommandations"
            description="Restez informé des nouveaux contenus correspondant à vos intérêts."
            checked={prefs.newCourses}
            onChange={(v) => setPrefs((p) => ({ ...p, newCourses: v }))}
          />
          <NotifRow
            title="Rappels d'apprentissage hebdomadaires"
            description="Recevez un résumé hebdomadaire pour maintenir votre rythme d'apprentissage."
            checked={prefs.weeklyReminders}
            onChange={(v) => setPrefs((p) => ({ ...p, weeklyReminders: v }))}
          />
          <NotifRow
            title="Réponses à mes commentaires"
            description="Soyez notifié quand quelqu'un répond à vos questions sur le forum."
            checked={prefs.commentReplies}
            onChange={(v) => setPrefs((p) => ({ ...p, commentReplies: v }))}
          />
          <NotifRow
            title="Offres promotionnelles et actualités"
            description="Bénéficiez de réductions exclusives et restez informé des nouveautés Jambaar."
            checked={prefs.promotions}
            onChange={(v) => setPrefs((p) => ({ ...p, promotions: v }))}
          />
        </div>
      </div>

      {/* Canaux de réception */}
      <div className="bg-[#282828] rounded-xl border border-white/[0.06] p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white">
          Canaux de réception
        </h2>
        <p className="text-xs text-white/40 mt-1 mb-6">
          Où souhaitez-vous recevoir vos notifications ?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ChannelCard
            icon={<Bell size={16} />}
            label="Email"
            description={`Envoyé à ${email || 'votre adresse email'}`}
            checked={channels.email}
            onChange={(v) => setChannels((c) => ({ ...c, email: v }))}
          />
          <ChannelCard
            icon={<Bell size={16} />}
            label="Notifications Push (Navigateur)"
            description="Alertes instantanées sur votre bureau"
            checked={channels.push}
            onChange={(v) => setChannels((c) => ({ ...c, push: v }))}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-white/[0.06]">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-landing-orange hover:bg-landing-orange-hover disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saved ? 'Enregistré !' : 'Enregistrer les préférences'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */

function ProfileSkeleton() {
  return (
    <div className="bg-[#282828] rounded-xl border border-white/[0.06] p-6 sm:p-8 animate-pulse">
      <div className="h-6 w-64 bg-white/10 rounded mb-2" />
      <div className="h-3 w-48 bg-white/5 rounded mb-8" />
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-white/10" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-3 w-40 bg-white/5 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 bg-white/5 rounded" />
            <div className="h-11 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function ProfilePage() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);

  const [tab, setTab] = useState<SidebarTab>('profil');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    jobTitle: '',
    avatarUrl: null,
  });
  const [original, setOriginal] = useState<ProfileData>(profile);

  useEffect(() => {
    usersApi
      .getMe()
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setEmail(data.email ?? '');
        setEmailVerified(data.emailVerified ?? false);
        const p: ProfileData = {
          firstName: data.profile?.firstName ?? '',
          lastName: data.profile?.lastName ?? '',
          phone: data.profile?.phone ?? '',
          bio: data.profile?.bio ?? '',
          jobTitle: data.profile?.jobTitle ?? '',
          avatarUrl: data.profile?.avatarUrl ?? null,
        };
        setProfile(p);
        setOriginal(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleCancel = () => {
    setProfile(original);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        bio: profile.bio,
        jobTitle: profile.jobTitle,
      });
      setOriginal(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      if (authUser) {
        setUser({
          ...authUser,
          profile: {
            ...authUser.profile!,
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatarUrl: profile.avatarUrl ?? undefined,
          },
        });
      }
    } catch {
      /* TODO: error handling */
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch { /* ignore */ }
    logoutStore();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white flex flex-col">
      <LandingHeader />

      <main className="flex-1 pt-[72px]">
        {/* Back link */}
        <div className="bg-[#252525] border-b border-white/[0.06]">
          <div className="landing-container px-4 sm:px-6">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 py-4 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              Retour tableau de bord
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="landing-container px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar */}
            <ProfileSidebar
              active={tab}
              onChange={setTab}
              onLogout={handleLogout}
            />

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {tab === 'profil' && (
                loading ? (
                  <ProfileSkeleton />
                ) : (
                  <ProfileTabContent
                    profile={profile}
                    email={email}
                    emailVerified={emailVerified}
                    saving={saving}
                    saved={saved}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onChange={handleChange}
                  />
                )
              )}
              {tab === 'paiements' && <PaiementsTab />}
              {tab === 'notifications' && <NotificationsTab email={email} />}
            </div>
          </div>
        </div>
      </main>

      <DarkFooter />
    </div>
  );
}
