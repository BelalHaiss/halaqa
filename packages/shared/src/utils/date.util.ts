import { DateTime } from 'luxon';

export type DateInput = string | Date;

export type DateFormatToken =
  | 'ISO_UTC'
  | 'DATE_MED'
  | 'TIME_SIMPLE'
  | 'ISO_DATE'
  | 'WEEKDAY_INDEX'
  | 'DATE_WITH_WEEKDAY'
  | 'MONTH_YEAR'
  | `SHIFT_DAYS:${number}`
  | `ISO_UTC:${string}`
  | `DATE_MED:${string}`
  | `TIME_SIMPLE:${string}`
  | `ISO_DATE:${string}`
  | `WEEKDAY_INDEX:${string}`
  | `DATE_WITH_WEEKDAY:${string}`
  | `DATE_WITH_WEEKDAY:${string}:${string}`
  | `MONTH_YEAR:${string}`
  | `MONTH_YEAR:${string}:${string}`;

const DEFAULT_LOCALE = 'ar-SA';

export function getNowAsUTC(): string {
  return DateTime.utc().toISO() || '';
}

export function formatDate(date: DateInput, formatToken: DateFormatToken): string {
  const [token, value, locale] = formatToken.split(':');
  const parsedDate =
    date instanceof Date
      ? DateTime.fromJSDate(date)
      : DateTime.fromISO(date, { setZone: true });
  const zonedDate = value ? parsedDate.setZone(value) : parsedDate.toUTC();

  switch (token) {
    case 'SHIFT_DAYS':
      return parsedDate.toUTC().plus({ days: Number(value || '0') }).toISO() || '';
    case 'ISO_UTC':
      return parsedDate.toUTC().toISO() || '';
    case 'DATE_MED':
      return zonedDate.toLocaleString(DateTime.DATE_MED);
    case 'TIME_SIMPLE':
      return zonedDate.toLocaleString(DateTime.TIME_SIMPLE);
    case 'ISO_DATE':
      return zonedDate.toISODate() || '';
    case 'WEEKDAY_INDEX': {
      const weekday = zonedDate.weekday;
      return String(weekday === 7 ? 0 : weekday);
    }
    case 'DATE_WITH_WEEKDAY':
      return zonedDate.setLocale(locale || DEFAULT_LOCALE).toLocaleString({
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'MONTH_YEAR':
      return zonedDate.setLocale(locale || DEFAULT_LOCALE).toFormat('LLLL yyyy');
    default:
      return zonedDate.toISO() || '';
  }
}

export function timeToStartMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function startMinutesToTime(startMinutes: number): string {
  const hours = Math.floor(startMinutes / 60);
  const minutes = startMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function buildSessionStartedAtUTC(
  isoDate: string,
  timezone: string,
  startMinutes: number
): string {
  const hours = Math.floor(startMinutes / 60);
  const minutes = startMinutes % 60;

  return (
    DateTime.fromISO(isoDate, { zone: timezone })
      .set({ hour: hours, minute: minutes })
      .toUTC()
      .toISO() || ''
  );
}
