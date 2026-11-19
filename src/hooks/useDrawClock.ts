import { useEffect, useState } from 'react';

/**
 * Relógio do sorteio baseado em timestamp (Date.now), não em contagem de quadros.
 *
 * - Em primeiro plano, requestAnimationFrame só serve para redesenhar.
 * - Em segundo plano o navegador pausa rAF e atrasa timers; o tempo decorrido continua
 *   correto porque é sempre recalculado a partir de `startedAt`.
 * - Ao voltar para a aba (Page Visibility), sincronizamos na hora.
 * - Um timeout de segurança marca o fim mesmo com a aba oculta.
 */
export function useDrawClock(startedAt: number | null, total: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return;
    let raf = 0;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t - startedAt < total) raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      tick();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') sync();
    };

    sync();
    const timeout = window.setTimeout(sync, Math.max(0, startedAt + total - Date.now()) + 16);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', sync);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', sync);
    };
  }, [startedAt, total]);

  return startedAt === null ? 0 : Math.max(0, now - startedAt);
}
