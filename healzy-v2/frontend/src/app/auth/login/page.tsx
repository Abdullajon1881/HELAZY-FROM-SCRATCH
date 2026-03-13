'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/i18n/useT';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useT();
  const { login, isLoading } = useAuth();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => login(data);

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 animated-gradient p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold font-heading">H</span>
          </div>
          <span className="text-white font-bold text-xl font-heading">Healzy</span>
        </Link>
        <div className="text-white">
          <div className="mb-8">
            <Sparkles className="w-10 h-10 text-white/60 mb-4" />
            <h1 className="font-heading text-4xl font-bold mb-3">Welcome Back</h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              Your health journey continues. Sign in to connect with doctors and access your health records.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Verified Doctors', value: '500+' },
              { label: 'Consultations', value: '120k+' },
              { label: 'Patient Rating', value: '4.9/5' },
              { label: 'Languages', value: '3' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold font-heading">{s.value}</p>
                <p className="text-white/60 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-sm">© 2025 Healzy. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg-primary)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold font-heading text-sm">H</span>
            </div>
            <span className="font-bold text-lg font-heading">Heal<span className="text-primary-600">zy</span></span>
          </div>

          <h2 className="font-heading text-3xl font-bold mb-1">{t.auth.login}</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            {t.auth.noAccount}{' '}
            <Link href="/auth/register" className="text-primary-600 font-medium hover:underline">
              {t.auth.register}
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t.auth.email}
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={t.auth.password}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              onRightIconClick={() => setShowPw(!showPw)}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:underline">
                {t.auth.forgotPassword}
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" loading={isLoading}>
              {t.auth.login}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--border-color)]" />
            <span className="text-xs text-[var(--text-muted)]">{t.auth.orContinueWith}</span>
            <div className="flex-1 h-px bg-[var(--border-color)]" />
          </div>

          {/* Google button */}
          <button className="w-full flex items-center justify-center gap-3 py-3 border border-[var(--border-color)] rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t.auth.google}
          </button>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-[var(--border-color)]">
            <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Demo credentials</p>
            <div className="space-y-1 text-xs text-[var(--text-muted)]">
              <p>Patient: <span className="font-mono">patient@healzy.uz</span> / <span className="font-mono">password123</span></p>
              <p>Doctor: <span className="font-mono">doctor@healzy.uz</span> / <span className="font-mono">password123</span></p>
              <p>Admin: <span className="font-mono">admin@healzy.uz</span> / <span className="font-mono">password123</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
