# RuleForge

Natural language to live API — describe a business rule in plain English, get a Python function, edit it in-browser, and deploy it as a callable HTTP endpoint instantly.

## What it does

Type a rule like "apply a 10% surcharge if order total exceeds $500". Groq generates a Python function implementing that logic. You review and edit it in a Monaco Editor. Hit Deploy — FastAPI registers it as a live `/rules/{id}/run` endpoint with no server restart required. Call it immediately with a JSON payload.

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Monaco Editor, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python, SQLModel, SQLite
- **AI**: Groq SDK
- **Infrastructure**: Docker Compose

## Key Technical Features

- **Dynamic route registration** — `app.add_api_route()` registers endpoints at runtime; lifespan hook re-registers all persisted rules on server restart
- **AST-validated code generation** — generated Python is parsed with `ast.parse()` and walked to block dangerous imports (`os`, `sys`, `subprocess`, `socket`, `shutil`)
- **Sandboxed execution** — `exec()` runs in a restricted namespace with a safe builtins whitelist; ThreadPoolExecutor enforces a 5-second timeout to kill runaway code
- **Call count tracking** — each rule tracks invocation count, incremented on every execution
- **Monaco Editor** — dynamically imported (SSR disabled) for in-browser code editing with syntax highlighting

## Running locally

```bash
docker compose up --build
```

Frontend: http://localhost:3000  
Backend: http://localhost:8000
