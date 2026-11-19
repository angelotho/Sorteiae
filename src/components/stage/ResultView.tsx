import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown01, Check, Copy, Ellipsis, ListRestart, RotateCcw, SlidersHorizontal, UserCheck, UserMinus } from 'lucide-react';
import type { DrawResult } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/state/AppState';
import { notify } from '@/lib/notify';
import { eligibleParticipants } from '@/lib/validation';
import { ordinal } from '@/lib/format';
import { cn } from '@/lib/utils';
import { DrawButton, numberSize } from './Stage';

function nameSize(label: string): string {
  const n = label.length;
  if (n <= 12) return 'text-5xl sm:text-7xl tracking-[-0.045em]';
  if (n <= 22) return 'text-4xl sm:text-6xl tracking-[-0.04em]';
  if (n <= 44) return 'text-3xl sm:text-4xl tracking-[-0.03em]';
  return 'text-xl sm:text-2xl tracking-[-0.015em]';
}

const stagger = (i: number) => ({ '--i': Math.min(i, 14) }) as CSSProperties;

export function ResultView({ result }: { result: DrawResult }) {
  const { state, dispatch } = useApp();
  const headingRef = useRef<HTMLParagraphElement>(null);
  const [ascending, setAscending] = useState(false);
  const [copied, setCopied] = useState(false);
  const names = result.kind === 'names';
  const count = result.items.length;
  const allDrawn = names && !result.replacement && eligibleParticipants(state).length === 0;

  useEffect(() => {
    const a = document.activeElement;
    if (!a || a === document.body || a.closest('#palco')) headingRef.current?.focus({ preventScroll: true });
  }, [result.id]);

  const items = useMemo(
    () => (ascending && !names ? result.items.slice().sort((a, b) => (a.value ?? 0) - (b.value ?? 0)) : result.items),
    [ascending, names, result.items],
  );

  const copy = async () => {
    const text = names
      ? result.items.map((i, n) => (count > 1 ? `${ordinal(n + 1)} ${i.label}` : i.label)).join('\n')
      : items.map((i) => i.label).join(', ');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      notify('Não foi possível copiar. Selecione o resultado e copie manualmente.', 'error');
    }
  };

  const newDraw = () => {
    dispatch({ type: 'dismissResult' });
    const target = document.getElementById(names ? 'novos-nomes' : 'num-qtd');
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    target?.focus({ preventScroll: true });
  };
  const newRound = () => dispatch({ type: 'newRound', kind: result.kind });
  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-12 shrink-0 rounded-full bg-background" aria-label="Mais opções do resultado">
          {copied ? <Check /> : <Ellipsis />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={copy}>
          <Copy />
          Copiar resultado
        </DropdownMenuItem>
        {!names && count > 1 && (
          <DropdownMenuItem onSelect={() => setAscending((v) => !v)}>
            <ArrowDown01 />
            {ascending ? 'Ordem do sorteio' : 'Ordem crescente'}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {!result.replacement && !allDrawn && (
          <DropdownMenuItem onSelect={newRound}>
            <ListRestart />
            Nova rodada
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={newDraw}>
          <SlidersHorizontal />
          Novo sorteio
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const label = names ? (count === 1 ? 'Sorteado' : `${count} sorteados`) : count === 1 ? 'Número sorteado' : `${count} números sorteados`;

  return (
    <>
      <div className="grid justify-items-center gap-1">
        <p ref={headingRef} tabIndex={-1} className="text-sm font-medium text-brand outline-none">
          {label}
        </p>
        <p className="flex flex-wrap justify-center gap-x-3 text-xs text-muted-foreground tabular-nums">
          <span>Sorteio {result.order}</span>
          <span>{result.poolLabel}</span>
          {!result.replacement && <span>Rodada {result.round}</span>}
        </p>
      </div>

      <div className="relative grid w-full place-items-center">
        <div className="absolute top-1/2 left-1/2 -z-10 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-3xl animate-glow dark:bg-brand/20" aria-hidden />
        {names && count === 1 && (
          <p className={cn('max-w-full font-semibold leading-[1.05] break-words text-balance animate-reveal', nameSize(result.items[0].label))}>
            {result.items[0].label}
          </p>
        )}
        {names && count > 1 && (
          <ol className={cn('grid w-full max-w-md gap-1 text-left', count > 6 && 'max-h-80 overflow-y-auto sm:max-w-xl sm:grid-cols-2 sm:gap-x-4')}>
            {result.items.map((item, i) => (
              <li key={i} className="flex items-baseline gap-3 rounded-xl px-3 py-2 animate-rise" style={stagger(i)}>
                <span className="w-7 shrink-0 text-right text-sm font-medium text-muted-foreground tabular-nums">{ordinal(i + 1)}</span>
                <span className={cn('min-w-0 font-semibold tracking-tight break-words', count > 6 ? 'text-base' : 'text-xl sm:text-2xl')}>{item.label}</span>
              </li>
            ))}
          </ol>
        )}
        {!names && count === 1 && (
          <p className={cn('font-semibold tracking-[-0.05em] tabular-nums animate-reveal', numberSize([items[0].label]))}>{items[0].label}</p>
        )}
        {!names && count > 1 && (
          <ol className={cn('flex max-h-80 w-full flex-wrap justify-center gap-2 overflow-y-auto p-1', count > 20 && 'gap-1.5')}>
            {items.map((item, i) => (
              <li
                key={i}
                style={stagger(i)}
                className={cn(
                  'rounded-2xl bg-background font-semibold tracking-tight tabular-nums shadow-xs ring-1 ring-border animate-rise',
                  count > 20 ? 'px-2.5 py-1 text-sm' : count > 6 ? 'px-3.5 py-2 text-lg' : 'px-5 py-3 text-3xl sm:text-4xl',
                )}
              >
                {item.label}
              </li>
            ))}
          </ol>
        )}
      </div>

      {names && result.decision === null && (
        <div className="flex flex-wrap items-center justify-center gap-2 animate-rise" style={stagger(2)}>
          {/* Sem reposição o sorteado já fica fora da rodada; "Manter" só faz sentido quando todos continuam concorrendo. */}
          {result.replacement && (
            <Button variant="outline" size="sm" className="h-8 rounded-full px-3" onClick={() => dispatch({ type: 'resolveResult', decision: 'kept' })}>
              <UserCheck />
              {count === 1 ? 'Manter na lista' : 'Manter todos na lista'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full px-3 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => dispatch({ type: 'resolveResult', decision: 'removed' })}
          >
            <UserMinus />
            {count === 1 ? 'Remover da lista' : `Remover os ${count} da lista`}
          </Button>
        </div>
      )}
      {names && result.decision && (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Check className="size-4" />
          {result.decision === 'kept'
            ? count === 1 ? 'Continua na lista.' : 'Continuam na lista.'
            : count === 1 ? 'Removido da lista.' : 'Removidos da lista.'}
        </p>
      )}

      {allDrawn ? (
        <div className="grid w-full justify-items-center gap-3">
          <div className="flex w-full max-w-sm items-center justify-center gap-2 sm:w-auto">
            <Button size="lg" className="h-12 min-w-0 flex-1 gap-2 rounded-full px-8 text-[0.9375rem] active:scale-[0.96] sm:flex-none" onClick={newRound}>
              <ListRestart />
              Nova rodada
            </Button>
            {menu}
          </div>
          <p className="text-sm text-muted-foreground">Todos já saíram nesta rodada.</p>
        </div>
      ) : (
        <DrawButton label={names && !result.replacement ? 'Sortear o próximo' : 'Sortear novamente'} icon={<RotateCcw />} aside={menu} />
      )}
    </>
  );
}
