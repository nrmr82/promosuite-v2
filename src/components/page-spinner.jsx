import { Loader2 } from 'lucide-react';

export function PageSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> {label}
    </div>
  );
}
