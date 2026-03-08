export type ValidationLocale = 'ar' | 'en';

type Messages = {
  nameTooShort: string;
  nameTooLong: string;
  usernameTooShort: string;
  usernameTooLong: string;
  usernameInvalidChars: string;
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
};

export const validationMessages: Record<ValidationLocale, Messages> = {
  ar: {
    nameTooShort: 'الاسم يجب أن يكون حرفين على الأقل',
    nameTooLong: 'الاسم طويل جدًا',
    usernameTooShort: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
    usernameTooLong: 'اسم المستخدم طويل جدًا',
    usernameInvalidChars: 'يسمح فقط بالحروف الانجليزية والأرقام و _',
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
  },
  en: {
    nameTooShort: 'Name must be at least 2 characters',
    nameTooLong: 'Name is too long',
    usernameTooShort: 'Username must be at least 3 characters',
    usernameTooLong: 'Username is too long',
    usernameInvalidChars: 'Username can only contain letters, numbers, and _',
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
  },
};

export const getMessages = (locale: ValidationLocale = 'ar'): Messages =>
  validationMessages[locale];
