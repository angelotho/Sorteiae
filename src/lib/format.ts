const numberFormat = new Intl.NumberFormat('pt-BR');

export function formatNumber(n: number): string {
  return numberFormat.format(n);
}

/** "1 participante" / "24 participantes" */
export function plural(n: number, singular: string, pluralForm: string): string {
  return `${formatNumber(n)} ${n === 1 ? singular : pluralForm}`;
}

export function ordinal(n: number): string {
  return `${n}º`;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${date} às ${time}`;
}

export type ParsedInteger =
  | { ok: true; value: number }
  | { ok: false; reason: 'empty' | 'decimal' | 'invalid' };

/** Aceita "1000", "1.000", "-25", " 42 ". Rejeita decimais e textos. */
export function parseInteger(raw: string): ParsedInteger {
  const s = raw.trim().replace(/\s/g, '');
  if (s === '' || s === '-') return { ok: false, reason: 'empty' };
  if (s.includes(',')) return { ok: false, reason: 'decimal' };
  const digits = s.replace(/\.(?=\d{3}(\D|$))/g, '');
  if (!/^-?\d+$/.test(digits)) return { ok: false, reason: 'invalid' };
  const value = Number(digits);
  if (!Number.isSafeInteger(value)) return { ok: false, reason: 'invalid' };
  return { ok: true, value };
}
