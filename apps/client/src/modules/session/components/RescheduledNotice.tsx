import {
  formatDateShort,
  formatISODateToUserTimezone,
  minutesToTimeString,
  type ISODateString,
} from '@halaqa/shared';
import { Typography } from '@/components/ui/typography';

interface RescheduledNoticeProps {
  originalStartedAt: ISODateString;
  timezone: string;
  variant?: 'compact' | 'full';
}

export const RescheduledNotice = ({
  originalStartedAt,
  timezone,
  variant = 'compact',
}: RescheduledNoticeProps) => {
  const originalDateTime = formatISODateToUserTimezone(originalStartedAt, timezone);
  const originalFormattedDate = formatDateShort(originalStartedAt, timezone);
  const originalFormattedTime = minutesToTimeString(originalDateTime.time as any);

  if (variant === 'compact') {
    return (
      <Typography as='div' size='xs' className='text-muted-foreground'>
        معاد جدولتها من الموعد الرسمي "{originalFormattedDate} {originalFormattedTime}"
      </Typography>
    );
  }

  return (
    <Typography as='div' size='sm' className='text-muted-foreground'>
      تم إعادة جدولة هذه الجلسة من موعدها الرسمي "{originalFormattedDate} {originalFormattedTime}"
    </Typography>
  );
};
