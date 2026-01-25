import { Session } from '@halaqa/shared';
import { Calendar, Clock, FileText } from 'lucide-react';
import { StatusBadge } from './status-badge';

interface SessionItemProps {
  session: Session;
  onClick?: (session: Session) => void;
  className?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

export const SessionItem = ({ session, onClick, className = "" }: SessionItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(session);
    }
  };

  const statusMap = {
    done: 'completed' as const,
    canceled: 'suspended' as const,
    active: 'active' as const,
    inactive: 'inactive' as const
  };

  return (
    <div
      className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {formatDate(session.date)}
            </h4>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{session.time}</span>
            </div>
          </div>
        </div>
        
        <StatusBadge status={statusMap[session.status]} />
      </div>
      
      {session.notes && (
        <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
          <FileText className="w-3 h-3 mt-0.5 text-gray-400" />
          <p className="line-clamp-2">{session.notes}</p>
        </div>
      )}
    </div>
  );
};