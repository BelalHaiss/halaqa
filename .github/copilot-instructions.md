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
- `src/components/ui` is only for generic, app-wide UI primitives (no feature/business logic)
- Every module owns its components inside `src/modules/[module]/components`
- Use Atomic Design inside modules (`atoms`, `molecules`, `organisms`) when needed
- If another module needs a component, export it from that module public API (`src/modules/[module]/index.ts`)
- Avoid deep cross-module imports; consume only module public exports
- Types → `@halaqa/shared` or module-local

---

## 🔐 zod Schemas in Client

- Zod only in `schema/`

- Zod schema must satisfy shared DTOs and reusable validation zod schema inside utils/validation folder so use from it or edit if needed

---

## 📋 Forms

- you must use react-hook-form for any forms small or large
- Use `FormField` for dynamic fields
- Lives in `src/components/forms/form-field.tsx`

---

## 🎨 MVVM

- **View** = JSX only
- **ViewModel** = logic/state/actions (usually in `hooks/` or `view-model/`)
- No business logic in View components
- View components receive prepared state/handlers from ViewModel
- Keep components small, focused, and easy to read
- Atomic Design for components
- Small, focused components

---

## 🎨 Design / Tailwind

- `index.css` = Tailwind source
- Tokens only, no arbitrary values
- Minimal layout classes
- use simple flex box with no much elements and wrapper just style the elements with tokens and CVA variants or make wrapper div if needed
- No shadcn overrides

---

## 🧩 shadcn

- shadcn only (via MCP)
- Use CVA for variants/colors for the components similar to button, badge, etc
- Extend before creating

---

## 📝 Components / HTML

- No native HTML elements
- Always use reusable components or shadcn
- Single source of truth
- No inline styles
- Keep code simple, readable, and short and no too much nesting and wrapper
- Follow React best practices and patterns

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

- No `useEffect` unless there is no safer alternative

## 🔧 Backend

- always use existing modules if exist or create with Nest CLI `nest g res modules/[name] --no-spec`
- Shared DTOs only
- `DatesAsObjects` backend-only
- Zod schema must satisfy shared DTOs and reusable validation zod schema inside utils/validation folder so use from it or edit if needed
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
