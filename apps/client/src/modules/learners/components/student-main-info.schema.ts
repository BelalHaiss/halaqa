import { CreateLearnerDto } from '@halaqa/shared';
import { z, type ZodType } from 'zod';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';
import { nameSchema, notesSchema } from '@/lib/validation/fields.schema';

const studentMainInfoBaseSchema = z.object({
  name: nameSchema,
  notes: notesSchema,
});

export type StudentMainInfoFormValues = Pick<CreateLearnerDto, 'name' | 'timezone'> & {
  notes: string;
};

export const studentMainInfoFormSchema = z.intersection(
  studentMainInfoBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<StudentMainInfoFormValues>;
