# Sorteiaê

Aplicação web brasileira de sorteios online — sorteio por **nomes** e por **números**. Foco em design extremamente bonito, responsividade total e excelente experiência do usuário, com um mecanismo de sorteio verdadeiramente aleatório e tecnicamente confiável.

> **Status:** v1.0.0 — primeira versão publicada (nomes, números, rodadas, histórico, persistência local, tema claro/escuro).

## Idioma

- Interface, textos, mensagens e documentação em **português do Brasil**.
- Formatos brasileiros (números com `.` de milhar e `,` decimal, datas `dd/mm/aaaa`).

## Stack

- Framework: **Vite + React 19 + TypeScript** (SPA estática; `npm run dev` / `npm run build` → `dist/`).
- Estilização: **Tailwind CSS v4** (`@tailwindcss/vite`), tokens em `src/index.css` (inclui a cor `brand`).
- Componentes de UI: **shadcn/ui** (preset `radix-nova`, Radix UI) em `src/components/ui` — adicionar novos com `npx shadcn@latest add <nome>` ou pelo MCP `shadcn-ui`. Atenção: o CLI gerou `import { cn } from "cn"`; o correto é `@/lib/utils` (o pacote npm `cn` foi removido). Toasts: **sonner**. Tema: **next-themes** (classe `.dark`). Ícones: **lucide-react**. Fonte: **@fontsource-variable/geist**.
- Animação: CSS + `requestAnimationFrame` guiado por timestamp. Sem biblioteca de motion.
- Persistência / backend: **somente `localStorage`** (chave `sorteiae:estado:v1`; tema em `sorteiae:tema`). Sem backend.
- Alias de import: `@/` → `src/`.
- Hospedagem: qualquer hospedagem estática (`base: './'` no Vite).

Não instale bibliotecas que não estejam listadas aqui ou que não tenham sido aprovadas pelo usuário. Antes de propor uma, use a skill `pick-ui-library`.

## Arquitetura

- `src/lib/random.ts` — única fonte de aleatoriedade (Web Crypto, rejeição, Fisher–Yates, algoritmo de Floyd). Auditável sozinho.
- `src/lib/draw.ts` — decide o resultado e só depois monta o roteiro visual (segmentos e carrosséis decorativos).
- `src/lib/validation.ts`, `names.ts`, `format.ts` — regras puras (validação, duplicados, formatação pt-BR).
- `src/state/` — reducer único (`reducer.ts`), persistência validada campo a campo (`storage.ts`), contexto (`AppState.tsx`).
- `src/hooks/useDrawClock.ts` — relógio do sorteio por `Date.now()` + Page Visibility; a conclusão nunca depende de quadros renderizados.
- `src/components/` — interface: `names/` (campo + lista em Sheet), `numbers/` (frase com campos), `stage/` (palco, carrossel, resultado), `HistorySheet`, `Splash` (abertura), `legal/` (Privacidade e Termos), `ui/` (shadcn).
- Rotas por hash (`src/hooks/useRoute.ts`): `#/` início, `#/privacidade`, `#/termos`. Sem biblioteca de rotas.
- `src/lib/legal.ts` — data das políticas. O Sorteiaê **não tem canal de contato** (decisão do usuário), e as políticas não citam contato. Se o app passar a enviar dados a servidores, usar cookies ou analytics, as políticas precisam ser revistas.

Regras de produto já decididas:

- Nomes: vários vencedores no mesmo sorteio são sempre distintos; "Não repetir quem já saiu" (sem reposição) exclui vencedores até a próxima rodada.
- Números: "Permitir repetição" vale dentro do sorteio e entre sorteios da rodada. Limites: ±1 trilhão, até 1.000 números por sorteio.
- Alterar intervalo ou regra de repetição inicia nova rodada automaticamente.
- Lista: até 20.000 participantes, 120 caracteres por nome; duplicados comparados sem diferenciar maiúsculas e acentos.
- Histórico: últimos 200 sorteios.

Princípios gerais:

- Arquitetura **simples e organizada**, proporcional ao tamanho do projeto. Evite camadas, abstrações e dependências sem necessidade concreta.
- A **lógica de sorteio fica isolada** da interface (módulo próprio, sem dependência de componentes), para poder ser revisada e auditada sozinha.
- Componentes pequenos, nomes claros, sem código morto.

## Mecanismo de sorteio (requisito central)

O sorteio precisa ser **verdadeiramente aleatório e tecnicamente confiável**. Regras obrigatórias:

- Use um gerador **criptograficamente seguro** (`crypto.getRandomValues` na Web Crypto API, ou equivalente no ambiente). **Nunca** use `Math.random()` para sortear.
- Para gerar um inteiro num intervalo, use **amostragem por rejeição** — nunca `valor % n`, que introduz viés de módulo.
- Para embaralhar ou sortear vários itens sem repetição, use **Fisher–Yates** alimentado pelo gerador seguro.
- Toda entrada de participante (nome ou número) deve ter **exatamente a mesma probabilidade**, salvo regra explícita configurada pelo usuário.
- Animações de suspense são apenas visuais: o resultado é decidido pelo gerador seguro e **a animação nunca pode alterar ou influenciar o resultado**.
- Validar as entradas antes de sortear (lista vazia, intervalo inválido, quantidade a sortear maior que o disponível, duplicados conforme a regra escolhida) com mensagens claras ao usuário.

## Design e experiência do usuário

- O visual é prioridade: cada tela deve ter identidade própria e acabamento cuidadoso — nada com cara de template genérico.
- **Mobile-first e totalmente responsivo** (celular, tablet, desktop). Nenhuma rolagem horizontal indesejada.
- Acessibilidade: contraste adequado, foco visível, navegação por teclado, `prefers-reduced-motion` respeitado nas animações do sorteio.
- Estados sempre tratados: vazio, carregando, erro, sucesso.
- A identidade visual oficial está em `DESIGN.md` e deve ser seguida em todas as telas.

## Testes

- **Não crie nem execute testes automatizados** (unitários, integração, E2E) e não instale bibliotecas de teste. O usuário faz todos os testes manualmente.
- Ao concluir uma entrega, descreva de forma objetiva **o que testar manualmente** (passos e resultado esperado).
- Na skill `product-owner`, a seção "Casos de Teste Sugeridos" deve trazer **roteiros de teste manual**.

## Skills do projeto

Antes de começar uma tarefa, verifique se alguma skill abaixo se aplica. Se sim, **leia o `SKILL.md` correspondente e siga as instruções dele**, mesmo que o usuário não peça a skill pelo nome.

| Skill                           | Arquivo                                               | Quando usar                                                                                                                                                                      |
| ------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **commit-expert**               | `.claude/skills/commit-expert/SKILL.md`               | Usuário pede para commitar, "subir código" ou gerar versão. Sobe a versão no `package.json` e entrega os comandos git no chat (não executa).                                     |
| **product-owner**               | `.claude/skills/product-owner/SKILL.md`               | Pedido de análise de regra de negócio, nova funcionalidade a especificar ou estudo de impacto. Gera especificação `.md` em `docs/PO/result/` e **para** — não implementa código. |
| **frontend-design**             | `.claude/skills/frontend-design/SKILL.md`             | Criar tela nova ou redesenhar uma existente: direção visual, tipografia, layout com identidade própria.                                                                          |
| **make-interfaces-feel-better** | `.claude/skills/make-interfaces-feel-better/SKILL.md` | Acabamento de UI: animações (incluindo a animação do sorteio), hover, sombras, bordas, ícones, números tabulares, microinterações, "a tela parece estranha".                     |
| **web-design-guidelines**       | `.claude/skills/web-design-guidelines/SKILL.md`       | Revisar/auditar UI: acessibilidade, UX, boas práticas de interface.                                                                                                              |
| **search-ux**                   | `.claude/skills/search-ux/SKILL.md`                   | Busca e filtros em listas (ex.: localizar participantes numa lista grande de nomes): campo de busca, filtros, estado "sem resultados".                                           |
| **design-consultation**         | `.claude/skills/design-consultation/SKILL.md`         | Criar ou formalizar o design system / identidade visual do projeto (marca, tipografia, cores, espaçamento, motion). Pesquisa referências, gera preview HTML e escreve `DESIGN.md`. |
| **break-ui**                    | `.claude/skills/break-ui/SKILL.md`                    | Testar tela com dados extremos: nomes longos, listas vazias ou enormes, intervalos numéricos gigantes, emoji, estados de erro e carregamento.                                     |
| **learn-taste**                 | `.claude/skills/learn-taste/SKILL.md`                 | Ao fim de uma sessão com correções de design do usuário: transformar as preferências em regras no `DESIGN.md`.                                                                   |
| **pick-ui-library**             | `.claude/skills/pick-ui-library/SKILL.md`             | Antes de construir componente complexo (modal, toast, drawer, animação de números etc.): escolher biblioteca consolidada em vez de fazer na mão.                                  |

### Combinações comuns

- Identidade visual (primeiro passo de design) → `design-consultation` (gera `DESIGN.md`), depois `frontend-design` para aplicar nas telas
- Tela nova → `frontend-design` + `make-interfaces-feel-better`
- Tela de sorteio / revelação do resultado → `frontend-design` + `make-interfaces-feel-better` (motion) + `break-ui` (listas e intervalos extremos)
- Lista de participantes com busca → `search-ux` + `make-interfaces-feel-better`
- Revisão de tela pronta → `web-design-guidelines`
- Funcionalidade grande → `product-owner` primeiro (especificar), implementar só após aprovação do usuário

## Instalação de skills

Toda skill que for pedida para ser instalada deve ser adicionada **SOMENTE** em `.claude/skills/<nome>/`. Nunca crie nem use a pasta `.agents/` — ela não deve existir no projeto. Se um instalador (ex.: `npx skills add`) colocar a skill em outro lugar, mova para `.claude/skills/` e remova a pasta criada.

Após instalar uma skill, **sempre** adicione uma linha para ela na tabela "Skills do projeto" acima (nome, caminho `.claude/skills/<nome>/SKILL.md` e quando usar, com base na `description` do `SKILL.md`). Se fizer sentido, inclua-a também em "Combinações comuns". Ao remover uma skill, remova a linha correspondente.

## MCPs do projeto

Configurados em `.mcp.json`:

| Servidor      | Uso                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| **shadcn-ui** | Consultar componentes, blocos e exemplos do shadcn/ui (React). Só use se a stack adotar shadcn/ui.    |
| **supabase**  | Docs e gestão de projetos Supabase. **Sem projeto vinculado** — o Sorteiaê ainda não tem backend definido. |

- **Nunca** execute operações no Supabase (SQL, migrations, deploy de functions) sem pedido explícito do usuário. A conta pode conter projetos de outros sistemas; confirme sempre qual projeto será afetado.
- Se o Sorteiaê passar a usar Supabase, adicione `project_ref=<id>` na URL do servidor em `.mcp.json` para restringir o acesso ao projeto correto.
- Credenciais e tokens nunca vão para arquivos versionados — use `.env.local` (ignorado pelo git).

## Documentação

- Especificações do PO: `docs/PO/result/`.
- Identidade visual: `DESIGN.md`.
- Mantenha este `CLAUDE.md` atualizado sempre que uma decisão de stack, arquitetura ou regra de produto for tomada.

## Design System

Read DESIGN.md before visual or UI work: it defines the fonts, colors, spacing, and
aesthetic direction. Ask the user before departing from it. When reviewing UI, flag
code that doesn't match DESIGN.md.

## Versionamento

Após `X.Y.9` vem `X.(Y+1).0` — nunca `X.Y.10`.
