import { useApp } from '@/state/AppState';
import { notify } from '@/lib/notify';
import { MAX_PARTICIPANTS } from '@/lib/names';
import { formatNumber } from '@/lib/format';

/** Adiciona nomes já limpos respeitando o limite da lista. Retorna `false` se nada coube. */
export function useAddNames() {
  const { state, dispatch } = useApp();
  return (names: string[]): boolean => {
    const room = MAX_PARTICIPANTS - state.participants.length;
    if (room <= 0) {
      notify(`A lista já tem o máximo de ${formatNumber(MAX_PARTICIPANTS)} participantes.`, 'error');
      return false;
    }
    dispatch({ type: 'addNames', names });
    if (names.length > room) notify(`Só ${formatNumber(room)} nomes couberam: o limite é ${formatNumber(MAX_PARTICIPANTS)}.`, 'error');
    else if (names.length > 1) notify(`${formatNumber(names.length)} participantes adicionados.`, 'success');
    return true;
  };
}
