import type { AppState, DrawResult, Mode, NamesConfig, NumbersConfig, Participant, PendingDraw } from '../types';
import { MAX_PARTICIPANTS, withoutDuplicates } from '../lib/names';
import { randomId } from '../lib/random';

export const HISTORY_LIMIT = 200;

export const initialState: AppState = {
  mode: 'names',
  participants: [],
  names: { winners: 1, removeWinners: true },
  numbers: { min: '1', max: '100', count: '1', allowRepeat: false },
  namesRound: { round: 1, drawnIds: [] },
  numbersRound: { round: 1, drawn: [] },
  history: [],
  drawCounter: 0,
  pending: null,
  result: null,
  keptDuplicates: null,
};

export type Action =
  | { type: 'setMode'; mode: Mode }
  | { type: 'addNames'; names: string[] }
  | { type: 'renameParticipant'; id: string; name: string }
  | { type: 'removeParticipant'; id: string }
  | { type: 'clearParticipants' }
  | { type: 'reorderParticipants'; participants: Participant[] }
  | { type: 'removeDuplicates' }
  | { type: 'keepDuplicates'; signature: string }
  | { type: 'setNamesConfig'; patch: Partial<NamesConfig> }
  | { type: 'setNumbersConfig'; patch: Partial<NumbersConfig> }
  | { type: 'startDraw'; draw: PendingDraw }
  | { type: 'finalizeDraw'; id: string }
  | { type: 'resolveResult'; decision: 'kept' | 'removed' }
  | { type: 'dismissResult' }
  | { type: 'newRound'; kind: Mode }
  | { type: 'clearHistory' };

function nextNamesRound(state: AppState): AppState['namesRound'] {
  if (state.namesRound.drawnIds.length === 0) return state.namesRound;
  return { round: state.namesRound.round + 1, drawnIds: [] };
}

function nextNumbersRound(state: AppState): AppState['numbersRound'] {
  if (state.numbersRound.drawn.length === 0) return state.numbersRound;
  return { round: state.numbersRound.round + 1, drawn: [] };
}

function withoutIds(state: AppState, ids: Set<string>): AppState {
  return {
    ...state,
    participants: state.participants.filter((p) => !ids.has(p.id)),
    namesRound: { ...state.namesRound, drawnIds: state.namesRound.drawnIds.filter((id) => !ids.has(id)) },
  };
}

export function reducer(state: AppState, action: Action): AppState {
  // Enquanto um sorteio está em andamento, só aceitamos a sua conclusão.
  if (state.pending && action.type !== 'finalizeDraw') return state;

  switch (action.type) {
    case 'setMode':
      if (state.mode === action.mode) return state;
      return { ...state, mode: action.mode, result: null };

    case 'addNames': {
      const room = MAX_PARTICIPANTS - state.participants.length;
      if (room <= 0 || action.names.length === 0) return state;
      const added = action.names.slice(0, room).map((name) => ({ id: randomId(), name }));
      return { ...state, participants: [...state.participants, ...added] };
    }

    case 'renameParticipant':
      return {
        ...state,
        participants: state.participants.map((p) => (p.id === action.id ? { ...p, name: action.name } : p)),
      };

    case 'removeParticipant':
      return withoutIds(state, new Set([action.id]));

    case 'clearParticipants':
      return {
        ...state,
        participants: [],
        namesRound: nextNamesRound(state),
        keptDuplicates: null,
        result: state.result?.kind === 'names' ? null : state.result,
      };

    case 'reorderParticipants':
      return { ...state, participants: action.participants };

    case 'removeDuplicates': {
      const kept = withoutDuplicates(state.participants);
      const keptIds = new Set(kept.map((p) => p.id));
      const removed = new Set(state.participants.filter((p) => !keptIds.has(p.id)).map((p) => p.id));
      return { ...withoutIds(state, removed), keptDuplicates: null };
    }

    case 'keepDuplicates':
      return { ...state, keptDuplicates: action.signature };

    case 'setNamesConfig': {
      const names = { ...state.names, ...action.patch };
      const modeChanged = action.patch.removeWinners !== undefined && action.patch.removeWinners !== state.names.removeWinners;
      return { ...state, names, namesRound: modeChanged ? nextNamesRound(state) : state.namesRound };
    }

    case 'setNumbersConfig': {
      const numbers = { ...state.numbers, ...action.patch };
      const rulesChanged =
        numbers.min !== state.numbers.min || numbers.max !== state.numbers.max || numbers.allowRepeat !== state.numbers.allowRepeat;
      return { ...state, numbers, numbersRound: rulesChanged ? nextNumbersRound(state) : state.numbersRound };
    }

    case 'startDraw':
      return { ...state, pending: action.draw, result: null };

    case 'finalizeDraw': {
      const p = state.pending;
      if (!p || p.id !== action.id) return state;
      const order = state.drawCounter + 1;
      const result: DrawResult = {
        id: p.id,
        kind: p.kind,
        order,
        at: p.startedAt,
        items: p.items,
        replacement: p.replacement,
        poolSize: p.poolSize,
        poolLabel: p.poolLabel,
        round: p.round,
        layout: p.layout,
        decision: null,
      };
      let { namesRound, numbersRound } = state;
      if (p.kind === 'names' && !p.replacement) {
        const ids = p.items.map((i) => i.participantId).filter((id): id is string => !!id);
        namesRound = { ...namesRound, drawnIds: [...namesRound.drawnIds, ...ids] };
      }
      if (p.kind === 'numbers' && !p.replacement) {
        const values = p.items.map((i) => i.value).filter((v): v is number => typeof v === 'number');
        numbersRound = { ...numbersRound, drawn: [...numbersRound.drawn, ...values] };
      }
      return {
        ...state,
        pending: null,
        result,
        drawCounter: order,
        history: [result, ...state.history].slice(0, HISTORY_LIMIT),
        namesRound,
        numbersRound,
      };
    }

    case 'resolveResult': {
      const r = state.result;
      if (!r || r.kind !== 'names' || r.decision) return state;
      const resolved = {
        ...state,
        result: { ...r, decision: action.decision },
        history: state.history.map((h) => (h.id === r.id ? { ...h, decision: action.decision } : h)),
      };
      if (action.decision === 'kept') return resolved;
      const ids = new Set(r.items.map((i) => i.participantId).filter((id): id is string => !!id));
      return withoutIds(resolved, ids);
    }

    case 'dismissResult':
      return state.result ? { ...state, result: null } : state;

    case 'newRound':
      return action.kind === 'names'
        ? { ...state, namesRound: { round: state.namesRound.round + 1, drawnIds: [] }, result: null }
        : { ...state, numbersRound: { round: state.numbersRound.round + 1, drawn: [] }, result: null };

    case 'clearHistory':
      return { ...state, history: [], drawCounter: 0 };
  }
}
