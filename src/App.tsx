import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ThemeProvider } from 'next-themes';
import { Hash, ShieldCheck, Users } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AppProvider, useApp } from '@/state/AppState';
import type { Mode } from '@/types';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HistorySheet } from '@/components/HistorySheet';
import { NamesConfig } from '@/components/names/NamesConfig';
import { NumbersConfig } from '@/components/numbers/NumbersConfig';
import { Stage } from '@/components/stage/Stage';
import { Splash } from '@/components/Splash';
import { PrivacyPage } from '@/components/legal/PrivacyPage';
import { TermsPage } from '@/components/legal/TermsPage';
import { useRoute } from '@/hooks/useRoute';
import logo from '@/assets/brand/logo-sorteiae.png';
import logoDark from '@/assets/brand/logo-sorteiae-dark.png';

/** Ordem de entrada de cada bloco logo após a abertura. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;

type Intro = 'playing' | 'entering' | 'off';

function Header() {
  return (
    <header style={order(0)} className="intro-item mx-auto flex h-14 w-full sm:h-16 max-w-2xl items-center justify-between px-4 sm:px-6">
      <a href="#/" className="flex items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label="Sorteiaê, página inicial">
        <img src={logo} alt="" width={568} height={120} className="h-6 w-auto select-none dark:hidden sm:h-7" draggable={false} />
        <img src={logoDark} alt="" width={568} height={120} className="hidden h-6 w-auto select-none dark:block sm:h-7" draggable={false} />
      </a>
      <nav className="flex items-center gap-1" aria-label="Ferramentas">
        <HistorySheet />
        <ThemeToggle />
      </nav>
    </header>
  );
}

function Workspace() {
  const { state, dispatch } = useApp();
  // A transição entre modalidades só roda em trocas, não no primeiro carregamento.
  const initialMode = useRef(state.mode);
  const switched = useRef(false);
  useEffect(() => {
    if (state.mode !== initialMode.current) switched.current = true;
  }, [state.mode]);
  const animate = switched.current || state.mode !== initialMode.current;

  return (
    <main className="mx-auto w-full max-w-2xl px-3 pb-10 min-[380px]:px-4 sm:px-6 sm:pb-16">
      <div style={order(1)} className="intro-item pt-5 pb-6 text-center sm:pt-14 sm:pb-10">
        <h1 className="text-[1.75rem] leading-[1.05] min-[380px]:text-[2rem] font-semibold tracking-[-0.045em] sm:text-5xl">Sorteie em segundos.</h1>
        <p className="mx-auto mt-2 max-w-[32ch] text-[0.9375rem] text-muted-foreground sm:mt-3 sm:text-lg">Nomes ou números, com resultado justo e sem cadastro.</p>
      </div>

      <Tabs value={state.mode} onValueChange={(v) => dispatch({ type: 'setMode', mode: v as Mode })} style={order(2)} className="intro-item mb-4 items-center sm:mb-5">
        <TabsList className="h-11! w-full max-w-xs rounded-full p-1">
          <TabsTrigger value="names" disabled={state.pending !== null && state.mode !== 'names'} className="h-full gap-2 rounded-full text-sm">
            <Users />
            Nomes
          </TabsTrigger>
          <TabsTrigger value="numbers" disabled={state.pending !== null && state.mode !== 'numbers'} className="h-full gap-2 rounded-full text-sm">
            <Hash />
            Números
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div style={order(3)} className="intro-item rounded-3xl border bg-card sm:rounded-[1.75rem] shadow-[0_1px_2px_rgb(0_0_0/0.03),0_12px_32px_-16px_rgb(0_0_0/0.12)] dark:shadow-none">
        <div key={state.mode} className={animate ? 'p-2.5 animate-rise sm:p-4' : 'p-2.5 sm:p-4'}>
          {state.mode === 'names' ? <NamesConfig /> : <NumbersConfig />}
        </div>
        <Stage />
      </div>

      <footer style={order(4)} className="intro-item mt-6 grid justify-items-center gap-1 sm:mt-10">
        <Fairness />
        <nav aria-label="Informações legais" className="flex items-center gap-1 text-[0.8125rem] text-muted-foreground">
          <a href="#/privacidade" className="rounded-full px-3 py-2 transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
            Privacidade
          </a>
          <span aria-hidden className="size-1 rounded-full bg-border" />
          <a href="#/termos" className="rounded-full px-3 py-2 transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
            Termos de uso
          </a>
          <span aria-hidden className="size-1 rounded-full bg-border" />
          <span className="px-3 py-2 tabular-nums" title="Versão do Sorteiaê">
            v{__APP_VERSION__}
          </span>
        </nav>
      </footer>
    </main>
  );
}

function Fairness() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ShieldCheck className="size-4" />
          Como garantimos um sorteio justo
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sorteio justo, de verdade</DialogTitle>
          <DialogDescription>O que acontece quando você clica em Sortear.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 text-sm leading-relaxed text-foreground/80">
          <p>Os resultados vêm do gerador criptográfico do navegador (Web Crypto). Não há semente fixa nem sequência programada.</p>
          <p>Cada participante ou número tem exatamente a mesma chance. Valores que causariam distorção estatística são descartados e sorteados de novo, e a ordem da lista não favorece ninguém.</p>
          <p>O resultado é decidido no clique. A animação só revela o que já foi sorteado: mudar de aba, pular a animação ou recarregar a página não altera nada.</p>
          <p>Tudo acontece no seu aparelho. Nenhum nome ou resultado é enviado para servidores.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Opening() {
  const route = useRoute();
  // Abertura só ao entrar pela página inicial, e nunca para quem pede movimento reduzido.
  const [intro, setIntro] = useState<Intro>(() =>
    route !== 'home' || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'playing',
  );
  const [splash, setSplash] = useState(intro === 'playing');

  useEffect(() => {
    if (intro !== 'entering') return;
    const t = window.setTimeout(() => setIntro('off'), 1200);
    return () => window.clearTimeout(t);
  }, [intro]);

  return (
    <div data-intro={intro}>
      <Header />
      {route === 'privacidade' ? <PrivacyPage /> : route === 'termos' ? <TermsPage /> : <Workspace />}
      {splash && <Splash onReveal={() => setIntro('entering')} onDone={() => setSplash(false)} />}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider attribute="class" storageKey="sorteiae:tema" defaultTheme="system" enableSystem>
      <TooltipProvider delayDuration={300}>
        <AppProvider>
          <Opening />
        </AppProvider>
        <Toaster position="bottom-center" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
