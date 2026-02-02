import { StudentUser } from '../../lib/mockData';
import {
  Phone,
  User as UserIcon,
  MessageCircle,
  Send,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from './button';

interface LearnerItemProps {
  student: StudentUser;
  showPhone?: boolean;
  showActions?: boolean;
  showContactLinks?: boolean;
  onClick?: (student: StudentUser) => void;
  onEdit?: (student: StudentUser) => void;
  onDelete?: (studentId: string) => void;
  className?: string;
}

export const LearnerItem = ({
  student,
  showPhone = true,
  showActions = false,
  showContactLinks = false,
  onClick,
  onEdit,
  onDelete,
  className = ''
}: LearnerItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(student);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(student);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(student.id);
    }
  };

  if (showActions || showContactLinks) {
    // Enhanced version with actions and contact links
    return (
      <div
        className={`p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={handleClick}
      >
        <div className='flex items-start gap-4'>
          {/* Avatar */}
          <div className='w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm'>
            <span className='text-white text-lg font-semibold'>
              {student.name.charAt(0)}
            </span>
          </div>

          {/* Main Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-4 mb-3'>
              <div>
                <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1'>
                  {student.name}
                </h3>
                {student.profile?.notes && (
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {student.profile.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              {showActions && (
                <div className='flex items-center gap-2'>
                  {onEdit && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleEdit}
                      className='text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    >
                      <Edit className='w-4 h-4' />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleDelete}
                      className='text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Contact Links */}
            {showContactLinks && (
              <div className='flex flex-wrap gap-2'>
                {student.profile?.phone && (
                  <a
                    href={`tel:${student.profile.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors'
                  >
                    <Phone className='w-3.5 h-3.5' />
                    <span>{student.profile.phone}</span>
                  </a>
                )}
                {student.profile?.whatsapp && (
                  <a
                    href={`https://wa.me/${student.profile.whatsapp.replace(/[^0-9]/g, '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={(e) => e.stopPropagation()}
                    className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors'
                  >
                    <MessageCircle className='w-3.5 h-3.5' />
                    <span>واتساب</span>
                  </a>
                )}
                {student.profile?.telegram && (
                  <a
                    href={`https://t.me/${student.profile.telegram.replace('@', '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={(e) => e.stopPropagation()}
                    className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 rounded-md hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors'
                  >
                    <Send className='w-3.5 h-3.5' />
                    <span>تيليجرام</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Simple version for basic usage
  return (
    <div
      className={`flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      <div className='flex items-center gap-3'>
        <div className='bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full'>
          <UserIcon className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
        </div>
        <div>
          <span className='text-sm font-medium text-gray-800 dark:text-gray-100'>
            {student.name}
          </span>
          {student.profile?.notes && (
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              {student.profile.notes}
            </p>
          )}
        </div>
      </div>

      {showPhone && student.profile?.phone && (
        <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
          <Phone className='w-3 h-3' />
          <span>{student.profile.phone}</span>
        </div>
      )}
    </div>
  );
};
