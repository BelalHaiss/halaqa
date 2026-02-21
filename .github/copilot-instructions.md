# Halaqa - manage quran study groups with ease

## 🏗️ Structure

**Monorepo:** `apps/client` (React), `apps/backend` (NestJS), `packages/shared` (DTOs only)

---

## 🌍 Global

- **Single source of truth** → `packages/shared`
- No DTO duplication
- Customize types via `Pick` / `Omit` / `Partial` only
- Client & backend share contracts

---

## ⚛️ Client Stack

React 19, Vite, TS, Tailwind v4, shadcn/ui, React Router v7

---

## 📦 Client Architecture

- **One feature = one module**
- Modules live in `src/modules/*`
- No cross-module imports
- Shared UI → `src/components/ui`
- Types → `@halaqa/shared` or module-local

---

## 🔐 Schemas

- Zod only in `schema/`
- Must match shared DTOs
- Always `satisfies ZodType<SharedDto>`
- DTO edits via TS utility types only

---

## 📋 Forms

- you must use react-hook-form for any forms small or large
- Use `FormField` for dynamic fields
- Lives in `src/components/forms/form-field.tsx`

---

## 🎨 MVVM

- **View** = JSX only
- **ViewModel** = logic/state
- No logic in components
- Small, focused components

---

## 🎨 Design / Tailwind

- `index.css` = Tailwind source
- Tokens only, no arbitrary values
- Minimal layout classes
- No shadcn overrides

---

## 🧩 shadcn

- shadcn only (via MCP)
- Use CVA for variants/colors
- Extend before creating

---

## 📝 Components / HTML

- No native HTML elements
- Always use reusable components or shadcn
- Single source of truth
- No inline styles
- make sure code is not too long and make it simple and readable and follow react best practices and patterns

---

## 🎯 Component Variants

- Every visual component requires:
  - `variant`: solid | ghost | outline | soft
  - `color`: primary | success | danger | muted
- Use `compoundVariants` for all styling
- variant + color handled ONLY via compoundVariants

---

## 🔄 Data Fetching

- **GET** → `useApiQuery`
- **Mutations** → `useApiMutation`
- Query keys centralized
- Mutations invalidate cache
- No raw TanStack hooks

---

## ⚠️ Mutations

- All mutations require `ConfirmDialog` Component
- No execution without confirmation
- after mutation fire `toast` with success or error message

## ⚠️ Forbidden Practices

- No UseEffect unless its no other option

---

## 🔧 Backend

- always use existing modules if exist or create with Nest CLI `nest g res modules/[name] --no-spec`
- Shared DTOs only
- `DatesAsObjects` backend-only
- Zod schema must satisfy shared DTOs
- we have 2 global guards applied AuthGuard, RolesGuard but we have decorators for customization them
- we have zod-validation pipe for any DTO or Query and it should only applied Route parameter not route handler
- we have user decorator that extract user info from request and attach it to request object use it in your controllers don't add any custom logic
- must use prisma transactions for multi-step operations or operations that modify multiple tables
- Use an Orchestrator module for multi-domain workflows, and wrap all related writes in a single Prisma transaction for atomicity

---

## ✅ Review Checklist

- [ ] Module structure
- [ ] No duplicated types
- [ ] MVVM respected
- [ ] shadcn + CVA only
- [ ] Tokens + minimal Tailwind
- [ ] Standard API hooks
- [ ] Cache invalidation
- [ ] ConfirmDialog present

---

## 💡 Principles

- Modular, DRY, strict separation
- Consistency > creativity
- Simple, reusable
- No READMEs
- No `DatesAsObjects` on client

## important - for handling Date

Store all event timestamps in DB as UTC (DATETIME).

Every Group must have an IANA timezone (e.g., Africa/Cairo) — schedules depend on it.

Store schedule time as startMinutes (from midnight in Group.timezone); convert to UTC only when creating the actual DateTime.

Use Group.timezone for schedule/day-of-week logic.

Convert stored UTC → User.timezone only for UI display.

Always query date ranges based on User.timezone.

Return date values in responses exactly as stored in DB (UTC).

Use only shared date.util (Luxon-based) for all date logic.

Use only shared timezone.util for timezone operations.

Do not add any date/time libraries in client or backend apps.

we working with date we use this format "YYYY-MM-DD" (ISO date-only string) and time as a number (minutes from midnight), both interpreted in Group.timezone.
