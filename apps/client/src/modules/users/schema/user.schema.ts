import { z } from "zod";
import {
  DEFAULT_TIMEZONE,
  TIMEZONES,
} from "../../../../../../packages/shared/src/utils/timestamps";

export const userSchema = z.object({
  name: z
    .string()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل")
    .max(50, "الاسم طويل جدًا"),

  username: z
    .string()
    .min(3, "اسم الحساب قصير جدًا")
    .regex(/^[a-zA-Z0-9_]+$/, "يسمح فقط بالحروف والأرقام و _"),

  role: z.enum(["ADMIN", "MODERATOR", "TUTOR", "STUDENT"]),
  timezone: z
    .string()
    .refine(
      (val) => TIMEZONES.some((tz) => tz.value === val),
      "يرجى اختيار منطقة زمنية صحيحة",
    )
    .default(DEFAULT_TIMEZONE),
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .optional()
    .or(z.literal("")), // allow empty on edit
});

export type UserFormSchema = z.infer<typeof userSchema>;
