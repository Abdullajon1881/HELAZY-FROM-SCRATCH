'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Stethoscope, Calendar, TrendingUp, CheckCircle,
  XCircle, Clock, Eye, BarChart2, Shield, AlertTriangle,
  ArrowUpRight, Search,
} from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { cn } from '@/utils/helpers';

const MOCK_APPLICATIONS = [
  { id: '1', name: 'Sarvar Ergashev', specialty: 'General Practitioner', appliedAt: '2025-03-10', status: 'pending', exp: 5 },
  { id: '2', name: 'Zulfiya Kasimova', specialty: 'Pediatrician', appliedAt: '2025-03-09', status: 'pending', exp: 8 },
  { id: '3', name: 'Timur Khakimov', specialty: 'Psychiatrist', appliedAt: '2025-03-08', status: 'approved', exp: 12 },
];

const MOCK_USERS = [
  { id: '1', name: 'Amir Karimov', email: 'amir@example.com', role: 'patient', joinedAt: '2025-01-15', isActive: true },
  { id: '2', name: 'Sabina Mirzaeva', email: 'sabina@example.com', role: 'patient', joinedAt: '2025-02-20', isActive: true },
  { id: '3', name: 'Dilnoza Yusupova', email: 'dilnoza@example.com', role: 'doctor', joinedAt: '2025-01-05', isActive: true },
];

type Tab = 'overview' | 'applications' | 'users' | 'doctors';

export default function AdminDashboard() {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>('overview');
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);

  const approve = (id: string) => setApplications((p) => p.map((a) => a.id === id ? { ...a, status: 'approved' } : a));
  const reject = (id: string) => setApplications((p) => p.map((a) => a.id === id ? { ...a, status: 'rejected' } : a));

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
    { key: 'applications', label: 'Applications', icon: <Clock className="w-4 h-4" /> },
    { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { key: 'doctors', label: 'Doctors', icon: <Stethoscope className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold">{t.nav.admin} Panel</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage the platform</p>
        </div>
        {/* Pending alert */}
        {applications.filter((a) => a.status === 'pending').length > 0 && (
          <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            {applications.filter((a) => a.status === 'pending').length} pending applications
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-7 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-1 w-fit">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              tab === key ? 'bg-primary-600 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t.dashboard.totalUsers, value: '1,247', trend: '+48 this week', icon: <Users className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50' },
              { label: t.dashboard.totalDoctors, value: '89', trend: '3 pending', icon: <Stethoscope className="w-5 h-5" />, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/50' },
              { label: 'Appointments', value: '4,832', trend: '+12% this month', icon: <Calendar className="w-5 h-5" />, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/50' },
              { label: 'Revenue', value: formatCurrency(48320000), trend: '+8.2% this month', icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card p-5"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <p className="font-heading text-2xl font-extrabold mb-0.5">{stat.value}</p>
                <p className="text-xs font-medium text-[var(--text-secondary)]">{stat.label}</p>
                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />{stat.trend}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="card p-6">
            <h2 className="font-heading font-bold mb-4">Recent Doctor Applications</h2>
            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center gap-3 py-2 border-b border-[var(--border-color)] last:border-0">
                  <Avatar name={app.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{app.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{app.specialty} · Applied {formatDate(app.appliedAt)}</p>
                  </div>
                  <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Applications */}
      {tab === 'applications' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="font-heading font-bold">Doctor Applications</h2>
            <Badge variant="warning">{applications.filter((a) => a.status === 'pending').length} pending</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  {['Doctor', 'Specialty', 'Experience', 'Applied', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={app.name} size="sm" />
                        <span className="font-semibold text-sm">{app.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[var(--text-secondary)]">{app.specialty}</td>
                    <td className="px-5 py-3.5 text-sm">{app.exp} yrs</td>
                    <td className="px-5 py-3.5 text-sm text-[var(--text-muted)]">{formatDate(app.appliedAt)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'} dot>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {app.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => approve(app.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-xs rounded-lg hover:bg-emerald-100 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => reject(app.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-500 text-xs rounded-lg hover:bg-red-100 transition-colors">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <button className="flex items-center gap-1 px-3 py-1.5 border border-[var(--border-color)] text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="font-heading font-bold">All Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input placeholder="Search users..." className="pl-8 pr-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={user.name} size="sm" />
                        <span className="font-semibold text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[var(--text-secondary)]">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={user.role === 'doctor' ? 'primary' : 'default'}>{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[var(--text-muted)]">{formatDate(user.joinedAt)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={user.isActive ? 'success' : 'danger'} dot>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="flex items-center gap-1 px-3 py-1.5 border border-[var(--border-color)] text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doctors tab - same pattern */}
      {tab === 'doctors' && (
        <div className="card p-6">
          <h2 className="font-heading font-bold mb-4">Verified Doctors</h2>
          <div className="space-y-3">
            {[
              { name: 'Dilnoza Yusupova', specialty: 'Cardiologist', rating: 4.9, consultations: 1847, isActive: true },
              { name: 'Bobur Toshmatov', specialty: 'Neurologist', rating: 4.7, consultations: 982, isActive: true },
              { name: 'Malika Rashidova', specialty: 'Pediatrician', rating: 4.8, consultations: 2341, isActive: true },
            ].map((doc) => (
              <div key={doc.name} className="flex items-center gap-4 py-3 border-b border-[var(--border-color)] last:border-0">
                <Avatar name={doc.name} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Dr. {doc.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{doc.specialty} · ⭐ {doc.rating} · {doc.consultations.toLocaleString()} consultations</p>
                </div>
                <Badge variant="success" dot>Active</Badge>
                <button className="text-xs border border-[var(--border-color)] px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
