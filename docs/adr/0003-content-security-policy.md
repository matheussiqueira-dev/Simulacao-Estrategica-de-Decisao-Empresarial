# 0003. CSP sem nonces

- Status: aceito
- Data: 2026-10-12

## Contexto
O padrão dos projetos pede uma Content-Security-Policy sem script inline. O Next.js App Router
injeta scripts inline próprios (bootstrap e dados do React Server Components). Uma CSP estrita
exigiria nonces, e nonces exigem renderização dinâmica: a página deixaria de ser estática e
passaria a rodar uma Function a cada visita. A alternativa por hash (SRI, `experimental.sri`)
ainda é experimental.

## Decisão
Usar o modelo "Without Nonces" da documentação do Next.js, em `frontend/next.config.ts`:
- `script-src 'self' 'unsafe-inline'` (mais `'unsafe-eval'` só em desenvolvimento) e
  `style-src 'self' 'unsafe-inline'`;
- `default-src`, `img-src`, `font-src` e `connect-src` restritos a `'self'` (imagens também a
  `data:` e `blob:`);
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` e `frame-ancestors 'none'`;
- junto: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` sem câmera, microfone nem geolocalização, `X-Frame-Options: DENY` e
  `poweredByHeader: false`.

## Consequências
- A página continua estática e servida pela CDN.
- `'unsafe-inline'` reduz a proteção contra XSS. O risco é baixo aqui: não há entrada de usuário
  renderizada como HTML, nem conteúdo de terceiros, nem segredo no navegador. O único HTML
  injetado é o JSON-LD, um objeto constante serializado com `<` escapado.
- Se o app passar a renderizar conteúdo externo, reavaliar nonces ou SRI.
