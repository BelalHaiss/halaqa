export type InteractiveVariant = 'solid' | 'ghost' | 'outline' | 'soft';

export type InteractiveColor = 'primary' | 'success' | 'danger' | 'muted';

export type InteractiveVariantProps = {
  variant?: InteractiveVariant;
  color?: InteractiveColor;
};

