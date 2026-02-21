import { fromUTC } from '@halaqa/shared';

export type SeededSessionScheduleDay = {
  dayOfWeek: number;
  startMinutes: number;
  durationMinutes: number;
};

/**
 * Build a schedule day in group timezone from a UTC instant.
 * Useful for deterministic test seeding around timezone boundaries.
 */
export function seededScheduleDayFromUtc(args: {
  utcIso: string;
  timezone: string;
  durationMinutes?: number;
}): SeededSessionScheduleDay {
  const localDateTime = fromUTC(args.utcIso, args.timezone);
  const dayOfWeek = localDateTime.weekday === 7 ? 0 : localDateTime.weekday;
  const startMinutes = localDateTime.hour * 60 + localDateTime.minute;

  return {
    dayOfWeek,
    startMinutes,
    durationMinutes: args.durationMinutes ?? 60,
  };
}
