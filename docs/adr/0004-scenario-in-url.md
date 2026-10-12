# 0004. Persistência: o cenário fica na URL

- Status: aceito
- Data: 2026-10-12

## Contexto
O repositório tinha modelos SQLAlchemy, um `db.py` e um login JWT de demonstração que nunca
foram usados (nenhuma rota lia ou gravava dados, e o login assinava token para qualquer
credencial com um segredo padrão). Para uma demo pública, contas e banco trariam custo,
superfície de ataque e dados pessoais sem ganho para quem avalia o projeto.

## Decisão
- Nenhum banco de dados nem conta de usuário. Auth, `db.py`, modelos e as dependências
  (SQLAlchemy, asyncpg, passlib, PyJWT, email-validator) saíram do backend.
- O cenário é compartilhável pelo endereço: só os valores diferentes do padrão vão para a query
  string (`?price=150&demand=2000`). Ao abrir, valores desconhecidos ou inválidos são
  descartados e os fora da faixa são limitados (`frontend/src/lib/simulation/scenario-url.ts`).
- A URL é atualizada com `history.replaceState` depois de 300 ms sem mudança, porque os
  navegadores limitam atualizações rápidas do histórico.

## Consequências
- Nada a proteger no servidor e nenhum dado pessoal coletado.
- Compartilhar um cenário é copiar o link; não existe histórico de cenários salvos.
- Se cenários salvos virarem requisito, a opção prevista pelo padrão é Postgres do Marketplace
  da Vercel, com aprovação.
