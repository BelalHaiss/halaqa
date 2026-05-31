import { GraduationCap, HandCoins } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AdminLearnerPaymentsView } from './AdminLearnerPaymentsView';
import { AdminTutorPaymentsView } from './AdminTutorPaymentsView';

const VALID_TABS = ['learner', 'tutor'] as const;
type PaymentTab = (typeof VALID_TABS)[number];

const normalizeTab = (value: string | null): PaymentTab => {
  if (!value) return 'learner';
  return VALID_TABS.includes(value as PaymentTab) ? (value as PaymentTab) : 'learner';
};

export function AdminModeratorPaymentsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = normalizeTab(searchParams.get('tab'));

  const setTab = (tab: PaymentTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  return (
    <div className='space-y-5'>
      <div className='inline-flex rounded-full border border-border/70 bg-background p-1'>
        <Button
          type='button'
          variant={activeTab === 'learner' ? 'solid' : 'ghost'}
          onClick={() => setTab('learner')}
          className='rounded-full gap-2'
        >
          <GraduationCap className='h-4 w-4' />
          اشتراكات المتعلمين
        </Button>
        <Button
          type='button'
          variant={activeTab === 'tutor' ? 'solid' : 'ghost'}
          onClick={() => setTab('tutor')}
          className='rounded-full gap-2'
        >
          <HandCoins className='h-4 w-4' />
          أجور المعلمين
        </Button>
      </div>

      {activeTab === 'learner' ? <AdminLearnerPaymentsView /> : <AdminTutorPaymentsView />}
    </div>
  );
}
