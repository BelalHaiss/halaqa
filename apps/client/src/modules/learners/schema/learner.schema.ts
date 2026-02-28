import { z, ZodType } from 'zod';
import { CreateLearnerDto } from '@halaqa/shared';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';
import { nameSchema, notesSchema } from '@/lib/validation/fields.schema';

/**
 * Base schema for learner contact information
 */
const learnerContactSchema = z.object({
  notes: notesSchema.optional(),
});

/**
 * Base schema for creating a learner (without timezone)
 */
const createLearnerBaseSchema = z.object({
  name: nameSchema,
  contact: learnerContactSchema.optional(),
});

/**
 * Schema for creating a learner
 * Combines base schema with timezone validation
 */
export const createLearnerSchema = z.intersection(
  createLearnerBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<CreateLearnerDto>;
