import { useEffect, useRef, type ReactNode } from 'react';
import { Dices, FastForward } from 'lucide-react';
import type { PendingDraw } from '@/types';
import { Button } from '@/components/ui/button';
import { useApp } from '@/state/AppState';
import { useDrawClock } from '@/hooks/useDrawClock';
import { easeOutQuart } from '@/lib/draw';
import { readiness } from '@/lib/validation';
import { formatNumber, ordinal } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Reel } from './Reel';
import { ResultView } from './ResultView';
import { fireConfetti } from './confetti';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Escala dos números pelo maior texto exibido, para nunca vazar da tela. */
export function numberSize(labels: string[]): string {
  const n = labels.reduce((m, l) => Math.max(m, l.length), 0);
  if (n <= 4) return 'text-7xl sm:text-8xl';
  if (n <= 7) return 'text-6xl sm:text-7xl';
  if (n <= 11) return 'text-4xl sm:text-6xl';
  return 'text-2xl sm:text-4xl';
}

export function Stage() {
  const { state, dispatch } = useApp();
  const { pending, result, mode } = state;
  const elapsed = useDrawClock(pending?.startedAt ?? null, pending?.total ?? 0);
  const done = pending !== null && elapsed >= pending.total;
  const ref = useRef<HTMLElement>(null);
  const celebrate = useRef<string | null>(null);

  const finish = (id: string) => {
    celebrate.current = id;
    dispatch({ type: 'finalizeDraw', id });
  };

  // A conclusão é guiada pelo tempo decorrido, nunca pela animação.
  useEffect(() => {
    if (pending && done) finish(pending.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, done]);

  // Esc pula a animação: o resultado já está decidido.
  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[role="dialog"]')) finish(pending.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  // No celular, garante que o palco esteja à vista quando o sorteio começa.
  const pendingId = pending?.id;
  useEffect(() => {
    if (!pendingId || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      ref.current.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    }
  }, [pendingId]);

  // Confete uma única vez, só para sorteios concluídos nesta sessão.
  useEffect(() => {
    if (!result || celebrate.current !== result.id || !ref.current) return;
    celebrate.current = null;
    if (reducedMotion()) return;
    const rect = ref.current.getBoundingClientRect();
    fireConfetti(rect.left + rect.width / 2, Math.max(48, rect.top + rect.height * 0.42));
  }, [result]);

  const view = pending ? 'running' : result && result.kind === mode ? 'result' : 'idle';

  return (
    <section ref={ref} id="palco" aria-label="Sorteio" className="relative isolate overflow-hidden rounded-b-[inherit] border-t bg-muted/35 px-4 pt-8 pb-7 sm:px-10 sm:py-14">
      {pending && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-border/60" aria-hidden>
          <div className="h-full origin-left bg-brand" style={{ transform: `scaleX(${Math.min(1, elapsed / pending.total)})` }} />
        </div>
      )}
      <div className="flex min-h-52 flex-col items-center justify-center gap-6 text-center sm:min-h-64 sm:gap-7">
        {view === 'running' && pending && <RunningView draw={pending} elapsed={elapsed} onSkip={() => finish(pending.id)} />}
        {view === 'result' && result && <ResultView result={result} />}
        {view === 'idle' && <IdleView />}
      </div>
      <p className="sr-only" aria-live="assertive">
        {view === 'running' ? 'Sorteando…' : view === 'result' && result ? `Resultado: ${result.items.map((i) => i.label).join(', ')}` : ''}
      </p>
    </section>
  );
}

export function DrawButton({ label = 'Sortear', icon, aside }: { label?: string; icon?: ReactNode; aside?: ReactNode }) {
  const { state, startDraw } = useApp();
  const ready = readiness(state);
  return (
    <div className="grid w-full justify-items-center gap-3">
      <div className="flex w-full max-w-sm items-center justify-center gap-2 sm:w-auto">
      <Button
        size="lg"
        className="h-12 min-w-0 flex-1 gap-2 rounded-full px-8 text-[0.9375rem] sm:flex-none shadow-[0_1px_2px_rgb(0_0_0/0.1),0_8px_20px_-8px_rgb(0_0_0/0.35)] transition-[scale,background-color] active:scale-[0.96] dark:shadow-none [&_svg:not([class*='size-'])]:size-[18px]"
        onClick={() => startDraw()}
        disabled={!ready.ok || state.pending !== null}
        aria-describedby="status-sorteio"
      >
        {icon ?? <Dices />}
        {label}
      </Button>
      {aside}
      </div>
      <p id="status-sorteio" className={cn('max-w-[40ch] text-sm tabular-nums', ready.ok ? 'text-muted-foreground' : 'text-amber-700 dark:text-amber-400')}>
        {ready.ok ? ready.summary : ready.message}
      </p>
    </div>
  );
}

function IdleView() {
  const { state } = useApp();
  const ready = readiness(state).ok;
  return (
    <>
      <p className={cn('text-[1.75rem] font-semibold tracking-[-0.035em] sm:text-4xl', !ready && 'text-foreground/25')}>
        {state.mode === 'names' ? 'Quem vai ser?' : 'Qual vai ser?'}
      </p>
      <DrawButton />
    </>
  );
}

function RunningView({ draw, elapsed, onSkip }: { draw: PendingDraw; elapsed: number; onSkip: () => void }) {
  const skipRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const a = document.activeElement;
    if (!a || a === document.body || a.closest('#palco')) skipRef.current?.focus({ preventScroll: true });
  }, []);

  const { segments, reels, items, layout } = draw;
  let current = segments.findIndex((s) => elapsed < s.end);
  if (current === -1) current = segments.length - 1;
  const inGap = current > 0 && elapsed < segments[current].start;
  const shown = inGap ? current - 1 : current;
  const seg = segments[shown];
  const reel = reels[shown];
  const x = inGap ? 1 : (elapsed - seg.start) / (seg.end - seg.start);
  const pos = (reel.length - 1) * easeOutQuart(x);
  const revealed = layout === 'sequential' ? segments.filter((s) => s.end <= elapsed).length : 0;
  const names = draw.kind === 'names';
  const total = items.length;

  const caption =
    layout === 'bulk'
      ? `Sorteando ${formatNumber(total)} ${names ? 'nomes' : 'números'}`
      : total > 1
        ? `Sorteando o ${ordinal(Math.min(current + 1, total))} de ${total}`
        : 'Sorteando';

  return (
    <>
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-brand" />
        </span>
        {caption}
      </p>

      <div
        className={cn(
          'relative w-full',
          names ? 'h-[calc(var(--row)*3)] [--row:3.75rem] sm:[--row:5rem]' : 'h-[calc(var(--row)*1.6)] [--row:6rem] sm:[--row:7.5rem]',
        )}
      >
        {draw.reduced ? (
          <p className="absolute inset-0 grid place-items-center text-3xl font-semibold tracking-tight text-muted-foreground">Sorteando…</p>
        ) : (
          <Reel
            items={reel}
            pos={pos}
            landed={inGap || x >= 1}
            className={cn(
              'font-semibold',
              names ? 'text-3xl tracking-[-0.035em] sm:text-5xl' : cn('tracking-[-0.05em] tabular-nums', numberSize(reel)),
            )}
          />
        )}
      </div>

      {layout === 'sequential' && total > 1 && (
        <ol className="flex min-h-8 flex-wrap justify-center gap-1.5" aria-label="Já revelados">
          {items.slice(0, revealed).map((item, i) => (
            <li key={i} className="flex max-w-full items-center gap-1.5 rounded-full bg-background py-1 pr-3 pl-1.5 text-sm font-medium shadow-xs ring-1 ring-border animate-rise">
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-soft px-1 text-[0.6875rem] font-semibold text-brand tabular-nums">
                {i + 1}
              </span>
              <span className="truncate tabular-nums">{item.label}</span>
            </li>
          ))}
        </ol>
      )}

      <Button ref={skipRef} variant="ghost" size="sm" className="h-8 gap-1.5 rounded-full px-3 text-muted-foreground" onClick={onSkip}>
        <FastForward />
        Pular animação
      </Button>
    </>
  );
}
