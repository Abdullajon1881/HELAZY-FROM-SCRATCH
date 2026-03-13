'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, Stethoscope, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/i18n/useT';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/helpers';
import type { UserRole } from '@/types/user';

const schema = z.object({
  firstName: z.string().min(2, 'Min 2 characters'),
  lastName: z.string().min(2, 'Min 2 characters'),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['patient', 'doctor']),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { t } = useT();
  const { register: registerUser, isLoading } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<UserRole>('patient');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'patient' },
  });

  const selectRole = (r: UserRole) => {
    setRole(r);
    setValue('role', r);
  };

  const onSubmit = (data: FormData) => registerUser(data);

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 animated-gradient p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold font-heading">H</span>
          </div>
          <span className="text-white font-bold text-xl font-heading">Healzy</span>
        </Link>
        <div className="text-white">
          <h1 className="font-heading text-4xl font-bold mb-4">Join Healzy</h1>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Create your account and get access to hundreds of certified specialists — or join as a doctor and reach thousands of patients.
          </p>
          <div className="space-y-3">
            {['Free to sign up', 'Verified doctors only', 'Secure & confidential', 'Available 24/7'].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-white/80">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-sm">© 2025 Healzy. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg-primary)] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg py-8"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold font-heading text-sm">H</span>
            </div>
            <span className="font-bold text-lg font-heading">Heal<span className="text-primary-600">zy</span></span>
          </div>

          <h2 className="font-heading text-3xl font-bold mb-1">{t.auth.register}</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            {t.auth.hasAccount}{' '}
            <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">{t.auth.login}</Link>
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['patient', 'doctor'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => selectRole(r)}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left',
                  role === r
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50'
                    : 'border-[var(--border-color)] hover:border-primary-300'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  role === r ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                )}>
                  {r === 'patient' ? <UserCircle className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                </div>
                <div>
                  <p className={cn('font-semibold text-sm', role === r && 'text-primary-700 dark:text-primary-300')}>
                    {r === 'patient' ? t.auth.rolePatient : t.auth.roleDoctor}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {r === 'patient' ? 'Find & book doctors' : 'Offer consultations'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.auth.firstName}
                placeholder="Amir"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label={t.auth.lastName}
                placeholder="Karimov"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
            <Input
              label={t.auth.email}
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={t.auth.phone}
              type="tel"
              placeholder="+998 90 123 45 67"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label={t.auth.password}
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              onRightIconClick={() => setShowPw(!showPw)}
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label={t.auth.confirmPassword}
              type="password"
              placeholder="Repeat password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <p className="text-xs text-[var(--text-muted)]">
              {t.auth.terms}{' '}
              <Link href="/terms" className="text-primary-600 hover:underline">{t.auth.termsLink}</Link>
              {' '}{t.auth.and}{' '}
              <Link href="/privacy" className="text-primary-600 hover:underline">{t.auth.privacyLink}</Link>.
            </p>

            <Button type="submit" fullWidth size="lg" loading={isLoading}>
              {t.auth.register}
            </Button>
          </form>

          {/* Google */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--border-color)]" />
            <span className="text-xs text-[var(--text-muted)]">{t.auth.orContinueWith}</span>
            <div className="flex-1 h-px bg-[var(--border-color)]" />
          </div>
          <button className="w-full flex items-center justify-center gap-3 py-3 border border-[var(--border-color)] rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t.auth.google}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
