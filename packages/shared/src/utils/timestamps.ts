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
    value: "Africa/Cairo",
    label: "مصر",
    country: "EG",
  },

  // Saudi Arabia
  {
    value: "Asia/Riyadh",
    label: "السعودية",
    country: "SA",
  },
  {
    value: "Asia/Makkah",
    label: "السعودية",
    country: "SA",
  },

  // UAE
  {
    value: "Asia/Dubai",
    label: "الإمارات",
    country: "AE",
  },

  // Kuwait
  {
    value: "Asia/Kuwait",
    label: "الكويت",
    country: "KW",
  },

  // Qatar
  {
    value: "Asia/Qatar",
    label: "قطر",
    country: "QA",
  },

  // Bahrain
  {
    value: "Asia/Bahrain",
    label: "البحرين",
    country: "BH",
  },

  // Oman
  {
    value: "Asia/Muscat",
    label: "عمان",
    country: "OM",
  },

  // Jordan
  {
    value: "Asia/Amman",
    label: "الأردن",
    country: "JO",
  },

  // Lebanon
  {
    value: "Asia/Beirut",
    label: "لبنان",
    country: "LB",
  },

  // Syria
  {
    value: "Asia/Damascus",
    label: "سوريا",
    country: "SY",
  },

  // Iraq
  {
    value: "Asia/Baghdad",
    label: "العراق",
    country: "IQ",
  },

  // Palestine
  {
    value: "Asia/Gaza",
    label: "فلسطين",
    country: "PS",
  },
  {
    value: "Asia/Hebron",
    label: "فلسطين",
    country: "PS",
  },

  // Yemen
  {
    value: "Asia/Aden",
    label: "اليمن",
    country: "YE",
  },

  // Libya
  {
    value: "Africa/Tripoli",
    label: "ليبيا",
    country: "LY",
  },

  // Tunisia
  {
    value: "Africa/Tunis",
    label: "تونس",
    country: "TN",
  },

  // Algeria
  {
    value: "Africa/Algiers",
    label: "الجزائر",
    country: "DZ",
  },

  // Morocco
  {
    value: "Africa/Casablanca",
    label: "المغرب",
    country: "MA",
  },

  // Sudan
  {
    value: "Africa/Khartoum",
    label: "السودان",
    country: "SD",
  },

  // Somalia
  {
    value: "Africa/Mogadishu",
    label: "الصومال",
    country: "SO",
  },
];

/**
 * Default timezone for the application
 */
export const DEFAULT_TIMEZONE = "Africa/Cairo";

/**
 * Get timezone label by value
 */
export const getTimezoneLabel = (value: string): string => {
  const timezone = TIMEZONES.find((tz) => tz.value === value);
  return timezone ? timezone.label : value;
};

/**
 * Get timezone by country code
 */
export const getTimezonesByCountry = (
  countryCode: string,
): TimezoneOption[] => {
  return TIMEZONES.filter((tz) => tz.country === countryCode);
};
