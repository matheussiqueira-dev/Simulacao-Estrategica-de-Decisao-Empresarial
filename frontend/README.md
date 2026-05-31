# Business Decision Simulator Frontend

Interface Next.js para simular decisoes empresariais em tempo real usando WebSocket com fallback local.

## Execucao

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Variaveis

- `NEXT_PUBLIC_WS_URL`: endpoint WebSocket do backend. Padrao: `ws://localhost:8000/ws/simulate`.
- `NEXT_PUBLIC_SITE_URL`: URL publica usada em sitemap, robots e metadata.

## Validacao

```bash
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Screenshot da demo

Com frontend e backend rodando:

```bash
node scripts/screenshot.mjs
```

O arquivo e salvo em `docs/demo.png`.

## Deploy na Vercel

Configure o projeto Vercel apontando para `frontend/` como root directory ou importe este diretorio como projeto separado. O `frontend/vercel.json` define install e build commands.
