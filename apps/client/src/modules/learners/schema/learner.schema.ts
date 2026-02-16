import { z, ZodType } from 'zod';
import { CreateLearnerDto } from '@halaqa/shared';
import { timezoneFieldSchema } from '@/lib/validation/timezone.schema';

/**
 * Base schema for learner contact information
 */
const learnerContactSchema = z.object({
  notes: z.string().trim().max(2000, 'الملاحظات طويلة جدًا').optional()
});

/**
 * Base schema for creating a learner (without timezone)
 */
const createLearnerBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جدًا'),
  contact: learnerContactSchema.optional()
});

/**
 * Schema for creating a learner
 * Combines base schema with timezone validation
 */
export const createLearnerSchema = z.intersection(
  createLearnerBaseSchema,
  timezoneFieldSchema
) satisfies ZodType<CreateLearnerDto>;
