import { useEffect, useRef, useState } from 'react';
import word from '@/assets/brand/logo-sorteia.png';
import wordDark from '@/assets/brand/logo-sorteia-dark.png';
import letterE from '@/assets/brand/logo-e.png';

/** Quando a abertura começa a sair (ms) e quanto dura a saída. Puramente visual. */
const HOLD = 1300;
const EXIT = 450;

interface Props {
  /** Chamado quando a abertura começa a sair: a página entra por baixo dela. */
  onReveal: () => void;
  /** Chamado quando a abertura terminou e pode ser removida. */
  onDone: () => void;
}

/**
 * Abertura do site: "Sorteia" surge da esquerda para a direita e o "ê" cai no lugar.
 * Qualquer clique ou tecla pula. Não aparece com movimento reduzido (ver App).
 */
export function Splash({ onReveal, onDone }: Props) {
  const [leaving, setLeaving] = useState(false);
  const left = useRef(false);

  useEffect(() => {
    const timers: number[] = [];
    const leave = (delay: number) => {
      if (left.current) return;
      left.current = true;
      setLeaving(true);
      onReveal();
      timers.push(window.setTimeout(onDone, delay));
    };
    timers.push(window.setTimeout(() => leave(EXIT), HOLD));
    const skip = () => leave(250);
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="splash" data-leaving={leaving || undefined} aria-hidden>
      <div className="splash__logo">
        <img src={word} alt="" width={482} height={120} className="splash__word dark:hidden" draggable={false} />
        <img src={wordDark} alt="" width={482} height={120} className="splash__word hidden dark:block" draggable={false} />
        <span className="splash__e">
          <span className="splash__glow" />
          <img src={letterE} alt="" width={86} height={120} draggable={false} />
        </span>
      </div>
    </div>
  );
}
