---
applyTo: 'apps/backend/**, packages/shared/**'
---

# API Types & Database Utilities

## API Response Types

- All endpoints return `UnifiedApiResponse<T>` — never define response shapes inline
- Paginated endpoints return `PaginatedResult<T>` which extends `PaginationResponseMeta`
- `ApiErrorResponse` is for errors only — handled by the global exception filter, not manually

## DatabaseService Helpers

Always use these helpers from `DatabaseService` — never re-implement them:

- **`handleQueryPagination(query)`** — converts `page`/`limit` from query to `{ skip, take, page }`
- **`formatPaginationResponse({ page, count, limit })`** — builds `PaginationResponseMeta` from count + page info
- **`handleDateRangeFilter(query, timezone)`** — converts `fromDate`/`toDate` (ISODateOnlyString) to a `Prisma.DateTimeFilter` in UTC, returns `undefined` if neither is set

## Branded Types

| Type                | Usage                                                       |
| ------------------- | ----------------------------------------------------------- |
| `ISODateString`     | Full timestamp from DB / API responses                      |
| `ISODateOnlyString` | Date-only query params and period boundaries (`YYYY-MM-DD`) |
| `TimeMinutes`       | Schedule time in DTOs (0–1439, in Group.timezone)           |
| `TimeHHMMString`    | UI display only — never in DTOs or DB                       |

- `DatesAsObjects<T>` recursively converts `ISODateString` fields to `Date` objects — use it to type Prisma results in the backend only
- Never use `DatesAsObjects` in shared DTOs or client code

## Pagination Convention

- Query: `PaginationQueryType` (`page`, `limit` — both optional)
- Response meta always nested under `meta` key with `total`, `page`, `limit`, `totalPages`
- Response data always under `data` key

## Money

- Use `Prisma.Decimal` arithmetic (`.add()`, `.sub()`, `.mul()`, `.div()`) for all monetary calculations — never cast to `Number` before computing.

# Database Conventions

- All DB column names use **snake_case** via `@map("column_name")` — model field names stay camelCase
- All table names use **snake_case plural** via `@@map("table_name")`
- **Arabic text fields** that are searchable must have a companion `nameNormalized` / `*Normalized` field storing the output of `normalizeArabic()` from `@halaqa/shared`
- Normalize at **write time** (create + update) using `normalizeArabic()` — never normalize in migrations or raw SQL
- Search queries must run against the normalized field using `contains` — never against the raw display field
- The `normalizeArabic` utility lives in `packages/shared/src/utils/arabic.util.ts` — import only from `@halaqa/shared`
- Add `@@index([*Normalized])` for every normalized field used in `contains` queries
