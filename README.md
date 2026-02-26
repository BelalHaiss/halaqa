# Halaqa

Halaqa is a monorepo application for managing Quran study groups, sessions, and attendance.

## What Users Can Do

- Manage study groups and assign tutors/students
- Schedule sessions with timezone-aware rules
- Track attendance and session status
- Use role-based access for admin, moderator, tutor, and student flows

## Monorepo Structure

- `apps/client`: React 19 + Vite + Tailwind CSS v4
- `apps/backend`: NestJS + Prisma + MySQL
- `packages/shared`: shared DTOs, enums, and utilities

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure backend environment (if needed):

```bash
cp apps/backend/.env.example apps/backend/.env
```

3. Start MySQL:

```bash
docker compose up -d
```

4. Run database migrations:

```bash
pnpm --filter @halaqa/backend exec prisma migrate dev
```

5. Seed sample data (optional):

```bash
pnpm --filter @halaqa/backend exec prisma db seed
```

6. Start the monorepo:

```bash
pnpm run dev
```

## Local URLs

- Client: `http://localhost:3000`
- API: `http://localhost:5000/api`
- MySQL: `localhost:3305`

## Seeded Login Accounts

- `admin` / `12345678`
- `moderator` / `12345678`
- `tutor` / `12345678`

## Useful Commands

Root:

```bash
pnpm run dev
pnpm run build
pnpm run lint
pnpm run typecheck
```

Run one app only:

```bash
pnpm --filter @halaqa/client dev
pnpm --filter @halaqa/backend dev
```
