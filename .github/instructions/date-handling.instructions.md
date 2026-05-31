---
applyTo: '**'
---

# Date Handling

## Storage

- Store all timestamps in the DB as UTC `DATETIME`
- Schedule time is stored as `startMinutes` (minutes from midnight) in `Group.timezone`
- Convert `startMinutes` → UTC only when creating an actual session `DateTime`

## Timezones

- Use `Group.timezone` for all schedule and day-of-week logic
- Convert UTC → `User.timezone` only for UI display
- Query date ranges based on `User.timezone`
- Return dates in responses exactly as stored (UTC) — no transformation on output

## Formats

| Type                | Format          | Use                                |
| ------------------- | --------------- | ---------------------------------- |
| `ISODateOnlyString` | `"YYYY-MM-DD"`  | Date inputs, query params, periods |
| `TimeMinutes`       | integer 0–1439  | Schedule times in DTOs             |
| `ISODateString`     | full ISO string | DB/response timestamps             |
| `TimeHHMMString`    | `"HH:MM am/pm"` | UI display only                    |

## Utilities

- Use only `date.util` (Luxon-based) from `@halaqa/shared` for all date logic
- Use only `timezone.util` from `@halaqa/shared` for timezone operations
- Never add `moment`, `date-fns`, or any other date library to client or backend
