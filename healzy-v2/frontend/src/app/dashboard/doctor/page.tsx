'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar, Users, Star, TrendingUp, Clock, CheckCircle,
  XCircle, MessageSquare, ArrowRight, Bell, ToggleLeft,
  ToggleRight, Video, Stethoscope, DollarSign,
} from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { formatDate, formatCurrency, formatTime } from '@/utils/helpers';
import { cn } from '@/utils/helpers';

const MOCK_TODAY_APPTS = [
  { id: 'a1', type: 'video', status: 'confirmed', scheduledAt: new Date(Date.now() + 3600000).toISOString(), patient: 'Amir Karimov', reason: 'Chest pain follow-up', duration: 30 },
  { id: 'a2', type: 'chat', status: 'confirmed', scheduledAt: new Date(Date.now() + 7200000).toISOString(), patient: 'Sabina Mirzaeva', reason: 'General checkup', duration: 20 },
  { id: 'a3', type: 'video', status: 'pending', scheduledAt: new Date(Date.now() + 10800000).toISOString(), patient: 'Rustam Aliyev', reason: 'Blood pressure consultation', duration: 30 },
];

const MOCK_RECENT = [
  { id: 'r1', patient: 'Nodira K.', date: '2025-03-13', diagnosis: 'Tension headache', rating: 5 },
  { id: 'r2', patient: 'Jasur B.', date: '2025-03-12', diagnosis: 'Hypertension monitoring', rating: 5 },
  { id: 'r3', patient: 'Malika S.', date: '2025-03-11', diagnosis: 'Post-surgical follow-up', rating: 4 },
];

export default function DoctorDashboard() {
  const { t } = useT();
  const { user } = useAuthStore();
  const [isAvailable, setIsAvailable] = useState(true);
  const [appointments, setAppointments] = useState(MOCK_TODAY_APPTS);

  const confirm = (id: string) => setAppointments((p) => p.map((a) => a.id === id ? { ...a, status: 'confirmed' } : a));
  const reject = (id: string) => setAppointments((p) => p.filter((a) => a.id !== id));

  const stats = [
    { label: "Today's Appointments", value: appointments.length, icon: <Calendar className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50' },
    { label: 'Total Patients', value: '1,847', icon: <Users className="w-5 h-5" />, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/50' },
    { label: 'Rating', value: '4.9', icon: <Star className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/50' },
    { label: "This Month's Revenue", value: formatCurrency(1850000), icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="lg" online={isAvailable} />
          <div>
            <h1 className="font-heading text-2xl font-bold">Dr. {user?.firstName} {user?.lastName}</h1>
            <p className="text-[var(--text-secondary)] text-sm">Cardiologist · {formatDate(new Date().toISOString())}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Availability toggle */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 card">
            <span className="text-sm font-medium">{isAvailable ? 'Available' : 'Unavailable'}</span>
            <button onClick={() => setIsAvailable(!isAvailable)} className="transition-colors">
              {isAvailable
                ? <ToggleRight className="w-8 h-8 text-emerald-500" />
                : <ToggleLeft className="w-8 h-8 text-slate-400" />}
            </button>
          </div>
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="font-heading text-2xl font-extrabold mb-0.5">{s.value}</p>
            <p className="text-xs text-[var(--text-secondary)]">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-heading font-bold text-lg">Today's Schedule</h2>
            <Link href="/appointments" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="card p-8 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
              <p className="text-[var(--text-secondary)]">No appointments today</p>
            </div>
          ) : (
            appointments.map((appt, i) => (
              <motion.div key={appt.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="card p-4">
                <div className="flex items-start gap-4">
                  {/* Time column */}
                  <div className="text-center flex-shrink-0 w-14">
                    <p className="font-bold text-sm font-heading">{formatTime(appt.scheduledAt)}</p>
                    <p className="text-xs text-[var(--text-muted)]">{appt.duration}min</p>
                  </div>

                  {/* Type icon */}
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                    appt.type === 'video' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-500' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500'
                  )}>
                    {appt.type === 'video' ? <Video className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm">{appt.patient}</p>
                      <Badge variant={appt.status === 'confirmed' ? 'success' : 'warning'} dot>
                        {appt.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate">{appt.reason}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {appt.status === 'pending' ? (
                      <>
                        <button onClick={() => confirm(appt.id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-xs rounded-lg hover:bg-emerald-100 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Confirm
                        </button>
                        <button onClick={() => reject(appt.id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-500 text-xs rounded-lg hover:bg-red-100 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <Link
                        href={appt.type === 'video' ? `/video/${appt.id}` : `/chat`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded-lg transition-colors"
                      >
                        {appt.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                        Start
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick stats ring */}
          <div className="card p-5">
            <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" /> This Month
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Consultations', value: '87', max: 100, color: 'bg-primary-500' },
                { label: 'Completion rate', value: '94%', max: 100, color: 'bg-emerald-500' },
                { label: 'Avg. rating', value: '4.9', max: 5, color: 'bg-amber-400' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">{item.label}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${(parseFloat(item.value) / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent completed */}
          <div className="card p-5">
            <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" /> Recent Patients
            </h3>
            <div className="space-y-3">
              {MOCK_RECENT.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
                    {r.patient[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{r.patient}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{r.diagnosis}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(r.date)}</p>
                    <div className="flex items-center gap-0.5 justify-end mt-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <span key={i} className="text-amber-400 text-xs">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/appointments?status=completed" className="mt-4 text-xs text-primary-600 hover:underline flex items-center gap-1">
              View all history <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Quick actions */}
          <div className="card p-5">
            <h3 className="font-heading font-bold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: '/doctors/me', icon: <Stethoscope className="w-4 h-4" />, label: 'Edit Profile' },
                { href: '/chat', icon: <MessageSquare className="w-4 h-4" />, label: 'Open Messages' },
                { href: '/doctors/me/schedule', icon: <Calendar className="w-4 h-4" />, label: 'Manage Schedule' },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">
                  <span className="text-primary-500">{a.icon}</span> {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
