import { CreateLearnerDto, nameSchema, notesSchema, timezoneFieldSchema } from '@halaqa/shared';
import { z, type ZodType } from 'zod';

export type StudentMainInfoFormValues = Pick<CreateLearnerDto, 'name' | 'timezone'> & {
  notes: string;
};

export const studentMainInfoFormSchema = z.intersection(
  z.object({
    name: nameSchema(),
    notes: notesSchema(),
  }),
  timezoneFieldSchema()
) satisfies ZodType<StudentMainInfoFormValues>;
