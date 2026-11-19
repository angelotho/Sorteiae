import { useMemo, useRef, useState } from 'react';
import { ChevronRight, Minus, Plus, SlidersHorizontal, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useApp } from '@/state/AppState';
import { notify } from '@/lib/notify';
import { findDuplicates, MAX_PARTICIPANTS, parseNameList, SAMPLE_NAMES } from '@/lib/names';
import { eligibleParticipants } from '@/lib/validation';
import { formatNumber, plural } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ParticipantsSheet } from './ParticipantsSheet';

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  const first = Array.from(parts[0] ?? '?')[0] ?? '?';
  const last = parts.length > 1 ? (Array.from(parts[parts.length - 1])[0] ?? '') : '';
  return (first + last).toLocaleUpperCase('pt-BR');
}

export function NamesConfig() {
  const { state, dispatch } = useApp();
  const locked = state.pending !== null;
  const { participants } = state;
  const [text, setText] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const pendingCount = useMemo(() => parseNameList(text).length, [text]);
  const duplicates = useMemo(() => findDuplicates(participants), [participants]);
  const showDuplicates = duplicates.groups > 0 && duplicates.signature !== state.keptDuplicates;
  const eligible = eligibleParticipants(state).length;
  const drawn = state.names.removeWinners ? state.namesRound.drawnIds.length : 0;

  const submit = () => {
    const names = parseNameList(text);
    if (names.length === 0) return ref.current?.focus();
    const room = MAX_PARTICIPANTS - participants.length;
    if (room <= 0) return notify(`A lista já tem o máximo de ${formatNumber(MAX_PARTICIPANTS)} participantes.`, 'error');
    dispatch({ type: 'addNames', names });
    if (names.length > room) notify(`Só ${formatNumber(room)} nomes couberam: o limite é ${formatNumber(MAX_PARTICIPANTS)}.`, 'error');
    else if (names.length > 1) notify(`${formatNumber(names.length)} participantes adicionados.`, 'success');
    setText('');
    ref.current?.focus();
  };

  return (
    <div className="grid gap-3">
      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor="novos-nomes" className="sr-only">
          Nomes dos participantes, um por linha
        </label>
        <Textarea
          ref={ref}
          id="novos-nomes"
          value={text}
          disabled={locked}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={'Digite um nome ou cole uma lista\nUm nome por linha'}
          autoComplete="off"
          spellCheck={false}
          className="max-h-[40vh] min-h-24 resize-none rounded-2xl border-border/80 bg-background px-3.5 pt-3 pb-12 sm:min-h-28 sm:px-4 sm:pt-3.5 sm:pb-14 text-base leading-relaxed shadow-none md:text-[15px]"
        />
        <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 flex sm:inset-x-3 sm:bottom-3 items-center justify-end gap-3">
          <span className="hidden text-xs text-muted-foreground md:[@media(pointer:fine)]:inline">
            <kbd className="font-sans font-medium text-foreground/70">Enter</kbd> adiciona, <kbd className="font-sans font-medium text-foreground/70">Shift + Enter</kbd> pula linha
          </span>
          <Button type="submit" size="sm" className="pointer-events-auto h-8 rounded-full px-3.5" disabled={locked || pendingCount === 0}>
            <Plus />
            {pendingCount > 1 ? `Adicionar ${formatNumber(pendingCount)}` : 'Adicionar'}
          </Button>
        </div>
      </form>

      <div className="flex min-h-10 items-center justify-between gap-2 px-0.5">
        {participants.length === 0 ? (
          <p className="px-1 text-sm text-muted-foreground">
            Nenhum participante.{' '}
            <button
              type="button"
              className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground disabled:opacity-50"
              disabled={locked}
              onClick={() => dispatch({ type: 'addNames', names: SAMPLE_NAMES })}
            >
              Usar exemplo
            </button>
          </p>
        ) : (
          <Button variant="ghost" className="h-10 min-w-0 shrink gap-2 rounded-full pr-1.5 pl-1 sm:-ml-1 sm:gap-2.5 sm:pr-2 sm:pl-1.5" onClick={() => setListOpen(true)}>
            <span className="flex -space-x-1.5" aria-hidden>
              {participants.slice(0, 3).map((p, i) => (
                <span
                  key={p.id}
                  className={cn('grid size-7 place-items-center rounded-full bg-brand-soft text-[0.625rem] font-semibold text-brand ring-2 ring-card', i > 1 && 'max-[379px]:hidden')}
                >
                  {initials(p.name)}
                </span>
              ))}
            </span>
            <span className="truncate text-sm font-medium tabular-nums">
              {drawn > 0
                ? `${formatNumber(eligible)} de ${formatNumber(participants.length)} na disputa`
                : plural(participants.length, 'participante', 'participantes')}
            </span>
            <ChevronRight className="shrink-0 text-muted-foreground" />
          </Button>
        )}
        <NamesOptions />
      </div>

      {showDuplicates && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-amber-500/10 px-3 py-2 sm:px-3.5 sm:py-2.5 text-sm text-amber-900 animate-rise dark:text-amber-200">
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          <span className="mr-auto">
            {duplicates.groups === 1 ? '1 nome aparece repetido' : `${formatNumber(duplicates.groups)} nomes aparecem repetidos`}
          </span>
          <span className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 hover:bg-amber-500/15" disabled={locked} onClick={() => dispatch({ type: 'removeDuplicates' })}>
              Remover {duplicates.extras === 1 ? 'repetido' : `${formatNumber(duplicates.extras)} repetidos`}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 hover:bg-amber-500/15"
              disabled={locked}
              onClick={() => dispatch({ type: 'keepDuplicates', signature: duplicates.signature })}
            >
              Manter
            </Button>
          </span>
        </div>
      )}

      <ParticipantsSheet open={listOpen} onOpenChange={setListOpen} duplicateIds={duplicates.ids} />
    </div>
  );
}

function NamesOptions() {
  const { state, dispatch } = useApp();
  const locked = state.pending !== null;
  const { winners, removeWinners } = state.names;
  const max = Math.max(1, Math.min(eligibleParticipants(state).length || 1, MAX_PARTICIPANTS));
  const setWinners = (n: number) => dispatch({ type: 'setNamesConfig', patch: { winners: Math.min(Math.max(1, n), Math.max(max, 1)) } });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 shrink-0 gap-1.5 rounded-full px-3 sm:gap-2 sm:px-4" disabled={locked}>
          <SlidersHorizontal />
          <span className="tabular-nums">{winners === 1 ? '1 vencedor' : `${formatNumber(winners)} vencedores`}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(20rem,calc(100vw-2rem))] gap-0 rounded-2xl p-0">
        <div className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm font-medium">Vencedores</p>
            <p className="text-xs text-muted-foreground">Sempre pessoas diferentes</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" className="rounded-full" onClick={() => setWinners(winners - 1)} disabled={winners <= 1} aria-label="Menos um vencedor">
              <Minus />
            </Button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
              {winners}
            </span>
            <Button variant="outline" size="icon-sm" className="rounded-full" onClick={() => setWinners(winners + 1)} disabled={winners >= max} aria-label="Mais um vencedor">
              <Plus />
            </Button>
          </div>
        </div>
        <Separator />
        <div className="flex items-start justify-between gap-4 p-4">
          <Label htmlFor="nao-repetir" className="grid cursor-pointer gap-1 font-normal">
            <span className="text-sm font-medium">Não repetir quem já saiu</span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              {removeWinners ? 'Sorteados ficam de fora até a próxima rodada.' : 'Todos continuam concorrendo em todo sorteio.'}
            </span>
          </Label>
          <Switch id="nao-repetir" checked={removeWinners} onCheckedChange={(v) => dispatch({ type: 'setNamesConfig', patch: { removeWinners: v } })} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
