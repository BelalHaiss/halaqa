import {
  UpdateSessionActionDTO
} from '@halaqa/shared';
import { z, type ZodType } from 'zod';
import { isoDateOnlySchema, timeMinutesSchema } from '@/lib/validation/fields.schema';

export type RescheduleFormData = Omit<
  Required<Pick<UpdateSessionActionDTO, 'date' | 'time'>>,
  'date'
> & {
  date: string;
};

export const rescheduleSchema = z.object({
  date: isoDateOnlySchema,
  time: timeMinutesSchema
}) satisfies ZodType<RescheduleFormData>;
