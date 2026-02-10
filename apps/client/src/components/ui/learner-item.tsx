import { StudentUser } from '@/lib/mockData';
import {
  Phone,
  User as UserIcon,
  MessageCircle,
  Send,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from './button';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';

interface LearnerItemProps {
  student: StudentUser;
  showPhone?: boolean;
  showActions?: boolean;
  showContactLinks?: boolean;
  onClick?: (student: StudentUser) => void;
  onEdit?: (student: StudentUser) => void;
  onDelete?: (studentId: string) => void;
  className?: string;
  variant?: 'solid' | 'ghost' | 'outline' | 'soft';
  color?: 'primary' | 'success' | 'danger' | 'muted';
}

const learnerItemVariants = cva('transition-colors', {
  variants: {
    variant: {
      solid: 'bg-card',
      ghost: 'bg-transparent',
      outline: 'bg-card border',
      soft: 'bg-muted/30 border'
    },
    color: {
      primary: '',
      success: '',
      danger: '',
      muted: ''
    },
    interactive: {
      true: 'cursor-pointer hover:bg-accent',
      false: ''
    },
    density: {
      compact: 'flex items-center justify-between p-3 rounded-lg',
      comfortable: 'p-5 rounded-lg'
    }
  },
  compoundVariants: [
    { variant: 'solid', color: 'muted', className: '' },
    { variant: 'solid', color: 'primary', className: '' },
    { variant: 'solid', color: 'success', className: '' },
    { variant: 'solid', color: 'danger', className: '' },

    { variant: 'outline', color: 'muted', className: 'border-border' },
    { variant: 'outline', color: 'primary', className: 'border-primary/20' },
    { variant: 'outline', color: 'success', className: 'border-success/20' },
    { variant: 'outline', color: 'danger', className: 'border-danger/20' },

    { variant: 'ghost', color: 'muted', className: '' },
    { variant: 'ghost', color: 'primary', className: '' },
    { variant: 'ghost', color: 'success', className: '' },
    { variant: 'ghost', color: 'danger', className: '' },

    { variant: 'soft', color: 'muted', className: 'border-border' },
    { variant: 'soft', color: 'primary', className: 'border-primary/20' },
    { variant: 'soft', color: 'success', className: 'border-success/20' },
    { variant: 'soft', color: 'danger', className: 'border-danger/20' }
  ],
  defaultVariants: {
    variant: 'outline',
    color: 'muted',
    interactive: false,
    density: 'compact'
  }
});

export const LearnerItem = ({
  student,
  showPhone = true,
  showActions = false,
  showContactLinks = false,
  onClick,
  onEdit,
  onDelete,
  className,
  variant = 'outline',
  color = 'muted'
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
        className={cn(
          learnerItemVariants({
            variant,
            color,
            density: 'comfortable',
            interactive: Boolean(onClick)
          }),
          className
        )}
        onClick={handleClick}
      >
        <div className='flex items-start gap-4'>
          {/* Avatar */}
          <div className='w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm'>
            <Typography as='div' size='lg' weight='semibold' className='text-primary-foreground'>
              {student.name.charAt(0)}
            </Typography>
          </div>

          {/* Main Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-4 mb-3'>
              <div>
                <Typography as='h3' size='lg' weight='semibold'>
                  {student.name}
                </Typography>
                {student.profile?.notes && (
                  <Typography as='div' size='sm' variant='ghost' color='muted'>
                    {student.profile.notes}
                  </Typography>
                )}
              </div>

              {/* Actions */}
              {showActions && (
                <div className='flex items-center gap-2'>
                  {onEdit && (
                    <Button
                      variant='ghost'
                      color='primary'
                      size='sm'
                      onClick={handleEdit}
                    >
                      <Edit className='w-4 h-4' />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant='ghost'
                      color='danger'
                      size='sm'
                      onClick={handleDelete}
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
                  <Button asChild variant='soft' color='primary' size='sm'>
                    <a
                      href={`tel:${student.profile.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className='gap-1.5'
                    >
                      <Phone className='w-3.5 h-3.5' />
                      <Typography as='span' size='sm'>
                        {student.profile.phone}
                      </Typography>
                    </a>
                  </Button>
                )}
                {student.profile?.whatsapp && (
                  <Button asChild variant='soft' color='success' size='sm'>
                    <a
                      href={`https://wa.me/${student.profile.whatsapp.replace(/[^0-9]/g, '')}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={(e) => e.stopPropagation()}
                      className='gap-1.5'
                    >
                      <MessageCircle className='w-3.5 h-3.5' />
                      <Typography as='span' size='sm'>
                        واتساب
                      </Typography>
                    </a>
                  </Button>
                )}
                {student.profile?.telegram && (
                  <Button asChild variant='soft' color='primary' size='sm'>
                    <a
                      href={`https://t.me/${student.profile.telegram.replace('@', '')}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={(e) => e.stopPropagation()}
                      className='gap-1.5'
                    >
                      <Send className='w-3.5 h-3.5' />
                      <Typography as='span' size='sm'>
                        تيليجرام
                      </Typography>
                    </a>
                  </Button>
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
      className={cn(
        learnerItemVariants({
          variant,
          color,
          density: 'compact',
          interactive: Boolean(onClick)
        }),
        className
      )}
      onClick={handleClick}
    >
      <div className='flex items-center gap-3'>
        <div className='bg-primary/10 p-2 rounded-full'>
          <UserIcon className='w-4 h-4 text-primary' />
        </div>
        <div>
          <Typography as='div' size='sm' weight='medium'>
            {student.name}
          </Typography>
          {student.profile?.notes && (
            <Typography as='div' size='xs' variant='ghost' color='muted' className='mt-0.5'>
              {student.profile.notes}
            </Typography>
          )}
        </div>
      </div>

      {showPhone && student.profile?.phone && (
        <div className='flex items-center gap-1'>
          <Phone className='w-3 h-3' />
          <Typography as='div' size='xs' variant='ghost' color='muted'>
            {student.profile.phone}
          </Typography>
        </div>
      )}
    </div>
  );
};
