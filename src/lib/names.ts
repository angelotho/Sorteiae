import type { Participant } from '../types';

export const MAX_NAME_LENGTH = 120;
export const MAX_PARTICIPANTS = 20_000;

/** Limpa um nome: remove espaços extras e caracteres de controle, preserva acentos e emoji. */
export function cleanName(raw: string): string {
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME_LENGTH);
}

/**
 * Separa nomes por quebra de linha ou vírgula (os dois podem ser combinados).
 * Entradas vazias, de vírgulas seguidas ou nas pontas, são ignoradas.
 */
export function parseNameList(text: string): string[] {
  return text
    .split(/[\r\n,]+/)
    .map(cleanName)
    .filter((name) => name.length > 0);
}

/** Chave de comparação: ignora maiúsculas, acentos e espaços repetidos ("José" = "jose"). */
export function nameKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface DuplicateInfo {
  /** IDs de todas as entradas que têm ao menos uma repetição. */
  ids: Set<string>;
  /** Quantidade de entradas extras (que seriam removidas). */
  extras: number;
  /** Quantidade de nomes distintos que se repetem. */
  groups: number;
  signature: string;
}

export function findDuplicates(participants: readonly Participant[]): DuplicateInfo {
  const byKey = new Map<string, string[]>();
  for (const p of participants) {
    const key = nameKey(p.name);
    const list = byKey.get(key);
    if (list) list.push(p.id);
    else byKey.set(key, [p.id]);
  }
  const ids = new Set<string>();
  const keys: string[] = [];
  let extras = 0;
  for (const [key, list] of byKey) {
    if (list.length > 1) {
      keys.push(`${key}×${list.length}`);
      extras += list.length - 1;
      for (const id of list) ids.add(id);
    }
  }
  keys.sort();
  return { ids, extras, groups: keys.length, signature: keys.join('|') };
}

/** Mantém a primeira ocorrência de cada nome. */
export function withoutDuplicates(participants: readonly Participant[]): Participant[] {
  const seen = new Set<string>();
  return participants.filter((p) => {
    const key = nameKey(p.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

export function sortParticipants(participants: readonly Participant[], direction: 'asc' | 'desc'): Participant[] {
  const sorted = participants.slice().sort((a, b) => collator.compare(a.name, b.name));
  return direction === 'asc' ? sorted : sorted.reverse();
}

export const SAMPLE_NAMES = [
  'Ana Clara Souza',
  'Bruno Oliveira',
  'Camila Ferreira',
  'Diego Santos',
  'Eduarda Lima',
  'Felipe Rocha',
  'Gabriela Martins',
  'Heitor Almeida',
  'Isabela Costa',
  'João Pedro Ribeiro',
  'Larissa Gomes',
  'Matheus Carvalho',
];
