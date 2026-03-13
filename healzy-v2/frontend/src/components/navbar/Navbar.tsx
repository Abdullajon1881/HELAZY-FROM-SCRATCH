'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Stethoscope, Calendar, MessageSquare, Sparkles,
  LayoutDashboard, Menu, X, Sun, Moon, Globe, Bell,
  ChevronDown, LogOut, User, Settings, Shield,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocaleStore } from '@/store/appStore';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, Badge } from '@/components/ui';
import { cn } from '@/utils/helpers';
import type { Locale } from '@/i18n/translations';

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'uz', label: 'UZ', flag: '🇺🇿' },
];

export default function Navbar() {
  const { t } = useT();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocaleStore();
  const { user, isAuthenticated, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const localeRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (localeRef.current && !localeRef.current.contains(e.target as Node)) setLocaleOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinks = [
    { href: '/', label: t.nav.home, icon: <Home className="w-4 h-4" /> },
    { href: '/doctors', label: t.nav.doctors, icon: <Stethoscope className="w-4 h-4" /> },
    { href: '/appointments', label: t.nav.appointments, icon: <Calendar className="w-4 h-4" />, auth: true },
    { href: '/chat', label: t.nav.chat, icon: <MessageSquare className="w-4 h-4" />, auth: true },
    { href: '/ai/symptom-checker', label: t.nav.ai, icon: <Sparkles className="w-4 h-4" /> },
  ];

  const getDashboardHref = () => {
    if (!user) return '/dashboard';
    return `/dashboard/${user.role}`;
  };

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'glass border-b border-[var(--border-color)] shadow-sm'
          : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <span className="text-white font-bold font-heading text-sm">H</span>
            </div>
            <span className="font-bold text-lg font-heading hidden sm:block">
              Heal<span className="text-primary-600">zy</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.filter(l => !l.auth || isAuthenticated).map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                    active
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated && (
              <Link
                href={getDashboardHref()}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                  pathname.startsWith('/dashboard')
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t.nav.dashboard}
              </Link>
            )}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Locale picker */}
            <div ref={localeRef} className="relative hidden sm:block">
              <button
                onClick={() => setLocaleOpen(!localeOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{locale.toUpperCase()}</span>
                <ChevronDown className={cn('w-3 h-3 transition-transform', localeOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {localeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-full mt-1.5 w-32 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-lg py-1 overflow-hidden"
                  >
                    {LOCALES.map(({ code, label, flag }) => (
                      <button
                        key={code}
                        onClick={() => { setLocale(code); setLocaleOpen(false); }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                          locale === code && 'text-primary-600 font-medium'
                        )}
                      >
                        <span>{flag}</span> {label}
                        {locale === code && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Auth controls */}
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                </button>

                {/* User menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Avatar name={`${user?.firstName} ${user?.lastName}`} src={user?.avatar} size="sm" />
                    <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">
                      {user?.firstName}
                    </span>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform hidden md:block', userMenuOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute right-0 top-full mt-1.5 w-52 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-dialog py-2 overflow-hidden"
                      >
                        <div className="px-4 py-2 border-b border-[var(--border-color)] mb-1">
                          <p className="font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                        </div>
                        {[
                          { href: getDashboardHref(), label: t.nav.dashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
                          { href: '/profile', label: t.nav.profile, icon: <User className="w-4 h-4" /> },
                          { href: '/settings', label: t.nav.settings, icon: <Settings className="w-4 h-4" /> },
                          ...(user?.role === 'admin' ? [{ href: '/dashboard/admin', label: t.nav.admin, icon: <Shield className="w-4 h-4" /> }] : []),
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[var(--text-primary)] transition-colors"
                          >
                            {item.icon} {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-[var(--border-color)] mt-1 pt-1">
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> {t.nav.logout}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-sm"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-30 glass border-b border-[var(--border-color)] shadow-lg lg:hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.filter(l => !l.auth || isAuthenticated).map((link) => {
                const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                        : 'text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    {link.icon} {link.label}
                  </Link>
                );
              })}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-2 border-t border-[var(--border-color)] mt-1">
                  <Link href="/auth/login" className="flex-1 text-center py-2.5 text-sm font-medium border border-[var(--border-color)] rounded-xl">
                    {t.nav.login}
                  </Link>
                  <Link href="/auth/register" className="flex-1 text-center py-2.5 text-sm font-medium bg-primary-600 text-white rounded-xl">
                    {t.nav.register}
                  </Link>
                </div>
              )}
              {/* Locale switcher mobile */}
              <div className="flex gap-1 pt-2 border-t border-[var(--border-color)] mt-1">
                {LOCALES.map(({ code, label, flag }) => (
                  <button
                    key={code}
                    onClick={() => setLocale(code)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl transition-colors',
                      locale === code ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-[var(--text-secondary)]'
                    )}
                  >
                    {flag} {label}
                  </button>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
