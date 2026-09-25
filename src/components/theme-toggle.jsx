import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

const NEXT = { light: 'dark', dark: 'system', system: 'light' };
const LABEL = { light: 'Light mode', dark: 'Dark mode', system: 'Match system' };

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = theme === 'dark' ? Moon : theme === 'system' ? Monitor : Sun;
  return (
    <Tooltip content={`${LABEL[theme]} · click to change`}>
      <Button variant="ghost" size="icon" onClick={() => setTheme(NEXT[theme])} aria-label="Change theme">
        <Icon />
      </Button>
    </Tooltip>
  );
}
