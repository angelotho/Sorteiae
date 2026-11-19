import { useState } from 'react';
import { History, Trash2 } from 'lucide-react';
import type { DrawResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApp } from '@/state/AppState';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { notify } from '@/lib/notify';
import { formatDateTime, ordinal, plural } from '@/lib/format';
import { cn } from '@/lib/utils';

const PREVIEW = 15;
const PAGE = 30;

export function HistorySheet() {
  const { state, dispatch } = useApp();
  const desktop = useMediaQuery('(min-width: 640px)');
  const [confirm, setConfirm] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const { history } = state;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 rounded-full px-3 text-muted-foreground hover:text-foreground">
          <History />
          <span className="hidden sm:inline">Histórico</span>
          {history.length > 0 && <span className="text-xs tabular-nums text-muted-foreground">{history.length}</span>}
        </Button>
      </SheetTrigger>
      <SheetContent side={desktop ? 'right' : 'bottom'} className={cn('gap-0 p-0', desktop ? 'w-full sm:max-w-md' : 'h-[85dvh] rounded-t-3xl')}>
        <SheetHeader className="gap-1 border-b px-5 pt-5 pb-4">
          <SheetTitle className="text-lg font-semibold tracking-tight">Histórico</SheetTitle>
          <SheetDescription>{history.length === 0 ? 'Nenhum sorteio registrado.' : plural(history.length, 'sorteio registrado', 'sorteios registrados')}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {history.length === 0 ? (
            <div className="grid justify-items-center gap-1.5 px-6 py-20 text-center">
              <p className="font-medium">Ainda não há sorteios</p>
              <p className="max-w-[30ch] text-sm text-muted-foreground">Cada resultado aparece aqui, com data, horário e rodada.</p>
            </div>
          ) : (
            <ol className="divide-y">
              {history.slice(0, limit).map((entry) => (
                <Entry key={entry.id} entry={entry} />
              ))}
            </ol>
          )}
          {history.length > limit && (
            <div className="flex justify-center py-4">
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => setLimit((l) => l + PAGE)}>
                Ver anteriores
              </Button>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="border-t p-3">
            <Button
              variant="ghost"
              className="w-full rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              disabled={state.pending !== null}
              onClick={() => setConfirm(true)}
            >
              <Trash2 />
              Limpar histórico
            </Button>
          </div>
        )}

        <ConfirmDialog
          open={confirm}
          onOpenChange={setConfirm}
          title="Limpar o histórico?"
          description={`${plural(history.length, 'registro será apagado', 'registros serão apagados')}. Participantes e configurações não mudam.`}
          confirmLabel="Limpar histórico"
          onConfirm={() => {
            dispatch({ type: 'clearHistory' });
            notify('Histórico limpo.', 'success');
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

function Entry({ entry }: { entry: DrawResult }) {
  const names = entry.kind === 'names';
  const shown = entry.items.slice(0, PREVIEW);
  const rest = entry.items.length - shown.length;
  const rule = entry.replacement ? (names ? 'com reposição' : 'com repetição') : `sem repetição, rodada ${entry.round}`;

  return (
    <li className="grid gap-2 px-5 py-4 [content-visibility:auto] [contain-intrinsic-size:auto_96px]">
      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground tabular-nums">
        <span>
          <span className="font-medium text-foreground">Sorteio {entry.order}</span> {names ? 'de nomes' : 'de números'}
        </span>
        <time dateTime={new Date(entry.at).toISOString()}>{formatDateTime(entry.at)}</time>
      </div>
      {names ? (
        <ol className="grid gap-0.5 text-[0.9375rem] font-medium break-words">
          {shown.map((item, i) => (
            <li key={i}>
              {entry.items.length > 1 && <span className="mr-2 inline-block w-6 text-muted-foreground tabular-nums">{ordinal(i + 1)}</span>}
              {item.label}
            </li>
          ))}
        </ol>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {shown.map((item, i) => (
            <li key={i} className="rounded-lg bg-muted px-2 py-0.5 text-sm font-semibold tabular-nums">
              {item.label}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        {rest > 0 && <span className="text-foreground/70">e mais {rest}. </span>}
        {entry.poolLabel}, {rule}
        {entry.decision === 'removed' ? '. Removido da lista.' : '.'}
      </p>
    </li>
  );
}
