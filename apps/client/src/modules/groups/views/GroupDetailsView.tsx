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
import { User } from '@halaqa/shared';

export const GroupDetailsView = ({ user }: { user?: User }) => {
  const { id } = useParams<{ id: string }>();
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const { group, students, tutor, isLoading, error } = useGroupDetailsViewModel(
    id!
  );

  const { updateGroupStatus } = useGroupsViewModel(
    user || {
      id: '',
      username: 'guest',
      name: '',
      email: '',
      role: 'TUTOR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  const {
    sessions,
    isLoading: sessionsLoading,
    error: sessionsError,
    searchQuery: sessionSearchQuery,
    setSearchQuery: setSessionSearchQuery
  } = useSessionsViewModel(id!);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin text-emerald-600' />
      </div>
    );
  }

  if (error || !group) {
    return (
      <Alert variant='destructive'>
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
  const canEdit = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <div className='flex items-center gap-3 mb-2'>
            <h1 className='text-2xl text-gray-800 dark:text-gray-100'>
              {group.name}
            </h1>
            <StatusDropdown
              currentStatus={groupStatus}
              onStatusChange={(status) => updateGroupStatus(group.id, status)}
              disabled={!canEdit}
            />
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            تفاصيل الحلقة
          </p>
        </div>
      </div>

      {/* Group Info */}
      <Card className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'>
        <CardHeader>
          <CardTitle className='text-lg text-gray-800 dark:text-gray-100'>
            معلومات الحلقة
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              المعلم:
            </span>
            <span className='text-sm text-gray-800 dark:text-gray-100'>
              {tutor?.name}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              الأيام:
            </span>
            <span className='text-sm text-gray-800 dark:text-gray-100'>
              {scheduleDays}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              الوقت:
            </span>
            <span className='text-sm text-gray-800 dark:text-gray-100'>
              {group.scheduleDays[0]?.time || 'غير محدد'}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              المدة:
            </span>
            <span className='text-sm text-gray-800 dark:text-gray-100'>
              {group.scheduleDays[0]?.durationMinutes || 60} دقيقة
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Students and Sessions */}
      <Tabs defaultValue='students' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800'>
          <TabsTrigger
            value='students'
            className='flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700'
          >
            <Users className='w-4 h-4' />
            الطلاب ({students.length})
          </TabsTrigger>
          <TabsTrigger
            value='sessions'
            className='flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700'
          >
            <History className='w-4 h-4' />
            سجل الجلسات
          </TabsTrigger>
        </TabsList>

        <TabsContent value='students' className='space-y-4'>
          <Card className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2'>
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
                  <Users className='w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400' />
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {studentSearchQuery
                      ? 'لا توجد نتائج للبحث'
                      : 'لا يوجد طلاب في هذه الحلقة'}
                  </p>
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
          <Card className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2'>
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
                  <Loader2 className='w-6 h-6 animate-spin text-emerald-600' />
                </div>
              ) : sessionsError ? (
                <Alert variant='destructive'>
                  <AlertDescription>{sessionsError}</AlertDescription>
                </Alert>
              ) : sessions.length === 0 ? (
                <div className='text-center py-8'>
                  <History className='w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400' />
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {sessionSearchQuery
                      ? 'لا توجد نتائج للبحث'
                      : 'لا توجد جلسات سابقة'}
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {sessions.map((session) => (
                    <SessionItem key={session.id} session={session} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
