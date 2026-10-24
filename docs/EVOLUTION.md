# Plano de Evolução — Simulacao-Estrategica-de-Decisao-Empresarial

> Documento vivo, revisado semanalmente. Última revisão: 2026-10-23.
> Regra central: nenhuma mudança entra sem estar ligada a um objetivo desta página e sem manter ou melhorar as métricas da seção 2.

## 1. Identidade do projeto

- **Propósito:** "Business Decision Simulator": simulador web em que quem avalia o portfólio ajusta preço, custos, equipe, juros, impostos e demanda e vê lucro, caixa, risco e projeção de 12 meses recalculados no navegador.
- **Tipo:** web app estático (Next.js, página única) + API FastAPI de referência não publicada, usada para paridade do motor.
- **Stack:**
  - frontend: Next.js 16.4.0 (App Router), React 19.2.3, TypeScript ^5 (5.9.3 instalado, strict), Tailwind CSS 3.4.19, Recharts ^3.7.0, `lucide-react` 1.55.0, clsx; testes com Vitest 4.1.11 + coverage-v8, Playwright 1.64.0 + `@axe-core/playwright` 4.13.0; ESLint 9 com `eslint-config-next` 16.4.0; Node 24.x (`engines`, `.nvmrc`);
  - backend: Python 3.12 (`.python-version`), FastAPI 0.143.0, uvicorn 0.54.0, Pydantic 2.14.1, pydantic-settings 2.15.0; dev: pytest 9.1.1, httpx2 2.13.1, ruff 0.17.0.
- **Gerenciador de pacotes:** npm (`frontend/package-lock.json`); pip com `requirements*.txt` fixados (sem lock de hashes).
- **Deploy:** Vercel, projeto `simulacao-estrategica-decisao`, Root Directory `frontend`, preset Next.js, Node 24.x, sem env vars; produção em https://simulacao-estrategica-decisao.vercel.app. Backend sem deploy (ADR 0001).
- **Estrutura:**
  - `frontend/src/lib/simulation/` — motor (`engine.ts`), limites, parser pt-BR, formatação BRL, cenário na URL;
  - `frontend/src/app/` — layout com shell padrão, página, componentes, ícones, OG, `robots`/`sitemap`;
  - `frontend/e2e/` — Playwright + axe (13 casos em `simulator.spec.ts`);
  - `backend/app/` — API de referência (`simulation/engine.py`, `schemas.py`, rotas `health` e `scenarios`);
  - `fixtures/simulation-golden.json` — 13 cenários de paridade TS × Python;
  - `docs/adr/` — ADRs 0001–0004 (deploy, modelo único de demanda, CSP, cenário na URL).
- **Comandos:** install `cd frontend && npm ci` / `cd backend && pip install -r requirements-dev.txt` · dev `npm run dev` · lint `npm run lint` / `ruff check . && ruff format --check .` · typecheck `npm run typecheck` (`next typegen && tsc --noEmit`) · test `npm test` (cobertura) / `python -m pytest` · e2e `npm run test:e2e` · build `npm run build`.

## 2. Estado atual (baseline)

| Verificação | Comando | Resultado | Data |
| --- | --- | --- | --- |
| Instalação | `npm ci` · `python3.12 -m venv .venv && pip install -r requirements-dev.txt` | PASS / PASS (aviso `EBADENGINE`: ambiente em Node 22.22.0, projeto exige 24.x) | 2026-10-23 |
| Lint | `npm run lint` · `ruff check .` · `ruff format --check .` | PASS · PASS · PASS (15 arquivos) | 2026-10-23 |
| Typecheck | `npm run typecheck` | PASS | 2026-10-23 |
| Testes | `npm test` · `python -m pytest -p no:cacheprovider` | 65 passando / 0 falhando · 44 passando / 0 falhando | 2026-10-23 |
| Cobertura | `npm test` (v8, escopo `src/lib`) | linhas 100% · statements 100% · branches 96% (`parse.ts` 91,66%) · funções 100%; backend sem cobertura configurada | 2026-10-23 |
| Testes e2e | `npm run test:e2e` | não verificado (depende do build e de navegador; download do Playwright e Edge indisponíveis no ambiente) | 2026-10-23 |
| Build | `npm run build` | não verificado: FAIL por ambiente — `next/font/google` não alcança `fonts.googleapis.com` (proxy de saída recusou a conexão) | 2026-10-23 |
| Vulnerabilidades (audit) | `npm audit --omit=dev --json` · `npm audit` · `pip-audit -r requirements.txt` | runtime: **1 critical** (`next` 16.4.0: GHSA-2464-fhr4-w9xw, GHSA-p3m5-59mp-jv5r, GHSA-673q-mjm6-r5xr; corrigido em 16.4.3) · árvore completa: 1 critical / 1 high (`zod` 4.6.5 via `eslint-plugin-react-hooks`) / 6 moderate (vitest 4.1.11, `@vitest/mocker`, `postcss-selector-parser` via Tailwind 3) · Python: 0 | 2026-10-23 |
| CI no GitHub | `gh run list` | `ci.yml` com jobs `frontend` (lint, typecheck, test, build, `audit --audit-level=critical`, e2e Chromium) e `backend` (ruff, pytest, pip-audit); últimas 4 execuções verdes, a mais recente em 2026-10-16 | 2026-10-23 |

Observações:
- O critical do `next` é posterior ao último CI verde; como o job usa `npm audit --audit-level=critical`, o próximo push ou PR falha. O `package.json` fixa `next` e `eslint-config-next` em `16.4.0` exato, então a correção exige editar o pin para `16.4.3` (patch, sem major).
- README ("Dependências e auditoria") e o guia do repositório atribuem os `high` a `braces@3.0.3`; o `npm audit` atual não lista mais o `braces` e passou a apontar `zod`. A documentação está desatualizada.
- Pendências v4 confirmadas no código: defaults com prejuízo (`frontend/src/lib/simulation/limits.ts:18-27`: preço 120, custo variável 45, demanda 1.200, churn 0,04), `@types/node` `^20` com runtime 24, Tailwind 3. Os itens do Bloco B (WebSocket, JWT demo, métricas fabricadas, tokens, headers, CI) já estão resolvidos e não entram como pendentes.
- Produção não verificada neste ambiente (saída de rede restrita).

## 3. Histórico e trajetória

- **Fase 1 — scaffold (2026-01-30, 3 commits):** simulador com WebSocket FastAPI, NumPy/Pandas, login JWT demo e GIF no README.
- **Fase 2 — padronização v0.1.0 (2026-10-10, PRs #2 e #3):** origem do WebSocket validada, campo vazio sem derrubar a sessão, WS trocado por HTTP debounced, Next 16.4.0 por advisory crítico, deploy com Vercel Services, footer e metadados de autoria.
- **Fase 3 — reengenharia v0.2.0 (2026-10-12):** motor portado para TypeScript com 13 fixtures douradas de paridade, cálculo no navegador, cenário na URL, remoção de tendências fabricadas e do selo "Live" fixo, modelo único de demanda (ADR 0002), UI no design system, headers de segurança, Playwright + axe, CI, deploy só do frontend (ADR 0001), backend enxugado e FastAPI/Starlette corrigidos.
- **Fase 4 — v0.3.0 (2026-10-12):** favicon/ícones gerados do monograma, botões de ícone no header abaixo de 480 px.
- **Fase 5 — higiene (2026-10-15, PR #7):** registro do advisory do `postcss-selector-parser` e `coverage/` ignorado no ESLint.
- **Churn (últimos 50 commits):** `frontend/package.json` (10), `package-lock.json` (8), `README.md` (8), `backend/app/main.py` (7), `page.tsx` (6). O manifesto do frontend é o ponto mais instável: três ciclos seguidos de correção de advisories (Next em 10-10, Starlette em 10-12, Tailwind em 10-15).
- **Débitos herdados:** defaults que abrem em prejuízo, Tailwind 3 sem saída para os advisories, vitest 4 sem correção na própria linha, captura de 375 px ausente nos PRs visuais.

## 4. Objetivos definidos (critério de parada)

| # | Eixo | Objetivo | Métrica | Baseline | Meta | Prioridade | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| O1 | Funcionamento | CI e produção verdes com Next corrigido | `npm audit --omit=dev` critical; execuções verdes na `main` | 1 critical; CI previsto vermelho no próximo run | 0 critical; 4 semanas de CI verde | P0 | ativo |
| O2 | Cobertura de testes | Medir e manter cobertura do backend e da camada de UI | cobertura de linhas `backend/app` · branches `src/lib` | não medido · 96% | ≥ 90% · 100% | P2 | ativo |
| O3 | Segurança | Zerar high/critical da árvore completa e reduzir moderates | `npm audit` (critical/high/moderate) | 1 / 1 / 6 | 0 / 0 / ≤ 2 (só Tailwind 3, se a migração não for aprovada) | P1 | ativo |
| O4 | Performance | Lighthouse mobile em produção registrado | Perf / A11y / BP / SEO | não medido neste ciclo | ≥ 90 / ≥ 95 / ≥ 95 / ≥ 95 | P2 | ativo |
| O5 | Qualidade/Manutenibilidade | Reduzir drift de dependências | pacotes com versão nova sem major (`npm outdated`) | 11 | ≤ 3 | P2 | ativo |
| O6 | Dados/UX | Primeira visita com cenário plausível | lucro mensal e risco no cenário default | −R$ 1.640/mês, risco 100/100 (pendências v4) | lucro > 0 em ≥ 10 de 12 meses, risco ≤ 50/100 | P1 | ativo |

## 5. Guardrails

- Mudança só com objetivo associado (O#) ou item de backlog (B#); refatoração sem ganho mensurável é proibida.
- Nenhuma métrica da seção 2 pode piorar; se piorar, a mudança é revertida.
- Upgrade de versão major, mudança de arquitetura, remoção de funcionalidade e alteração de deploy exigem aprovação do dono (entram em "Decisões pendentes").
- No máximo uma feature nova por semana, de risco baixo, atrás de testes.
- Toda fórmula muda em `engine.ts` e `engine.py` juntos, com `fixtures/simulation-golden.json` regenerado; os limites do backend nunca são mais estritos que `limits.ts`.
- `frontend/src/app/ms-tokens.css` não é editado (SHA-256 conferido em teste); hex só na allowlist documentada.
- Nenhum valor exibido como real sem vir do motor; dado ilustrativo leva rótulo.
- A API de referência continua sem deploy (ADR 0001) até decisão do dono.

## 6. Backlog priorizado

- P0 = quebra funcionamento/segurança · P1 = risco alto · P2 = qualidade · P3 = melhoria

- [ ] **B1 (P0, O1/O3)** Subir `next` e `eslint-config-next` para `16.4.3` — `npm audit --omit=dev` sem critical; lint, typecheck, test, build e e2e verdes no CI; deploy de preview responde 200.
- [ ] **B2 (P1, O6)** Defaults plausíveis nos dois motores (pendência v4 P1, com aprovação) — cenário inicial com lucro em ≥ 10 de 12 meses e risco ≤ 50/100; fixtures regeneradas; README e capturas coerentes.
- [ ] **B3 (P1, O3)** Atualizar `zod` transitivo (`npm audit fix`, sem major) — `npm audit --audit-level=high` sai com 0.
- [ ] **B4 (P1, O3)** Migrar Vitest e `@vitest/coverage-v8` para 5.x (major, com aprovação) para fechar GHSA-qxg6-89mg-rqv8 — 65 testes passando e cobertura mantida.
- [ ] **B5 (P1, O3)** Migrar para Tailwind 4 mantendo o mapeamento A.3 sobre `ms-tokens.css` (pendência v4 P2, com aprovação) — 0 achados de `postcss-selector-parser`; e2e, axe e Lighthouse sem regressão; capturas 375 px e 1440 px no PR.
- [ ] **B6 (P2, O5)** `@types/node` para `^24` (pendência v4 P4) — `npm run typecheck` e `npm run build` verdes.
- [ ] **B7 (P2, O3)** Atualizar a seção "Dependências e auditoria" do README e as exceções do guia do repositório com os achados reais (sem `braces`, com `zod`/vitest) — texto igual à saída de `npm audit` do dia.
- [ ] **B8 (P2, O2)** Adicionar `pytest-cov` ao `requirements-dev.txt` e gate de cobertura no job `backend` — `pytest --cov=app --cov-fail-under=90` verde.
- [ ] **B9 (P2, O1)** Self-host da IBM Plex Sans via `next/font/local` (já existe `@fontsource/ibm-plex-sans` nas devDependencies) — `npm run build` passa sem acesso a `fonts.googleapis.com`; mesma `font-family` computada.
- [ ] **B10 (P2, O4)** Lighthouse mobile da produção registrado na seção 10 — Perf ≥ 90, A11y ≥ 95, BP ≥ 95, SEO ≥ 95.
- [ ] **B11 (P2, O5)** Dependabot para `npm` (frontend), `pip` (backend) e `github-actions`, agrupado e semanal; actions fixadas por SHA — PRs abertos com CI completo.
- [ ] **B12 (P3, O6)** Comparar dois cenários lado a lado (ver F1) — diferença de lucro/risco calculada pelo mesmo motor; teste unitário e e2e; URL compartilhável com os dois cenários.

## 7. Radar técnico

| Data | Item | Fonte | Veredito (adotar / avaliar / descartar) | Motivo |
| --- | --- | --- | --- | --- |
| 2026-10-23 | Next.js 16.4.3 (RCE no Image Optimization com SVG, RCE em `use cache`, DoS em Server Actions) | https://github.com/advisories/GHSA-2464-fhr4-w9xw | adotar | Patch na mesma minor; bloqueia o CI por `--audit-level=critical`. |
| 2026-10-23 | Tailwind CSS 4 (engine nova, config em CSS) | https://tailwindcss.com/docs/upgrade-guide | avaliar | Única saída para `postcss-selector-parser` < 7.1.6; exige refazer o mapeamento A.3. |
| 2026-10-23 | Vitest 5 | https://vitest.dev/blog | adotar (com aprovação) | Corrige GHSA-qxg6-89mg-rqv8; outros repositórios do portfólio já usam 5.0.x. |
| 2026-10-23 | TypeScript 7 (compilador nativo) | https://infoq.com/news/2026/08/typescript-7-released/ | avaliar | `next typegen` + `tsc` mais rápidos; validar compatibilidade com o plugin de tipos do Next antes. |
| 2026-10-23 | Recharts 3.10 | https://github.com/recharts/recharts/releases | adotar | Minor dentro do range `^3.7.0`; atualizar com o lockfile e rodar e2e do gráfico. |
| 2026-10-23 | `zod` ≥ 4.6.6 (exaustão de memória) | https://github.com/advisories/GHSA-mrhx-c7xc-m3w5 | adotar | Transitivo de lint; correção sem major. |

## 8. Ideias de features

| # | Feature | Valor para o usuário/portfólio | Risco | Status (proposta / aprovada / implementada / descartada) |
| --- | --- | --- | --- | --- |
| F1 | Comparação A/B de cenários | Mostra impacto de uma decisão contra a base; demonstra estado derivado e URL com dois cenários | baixo | proposta |
| F2 | Análise de sensibilidade (tornado) por variável | Mostra quais alavancas mais movem o lucro; demonstra raciocínio financeiro | médio (novo cálculo nos dois motores + fixtures) | proposta |
| F3 | Exportar projeção em CSV | Reuso dos números em planilha; demonstra formatação pt-BR consistente | baixo | proposta |
| F4 | Premissas fixas como entradas avançadas (salário, dívida, capital de giro) | Transparência do modelo; responde à pergunta do Bloco B sobre premissas | médio (amplia limites e paridade) | proposta |
| F5 | Simulação de Monte Carlo da demanda com semente fixa | Risco como distribuição, não ponto; demonstra estatística | alto (custo de CPU no cliente, novo modelo) | proposta |

## 9. Decisões pendentes do dono

- Aprovar os novos defaults do simulador (ex.: `price=135`, `variable_cost=40`, `demand=2600`, `churn_rate=0.02`, usados nas capturas do portfólio)?
- Aprovar a migração para Tailwind 4 (major) e para Vitest 5 (major)?
- Manter a API Python apenas como referência local ou publicá-la (Vercel Services ou segundo projeto)?
- Locale: só pt-BR/BRL ou pt-BR + EN?
- Domínio: manter `simulacao-estrategica-decisao.vercel.app` ou subdomínio de `matheussiqueira.dev`?

## 10. Registro semanal

| Data | Auditoria | Mudanças (commits) | Métricas | Próximo foco |
| --- | --- | --- | --- | --- |
| 2026-10-23 | Documento inicial e baseline | — | ver seção 2 | B1 (O1), B3 (O3) |
