import {
  CreateLearnerDto,
  QueryLearnersDto,
  UpdateLearnerDto,
} from '@halaqa/shared';
import { paginationSchema } from 'src/utils/api.util.validation';
import {
  optionalTimezoneFieldSchema,
  timezoneFieldSchema,
} from 'src/utils/validation/timezone.schema';
import z, { ZodType } from 'zod';

const learnerContactSchema = z.object({
  notes: z.string().trim().max(2000).optional(),
});

const createLearnerBaseSchema = z.object({
  name: z.string().trim().min(2).max(100),
  contact: learnerContactSchema.optional(),
});

export const createLearnerSchema = z.intersection(
  createLearnerBaseSchema,
  timezoneFieldSchema,
) satisfies ZodType<CreateLearnerDto>;

const updateLearnerBaseSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
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
