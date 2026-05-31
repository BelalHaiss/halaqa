// ============================================================================
// DTOs (Public Types)
// ============================================================================

import { SUPPORTED_CURRENCIES } from './validation/fields.constants';

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export interface CurrencyAmountDto {
  amount: number;
  currency: CurrencyCode;
}
