---
# design-md-format=spec
name: Sorteiaê
description: Minimalista claro — branco, neutros e um único anil de destaque; poucos elementos por tela e o sorteio como protagonista.
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  primary: "oklch(0.205 0 0)"
  brand: "#2A30E6"
  brand-dark: "#8194FF"
  destructive: "oklch(0.577 0.245 27.325)"
  warning: "amber-500 / 10% (fundo), amber-900 (texto)"
typography:
  display:
    fontFamily: Geist Variable
    fontWeight: 600
    letterSpacing: -0.045em
  body:
    fontFamily: Geist Variable
    fontSize: 1rem
    lineHeight: 1.5
  numbers:
    fontFamily: Geist Variable
    fontFeature: tnum
rounded:
  base: 0.75rem
  input: 1rem
  card: 1.75rem
  full: 9999px
components:
  base: shadcn/ui (preset radix-nova) em src/components/ui
---

# Sorteiaê

## Overview
**Direção:** minimalista claro, no espírito de Linear, Vercel e Apple. Escolhida pelo usuário em 19/11/2026, depois de rejeitar a primeira versão (palco noturno com lâmpadas) por ser visualmente carregada.
**Princípio central:** o mínimo de poluição visual. Na tela principal ficam só a entrada de dados, uma linha de resumo e o palco. O resto fica em popovers, painéis laterais (Sheet) e menus.

## Logo
- Oficial: logotipo "Sorteiaê" em preto com o "ê" em azul `#2A30E6` (original recortado e com fundo transparente em `src/assets/brand/logo-sorteiae-original.png`).
- Tema claro: `logo-sorteiae.png` (texto `#0A0A0A`). Tema escuro: `logo-sorteiae-dark.png` (texto `#FAFAFA`, ê no mesmo `#2A30E6`). O azul do ê é idêntico nos dois temas.
- Altura no cabeçalho: 24px no celular, 28px a partir de 640px. Nunca recolorir, distorcer ou colocar sobre fundo colorido.
- Favicon e ícone iOS: só o "ê" azul (`public/favicon.png`, `public/apple-touch-icon.png`).

## Colors
- Neutros do shadcn (base neutral) para quase tudo. Botões principais em quase-preto (`primary`).
- **Um único destaque, `brand` (o azul do ê da logo, `#2A30E6`):** marca, ponto de "sorteando", barra de progresso, rótulo e brilho do resultado, foco. Não usar em mais lugares.
- Âmbar suave apenas para avisos (duplicados, configuração impossível). Vermelho apenas para ações destrutivas.
- Tema escuro: mesmos nomes de variáveis em `.dark` (`src/index.css`).

## Typography
Uma família só: **Geist Variable**. Títulos e resultado em 600 com tracking negativo forte (-0.035em a -0.05em). Números sempre `tabular-nums`. O tamanho do nome vencedor e dos números se ajusta ao comprimento do texto.

## Layout
Coluna única centralizada, `max-w-2xl`, gutter de 16px no celular. Ordem: cabeçalho → título curto → abas Nomes/Números → um único cartão (configuração em cima, palco embaixo). Histórico e lista completa abrem em Sheet (à direita no desktop, de baixo no celular).

## Components
- shadcn/ui: Button, Tabs, Textarea, Input, Popover, Switch, Sheet, Dialog, AlertDialog, DropdownMenu, Tooltip, Sonner.
- Botões de ação do palco em formato pílula (`rounded-full`), h-12.
- Ações secundárias do resultado ficam num menu "…", nunca como fileira de botões.

## Do's and Don'ts
- Do: no máximo um botão principal e dois secundários visíveis por área.
- Do: esconder configurações em popover com valor atual no gatilho ("1 vencedor").
- Don't: cartões dentro de cartões, gradientes decorativos, bordas coloridas, ícones em todo rótulo.
- Don't: `Math.random()` em qualquer lugar.

## Motion
- Microinterações: `scale(0.96)` no clique, transições de cor de 150–200ms.
- Momento autoral único: carrossel vertical com máscara de fade que desacelera (`easeOutQuart`), resultado entra com desfoque → nitidez sobre um brilho anil difuso, confete discreto.
- Abertura (`src/components/Splash.tsx`, ~1,3s + 0,45s de saída): "Sorteia" surge da esquerda para a direita saindo do desfoque, o "ê" azul cai no lugar com leve rebote e um brilho `brand` difuso; a tela se dissolve e cabeçalho, título, abas, cartão e rodapé entram em sequência (70ms entre cada). Qualquer clique ou tecla pula.
- `prefers-reduced-motion`: sem abertura, sem carrossel nem confete; "Sorteando…" por menos de 1s.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 19/11/2026 | Primeira versão (palco noturno, Unbounded, CSS puro) | Proposta inicial com autonomia |
| 19/11/2026 | Logo oficial aplicada; `brand` alinhado ao azul da logo | Consistência entre marca e interface |
| 19/11/2026 | Redesenho minimalista claro com shadcn/ui + Tailwind | Usuário achou a primeira versão feia e poluída; escolheu esta direção |
