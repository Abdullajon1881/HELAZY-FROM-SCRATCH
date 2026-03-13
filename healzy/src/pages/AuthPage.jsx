import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Stethoscope, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import { useT } from '../i18n/useT';
import { Auth } from '../services';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import styles from './AuthPage.module.css';

// ─── Shared animated panel ────────────────────────────────────────────────────
function AuthLayout({ children, title, subtitle }) {
  return (
    <div className={styles.page}>
      {/* Decorative left panel */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.brandMark}>
            <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="white" fillOpacity="0.2" />
              <path d="M14 7v14M7 14h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className={styles.brandName}>Healzy</span>
          </div>
          <div className={styles.leftHero}>
            <h2>Healthcare<br />at your fingertips</h2>
            <p>Connect with certified doctors, get AI-powered insights, and take control of your health — all from one platform.</p>
          </div>
          <div className={styles.leftStats}>
            {[
              { value: '500+', label: 'Doctors' },
              { value: '50K+', label: 'Patients' },
              { value: '4.9★', label: 'Rating' },
            ].map(s => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
          {/* Floating cards decoration */}
          <div className={styles.floatingCards}>
            <div className={styles.floatCard} style={{ top: '20%', right: '-20px' }}>
              <HeartPulse size={16} />
              <span>Live consultation</span>
            </div>
            <div className={styles.floatCard} style={{ bottom: '30%', right: '-30px' }}>
              <Stethoscope size={16} />
              <span>AI Diagnosis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <motion.div
          className={styles.formBox}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>{title}</h1>
            <p className={styles.formSubtitle}>{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(s => s.login);
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await Auth.getCSRF();
      const res = await Auth.login(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.firstName}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Invalid credentials';
      toast.error(msg);
      setErrors({ password: msg });
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role) => {
    const creds = {
      patient: { email: 'patient@healzy.uz', password: 'password123' },
      doctor: { email: 'doctor@healzy.uz', password: 'password123' },
      admin: { email: 'admin@healzy.uz', password: 'password123' },
    };
    setForm(creds[role]);
    setLoading(true);
    try {
      await Auth.getCSRF();
      const res = await Auth.login(creds[role]);
      login(res.data.user, res.data.token);
      toast.success(`Signed in as ${role}!`);
      navigate(from, { replace: true });
    } catch {
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t.auth.login.title} subtitle={t.auth.login.subtitle}>
      {/* Demo accounts */}
      <div className={styles.demoSection}>
        <span className={styles.demoLabel}>Demo accounts</span>
        <div className={styles.demoBtns}>
          {['patient', 'doctor', 'admin'].map(role => (
            <button key={role} className={styles.demoBtn} onClick={() => demoLogin(role)} disabled={loading}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label={t.auth.login.email}
          type="email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          icon={<Mail size={16} />}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Input
          label={t.auth.login.password}
          type={showPass ? 'text' : 'password'}
          value={form.password}
          onChange={e => set('password', e.target.value)}
          icon={<Lock size={16} />}
          iconRight={
            <button type="button" onClick={() => setShowPass(s => !s)} className={styles.passToggle}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <div className={styles.forgotRow}>
          <Link to="/reset-password" className={styles.forgot}>{t.auth.login.forgotPassword}</Link>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg" iconRight={<ArrowRight size={16} />}>
          {t.auth.login.submit}
        </Button>
      </form>

      <p className={styles.switchAuth}>
        {t.auth.login.noAccount}{' '}
        <Link to="/register">{t.auth.login.register}</Link>
      </p>
    </AuthLayout>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  const [step, setStep] = useState(1); // 1: details, 2: role select
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'patient',
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validateStep1 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await Auth.getCSRF();
      const res = await Auth.register(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome to Healzy, ${res.data.user.firstName}!`);
      navigate('/dashboard');
    } catch (err) {
      const data = err?.response?.data || {};
      const msg = data.email?.[0] || data.error || 'Registration failed';
      toast.error(msg);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t.auth.register.title} subtitle={t.auth.register.subtitle}>
      {/* Progress */}
      <div className={styles.progress}>
        {[1, 2].map(i => (
          <div key={i} className={[styles.progressStep, step >= i ? styles.progressActive : ''].join(' ')} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className={styles.form}
          >
            <div className={styles.nameRow}>
              <Input label={t.auth.register.firstName} value={form.firstName}
                onChange={e => set('firstName', e.target.value)} error={errors.firstName}
                icon={<User size={16} />} placeholder="Amir" />
              <Input label={t.auth.register.lastName} value={form.lastName}
                onChange={e => set('lastName', e.target.value)} error={errors.lastName}
                placeholder="Karimov" />
            </div>
            <Input label={t.auth.register.email} type="email" value={form.email}
              onChange={e => set('email', e.target.value)} error={errors.email}
              icon={<Mail size={16} />} placeholder="you@example.com" />
            <Input label={t.auth.register.password}
              type={showPass ? 'text' : 'password'} value={form.password}
              onChange={e => set('password', e.target.value)} error={errors.password}
              icon={<Lock size={16} />}
              iconRight={<button type="button" onClick={() => setShowPass(s => !s)} className={styles.passToggle}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
              placeholder="Min 8 characters" />
            <Input label={t.auth.register.confirmPassword}
              type={showPass ? 'text' : 'password'} value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)} error={errors.confirmPassword}
              icon={<Lock size={16} />} placeholder="Repeat password" />
            <Button onClick={handleNext} fullWidth size="lg" iconRight={<ArrowRight size={16} />}>
              {t.common.next}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className={styles.form}
          >
            <p className={styles.roleLabel}>{t.auth.register.role}</p>
            <div className={styles.roleCards}>
              {[
                { value: 'patient', label: t.auth.register.patient, icon: '🏥', desc: 'Find doctors, get consultations, track your health' },
                { value: 'doctor', label: t.auth.register.doctor, icon: '👨‍⚕️', desc: 'See patients, manage consultations, grow your practice' },
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  className={[styles.roleCard, form.role === r.value ? styles.roleCardActive : ''].join(' ')}
                  onClick={() => set('role', r.value)}
                >
                  <span className={styles.roleIcon}>{r.icon}</span>
                  <span className={styles.roleName}>{r.label}</span>
                  <span className={styles.roleDesc}>{r.desc}</span>
                  {form.role === r.value && <span className={styles.roleCheck}>✓</span>}
                </button>
              ))}
            </div>
            <p className={styles.terms}>{t.auth.register.terms}</p>
            <div className={styles.stepBtns}>
              <Button variant="secondary" onClick={() => setStep(1)} size="lg">{t.common.back}</Button>
              <Button onClick={handleSubmit} loading={loading} size="lg" iconRight={<ArrowRight size={16} />} fullWidth>
                {t.auth.register.submit}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className={styles.switchAuth}>
        {t.auth.register.hasAccount}{' '}
        <Link to="/login">{t.auth.register.login}</Link>
      </p>
    </AuthLayout>
  );
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export function ResetPasswordPage() {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await Auth.resetPasswordRequest(email);
      setSent(true);
      toast.success(t.auth.resetPassword.success);
    } catch {
      toast.error('Failed to send reset link. Check the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t.auth.resetPassword.title} subtitle={t.auth.resetPassword.subtitle}>
      {sent ? (
        <motion.div className={styles.successBox} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className={styles.successIcon}>✉️</div>
          <h3>Check your email</h3>
          <p>We sent a password reset link to <strong>{email}</strong></p>
          <Link to="/login">
            <Button variant="outline" fullWidth>{t.auth.resetPassword.back}</Button>
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label={t.auth.resetPassword.email}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            placeholder="you@example.com"
          />
          <Button type="submit" fullWidth loading={loading} size="lg">{t.auth.resetPassword.submit}</Button>
          <Link to="/login">
            <Button variant="ghost" fullWidth>{t.auth.resetPassword.back}</Button>
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
