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
- we have 2 global guards applied AuthGuard, RolesGuard but we have decorators for customization them
- we have zod-validation pipe for any DTO or Query and it should only applied Route parameter not route handler

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

- Store all event timestamps in DB as UTC (DATETIME, not TIMESTAMP).
- Every Group must have an IANA timezone (e.g. Africa/Cairo) — schedules are based on it.
- For queries like “today / dayOfWeek / schedule” use Group.timezone.
- Schedule Definition → Store session time as startMinutes (minutes from midnight in Group.timezone) and convert to UTC only when creating the actual DateTime
- User Timezone (Display Layer) → Convert stored UTC DateTime to User.timezone only for UI display.
- in shared app we have date.util that has luxon helper method for working with date use it or edit it if needed don't add any date package or helper in client or backend app only this date.util should handle all date manipulation and conversion logic in the project.
