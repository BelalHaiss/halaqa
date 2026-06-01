---
applyTo: 'apps/client/**, apps/backend/**, packages/shared/**'
---

# Forms & Validation

## Single Source of Truth

- All Zod schemas live in `packages/shared/src/validation/` — never define them inline in the client or backend
- Every schema **must** `satisfies ZodType<Dto>` against its shared DTO to ensure type alignment
- The same DTO type is used as the `useForm<Dto>` generic in the client — no separate "form type" unless the form requires extra UI-only fields
- If the form has UI-only fields (e.g. display names, derived values), define a local `FormValues` type that extends the DTO and build a client-side schema in `modules/[module]/utils/[module].validation.ts` using `.extend()` on the shared field schemas

## Schema Conventions

### Locale parameter

Every schema factory **must** accept `locale: ValidationLocale = 'ar'` as its first parameter:

### Using messages

- Always call `const m = getMessages(locale)` at the top of each schema factory
- Pass `m.someKey` to every `.min()`, `.max()`, `.refine()`, `.superRefine()`, `.regex()`, and `.custom()` call
- Never hardcode string literals as error messages inside schemas — use `messages.ts` keys
- Add new message keys to `messages.ts` (both `ar` and `en`) before using them

### `satisfies ZodType<Dto>`

- Attach `satisfies ZodType<DtoType>` to every top-level schema export — this is a compile-time guard that the schema output matches the DTO
- For query/filter schemas that feed `PaginationQueryType` or other shared DTOs, also apply `satisfies`

### Field schemas

- Reuse shared field factories from `packages/shared/src/validation/fields.schema.ts` — do not recreate equivalent rules inline
- Prefer `nameSchema(locale)` over `z.string().min(2).max(100)` even if the limits happen to match
- Available shared field schemas: `nameSchema`, `usernameAccountSchema`, `passwordSchema`, `notesSchema`, `attendanceNotesSchema`, `descriptionSchema`, `nonEmptyIdSchema`, `tutorIdSchema`, `dayOfWeekSchema`, `durationMinutesSchema`, `isoDateOnlySchema`, `optionalIsoDateOnlySchema`, `timeMinutesSchema`

## Client-side Forms

### Setup

- Always call the schema factory with no arguments on the client (uses default `'ar'` locale)
- Never pass `'en'` on the client — Arabic messages are always required in the UI
- Use the shared DTO as the `useForm` generic: `useForm<CreateGroupDto>`

### Client-only form extensions

When the form needs UI-only fields not present in the DTO:

### Localization

- The client is **always Arabic** — never pass a locale argument to schema factories on the client
- All hardcoded message strings in client-only `.refine()` or `.superRefine()` calls must be Arabic
- Prefer adding the message to `messages.ts` and using `getMessages('ar').key` instead of an inline string, so the message stays consistent

## Backend-side Validation

- Always call schema factories with `'en'` in the backend — English messages are for API consumers
- Import schemas directly from `@halaqa/shared`
- Never create local validation wrapper files in the backend

## Adding New Schemas

1. Define the DTO type in the relevant `packages/shared/src/[domain].types.ts`
2. Add any new message keys to `packages/shared/src/validation/messages.ts` (both `ar` and `en`)
3. Create the schema in `packages/shared/src/validation/[domain].schema.ts`
4. Export from `packages/shared/src/index.ts`
5. Use `satisfies ZodType<Dto>` on the exported schema
6. In the client: `useForm<Dto>({ resolver: zodResolver(schema()) })`
7. In the backend: `new ZodValidationPipe(schema('en'))`

## Forbidden

- No inline `z.object(...)` schemas in views or controllers
- No duplicate message strings — every error message must come from `messages.ts`
- No `z.string().min(1, 'required')` — use a named field schema or add a messages key
- No schemas that omit `satisfies ZodType<Dto>` on the public export
- No `locale = 'en'` as the default — `'ar'` is always the default
