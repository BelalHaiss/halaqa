import { lazy, Suspense } from 'react';
import { useApp } from '@/contexts/AppContext';

const AdminModeratorPaymentsView = lazy(() =>
  import('./AdminModeratorPaymentsView').then((module) => ({
    default: module.AdminModeratorPaymentsView,
  }))
);

const LearnerPaymentsView = lazy(() =>
  import('./LearnerPaymentsView').then((module) => ({
    default: module.LearnerPaymentsView,
  }))
);

const TutorPaymentsView = lazy(() =>
  import('./TutorPaymentsView').then((module) => ({
    default: module.TutorPaymentsView,
  }))
);

const fallback = <div className='py-8 text-center text-muted-foreground'>جاري التحميل...</div>;

export default function PaymentsView() {
  const { user } = useApp();

  const content =
    user?.role === 'ADMIN' || user?.role === 'MODERATOR' ? (
      <AdminModeratorPaymentsView />
    ) : user?.role === 'TUTOR' ? (
      <TutorPaymentsView />
    ) : (
      <LearnerPaymentsView />
    );

  return <Suspense fallback={fallback}>{content}</Suspense>;
}
