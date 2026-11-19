import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LEGAL } from '@/lib/legal';

interface Props {
  title: string;
  intro: string;
  sections: { id: string; title: string; body: ReactNode }[];
}

/** Página de texto longo: índice no topo, seções numeradas (é uma sequência de cláusulas) e leitura confortável. */
export function LegalLayout({ title, intro, sections }: Props) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 sm:px-6">
      <Button asChild variant="ghost" className="-ml-3 mt-2 h-9 gap-1.5 rounded-full px-3 text-muted-foreground hover:text-foreground">
        <a href="#/">
          <ArrowLeft />
          Voltar ao sorteio
        </a>
      </Button>

      <header className="pt-6 pb-8 sm:pt-10">
        <h1 className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.04em] sm:text-[2.5rem]">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: {LEGAL.updatedAt}</p>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-foreground/80">{intro}</p>
      </header>

      <nav aria-label="Nesta página" className="mb-10 rounded-2xl bg-muted/50 p-4 sm:p-5">
        <p className="mb-2 text-sm font-medium">Nesta página</p>
        <ol className="grid gap-1 text-sm sm:grid-cols-2 sm:gap-x-6">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  // Mantém a rota por hash: rola até a seção sem trocar o endereço.
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex gap-2 rounded-md py-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="w-5 shrink-0 text-right tabular-nums">{i + 1}.</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-10">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-6" aria-labelledby={`${s.id}-titulo`}>
            <h2 id={`${s.id}-titulo`} className="mb-3 flex gap-2 text-lg font-semibold tracking-tight">
              <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
              {s.title}
            </h2>
            <div className="legal-prose">{s.body}</div>
          </section>
        ))}
      </div>
    </main>
  );
}

