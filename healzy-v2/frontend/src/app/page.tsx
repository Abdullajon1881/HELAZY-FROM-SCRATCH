'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Search, Video, Sparkles, Shield, Star, ArrowRight,
  CheckCircle, Users, Calendar, Stethoscope, Brain,
  FileText, Bell, ChevronRight, Play,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useRouter } from 'next/navigation';
import { SPECIALTIES } from '@/types/doctor';
import { cn } from '@/utils/helpers';

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  if (inView && count === 0) {
    let start = 0;
    const step = Math.ceil(to / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 16);
  }

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Fade-in section ───────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const MOCK_DOCTORS = [
  { id: '1', name: 'Dr. Dilnoza Yusupova', specialty: 'Cardiologist', rating: 4.9, reviews: 234, price: 150000, exp: 12 },
  { id: '2', name: 'Dr. Bobur Toshmatov', specialty: 'Neurologist', rating: 4.7, reviews: 156, price: 120000, exp: 8 },
  { id: '3', name: 'Dr. Malika Rashidova', specialty: 'Pediatrician', rating: 4.8, reviews: 312, price: 100000, exp: 10 },
];

export default function HomePage() {
  const { t } = useT();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/doctors${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  };

  const features = [
    { icon: <Video className="w-6 h-6" />, color: 'from-blue-500 to-blue-600', ...t.home.features.video },
    { icon: <Brain className="w-6 h-6" />, color: 'from-violet-500 to-violet-600', ...t.home.features.ai },
    { icon: <FileText className="w-6 h-6" />, color: 'from-emerald-500 to-emerald-600', ...t.home.features.records },
    { icon: <Bell className="w-6 h-6" />, color: 'from-amber-500 to-amber-600', ...t.home.features.notifications },
  ];

  const steps = [
    { num: '01', icon: <Users className="w-6 h-6" />, ...t.home.howItWorks.step1 },
    { num: '02', icon: <Search className="w-6 h-6" />, ...t.home.howItWorks.step2 },
    { num: '03', icon: <Calendar className="w-6 h-6" />, ...t.home.howItWorks.step3 },
    { num: '04', icon: <CheckCircle className="w-6 h-6" />, ...t.home.howItWorks.step4 },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center bg-hero-pattern">
        {/* Gradient mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-primary-400/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary-600/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary-500/5 blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-16 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-medium mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Claude AI & Gemini
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="font-heading text-5xl sm:text-6xl font-extrabold leading-[1.08] mb-5"
            >
              {t.home.hero.title.split(' ').map((w, i) =>
                ['Fingertips', 'пальцах', 'bosishda'].includes(w) ? (
                  <span key={i} className="gradient-text">{' '}{w} </span>
                ) : (
                  <span key={i}>{w}{' '}</span>
                )
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-lg"
            >
              {t.home.hero.subtitle}
            </motion.p>

            {/* Search bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              onSubmit={handleSearch}
              className="flex gap-2 max-w-xl mb-6"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.doctors.search}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-2xl transition-colors shadow-glow"
              >
                {t.common.search}
              </button>
            </motion.form>

            {/* Quick specialty chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {SPECIALTIES.slice(0, 5).map((s) => (
                <Link
                  key={s}
                  href={`/doctors?specialty=${encodeURIComponent(s)}`}
                  className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-700 dark:hover:text-primary-300 rounded-xl transition-colors"
                >
                  {s}
                </Link>
              ))}
              <Link href="/doctors" className="px-3 py-1.5 text-xs text-primary-600 hover:underline flex items-center gap-1">
                More <ChevronRight className="w-3 h-3" />
              </Link>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-2xl transition-all shadow-glow hover:-translate-y-0.5"
              >
                <Stethoscope className="w-4 h-4" />
                {t.home.hero.cta}
              </Link>
              <Link
                href="/ai/symptom-checker"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border-color)] hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 font-semibold text-sm rounded-2xl transition-all hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-primary-600" />
                {t.home.hero.ctaAi}
              </Link>
            </motion.div>
          </div>

          {/* Right — floating card stack */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Main card */}
            <div className="card p-6 max-w-sm mx-auto shadow-dialog">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-sm">Today's Consultations</h3>
                <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 text-xs font-medium rounded-lg">Live</span>
              </div>
              {MOCK_DOCTORS.map((d, i) => (
                <div key={d.id} className={cn('flex items-center gap-3 py-3', i < 2 && 'border-b border-[var(--border-color)]')}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: ['#0d9488','#7c3aed','#0891b2'][i] }}>
                    {d.name.split(' ')[1][0]}{d.name.split(' ')[2]?.[0] || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{d.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{d.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium">{d.rating}</span>
                  </div>
                </div>
              ))}
              <Link href="/doctors" className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors">
                View All Doctors <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-6 card px-4 py-3 shadow-card-hover"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Appointment Confirmed</p>
                  <p className="text-xs text-[var(--text-muted)]">Today, 14:30</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute -bottom-4 -right-4 card px-4 py-3 shadow-card-hover"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold">AI Analysis Ready</p>
                  <p className="text-xs text-primary-500">View results →</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { label: t.home.stats.doctors, value: 500, suffix: '+' },
              { label: t.home.stats.patients, value: 50000, suffix: '+' },
              { label: t.home.stats.consultations, value: 120000, suffix: '+' },
              { label: t.home.stats.rating, value: 4.9, suffix: '/5' },
            ].map((stat) => (
              <FadeIn key={stat.label} className="text-center">
                <p className="font-heading text-4xl font-extrabold gradient-text mb-1">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="font-heading text-4xl font-bold mb-3">{t.home.features.title}</h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{t.home.features.subtitle}</p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.08}>
              <div className="card p-6 h-full hover:shadow-card-hover transition-all hover:-translate-y-1 group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-heading font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="font-heading text-4xl font-bold mb-3">{t.home.howItWorks.title}</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.1}>
                <div className="relative text-center">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px border-t-2 border-dashed border-[var(--border-color)]" />
                  )}
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600">
                      {step.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center font-heading">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP DOCTORS ──────────────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-heading text-4xl font-bold mb-2">{t.home.doctors.title}</h2>
            <p className="text-[var(--text-secondary)]">{t.home.doctors.subtitle}</p>
          </div>
          <Link href="/doctors" className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
            {t.home.doctors.viewAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_DOCTORS.map((doc, i) => (
            <FadeIn key={doc.id} delay={i * 0.1}>
              <Link href={`/doctors/${doc.id}`}>
                <div className="card p-5 hover:shadow-card-hover hover:-translate-y-1 transition-all cursor-pointer">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: ['#0d9488','#7c3aed','#0891b2'][i] }}>
                      {doc.name.split(' ')[1][0]}{doc.name.split(' ')[2]?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold truncate">{doc.name}</h3>
                      <p className="text-sm text-primary-600">{doc.specialty}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold">{doc.rating}</span>
                        <span className="text-xs text-[var(--text-muted)]">({doc.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">{doc.exp} years exp.</p>
                      <p className="text-sm font-bold text-primary-600">{(doc.price / 1000).toFixed(0)}K so'm</p>
                    </div>
                    <span className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-xl">Book Now</span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/doctors" className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border-color)] hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 rounded-2xl text-sm font-medium transition-colors">
            {t.home.doctors.viewAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── AI BANNER ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="animated-gradient rounded-3xl p-8 sm:p-12 text-white text-center overflow-hidden relative">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 50%), radial-gradient(circle at 70% 50%, white 0%, transparent 50%)' }} />
              <div className="relative">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-3">{t.ai.title}</h2>
                <p className="text-white/80 mb-6 max-w-lg mx-auto">{t.ai.subtitle}</p>
                <Link
                  href="/ai/symptom-checker"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-primary-700 font-bold rounded-2xl hover:bg-white/90 transition-colors shadow-lg"
                >
                  <Sparkles className="w-4 h-4" /> {t.home.hero.ctaAi}
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <FadeIn className="max-w-3xl mx-auto px-4 text-center">
          <Shield className="w-10 h-10 text-primary-600 mx-auto mb-4" />
          <h2 className="font-heading text-4xl font-bold mb-3">{t.home.cta.title}</h2>
          <p className="text-[var(--text-secondary)] mb-7">{t.home.cta.subtitle}</p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-base rounded-2xl transition-all shadow-glow hover:-translate-y-1"
          >
            {t.home.cta.button} <ArrowRight className="w-5 h-5" />
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
