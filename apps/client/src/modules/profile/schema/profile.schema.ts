import { z } from "zod";
import { timezoneFieldSchema } from "@/lib/validation/timezone.schema";

/**
 * Schema for updating user profile
 */
const profileBaseSchema = z.object({
  username: z
    .string()
    .min(1, "اسم المستخدم مطلوب")
    .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
});

export const profileSchema = z.intersection(
  profileBaseSchema,
  timezoneFieldSchema,
);

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
