/** Data exibida nas páginas legais. Atualize sempre que mudar o texto delas. */
export const LEGAL = {
  updatedAt: '19/11/2026',
};

export type Route = 'home' | 'privacidade' | 'termos';

export function routeFromHash(hash: string): Route {
  if (hash.startsWith('#/privacidade')) return 'privacidade';
  if (hash.startsWith('#/termos')) return 'termos';
  return 'home';
}

/** Chaves que o Sorteiaê grava no navegador. */
export const STORAGE_KEYS = ['sorteiae:estado:v1', 'sorteiae:tema'];
