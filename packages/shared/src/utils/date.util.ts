import { DateTime } from 'luxon';
import {
  ISODateOnlyString,
  MinutesFromMidnight,
  TimeHHMMString
} from '../types/api.types';

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

export function formatDate(
  date: DateInput,
  formatToken: DateFormatToken
): string {
  const [token, value, locale] = formatToken.split(':');
  const parsedDate =
    date instanceof Date
      ? DateTime.fromJSDate(date)
      : DateTime.fromISO(date, { setZone: true });
  const zonedDate = value ? parsedDate.setZone(value) : parsedDate.toUTC();

  switch (token) {
    case 'SHIFT_DAYS':
      return (
        parsedDate
          .toUTC()
          .plus({ days: Number(value || '0') })
          .toISO() || ''
      );
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
        day: 'numeric'
      });
    case 'MONTH_YEAR':
      return zonedDate
        .setLocale(locale || DEFAULT_LOCALE)
        .toFormat('LLLL yyyy');
    default:
      return zonedDate.toISO() || '';
  }
}

export function timeToStartMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getTodayDayOfWeek(timezone: string): number {
  // Luxon uses 1-7 (Monday-Sunday), convert to 0-6 (Sunday-Saturday)
  const luxonDay = DateTime.now().setZone(timezone).weekday;
  return luxonDay === 7 ? 0 : luxonDay;
}

export function fromUTC(utcString: string, timezone: string): DateTime {
  return DateTime.fromISO(utcString, { zone: 'utc' }).setZone(timezone);
}

/**
 * Format UTC Date to user timezone date and time strings
 * @param startedAt - UTC date (string or Date object)
 * @param timezone - IANA timezone
 * @returns Object with date (YYYY-MM-DD) and time (HH:mm)
 */
export function formatSessionDateAndTime(
  startedAt: Date | string,
  timezone: string
) {
  const utcString =
    startedAt instanceof Date ? startedAt.toISOString() : startedAt;
  const dateTime = fromUTC(utcString, timezone);

  return {
    date: dateTime.toFormat('yyyy-LL-dd') as ISODateOnlyString,
    time: dateTime.toFormat('HH:mm') as TimeHHMMString
  };
}

/**
 * Get start and end of day in timezone
 * @param timezone - IANA timezone
 * @param date - Optional date string or DateTime (defaults to today)
 * @returns Object with DateTime and JS Date objects for start/end of day
 */
export function getStartAndEndOfDay(
  timezone: string,
  date?: string | DateTime
): {
  startAsDatetime: DateTime;
  startAsJSDate: Date;
  endAsDatetime: DateTime;
  endAsJSDate: Date;
} {
  let dt: DateTime;
  if (typeof date === 'string') {
    dt = DateTime.fromISO(date, { zone: timezone });
  } else if (date) {
    dt = date;
  } else {
    dt = DateTime.now().setZone(timezone);
  }

  const startOfDay = dt.startOf('day');
  const endOfDay = dt.endOf('day');

  return {
    startAsDatetime: startOfDay,
    endAsDatetime: endOfDay,
    startAsJSDate: startOfDay.toUTC().toJSDate(),
    endAsJSDate: endOfDay.toUTC().toJSDate()
  };
}

/**
 * Parse time string (HH:mm) and combine with date in timezone, return as UTC
 * @param dateStr - Date string
 * @param timeStr - Time string in HH:mm format
 * @param timezone - IANA timezone
 * @returns UTC ISO string
 */
export function combineDateTime(
  dateStr: string,
  timeStr: string,
  timezone: string
): string {
  const date = DateTime.fromISO(dateStr, { zone: timezone });
  const [hours, minutes] = timeStr.split(':').map(Number);
  return date.set({ hour: hours, minute: minutes }).toUTC().toISO()!;
}

export function startMinutesToTime(
  startMinutes: MinutesFromMidnight
): TimeHHMMString {
  const hours = Math.floor(startMinutes / 60);
  const minutes = startMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}` as TimeHHMMString;
}
