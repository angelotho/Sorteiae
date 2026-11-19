/**
 * Persistência local. Tudo é validado na leitura: dados ausentes, corrompidos ou de
 * outra versão caem para o padrão, campo a campo, sem derrubar a aplicação.
 */
import type { AppState, DrawResult, Mode, Participant, PendingDraw, ResultItem, Segment } from '../types';
import { MAX_PARTICIPANTS, cleanName } from '../lib/names';
import { HISTORY_LIMIT, initialState } from './reducer';

const STATE_KEY = 'sorteiae:estado:v1';

type Json = Record<string, unknown>;

const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isInt = (v: unknown): v is number => Number.isSafeInteger(v);
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const isMode = (v: unknown): v is Mode => v === 'names' || v === 'numbers';
const isLayout = (v: unknown): v is 'sequential' | 'bulk' => v === 'sequential' || v === 'bulk';

function readParticipants(v: unknown): Participant[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: Participant[] = [];
  for (const p of v) {
    if (!isObj(p) || !isStr(p.id) || !isStr(p.name) || seen.has(p.id)) continue;
    const name = cleanName(p.name);
    if (!name) continue;
    seen.add(p.id);
    out.push({ id: p.id, name });
    if (out.length >= MAX_PARTICIPANTS) break;
  }
  return out;
}

function readItems(v: unknown): ResultItem[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const items: ResultItem[] = [];
  for (const i of v) {
    if (!isObj(i) || !isStr(i.label)) return null;
    items.push({
      label: i.label,
      participantId: isStr(i.participantId) ? i.participantId : undefined,
      value: isInt(i.value) ? i.value : undefined,
    });
  }
  return items;
}

function readResult(v: unknown): DrawResult | null {
  if (!isObj(v)) return null;
  const items = readItems(v.items);
  if (!items || !isStr(v.id) || !isMode(v.kind) || !isInt(v.order) || !isNum(v.at)) return null;
  return {
    id: v.id,
    kind: v.kind,
    order: v.order,
    at: v.at,
    items,
    replacement: isBool(v.replacement) ? v.replacement : false,
    poolSize: isInt(v.poolSize) ? v.poolSize : 0,
    poolLabel: isStr(v.poolLabel) ? v.poolLabel : '',
    round: isInt(v.round) ? v.round : 1,
    layout: isLayout(v.layout) ? v.layout : items.length > 5 ? 'bulk' : 'sequential',
    decision: v.decision === 'kept' || v.decision === 'removed' ? v.decision : null,
  };
}

function readPending(v: unknown): PendingDraw | null {
  if (!isObj(v)) return null;
  const items = readItems(v.items);
  if (!items || !isStr(v.id) || !isMode(v.kind) || !isNum(v.startedAt) || !isNum(v.total) || !isLayout(v.layout)) return null;
  if (!Array.isArray(v.segments) || !Array.isArray(v.reels)) return null;
  const segments: Segment[] = [];
  for (const s of v.segments) {
    if (!isObj(s) || !isNum(s.start) || !isNum(s.end)) return null;
    segments.push({ start: s.start, end: s.end });
  }
  const reels: string[][] = [];
  for (const r of v.reels) {
    if (!Array.isArray(r) || !r.every(isStr)) return null;
    reels.push(r as string[]);
  }
  if (segments.length === 0 || reels.length !== segments.length) return null;
  return {
    id: v.id,
    kind: v.kind,
    // Relógio do sistema voltou no tempo? Não deixamos o sorteio "travado" no futuro.
    startedAt: Math.min(v.startedAt, Date.now()),
    total: v.total,
    reduced: isBool(v.reduced) ? v.reduced : false,
    layout: v.layout,
    segments,
    reels,
    items,
    replacement: isBool(v.replacement) ? v.replacement : false,
    poolSize: isInt(v.poolSize) ? v.poolSize : 0,
    poolLabel: isStr(v.poolLabel) ? v.poolLabel : '',
    round: isInt(v.round) ? v.round : 1,
  };
}

function sanitize(raw: Json): AppState {
  const d = initialState;
  const names = isObj(raw.names) ? raw.names : {};
  const numbers = isObj(raw.numbers) ? raw.numbers : {};
  const namesRound = isObj(raw.namesRound) ? raw.namesRound : {};
  const numbersRound = isObj(raw.numbersRound) ? raw.numbersRound : {};
  const participants = readParticipants(raw.participants);
  const ids = new Set(participants.map((p) => p.id));
  const history = Array.isArray(raw.history)
    ? raw.history.map(readResult).filter((r): r is DrawResult => r !== null).slice(0, HISTORY_LIMIT)
    : [];

  return {
    mode: isMode(raw.mode) ? raw.mode : d.mode,
    participants,
    names: {
      winners: isInt(names.winners) && names.winners >= 1 ? Math.min(names.winners, MAX_PARTICIPANTS) : d.names.winners,
      removeWinners: isBool(names.removeWinners) ? names.removeWinners : d.names.removeWinners,
    },
    numbers: {
      min: isStr(numbers.min) ? numbers.min.slice(0, 24) : d.numbers.min,
      max: isStr(numbers.max) ? numbers.max.slice(0, 24) : d.numbers.max,
      count: isStr(numbers.count) ? numbers.count.slice(0, 8) : d.numbers.count,
      allowRepeat: isBool(numbers.allowRepeat) ? numbers.allowRepeat : d.numbers.allowRepeat,
    },
    namesRound: {
      round: isInt(namesRound.round) && namesRound.round >= 1 ? namesRound.round : 1,
      drawnIds: Array.isArray(namesRound.drawnIds) ? namesRound.drawnIds.filter((id): id is string => isStr(id) && ids.has(id)) : [],
    },
    numbersRound: {
      round: isInt(numbersRound.round) && numbersRound.round >= 1 ? numbersRound.round : 1,
      drawn: Array.isArray(numbersRound.drawn) ? numbersRound.drawn.filter(isInt) : [],
    },
    history,
    drawCounter: isInt(raw.drawCounter) && raw.drawCounter >= 0 ? raw.drawCounter : history[0]?.order ?? 0,
    pending: readPending(raw.pending),
    result: readResult(raw.result),
    keptDuplicates: isStr(raw.keptDuplicates) ? raw.keptDuplicates : null,
  };
}

export interface LoadedState {
  state: AppState;
  notice: string | null;
}

export function loadState(): LoadedState {
  let text: string | null;
  try {
    text = localStorage.getItem(STATE_KEY);
  } catch {
    return {
      state: initialState,
      notice: 'O armazenamento do navegador está bloqueado. Você pode sortear normalmente, mas nada será salvo ao recarregar.',
    };
  }
  if (!text) return { state: initialState, notice: null };
  try {
    const raw: unknown = JSON.parse(text);
    if (!isObj(raw)) throw new Error('formato');
    return { state: sanitize(raw), notice: null };
  } catch {
    return { state: initialState, notice: 'Os dados salvos estavam danificados e foram reiniciados.' };
  }
}

export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* armazenamento indisponível: preferência vale só nesta sessão */
  }
}
