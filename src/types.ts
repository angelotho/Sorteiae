export type Mode = 'names' | 'numbers';

export interface Participant {
  id: string;
  name: string;
}

export interface NamesConfig {
  /** Quantos vencedores por sorteio (sempre distintos dentro do mesmo sorteio). */
  winners: number;
  /** Sem reposição: quem já saiu fica de fora até a próxima rodada. */
  removeWinners: boolean;
}

export interface NumbersConfig {
  /** Valores crus dos campos, como o usuário digitou. */
  min: string;
  max: string;
  count: string;
  /** Com reposição: o mesmo número pode sair mais de uma vez (inclusive no mesmo sorteio). */
  allowRepeat: boolean;
}

export interface ResultItem {
  label: string;
  participantId?: string;
  value?: number;
}

export interface Segment {
  start: number;
  end: number;
}

/** Sorteio já decidido pelo gerador seguro, aguardando o fim da animação. */
export interface PendingDraw {
  id: string;
  kind: Mode;
  /** Epoch em ms (Date.now) — sobrevive a recarregar a página. */
  startedAt: number;
  total: number;
  reduced: boolean;
  layout: 'sequential' | 'bulk';
  segments: Segment[];
  /** Sequências decorativas exibidas no carrossel; o último item de cada uma é o resultado. */
  reels: string[][];
  items: ResultItem[];
  replacement: boolean;
  poolSize: number;
  poolLabel: string;
  round: number;
}

export interface DrawResult {
  id: string;
  kind: Mode;
  order: number;
  at: number;
  items: ResultItem[];
  replacement: boolean;
  poolSize: number;
  poolLabel: string;
  round: number;
  layout: 'sequential' | 'bulk';
  /** Escolha do usuário sobre os sorteados (apenas nomes com reposição). */
  decision: 'kept' | 'removed' | null;
}

export interface AppState {
  mode: Mode;
  participants: Participant[];
  names: NamesConfig;
  numbers: NumbersConfig;
  namesRound: { round: number; drawnIds: string[] };
  numbersRound: { round: number; drawn: number[] };
  history: DrawResult[];
  drawCounter: number;
  pending: PendingDraw | null;
  result: DrawResult | null;
  /** Assinatura dos duplicados que o usuário decidiu manter. */
  keptDuplicates: string | null;
}
