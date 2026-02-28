// src/constants/timezones.ts

export interface TimezoneOption {
  value: string; // IANA timezone identifier
  label: string; // Arabic label
  country: string; // Country code
}

/**
 * Shared timezone constants for Arabic/African countries
 * Default: Africa/Cairo
 */
export const TIMEZONES: TimezoneOption[] = [
  // Egypt
  {
    value: 'Africa/Cairo',
    label: 'مصر',
    country: 'EG',
  },

  // Saudi Arabia
  {
    value: 'Asia/Riyadh',
    label: 'السعودية',
    country: 'SA',
  },
  {
    value: 'Asia/Makkah',
    label: 'السعودية',
    country: 'SA',
  },

  // UAE
  {
    value: 'Asia/Dubai',
    label: 'الإمارات',
    country: 'AE',
  },

  // Kuwait
  {
    value: 'Asia/Kuwait',
    label: 'الكويت',
    country: 'KW',
  },

  // Qatar
  {
    value: 'Asia/Qatar',
    label: 'قطر',
    country: 'QA',
  },

  // Bahrain
  {
    value: 'Asia/Bahrain',
    label: 'البحرين',
    country: 'BH',
  },

  // Oman
  {
    value: 'Asia/Muscat',
    label: 'عمان',
    country: 'OM',
  },

  // Jordan
  {
    value: 'Asia/Amman',
    label: 'الأردن',
    country: 'JO',
  },

  // Lebanon
  {
    value: 'Asia/Beirut',
    label: 'لبنان',
    country: 'LB',
  },

  // Syria
  {
    value: 'Asia/Damascus',
    label: 'سوريا',
    country: 'SY',
  },

  // Iraq
  {
    value: 'Asia/Baghdad',
    label: 'العراق',
    country: 'IQ',
  },

  // Palestine
  {
    value: 'Asia/Gaza',
    label: 'فلسطين',
    country: 'PS',
  },
  {
    value: 'Asia/Hebron',
    label: 'فلسطين',
    country: 'PS',
  },

  // Yemen
  {
    value: 'Asia/Aden',
    label: 'اليمن',
    country: 'YE',
  },

  // Libya
  {
    value: 'Africa/Tripoli',
    label: 'ليبيا',
    country: 'LY',
  },

  // Tunisia
  {
    value: 'Africa/Tunis',
    label: 'تونس',
    country: 'TN',
  },

  // Algeria
  {
    value: 'Africa/Algiers',
    label: 'الجزائر',
    country: 'DZ',
  },

  // Morocco
  {
    value: 'Africa/Casablanca',
    label: 'المغرب',
    country: 'MA',
  },

  // Sudan
  {
    value: 'Africa/Khartoum',
    label: 'السودان',
    country: 'SD',
  },

  // Somalia
  {
    value: 'Africa/Mogadishu',
    label: 'الصومال',
    country: 'SO',
  },

  // Turkey
  {
    value: 'Europe/Istanbul',
    label: 'تركيا',
    country: 'TR',
  },

  // Iran
  {
    value: 'Asia/Tehran',
    label: 'إيران',
    country: 'IR',
  },

  // Pakistan
  {
    value: 'Asia/Karachi',
    label: 'باكستان',
    country: 'PK',
  },

  // Afghanistan
  {
    value: 'Asia/Kabul',
    label: 'أفغانستان',
    country: 'AF',
  },

  // Bangladesh
  {
    value: 'Asia/Dhaka',
    label: 'بنغلاديش',
    country: 'BD',
  },

  // Indonesia
  {
    value: 'Asia/Jakarta',
    label: 'إندونيسيا',
    country: 'ID',
  },

  // Malaysia
  {
    value: 'Asia/Kuala_Lumpur',
    label: 'ماليزيا',
    country: 'MY',
  },

  // Azerbaijan
  {
    value: 'Asia/Baku',
    label: 'أذربيجان',
    country: 'AZ',
  },

  // USA
  {
    value: 'America/New_York',
    label: 'الولايات المتحدة (نيويورك)',
    country: 'US',
  },
  {
    value: 'America/Chicago',
    label: 'الولايات المتحدة (شيكاغو)',
    country: 'US',
  },
  {
    value: 'America/Los_Angeles',
    label: 'الولايات المتحدة (لوس أنجلوس)',
    country: 'US',
  },

  // UK
  {
    value: 'Europe/London',
    label: 'المملكة المتحدة',
    country: 'GB',
  },

  // Germany
  {
    value: 'Europe/Berlin',
    label: 'ألمانيا',
    country: 'DE',
  },

  // France
  {
    value: 'Europe/Paris',
    label: 'فرنسا',
    country: 'FR',
  },

  // China
  {
    value: 'Asia/Shanghai',
    label: 'الصين',
    country: 'CN',
  },

  // Japan
  {
    value: 'Asia/Tokyo',
    label: 'اليابان',
    country: 'JP',
  },

  // India
  {
    value: 'Asia/Kolkata',
    label: 'الهند',
    country: 'IN',
  },

  // Australia
  {
    value: 'Australia/Sydney',
    label: 'أستراليا',
    country: 'AU',
  },

  // Brazil
  {
    value: 'America/Sao_Paulo',
    label: 'البرازيل',
    country: 'BR',
  },

  // Canada
  {
    value: 'America/Toronto',
    label: 'كندا',
    country: 'CA',
  },

  // Russia
  {
    value: 'Europe/Moscow',
    label: 'روسيا',
    country: 'RU',
  },
];

export const TIMEZONE_VALUES = TIMEZONES.map((timezone) => timezone.value);
const TIMEZONE_VALUES_SET = new Set(TIMEZONE_VALUES);

export const isSupportedTimezone = (value: string): boolean => {
  return TIMEZONE_VALUES_SET.has(value);
};

/**
 * Default timezone for the application
 */
export const DEFAULT_TIMEZONE = 'Africa/Cairo';

/**
 * Get timezone label by value
 */
export const getTimezoneLabel = (value: string): string => {
  const timezone = TIMEZONES.find((tz) => tz.value === value);
  return timezone ? timezone.label : value;
};
