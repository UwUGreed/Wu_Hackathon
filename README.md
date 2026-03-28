# Gooblet

## Monorepo Layout

```
.
├── app/          ← Frontend (Vite + React 18 + TypeScript + Tailwind + Three.js)
├── backend/      ← API (Node.js + Express + TypeScript + Plaid + Prisma/SQLite)
```

## Quick Start

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env → fill in PLAID_CLIENT_ID and PLAID_SECRET
npm run setup    # install + generate Prisma + push DB + seed demo user
npm run dev      # starts on http://localhost:3001
```

### 2. Frontend Setup
```bash
cd app
npm install
npm run dev      # starts on http://localhost:5173
```

### 3. Test Backend via curl
```bash
BASE=http://localhost:3001
AUTH="Authorization: Bearer demo-token"

curl $BASE/health
curl -H "$AUTH" $BASE/auth/me
curl -H "$AUTH" $BASE/home
curl -H "$AUTH" $BASE/accounts
curl -H "$AUTH" $BASE/transactions
```
