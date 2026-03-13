'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar, MessageSquare, Sparkles, FileText, Clock,
  ArrowRight, TrendingUp, Heart, Activity, Plus, Bell,
} from 'lucide-react';
import { Avatar, Badge, Card, EmptyState } from '@/components/ui';
import AppointmentCard from '@/components/appointment-card/AppointmentCard';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/utils/helpers';

const MOCK_APPOINTMENTS = [
  { id: 'a1', doctorId: '1', patientId: 'p1', type: 'video' as const, status: 'confirmed' as const, scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), duration: 30, reason: 'Follow-up cardiac checkup', amount: 150000, currency: 'UZS', isPaid: true, createdAt: '', updatedAt: '', doctor: { firstName: 'Dilnoza', lastName: 'Yusupova', specialty: 'Cardiologist', avatar: null } },
  { id: 'a2', doctorId: '2', patientId: 'p1', type: 'chat' as const, status: 'completed' as const, scheduledAt: new Date(Date.now() - 86400000 * 5).toISOString(), duration: 20, reason: 'Headache consultation', amount: 120000, currency: 'UZS', isPaid: true, createdAt: '', updatedAt: '', doctor: { firstName: 'Bobur', lastName: 'Toshmatov', specialty: 'Neurologist', avatar: null } },
];

const QUICK_ACTIONS = [
  { href: '/doctors', icon: <Plus className="w-5 h-5" />, label: 'Book Appointment', color: 'bg-primary-600' },
  { href: '/chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Open Chat', color: 'bg-violet-500' },
  { href: '/ai/symptom-checker', icon: <Sparkles className="w-5 h-5" />, label: 'AI Assistant', color: 'bg-blue-500' },
  { href: '/records', icon: <FileText className="w-5 h-5" />, label: 'My Records', color: 'bg-emerald-500' },
];

export default function PatientDashboard() {
  const { t } = useT();
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">
            {t.dashboard.welcome}, {user?.firstName}! 👋
          </h1>
          <p className="text-[var(--text-secondary)]">{formatDate(new Date().toISOString())}</p>
        </div>
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t.dashboard.totalAppointments, value: '12', icon: <Calendar className="w-5 h-5" />, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/50', trend: '+2 this month' },
          { label: 'Upcoming', value: '1', icon: <Clock className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50', trend: 'Next in 2 days' },
          { label: 'Doctors seen', value: '4', icon: <Heart className="w-5 h-5" />, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/50', trend: 'Across 3 specialties' },
          { label: 'AI Chats', value: '8', icon: <Activity className="w-5 h-5" />, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/50', trend: 'This month' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <p className="font-heading text-3xl font-extrabold mb-1">{stat.value}</p>
            <p className="text-xs text-[var(--text-secondary)] font-medium">{stat.label}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {QUICK_ACTIONS.map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.06 }}
          >
            <Link href={action.href} className="flex flex-col items-center gap-2.5 p-4 card hover:shadow-card-hover hover:-translate-y-0.5 transition-all text-center">
              <div className={`w-11 h-11 rounded-2xl ${action.color} flex items-center justify-center text-white`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg">{t.dashboard.appointments}</h2>
            <Link href="/appointments" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              {t.common.seeAll} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {MOCK_APPOINTMENTS.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<Calendar className="w-7 h-7" />}
                title={t.dashboard.noUpcoming}
                action={
                  <Link href="/doctors" className="px-4 py-2 bg-primary-600 text-white text-sm rounded-xl font-medium hover:bg-primary-700 transition-colors">
                    {t.appointments.book}
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {MOCK_APPOINTMENTS.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt as any}
                  onCancel={(id) => console.log('cancel', id)}
                  onJoin={(id) => console.log('join', id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Health summary */}
          <div className="card p-5">
            <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-500" /> Health Overview
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Blood Pressure', value: '120/80', status: 'Normal', color: 'text-emerald-500' },
                { label: 'Heart Rate', value: '72 bpm', status: 'Normal', color: 'text-emerald-500' },
                { label: 'Last checkup', value: '2 weeks ago', status: '', color: '' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                  <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{item.value}</p>
                    {item.status && <p className={`text-xs ${item.color}`}>{item.status}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI tip */}
          <div className="card p-5 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/50 dark:to-primary-900/30 border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-sm text-primary-700 dark:text-primary-300">AI Health Tip</span>
            </div>
            <p className="text-sm text-primary-700 dark:text-primary-300 leading-relaxed mb-3">
              Based on your recent consultations, staying hydrated and getting 7–8 hours of sleep can significantly improve your cardiovascular health.
            </p>
            <Link href="/ai/symptom-checker" className="text-xs font-medium text-primary-600 hover:underline flex items-center gap-1">
              Ask AI Assistant <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
