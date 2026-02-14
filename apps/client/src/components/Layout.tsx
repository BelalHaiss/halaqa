import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "@halaqa/shared";
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  BookOpen,
  Menu,
  X,
  Moon,
  Sun,
  UserCog,
  Settings,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

const sidebarVariants = cva(
  "fixed inset-y-0 right-0 w-56 bg-card border-l border-border z-40 transform transition-transform duration-300 lg:transform-none",
  {
    variants: {
      open: {
        true: "translate-x-0",
        false: "translate-x-full lg:translate-x-0",
      },
    },
    defaultVariants: {
      open: false,
    },
  },
);

export default function Layout({ user, onLogout, children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const navigation = [
    {
      name: "لوحة التحكم",
      href: "/",
      icon: LayoutDashboard,
      roles: ["ADMIN", "MODERATOR", "TUTOR"],
    },
    {
      name: "الحلقات",
      href: "/groups",
      icon: Users,
      roles: ["ADMIN", "MODERATOR", "TUTOR"],
    },
    {
      name: "السجل",
      href: "/sessions",
      icon: Calendar,
      roles: ["ADMIN", "MODERATOR", "TUTOR"],
    },
    {
      name: "المستخدمون",
      href: "/users",
      icon: UserCog,
      roles: ["ADMIN", "MODERATOR"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role),
  );

  const roleLabels: Record<string, string> = {
    ADMIN: "مدير",
    MODERATOR: "مشرف",
    TUTOR: "معلم",
    STUDENT: "طالب",
  };

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        variant="outline"
        color="muted"
        size="icon"
        className="lg:hidden fixed top-3 right-3 z-50 shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Sidebar */}
      <div className={cn(sidebarVariants({ open: isMobileMenuOpen }))}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <div className="bg-primary p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <Typography as="div" size="lg" weight="semibold">
              حلقة
            </Typography>
          </div>

          {/* User Info */}
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div>
              <Typography as="div" size="sm" weight="medium">
                {user.name}
              </Typography>
              <Typography as="div" size="xs" variant="ghost" color="muted">
                {roleLabels[user.role]}
              </Typography>
            </div>

            <Link
              to="/profile"
              className="p-1 rounded-md hover:bg-muted transition"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive ? "soft" : "ghost"}
                  color={isActive ? "primary" : "muted"}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to={item.href}>
                    <item.icon className="w-4 h-4" />
                    <Typography as="span" size="sm">
                      {item.name}
                    </Typography>
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="p-3 border-t border-border">
            <Button
              onClick={toggleTheme}
              variant="ghost"
              color="muted"
              size="sm"
              className="w-full justify-start gap-2"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              <Typography as="span" size="sm">
                {isDark ? "الوضع النهاري" : "الوضع الليلي"}
              </Typography>
            </Button>
          </div>

          {/* Logout */}
          <div className="p-3 border-t border-border">
            <Button
              onClick={onLogout}
              variant="ghost"
              color="danger"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <LogOut className="w-4 h-4" />
              <Typography as="span" size="sm">
                تسجيل الخروج
              </Typography>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/45 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pr-56 pt-14 lg:pt-0">
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
