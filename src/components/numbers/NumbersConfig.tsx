import { useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { NumbersConfig as Config } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useApp } from '@/state/AppState';
import { formatNumber, parseInteger } from '@/lib/format';
import { validateNumbers } from '@/lib/validation';
import { cn } from '@/lib/utils';

const PRESETS: { label: string; config: Pick<Config, 'min' | 'max' | 'count'> }[] = [
  { label: '1 a 10', config: { min: '1', max: '10', count: '1' } },
  { label: '1 a 100', config: { min: '1', max: '100', count: '1' } },
  { label: '1 a 1.000', config: { min: '1', max: '1.000', count: '1' } },
  { label: 'Dado', config: { min: '1', max: '6', count: '1' } },
  { label: '6 de 1 a 60', config: { min: '1', max: '60', count: '6' } },
];

export function NumbersConfig() {
  const { state, dispatch } = useApp();
  const locked = state.pending !== null;
  const cfg = state.numbers;
  const { errors, plan } = useMemo(() => validateNumbers(cfg, state.numbersRound.drawn), [cfg, state.numbersRound.drawn]);
  const set = (patch: Partial<Config>) => dispatch({ type: 'setNumbersConfig', patch });
  const count = parseInteger(cfg.count);
  const one = count.ok && count.value === 1;
  const error = errors.count ?? errors.min ?? errors.max;
  const drawnCount = cfg.allowRepeat ? 0 : new Set(state.numbersRound.drawn).size;

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2.5 rounded-2xl border border-border/80 bg-background px-2.5 py-5 text-base min-[380px]:text-lg sm:gap-x-3 sm:px-3 sm:py-6 font-medium tracking-tight sm:text-xl">
        <span>Sortear</span>
        <NumberField id="num-qtd" label="Quantidade" value={cfg.count} invalid={!!errors.count} disabled={locked} width="w-14 sm:w-16" onChange={(v) => set({ count: v })} />
        <span>{one ? 'número de' : 'números de'}</span>
        <NumberField id="num-min" label="Número inicial" value={cfg.min} invalid={!!errors.min} disabled={locked} width="w-24 sm:w-28" onChange={(v) => set({ min: v })} />
        <span>a</span>
        <NumberField id="num-max" label="Número final" value={cfg.max} invalid={!!errors.max} disabled={locked} width="w-24 sm:w-28" onChange={(v) => set({ max: v })} />
      </div>

      <div className="flex min-h-10 items-center justify-between gap-2 px-0.5">
        <p className={cn('min-w-0 px-1 text-sm', error ? 'text-destructive' : 'text-muted-foreground')} role={error ? 'alert' : undefined}>
          {error ??
            (plan && drawnCount > 0 ? (
              <>
                <span className="tabular-nums">
                  Rodada {state.numbersRound.round}: {formatNumber(drawnCount)} já {drawnCount === 1 ? 'saiu' : 'saíram'}.
                </span>{' '}
                <button
                  type="button"
                  className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground disabled:opacity-50"
                  disabled={locked}
                  onClick={() => dispatch({ type: 'newRound', kind: 'numbers' })}
                >
                  Nova rodada
                </button>
              </>
            ) : plan ? (
              <span className="tabular-nums">
                {formatNumber(plan.span)} {plan.span === 1 ? 'número possível' : 'números possíveis'}
                {cfg.allowRepeat ? ', com repetição' : ''}
              </span>
            ) : null)}
        </p>
        <NumbersOptions />
      </div>
    </div>
  );
}

function NumberField(props: { id: string; label: string; value: string; invalid: boolean; disabled: boolean; width: string; onChange: (v: string) => void }) {
  return (
    <>
      <label htmlFor={props.id} className="sr-only">
        {props.label}
      </label>
      <Input
        id={props.id}
        inputMode="numeric"
        autoComplete="off"
        value={props.value}
        disabled={props.disabled}
        aria-invalid={props.invalid || undefined}
        onChange={(e) => props.onChange(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        className={cn('h-11 rounded-xl bg-muted/50 px-1.5 text-center text-lg font-semibold sm:h-12 tabular-nums shadow-none sm:text-xl md:text-xl', props.width)}
      />
    </>
  );
}

function NumbersOptions() {
  const { state, dispatch } = useApp();
  const cfg = state.numbers;
  const locked = state.pending !== null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 shrink-0 gap-1.5 rounded-full px-3 sm:gap-2 sm:px-4" disabled={locked}>
          <SlidersHorizontal />
          Opções
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(20rem,calc(100vw-2rem))] gap-0 rounded-2xl p-0">
        <div className="flex items-start justify-between gap-4 p-4">
          <Label htmlFor="repetir" className="grid cursor-pointer gap-1 font-normal">
            <span className="text-sm font-medium">Permitir repetição</span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              {cfg.allowRepeat
                ? 'Cada número é independente e pode sair mais de uma vez.'
                : 'Cada número sai no máximo uma vez por rodada.'}
            </span>
          </Label>
          <Switch id="repetir" checked={cfg.allowRepeat} onCheckedChange={(v) => dispatch({ type: 'setNumbersConfig', patch: { allowRepeat: v } })} />
        </div>
        <Separator />
        <div className="grid gap-2.5 p-4">
          <p className="text-sm font-medium">Atalhos</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => {
              const active = p.config.min === cfg.min && p.config.max === cfg.max && p.config.count === cfg.count;
              return (
                <Button
                  key={p.label}
                  size="sm"
                  variant={active ? 'default' : 'secondary'}
                  className="h-8 rounded-full px-3"
                  aria-pressed={active}
                  onClick={() => dispatch({ type: 'setNumbersConfig', patch: p.config })}
                >
                  {p.label}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
