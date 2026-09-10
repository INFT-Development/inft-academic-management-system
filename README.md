# Academic Management System

A centralized academic management platform for the Information Technology Department — organizations, role-based access (Super Admin / Admin / Teacher / Student), and student academic-record management with bulk import.

## Project structure

```
apps/
  server/   Express + Prisma + Supabase API
  web/      React + Vite frontend
packages/
  shared/   Shared TypeScript types & Zod schemas used by both apps
```

## Prerequisites

- Node.js 18+
- A Supabase project (used for auth and as the Postgres database)

## Quick start (shared team database)

If you've been given access to the team's shared Supabase database, you don't need to create your own project, run migrations, or seed data — just:

1. Install dependencies in both apps:

   ```bash
   cd apps/server && npm i
   cd ../web && npm i
   ```

2. Add the secrets files you were given:
   - `apps/server/.env`
   - `apps/web/.env` (if one was shared with you)

3. Run both dev servers (in separate terminals):

   ```bash
   cd apps/server && npm run dev
   cd apps/web && npm run dev
   ```

That's it — the frontend is at http://localhost:5173 and the API at http://localhost:5000.

## Setup (own Supabase project)

1. Install dependencies from the repo root (this is an npm workspaces monorepo):

   ```bash
   npm install
   ```

2. Configure the server's environment. Copy the example file and fill in your Supabase project's values:

   ```bash
   cp apps/server/.env.example apps/server/.env
   ```

   You'll need:
   - `DATABASE_URL` — pooled Postgres connection string (transaction mode)
   - `DIRECT_URL` — direct/session-mode Postgres connection string (used for migrations)
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key

3. Apply database migrations and generate the Prisma client:

   ```bash
   cd apps/server
   npx prisma migrate deploy
   npx prisma generate
   cd ../..
   ```

## Running

From the repo root:

```bash
npm run dev:server   # API on http://localhost:5000 (override with PORT in apps/server/.env)
npm run dev:web      # Frontend on http://localhost:5173
```

Run both in separate terminals for local development.

## Seeding sample data (optional)

The server includes seed scripts to quickly populate an organization with users:

```bash
cd apps/server
npm run seed               # generic seed
npm run seed:vidyalankar   # sample org with 1 super admin, 5 teachers, 30 students
```

Seeded users use the password `password` (see `apps/server/prisma/seedVidyalankar.ts` for emails).

## Using the app

1. **Register** an account, then either:
   - **Create an organization** (you become its Super Admin), or
   - **Join an organization** by name (you become a Student by default).
2. **Super Admin** can add Admins/Teachers, and manage the student roster.
3. **Admin** manages the student roster for their organization:
   - Add students individually, or **bulk import** via CSV/Excel (download the template first from the import page).
   - The import template includes an optional `email` column — if a student's email is filled in, their account links to that record automatically the moment they register or join, skipping the manual profile form.
4. **Student**:
   - On first login, if no pre-imported record auto-linked by email, you'll be asked for your roll number (to link a pre-imported record) or to fill in your academic details manually.
   - Once linked, view your academic details (roll number, year, semester, division, branch, batch, status) from **Profile**.

## Testing

```bash
cd apps/server
npm test
```

## Building

```bash
npm run build   # builds all workspaces
```
