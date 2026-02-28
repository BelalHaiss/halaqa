import { useMemo } from 'react';
import { GroupScheduleDay, startMinutesToTime } from '@halaqa/shared';

type GroupScheduleTimeTextProps = {
  scheduleDays: GroupScheduleDay[];
  emptyLabel?: string;
};

export const GroupScheduleTimeText = ({
  scheduleDays,
  emptyLabel = 'غير محدد',
}: GroupScheduleTimeTextProps) => {
  const scheduleTimeText = useMemo(() => {
    if (scheduleDays.length === 0) {
      return emptyLabel;
    }

    const uniqueTimes = Array.from(
      new Set(
        [...scheduleDays]
          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
          .map((scheduleDay) => scheduleDay.startMinutes)
      )
    );

    return uniqueTimes.map((time) => startMinutesToTime(time)).join('، ');
  }, [emptyLabel, scheduleDays]);

  return <>{scheduleTimeText}</>;
};
