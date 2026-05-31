---
applyTo: 'apps/backend/**'
---

# Backend

## Modules

- Use existing modules when applicable
- Generate new modules with `nest g res modules/[name] --no-spec`
- Follow NestJS module structure: controller → service → module

## Guards & Decorators

- `AuthGuard` and `RolesGuard` are applied globally — do not re-apply them
- Use `@Public()` to bypass auth, `@Roles()` to restrict, `@User()` to extract the request user
- Never add custom auth logic inside controllers

## Validation

- Use `ZodValidationPipe` on route parameters and body parameters only — never on the route handler
- Import schemas from `@halaqa/shared` and call with `'en'` locale inline
- No local validation wrapper files

## DTOs

- All DTOs live in `packages/shared` — never duplicate or redefine them in the backend
- `DatesAsObjects<T>` is backend-only for Prisma result typing; never expose it to the client

## Database

- Use Prisma transactions for any operation that touches multiple tables
- Use the Orchestrator module (`src/modules/orchestrator/`) for cross-domain workflows
- Wrap all related writes in a single Prisma transaction for atomicity

## Zod Schemas

- Import all schemas from `@halaqa/shared`
- Extend in `modules/[module]/utils/[module].validation.ts` only when backend-specific rules are needed
