import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className,
      )}
    >
      {emoji && (
        <div className="text-5xl mb-4" role="img" aria-hidden="true">
          {emoji}
        </div>
      )}
      {Icon && !emoji && (
        <div className="w-14 h-14 bg-surface-2 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-dark-text" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-gray-800 font-semibold text-base mb-2">{title}</h3>
      {description && (
        <p className="text-dark-text text-sm max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 bg-brand-orange hover:bg-brand-orange-dark text-dark-text text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
