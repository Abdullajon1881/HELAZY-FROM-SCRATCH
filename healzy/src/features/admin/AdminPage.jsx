import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Stethoscope, Activity, Clock, Check, X, Eye, Ban, ShieldCheck, ChevronDown } from 'lucide-react';
import { useT } from '../../hooks/useT';
import { useAuthStore } from '../../features/auth/store';
import { Admin } from '../../services';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import styles from './AdminPage.module.css';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, trend }) {
  return (
    <motion.div className={styles.statCard} whileHover={{ y: -3 }}>
      <div className={styles.statIcon} style={{ background: `${color}15`, color }}>{icon}</div>
      <div className={styles.statContent}>
        <div className={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
      {trend && (
        <div className={[styles.statTrend, trend > 0 ? styles.trendUp : styles.trendDown].join(' ')}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </motion.div>
  );
}

// ─── Admin Tabs ───────────────────────────────────────────────────────────────
const TABS = ['dashboard', 'doctors', 'users'];

export default function AdminPage() {
  const { t } = useT();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [appFilter, setAppFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  // Guard: only admins
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      toast.error('Admin access required');
    }
  }, [user]);

  // Load data
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [statsRes, appsRes, usersRes] = await Promise.all([
          Admin.getStats(),
          Admin.getDoctorApplications('pending'),
          Admin.getUsers(),
        ]);
        setStats(statsRes.data);
        setApplications(appsRes.data);
        setUsers(usersRes.data.results || usersRes.data);
      } catch { toast.error('Failed to load admin data'); }
      finally { setLoading(false); }
    };
    if (user?.role === 'admin') loadAll();
  }, [user]);

  const loadApplications = async (status) => {
    setAppFilter(status);
    try {
      const res = await Admin.getDoctorApplications(status);
      setApplications(res.data);
    } catch { toast.error('Failed to load applications'); }
  };

  const handleApprove = async (id) => {
    try {
      await Admin.approveDoctor(id);
      toast.success('Doctor approved!');
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    } catch { toast.error('Failed to approve doctor'); }
  };

  const handleReject = async (id) => {
    try {
      await Admin.rejectDoctor(id);
      toast.success('Application rejected');
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    } catch { toast.error('Failed to reject application'); }
  };

  const handleBanUser = async (id, currentStatus) => {
    try {
      if (currentStatus === 'banned') {
        await Admin.unbanUser(id);
        toast.success('User unbanned');
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u));
      } else {
        await Admin.banUser(id);
        toast.success('User banned');
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'banned' } : u));
      }
    } catch { toast.error('Action failed'); }
  };

  const tabLabels = {
    dashboard: t.admin.dashboard,
    doctors: t.admin.doctors,
    users: t.admin.users,
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.pageTitle}>{t.admin.title}</h1>
          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={tab}
                className={[styles.tab, activeTab === tab ? styles.tabActive : ''].join(' ')}
                onClick={() => setActiveTab(tab)}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {/* ── Dashboard Tab ── */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {loading || !stats ? (
                  <div className={styles.statsGrid}>
                    {[1,2,3,4].map(i => <div key={i} className={['skeleton', styles.statSkeleton].join(' ')} />)}
                  </div>
                ) : (
                  <div className={styles.statsGrid}>
                    <StatCard icon={<Users size={22} />} label={t.admin.stats.totalUsers} value={stats.totalUsers} color="#2D6A4F" trend={12} />
                    <StatCard icon={<Stethoscope size={22} />} label={t.admin.stats.activeDoctors} value={stats.activeDoctors} color="#0F766E" trend={5} />
                    <StatCard icon={<Clock size={22} />} label={t.admin.stats.pendingApps} value={stats.pendingApplications} color="#D97706" />
                    <StatCard icon={<Activity size={22} />} label={t.admin.stats.todayConsultations} value={stats.todayConsultations} color="#7C3AED" trend={8} />
                  </div>
                )}

                {/* Recent applications summary */}
                <div className={styles.dashSection}>
                  <div className={styles.sectionHeader}>
                    <h2>{t.admin.doctorApps.title}</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('doctors')}>View all →</Button>
                  </div>
                  <div className={styles.recentApps}>
                    {applications.slice(0, 3).map(app => (
                      <div key={app.id} className={styles.recentApp}>
                        <Avatar name={`${app.user.firstName} ${app.user.lastName}`} size="sm" />
                        <div className={styles.recentAppInfo}>
                          <span className={styles.recentAppName}>{app.user.firstName} {app.user.lastName}</span>
                          <span className={styles.recentAppSpec}>{app.specialty}</span>
                        </div>
                        <span className={[styles.statusBadge, styles[`status_${app.status}`]].join(' ')}>
                          {t.admin.doctorApps[app.status]}
                        </span>
                        {app.status === 'pending' && (
                          <div className={styles.quickActions}>
                            <button className={styles.approveBtn} onClick={() => handleApprove(app.id)}><Check size={14} /></button>
                            <button className={styles.rejectBtn} onClick={() => handleReject(app.id)}><X size={14} /></button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats cards */}
                <div className={styles.dashSection}>
                  <h2>Platform Overview</h2>
                  <div className={styles.overviewGrid}>
                    {[
                      { label: 'Total Consultations', value: stats?.totalConsultations, icon: '💬' },
                      { label: 'New Users This Week', value: stats?.newUsersThisWeek, icon: '👤' },
                      { label: 'Revenue This Month', value: stats ? `${(stats.revenueThisMonth / 1000000).toFixed(1)}M UZS` : '—', icon: '💰' },
                    ].map(s => (
                      <div key={s.label} className={styles.overviewCard}>
                        <span className={styles.overviewIcon}>{s.icon}</span>
                        <div className={styles.overviewVal}>{s.value?.toLocaleString?.() || s.value}</div>
                        <div className={styles.overviewLabel}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Doctors Tab ── */}
            {activeTab === 'doctors' && (
              <motion.div key="doctors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className={styles.tabHeader}>
                  <h2 className={styles.tabTitle}>{t.admin.doctorApps.title}</h2>
                  <div className={styles.filterRow}>
                    {['pending', 'approved', 'rejected'].map(status => (
                      <button
                        key={status}
                        className={[styles.filterBtn, appFilter === status ? styles.filterBtnActive : ''].join(' ')}
                        onClick={() => loadApplications(status)}
                      >
                        {t.admin.doctorApps[status]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.applicationList}>
                  {applications.length === 0 && (
                    <div className={styles.empty}>
                      <span style={{ fontSize: 40 }}>🩺</span>
                      <p>No {appFilter} applications</p>
                    </div>
                  )}
                  {applications.map(app => (
                    <motion.div key={app.id} className={styles.applicationCard} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className={styles.appLeft}>
                        <Avatar name={`${app.user.firstName} ${app.user.lastName}`} size="lg" />
                        <div>
                          <h3 className={styles.appName}>{app.user.firstName} {app.user.lastName}</h3>
                          <p className={styles.appEmail}>{app.user.email}</p>
                        </div>
                      </div>

                      <div className={styles.appDetails}>
                        <div className={styles.appDetail}>
                          <span className={styles.detailLabel}>{t.admin.doctorApps.specialty}</span>
                          <span className={styles.detailValue}>{app.specialty}</span>
                        </div>
                        <div className={styles.appDetail}>
                          <span className={styles.detailLabel}>{t.admin.doctorApps.experience}</span>
                          <span className={styles.detailValue}>{app.experience} years</span>
                        </div>
                        <div className={styles.appDetail}>
                          <span className={styles.detailLabel}>{t.admin.doctorApps.education}</span>
                          <span className={styles.detailValue}>{app.education}</span>
                        </div>
                        <div className={styles.appDetail}>
                          <span className={styles.detailLabel}>{t.admin.doctorApps.appliedAt}</span>
                          <span className={styles.detailValue}>{new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className={styles.appRight}>
                        <span className={[styles.statusBadge, styles[`status_${app.status}`]].join(' ')}>
                          {t.admin.doctorApps[app.status]}
                        </span>
                        <div className={styles.appDocs}>
                          <Eye size={13} />
                          {app.documents.length} docs
                        </div>
                        {app.status === 'pending' && (
                          <div className={styles.appActions}>
                            <Button size="sm" onClick={() => handleApprove(app.id)} icon={<Check size={14} />}>
                              {t.admin.doctorApps.approve}
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleReject(app.id)} icon={<X size={14} />}>
                              {t.admin.doctorApps.reject}
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Users Tab ── */}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className={styles.tabHeader}>
                  <h2 className={styles.tabTitle}>{t.admin.users.title}</h2>
                </div>
                <div className={styles.usersTable}>
                  <div className={styles.tableHeader}>
                    <span>{t.admin.users.name}</span>
                    <span>{t.admin.users.email}</span>
                    <span>{t.admin.users.role}</span>
                    <span>{t.admin.users.status}</span>
                    <span>{t.admin.users.joined}</span>
                    <span>{t.admin.users.actions}</span>
                  </div>
                  {users.map(u => (
                    <motion.div key={u.id} className={styles.tableRow} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <span className={styles.userNameCell}>
                        <Avatar name={`${u.firstName} ${u.lastName}`} size="xs" />
                        {u.firstName} {u.lastName}
                      </span>
                      <span className={styles.email}>{u.email}</span>
                      <span>
                        <span className={[styles.roleBadge, styles[`role_${u.role}`]].join(' ')}>{u.role}</span>
                      </span>
                      <span>
                        <span className={[styles.statusBadge, u.status === 'active' ? styles.status_approved : styles.status_rejected].join(' ')}>
                          {u.status}
                        </span>
                      </span>
                      <span className={styles.dateCell}>{u.joinedAt}</span>
                      <span className={styles.actionsCell}>
                        <button
                          className={[styles.actionBtn, u.status === 'banned' ? styles.unbanBtn : styles.banBtn].join(' ')}
                          onClick={() => handleBanUser(u.id, u.status)}
                          title={u.status === 'banned' ? t.admin.users.unban : t.admin.users.ban}
                        >
                          <Ban size={14} />
                        </button>
                        <button className={[styles.actionBtn, styles.adminBtn].join(' ')} title={t.admin.users.makeAdmin}>
                          <ShieldCheck size={14} />
                        </button>
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

