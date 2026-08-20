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

const fallback = <div className='py-8 text-center text-muted-foreground'>جاري التحميل...</div>;

export default function PaymentsView() {
  const { user } = useApp();

  if (user?.role === 'TUTOR') {
    return (
      <div className='py-16 text-center text-muted-foreground'>لا يمكنك الوصول إلى هذه الصفحة</div>
    );
  }

  const content =
    user?.role === 'ADMIN' || user?.role === 'MODERATOR' ? (
      <AdminModeratorPaymentsView />
    ) : (
      <LearnerPaymentsView />
    );

  return <Suspense fallback={fallback}>{content}</Suspense>;
}
