import { useState } from 'react';
import { User } from '../App';
import { users, dayNames } from '../lib/mockData';
import { X } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen?: boolean;
  onClose: () => void;
  user?: User;
}

export default function CreateGroupModal({
  onClose,
  user
}: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [tutorId, setTutorId] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [time, setTime] = useState('17:00');
  const [duration, setDuration] = useState(60);

  const tutors = users.filter((u) => u.role === 'tutor');

  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the backend
    alert('تم إنشاء الحلقة بنجاح!');
    onClose();
  };

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
      dir='rtl'
    >
      <div className='bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-2xl text-gray-800'>إضافة حلقة جديدة</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <div>
            <label className='block text-sm mb-2 text-gray-700'>
              اسم الحلقة <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500'
              required
              placeholder='مثال: حلقة الفجر للأطفال'
            />
          </div>

          <div>
            <label className='block text-sm mb-2 text-gray-700'>
              المعلم <span className='text-red-500'>*</span>
            </label>
            <select
              value={tutorId}
              onChange={(e) => setTutorId(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500'
              required
            >
              <option value=''>اختر المعلم</option>
              {tutors.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm mb-3 text-gray-700'>
              أيام الأسبوع <span className='text-red-500'>*</span>
            </label>
            <div className='grid grid-cols-4 gap-2'>
              {dayNames.map((day, index) => (
                <button
                  key={index}
                  type='button'
                  onClick={() => handleDayToggle(index)}
                  className={`px-4 py-3 rounded-lg border transition-colors ${
                    selectedDays.includes(index)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm mb-2 text-gray-700'>
                الوقت <span className='text-red-500'>*</span>
              </label>
              <input
                type='time'
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500'
                required
              />
            </div>

            <div>
              <label className='block text-sm mb-2 text-gray-700'>
                المدة (بالدقائق) <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500'
                required
                min='30'
                step='15'
              />
            </div>
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='submit'
              className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg transition-colors'
            >
              إنشاء الحلقة
            </button>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg transition-colors'
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
