import { Avatar as AvatarPrimitive, Separator as SeparatorPrimitive, Switch as SwitchPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

export const Separator = ({ className, orientation = 'horizontal', ...props }) => (
  <SeparatorPrimitive.Root
    orientation={orientation}
    className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
    {...props}
  />
);

export const Skeleton = ({ className, ...props }) => (
  <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
);

export const Switch = ({ className, ...props }) => (
  <SwitchPrimitive.Root
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block size-4 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
  </SwitchPrimitive.Root>
);

export const Avatar = ({ src, name = '', className }) => {
  const initials = name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
  return (
    <AvatarPrimitive.Root className={cn('relative flex size-9 shrink-0 overflow-hidden rounded-full', className)}>
      {src && <AvatarPrimitive.Image src={src} alt={name} className="aspect-square size-full object-cover" />}
      <AvatarPrimitive.Fallback className="flex size-full items-center justify-center bg-accent text-xs font-semibold text-accent-foreground">
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};
