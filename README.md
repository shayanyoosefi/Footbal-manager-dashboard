# Academy Hub — Football Manager Dashboard

A Next.js web dashboard for football academy clubs with three roles:

| Role | Capabilities |
|------|----------------|
| **Manager** | Manage squad players, send predefined or custom questions, review responses |
| **Player** | View and answer questions from their coach |
| **Admin** | Full access: manage all users, maintain the global question library |

## Tech stack

- **Next.js 15** (App Router) + TypeScript
- **Prisma** + SQLite (swap to PostgreSQL in production)
- **NextAuth** (credentials)
- **Tailwind CSS 4**

## Getting started

```bash
npm install
npm run db:setup    # migrate + seed demo data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@academy.com | password123 |
| Manager | manager@academy.com | password123 |
| Player | player@academy.com | password123 |

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — SQLite file path (default `file:./dev.db`)
- `NEXTAUTH_SECRET` — random string for production
- `NEXTAUTH_URL` — app URL (e.g. `http://localhost:3000`)

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run db:setup` — push schema + seed
- `npm run db:seed` — re-seed demo data

## Project structure

```
src/
  app/
    admin/      # Admin routes
    manager/    # Manager routes
    player/     # Player routes
    login/
  components/
  lib/
    actions/    # Server actions
    auth.ts
prisma/
  schema.prisma
  seed.ts
```

## Production notes

- Replace SQLite with PostgreSQL (`provider = "postgresql"` in `schema.prisma`).
- Use a strong `NEXTAUTH_SECRET` and HTTPS.
- Consider email magic links or OAuth instead of password-only auth.
