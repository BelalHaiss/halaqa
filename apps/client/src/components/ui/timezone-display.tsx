import { getTimezoneLabel, TIMEZONES } from '@halaqa/shared';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

/**
 * Converts a two-letter country code to a flag emoji
 * Example: 'EG' -> '🇪🇬', 'SA' -> '🇸🇦'
 */
const getCountryFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍';
  }
  const codePoints = [...countryCode.toUpperCase()].map(
    (char) => 127397 + char.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
};

const timezoneDisplayVariants = cva(
  'inline-flex items-center gap-1.5 transition-colors rounded-md',
  {
    variants: {
      variant: {
        solid: '',
        ghost: '',
        outline: 'border',
        soft: 'border'
      },
      color: {
        primary: '',
        success: '',
        danger: '',
        muted: ''
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-1.5 text-sm',
        lg: 'px-3 py-2 text-base'
      }
    },
    compoundVariants: [
      // Solid variants
      {
        variant: 'solid',
        color: 'primary',
        className: 'bg-primary text-primary-foreground'
      },
      {
        variant: 'solid',
        color: 'success',
        className: 'bg-success text-success-foreground'
      },
      {
        variant: 'solid',
        color: 'danger',
        className: 'bg-danger text-danger-foreground'
      },
      {
        variant: 'solid',
        color: 'muted',
        className: 'bg-muted text-muted-foreground'
      },

      // Ghost variants
      {
        variant: 'ghost',
        color: 'primary',
        className: 'text-primary'
      },
      {
        variant: 'ghost',
        color: 'success',
        className: 'text-success'
      },
      {
        variant: 'ghost',
        color: 'danger',
        className: 'text-danger'
      },
      {
        variant: 'ghost',
        color: 'muted',
        className: 'text-muted-foreground'
      },

      // Outline variants
      {
        variant: 'outline',
        color: 'primary',
        className: 'border-primary/20 text-primary bg-background'
      },
      {
        variant: 'outline',
        color: 'success',
        className: 'border-success/20 text-success bg-background'
      },
      {
        variant: 'outline',
        color: 'danger',
        className: 'border-danger/20 text-danger bg-background'
      },
      {
        variant: 'outline',
        color: 'muted',
        className: 'border-border text-muted-foreground bg-background'
      },

      // Soft variants
      {
        variant: 'soft',
        color: 'primary',
        className: 'bg-primary/10 border-primary/20 text-primary'
      },
      {
        variant: 'soft',
        color: 'success',
        className: 'bg-success/10 border-success/20 text-success'
      },
      {
        variant: 'soft',
        color: 'danger',
        className: 'bg-danger/10 border-danger/20 text-danger'
      },
      {
        variant: 'soft',
        color: 'muted',
        className: 'bg-muted/30 border-border text-muted-foreground'
      }
    ],
    defaultVariants: {
      variant: 'soft',
      color: 'muted',
      size: 'sm'
    }
  }
);

const flagVariants = cva('flex items-center justify-center', {
  variants: {
    size: {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl'
    }
  },
  defaultVariants: {
    size: 'sm'
  }
});

const labelVariants = cva('font-medium', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    }
  },
  defaultVariants: {
    size: 'sm'
  }
});

export interface TimezoneDisplayProps extends VariantProps<
  typeof timezoneDisplayVariants
> {
  /**
   * IANA timezone identifier (e.g., 'Africa/Cairo', 'Asia/Riyadh')
   */
  timezone: string;
  /**
   * Whether to show the flag emoji
   * @default true
   */
  showFlag?: boolean;
  /**
   * Whether to show the globe icon as fallback
   * @default false
   */
  showGlobeIcon?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * TimezoneDisplay - A reusable component to display timezone with country flag and label
 *
 * @example
 * ```tsx
 * <TimezoneDisplay timezone="Africa/Cairo" variant="soft" color="muted" size="sm" />
 * <TimezoneDisplay timezone="Asia/Riyadh" variant="solid" color="primary" size="md" />
 * ```
 */
export function TimezoneDisplay({
  timezone,
  showFlag = true,
  showGlobeIcon = false,
  variant = 'soft',
  color = 'muted',
  size = 'sm',
  className
}: TimezoneDisplayProps) {
  // Find timezone data
  const timezoneData = TIMEZONES.find((tz) => tz.value === timezone);
  const label = getTimezoneLabel(timezone);
  const countryCode = timezoneData?.country;
  const flagEmoji = countryCode ? getCountryFlagEmoji(countryCode) : null;

  return (
    <div
      className={cn(
        timezoneDisplayVariants({ variant, color, size }),
        className
      )}
      title={timezone}
    >
      {showFlag && flagEmoji ? (
        <span className={flagVariants({ size })} role='img' aria-label={label}>
          {flagEmoji}
        </span>
      ) : showGlobeIcon ? (
        <Globe
          className={cn(
            'shrink-0',
            size === 'sm' && 'w-3 h-3',
            size === 'md' && 'w-4 h-4',
            size === 'lg' && 'w-5 h-5'
          )}
        />
      ) : null}
      <span className={labelVariants({ size })}>{label}</span>
    </div>
  );
}
