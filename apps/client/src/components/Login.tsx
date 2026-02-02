import { useState, useEffect } from 'react';
import { User } from '@halaqa/shared';
import { users } from '../lib/mockData';
import { BookOpen } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Apply dark mode class if it exists in localStorage
    const savedTheme = localStorage.getItem('halaqa_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user = users.find(
      (u) => u.email === usernameOrEmail || u.username === usernameOrEmail
    );

    if (user && password === 'password') {
      onLogin(user);
    } else {
      setError('اسم المستخدم/البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4'
      dir='rtl'
    >
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md'>
        <div className='flex items-center justify-center mb-6'>
          <div className='bg-emerald-600 p-2.5 rounded-full'>
            <BookOpen className='w-7 h-7 text-white' />
          </div>
        </div>

        <h1 className='text-2xl text-center mb-1.5 text-gray-800 dark:text-gray-100'>
          حلقة
        </h1>
        <p className='text-center text-sm text-gray-600 dark:text-gray-400 mb-6'>
          نظام إدارة حلقات تحفيظ القرآن
        </p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='usernameOrEmail'
              className='block text-sm mb-1.5 text-gray-700 dark:text-gray-300'
            >
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <input
              id='usernameOrEmail'
              type='text'
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className='w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              required
              dir='ltr'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm mb-1.5 text-gray-700 dark:text-gray-300'
            >
              كلمة المرور
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              required
            />
          </div>

          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2.5 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <button
            type='submit'
            className='w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg transition-colors text-sm'
          >
            تسجيل الدخول
          </button>
        </form>

        <div className='mt-5 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg'>
          <p className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
            للتجربة، استخدم:
          </p>
          <div className='text-xs text-gray-700 dark:text-gray-300 space-y-1'>
            <div>
              <strong>مدير:</strong> admin أو admin@halaqa.com
            </div>
            <div>
              <strong>مشرف:</strong> fatima_mod أو mod@halaqa.com
            </div>
            <div>
              <strong>معلم:</strong> mohamed_tutor أو tutor1@halaqa.com
            </div>
            <div>
              <strong>كلمة المرور:</strong> password
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
