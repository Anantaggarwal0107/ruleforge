# RuleForge — Project Context

## What It Is

RuleForge converts plain-English descriptions into live, callable HTTP API endpoints.

**Resume bullet:** "Built NL-to-live-API system with Groq code generation, AST-validated sandboxed Python exec, and Monaco Editor — rules deploy as real FastAPI routes persisted in SQLite and re-registered on every server restart."

---

## Architecture

```
Browser (Next.js 14)
  └─ ChatInput → POST /generate   → FastAPI → Groq LLM → Python code
  └─ DeployButton → POST /rules   → FastAPI → AST validate → SQLite → app.add_api_route()
  └─ LiveTestPanel → POST /rules/{id}/run → dynamically registered route → sandboxed exec
  └─ RuleLibrary → GET /rules     → FastAPI → SQLite

Data flow:
  User describes rule → Groq generates Python fn → Monaco Editor (editable) →
  Deploy → FastAPI registers /rules/{id}/run dynamically → SQLite persists →
  On restart: lifespan hook re-registers all routes from DB
```

---

## File Map

### Backend (`backend/`)
| File | Description |
|------|-------------|
| `main.py` | FastAPI app, all HTTP routes, CORS, lifespan hook for route re-registration |
| `models.py` | SQLModel `Rule` table (id, name, prompt, code, call_count, created_at) |
| `db.py` | SQLite engine (`check_same_thread=False`), `create_db()`, `get_session()` dependency |
| `groq_client.py` | Async Groq SDK call, strips markdown fences from LLM output |
| `executor.py` | AST import validation, restricted `__builtins__`, ThreadPoolExecutor 5s timeout, `register_rule_route()` |
| `requirements.txt` | fastapi, uvicorn, sqlmodel, groq, python-dotenv |
| `Dockerfile` | python:3.12-slim, installs requirements, uvicorn entrypoint |

### Frontend (`frontend/`)
| File | Description |
|------|-------------|
| `app/page.tsx` | Main page: 3-step left panel (describe → edit → deploy) + right sidebar (library, curl, live test) |
| `app/layout.tsx` | Root layout with font and metadata |
| `app/globals.css` | Tailwind + shadcn CSS variables |
| `components/ChatInput.tsx` | Textarea + Generate button + example prompt chips |
| `components/CodeEditor.tsx` | Monaco Editor loaded with `dynamic(..., { ssr: false })` |
| `components/DeployButton.tsx` | Deploy rule with inline error state |
| `components/CurlSnippet.tsx` | Copy-to-clipboard curl command for selected rule |
| `components/LiveTestPanel.tsx` | JSON input textarea → POST run → pass/fail result display |
| `components/RuleLibrary.tsx` | Fetches and lists deployed rules, refreshes on trigger |
| `components/RuleLibraryItem.tsx` | Individual rule card with delete button |
| `components/ui/` | shadcn/ui components: button, badge, card, scroll-area, separator |
| `lib/api.ts` | Typed fetch wrappers for all backend endpoints |
| `lib/types.ts` | TypeScript interfaces: Rule, GenerateResponse, DeployResponse, TestResponse |
| `lib/utils.ts` | shadcn `cn()` utility |
| `next.config.ts` | `output: "standalone"` for Docker |
| `Dockerfile` | Multi-stage: node:20-alpine builder → standalone runner |
| `.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:8000` |

### Root
| File | Description |
|------|-------------|
| `docker-compose.yml` | Composes backend (port 8000) + frontend (port 3000) with shared .env |
| `CONTEXT.md` | This file |

---

## Key Implementation Patterns

### 1. Dynamic Route Registration
FastAPI's `app.add_api_route()` is called at deploy time to register `/rules/{id}/run` immediately — no server restart needed. On startup, the `lifespan` async context manager re-registers all rules from SQLite so routes survive server restarts:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    with Session(engine) as session:
        rules = session.exec(select(Rule)).all()
        for rule in rules:
            register_rule_route(app, rule)
    yield
```

### 2. Sandboxed Exec
`executor.py` enforces three layers of security before running user code:
- **AST import validation** — walks the AST and raises `ValueError` for any `import`/`from` of blocked modules (`os`, `sys`, `subprocess`, `socket`, `shutil`)
- **Restricted `__builtins__`** — exec runs with a whitelist of safe builtins only
- **5-second timeout** — `ThreadPoolExecutor` with `future.result(timeout=5)` kills runaway code

### 3. Monaco Editor SSR Avoidance
Monaco Editor requires browser APIs unavailable in Node.js. Loaded via Next.js dynamic import with SSR disabled:

```tsx
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false },
);
```

### 4. SQLite Thread Safety
FastAPI's async architecture runs DB operations across threads. The SQLite engine is created with `check_same_thread=False` to prevent `ProgrammingError: SQLite objects created in a thread can only be used in that same thread`.

---

## Gotchas

- **`sqlmodel>=0.0.21`** required for Pydantic v2 compatibility — older versions break at startup with `PydanticUserError`
- **`check_same_thread=False`** on the SQLite engine — without this, FastAPI's thread pool causes SQLite errors
- **Monaco SSR** — `dynamic(..., { ssr: false })` is mandatory; importing Monaco at module level crashes Next.js build
- **Groq fence stripping** — the LLM wraps code in ` ```python ``` ` fences; `groq_client.py` strips these before returning
- **`.env.local` not committed** — contains `NEXT_PUBLIC_API_URL`; for Docker use root `.env`

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `GROQ_API_KEY` | `backend/.env` or root `.env` | Groq API key for LLM code generation |
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | Backend base URL (default: `http://localhost:8000`) |

---

## How to Run

### Manual Setup

```bash
# Terminal 1 — backend
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
# Create backend/.env with: GROQ_API_KEY=your_key_here
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Docker

```bash
cp .env.example .env
# Add GROQ_API_KEY=your_key_here to .env
docker compose up --build
# Open http://localhost:3000
```

---

## Git History

```
5211a5f feat(ruleforge): complete frontend + Docker — Monaco editor, deploy flow, live test panel, rule library
db099bc feat(ruleforge): backend scaffold — FastAPI, SQLModel, Groq generation, sandboxed executor, CRUD routes
```

---

## 2-Minute Demo Script

1. Type `"Reject if age field is less than 18"` → click **Generate Rule**
2. Review the generated Python function in the Monaco Editor (editable)
3. Enter `"Age Gate"` as rule name → click **Deploy Rule**
4. Select **Age Gate** in the sidebar → paste `{"age": 16}` in Live Test → click **Test Rule** → see red Failed
5. Paste `{"age": 21}` → Test Rule → see green Passed
6. Copy the curl command and run it directly against the FastAPI endpoint
7. Generate more rules — each deploys as `/rules/{id}/run`, call counts increment in real time
