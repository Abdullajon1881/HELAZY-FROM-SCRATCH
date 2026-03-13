'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, Star } from 'lucide-react';
import { useT } from '@/i18n/useT';
import DoctorCard from '@/components/doctor-card/DoctorCard';
import { SkeletonCard, EmptyState, Select } from '@/components/ui';
import { SPECIALTIES, type Doctor } from '@/types/doctor';
import { cn } from '@/utils/helpers';

// Mock data until backend connected
const MOCK_DOCTORS: Doctor[] = [
  { id: '1', userId: '2', firstName: 'Dilnoza', lastName: 'Yusupova', specialty: 'Cardiologist', specialtyRu: 'Кардиолог', specialtyUz: 'Kardiolog', experience: 12, rating: 4.9, reviewCount: 234, consultationCount: 1847, bio: 'Board-certified cardiologist with 12 years of experience.', bioRu: '', bioUz: '', education: 'Tashkent Medical Academy', languages: ['Uzbek', 'Russian', 'English'], workingHours: 'Mon–Fri 9–18', isAvailable: true, isVerified: true, avatar: null, price: 150000, currency: 'UZS', documents: [], applicationStatus: 'approved', createdAt: '', updatedAt: '' },
  { id: '2', userId: '3', firstName: 'Bobur', lastName: 'Toshmatov', specialty: 'Neurologist', specialtyRu: 'Невролог', specialtyUz: 'Nevrolog', experience: 8, rating: 4.7, reviewCount: 156, consultationCount: 982, bio: 'Neurologist specializing in headaches and epilepsy.', bioRu: '', bioUz: '', education: 'Samarkand Medical University', languages: ['Uzbek', 'Russian'], workingHours: 'Mon–Sat 10–17', isAvailable: true, isVerified: true, avatar: null, price: 120000, currency: 'UZS', documents: [], applicationStatus: 'approved', createdAt: '', updatedAt: '' },
  { id: '3', userId: '4', firstName: 'Malika', lastName: 'Rashidova', specialty: 'Pediatrician', specialtyRu: 'Педиатр', specialtyUz: 'Pediatr', experience: 10, rating: 4.8, reviewCount: 312, consultationCount: 2341, bio: 'Dedicated pediatrician with a gentle approach.', bioRu: '', bioUz: '', education: 'Tashkent Pediatric Institute', languages: ['Uzbek', 'Russian', 'English'], workingHours: 'Mon–Fri 8–16', isAvailable: false, isVerified: true, avatar: null, price: 100000, currency: 'UZS', documents: [], applicationStatus: 'approved', createdAt: '', updatedAt: '' },
  { id: '4', userId: '5', firstName: 'Jasur', lastName: 'Nazarov', specialty: 'Dermatologist', specialtyRu: 'Дерматолог', specialtyUz: 'Dermatolog', experience: 6, rating: 4.6, reviewCount: 89, consultationCount: 543, bio: 'Dermatologist focused on skin conditions and cosmetic dermatology.', bioRu: '', bioUz: '', education: 'Bukhara Medical Institute', languages: ['Uzbek', 'Russian'], workingHours: 'Tue–Sat 10–18', isAvailable: true, isVerified: true, avatar: null, price: 130000, currency: 'UZS', documents: [], applicationStatus: 'approved', createdAt: '', updatedAt: '' },
  { id: '5', userId: '6', firstName: 'Nodira', lastName: 'Hamidova', specialty: 'Gynecologist', specialtyRu: 'Гинеколог', specialtyUz: 'Ginekolog', experience: 15, rating: 4.95, reviewCount: 421, consultationCount: 3210, bio: 'Senior gynecologist with 15 years of practice.', bioRu: '', bioUz: '', education: 'Tashkent Medical Academy', languages: ['Uzbek', 'Russian'], workingHours: 'Mon–Fri 9–17', isAvailable: true, isVerified: true, avatar: null, price: 180000, currency: 'UZS', documents: [], applicationStatus: 'approved', createdAt: '', updatedAt: '' },
  { id: '6', userId: '7', firstName: 'Otabek', lastName: 'Mirzayev', specialty: 'Orthopedist', specialtyRu: 'Ортопед', specialtyUz: 'Ortoped', experience: 9, rating: 4.5, reviewCount: 77, consultationCount: 620, bio: 'Orthopedic surgeon specializing in sports injuries and joint replacements.', bioRu: '', bioUz: '', education: 'Andijan Medical Institute', languages: ['Uzbek', 'Russian', 'English'], workingHours: 'Mon–Thu 9–17', isAvailable: true, isVerified: true, avatar: null, price: 160000, currency: 'UZS', documents: [], applicationStatus: 'approved', createdAt: '', updatedAt: '' },
];

export default function DoctorsPage() {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get('search') || '');
  const [specialty, setSpecialty] = useState(params.get('specialty') || '');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading] = useState(false);

  // Filter + sort logic
  const filtered = MOCK_DOCTORS.filter((d) => {
    if (search && !`${d.firstName} ${d.lastName} ${d.specialty}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (specialty && d.specialty !== specialty) return false;
    if (minRating && d.rating < parseFloat(minRating)) return false;
    if (maxPrice && d.price > parseInt(maxPrice)) return false;
    if (availableOnly && !d.isAvailable) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'experience') return b.experience - a.experience;
    return b.consultationCount - a.consultationCount;
  });

  const activeFilterCount = [specialty, minRating, maxPrice, availableOnly].filter(Boolean).length;

  const clearFilters = () => {
    setSpecialty(''); setMinRating(''); setMaxPrice(''); setAvailableOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold mb-2">{t.doctors.title}</h1>
        <p className="text-[var(--text-secondary)]">{t.doctors.subtitle}</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.doctors.search}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition-colors',
            showFilters || activeFilterCount > 0
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
              : 'border-[var(--border-color)] hover:border-primary-400 bg-[var(--bg-secondary)]'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t.doctors.filters}
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
        <Select
          options={[
            { value: 'rating', label: t.doctors.sortRating },
            { value: 'price', label: t.doctors.sortPrice },
            { value: 'experience', label: t.doctors.sortExp },
          ]}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sm:w-52"
        />
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="card p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Specialty */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{t.doctors.specialty}</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t.doctors.allSpecialties}</option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Min rating */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{t.doctors.rating}</label>
                <div className="flex gap-1">
                  {['', '4', '4.5', '4.8'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={cn(
                        'flex-1 py-2 text-xs rounded-lg border transition-colors',
                        minRating === r ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300' : 'border-[var(--border-color)] hover:border-primary-400'
                      )}
                    >
                      {r ? `${r}+` : 'All'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max price */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{t.doctors.price}</label>
                <input
                  type="number"
                  placeholder="e.g. 200000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Available only */}
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setAvailableOnly(!availableOnly)}
                    className={cn(
                      'w-10 h-6 rounded-full transition-colors relative cursor-pointer',
                      availableOnly ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
                    )}
                  >
                    <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform', availableOnly ? 'translate-x-5' : 'translate-x-1')} />
                  </div>
                  <span className="text-sm">{t.doctors.available}</span>
                </label>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="mt-2 flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" /> {t.common.clear} filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <p className="text-sm text-[var(--text-secondary)] mb-5">
        {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-7 h-7" />}
          title={t.doctors.noResults}
          description="Try adjusting your search or clearing filters."
          action={<button onClick={clearFilters} className="text-primary-600 text-sm hover:underline">{t.common.clear} filters</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doctor, i) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <DoctorCard doctor={doctor} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
