import { useEffect, useState } from 'react';

export interface VisibleArea {
  /** Altura realmente visível, em px (já descontado o teclado virtual). */
  height: number;
  /** Quanto da base da tela está coberto (teclado virtual), em px. */
  inset: number;
}

/**
 * Área visível da tela segundo a VisualViewport API.
 *
 * No celular, o teclado virtual cobre a página sem redimensionar o layout
 * (padrão do Chrome Android e do Safari iOS), então elementos `fixed` ancorados
 * embaixo ficam escondidos. Com este hook eles podem acompanhar a área visível.
 * Retorna `null` quando desativado, sem suporte à API ou com zoom de pinça.
 */
export function useVisualViewport(enabled: boolean): VisibleArea | null {
  const [area, setArea] = useState<VisibleArea | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!enabled || !vv) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Com zoom de pinça a área visível não representa o teclado: mantém o layout normal.
        if (vv.scale > 1.01) return setArea(null);
        const height = Math.round(vv.height);
        const inset = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
        setArea((prev) => (prev && prev.height === height && prev.inset === inset ? prev : { height, inset }));
      });
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [enabled]);

  return enabled ? area : null;
}
