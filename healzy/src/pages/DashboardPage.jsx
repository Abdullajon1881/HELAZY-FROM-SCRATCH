import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Brain, Upload, CheckCircle, Star, Calendar, Users } from 'lucide-react';
import { useT } from '../i18n/useT';
import { useAuthStore } from '../store';
import { Doctors } from '../services';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import styles from './DashboardPage.module.css';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

// ─── Patient Dashboard ────────────────────────────────────────────────────────
function PatientDashboard({ user, t }) {
  const navigate = useNavigate();

  const quickActions = [
    { icon: <Search size={22} />, label: t.nav.doctors, to: '/doctors', color: '#2D6A4F', bg: 'var(--color-primary-muted)' },
    { icon: <MessageSquare size={22} />, label: t.nav.consultations, to: '/chat', color: '#0F766E', bg: 'var(--color-teal-muted)' },
    { icon: <Brain size={22} />, label: t.nav.aiAssistant, to: '/ai', color: '#7C3AED', bg: '#f3e8ff' },
  ];

  const recentConsultations = [
    { doctor: 'Dr. Dilnoza Yusupova', spec: 'Cardiologist', date: 'Jan 20, 2025', status: 'active', id: 1 },
    { doctor: 'Dr. Malika Rashidova', spec: 'Pediatrician', date: 'Jan 15, 2025', status: 'ended', id: 2 },
  ];

  return (
    <div className={styles.dashContent}>
      {/* Welcome Banner */}
      <motion.div className={styles.welcomeBanner} variants={fadeUp} initial="hidden" animate="visible">
        <div className={styles.welcomeLeft}>
          <Avatar name={`${user.firstName} ${user.lastName}`} size="xl" />
          <div>
            <p className={styles.welcomeGreeting}>{t.patient.dashboard.welcome} 👋</p>
            <h1 className={styles.welcomeName}>{user.firstName} {user.lastName}</h1>
            <p className={styles.welcomeEmail}>{user.email}</p>
          </div>
        </div>
        <div className={styles.welcomeStats}>
          {[
            { val: '3', label: 'Consultations' },
            { val: '2', label: t.patient.dashboard.myDoctors },
            { val: '12', label: 'AI Chats' },
          ].map((s, i) => (
            <div key={i} className={styles.wStat}>
              <span className={styles.wStatVal}>{s.val}</span>
              <span className={styles.wStatLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActions}>
          {quickActions.map((a, i) => (
            <motion.div
              key={a.to}
              className={styles.quickAction}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
              onClick={() => navigate(a.to)}
            >
              <div className={styles.qaIcon} style={{ background: a.bg, color: a.color }}>{a.icon}</div>
              <span className={styles.qaLabel}>{a.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Recent Consultations */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.patient.dashboard.recentConsultations}</h2>
            <Link to="/chat" className={styles.viewAll}>View all →</Link>
          </div>
          <div className={styles.cardList}>
            {recentConsultations.map((c, i) => (
              <motion.div key={i} className={styles.listCard} custom={i} variants={fadeUp} initial="hidden" animate="visible">
                <Avatar name={c.doctor} size="md" online={c.status === 'active'} />
                <div className={styles.listCardInfo}>
                  <span className={styles.listCardTitle}>{c.doctor}</span>
                  <span className={styles.listCardSub}>{c.spec} · {c.date}</span>
                </div>
                <span className={[styles.statusPill, c.status === 'active' ? styles.pillActive : styles.pillEnded].join(' ')}>
                  {c.status}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>Open</Button>
              </motion.div>
            ))}
            {recentConsultations.length === 0 && (
              <div className={styles.emptyState}>
                <p>{t.patient.dashboard.noConsultations}</p>
                <Button size="sm" onClick={() => navigate('/doctors')}>{t.patient.dashboard.findDoctor}</Button>
              </div>
            )}
          </div>
        </div>

        {/* Health Tip + AI promo */}
        <div className={styles.sideWidgets}>
          <motion.div className={styles.tipCard} variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <div className={styles.tipIcon}>💡</div>
            <div>
              <h3>Daily Health Tip</h3>
              <p>Drink at least 8 glasses of water daily. Proper hydration improves energy levels, concentration, and organ function.</p>
            </div>
          </motion.div>

          <motion.div className={styles.aiPromoCard} variants={fadeUp} initial="hidden" animate="visible" custom={2}
            onClick={() => navigate('/ai')} style={{ cursor: 'pointer' }}>
            <div className={styles.aiPromoIcon}>✦</div>
            <div>
              <h3>Try Healzy AI</h3>
              <p>Ask about symptoms, medications, or get instant health advice — available 24/7.</p>
            </div>
            <span className={styles.aiPromoArrow}>→</span>
          </motion.div>

          <motion.div className={styles.ratingCard} variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <Star size={18} fill="currentColor" style={{ color: '#F59E0B' }} />
            <div>
              <h3>Rate your last consultation</h3>
              <p>How was your visit with Dr. Dilnoza?</p>
            </div>
            <div className={styles.starRow}>
              {[1,2,3,4,5].map(n => (
                <button key={n} className={styles.starBtn}>★</button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Doctor Application Form ──────────────────────────────────────────────────
function DoctorApplicationForm({ t }) {
  const [form, setForm] = useState({ specialty: '', experience: '', education: '', bio: '' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { specialties } = t;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.specialty || !form.experience || !form.education) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach(f => formData.append('documents', f));
      await Doctors.submitApplication(formData);
      setSubmitted(true);
      toast.success('Application submitted!');
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <motion.div className={styles.pendingCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <CheckCircle size={60} className={styles.pendingIcon} />
      <h2>{t.doctorDashboard.becomeDoctor.pending}</h2>
      <p>{t.doctorDashboard.becomeDoctor.pendingDesc}</p>
      <div className={styles.pendingTimeline}>
        {['Application received', 'Document review (1–2 days)', 'Approval & activation'].map((step, i) => (
          <div key={i} className={styles.timelineStep}>
            <div className={[styles.timelineDot, i === 0 ? styles.timelineDotDone : ''].join(' ')}>
              {i === 0 ? '✓' : i + 1}
            </div>
            <span className={styles.timelineLabel}>{step}</span>
            {i < 2 && <div className={styles.timelineLine} />}
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className={styles.applyWrapper}>
      <motion.div className={styles.applyHeader} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.applyBadge}>🩺 Doctor Application</div>
        <h1>{t.doctorDashboard.becomeDoctor.title}</h1>
        <p>{t.doctorDashboard.becomeDoctor.subtitle}</p>
      </motion.div>

      <motion.form
        className={styles.applyForm}
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.specialty} *</label>
            <select
              className={styles.formSelect}
              value={form.specialty}
              onChange={e => set('specialty', e.target.value)}
              required
            >
              <option value="">Select specialty...</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Input
            label={`${t.doctorDashboard.becomeDoctor.experience} *`}
            type="number"
            value={form.experience}
            onChange={e => set('experience', e.target.value)}
            placeholder="e.g. 10"
            min="0" max="60"
            required
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.education} *</label>
          <textarea
            className={styles.formTextarea}
            value={form.education}
            onChange={e => set('education', e.target.value)}
            placeholder="e.g. Tashkent Medical Academy, MD — 2010&#10;Residency: National Cardiology Center — 2014"
            rows={3}
            required
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.bio}</label>
          <textarea
            className={styles.formTextarea}
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            placeholder="Tell patients about your experience and approach to care..."
            rows={4}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>{t.doctorDashboard.becomeDoctor.documents}</label>
          <div
            className={styles.uploadZone}
            onClick={() => document.getElementById('docUpload').click()}
          >
            <Upload size={30} className={styles.uploadIcon} />
            <p>Click to upload or drag & drop</p>
            <span>Diploma, license, certificates — PDF, JPG, PNG (max 10MB each)</span>
            <input
              id="docUpload"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)])}
            />
          </div>
          {files.length > 0 && (
            <div className={styles.fileList}>
              {files.map((f, i) => (
                <div key={i} className={styles.fileChip}>
                  <span>📄 {f.name}</span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" size="lg" loading={loading} fullWidth>
          {t.doctorDashboard.becomeDoctor.submit}
        </Button>
      </motion.form>
    </div>
  );
}

// ─── Doctor Dashboard (approved) ─────────────────────────────────────────────
function DoctorDashboard({ user, t }) {
  const navigate = useNavigate();
  return (
    <div className={styles.dashContent}>
      <motion.div className={styles.welcomeBanner} variants={fadeUp} initial="hidden" animate="visible">
        <div className={styles.welcomeLeft}>
          <Avatar name={`${user.firstName} ${user.lastName}`} size="xl" />
          <div>
            <p className={styles.welcomeGreeting}>Doctor Dashboard 👨‍⚕️</p>
            <h1 className={styles.welcomeName}>Dr. {user.firstName} {user.lastName}</h1>
            <p className={styles.welcomeEmail}>{user.email}</p>
          </div>
        </div>
        <div className={styles.welcomeStats}>
          {[
            { val: '0', label: t.doctorDashboard.myPatients },
            { val: '0', label: t.doctorDashboard.pendingRequests },
          ].map((s, i) => (
            <div key={i} className={styles.wStat}>
              <span className={styles.wStatVal}>{s.val}</span>
              <span className={styles.wStatLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.doctorDashboard.myPatients}</h2>
        <div className={styles.emptyState}>
          <Users size={40} style={{ color: 'var(--color-text-tertiary)', marginBottom: 12 }} />
          <p>No patients yet. Your profile is live — patients can find and contact you.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/doctors')}>View your profile</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t } = useT();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  // Doctor who hasn't applied yet → show application form
  if (user.role === 'doctor' && !user.isApproved && !user.isPending) {
    return (
      <div className={styles.page}>
        <div className="container">
          <DoctorApplicationForm t={t} />
        </div>
      </div>
    );
  }

  // Doctor pending approval
  if (user.role === 'doctor' && user.isPending) {
    return (
      <div className={styles.page}>
        <div className="container">
          <motion.div className={styles.pendingCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <CheckCircle size={60} className={styles.pendingIcon} />
            <h2>{t.doctorDashboard.becomeDoctor.pending}</h2>
            <p>{t.doctorDashboard.becomeDoctor.pendingDesc}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {user.role === 'patient' && <PatientDashboard user={user} t={t} />}
        {user.role === 'doctor' && <DoctorDashboard user={user} t={t} />}
        {user.role === 'admin' && (
          <div className={styles.dashContent}>
            <motion.div className={styles.welcomeBanner} variants={fadeUp} initial="hidden" animate="visible">
              <div className={styles.welcomeLeft}>
                <Avatar name={`${user.firstName} ${user.lastName}`} size="xl" />
                <div>
                  <p className={styles.welcomeGreeting}>Admin Panel 🛡️</p>
                  <h1 className={styles.welcomeName}>{user.firstName} {user.lastName}</h1>
                  <p className={styles.welcomeEmail}>{user.email}</p>
                </div>
              </div>
            </motion.div>
            <div className={styles.section}>
              <Button onClick={() => navigate('/admin')} size="lg" icon={<Search size={16}/>}>
                Go to Admin Panel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
