import { formatDate, getNowAsUTC, UpdateSessionActionDTO } from '@halaqa/shared';
import { z } from 'zod';
import { isoDateOnlySchema, timeMinutesSchema } from '@/lib/validation/fields.schema';

export type RescheduleFormData = Omit<
  Required<Pick<UpdateSessionActionDTO, 'date' | 'time'>>,
  'date'
> & {
  date: string;
};

const baseRescheduleSchema = z.object({
  date: isoDateOnlySchema,
  time: timeMinutesSchema,
}) satisfies z.ZodType<RescheduleFormData>;

const getTodayDateInTimezone = (timezone: string): string =>
  formatDate({
    date: getNowAsUTC(),
    token: 'yyyy-LL-dd',
    timezone,
  });

export const createRescheduleSchema = (timezone: string) =>
  baseRescheduleSchema.superRefine((data, ctx) => {
    const todayDate = getTodayDateInTimezone(timezone);

    if (data.date < todayDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: 'لا يمكن اختيار تاريخ سابق',
      });
    }
  });
