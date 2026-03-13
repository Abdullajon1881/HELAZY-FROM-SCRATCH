import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  MessageSquare, Brain, Shield, Search,
  Star, ArrowRight, ChevronRight, Play,
  Activity, Clock, Users, Award
} from 'lucide-react';
import { useT } from '../../hooks/useT';
import { Doctors } from '../../services';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import styles from './HomePage.module.css';

// Animated counter
function Counter({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });
  useEffect(() => {
    if (!inView) return;
    const end = parseInt(value);
    const step = Math.ceil(end / 40);
    let cur = 0;
    const id = setInterval(() => {
      cur = Math.min(cur + step, end);
      setCount(cur);
      if (cur >= end) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [inView, value]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Stagger wrapper
function StaggerIn({ children, className }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {children}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Doctor Card ──────────────────────────────────────────────────────────────
function DoctorCard({ doctor, delay = 0 }) {
  const { t, language } = useT();
  const navigate = useNavigate();
  const specialty = language === 'ru' ? doctor.specialtyRu : language === 'uz' ? doctor.specialtyUz : doctor.specialty;

  return (
    <motion.div className={styles.doctorCard} variants={fadeUp} whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
      <div className={styles.doctorCardTop}>
        <Avatar name={`${doctor.firstName} ${doctor.lastName}`} size="xl" />
        <div className={styles.doctorAvailBadge}>
          <span className={[styles.availDot, doctor.isAvailable ? styles.availGreen : styles.availGray].join(' ')} />
          {doctor.isAvailable ? t.doctors.card.available : t.doctors.card.busy}
        </div>
      </div>
      <div className={styles.doctorCardBody}>
        <h3>{doctor.firstName} {doctor.lastName}</h3>
        <p className={styles.doctorSpecialty}>{specialty}</p>
        <div className={styles.doctorMeta}>
          <span><Star size={13} fill="currentColor" />{doctor.rating}</span>
          <span>·</span>
          <span>{doctor.experience} {t.doctors.card.experience}</span>
          <span>·</span>
          <span>{doctor.consultationCount.toLocaleString()} {t.doctors.card.consultations}</span>
        </div>
        <div className={styles.doctorLangs}>
          {doctor.languages.slice(0, 3).map(l => (
            <span key={l} className={styles.langTag}>{l}</span>
          ))}
        </div>
      </div>
      <div className={styles.doctorCardFooter}>
        <Button variant="outline" size="sm" onClick={() => navigate(`/doctors/${doctor.id}`)}>
          {t.doctors.card.viewProfile}
        </Button>
        <Button size="sm" onClick={() => navigate(`/doctors/${doctor.id}`)}>
          {t.doctors.card.bookNow}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const { t } = useT();
  const navigate = useNavigate();
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  useEffect(() => {
    Doctors.getFeatured().then(res => setFeaturedDoctors(res.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
  };

  const features = [
    { icon: <MessageSquare size={24} />, key: 'chat', color: '#2D6A4F' },
    { icon: <Brain size={24} />, key: 'ai', color: '#0F766E' },
    { icon: <Shield size={24} />, key: 'secure', color: '#7C3AED' },
    { icon: <Search size={24} />, key: 'search', color: '#D97706' },
  ];

  const stats = [
    { icon: <Users size={20} />, value: 500, suffix: '+', label: t.home.hero.stats.doctors },
    { icon: <Activity size={20} />, value: 50000, suffix: '+', label: t.home.hero.stats.consultations },
    { icon: <Award size={20} />, value: 98, suffix: '%', label: t.home.hero.stats.satisfaction },
    { icon: <Clock size={20} />, value: 24, suffix: '/7', label: t.home.hero.stats.available },
  ];

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero} ref={heroRef}>
        <motion.div className={styles.heroBg} style={{ y: heroY }} aria-hidden>
          <div className={styles.heroBlob1} />
          <div className={styles.heroBlob2} />
          <div className={styles.heroGrid} />
        </motion.div>

        <div className={`container ${styles.heroInner}`}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className={styles.heroBadge}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <span className={styles.heroBadgeDot} />
              {t.home.hero.badge}
            </motion.div>

            <h1 className={styles.heroTitle}>
              {t.home.hero.title.split('\n').map((line, i) => (
                <span key={i}>
                  {i === 0 ? line : <em>{line}</em>}
                  {i < t.home.hero.title.split('\n').length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className={styles.heroSubtitle}>{t.home.hero.subtitle}</p>

            {/* Hero search */}
            <form className={styles.heroSearch} onSubmit={handleSearch}>
              <div className={styles.searchInputWrap}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  placeholder={t.doctors.search.placeholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" iconRight={<ArrowRight size={16} />}>
                {t.home.hero.cta}
              </Button>
            </form>

            <div className={styles.heroCtas}>
              <Link to="/ai">
                <Button variant="secondary" size="md" icon={<Brain size={16} />}>
                  {t.home.hero.ctaSecondary}
                </Button>
              </Link>
              <button className={styles.watchDemo}>
                <span className={styles.playBtn}><Play size={12} fill="currentColor" /></span>
                Watch demo
              </button>
            </div>
          </motion.div>

          {/* Floating preview card */}
          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <div className={styles.previewDots}>
                  <span /><span /><span />
                </div>
                <span className={styles.previewTitle}>Live Consultation</span>
              </div>
              <div className={styles.previewChat}>
                {[
                  { sender: 'doctor', text: 'Hello! How can I help you today?' },
                  { sender: 'patient', text: "I've had a headache for 3 days." },
                  { sender: 'doctor', text: 'Let me ask you a few questions to better understand your condition.' },
                ].map((m, i) => (
                  <motion.div
                    key={i}
                    className={[styles.previewMsg, m.sender === 'patient' ? styles.previewMsgRight : ''].join(' ')}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.15 }}
                  >
                    {m.text}
                  </motion.div>
                ))}
                <div className={styles.previewTyping}>
                  <span /><span /><span />
                </div>
              </div>
              <div className={styles.previewDoctorRow}>
                <Avatar name="Dilnoza Yusupova" size="sm" online />
                <div>
                  <div className={styles.previewDoctorName}>Dr. Dilnoza Yusupova</div>
                  <div className={styles.previewDoctorSpec}>Cardiologist · Online</div>
                </div>
              </div>
            </div>

            {/* Floating stat cards */}
            <motion.div className={styles.floatStat} style={{ top: '5%', right: '-10%' }}
              animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              <Star size={14} fill="currentColor" style={{ color: '#F59E0B' }} />
              <span>4.9 Rating</span>
            </motion.div>
            <motion.div className={styles.floatStat} style={{ bottom: '10%', left: '-12%' }}
              animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 1 }}>
              <Users size={14} />
              <span>500+ Doctors</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <div className={styles.statsStrip}>
          <div className="container">
            <div className={styles.statsRow}>
              {stats.map((s, i) => (
                <div key={i} className={styles.statItem}>
                  <div className={styles.statIcon}>{s.icon}</div>
                  <div className={styles.statNum}>
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className={styles.statText}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.features}>
        <div className="container">
          <StaggerIn className={styles.sectionHeader}>
            <motion.h2 variants={fadeUp} className={styles.sectionTitle}>{t.home.features.title}</motion.h2>
            <motion.p variants={fadeUp} className={styles.sectionSubtitle}>{t.home.features.subtitle}</motion.p>
          </StaggerIn>
          <StaggerIn className={styles.featuresGrid}>
            {features.map(f => (
              <motion.div key={f.key} className={styles.featureCard} variants={fadeUp} whileHover={{ y: -4 }}>
                <div className={styles.featureIcon} style={{ background: `${f.color}18`, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{t.home.features[f.key].title}</h3>
                <p>{t.home.features[f.key].desc}</p>
              </motion.div>
            ))}
          </StaggerIn>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={styles.howItWorks}>
        <div className="container">
          <StaggerIn className={styles.sectionHeader}>
            <motion.h2 variants={fadeUp} className={styles.sectionTitle}>{t.home.howItWorks.title}</motion.h2>
          </StaggerIn>
          <div className={styles.stepsRow}>
            {t.home.howItWorks.steps.map((step, i) => (
              <motion.div key={i} className={styles.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <div className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < t.home.howItWorks.steps.length - 1 && (
                  <ChevronRight className={styles.stepArrow} size={20} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Doctors ── */}
      <section className={styles.topDoctors}>
        <div className="container">
          <div className={styles.sectionHeaderRow}>
            <div>
              <h2 className={styles.sectionTitle}>{t.home.topDoctors.title}</h2>
            </div>
            <Link to="/doctors">
              <Button variant="outline" size="sm" iconRight={<ArrowRight size={14} />}>
                {t.home.topDoctors.viewAll}
              </Button>
            </Link>
          </div>
          <StaggerIn className={styles.doctorsGrid}>
            {featuredDoctors.map(doc => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </StaggerIn>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <motion.div className={styles.ctaBox}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2>{t.home.cta.title}</h2>
            <p>{t.home.cta.subtitle}</p>
            <Link to="/register">
              <Button size="xl" variant="accent" iconRight={<ArrowRight size={18} />}>
                {t.home.cta.button}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

