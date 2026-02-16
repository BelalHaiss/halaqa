import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGroupDetailsViewModel } from '../viewmodels/group-details.viewmodel';
import { useGroupsViewModel } from '../viewmodels/groups.viewmodel';
import { useSessionsViewModel } from '../viewmodels/sessions.viewmodel';
import { Loader2, Users, History, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchInput } from '@/components/ui/search-input';
import { LearnerItem } from '@/components/ui/learner-item';
import { SessionItem } from '@/components/ui/session-item';
import { StatusDropdown } from '@/components/ui/status-dropdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dayNames } from '@/lib/mockData';
import { GroupStatus, startMinutesToTime } from '@halaqa/shared';
import { PageHeader } from '@/components/ui/page-header';
import { Typography } from '@/components/ui/typography';
import { useApp } from '@/contexts/AppContext';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export const GroupDetailsView = () => {
  const { user } = useApp();
  const { id } = useParams<{ id: string }>();
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    groupId: string;
    groupName: string;
    status: GroupStatus;
  } | null>(null);

  if (!user || !id) {
    return null;
  }

  const { group, students, tutor, isLoading, error } = useGroupDetailsViewModel(id);

  const { updateGroupStatus } = useGroupsViewModel(user);

  const {
    sessions,
    isLoading: sessionsLoading,
    error: sessionsError,
    searchQuery: sessionSearchQuery,
    setSearchQuery: setSessionSearchQuery
  } = useSessionsViewModel(id);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (error || !group) {
    return (
      <Alert variant='soft' color='danger'>
        <AlertDescription>{error || 'الحلقة غير موجودة'}</AlertDescription>
      </Alert>
    );
  }

  const scheduleDays = group.scheduleDays
    .map((sd) => dayNames[sd.dayOfWeek])
    .join(' و ');

  // Filter students based on search query
  const filteredStudents = students.filter(
    (student) =>
      !studentSearchQuery ||
      student.name.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  const groupStatus = group.status;
  const canEdit = user.role === 'ADMIN' || user.role === 'MODERATOR';

  return (
    <div className='space-y-6'>
      {/* Header */}
      <PageHeader
        title={group.name}
        description='تفاصيل الحلقة'
        actions={
          <StatusDropdown
            currentStatus={groupStatus}
            onStatusChange={(status) =>
              setPendingStatusChange({
                groupId: group.id,
                groupName: group.name,
                status,
              })
            }
            disabled={!canEdit}
          />
        }
      />

      {/* Group Info */}
      <Card>
        <CardHeader>
          <CardTitle size='lg'>معلومات الحلقة</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              المعلم:
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {tutor?.name}
            </Typography>
          </div>
          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              الأيام:
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {scheduleDays}
            </Typography>
          </div>
          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              الوقت:
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {group.scheduleDays[0]
                ? startMinutesToTime(group.scheduleDays[0].startMinutes)
                : 'غير محدد'}
            </Typography>
          </div>
          <div className='flex items-center justify-between'>
            <Typography as='div' size='sm' variant='ghost' color='muted'>
              المدة:
            </Typography>
            <Typography as='div' size='sm' weight='medium'>
              {group.scheduleDays[0]?.durationMinutes || 60} دقيقة
            </Typography>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Students and Sessions */}
      <Tabs defaultValue='students' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger
            value='students'
            className='flex items-center gap-2'
          >
            <Users className='w-4 h-4' />
            الطلاب ({students.length})
          </TabsTrigger>
          <TabsTrigger
            value='sessions'
            className='flex items-center gap-2'
          >
            <History className='w-4 h-4' />
            سجل الجلسات
          </TabsTrigger>
        </TabsList>

        <TabsContent value='students' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle size='lg' className='flex items-center gap-2'>
                  <Users className='w-5 h-5' />
                  الطلاب ({filteredStudents.length})
                </CardTitle>
              </div>
              {students.length > 0 && (
                <SearchInput
                  value={studentSearchQuery}
                  onChange={setStudentSearchQuery}
                  placeholder='بحث عن طالب...'
                  className='mt-2'
                />
              )}
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className='text-center py-8'>
                  <Users className='w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground' />
                  <Typography as='div' size='sm' variant='ghost' color='muted'>
                    {studentSearchQuery
                      ? 'لا توجد نتائج للبحث'
                      : 'لا يوجد طلاب في هذه الحلقة'}
                  </Typography>
                </div>
              ) : (
                <div className='space-y-2'>
                  {filteredStudents.map((student) => (
                    <LearnerItem
                      key={student.id}
                      student={student}
                      showPhone={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='sessions' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle size='lg' className='flex items-center gap-2'>
                  <Clock className='w-5 h-5' />
                  الجلسات السابقة ({sessions.length})
                </CardTitle>
              </div>
              {sessions.length > 0 && (
                <SearchInput
                  value={sessionSearchQuery}
                  onChange={setSessionSearchQuery}
                  placeholder='بحث في الجلسات...'
                  className='mt-2'
                />
              )}
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='w-6 h-6 animate-spin text-primary' />
                </div>
              ) : sessionsError ? (
                <Alert variant='soft' color='danger'>
                  <AlertDescription>{sessionsError}</AlertDescription>
                </Alert>
              ) : sessions.length === 0 ? (
                <div className='text-center py-8'>
                  <History className='w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground' />
                  <Typography as='div' size='sm' variant='ghost' color='muted'>
                    {sessionSearchQuery
                      ? 'لا توجد نتائج للبحث'
                      : 'لا توجد جلسات سابقة'}
                  </Typography>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {sessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      timezone={user.timezone || group.timezone}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={Boolean(pendingStatusChange)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingStatusChange(null);
          }
        }}
        title='تأكيد تغيير الحالة'
        description={
          pendingStatusChange
            ? `هل تريد تغيير حالة "${pendingStatusChange.groupName}"؟`
            : 'هل تريد تغيير حالة الحلقة؟'
        }
        confirmText='تأكيد'
        cancelText='إلغاء'
        onConfirm={async () => {
          if (!pendingStatusChange) {
            return;
          }

          await updateGroupStatus(
            pendingStatusChange.groupId,
            pendingStatusChange.status
          );
          setPendingStatusChange(null);
        }}
        variant='solid'
        color='primary'
      />
    </div>
  );
};
