export type InteractiveVariant = "solid" | "ghost" | "outline" | "soft";

export type InteractiveColor =
  | "primary"
  | "success"
  | "danger"
  | "muted"
  | "admin"
  | "moderator"
  | "tutor"
  | "student";

export type InteractiveVariantProps = {
  variant?: InteractiveVariant;
  color?: InteractiveColor;
};
