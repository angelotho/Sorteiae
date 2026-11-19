import type { AppState, NumbersConfig, Participant } from '../types';
import { formatNumber, parseInteger, plural } from './format';

export const MAX_ABS_NUMBER = 1_000_000_000_000; // 1 trilhão
export const MAX_DRAW_COUNT = 1000;

export type FieldErrors = Partial<Record<'min' | 'max' | 'count', string>>;

export interface NumbersPlan {
  min: number;
  max: number;
  count: number;
  allowRepeat: boolean;
  span: number;
  /** Números já sorteados na rodada, dentro do intervalo (só sem repetição). */
  excluded: number[];
  available: number;
}

function integerError(reason: 'empty' | 'decimal' | 'invalid', emptyMessage: string): string {
  if (reason === 'empty') return emptyMessage;
  if (reason === 'decimal') return 'Use um número inteiro, sem vírgula.';
  return 'Digite apenas números inteiros.';
}

export function validateNumbers(
  config: NumbersConfig,
  drawnInRound: readonly number[],
): { errors: FieldErrors; plan: NumbersPlan | null } {
  const errors: FieldErrors = {};
  const min = parseInteger(config.min);
  const max = parseInteger(config.max);
  const count = parseInteger(config.count);
  const limitMessage = 'Use valores entre -1 trilhão e 1 trilhão.';

  if (!min.ok) errors.min = integerError(min.reason, 'Informe o número inicial.');
  else if (Math.abs(min.value) > MAX_ABS_NUMBER) errors.min = limitMessage;

  if (!max.ok) errors.max = integerError(max.reason, 'Informe o número final.');
  else if (Math.abs(max.value) > MAX_ABS_NUMBER) errors.max = limitMessage;

  if (!errors.min && !errors.max && min.ok && max.ok && min.value > max.value) {
    errors.max = 'O número final precisa ser maior ou igual ao inicial.';
  }

  if (!count.ok) errors.count = integerError(count.reason, 'Informe quantos números sortear.');
  else if (count.value < 1) errors.count = 'Sorteie pelo menos 1 número.';
  else if (count.value > MAX_DRAW_COUNT) errors.count = `Máximo de ${formatNumber(MAX_DRAW_COUNT)} números por sorteio.`;

  if (errors.min || errors.max || !min.ok || !max.ok) return { errors, plan: null };

  const span = max.value - min.value + 1;
  const excluded = config.allowRepeat
    ? []
    : Array.from(new Set(drawnInRound.filter((n) => n >= min.value && n <= max.value))).sort((a, b) => a - b);
  const available = span - excluded.length;

  if (!errors.count && count.ok && !config.allowRepeat) {
    if (available === 0) {
      errors.count = 'Todos os números deste intervalo já saíram nesta rodada. Comece uma nova rodada.';
    } else if (count.value > available) {
      const where = excluded.length > 0 ? ' nesta rodada' : '';
      errors.count = `Só há ${plural(available, 'número disponível', 'números disponíveis')}${where}. Reduza a quantidade ou permita repetição.`;
    }
  }

  if (errors.count || !count.ok) return { errors, plan: null };

  return {
    errors,
    plan: { min: min.value, max: max.value, count: count.value, allowRepeat: config.allowRepeat, span, excluded, available },
  };
}

export function eligibleParticipants(state: Pick<AppState, 'participants' | 'names' | 'namesRound'>): Participant[] {
  if (!state.names.removeWinners || state.namesRound.drawnIds.length === 0) return state.participants;
  const drawn = new Set(state.namesRound.drawnIds);
  return state.participants.filter((p) => !drawn.has(p.id));
}

export type Readiness = { ok: true; summary: string } | { ok: false; message: string };

export function namesReadiness(state: AppState): Readiness {
  const total = state.participants.length;
  if (total === 0) return { ok: false, message: 'Adicione pelo menos um participante para sortear.' };
  const eligible = eligibleParticipants(state).length;
  if (eligible === 0) {
    return { ok: false, message: 'Todos já foram sorteados nesta rodada. Comece uma nova rodada para sortear de novo.' };
  }
  const winners = state.names.winners;
  if (winners > eligible) {
    return {
      ok: false,
      message: `Você pediu ${formatNumber(winners)} vencedores, mas só ${eligible === 1 ? 'há 1 participante disponível' : `há ${formatNumber(eligible)} participantes disponíveis`}.`,
    };
  }
  const who = winners === 1 ? '1 vencedor' : `${formatNumber(winners)} vencedores`;
  const pool = eligible === 1 ? 'só 1 participante' : `${formatNumber(eligible)} participantes`;
  return { ok: true, summary: `${who} entre ${pool}` };
}

export function numbersReadiness(state: AppState): Readiness {
  const { errors, plan } = validateNumbers(state.numbers, state.numbersRound.drawn);
  if (!plan) {
    const message = errors.min ?? errors.max ?? errors.count ?? 'Revise a configuração.';
    return { ok: false, message };
  }
  const what = plan.count === 1 ? '1 número' : `${formatNumber(plan.count)} números`;
  return { ok: true, summary: `${what} de ${formatNumber(plan.min)} a ${formatNumber(plan.max)}` };
}

export function readiness(state: AppState): Readiness {
  return state.mode === 'names' ? namesReadiness(state) : numbersReadiness(state);
}
