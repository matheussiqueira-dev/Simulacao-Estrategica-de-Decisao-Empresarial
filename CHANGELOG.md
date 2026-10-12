# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); versões em [SemVer](https://semver.org/lang/pt-BR/).

## [0.3.0] - 2026-10-12

### Added
- `favicon.ico` (32 px) e `icon-512.png`, gerados pelo mesmo script do monograma a partir do `icon.svg`.
- Abaixo de 480 px, "Portfólio" e "Código" no header viram botões de ícone de 44 × 44 com tooltip: abre no hover depois de 300 ms e no foco do teclado, e o Esc fecha.

### Changed
- Links do header com ícones Lucide (`lucide-react` 1.55.0). "Código" usa `CodeXml`, porque o Lucide 1.x não tem o ícone do GitHub.

## [0.2.0] - 2026-10-12

### Added
- Motor de simulação em TypeScript, rodando no navegador, com paridade com o motor Python garantida por 13 fixtures douradas.
- Cenário compartilhável pela URL: os valores alterados vão para a query string e o link restaura o cenário.
- Seção "Premissas do modelo" e o painel "Risco e equilíbrio" com a demanda efetiva.
- Gráfico com tabela alternativa ("Ver dados em tabela"), carregado sob demanda e sem animação com `prefers-reduced-motion`.
- Ícone com monograma, imagens de compartilhamento (Open Graph e Twitter), `robots.txt` e `sitemap.xml`.
- Headers de segurança (CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`).
- Testes: Vitest no frontend, Playwright com axe (fluxos, overflow em 5 larguras, acessibilidade em 3) e CI no GitHub Actions.

### Changed
- KPIs e projeção usam um único modelo de demanda: o lucro mensal é o primeiro mês projetado e o lucro anual é a soma de 12 meses (ADR 0002).
- Interface refeita no design system compartilhado: tokens `ms-tokens` v1.0, IBM Plex Sans, header e footer padrão, campos com label, valor e faixa, percentuais em %.
- Valores em reais (pt-BR, BRL) e meses a partir do mês atual.
- Deploy só do frontend na Vercel (Root Directory `frontend`, Node 24.x); a API FastAPI fica como referência local (ADR 0001).

### Fixed
- A projeção dividia receita e custos mensais pelo número de meses, mostrando 1/12 dos valores.
- A demanda projetada podia ficar negativa em horizontes longos.
- Tendências de KPI inventadas e o selo "Live" fixo foram removidos.

### Removed
- Login JWT de demonstração, modelos SQLAlchemy e `db.py`, que nunca eram usados (ADR 0004).
- NumPy, Pandas e dependências de banco e autenticação do backend.
- GIF de demonstração da interface antiga, substituído por uma captura atual.

### Security
- API de referência atualizada para FastAPI 0.143.0 e Starlette 1.7.0, que corrigem os advisories do Starlette 0.41.3 apontados pelo `pip-audit` no CI; uvicorn e pydantic acompanharam, e o cliente de testes passou a ser o `httpx2`.

## [0.1.0] - 2026-10-10

### Added
- Deploy na Vercel com Services (Next.js e FastAPI) e headers de autoria, metadados e rodapé padrão.

### Fixed
- O WebSocket aceitava conexões de qualquer origem.
- Um campo numérico vazio derrubava a conexão até recarregar a página.
- `next` atualizado para 16.4.0 por um advisory crítico.
