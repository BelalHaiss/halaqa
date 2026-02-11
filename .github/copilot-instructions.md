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
- Types → `@ionsite/shared` or module-local

---

## 🔐 Schemas

- Zod only in `schema/`
- Must match shared DTOs
- Always `satisfies ZodType<SharedDto>`
- DTO edits via TS utility types only

---

## 📋 Forms

- react-hook-form for all forms
- Use `FormField` for dynamic fields
- Lives in `src/components/ui/form-field.tsx`

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

## ⚠️ Forbidden Practices

- No UseEffect unless its no other option

---

## 🔧 Backend

- Nest CLI modules if exist or create with `nest g res modules/[name] --no-spec`
- Shared DTOs only
- `DatesAsObjects` backend-only
- Zod schema must satisfy shared DTOs

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

- Always use Luxon for date/time operations (server + client).
- Store all event timestamps in DB as UTC (DATETIME, not TIMESTAMP).
- Every Group must have an IANA timezone (e.g. Africa/Cairo) — schedules are based on it.
- User timezone is optional (store it only if needed for UX/notifications); otherwise use browser timezone.
- For queries like “today / dayOfWeek / schedule” use Group.timezone.
- For display convert timestamps from UTC to User timezone (fallback to Group timezone).
