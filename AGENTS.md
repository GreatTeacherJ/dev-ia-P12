# AGENTS.md

Claims Management System: Next.js 15 (App Router) + React 19 + TypeScript + PostgreSQL via Docker.

## Layout

- Work inside `typescript/` only. The root `README.md` claims a `javascript/` twin exists, but that folder was deleted — the root README is stale.
- `docker.txt` at root is a past troubleshooting session log, not a config file; ignore it.
- No `.env` file needed: `src/database/client.ts` reads `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` and falls back to `localhost:5432`, `dev_ia_p12`, `postgres/postgres` (matches `typescript/docker-compose.yml`).

## Commands (run from `typescript/`)

```bash
npm run db:start   # docker compose up -d  (v2; "docker-compose" v1 is NOT installed)
npm run db:reset   # node src/database/seed.ts — DROPS the claims table and reseeds from seed-data.json
npm run db:stop    # docker compose down
npm run dev        # next dev --turbopack
npm run build      # next build
npm run lint       # next lint
```

- No tests exist. No dedicated typecheck script — use `npx tsc --noEmit` (tsconfig is `strict`).
- `db:reset` is destructive (drop + recreate + reseed), never data-safe.

## Windows / Docker gotchas

- This machine uses Docker Desktop installed per-user at `C:\Users\Jerem\AppData\Local\Programs\DockerDesktop\resources\bin`. An already-open shell keeps a stale PATH after install — open a new terminal, or call `docker.exe` by full path.
- Docker Desktop requires the WSL2 + "Virtual Machine Platform" Windows features (enable in an admin PowerShell + reboot); otherwise the `docker` CLI runs but the daemon fails with "Virtual Machine Platform not enabled".

## Code conventions

- Imports of local files use explicit `.ts` extensions (`import { db } from './client.ts'`) because `allowImportingTsExtensions` is on — do not strip them.
- Path alias: `@/*` → `src/*` (tsconfig).
- `src/database/seed.ts` runs directly under `node` using import attributes (`with { type: 'json' }`) — needs a modern Node; always run it via `npm run db:reset`, not a compiled build.
- DB access uses `pg` `Pool` + `sql-template-strings` `SQL` tagged templates for parameterized queries; there is no ORM. Only Postgres is supported (no SQLite fallback).
- API: `GET /api/claims` accepts `?tag=` where `all`, `null`/`untagged`, or a tag name filter results; `PATCH /api/claims/[id]/tag` updates a claim's tag.
