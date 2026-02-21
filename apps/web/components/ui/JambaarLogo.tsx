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
    <span className={clsx(SIZES[size], 'font-bold tracking-tight', className)}>
      <span className="text-[#9333EA] text-[1.15em]">J</span>
      ambaar
      <span className="text-landing-orange">.</span>
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
