import { DEFAULT_TIMEZONE, TIMEZONES } from "@halaqa/shared";
import { z } from "zod";

/**
 * Schema for updating user profile
 */
export const profileSchema = z.object({
  username: z
    .string()
    .min(1, "اسم المستخدم مطلوب")
    .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),

  timezone: z
    .string()
    .refine(
      (val) => TIMEZONES.some((tz) => tz.value === val),
      "يرجى اختيار منطقة زمنية صحيحة",
    )
    .default(DEFAULT_TIMEZONE),
});

/**
 * Schema for changing password
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: z
      .string()
      .min(8, "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمة المرور غير متطابقة",
    path: ["confirmPassword"],
  });

export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
