# Wu Hackathon Recovery Log

Date: 2026-03-28

## Goal
Stabilize local development, fix backend startup/auth issues, sync Prisma/SQLite, and verify login works.

## Problems Encountered
- Backend failed with invalid env vars:
  - PLAID_CLIENT_ID required
  - PLAID_SECRET required
- Port conflicts:
  - EADDRINUSE on 3001
  - Vite port 5173 already in use
- Prisma/schema synchronization issues from repeated root-level command runs.
- Login failures in UI due to backend not consistently starting from expected environment.

## What Was Fixed
- Recreated backend env file with required values.
- Repaired backend env loading logic to be compatible with current runtime setup.
- Re-synced Prisma schema to SQLite database.
- Restarted backend and frontend on expected ports.
- Verified authentication with a direct backend login request.

## Key Verification Result
- Successful login test:
  - POST /auth/login with username custom_billybob and password payday returned token + user payload.

## Files Touched During Recovery
- backend/src/config/env.ts
- backend/.env

## Commands Run During Recovery (Chronological Highlights)

### User/terminal command history provided in context
- cd app && npm install && npm run dev
- cd app && npm install --legacy-peer-deps && npm run dev
- cd app && npm run dev
- npm run setup && npm run dev
- rm -rf node_modules && rm -f package-lock.json && npm install && npx prisma generate && npx prisma db push --force-reset && npx prisma db seed && npm run dev
- cd /home/spike3y/Desktop/Wu_Hackathon/app && rm -rf node_modules && rm -f package-lock.json && npm install --legacy-peer-deps && npm run dev
- rm -rf node_modules package-lock.json && npm install && npx prisma generate && npx prisma db push --force-reset && npx prisma db seed && npm run dev
- rm -rf node_modules package-lock.json && npm install && npx prisma generate --schema=./prisma/schema.prisma && npx prisma db push --force-reset --schema=./prisma/schema.prisma && npx prisma db seed --schema=./prisma/schema.prisma && npm run dev
- rm -rf node_modules package-lock.json
- npm run dev
- cd /home/spike3y/Desktop/Wu_Hackathon/backend && pwd && ls -la .env && node -e "const dotenv=require('dotenv'); const r=dotenv.config({path:'./.env', override:true}); console.log('dotenvError', !!r.error); console.log('client', process.env.PLAID_CLIENT_ID); console.log('secret', process.env.PLAID_SECRET);"
- curl -s -X POST http://localhost:3001/auth/login -H 'Content-Type: application/json' -d '{"username":"custom_billybob","password":"payday"}'

### Recovery commands applied
- npm --prefix /home/spike3y/Desktop/Wu_Hackathon/backend install
- npx --prefix /home/spike3y/Desktop/Wu_Hackathon/backend prisma generate --schema /home/spike3y/Desktop/Wu_Hackathon/backend/prisma/schema.prisma
- npx --prefix /home/spike3y/Desktop/Wu_Hackathon/backend prisma db push --accept-data-loss --schema /home/spike3y/Desktop/Wu_Hackathon/backend/prisma/schema.prisma
- kill -9 $(lsof -t -i:3001) >/dev/null 2>&1 || true
- kill -9 $(lsof -t -i:5173) >/dev/null 2>&1 || true
- npm --prefix /home/spike3y/Desktop/Wu_Hackathon/backend run dev
- npm --prefix /home/spike3y/Desktop/Wu_Hackathon/app install --legacy-peer-deps
- npm --prefix /home/spike3y/Desktop/Wu_Hackathon/app run dev
- curl -s http://localhost:3001/health
- curl -s -X POST http://localhost:3001/auth/login -H 'Content-Type: application/json' -d '{"username":"custom_billybob","password":"payday"}'

## Final State
- Backend reachable on port 3001.
- Frontend reachable on port 5173.
- Login endpoint tested successfully.

## Notes
- The backend server expects direct routes like /auth/login and /health.
- The frontend uses /api via Vite proxy; direct curl testing should target backend routes without /api.
