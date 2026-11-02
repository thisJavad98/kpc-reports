# KPC Reports

Project-folder reports app with two roles:

- **Admin** — create project folders and write text reports
- **Viewer** — open folders and read reports

Monorepo layout:

```
frontend/   Next.js (Vercel)
backend/    Hono API + Prisma + PostgreSQL (Vercel)
```

UI follows the installed `design-taste-frontend` taste skill (achromatic ledger / open-plane shell).

## Demo accounts

After seeding:

| Role   | Email             | Password   |
|--------|-------------------|------------|
| Admin  | admin@kpc.local   | admin123   |
| Viewer | viewer@kpc.local  | viewer123  |

## Local setup

### 1. PostgreSQL

**Option A — Docker**

```bash
docker compose up -d
```

**Option B — Homebrew**

```bash
brew install postgresql@16
brew services start postgresql@16
createuser -s kpc
psql postgres -c "ALTER USER kpc WITH PASSWORD 'kpc';"
createdb -O kpc kpc_reports
```

Or point `backend/.env` at any Postgres / Neon URL (`DATABASE_URL`).

### 2. Backend

```bash
cd backend
cp .env.example .env   # if needed
npm install
npm run db:setup
npm run dev
```

API: `http://localhost:4000/api`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App: `http://localhost:3000`

## Deploy on Vercel (from GitHub)

Create **two** Vercel projects from the same GitHub repo.

### A. Postgres on Vercel (Neon)

Vercel no longer ships its own Postgres. Use **Neon** from the Marketplace:

1. Open [Vercel Marketplace → Neon](https://vercel.com/marketplace/neon) → **Install**.
2. Create a new database (or link an existing Neon account).
3. Connect that storage resource to the **backend** Vercel project so `DATABASE_URL` is injected.
4. For local development, copy the same `DATABASE_URL` into `backend/.env`.

CLI option (after `npm i -g vercel` and login):

```bash
cd backend
vercel link
vercel install neon --name kpc-reports --plan free -e production -e preview -e development
vercel env pull .env
```

### B. Backend project

- Root Directory: `backend`
- Framework: Other
- Env vars:
  - `DATABASE_URL` — from Vercel Postgres / Neon
  - `JWT_SECRET` — long random string
  - `CORS_ORIGIN` — your frontend URL, e.g. `https://kpc-reports.vercel.app`
- After first deploy, run migrations/seed once:

```bash
cd backend
DATABASE_URL="..." npx prisma db push
DATABASE_URL="..." npm run db:seed
```

Or use Vercel CLI:

```bash
cd backend
vercel env pull .env.production
npx prisma db push
npm run db:seed
```

### C. Frontend project

- Root Directory: `frontend`
- Framework: Next.js
- Env vars:
  - `NEXT_PUBLIC_API_URL` — backend URL + `/api`, e.g. `https://kpc-reports-api.vercel.app/api`

Redeploy frontend after setting the API URL.

## API overview

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/login` | public | Sign in |
| GET | `/api/auth/me` | auth | Current user |
| GET | `/api/projects` | auth | List folders |
| POST | `/api/projects` | admin | Create folder |
| GET | `/api/projects/:id` | auth | Folder + reports |
| DELETE | `/api/projects/:id` | admin | Delete folder |
| POST | `/api/reports/project/:projectId` | admin | Create report |
| GET | `/api/reports/:id` | auth | Read report |
| PATCH | `/api/reports/:id` | admin | Update report |
| DELETE | `/api/reports/:id` | admin | Delete report |

## Taste skill

Installed at `.agents/skills/design-taste-frontend`.

Design direction saved under `.taste-skill/app` (achromatic ledger, Geist, open plane, blue data hue `#1d5fbf`).
