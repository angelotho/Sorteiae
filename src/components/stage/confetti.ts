import { randomBelow } from '@/lib/random';

const COLORS = ['#2A30E6', '#5A60F0', '#8194FF', '#C3CBFF', '#F59E0B', '#FBBF24', '#18181B'];
const DURATION = 2100;

// Aleatoriedade decorativa, mas da mesma fonte segura: nenhum Math.random no projeto.
const rand = (min: number, max: number) => min + (randomBelow(1_000_000) / 1_000_000) * (max - min);

/** Explosão curta de confete a partir de um ponto. Um único canvas, removido ao final. */
export function fireConfetti(originX: number, originY: number) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'confetti-canvas';
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  document.body.appendChild(canvas);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const resize = () => {
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const pieces = Array.from({ length: window.innerWidth < 640 ? 60 : 100 }, () => {
    const angle = rand(-Math.PI * 0.88, -Math.PI * 0.12);
    const speed = rand(6, 14);
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.22, 0.22),
      w: rand(5, 9),
      h: rand(3, 5),
      color: COLORS[randomBelow(COLORS.length)],
    };
  });

  let start = 0;
  let last = 0;
  const frame = (t: number) => {
    if (!start) start = last = t;
    const dt = Math.min(3, (t - last) / 16.67);
    last = t;
    const life = t - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalAlpha = life > DURATION - 600 ? Math.max(0, (DURATION - life) / 600) : 1;
    for (const p of pieces) {
      p.vx *= 0.985 ** dt;
      p.vy = p.vy * 0.985 ** dt + 0.32 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.rot * 2));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (life < DURATION) requestAnimationFrame(frame);
    else {
      window.removeEventListener('resize', resize);
      canvas.remove();
    }
  };
  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);
}
