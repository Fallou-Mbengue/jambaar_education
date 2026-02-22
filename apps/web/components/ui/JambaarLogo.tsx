import Link from 'next/link';
import clsx from 'clsx';

interface JambaarLogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

const SIZES = {
  sm: 'text-lg',
  md: 'text-xl sm:text-2xl',
  lg: 'text-2xl sm:text-3xl',
} as const;

export function JambaarLogo({ size = 'md', href = '/', className }: JambaarLogoProps) {
  const inner = (
    <span className={clsx(SIZES[size], 'font-bold tracking-tight inline-flex items-baseline', className)}>
      <span className="text-[#5D2A87]">Jambaar</span>
      <span className="inline-block w-[0.4em] h-[0.4em] rounded-full bg-landing-orange align-middle ml-0.5 shrink-0" aria-hidden />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center shrink-0">
        {inner}
      </Link>
    );
  }

  return inner;
}
