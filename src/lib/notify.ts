import { toast } from 'sonner';

export type Tone = 'info' | 'success' | 'error';

/** Usa a própria mensagem como id: o mesmo aviso nunca aparece duplicado. */
export function notify(message: string, tone: Tone = 'info') {
  if (tone === 'error') toast.error(message, { id: message, duration: 6000 });
  else if (tone === 'success') toast.success(message, { id: message });
  else toast(message, { id: message });
}
