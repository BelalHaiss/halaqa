import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type {
  InteractiveColor,
  InteractiveVariant,
} from "@/components/ui/interactive-variants";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        solid: "",
        ghost: "",
        outline: "",
        soft: "",
      },
      color: {
        primary: "",
        success: "",
        danger: "",
        muted: "",
        admin: "",
        moderator: "",
        tutor: "",
        student: "",
      },
    },
    compoundVariants: [
      {
        variant: "solid",
        color: "primary",
        className: "border-transparent bg-primary text-primary-foreground",
      },
      {
        variant: "solid",
        color: "success",
        className: "border-transparent bg-success text-success-foreground",
      },
      {
        variant: "solid",
        color: "danger",
        className: "border-transparent bg-danger text-danger-foreground",
      },
      {
        variant: "solid",
        color: "muted",
        className: "border-transparent bg-muted text-muted-foreground",
      },

      {
        variant: "outline",
        color: "primary",
        className: "bg-transparent border-primary/30 text-primary",
      },
      {
        variant: "outline",
        color: "success",
        className: "bg-transparent border-success/30 text-success",
      },
      {
        variant: "outline",
        color: "danger",
        className: "bg-transparent border-danger/30 text-danger",
      },
      {
        variant: "outline",
        color: "muted",
        className: "bg-transparent border-border text-foreground",
      },

      {
        variant: "ghost",
        color: "primary",
        className: "border-transparent text-primary hover:bg-primary/10",
      },
      {
        variant: "ghost",
        color: "success",
        className: "border-transparent text-success hover:bg-success/10",
      },
      {
        variant: "ghost",
        color: "danger",
        className: "border-transparent text-danger hover:bg-danger/10",
      },
      {
        variant: "ghost",
        color: "muted",
        className: "border-transparent text-muted-foreground hover:bg-accent",
      },

      {
        variant: "soft",
        color: "primary",
        className: "border-transparent bg-primary/10 text-primary",
      },
      {
        variant: "soft",
        color: "success",
        className: "border-transparent bg-success/10 text-success",
      },
      {
        variant: "soft",
        color: "danger",
        className: "border-transparent bg-danger/10 text-danger",
      },
      {
        variant: "soft",
        color: "muted",
        className: "border-transparent bg-muted text-muted-foreground",
      },
      {
        variant: "soft",
        color: "admin",
        className:
          "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      },
      {
        variant: "soft",
        color: "moderator",
        className:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      },
      {
        variant: "soft",
        color: "tutor",
        className:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      },
      {
        variant: "soft",
        color: "student",
        className:
          "border-transparent bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
      },
    ],
    defaultVariants: {
      variant: "soft",
      color: "muted",
    },
  },
);

function Badge({
  className,
  variant,
  color,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant as InteractiveVariant}
      data-color={color as InteractiveColor}
      className={cn(badgeVariants({ variant, color }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
