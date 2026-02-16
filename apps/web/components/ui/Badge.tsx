import clsx from 'clsx';

type BadgeVariant = 'orange' | 'gold' | 'green' | 'red' | 'gray' | 'blue';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  orange: 'bg-brand-orange/15 text-brand-orange border-brand-orange/20',
  gold: 'bg-brand-gold/15 text-brand-gold border-brand-gold/20',
  green: 'bg-brand-green/15 text-brand-green border-brand-green/20',
  red: 'bg-red-500/15 text-red-400 border-red-500/20',
  gray: 'bg-white/8 text-dark-text border-white/10',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
};

export function Badge({ label, variant = 'gray', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded border tracking-wide',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function ContentTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    VIDEO: { label: 'Vidéo', variant: 'orange' },
    ARTICLE: { label: 'Article', variant: 'blue' },
    QUIZ: { label: 'Quiz', variant: 'gold' },
    MICRO_LEARNING: { label: 'Micro', variant: 'green' },
  };
  const cfg = map[type] ?? { label: type, variant: 'gray' as BadgeVariant };
  return <Badge label={cfg.label} variant={cfg.variant} />;
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 bg-brand-gold text-black text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest">
      PREMIUM
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    COMPLETED: { label: 'Terminé', variant: 'green' },
    IN_PROGRESS: { label: 'En cours', variant: 'orange' },
    PUBLISHED: { label: 'Publié', variant: 'green' },
    DRAFT: { label: 'Brouillon', variant: 'gray' },
    ARCHIVED: { label: 'Archivé', variant: 'red' },
    ACTIVE: { label: 'Actif', variant: 'green' },
    INACTIVE: { label: 'Inactif', variant: 'gray' },
  };
  const cfg = map[status] ?? { label: status, variant: 'gray' as BadgeVariant };
  return <Badge label={cfg.label} variant={cfg.variant} />;
}
