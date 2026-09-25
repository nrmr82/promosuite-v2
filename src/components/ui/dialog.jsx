import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = ({ className, children, ...props }) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px]" />
    <DialogPrimitive.Content
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border bg-popover p-6 text-popover-foreground shadow-xl',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1.5', className)} {...props} />
);
export const DialogFooter = ({ className, ...props }) => (
  <div className={cn('flex justify-end gap-2', className)} {...props} />
);
export const DialogTitle = ({ className, ...props }) => (
  <DialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />
);
export const DialogDescription = ({ className, ...props }) => (
  <DialogPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
);
