import { LearnerGroupSummaryDto } from '@halaqa/shared';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';

type LearnerGroupsReadonlyPanelProps = {
  groups?: LearnerGroupSummaryDto[];
  groupCount?: number;
};

export function LearnerGroupsReadonlyPanel({
  groups,
  groupCount
}: LearnerGroupsReadonlyPanelProps) {
  const resolvedGroups = groups ?? [];
  const resolvedGroupCount = groupCount ?? resolvedGroups.length;

  return (
    <div className='rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3'>
      <div className='flex items-center justify-between gap-2'>
        <Typography as='div' size='sm' weight='semibold'>
          حلقات المتعلم
        </Typography>
        <Badge variant='soft' color='primary'>
          {resolvedGroupCount}
        </Badge>
      </div>

      {resolvedGroups.length === 0 ? (
        <Typography as='div' size='xs' className='text-muted-foreground'>
          غير منضم لأي حلقة حالياً
        </Typography>
      ) : (
        <div className='flex flex-wrap gap-2'>
          {resolvedGroups.map((group) => (
            <Badge key={group.id} variant='outline' color='muted'>
              {group.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
