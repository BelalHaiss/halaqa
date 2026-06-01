---
applyTo: 'apps/client/**'
---

# Client Architecture

## Module Structure

- One feature = one module under `src/modules/[module]/`
- `src/components/ui` is app-wide generic primitives only — no feature logic
- Each module owns its components; expose them via `src/modules/[module]/index.ts`
- Never deep-import across modules — consume public exports only
- Types from `@halaqa/shared` or module-local only
- All user-facing UI text must be Arabic-only

## MVVM

- **View** = JSX only, no logic
- **ViewModel** = hooks or `view-model/` files — all state, actions, derived values
- Views receive only prepared state and handlers
- Components are small, focused, and atomic (atoms → molecules → organisms within a module)

## Forms

See `forms.instructions.md` for full Zod/schema conventions. Client-specific rules:

- react-hook-form on every form, small or large
- Always call schema factories with no arguments (uses default `'ar'` locale)
- `useForm<Dto>` — use the shared DTO as the form generic, not a separate interface
- Use `FormField` from `src/components/forms/form-field.tsx` for dynamic fields
- Extend shared schemas in `modules/[module]/utils/[module].validation.ts` — never redefine them

## Data Fetching

- GET requests → `useApiQuery` only
- Mutations → `useApiMutation` only
- Query keys are centralized — never inline
- Every mutation must invalidate the relevant cache entries
- Never use raw TanStack Query hooks

## Mutations

- Every mutation requires a `ConfirmDialog` before executing
- Fire a `toast` on success and on error after every mutation

## Forbidden

- No `useEffect` unless absolutely no safer alternative exists
- No raw `fetch` or `axios` calls — always go through the API hooks

## Pagination

- we have PaginationControls component that takes care of pagination UI and logic
