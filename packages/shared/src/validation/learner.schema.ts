import z, { ZodType } from 'zod';
import { CreateLearnerDto, QueryLearnersDto, UpdateLearnerDto } from '../learner.types';
import { getMessages, ValidationLocale } from './messages';
import { nameSchema, notesSchema } from './fields.schema';
import { optionalTimezoneFieldSchema, timezoneFieldSchema } from './timezone.schema';
import { paginationSchema } from './api.schema';

const learnerContactSchema = (locale: ValidationLocale = 'ar') =>
  z.object({ notes: notesSchema(locale).optional() });

export const createLearnerSchema = (locale: ValidationLocale = 'ar') =>
  z.intersection(
    z.object({
      name: nameSchema(locale),
      contact: learnerContactSchema(locale).optional(),
    }),
    timezoneFieldSchema(locale)
  ) satisfies ZodType<CreateLearnerDto>;

export const updateLearnerSchema = (locale: ValidationLocale = 'ar') => {
  const m = getMessages(locale);
  return z
    .intersection(
      z.object({
        name: nameSchema(locale).optional(),
        contact: learnerContactSchema(locale).optional(),
      }),
      optionalTimezoneFieldSchema(locale)
    )
    .refine((value) => Object.keys(value).length > 0, {
      message: m.atLeastOneField,
    }) satisfies ZodType<UpdateLearnerDto>;
};

export const queryLearnersSchema = (locale: ValidationLocale = 'ar') =>
  paginationSchema(locale).extend({
    search: z.string().trim().min(1).optional(),
  }) satisfies ZodType<QueryLearnersDto>;
