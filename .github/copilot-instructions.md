# Halaqa — Quran Study Group Manager

## Structure

**Monorepo:** `apps/client` (React 19, Vite, Tailwind v4), `apps/backend` (NestJS), `packages/shared` (DTOs + utils + validation schemas)

## Global Rules

- Single source of truth → `packages/shared`. No DTO duplication across apps.
- Customize shared types only via `Pick` / `Omit` / `Partial`.
- `DatesAsObjects` is backend-only. Client always receives `ISODateString`.
- User-facing UI copy must be Arabic-only across the client app.
- No READMEs.
- Start always with dto, shared, backend, client

## Scoped Instructions

Detailed rules live in `.github/instructions/`. Copilot loads them automatically per file path.

| File                            | Scope                                   |
| ------------------------------- | --------------------------------------- |
| `client.instructions.md`        | `apps/client/**`                        |
| `styling.instructions.md`       | `apps/client/**`                        |
| `backend.instructions.md`       | `apps/backend/**`                       |
| `date-handling.instructions.md` | `**` (global)                           |
| `api-database.instructions.md`  | `apps/backend/**`, `packages/shared/**` |
| `payment-instructions.md`       | `apps/backend/**`                       |

## Principles

- Modular, DRY, strict separation of concerns.
- Consistency over creativity.
- reusability and single source of truth via `packages/shared`. used also in zod schema and dto and backend .
- Keep code small, focused, and readable.

## Review Checklist

- [ ] No duplicated types — use `@halaqa/shared`
- [ ] Module structure followed
- [ ] MVVM respected (no logic in View)
- [ ] shadcn + CVA only, no inline styles
- [ ] Semantic Tailwind tokens, no arbitrary values
- [ ] `useApiQuery` / `useApiMutation` only
- [ ] Cache invalidated after mutations
- [ ] `ConfirmDialog` + `toast` on every mutation
