'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, CheckCircle, Clock, Globe, Video,
  MessageSquare, Calendar, MapPin, Award, GraduationCap,
  ThumbsUp,
} from 'lucide-react';
import { Avatar, Badge, StarRating, Card } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { useT } from '@/i18n/useT';

// Mock single doctor — replace with useDoctor(id)
const DOCTOR = {
  id: '1', firstName: 'Dilnoza', lastName: 'Yusupova',
  specialty: 'Cardiologist', specialtyRu: 'Кардиолог', specialtyUz: 'Kardiolog',
  experience: 12, rating: 4.9, reviewCount: 234, consultationCount: 1847,
  bio: 'Board-certified cardiologist with 12 years of experience in treating heart conditions. Specializes in preventive cardiology and heart failure management. Dr. Yusupova has performed over 1,847 consultations and is known for her compassionate, evidence-based approach.',
  education: 'Tashkent Medical Academy, MD — 2010\nResidency: National Cardiology Center — 2014\nFellowship: European Society of Cardiology — 2016',
  languages: ['Uzbek', 'Russian', 'English'],
  workingHours: 'Mon–Fri: 9:00–18:00',
  isAvailable: true, isVerified: true, avatar: null, price: 150000, currency: 'UZS',
};

const REVIEWS = [
  { id: '1', patientName: 'Amir K.', rating: 5, comment: 'Exceptional doctor! Very thorough and explained everything clearly.', date: '2025-02-15' },
  { id: '2', patientName: 'Sabina M.', rating: 5, comment: 'Professional and caring. I felt completely at ease during the consultation.', date: '2025-02-10' },
  { id: '3', patientName: 'Rustam A.', rating: 4, comment: 'Very knowledgeable. The prescription helped a lot.', date: '2025-02-03' },
];

const TABS = ['about', 'education', 'schedule', 'reviews_tab'] as const;

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const { t, locale } = useT();
  const [tab, setTab] = useState<typeof TABS[number]>('about');

  const specialty = locale === 'ru' ? DOCTOR.specialtyRu : locale === 'uz' ? DOCTOR.specialtyUz : DOCTOR.specialty;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link href="/doctors" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t.common.back} to doctors
      </Link>

      {/* Hero card */}
      <div className="card p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar + badges */}
          <div className="flex flex-col items-center sm:items-start gap-3 flex-shrink-0">
            <div className="relative">
              <Avatar name={`${DOCTOR.firstName} ${DOCTOR.lastName}`} src={DOCTOR.avatar} size="2xl" online={DOCTOR.isAvailable} />
              {DOCTOR.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center border-2 border-white dark:border-slate-900">
                  <CheckCircle className="w-4 h-4 text-white fill-white" />
                </div>
              )}
            </div>
            <Badge variant={DOCTOR.isAvailable ? 'success' : 'default'} dot>
              {DOCTOR.isAvailable ? t.doctors.available_now : t.doctors.unavailable}
            </Badge>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="font-heading text-3xl font-bold mb-1">
                  Dr. {DOCTOR.firstName} {DOCTOR.lastName}
                </h1>
                <p className="text-primary-600 dark:text-primary-400 font-semibold text-lg">{specialty}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/appointments/book?doctorId=${DOCTOR.id}&type=chat`}
                  className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border-color)] hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 rounded-xl text-sm font-medium transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> {t.appointments.typeChat}
                </Link>
                <Link
                  href={`/appointments/book?doctorId=${DOCTOR.id}&type=video`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  <Video className="w-4 h-4" /> {t.appointments.typeVideo}
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />, value: `${DOCTOR.rating}`, label: `${DOCTOR.reviewCount} reviews` },
                { icon: <Calendar className="w-4 h-4 text-primary-500" />, value: `${DOCTOR.consultationCount.toLocaleString()}`, label: 'Consultations' },
                { icon: <Award className="w-4 h-4 text-violet-500" />, value: `${DOCTOR.experience}`, label: 'Years experience' },
                { icon: <Globe className="w-4 h-4 text-blue-500" />, value: DOCTOR.languages.length.toString(), label: 'Languages' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  {s.icon}
                  <div>
                    <p className="font-bold text-sm font-heading">{s.value}</p>
                    <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
            {TABS.map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${
                  tab === tabKey
                    ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                    : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t.doctors[tabKey]}
              </button>
            ))}
          </div>

          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {tab === 'about' && (
              <div className="card p-6">
                <h2 className="font-heading font-bold text-lg mb-3">{t.doctors.about}</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">{DOCTOR.bio}</p>
                <div className="mt-5 pt-5 border-t border-[var(--border-color)]">
                  <h3 className="font-semibold text-sm mb-2">{t.doctors.languages}</h3>
                  <div className="flex flex-wrap gap-2">
                    {DOCTOR.languages.map((lang) => (
                      <span key={lang} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium">{lang}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {tab === 'education' && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-primary-500" />
                  <h2 className="font-heading font-bold text-lg">{t.doctors.education}</h2>
                </div>
                {DOCTOR.education.split('\n').map((line, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-[var(--border-color)] last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                    <p className="text-sm">{line}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === 'schedule' && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary-500" />
                  <h2 className="font-heading font-bold text-lg">{t.doctors.workingHours}</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-4">{DOCTOR.workingHours}</p>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={day} className={`text-center py-3 rounded-xl text-xs font-medium ${i < 5 ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === 'reviews_tab' && (
              <div className="space-y-4">
                <div className="card p-5 flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-heading text-5xl font-extrabold text-primary-600">{DOCTOR.rating}</p>
                    <StarRating value={DOCTOR.rating} className="justify-center mt-1" />
                    <p className="text-xs text-[var(--text-muted)] mt-1">{DOCTOR.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-3">{star}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: star === 5 ? '80%' : star === 4 ? '15%' : '5%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {REVIEWS.map((review) => (
                  <div key={review.id} className="card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 text-xs font-bold">
                          {review.patientName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{review.patientName}</p>
                          <p className="text-xs text-[var(--text-muted)]">{formatDate(review.date)}</p>
                        </div>
                      </div>
                      <StarRating value={review.rating} size="sm" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar — booking */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-20">
            <h3 className="font-heading font-bold mb-1">{t.doctors.bookNow}</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">{t.doctors.perConsultation}</p>
            <p className="text-2xl font-extrabold text-primary-600 font-heading mb-5">{formatCurrency(DOCTOR.price)}</p>

            <div className="space-y-2.5 mb-5">
              {[
                { href: `/appointments/book?doctorId=${DOCTOR.id}&type=video`, icon: <Video className="w-4 h-4" />, label: t.appointments.typeVideo },
                { href: `/appointments/book?doctorId=${DOCTOR.id}&type=chat`, icon: <MessageSquare className="w-4 h-4" />, label: t.appointments.typeChat },
                { href: `/appointments/book?doctorId=${DOCTOR.id}&type=in_person`, icon: <MapPin className="w-4 h-4" />, label: t.appointments.typeInPerson },
              ].map((opt) => (
                <Link
                  key={opt.href}
                  href={opt.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border-color)] hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors text-sm font-medium"
                >
                  <span className="text-primary-500">{opt.icon}</span> {opt.label}
                </Link>
              ))}
            </div>

            <Link
              href={`/appointments/book?doctorId=${DOCTOR.id}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-glow"
            >
              <Calendar className="w-4 h-4" /> {t.doctors.bookNow}
            </Link>

            <div className="flex items-center gap-2 mt-3 text-xs text-[var(--text-muted)] justify-center">
              <ThumbsUp className="w-3 h-3" /> Free cancellation up to 24h before
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
