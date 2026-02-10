import { DateTime, DateTimeFormatOptions } from 'luxon';

/**
 * Date utility functions using Luxon
 * All timestamps stored in DB should be UTC
 * Groups have IANA timezone (e.g. Africa/Cairo)
 * Users may have optional timezone for display
 */

/**
 * Get current UTC timestamp for database storage
 * @returns ISO string in UTC
 */
export function getNowAsUTC(): string {
  return DateTime.utc().toISO()!;
}

/**
 * Convert a date to UTC for database storage
 * @param date - Date string, Date object, or Luxon DateTime
 * @returns ISO string in UTC
 */
export function toUTC(date: string | Date | DateTime): string {
  if (date instanceof DateTime) {
    return date.toUTC().toISO()!;
  }
  if (date instanceof Date) {
    return DateTime.fromJSDate(date).toUTC().toISO()!;
  }
  return DateTime.fromISO(date).toUTC().toISO()!;
}

/**
 * Convert UTC timestamp to specific timezone
 * @param utcDate - UTC date string
 * @param timezone - IANA timezone (e.g., 'Africa/Cairo')
 * @returns DateTime in specified timezone
 */
export function fromUTC(utcDate: string, timezone: string): DateTime {
  return DateTime.fromISO(utcDate, { zone: 'utc' }).setZone(timezone);
}

/**
 * Format date for display in user's timezone
 * @param utcDate - UTC date string
 * @param timezone - IANA timezone
 * @param format - Luxon format options
 * @returns Formatted date string
 */
export function formatDate(
  utcDate: string,
  timezone: string,
  format: DateTimeFormatOptions = DateTime.DATE_MED
): string {
  return fromUTC(utcDate, timezone).toLocaleString(format);
}

/**
 * Format time for display
 * @param utcDate - UTC date string
 * @param timezone - IANA timezone
 * @returns Formatted time string (e.g., "10:30 AM")
 */
export function formatTime(utcDate: string, timezone: string): string {
  return fromUTC(utcDate, timezone).toLocaleString(DateTime.TIME_SIMPLE);
}

/**
 * Format date and time for display
 * @param utcDate - UTC date string
 * @param timezone - IANA timezone
 * @returns Formatted date-time string
 */
export function formatDateTime(utcDate: string, timezone: string): string {
  return fromUTC(utcDate, timezone).toLocaleString(DateTime.DATETIME_MED);
}

/**
 * Get day of week (0-6, where 0 is Sunday)
 * @param utcDate - UTC date string
 * @param timezone - IANA timezone
 * @returns Day of week
 */
export function getDayOfWeek(utcDate: string, timezone: string): number {
  // Luxon uses 1-7 (Monday-Sunday), convert to 0-6 (Sunday-Saturday)
  const luxonDay = fromUTC(utcDate, timezone).weekday;
  return luxonDay === 7 ? 0 : luxonDay;
}

/**
 * Check if a date is today in specified timezone
 * @param utcDate - UTC date string
 * @param timezone - IANA timezone
 * @returns true if date is today
 */
export function isToday(utcDate: string, timezone: string): boolean {
  const date = fromUTC(utcDate, timezone);
  const today = DateTime.now().setZone(timezone);
  return date.hasSame(today, 'day');
}

/**
 * Get start of day in timezone (as UTC)
 * @param timezone - IANA timezone
 * @param date - Optional date (defaults to today)
 * @returns UTC ISO string for start of day
 */
export function getStartOfDay(timezone: string, date?: DateTime): string {
  const dt = date || DateTime.now().setZone(timezone);
  return dt.startOf('day').toUTC().toISO()!;
}

/**
 * Get end of day in timezone (as UTC)
 * @param timezone - IANA timezone
 * @param date - Optional date (defaults to today)
 * @returns UTC ISO string for end of day
 */
export function getEndOfDay(timezone: string, date?: DateTime): string {
  const dt = date || DateTime.now().setZone(timezone);
  return dt.endOf('day').toUTC().toISO()!;
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

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param utcDate - UTC date string
 * @param timezone - IANA timezone
 * @returns Relative time string
 */
export function getRelativeTime(utcDate: string, timezone: string): string {
  const date = fromUTC(utcDate, timezone);
  return date.toRelative() || '';
}

/**
 * Calculate duration between two dates
 * @param startUTC - Start date in UTC
 * @param endUTC - End date in UTC
 * @returns Duration object
 */
export function getDuration(startUTC: string, endUTC: string) {
  const start = DateTime.fromISO(startUTC);
  const end = DateTime.fromISO(endUTC);
  return end.diff(start, ['hours', 'minutes']);
}

/**
 * Get browser's timezone
 * @returns IANA timezone string
 */
export function getBrowserTimezone(): string {
  return DateTime.local().zoneName;
}
