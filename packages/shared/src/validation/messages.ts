export type ValidationLocale = 'ar' | 'en';

type Messages = {
  nameTooShort: string;
  nameTooLong: string;
  phoneInvalid: string;
  passwordTooShort: string;
  passwordTooLong: string;
  notesTooLong: string;
  attendanceNotesTooLong: string;
  descriptionTooLong: string;
  idRequired: string;
  tutorRequired: string;
  invalidDate: string;
  invalidTime: string;
  invalidTimezone: string;
  atLeastOneField: string;
  currentPasswordRequired: string;
  confirmPasswordRequired: string;
  passwordMismatch: string;
  scheduleDaysMin: string;
  scheduleDaysDuplicate: string;
  dayOfWeekInvalid: string;
  durationMinutesInvalid: string;
  pageInvalid: string;
  limitInvalid: string;
  invalidCurrency: string;
  amountTooSmall: string;
  amountTooLarge: string;
  monthlyPriceRequired: string;
  monthlyPriceTooSmall: string;
  billingCurrencyRequired: string;
  periodFromBeforeTo: string;
  transactionLabelRequired: string;
  transactionLabelConflict: string;
};

export const validationMessages: Record<ValidationLocale, Messages> = {
  ar: {
    nameTooShort: 'الاسم يجب أن يكون حرفين على الأقل',
    nameTooLong: 'الاسم طويل جدًا',
    phoneInvalid: 'رقم الهاتف غير صحيح، يجب إدخاله بصيغة دولية مثل +966501234567',
    passwordTooShort: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    passwordTooLong: 'كلمة المرور طويلة جدًا',
    notesTooLong: 'الملاحظات طويلة جدًا',
    attendanceNotesTooLong: 'ملاحظات الحضور طويلة جدًا',
    descriptionTooLong: 'الوصف طويل جدًا',
    idRequired: 'المعرّف مطلوب',
    tutorRequired: 'اختر المعلم',
    invalidDate: 'تنسيق التاريخ غير صحيح',
    invalidTime: 'الوقت غير صحيح',
    invalidTimezone: 'يرجى اختيار منطقة زمنية صحيحة',
    atLeastOneField: 'قم بتعديل حقل واحد على الأقل',
    currentPasswordRequired: 'كلمة المرور الحالية مطلوبة',
    confirmPasswordRequired: 'تأكيد كلمة المرور مطلوب',
    passwordMismatch: 'كلمة المرور غير متطابقة',
    scheduleDaysMin: 'يجب اختيار يوم واحد على الأقل',
    scheduleDaysDuplicate: 'لا يمكن تكرار نفس اليوم',
    dayOfWeekInvalid: 'يوم الأسبوع غير صحيح',
    durationMinutesInvalid: 'المدة غير صحيحة',
    pageInvalid: 'رقم الصفحة غير صحيح',
    limitInvalid: 'عدد النتائج غير صحيح',
    invalidCurrency: 'العملة غير مدعومة',
    amountTooSmall: 'المبلغ أصغر من الحد المسموح',
    amountTooLarge: 'المبلغ أكبر من الحد المسموح',
    monthlyPriceRequired: 'السعر الشهري مطلوب',
    monthlyPriceTooSmall: 'السعر الشهري يجب أن يكون أكبر من الصفر',
    billingCurrencyRequired: 'اختر عملة الاشتراك الشهري',
    periodFromBeforeTo: 'تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية',
    transactionLabelRequired: 'يجب تحديد تصنيف للمعاملة',
    transactionLabelConflict: 'لا يمكن تحديد تصنيف موجود وإنشاء تصنيف جديد في نفس الوقت',
  },
  en: {
    nameTooShort: 'Name must be at least 2 characters',
    nameTooLong: 'Name is too long',
    phoneInvalid: 'Invalid phone number, must be in international format e.g. +966501234567',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordTooLong: 'Password is too long',
    notesTooLong: 'Notes are too long',
    attendanceNotesTooLong: 'Attendance notes are too long',
    descriptionTooLong: 'Description is too long',
    idRequired: 'ID is required',
    tutorRequired: 'Please select a tutor',
    invalidDate: 'Invalid date format',
    invalidTime: 'Invalid time',
    invalidTimezone: 'Please select a valid timezone',
    atLeastOneField: 'At least one field is required',
    currentPasswordRequired: 'Current password is required',
    confirmPasswordRequired: 'Password confirmation is required',
    passwordMismatch: 'Password confirmation does not match',
    scheduleDaysMin: 'At least one schedule day is required',
    scheduleDaysDuplicate: 'Schedule days must be unique',
    dayOfWeekInvalid: 'Invalid day of week',
    durationMinutesInvalid: 'Invalid duration',
    pageInvalid: 'Invalid page number',
    limitInvalid: 'Invalid limit',
    invalidCurrency: 'Unsupported currency',
    amountTooSmall: 'Amount is below the minimum allowed value',
    amountTooLarge: 'Amount is above the maximum allowed value',
    monthlyPriceRequired: 'Monthly price is required',
    monthlyPriceTooSmall: 'Monthly price must be greater than zero',
    billingCurrencyRequired: 'Monthly subscription currency is required',
    periodFromBeforeTo: 'Start date must be before or equal to end date',
    transactionLabelRequired: 'A transaction label is required',
    transactionLabelConflict:
      'Cannot specify both an existing label and a new label at the same time',
  },
};

export const getMessages = (locale: ValidationLocale = 'ar'): Messages =>
  validationMessages[locale];
