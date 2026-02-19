import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Role color mapping for badges
export const roleColorMap: Record<
  string,
  "admin" | "moderator" | "tutor" | "student"
> = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  TUTOR: "tutor",
  STUDENT: "student",
};
