import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Star, X, ChevronDown, MessageSquare, ArrowLeft } from 'lucide-react';
import { useT } from '../i18n/useT';
import { Doctors, Chat } from '../services';
import { useAuthStore } from '../store';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import styles from './DoctorsPage.module.css';
import toast from 'react-hot-toast';

// ─── Doctor Card ──────────────────────────────────────────────────────────────
function DoctorCard({ doctor }) {
  const { t, language } = useT();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [starting, setStarting] = useState(false);

  const specialty = language === 'ru' ? doctor.specialtyRu : language === 'uz' ? doctor.specialtyUz : doctor.specialty;

  const handleConsult = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: '/doctors' } } }); return; }
    setStarting(true);
    try {
      const res = await Chat.startConsultation(doctor.id);
      navigate(`/chat?conversation=${res.data.id}`);
      toast.success(`Consultation started with Dr. ${doctor.firstName}!`);
    } catch {
      toast.error('Failed to start consultation. Please try again.');
    } finally { setStarting(false); }
  };

  return (
    <motion.div
      className={styles.card}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/doctors/${doctor.id}`)}
    >
      <div className={styles.cardLeft}>
        <div className={styles.cardAvatar}>
          <Avatar name={`${doctor.firstName} ${doctor.lastName}`} size="lg" />
          {doctor.isVerified && <span className={styles.verifiedBadge} title="Verified">✓</span>}
        </div>
        <div className={styles.onlineRow}>
          <span className={[styles.onlineDot, doctor.isAvailable ? styles.online : styles.offline].join(' ')} />
          <span className={styles.onlineText}>{doctor.isAvailable ? t.doctors.card.available : t.doctors.card.busy}</span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardName}>Dr. {doctor.firstName} {doctor.lastName}</h3>
            <p className={styles.cardSpec}>{specialty}</p>
          </div>
          <div className={styles.ratingBadge}>
            <Star size={13} fill="currentColor" />
            <span>{doctor.rating}</span>
            <span className={styles.ratingCount}>({doctor.reviewCount})</span>
          </div>
        </div>

        <p className={styles.cardBio} onClick={e => e.stopPropagation()}>
          {(language === 'ru' ? doctor.bioRu : language === 'uz' ? doctor.bioUz : doctor.bio)?.slice(0, 120)}...
        </p>

        <div className={styles.cardStats}>
          <span className={styles.cardStat}><strong>{doctor.experience}</strong> {t.doctors.card.experience}</span>
          <span className={styles.cardStatDiv} />
          <span className={styles.cardStat}><strong>{doctor.consultationCount.toLocaleString()}</strong> {t.doctors.card.consultations}</span>
          <span className={styles.cardStatDiv} />
          <div className={styles.langTags}>
            {doctor.languages.slice(0, 2).map(l => <span key={l} className={styles.langTag}>{l}</span>)}
          </div>
        </div>
      </div>

      <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
        <div className={styles.priceTag}>
          {doctor.price?.toLocaleString()} <span>UZS</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/doctors/${doctor.id}`)}>
          {t.doctors.card.viewProfile}
        </Button>
        <Button size="sm" loading={starting} icon={<MessageSquare size={14} />} onClick={handleConsult}>
          {t.doctors.card.bookNow}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Doctors Search Page ──────────────────────────────────────────────────────
export function DoctorsPage() {
  const { t } = useT();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    specialty: '',
    available: false,
    sort: 'rating',
    minRating: '',
  });

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.specialty) params.specialty = filters.specialty;
      if (filters.available) params.available = true;
      if (filters.sort) params.sort = filters.sort;
      const res = await Doctors.search(params);
      setDoctors(res.data.results || res.data);
      setTotal(res.data.count || (res.data.results || res.data).length);
    } catch {
      toast.error('Failed to load doctors');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const clearFilters = () => setFilters({ search: '', specialty: '', available: false, sort: 'rating', minRating: '' });

  const { specialties } = t;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className={styles.pageTitle}>{t.doctors.search.title}</h1>
            <p className={styles.pageSubtitle}>{t.doctors.search.subtitle}</p>
          </motion.div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar Filters */}
          <aside className={[styles.sidebar, filtersOpen ? styles.sidebarOpen : ''].join(' ')}>
            <div className={styles.sidebarHeader}>
              <h3>{t.doctors.search.filter || 'Filters'}</h3>
              <button onClick={() => setFiltersOpen(false)} className={styles.closeSidebar}><X size={18} /></button>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>{t.doctors.search.filterSpecialty}</label>
              <select
                className={styles.filterSelect}
                value={filters.specialty}
                onChange={e => setFilter('specialty', e.target.value)}
              >
                <option value="">All Specialties</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>{t.doctors.search.sort}</label>
              <div className={styles.sortOptions}>
                {Object.entries(t.doctors.search.sortOptions).map(([k, label]) => (
                  <button
                    key={k}
                    className={[styles.sortBtn, filters.sort === k ? styles.sortBtnActive : ''].join(' ')}
                    onClick={() => setFilter('sort', k)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <label className={[styles.filterLabel, styles.checkLabel].join(' ')}>
                <input
                  type="checkbox"
                  checked={filters.available}
                  onChange={e => setFilter('available', e.target.checked)}
                  className={styles.checkbox}
                />
                {t.doctors.search.filterAvailable}
              </label>
            </div>

            <Button variant="ghost" size="sm" onClick={clearFilters} fullWidth>
              {t.common.clear}
            </Button>
          </aside>

          {/* Main content */}
          <main className={styles.main}>
            {/* Search bar */}
            <div className={styles.searchBar}>
              <div className={styles.searchInputWrap}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  placeholder={t.doctors.search.placeholder}
                  value={filters.search}
                  onChange={e => setFilter('search', e.target.value)}
                />
                {filters.search && (
                  <button onClick={() => setFilter('search', '')} className={styles.clearSearch}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <button className={styles.filterToggle} onClick={() => setFiltersOpen(o => !o)}>
                <SlidersHorizontal size={18} />
                {t.common.filter}
              </button>
            </div>

            {/* Results count */}
            <div className={styles.resultsRow}>
              {!loading && (
                <span className={styles.resultsCount}>
                  <strong>{total}</strong> {t.doctors.search.results}
                </span>
              )}
            </div>

            {/* Doctor list */}
            {loading ? (
              <div className={styles.skeletonList}>
                {[1,2,3].map(i => <div key={i} className={[styles.skeletonCard, 'skeleton'].join(' ')} />)}
              </div>
            ) : doctors.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3>{t.doctors.search.noResults}</h3>
                <Button variant="outline" onClick={clearFilters}>{t.common.clear}</Button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className={styles.doctorList}>
                  {doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)}
                </div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Doctor Profile Page ──────────────────────────────────────────────────────
export function DoctorProfilePage() {
  const { t, language } = useT();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const id = window.location.pathname.split('/').pop();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [docRes, revRes] = await Promise.all([
          Doctors.getById(id),
          Doctors.getReviews(id),
        ]);
        setDoctor(docRes.data);
        setReviews(revRes.data.results || revRes.data || []);
      } catch {
        toast.error('Doctor not found');
        navigate('/doctors');
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleConsult = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setStarting(true);
    try {
      const res = await Chat.startConsultation(doctor.id);
      navigate(`/chat?conversation=${res.data.id}`);
      toast.success(`Consultation started!`);
    } catch { toast.error('Failed to start consultation'); }
    finally { setStarting(false); }
  };

  if (loading) return (
    <div className={styles.profileLoading}>
      <div className={`skeleton ${styles.profileSkeleton}`} />
    </div>
  );

  if (!doctor) return null;

  const specialty = language === 'ru' ? doctor.specialtyRu : language === 'uz' ? doctor.specialtyUz : doctor.specialty;
  const bio = language === 'ru' ? doctor.bioRu : language === 'uz' ? doctor.bioUz : doctor.bio;

  return (
    <div className={styles.profilePage}>
      <div className="container">
        <button className={styles.backBtn} onClick={() => navigate('/doctors')}>
          <ArrowLeft size={16} /> {t.common.back}
        </button>

        <div className={styles.profileLayout}>
          {/* Sidebar */}
          <aside className={styles.profileSidebar}>
            <motion.div className={styles.profileCard} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className={styles.profileAvatarWrap}>
                <Avatar name={`${doctor.firstName} ${doctor.lastName}`} size="2xl" />
                {doctor.isVerified && (
                  <div className={styles.verifiedBig}>
                    <span>✓</span> Verified Doctor
                  </div>
                )}
                <div className={[styles.availPill, doctor.isAvailable ? styles.availGreen : styles.availGray].join(' ')}>
                  <span className={styles.availDotSmall} />
                  {doctor.isAvailable ? t.doctors.card.available : t.doctors.card.busy}
                </div>
              </div>

              <h2 className={styles.profileName}>Dr. {doctor.firstName} {doctor.lastName}</h2>
              <p className={styles.profileSpec}>{specialty}</p>

              <div className={styles.profileStatGrid}>
                {[
                  { label: t.doctors.profile.yearsOfExperience, value: doctor.experience },
                  { label: t.doctors.profile.totalConsultations, value: doctor.consultationCount.toLocaleString() },
                  { label: t.doctors.profile.averageRating, value: `${doctor.rating} ★` },
                ].map(s => (
                  <div key={s.label} className={styles.profileStat}>
                    <span className={styles.profileStatVal}>{s.value}</span>
                    <span className={styles.profileStatLabel}>{s.label}</span>
                  </div>
                ))}
              </div>

              <div className={styles.profileInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>{t.doctors.profile.languages}</span>
                  <div className={styles.langList}>
                    {doctor.languages.map(l => <span key={l} className={styles.langChip}>{l}</span>)}
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>{t.doctors.profile.workingHours}</span>
                  <span className={styles.infoValue}>{doctor.workingHours}</span>
                </div>
              </div>

              <div className={styles.profilePrice}>
                <span className={styles.priceLabel}>Consultation fee</span>
                <span className={styles.priceValue}>{doctor.price?.toLocaleString()} UZS</span>
              </div>

              <Button fullWidth size="lg" onClick={handleConsult} loading={starting} icon={<MessageSquare size={16} />}>
                {t.doctors.profile.startConsultation}
              </Button>
            </motion.div>
          </aside>

          {/* Main */}
          <main className={styles.profileMain}>
            {/* Tabs */}
            <div className={styles.tabs}>
              {['about', 'reviews'].map(tab => (
                <button
                  key={tab}
                  className={[styles.tab, activeTab === tab ? styles.tabActive : ''].join(' ')}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'about' ? t.doctors.profile.about : `${t.doctors.profile.reviews} (${reviews.length})`}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'about' ? (
                <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                  <div className={styles.section}>
                    <h3>{t.doctors.profile.about}</h3>
                    <p className={styles.bioText}>{bio}</p>
                  </div>
                  <div className={styles.section}>
                    <h3>{t.doctors.profile.education}</h3>
                    <pre className={styles.education}>{doctor.education}</pre>
                  </div>
                  <div className={styles.section}>
                    <h3>{t.doctors.profile.specializations}</h3>
                    <div className={styles.specTags}>
                      {[specialty, 'Preventive Medicine', 'Patient Education'].map(s => (
                        <span key={s} className={styles.specTag}>{s}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                  {reviews.length === 0 ? (
                    <div className={styles.noReviews}>No reviews yet.</div>
                  ) : (
                    <div className={styles.reviewsList}>
                      {reviews.map(r => (
                        <div key={r.id} className={styles.reviewCard}>
                          <div className={styles.reviewHeader}>
                            <Avatar name={r.patientName} size="sm" />
                            <div>
                              <span className={styles.reviewName}>{r.patientName}</span>
                              <span className={styles.reviewDate}>{r.date}</span>
                            </div>
                            <div className={styles.reviewStars}>
                              {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                            </div>
                          </div>
                          <p className={styles.reviewText}>{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
