import { DateTime } from 'luxon';
import {
  ISODateOnlyString,
  ISODateString,
  MinutesFromMidnight,
  TimeMinutes,
  TimeHHMMString,
} from '../types/api.types';

export type DateInput = string | Date;

export type FormatDateParams = {
  date: DateInput;
  token: string;
  timezone?: string;
  locale?: string;
};

export function getNowAsUTC(): string {
  return DateTime.utc().toISO() || '';
}

export function formatDate({ date, token, timezone, locale }: FormatDateParams): string {
  const parsedDate =
    date instanceof Date ? DateTime.fromJSDate(date) : DateTime.fromISO(date, { setZone: true });
  const zonedDate = timezone ? parsedDate.setZone(timezone) : parsedDate.toUTC();
  const localizedDate = locale ? zonedDate.setLocale(locale) : zonedDate;

  return localizedDate.toFormat(token);
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
 * Format UTC Date to user timezone date and time
 * @param startedAt - UTC date (string or Date object)
 * @param timezone - IANA timezone
 * @returns Object with date (YYYY-MM-DD) and time as minutes from midnight
 */
export function formatSessionDateAndTime(startedAt: Date | string, timezone: string) {
  const utcString = startedAt instanceof Date ? startedAt.toISOString() : startedAt;
  const dateTime = fromUTC(utcString, timezone);
  const timeMinutes = dateTime.hour * 60 + dateTime.minute;

  return {
    date: dateTime.toFormat('yyyy-LL-dd') as ISODateOnlyString,
    time: timeMinutes as TimeMinutes,
  };
}

/**
 * Format any ISO date string to date and time based on user timezone
 * @param isoDate - ISO date string
 * @param timezone - IANA timezone
 * @returns Object with date string and time as TimeMinutes
 */
export function formatISODateToUserTimezone(
  isoDate: ISODateString,
  timezone: string
): { date: string; time: TimeMinutes } {
  return formatSessionDateAndTime(isoDate, timezone);
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
    endAsJSDate: endOfDay.toUTC().toJSDate(),
  };
}

/**
 * Combine date and time (as minutes from midnight) in timezone, return as UTC
 * @param dateStr - Date string (YYYY-MM-DD)
 * @param timeMinutes - Minutes from midnight (0-1439)
 * @param timezone - IANA timezone
 * @returns UTC ISO string
 */
export function combineDateTime(
  dateStr: string,
  timeMinutes: TimeMinutes,
  timezone: string
): string {
  const date = DateTime.fromISO(dateStr, { zone: timezone });
  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;
  return date.set({ hour: hours, minute: minutes }).toUTC().toISO()!;
}

/**
 * Convert minutes from midnight to 12-hour formatted time string with Arabic AM/PM
 * @param timeMinutes - Minutes from midnight (0-1439)
 * @returns Formatted time string (e.g., "02:30 م")
 */
export function minutesToTimeString(timeMinutes: TimeMinutes): TimeHHMMString {
  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;

  // Convert to 12-hour format
  const period = hours >= 12 ? 'م' : 'ص';
  const hours12 = hours % 12 || 12;

  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )} ${period}` as TimeHHMMString;
}

/**
 * Convert time string (HH:mm) to minutes from midnight
 * @param timeStr - Time string in 24-hour format (e.g., "14:30")
 * @returns Minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): TimeMinutes {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60 + minutes) as TimeMinutes;
}

/**
 * Convert minutes from midnight to 24-hour time string for input fields
 * @param timeMinutes - Minutes from midnight (0-1439)
 * @returns 24-hour time string (e.g., "14:30")
 */
export function minutesToInputTimeString(timeMinutes: TimeMinutes): string {
  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function startMinutesToTime(startMinutes: MinutesFromMidnight): TimeHHMMString {
  return minutesToTimeString(startMinutes as TimeMinutes);
}

/**
 * Format date to short month name in Arabic
 * @param date - JavaScript Date object
 * @returns Short month name (e.g., "يناير")
 */
export function formatMonthShort(date: Date): string {
  const dt = DateTime.fromJSDate(date).setLocale('ar-SA');
  return dt.toFormat('MMM');
}

/**
 * Format date to weekday name in Arabic
 * @param date - JavaScript Date object
 * @returns Short weekday name (e.g., "الأحد")
 */
export function formatWeekdayName(date: Date): string {
  const dt = DateTime.fromJSDate(date).setLocale('ar-SA');
  return dt.toFormat('ccc');
}

/**
 * Format date to month and year in Arabic
 * @param date - JavaScript Date object
 * @returns Full month and year (e.g., "يناير 2026")
 */
export function formatMonthYear(date: Date): string {
  const dt = DateTime.fromJSDate(date).setLocale('ar-SA');
  return dt.toFormat('MMMM yyyy');
}

/**
 * Parse date string (YYYY-MM-DD) to Date object
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns JavaScript Date object or undefined
 */
export function parseDateString(dateStr: string): Date | undefined {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return undefined;

  return new Date(year, month - 1, day);
}

/**
 * Format Date object to YYYY-MM-DD string
 * @param date - JavaScript Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateToISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to Arabic long format for display
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Arabic formatted date (e.g., "الأحد، 21 فبراير 2026")
 */
export function formatDateLongArabic(dateStr: string): string {
  const date = parseDateString(dateStr);
  if (!date) return dateStr;
  const dt = DateTime.fromJSDate(date).setLocale('ar-SA');
  return dt.toLocaleString({
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format ISO date string to short date format (DD/MM/YYYY)
 * @param isoDate - ISO date string
 * @param timezone - IANA timezone
 * @returns Short date format (e.g., "21/02/2026")
 */
export function formatDateShort(isoDate: ISODateString, timezone: string): string {
  const dt = DateTime.fromISO(isoDate).setZone(timezone);
  return dt.toFormat('dd/MM/yyyy');
}
