'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Calendar } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { EmptyState } from '@/components/ui';
import AppointmentCard from '@/components/appointment-card/AppointmentCard';
import { cn } from '@/utils/helpers';
import type { Appointment } from '@/types/appointment';

const TABS = ['all', 'upcoming', 'completed', 'cancelled'] as const;

const MOCK: Appointment[] = [
  { id: 'a1', doctorId: '1', patientId: 'p1', type: 'video', status: 'confirmed', scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), duration: 30, reason: 'Follow-up cardiac checkup', amount: 150000, currency: 'UZS', isPaid: true, createdAt: '', updatedAt: '', doctor: { firstName: 'Dilnoza', lastName: 'Yusupova', specialty: 'Cardiologist', avatar: null } as any },
  { id: 'a2', doctorId: '2', patientId: 'p1', type: 'chat', status: 'completed', scheduledAt: new Date(Date.now() - 86400000 * 5).toISOString(), duration: 20, reason: 'Headache consultation', amount: 120000, currency: 'UZS', isPaid: true, createdAt: '', updatedAt: '', doctor: { firstName: 'Bobur', lastName: 'Toshmatov', specialty: 'Neurologist', avatar: null } as any },
  { id: 'a3', doctorId: '3', patientId: 'p1', type: 'in_person', status: 'cancelled', scheduledAt: new Date(Date.now() - 86400000 * 10).toISOString(), duration: 30, reason: 'Annual checkup', amount: 100000, currency: 'UZS', isPaid: false, cancelReason: 'Doctor unavailable', createdAt: '', updatedAt: '', doctor: { firstName: 'Malika', lastName: 'Rashidova', specialty: 'Pediatrician', avatar: null } as any },
];

export default function AppointmentsPage() {
  const { t } = useT();
  const [tab, setTab] = useState<typeof TABS[number]>('all');
  const [appointments, setAppointments] = useState(MOCK);

  const filtered = appointments.filter((a) => {
    if (tab === 'all') return true;
    if (tab === 'upcoming') return ['confirmed', 'pending'].includes(a.status);
    if (tab === 'completed') return a.status === 'completed';
    if (tab === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  const handleCancel = (id: string) => setAppointments((p) => p.map((a) => a.id === id ? { ...a, status: 'cancelled' as const } : a));
  const handleJoin = (id: string) => console.log('join', id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">{t.appointments.title}</h1>
          <p className="text-[var(--text-secondary)]">Manage your consultations</p>
        </div>
        <Link href="/appointments/book" className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors shadow-glow">
          <Plus className="w-4 h-4" /> {t.appointments.book}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-xl transition-all capitalize',
              tab === t ? 'bg-primary-600 text-white' : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {t} {t !== 'all' && <span className="ml-1 text-xs opacity-60">({appointments.filter((a) => {
              if (t === 'upcoming') return ['confirmed','pending'].includes(a.status);
              if (t === 'completed') return a.status === 'completed';
              if (t === 'cancelled') return a.status === 'cancelled';
              return true;
            }).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Calendar className="w-7 h-7" />}
            title={t.dashboard.noUpcoming}
            action={<Link href="/doctors" className="px-4 py-2 bg-primary-600 text-white text-sm rounded-xl hover:bg-primary-700 transition-colors">{t.appointments.book}</Link>}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((appt, i) => (
            <motion.div key={appt.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <AppointmentCard appointment={appt} onCancel={handleCancel} onJoin={handleJoin} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
