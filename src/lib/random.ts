/**
 * Fonte de aleatoriedade do Sorteiaê.
 *
 * Regras (ver CLAUDE.md):
 * - Toda aleatoriedade vem de `crypto.getRandomValues` (Web Crypto). Nunca `Math.random()`.
 * - Inteiros num intervalo usam amostragem por rejeição: valores que causariam viés de
 *   módulo são descartados e sorteados de novo.
 * - Embaralhamento usa Fisher–Yates alimentado por esta fonte.
 *
 * Nada aqui conhece a interface. Este módulo pode ser auditado sozinho.
 */

const TWO_32 = 0x1_0000_0000; // 2^32
const TWO_53 = 2 ** 53;

// Buffer reaproveitado para reduzir chamadas à Web Crypto. Cada valor é usado uma única vez.
const pool = new Uint32Array(256);
let poolIndex = pool.length;

function nextUint32(): number {
  if (poolIndex >= pool.length) {
    crypto.getRandomValues(pool);
    poolIndex = 0;
  }
  return pool[poolIndex++];
}

/**
 * Inteiro uniforme em [0, n). Suporta n até 2^53.
 *
 * Por rejeição: só aceitamos valores abaixo do maior múltiplo de n que cabe no espaço
 * sorteado. Assim cada resto (0..n-1) tem exatamente a mesma quantidade de origens,
 * e `x % n` passa a ser imparcial.
 */
export function randomBelow(n: number): number {
  if (!Number.isInteger(n) || n < 1 || n > TWO_53) {
    throw new RangeError(`Limite inválido para sorteio: ${n}`);
  }
  if (n === 1) return 0;

  if (n <= TWO_32) {
    const limit = TWO_32 - (TWO_32 % n);
    let x: number;
    do {
      x = nextUint32();
    } while (x >= limit);
    return x % n;
  }

  // Intervalos maiores que 2^32: compõe 53 bits (21 altos + 32 baixos), exatos em double.
  const limit = TWO_53 - (TWO_53 % n);
  let x: number;
  do {
    x = (nextUint32() & 0x1f_ffff) * TWO_32 + nextUint32();
  } while (x >= limit);
  return x % n;
}

/** Inteiro uniforme em [min, max], ambos inclusivos. */
export function randomInt(min: number, max: number): number {
  return min + randomBelow(max - min + 1);
}

/** Fisher–Yates in-place. Cada permutação tem a mesma probabilidade. */
export function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomBelow(i + 1);
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  return items;
}

/** Cópia embaralhada; não altera o original. */
export function shuffled<T>(items: readonly T[]): T[] {
  return shuffleInPlace(items.slice());
}

/**
 * `k` índices distintos de [0, n), em ordem aleatória.
 *
 * Algoritmo de Floyd: faz exatamente `k` sorteios, sem percorrer nem alocar o intervalo
 * inteiro — funciona para n enorme (ex.: 1 a 1 trilhão). O conjunto resultante é uniforme;
 * em seguida, Fisher–Yates torna a ordem também uniforme (1º, 2º, 3º sorteado…).
 */
export function sampleDistinctIndices(n: number, k: number): number[] {
  if (k < 0 || k > n) throw new RangeError('Quantidade maior que o disponível.');
  const chosen = new Set<number>();
  const out: number[] = [];
  for (let j = n - k; j < n; j++) {
    const t = randomBelow(j + 1);
    const pick = chosen.has(t) ? j : t;
    chosen.add(pick);
    out.push(pick);
  }
  return shuffleInPlace(out);
}

/** Identificador curto e único (não depende de contexto seguro, ao contrário de randomUUID). */
export function randomId(): string {
  const a = nextUint32().toString(36);
  const b = nextUint32().toString(36);
  return `${a}${b}`;
}
