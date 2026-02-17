import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={clsx(
        'flex items-start justify-between gap-4 mb-6',
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 bg-brand-orange/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-brand-orange" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-800 leading-tight">{title}</h1>
          {description && (
            <p className="text-dark-text text-sm mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}
