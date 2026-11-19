import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type Dispatch, type ReactNode } from 'react';
import type { AppState } from '../types';
import { createNamesDraw, createNumbersDraw } from '../lib/draw';
import { eligibleParticipants, namesReadiness, validateNumbers } from '../lib/validation';
import { notify as toast } from '../lib/notify';
import { reducer, type Action } from './reducer';
import { loadState, saveState } from './storage';

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  /** Decide o resultado e inicia a animação. Retorna false se não for possível sortear. */
  startDraw: () => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp fora do AppProvider');
  return ctx;
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(loadState);
  const [state, dispatch] = useReducer(reducer, loaded.state);
  const warnedSave = useRef(loaded.notice !== null);
  // Espelho síncrono do estado: impede dois sorteios com cliques muito rápidos.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (loaded.notice) toast(loaded.notice, 'error');
  }, [loaded.notice]);

  useEffect(() => {
    if (!saveState(state) && !warnedSave.current) {
      warnedSave.current = true;
      toast('Não foi possível salvar no navegador. Seus dados valem só até fechar ou recarregar a página.', 'error');
    }
  }, [state]);

  const startDraw = useCallback((): boolean => {
    const s = stateRef.current;
    if (s.pending) return false;
    const reduced = prefersReducedMotion();

    if (s.mode === 'names') {
      const ready = namesReadiness(s);
      if (!ready.ok) {
        toast(ready.message, 'error');
        return false;
      }
      const draw = createNamesDraw(eligibleParticipants(s), s.names.winners, {
        reduced,
        round: s.namesRound.round,
        replacement: !s.names.removeWinners,
      });
      stateRef.current = { ...s, pending: draw };
      dispatch({ type: 'startDraw', draw });
      return true;
    }

    const { plan, errors } = validateNumbers(s.numbers, s.numbersRound.drawn);
    if (!plan) {
      toast(errors.min ?? errors.max ?? errors.count ?? 'Revise a configuração.', 'error');
      return false;
    }
    const draw = createNumbersDraw(plan, { reduced, round: s.numbersRound.round });
    stateRef.current = { ...s, pending: draw };
    dispatch({ type: 'startDraw', draw });
    return true;
  }, []);

  const value = useMemo(() => ({ state, dispatch, startDraw }), [state, startDraw]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
