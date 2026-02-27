import * as React from 'react';

import { cn } from '@/lib/utils';

type TypographyTag = 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2' | 'h3';
type TypographySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';

const typographySizeClasses: Record<TypographySize, string> = {
  xs: 'text-xs leading-5',
  sm: 'text-sm leading-6',
  md: 'text-base leading-7',
  lg: 'text-lg leading-7',
  xl: 'text-xl leading-8',
  '2xl': 'text-2xl leading-9'
};

const typographyWeightClasses: Record<TypographyWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

type TypographyProps = React.ComponentPropsWithoutRef<'p'> & {
  as?: TypographyTag;
  size?: TypographySize;
  weight?: TypographyWeight;
  className?: string;
};

function Typography({
  as = 'p',
  className,
  size = 'md',
  weight = 'regular',
  ...props
}: TypographyProps) {
  const Comp = as as React.ElementType;

  return (
    <Comp
      data-slot='typography'
      className={cn(
        'text-balance text-foreground',
        typographySizeClasses[size],
        typographyWeightClasses[weight],
        className
      )}
      {...props}
    />
  );
}

export { Typography };
