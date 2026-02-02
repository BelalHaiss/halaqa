import { Phone, MessageCircle, Send } from 'lucide-react';
import { StudentUser } from '../lib/mockData';

interface StudentProfileProps {
  student: StudentUser;
  compact?: boolean;
}

export default function StudentProfile({
  student,
  compact = false
}: StudentProfileProps) {
  const contactLinks = [
    {
      type: 'phone',
      value: student.profile?.phone,
      icon: Phone,
      label: 'اتصال',
      href: student.profile?.phone ? `tel:${student.profile.phone}` : null,
      color:
        'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      type: 'whatsapp',
      value: student.profile?.whatsapp,
      icon: MessageCircle,
      label: 'واتساب',
      href: student.profile?.whatsapp
        ? `https://wa.me/${student.profile.whatsapp.replace(/[^0-9]/g, '')}`
        : null,
      color:
        'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
    },
    {
      type: 'telegram',
      value: student.profile?.telegram,
      icon: Send,
      label: 'تيليجرام',
      href: student.profile?.telegram
        ? `https://t.me/${student.profile.telegram.replace('@', '')}`
        : null,
      color:
        'text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20'
    }
  ];

  const availableContacts = contactLinks.filter((link) => link.value);

  if (compact) {
    return (
      <div className='flex items-center gap-2'>
        {availableContacts.map(
          (link) =>
            link.href && (
              <a
                key={link.type}
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                className={`p-1.5 rounded-lg transition-colors ${link.color}`}
                title={link.label}
              >
                <link.icon className='w-4 h-4' />
              </a>
            )
        )}
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <div>
        <h3 className='text-lg text-gray-800 dark:text-gray-100 mb-1'>
          {student.name}
        </h3>
        {student.profile?.notes && (
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {student.profile.notes}
          </p>
        )}
      </div>

      {availableContacts.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {availableContacts.map(
            (link) =>
              link.href && (
                <a
                  key={link.type}
                  href={link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${link.color} border-gray-200 dark:border-gray-700`}
                >
                  <link.icon className='w-4 h-4' />
                  <span className='text-sm'>{link.label}</span>
                </a>
              )
          )}
        </div>
      )}

      {student.joinDate && (
        <div className='text-sm text-gray-600 dark:text-gray-400'>
          تاريخ الانضمام:{' '}
          {new Date(student.joinDate).toLocaleDateString('ar-SA')}
        </div>
      )}
    </div>
  );
}
