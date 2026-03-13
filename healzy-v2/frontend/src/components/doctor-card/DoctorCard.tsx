'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Clock, MessageCircle, Video, CheckCircle, Users } from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { formatCurrency } from '@/utils/helpers';
import { useT } from '@/i18n/useT';
import type { Doctor } from '@/types/doctor';

interface DoctorCardProps {
  doctor: Doctor;
  compact?: boolean;
}

export default function DoctorCard({ doctor, compact = false }: DoctorCardProps) {
  const { t, locale } = useT();

  const specialty =
    locale === 'ru' ? doctor.specialtyRu :
    locale === 'uz' ? doctor.specialtyUz :
    doctor.specialty;

  if (compact) {
    return (
      <Link href={`/doctors/${doctor.id}`}>
        <motion.div
          whileHover={{ y: -2 }}
          className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-all cursor-pointer"
        >
          <Avatar name={`${doctor.firstName} ${doctor.lastName}`} src={doctor.avatar} size="md" online={doctor.isAvailable} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate font-heading">Dr. {doctor.firstName} {doctor.lastName}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{specialty}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium">{doctor.rating.toFixed(1)}</span>
              <span className="text-xs text-[var(--text-muted)]">({doctor.reviewCount})</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-semibold text-primary-600">{formatCurrency(doctor.price)}</p>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden hover:shadow-card-hover transition-all duration-300"
    >
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <Avatar
              name={`${doctor.firstName} ${doctor.lastName}`}
              src={doctor.avatar}
              size="lg"
              online={doctor.isAvailable}
            />
            {doctor.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center border-2 border-white dark:border-slate-900">
                <CheckCircle className="w-3 h-3 text-white fill-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base font-heading truncate">
              Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{specialty}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold">{doctor.rating.toFixed(1)}</span>
              <span className="text-xs text-[var(--text-muted)]">({doctor.reviewCount} {t.doctors.reviews})</span>
            </div>
          </div>
          <Badge variant={doctor.isAvailable ? 'success' : 'default'} size="sm" dot>
            {doctor.isAvailable ? t.doctors.available_now : t.doctors.unavailable}
          </Badge>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--border-color)] mb-4">
          {[
            { label: t.doctors.yearsExp, value: `${doctor.experience}` },
            { label: t.doctors.consultations, value: doctor.consultationCount.toLocaleString() },
            { label: t.doctors.reviews, value: doctor.reviewCount.toString() },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-bold text-sm font-heading">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)] leading-tight mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Languages */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {doctor.languages.map((lang) => (
            <span key={lang} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-[var(--text-secondary)]">
              {lang}
            </span>
          ))}
        </div>

        {/* Working hours */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span>{doctor.workingHours}</span>
        </div>

        {/* Price + actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)]">{t.doctors.perConsultation}</p>
            <p className="font-bold text-primary-600 text-sm">{formatCurrency(doctor.price)}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/doctors/${doctor.id}`}
              className="px-3 py-2 text-xs font-medium border border-[var(--border-color)] rounded-xl hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 dark:hover:border-primary-600 transition-colors"
            >
              {t.doctors.viewProfile}
            </Link>
            <Link
              href={`/appointments/book?doctorId=${doctor.id}`}
              className="px-3 py-2 text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-sm"
            >
              {t.doctors.bookNow}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
