<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="src/assets/brand/logo-sorteiae-dark.png">
  <img src="src/assets/brand/logo-sorteiae.png" alt="Sorteiaê" height="64">
</picture>

<p><strong>Sorteios online de nomes e números, justos de verdade.</strong><br>
Sem cadastro, sem servidor, com aleatoriedade criptográfica.</p>

<p><a href="https://sorteiae.vercel.app/"><strong>Acessar o Sorteiaê →</strong></a></p>

<p>
  <a href="https://sorteiae.vercel.app/"><img alt="Site no ar" src="https://img.shields.io/badge/site-sorteiae.vercel.app-000000?logo=vercel&logoColor=white"></a>
  <img alt="Versão" src="https://img.shields.io/badge/vers%C3%A3o-1.0.1-2A30E6">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white">
</p>

</div>

---

## Sobre

> 🔗 **Em produção:** [sorteiae.vercel.app](https://sorteiae.vercel.app/)

O **Sorteiaê** é uma aplicação web brasileira para sortear nomes ou números em segundos. Tudo roda no navegador: os participantes, os resultados e o histórico nunca saem do aparelho de quem usa.

O foco do projeto é ter um **mecanismo de sorteio tecnicamente confiável**, isolado da interface e fácil de auditar, com uma experiência minimalista, responsiva e agradável no celular e no computador.

## Funcionalidades

**Sorteio de nomes**
- Adicione um nome por vez ou cole uma lista inteira (um por linha).
- Edite, remova, busque, embaralhe e ordene de A a Z ou de Z a A.
- Detecção de nomes repetidos, sem diferenciar maiúsculas e acentos, com a opção de remover ou manter.
- Vários vencedores por sorteio, sempre pessoas diferentes.
- Modo **sem reposição** (quem saiu fica de fora até a próxima rodada) ou **com reposição**.
- Depois do resultado, mantenha ou remova o sorteado da lista.

**Sorteio de números**
- Intervalos de até ±1 trilhão, sem percorrer o intervalo na memória.
- Até 1.000 números por sorteio, com ou sem repetição.
- Rodadas: sem repetição, um número não volta a sair até você iniciar uma nova rodada.
- Atalhos prontos, como 1 a 100, dado e 6 números de 1 a 60.

**Experiência**
- Animação de suspense com desaceleração progressiva e revelação com destaque.
- Funciona em segundo plano: trocar de aba ou recarregar a página não altera nem reinicia o sorteio.
- Histórico com ordem, data, horário, modalidade e rodada.
- Tudo salvo localmente: nada se perde ao recarregar a página.
- Tema claro e escuro, abertura animada e respeito a `prefers-reduced-motion`.
- Páginas de Política de Privacidade e Termos de Uso.

## Como o sorteio garante resultados justos

A lógica de sorteio fica em [`src/lib/random.ts`](src/lib/random.ts) e [`src/lib/draw.ts`](src/lib/draw.ts), sem nenhuma dependência da interface.

| Garantia | Como é feita |
| --- | --- |
| Fonte de aleatoriedade segura | `crypto.getRandomValues` (Web Crypto API). `Math.random()` não é usado em nenhum ponto do projeto. |
| Sem viés de módulo | Inteiros num intervalo são gerados por **amostragem por rejeição**, com suporte a intervalos de até 2⁵³. |
| Embaralhamento uniforme | **Fisher–Yates** alimentado pelo gerador seguro. |
| Vários resultados sem repetição | **Algoritmo de Floyd**: exatamente *k* sorteios, sem alocar o intervalo inteiro, seguido de Fisher–Yates para que a ordem também seja uniforme. |
| Animação não interfere | O resultado é decidido no clique. A animação só lê um roteiro visual montado depois da decisão. |
| Resistente a abas em segundo plano | O tempo é medido por timestamp (`Date.now()`) com a Page Visibility API. A conclusão não depende de quadros renderizados. |

## Tecnologias

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) (modo estrito)
- [Vite](https://vite.dev) para desenvolvimento e build
- [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix UI)
- [Sonner](https://sonner.emilkowal.ski) para avisos, [next-themes](https://github.com/pacocoursey/next-themes) para o tema e [Lucide](https://lucide.dev) para os ícones
- Fonte [Geist](https://vercel.com/font), hospedada junto com o site

Não há backend nem banco de dados: a persistência usa apenas o `localStorage` do navegador.

## Como rodar

**Pré-requisito:** [Node.js](https://nodejs.org) 20.19 ou superior.

```bash
git clone https://github.com/angelotho/sorteiae.git
cd sorteiae
npm install
npm run dev
```

Acesse `http://localhost:5173`. Para testar no celular na mesma rede, rode `npm run dev -- --host` e abra o endereço de rede exibido no terminal.

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Verifica os tipos e gera a versão de produção em `dist/` |
| `npm run preview` | Serve localmente a versão de produção |

## Publicação

A versão oficial está hospedada na [Vercel](https://vercel.com) em **[sorteiae.vercel.app](https://sorteiae.vercel.app/)**, com publicação automática a cada push na branch `main`.

O build gera um site 100% estático em `dist/`, com caminhos relativos, e pode ser publicado em qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages, GitHub Pages etc.). As páginas internas usam rotas por hash (`#/privacidade`, `#/termos`), então não é preciso configurar redirecionamentos no servidor.

## Estrutura do projeto

```text
src/
├── lib/            # Regras puras: aleatoriedade, sorteio, validação, formatação pt-BR
├── state/          # Estado global (reducer), persistência validada e contexto
├── hooks/          # Relógio do sorteio, rotas por hash, media queries
├── components/
│   ├── names/      # Entrada de nomes e lista de participantes
│   ├── numbers/    # Configuração do sorteio de números
│   ├── stage/      # Palco: animação, revelação e ações do resultado
│   ├── legal/      # Política de Privacidade e Termos de Uso
│   └── ui/         # Componentes base (shadcn/ui)
└── assets/brand/   # Logo oficial e variações
```

A identidade visual (cores, tipografia, movimento e uso da logo) está documentada em [`DESIGN.md`](DESIGN.md).

## Privacidade

O Sorteiaê não pede cadastro, não usa cookies, analytics nem rastreadores, e não envia o que você digita para nenhum servidor. Os dados ficam só no navegador e podem ser apagados a qualquer momento pela própria aplicação.

---

<div align="center">
<sub>Feito no Brasil 🇧🇷</sub>
</div>
