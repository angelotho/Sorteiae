import { useEffect, useState } from 'react';
import { routeFromHash, type Route } from '@/lib/legal';

/** Rotas por hash (#/privacidade, #/termos): funcionam em qualquer hospedagem estática. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => routeFromHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(routeFromHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
