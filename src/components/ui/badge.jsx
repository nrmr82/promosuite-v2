import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        gold: 'bg-gold-soft text-gold-foreground',
        success: 'bg-success-soft text-success',
        outline: 'border text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export const Badge = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
