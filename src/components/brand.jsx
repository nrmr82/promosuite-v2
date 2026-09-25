import { cn } from '@/lib/utils';

// House outline with a spark: the PromoSuite mark
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path d="M8 15.5 16 9l8 6.5V23a1 1 0 0 1-1 1h-4.5v-5h-5v5H9a1 1 0 0 1-1-1z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="24" cy="8.5" r="2.5" className="fill-gold" />
    </svg>
  );
}

export function Logo({ className }) {
  return (
    <span className={cn('flex items-center gap-2 font-semibold tracking-tight', className)}>
      <LogoMark />
      <span className="text-lg">
        Promo<span className="text-primary">Suite</span>
      </span>
    </span>
  );
}
