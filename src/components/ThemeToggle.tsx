import { flushSync } from 'react-dom';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === 'dark';

  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Transição suave entre temas (View Transitions); sem suporte, troca direta.
    if (!reduced && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => flushSync(() => setTheme(next)));
    } else {
      setTheme(next);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-9 rounded-full" onClick={toggle} aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}>
          <Sun className="absolute size-[18px] scale-25 opacity-0 blur-[4px] transition-[scale,opacity,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] dark:scale-100 dark:opacity-100 dark:blur-0" />
          <Moon className="absolute size-[18px] scale-100 opacity-100 blur-0 transition-[scale,opacity,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] dark:scale-25 dark:opacity-0 dark:blur-[4px]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dark ? 'Tema claro' : 'Tema escuro'}</TooltipContent>
    </Tooltip>
  );
}
