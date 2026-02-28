import { CreateLearnerDto, QueryLearnersDto, UpdateLearnerDto } from '@halaqa/shared';
import { paginationSchema } from 'src/utils/validation/api.schema';
import { nameSchema, notesSchema } from 'src/utils/validation/fields.schema';
import {
  optionalTimezoneFieldSchema,
  timezoneFieldSchema,
} from 'src/utils/validation/timezone.schema';
import z, { ZodType } from 'zod';

const learnerContactSchema = z.object({
  notes: notesSchema.optional(),
});

const createLearnerBaseSchema = z.object({
  name: nameSchema,
  contact: learnerContactSchema.optional(),
});

export const createLearnerSchema = z.intersection(
  createLearnerBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<CreateLearnerDto>;

const updateLearnerBaseSchema = z.object({
  name: nameSchema.optional(),
  contact: learnerContactSchema.optional(),
});

export const updateLearnerSchema = z
  .intersection(updateLearnerBaseSchema, optionalTimezoneFieldSchema)
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }) satisfies ZodType<UpdateLearnerDto>;

export const queryLearnersSchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
}) satisfies ZodType<QueryLearnersDto>;
