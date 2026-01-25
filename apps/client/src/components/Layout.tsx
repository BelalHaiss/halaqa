import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../App';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  LogOut,
  BookOpen,
  Menu,
  X,
  Moon,
  Sun,
  UserCog,
  GraduationCap
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

export default function Layout({ user, onLogout, children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const navigation = [
    {
      name: 'لوحة التحكم',
      href: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'moderator', 'tutor']
    },
    {
      name: 'الحلقات',
      href: '/groups',
      icon: Users,
      roles: ['admin', 'moderator', 'tutor']
    },
    {
      name: 'المتعلمون',
      href: '/learners',
      icon: GraduationCap,
      roles: ['admin', 'moderator', 'tutor']
    },
    {
      name: 'السجل',
      href: '/sessions',
      icon: Calendar,
      roles: ['admin', 'moderator', 'tutor']
    },
    {
      name: 'التقارير',
      href: '/reports',
      icon: FileText,
      roles: ['admin', 'moderator']
    },
    { name: 'المستخدمون', href: '/users', icon: UserCog, roles: ['admin'] }
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

  const roleLabels = {
    admin: 'مدير',
    moderator: 'مشرف',
    tutor: 'معلم'
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-950' dir='rtl'>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className='lg:hidden fixed top-3 right-3 z-50 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700'
      >
        {isMobileMenuOpen ? (
          <X className='w-5 h-5' />
        ) : (
          <Menu className='w-5 h-5' />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-56 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-40 transform transition-transform duration-300 lg:transform-none ${
          isMobileMenuOpen
            ? 'translate-x-0'
            : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className='flex flex-col h-full'>
          {/* Logo */}
          <div className='flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700'>
            <div className='bg-emerald-600 p-1.5 rounded-lg'>
              <BookOpen className='w-5 h-5 text-white' />
            </div>
            <span className='text-lg text-gray-800 dark:text-gray-100'>
              حلقة
            </span>
          </div>

          {/* User Info */}
          <div className='p-3 border-b border-gray-200 dark:border-gray-700'>
            <div className='text-sm text-gray-900 dark:text-gray-100'>
              {user.name}
            </div>
            <div className='text-xs text-gray-500 dark:text-gray-400'>
              {roleLabels[user.role]}
            </div>
          </div>

          {/* Navigation */}
          <nav className='flex-1 p-3 space-y-1'>
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className='w-4 h-4' />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className='p-3 border-t border-gray-200 dark:border-gray-700'>
            <button
              onClick={toggleTheme}
              className='flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-sm'
            >
              {isDark ? (
                <Sun className='w-4 h-4' />
              ) : (
                <Moon className='w-4 h-4' />
              )}
              <span>{isDark ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
            </button>
          </div>

          {/* Logout */}
          <div className='p-3 border-t border-gray-200 dark:border-gray-700'>
            <button
              onClick={onLogout}
              className='flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-sm'
            >
              <LogOut className='w-4 h-4' />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className='lg:pr-56 pt-14 lg:pt-0'>
        <main className='p-4 lg:p-6'>{children}</main>
      </div>
    </div>
  );
}
