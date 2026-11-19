import { cn } from '@/lib/utils';

interface Props {
  items: string[];
  /** Posição contínua: 0 = primeiro item, items.length - 1 = resultado. */
  pos: number;
  className?: string;
  landed?: boolean;
}

/** Carrossel vertical puramente visual: desenha só os itens vizinhos da posição atual. */
export function Reel({ items, pos, className, landed }: Props) {
  const base = Math.floor(pos);
  const frac = pos - base;
  const rows = [];
  for (let k = -1; k <= 2; k++) {
    const idx = base + k;
    if (idx < 0 || idx >= items.length) continue;
    const offset = k - frac;
    rows.push(
      <span
        key={idx}
        className={cn('reel__item transition-colors duration-300', landed && Math.abs(offset) < 0.5 && 'text-brand')}
        style={{ transform: `translate3d(0, ${offset * 100}%, 0)`, opacity: Math.max(0, 1 - Math.abs(offset) * 0.7) }}
      >
        {items[idx]}
      </span>,
    );
  }
  return (
    <div className={cn('reel', className)} aria-hidden>
      {rows}
    </div>
  );
}
