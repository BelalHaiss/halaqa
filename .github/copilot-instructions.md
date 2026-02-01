## Project

Monorepo using **pnpm workspaces + Turborepo**

```
apps/
 ├─ client/   # React + TS (Arabic RTL UI)
 └─ backend/
packages/
 └─ shared/   # Zod schemas + inferred TS types (source of truth)
```

Client:

- Vite (SWC) — port `3000`
- Build output: `build/` (NOT `dist`)
- UI: Arabic + RTL, shadcn/ui + Tailwind

---

## Architecture (Client): MVVM

Each feature:

```
modules/<feature>/
 ├─ services/     # async class, ApiResponse<T>
 ├─ viewmodels/   # custom hooks (state + effects)
 ├─ views/        # pure UI components
 └─ index.ts
```

Flow: **Service → ViewModel → View**

---

## Hard Rules (No Exceptions)

### Imports

- ✅ Use aliases only: `@/`, `@/modules`, `@/services`, `@/components`
- ❌ No relative paths (`../../`)

### Types & Validation

- **All types & schemas come from `@halaqa/shared`**
- Model DTO Type in TS --> Zod Schema that satisfy this ts type
- Never re-declare types
- Validation messages **must be Arabic**

### Services

- Singleton class
- Return: `{ success, data?, error? }`
- Use `apiClient` only
- Mock data allowed (Promise + setTimeout)

### ViewModels

- Custom hooks
- Manage `isLoading`, `error`, `data`
- Use `toast` from `sonner`
- No React Query

### Views

- Loading → `<Loader2 className="animate-spin" />`
- Error → `<Alert variant="destructive" />`
- No business logic

---

## Auth & Storage

- Token + user stored via `storageService`
- Never use `localStorage` directly
- 401 → auto logout + redirect `/login`
- Roles: `admin | moderator | tutor`
- Protect UI with `withRole()`

---

## UI Rules

- Arabic text only
- RTL layout
- shadcn/ui components from local `components/ui`
- Icons: `lucide-react` only

---

## Feature Checklist

1. Zod schema in `packages/shared`
2. Service
3. ViewModel hook
4. View
5. Export from `index.ts`

---

## Conventions Rules

- any enum or union must be in capital letters like STATUS_ACTIVE not statusActive

## Optional

- shadcn **MCP server** may be used for scaffolding
- Generated code **must still follow all rules above**
