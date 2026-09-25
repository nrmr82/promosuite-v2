import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/components/theme-provider';

export const Toaster = () => {
  const { resolvedTheme } = useTheme();
  return <Sonner theme={resolvedTheme} position="bottom-right" richColors closeButton />;
};

export { toast } from 'sonner';
