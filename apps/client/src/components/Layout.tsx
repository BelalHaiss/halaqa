import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@halaqa/shared';
import {
  Users,
  Calendar,
  History,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Moon,
  Sun,
  UserCog,
  Settings
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Typography } from '@/components/ui/typography';
import { UserBadge } from '@/modules/users';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

export default function Layout({ user, onLogout, children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const sidebarId = 'app-sidebar';

  const navigation = [
    {
      name: 'الحلقات',
      href: '/',
      icon: Users,
      roles: ['ADMIN', 'MODERATOR', 'TUTOR']
    },
    {
      name: 'جلسات اليوم',
      href: '/sessions',
      icon: Calendar,
      roles: ['ADMIN', 'MODERATOR', 'TUTOR']
    },
    {
      name: 'السجل',
      href: '/sessions/history',
      icon: History,
      roles: ['ADMIN', 'MODERATOR', 'TUTOR']
    },
    {
      name: 'المستخدمون',
      href: '/users',
      icon: UserCog,
      roles: ['ADMIN', 'MODERATOR']
    },
    {
      name: 'المتعلمون',
      href: '/learners',
      icon: GraduationCap,
      roles: ['ADMIN', 'MODERATOR', 'TUTOR']
    }
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className='h-dvh overflow-hidden bg-muted/30' dir='rtl'>
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        variant='outline'
        color='muted'
        size='icon'
        className='lg:hidden fixed top-3 right-3 z-50 shadow-lg'
        aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
        aria-expanded={isMobileMenuOpen}
        aria-controls={sidebarId}
      >
        {isMobileMenuOpen ? (
          <X className='w-5 h-5' />
        ) : (
          <Menu className='w-5 h-5' />
        )}
      </Button>

      {/* Sidebar */}
      <aside
        id={sidebarId}
        className={cn(
          'fixed inset-y-0 right-0 z-40 w-56 border-l border-border bg-card transition-transform duration-300 lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className='flex flex-col h-full min-h-0'>
          {/* Logo */}
          <div className='flex items-center gap-2 p-4 border-b border-border'>
            <AppLogo />
          </div>

          {/* User Info */}
          <div className='p-3 border-b border-border flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 min-w-0'>
              <Avatar size='sm'>
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0'>
                <Typography
                  as='div'
                  size='sm'
                  weight='medium'
                  className='truncate'
                >
                  {user.name}
                </Typography>
                <UserBadge role={user.role} size='sm' />
              </div>
            </div>

            <Link
              to='/profile'
              className='p-1 rounded-md hover:bg-muted transition'
            >
              <Settings className='w-4 h-4 text-muted-foreground' />
            </Link>
          </div>

          {/* Navigation */}
          <nav className='flex-1 min-h-0 overflow-y-auto p-3 space-y-1'>
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive ? 'soft' : 'ghost'}
                  color={isActive ? 'primary' : 'muted'}
                  size='sm'
                  className='w-full justify-start gap-2'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to={item.href}>
                    <item.icon className='w-4 h-4' />
                    <Typography as='span' size='sm'>
                      {item.name}
                    </Typography>
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className='p-3 border-t border-border'>
            <Button
              onClick={toggleTheme}
              variant='ghost'
              color='muted'
              size='sm'
              className='w-full justify-start gap-2'
            >
              {isDark ? (
                <Sun className='w-4 h-4' />
              ) : (
                <Moon className='w-4 h-4' />
              )}
              <Typography as='span' size='sm'>
                {isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
              </Typography>
            </Button>
          </div>

          {/* Logout */}
          <div className='p-3 border-t border-border'>
            <Button
              onClick={onLogout}
              variant='ghost'
              color='danger'
              size='sm'
              className='w-full justify-start gap-2'
            >
              <LogOut className='w-4 h-4' />
              <Typography as='span' size='sm'>
                تسجيل الخروج
              </Typography>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-foreground/45 z-30'
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden='true'
        />
      )}

      {/* Main Content */}
      <div className='h-full lg:pr-56'>
        <main className='h-full overflow-y-auto p-4 pt-14 lg:p-6 lg:pt-6'>
          {children}
        </main>
      </div>
    </div>
  );
}
