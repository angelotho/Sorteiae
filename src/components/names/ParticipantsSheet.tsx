import { memo, useMemo, useState } from 'react';
import { ArrowDownAZ, ArrowUpZA, Check, Ellipsis, Pencil, Search, Shuffle, Trash2, Users, X } from 'lucide-react';
import type { Participant } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApp } from '@/state/AppState';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { notify } from '@/lib/notify';
import { cleanName, nameKey, sortParticipants } from '@/lib/names';
import { shuffled } from '@/lib/random';
import { formatNumber, plural } from '@/lib/format';
import { cn } from '@/lib/utils';

const PAGE = 200;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicateIds: Set<string>;
}

export function ParticipantsSheet({ open, onOpenChange, duplicateIds }: Props) {
  const { state, dispatch } = useApp();
  const desktop = useMediaQuery('(min-width: 640px)');
  const { participants } = state;
  const locked = state.pending !== null;
  const drawnIds = useMemo(
    () => new Set(state.names.removeWinners ? state.namesRound.drawnIds : []),
    [state.names.removeWinners, state.namesRound.drawnIds],
  );
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    const q = nameKey(query);
    const rows = participants.map((p, i) => ({ p, position: i + 1 }));
    return q ? rows.filter(({ p }) => nameKey(p.name).includes(q)) : rows;
  }, [participants, query]);
  const visible = filtered.slice(0, limit);
  const remaining = filtered.length - visible.length;
  const few = participants.length < 2 || locked;

  const reorder = (next: Participant[], message: string) => {
    dispatch({ type: 'reorderParticipants', participants: next });
    notify(message);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={desktop ? 'right' : 'bottom'}
        className={cn('gap-0 p-0', desktop ? 'w-full sm:max-w-md' : 'h-[88dvh] rounded-t-3xl')}
      >
        <SheetHeader className="gap-1 px-5 pt-5 pb-4">
          <SheetTitle className="text-lg font-semibold tracking-tight">Participantes</SheetTitle>
          <SheetDescription className="tabular-nums">
            {participants.length === 0
              ? 'A lista está vazia.'
              : drawnIds.size > 0
                ? `${formatNumber(participants.length - drawnIds.size)} de ${formatNumber(participants.length)} ainda na disputa`
                : plural(participants.length, 'participante', 'participantes')}
          </SheetDescription>
        </SheetHeader>

        {participants.length > 0 && (
          <div className="flex items-center gap-1.5 border-b px-5 pb-4">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <label htmlFor="buscar" className="sr-only">
                Buscar participante
              </label>
              <Input
                id="buscar"
                type="search"
                value={query}
                autoComplete="off"
                placeholder="Buscar"
                className="h-9 rounded-full pl-9 text-base md:text-sm [&::-webkit-search-cancel-button]:hidden"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setLimit(PAGE);
                }}
                onKeyDown={(e) => e.key === 'Escape' && query && (e.stopPropagation(), setQuery(''))}
              />
            </div>
            <IconAction label="Embaralhar" disabled={few} onClick={() => reorder(shuffled(participants), 'Lista embaralhada. A ordem não muda as chances de ninguém.')}>
              <Shuffle />
            </IconAction>
            <IconAction label="Ordem de A a Z" disabled={few} onClick={() => reorder(sortParticipants(participants, 'asc'), 'Lista em ordem de A a Z.')}>
              <ArrowDownAZ />
            </IconAction>
            <IconAction label="Ordem de Z a A" disabled={few} onClick={() => reorder(sortParticipants(participants, 'desc'), 'Lista em ordem de Z a A.')}>
              <ArrowUpZA />
            </IconAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9 rounded-full" aria-label="Mais ações" disabled={locked}>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem disabled={duplicateIds.size === 0} onSelect={() => dispatch({ type: 'removeDuplicates' })}>
                  <Users />
                  Remover repetidos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setConfirmClear(true)}>
                  <Trash2 />
                  Limpar lista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
          {participants.length === 0 ? (
            <Empty title="Nenhum participante" text="Feche este painel e digite ou cole os nomes no campo principal." />
          ) : filtered.length === 0 ? (
            <Empty title="Nada encontrado" text={`Nenhum nome contém “${query}”.`} action={<Button variant="outline" size="sm" onClick={() => setQuery('')}>Limpar busca</Button>} />
          ) : (
            <ol aria-label="Lista de participantes">
              {visible.map(({ p, position }) => (
                <Row
                  key={p.id}
                  participant={p}
                  position={position}
                  duplicate={duplicateIds.has(p.id)}
                  drawn={drawnIds.has(p.id)}
                  editing={editingId === p.id}
                  disabled={locked}
                  onEdit={setEditingId}
                  onRename={(id, name) => dispatch({ type: 'renameParticipant', id, name })}
                  onRemove={(id) => dispatch({ type: 'removeParticipant', id })}
                />
              ))}
            </ol>
          )}
          {remaining > 0 && (
            <div className="flex justify-center py-3">
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => setLimit((l) => l + PAGE)}>
                Mostrar mais {formatNumber(Math.min(PAGE, remaining))}
              </Button>
            </div>
          )}
        </div>

        <ConfirmDialog
          open={confirmClear}
          onOpenChange={setConfirmClear}
          title="Limpar a lista?"
          description={`${plural(participants.length, 'participante será removido', 'participantes serão removidos')}. O histórico continua salvo.`}
          confirmLabel="Limpar lista"
          onConfirm={() => {
            dispatch({ type: 'clearParticipants' });
            setQuery('');
            notify('Lista de participantes limpa.', 'success');
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

function IconAction({ label, children, ...props }: { label: string; children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 shrink-0 rounded-full" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function Empty({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="grid justify-items-center gap-1.5 px-6 py-16 text-center">
      <p className="font-medium">{title}</p>
      <p className="max-w-[32ch] text-sm break-words text-muted-foreground">{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

interface RowProps {
  participant: Participant;
  position: number;
  duplicate: boolean;
  drawn: boolean;
  editing: boolean;
  disabled: boolean;
  onEdit: (id: string | null) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

const Row = memo(function Row({ participant, position, duplicate, drawn, editing, disabled, onEdit, onRename, onRemove }: RowProps) {
  const [draft, setDraft] = useState(participant.name);
  const save = () => {
    const name = cleanName(draft);
    if (name && name !== participant.name) onRename(participant.id, name);
    onEdit(null);
  };

  return (
    <li className="group flex min-h-11 items-center gap-3 rounded-xl py-1 pr-1 pl-2 transition-colors hover:bg-muted/60 [content-visibility:auto] [contain-intrinsic-size:auto_44px]">
      <span className="w-7 shrink-0 text-right text-xs text-muted-foreground tabular-nums" aria-hidden>
        {position}
      </span>
      {editing ? (
        <form
          className="flex min-w-0 flex-1 items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label htmlFor={`editar-${participant.id}`} className="sr-only">
            Editar nome
          </label>
          <Input
            id={`editar-${participant.id}`}
            value={draft}
            maxLength={120}
            autoFocus
            className="h-9 text-base md:text-sm"
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onEdit(null);
              }
            }}
          />
          <Button type="submit" variant="ghost" size="icon" className="size-9" aria-label="Salvar" onMouseDown={(e) => e.preventDefault()}>
            <Check />
          </Button>
        </form>
      ) : (
        <>
          <span className={cn('min-w-0 flex-1 text-sm leading-snug break-words', drawn && 'text-muted-foreground line-through decoration-border')}>
            {participant.name}
          </span>
          {drawn && <span className="shrink-0 text-xs text-muted-foreground">já saiu</span>}
          {duplicate && <span className="shrink-0 rounded-full bg-amber-500/12 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">repetido</span>}
          <span className="flex shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full text-muted-foreground"
              disabled={disabled}
              aria-label={`Editar ${participant.name}`}
              onClick={() => {
                setDraft(participant.name);
                onEdit(participant.id);
              }}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              disabled={disabled}
              aria-label={`Remover ${participant.name}`}
              onClick={() => onRemove(participant.id)}
            >
              <X />
            </Button>
          </span>
        </>
      )}
    </li>
  );
});
