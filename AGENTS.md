# Guia do repositório

Regras gerais: `AGENTS.md` da pasta `Programação`. Este arquivo traz só o que é específico deste projeto.

## Estrutura
- `frontend/` — o app publicado (Next.js 16, página estática). O cálculo roda no navegador.
  - `src/lib/simulation/` — motor (`engine.ts`), limites, parser pt-BR, formatação BRL e cenário na URL.
  - `src/app/` — layout com o shell padrão, página, componentes, ícone, imagens de compartilhamento, `robots.ts` e `sitemap.ts`.
  - `e2e/` — Playwright + axe.
- `backend/` — API FastAPI de referência, sem deploy. Mesmo motor em Python, usado na paridade.
- `fixtures/simulation-golden.json` — cenários que os dois motores precisam reproduzir.
- `docs/adr/` — decisões registradas (deploy, modelo, CSP, persistência).

## Comandos
```bash
cd frontend && npm ci && npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e
cd backend && pip install -r requirements-dev.txt && ruff check . && python -m pytest
```

- `npm run test:e2e` usa o build (`npm run build` antes) e sobe `next start` na porta 3100.
- Regenerar as fixtures depois de mudar uma fórmula: `cd backend && python scripts/generate_golden.py`.
- Regenerar o monograma e os ícones (`icon.svg`, `favicon.ico`, `public/icon-512.png`): `cd frontend && node scripts/generate-brand-mark.mjs`.

## Regras do projeto
- Uma fórmula muda nos dois motores juntos (`engine.ts` e `engine.py`), com as fixtures regeneradas. O CI quebra se um lado ficar para trás.
- Os limites das entradas ficam em `frontend/src/lib/simulation/limits.ts`; os de `backend/app/simulation/schemas.py` nunca podem ser mais estritos.
- `frontend/src/app/ms-tokens.css` é cópia do arquivo canônico e não se edita; `ms-tokens.test.ts` confere o SHA-256. Estilos locais vão em `globals.css` com `var(--ms-*)`.
- Hex literal só na allowlist: `theme-color`, o estilo inline do `<html>` e os geradores de ícone e imagem OG.

## Exceções ao padrão
- Playwright roda no Edge instalado (`channel: "msedge"`) fora do CI, com um worker só; o CI usa Chromium.
- CSP no modelo sem nonces (`docs/adr/0003-content-security-policy.md`).
- "Código" no header usa o ícone `CodeXml`: o `lucide-react` 1.x não tem ícones de marca, então não há o do GitHub. É a mesma escolha do app de gestos.
- `npm audit` no CI falha só em `critical`: os achados `high` vêm de `braces@3.0.3` no Tailwind 3 e no ESLint, sem versão corrigida (README, "Dependências e auditoria").
- Vercel: Root Directory `frontend`, preset Next.js, Node 24.x, sem variáveis de ambiente.
