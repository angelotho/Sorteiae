/**
 * Monta um sorteio: decide o resultado com o gerador seguro e só depois prepara o
 * roteiro visual da animação. A animação lê este objeto; nunca o altera.
 */
import type { Participant, PendingDraw, ResultItem, Segment } from '../types';
import { formatNumber, plural } from './format';
import { randomBelow, randomId, randomInt, sampleDistinctIndices } from './random';
import type { NumbersPlan } from './validation';

/** Até este número de resultados, cada um ganha sua própria revelação em sequência. */
const SEQUENTIAL_LIMIT = 5;

const TIMING = {
  normal: { first: 3800, next: 1900, gap: 700, bulk: 4200, firstSteps: 34, nextSteps: 20, bulkSteps: 42 },
  reduced: { first: 900, next: 450, gap: 250, bulk: 900, firstSteps: 0, nextSteps: 0, bulkSteps: 0 },
};

function buildSchedule(count: number, reduced: boolean) {
  const t = reduced ? TIMING.reduced : TIMING.normal;
  const layout: PendingDraw['layout'] = count <= SEQUENTIAL_LIMIT ? 'sequential' : 'bulk';
  const segments: Segment[] = [];
  const steps: number[] = [];
  if (layout === 'bulk') {
    segments.push({ start: 0, end: t.bulk });
    steps.push(t.bulkSteps);
  } else {
    let cursor = 0;
    for (let i = 0; i < count; i++) {
      const length = i === 0 ? t.first : t.next;
      segments.push({ start: cursor, end: cursor + length });
      steps.push(i === 0 ? t.firstSteps : t.nextSteps);
      cursor += length + t.gap;
    }
  }
  return { layout, segments, steps, total: segments[segments.length - 1].end };
}

/** Sequência decorativa terminando no resultado real. Evita repetir o resultado logo antes dele. */
function buildReel(length: number, finalLabel: string, decoy: () => string): string[] {
  if (length <= 0) return [finalLabel];
  const reel: string[] = [];
  for (let i = 0; i < length - 1; i++) reel.push(decoy());
  for (let tries = 0; tries < 6 && reel.length > 0 && reel[reel.length - 1] === finalLabel; tries++) {
    reel[reel.length - 1] = decoy();
  }
  reel.push(finalLabel);
  return reel;
}

interface DrawOptions {
  reduced: boolean;
  round: number;
  replacement: boolean;
}

export function createNamesDraw(eligible: readonly Participant[], winners: number, opts: DrawOptions): PendingDraw {
  // Decisão: índices distintos e uniformes; a posição na lista não favorece ninguém.
  const indices = sampleDistinctIndices(eligible.length, winners);
  const items: ResultItem[] = indices.map((i) => ({ label: eligible[i].name, participantId: eligible[i].id }));

  // Visual: daqui em diante nada influencia `items`.
  const schedule = buildSchedule(items.length, opts.reduced);
  const decoy = () => eligible[randomBelow(eligible.length)].name;
  const reels = schedule.segments.map((_, s) => buildReel(schedule.steps[s], items[s].label, decoy));

  return {
    id: randomId(),
    kind: 'names',
    startedAt: Date.now(),
    total: schedule.total,
    reduced: opts.reduced,
    layout: schedule.layout,
    segments: schedule.segments,
    reels,
    items,
    replacement: opts.replacement,
    poolSize: eligible.length,
    poolLabel: `entre ${plural(eligible.length, 'participante', 'participantes')}`,
    round: opts.round,
  };
}

/** i-ésimo valor (base 0) do intervalo que não está em `excludedOffsets` (ordenado, crescente). */
function nthAvailableOffset(i: number, excludedOffsets: readonly number[]): number {
  // Busca binária pelo maior j com excluded[j] - j <= i.
  let lo = 0;
  let hi = excludedOffsets.length - 1;
  let j = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (excludedOffsets[mid] - mid <= i) {
      j = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return i + j + 1;
}

export function drawNumberValues(plan: NumbersPlan): number[] {
  if (plan.allowRepeat) {
    return Array.from({ length: plan.count }, () => randomInt(plan.min, plan.max));
  }
  // Sem repetição: sorteia posições entre os disponíveis, sem percorrer o intervalo.
  const offsets = plan.excluded.map((n) => n - plan.min);
  return sampleDistinctIndices(plan.available, plan.count).map((i) => plan.min + nthAvailableOffset(i, offsets));
}

export function createNumbersDraw(plan: NumbersPlan, opts: Omit<DrawOptions, 'replacement'>): PendingDraw {
  const values = drawNumberValues(plan);
  const items: ResultItem[] = values.map((value) => ({ label: formatNumber(value), value }));

  const schedule = buildSchedule(items.length, opts.reduced);
  const decoy = () => formatNumber(randomInt(plan.min, plan.max));
  const reels = schedule.segments.map((_, s) => buildReel(schedule.steps[s], items[s].label, decoy));

  return {
    id: randomId(),
    kind: 'numbers',
    startedAt: Date.now(),
    total: schedule.total,
    reduced: opts.reduced,
    layout: schedule.layout,
    segments: schedule.segments,
    reels,
    items,
    replacement: plan.allowRepeat,
    poolSize: plan.available,
    poolLabel: `de ${formatNumber(plan.min)} a ${formatNumber(plan.max)}`,
    round: opts.round,
  };
}

/** Desaceleração progressiva: começa rápido e freia até parar no resultado. */
export function easeOutQuart(x: number): number {
  const c = Math.min(1, Math.max(0, x));
  return 1 - (1 - c) ** 4;
}
