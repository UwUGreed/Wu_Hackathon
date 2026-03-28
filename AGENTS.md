# Wu Hackathon — agent & contributor guide

## Universal prompt (copy into any coding agent)

Use the block below as system or user context when asking an agent to work on this repository.

```
You are working in the Wu_Hackathon monorepo.

REPOSITORY LAYOUT
- wu-hackathon/   — frontend (Vite + React 19 + TypeScript)
- backend/        — API (FastAPI + Uvicorn)

FRONTEND STACK
- React 19, TypeScript (strict project refs via tsc -b), Vite 8
- @vitejs/plugin-react
- Styling: Tailwind CSS v4 — @tailwindcss/vite in vite.config.ts, global entry src/index.css uses @import "tailwindcss"
- ESLint 9 with typescript-eslint, react-hooks, react-refresh
- Entry: src/main.tsx, root UI: src/App.tsx

BACKEND STACK
- Python 3.x
- FastAPI app in backend/main.py (Uvicorn ASGI server)
- Dependencies: backend/requirements.txt (fastapi, uvicorn[standard])
- Existing route: GET /health → {"status": "ok"}

HOW TO RUN LOCALLY
- Frontend: cd wu-hackathon && npm install && npm run dev (default Vite port, often 5173)
- Backend: cd backend && pip install -r requirements.txt && uvicorn main:app --reload --host 127.0.0.1 --port 8000
- Health check: GET http://127.0.0.1:8000/health

INTEGRATION EXPECTATIONS
- Browser calls from Vite must either use full backend URL (e.g. http://127.0.0.1:8000) or a Vite dev-server proxy — add proxy in vite.config.ts if you want same-origin /api/* during dev.
- If the frontend calls the backend from the browser, configure CORS on FastAPI (CORSMiddleware) for dev origins or rely on the Vite proxy to avoid CORS.
- Prefer small, focused changes; match existing file layout and naming unless restructuring is explicitly requested.

When implementing features: place new React components and hooks under wu-hackathon/src/, new API routes and models under backend/ (extend main.py or split into routers/modules as the app grows). Run npm run lint and npm run build for the frontend; use reasonable Python typing for new backend code.
```

---

## Quick reference

| Area | Path | Run |
|------|------|-----|
| Web UI | `wu-hackathon/` | `npm run dev` |
| API | `backend/` | `uvicorn main:app --reload --host 127.0.0.1 --port 8000` |

**Note:** If `package.json` does not yet list Tailwind packages but `vite.config.ts` imports `@tailwindcss/vite`, ensure `@tailwindcss/vite` and `tailwindcss` are installed before `npm run dev`.

---

## Conventions for agents

1. **Scope** — Change only what the task needs; keep diffs easy to review.
2. **Frontend** — TypeScript for new code; respect ESLint; use Tailwind utility classes consistent with `index.css` / existing components.
3. **Backend** — Add routes on the FastAPI `app` (or `APIRouter` + `include_router` as the API grows); return Pydantic models or typed dicts where helpful; document new endpoints (OpenAPI is automatic).
4. **Cross-origin** — Plan for CORS or Vite proxy before shipping browser → FastAPI calls.
5. **Secrets** — Never commit API keys; use env vars and document required names in code comments or `.env.example` if you add one.
