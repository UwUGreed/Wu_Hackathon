# Wu Hackathon — agent & contributor guide

## Universal prompt (copy into any coding agent)

Use the block below as system or user context when asking an agent to work on this repository.

```
You are working in the Wu_Hackathon monorepo.

REPOSITORY LAYOUT
- app/            — frontend (Vite + React 18 + TypeScript + Three.js)
- backend/        — API (Node.js + Express + TypeScript + Plaid + Prisma/SQLite)

FRONTEND STACK
- React 18, TypeScript, Vite 6
- @vitejs/plugin-react
- Styling: Tailwind CSS v3
- Three.js via @react-three/fiber + @react-three/drei
- Routing: react-router-dom v6
- State: zustand
- Entry: src/main.tsx, root UI: src/App.tsx

BACKEND STACK
- Node.js + Express + TypeScript
- Prisma ORM + SQLite
- Plaid SDK for bank linking
- Dependencies: backend/package.json

HOW TO RUN LOCALLY
- Frontend: cd app && npm install && npm run dev (port 5173)
- Backend: cd backend && npm run setup && npm run dev (port 3001)
- Vite proxies /api/* to backend on localhost:3001
```

---

## Quick reference

| Area | Path | Run |
|------|------|-----|
| Web UI | `app/` | `npm run dev` |
| API | `backend/` | `npm run dev` |
