import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Typography } from '@/components/ui/typography';

export function HistoryView() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');

  return (
    <div className='space-y-4'>
      <PageHeader title='السجل' description='صفحة السجل قيد التنفيذ' />
      <Card>
        <CardHeader>
          <CardTitle size='lg'>معرف الحلقة</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography as='div' size='sm' variant='ghost' color='muted'>
            {groupId ?? 'لم يتم تمرير معرف الحلقة'}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
