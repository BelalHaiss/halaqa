# Halaqa Management System - AI Coding Instructions

## Project Overview

**Monorepo Structure**: Quran memorization circle management system using **pnpm workspaces + Turborepo**.

```
/
├── apps/
│   ├── client/     # React 18 + TypeScript 5 frontend
│   └── backend/    # Backend API
├── packages/
│   └── shared/     # Shared types, schemas, utilities
└── turbo.json      # Turborepo configuration
```

**Client App**: React 18 + TypeScript 5, following **MVVM architecture**. UI is **RTL (Arabic)** using shadcn/ui + Tailwind CSS. Build tool: Vite 6 (SWC), dev server port: 3000, build outputs to `build/` (not `dist/`).

## Architecture: MVVM Pattern

Features live in `apps/client/src/modules/[feature]/` with three layers:

1. **Service** (`services/*.service.ts`) - Singleton classes, async methods returning `ApiResponse<T>`, currently using **mock data** (`new Promise` + `setTimeout`)
2. **ViewModel** (`viewmodels/*.viewmodel.ts`) - Custom React hooks managing state (useState + useEffect), call services, handle loading/error, return data + methods
3. **View** (`views/*View.tsx`) - Pure UI consuming ViewModels, handle loading states with `<Loader2 className="animate-spin" />`, errors with `<Alert variant="destructive">`

Structure: `services/` → `viewmodels/` → `views/` → `index.ts` (exports public API)

## Critical Conventions

### Import Paths - ALWAYS Use Aliases

**NEVER** use relative paths (`../../../`). Configured aliases: `@/`, `@/types`, `@/services`, `@/modules`, `@/components`, `@/lib`

### Type System - Single Source of Truth

**Shared Package is the Master**. All types and Zod schemas are defined in `packages/shared/src/` and imported via `@halaqa/shared`.

**Pattern**: Define Zod schema first in `packages/shared/src/[feature].types.ts`, then infer TypeScript type: `type User = z.infer<typeof UserSchema>`.

**Import Example**:

```typescript
// In client/backend - ALWAYS import from shared
import { User, UserSchema, CreateUserSchema } from '@halaqa/shared';

// NEVER re-declare types - use utility types for variations
type UserWithoutPassword = Omit<User, 'password'>;
type CreateUserDto = Pick<User, 'name' | 'email' | 'role'>;
```

For schema variations (e.g. Create/Update DTOs), derive from base Zod schema using `.pick()`/`.omit()` or TypeScript utility types. **NEVER** re-declare types manually. Validation messages in **Arabic**.

### Services Pattern

Classes with async methods returning `ApiResponse<T>` shape: `{ success, data?, error? }`. Export singleton instance. Use `apiClient.get/post/put/delete()` from `@/services`.

### ViewModels Pattern

Custom hooks with state: `isLoading`, `error`, `data`. Use `toast` from `sonner` for all feedback. No React Query yet (installed but unused) - use useState + useEffect.

### Views Pattern

Consume ViewModels, always check `isLoading` → show Loader2, check `error` → show Alert, then render data.

## Key Files & Critical Knowledge

### Authentication Flow

`LoginView.tsx` → React Hook Form + Zod → `useAuthViewModel()` → `authService.login()` → `storageService.saveUser()` + `saveToken()` → token auto-injected via `api-client.ts` interceptor (line 24).

**Test accounts**: `admin@halaqa.com`, `mod@halaqa.com`, `tutor1@halaqa.com` - password: `123456`

### API Client (`apps/client/src/services/api-client.ts`)

Axios wrapper with:

- Auto token injection from `localStorage.getItem('halaqa_token')`
- 401 handling → auto-logout + redirect to `/login`
- Base URL from `VITE_API_URL` env var (default: `http://localhost:3000/api`)
- Returns consistent `ApiResponse<T>`: `{ success: boolean, data?: T, error?: string }`

### Storage Service (`apps/client/src/services/storage.service.ts`)

Keys: `halaqa_user`, `halaqa_token`. Methods: `saveUser()`, `getUser()`, `saveToken()`, `getToken()`, `clearAll()`. **Never** use `localStorage` directly.

### Role-Based Access Control

Roles: `admin`, `moderator`, `tutor`. Check via `storageService.getUser()?.role`. Use `withRole()` HOC from `apps/client/src/hoc/withRole.tsx` for component protection.

## UI & Styling

- **RTL layout** - all user-facing text in Arabic
- **shadcn/ui** components in `apps/client/src/components/ui/` - **never import with version numbers** (e.g., `lucide-react` not `lucide-react@0.487.0`)
- **Icons**: `lucide-react` only
- **Toasts**: `toast` from `sonner` for all feedback (success, error, info)
- **Forms**: React Hook Form + `@hookform/resolvers/zod` + Zod schemas with `zodResolver()`

## Development Workflow

**Monorepo Commands (from root)**:

- `pnpm dev` - Start all apps in development mode (client + backend)
- `pnpm build` - Build all apps
- `pnpm lint` - Type check all apps

**Client-specific Commands** (from `apps/client/` or using filters):

- `pnpm --filter @halaqa/client dev` - Start only client dev server (port 3000)
- `pnpm --filter @halaqa/client build` - Build only client
- `pnpm --filter @halaqa/client lint` - Type check only client

**Quick Client Development**: `cd apps/client && pnpm dev`

## Migration Status

**Current**: `App.tsx` uses legacy components from `apps/client/src/components/*.tsx`. **New**: `App.new.tsx` uses MVVM modules (not active).

**Completed modules**: auth, dashboard, groups (use `apps/client/src/modules/groups/` as reference)
**Needs migration**: sessions, attendance, reports, users, learners

## Feature Creation Checklist

1. Define Zod schemas in `packages/shared/src/[feature].types.ts`
2. Create service class in `apps/client/src/modules/[feature]/services/[feature].service.ts`
3. Create ViewModel hook in `viewmodels/[feature].viewmodel.ts`
4. Create View component in `views/[Feature]View.tsx`
5. Export in module's `index.ts`
6. Use path aliases, handle loading/error, Arabic text, toast feedback

## Tech Stack

React 18, TypeScript 5, Vite 6 (SWC), React Router v7, Zod, Axios, shadcn/ui, Tailwind CSS, Radix UI, Sonner, Lucide icons, React Hook Form, Zustand (installed), React Query (installed but unused)
