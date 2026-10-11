# Business Decision Simulator

Plataforma web interativa para testar decisões estratégicas (preço, custos, marketing, equipe, juros, impostos) e visualizar instantaneamente impacto em lucro, caixa, crescimento e risco.

[![Demo ao vivo](https://img.shields.io/badge/Demo-ao_vivo-00f2fe?style=for-the-badge&logo=vercel&logoColor=000000)](https://simulacao-estrategica-decisao.vercel.app)
[![Case no portfólio](https://img.shields.io/badge/Case-Portf%C3%B3lio-000000?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.matheussiqueira.dev/pt-BR/projects/business-decision-simulator)
[![Código](https://img.shields.io/badge/C%C3%B3digo-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/matheussiqueira-dev/Simulacao-Estrategica-de-Decisao-Empresarial)

![Demonstração](docs/demo.gif)

---

## Destaques
- Atualização em tempo real: sliders e inputs disparam `POST /api/scenarios/run` com debounce de 160 ms; só a requisição mais recente atualiza a tela. Se a API não responder, há fallback local para manter a responsividade.
- Entradas tolerantes a erro: campo vazio ou inválido mostra mensagem inline e mantém o último valor válido; valores fora da faixa são limitados aos extremos. Nada disso trava a simulação.
- KPIs e gráficos dinâmicos: lucro, fluxo de caixa, margem de segurança, risco e projeção de receita/lucro nos próximos meses.
- UX inspirada em cockpit financeiro (glassmorphism + gradientes) com layout 2 colunas: controles à esquerda, KPIs/gráficos à direita.
- Engine vetorizada (NumPy/Pandas) para simulações rápidas e fácil extensão de fórmulas.

## Stack
- **Frontend**: Next.js 16, React 19, Tailwind 3, Recharts, Playwright (screenshot demo).
- **Backend**: FastAPI, Pydantic v2, SQLAlchemy (models), JWT stub (só local).
- **Engine**: NumPy + Pandas (cálculo de lucro, caixa, risco, crescimento).
- **DB**: PostgreSQL (models prontos; persistência futura).

## Arquitetura (visão rápida)
- `frontend/` — UI, componentes (sliders, KPIs, chart), estado via `useSimulationState` (fetch + debounce).
- `backend/app/main.py` — FastAPI; todas as rotas públicas ficam sob `/api`.
- `vercel.json` — deploy como um projeto Vercel com dois [Services](https://vercel.com/docs/services): `backend` e `frontend`.
- `backend/app/simulation/engine.py` — motor de cálculo vetorizado.
- `backend/app/api/routes/` — auth demo (JWT), cenários mock e health.

## Como rodar localmente
### Backend
```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev -- --port 3000
```

Por padrão o frontend chama a API na mesma origem (`/api/...`), como no Vercel. Com os dois servidores separados, defina `NEXT_PUBLIC_API_URL=http://localhost:8000` em `frontend/.env.local`; o backend libera CORS para as origens de `ALLOWED_ORIGINS` (array JSON; padrão `http://localhost:3000` e `http://127.0.0.1:3000`).

Com a [Vercel CLI](https://vercel.com/docs/cli), `vercel dev` sobe os dois serviços numa origem só, como em produção.

## Endpoints úteis
- `GET /api/health` — liveness.
- `POST /api/auth/login` — emite JWT de demonstração (sem persistência). Só existe fora do Vercel.
- `GET /api/scenarios/` — cenários mock.
- `POST /api/scenarios/run` — executa a simulação (JSON de variáveis). Entrada vazia, fora da faixa, `NaN`/`Infinity` ou JSON inválido responde 422, sem ecoar o valor enviado.

## Deploy na Vercel
Um único projeto com [Vercel Services](https://vercel.com/docs/services) (Beta), configurado em `vercel.json`:

| Serviço | Pasta | Framework | Rota pública |
|---|---|---|---|
| `backend` | `backend/` | FastAPI (`app.main:app`, Python 3.12) | `/api/*` |
| `frontend` | `frontend/` | Next.js | todo o resto |

- No projeto Vercel, o **Root Directory** é a raiz do repositório (onde está o `vercel.json`).
- O frontend fala com o backend pela mesma origem; não há bindings entre serviços, porque nenhuma chamada sai do servidor Next.
- O backend recebe o caminho original (`/api/...`), por isso as rotas do FastAPI já têm o prefixo `/api`.

| Variável | Serviço | Obrigatória | Uso |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | frontend | não | Base da API. Vazia no Vercel (mesma origem). |
| `ALLOWED_ORIGINS` | backend | não | Origens liberadas no CORS, em array JSON. Só importa fora da mesma origem. |
| `JWT_SECRET` | backend | não | Só usada pelo login demo, que não é registrado no Vercel. |

O Vercel define `VERCEL=1`; o backend usa essa variável para não registrar o login demo em deploys públicos.

## Dependências e auditoria
`npm audit` não tem achados críticos. Os altos restantes vêm de `braces@3.0.3` ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)), usado por `micromatch` no Tailwind 3 e no plugin ESLint do Next. Não existe versão corrigida do `braces`; o código roda só no build e no lint, com globs do próprio projeto, e não vai para o navegador nem para a Function. A saída definitiva é migrar para o Tailwind 4.

## Variáveis simuladas (payload)
```json
{
  "price": 120,
  "variable_cost": 45,
  "fixed_cost": 25000,
  "employees": 12,
  "interest_rate": 0.08,
  "tax_rate": 0.27,
  "demand": 1200,
  "marketing_spend": 12000,
  "churn_rate": 0.04,
  "price_sensitivity": 0.18,
  "period_months": 12
}
```

## Scripts úteis
- Frontend: `npm run dev`, `npm run lint`.
- Backend: `uvicorn app.main:app --reload`; testes com `pip install -r requirements-dev.txt` e `python -m pytest`.

## Próximos passos sugeridos
- Persistir usuários/cenários (PostgreSQL + Alembic).
- Rate limit em `POST /api/scenarios/run` (regra WAF do Vercel).
- Testes automatizados: PyTest (engine), React Testing Library / Playwright (UI).
- Migração para ambiente de produção (build Next + gunicorn/uvicorn workers).

## Sobre o GIF
O arquivo `docs/demo.gif` foi gerado a partir da UI atual. Para recriar:
1) Inicie frontend e backend (`npm run dev` + `uvicorn ...`).  
2) Gere o PNG: `cd frontend && node scripts/screenshot.mjs` (Playwright headless no Edge instalado; troque com `PLAYWRIGHT_CHANNEL`).  
3) Converta para GIF:  
```bash
python - <<'PY'
from PIL import Image
img = Image.open('docs/demo.png')
img.save('docs/demo.gif', save_all=True, append_images=[img], duration=1200, loop=0)
PY
```  
4) Faça o commit: `git add docs/demo.gif`.

---

### Desenvolvido por Matheus Siqueira

**Analista de Dados & BI | Power BI • SQL • Python • DAX | ETL, Modelagem de Dados, KPIs e Automação**

Conecte-se e acesse meus projetos:

[![Portfólio](https://img.shields.io/badge/Portf%C3%B3lio-matheussiqueira.dev-000000?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.matheussiqueira.dev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Matheus_Siqueira-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/matheussiqueira-dev)
[![GitHub](https://img.shields.io/badge/GitHub-matheussiqueira--dev-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/matheussiqueira-dev)
[![E-mail](https://img.shields.io/badge/E--mail-hellomatheusdev%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:hellomatheusdev@gmail.com)
