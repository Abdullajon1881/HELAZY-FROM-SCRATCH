'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, MessageSquare, MapPin, ExternalLink, X, CheckCircle } from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { formatDate, formatTime } from '@/utils/helpers';
import { useT } from '@/i18n/useT';
import type { Appointment } from '@/types/appointment';
import { STATUS_LABELS } from '@/types/appointment';
import type { BadgeVariant } from '@/components/ui';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onJoin?: (id: string) => void;
  compact?: boolean;
}

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'default'> = {
  pending: 'warning',
  confirmed: 'info',
  in_progress: 'success',
  completed: 'primary',
  cancelled: 'danger',
  no_show: 'default',
};

const TYPE_ICONS = {
  video: <Video className="w-4 h-4" />,
  chat: <MessageSquare className="w-4 h-4" />,
  in_person: <MapPin className="w-4 h-4" />,
};

export default function AppointmentCard({ appointment, onCancel, onJoin, compact = false }: AppointmentCardProps) {
  const { t, locale } = useT();
  const statusLabel = STATUS_LABELS[appointment.status]?.[locale as 'en' | 'ru' | 'uz'] || appointment.status;
  const badgeVariant = STATUS_BADGE[appointment.status] || 'default';
  const doctorName = `Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`;
  const canJoin = ['confirmed', 'in_progress'].includes(appointment.status);
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);

  if (compact) {
    return (
      <div className="card p-4 flex items-center gap-3">
        <Avatar name={doctorName} src={appointment.doctor?.avatar} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate font-heading">{doctorName}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {formatDate(appointment.scheduledAt, locale)} {formatTime(appointment.scheduledAt)}
          </p>
        </div>
        <Badge variant={badgeVariant} size="sm">{statusLabel}</Badge>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Status bar */}
      <div className={`h-1 w-full ${
        appointment.status === 'completed' ? 'bg-primary-500' :
        appointment.status === 'confirmed' ? 'bg-blue-500' :
        appointment.status === 'in_progress' ? 'bg-emerald-500' :
        appointment.status === 'cancelled' ? 'bg-red-400' :
        'bg-amber-400'
      }`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={doctorName} src={appointment.doctor?.avatar} size="md" />
            <div>
              <h3 className="font-semibold font-heading">{doctorName}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{appointment.doctor?.specialty}</p>
            </div>
          </div>
          <Badge variant={badgeVariant}>{statusLabel}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span>{formatDate(appointment.scheduledAt, locale)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Clock className="w-4 h-4 text-primary-500" />
            <span>{formatTime(appointment.scheduledAt)} · {appointment.duration} min</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            {TYPE_ICONS[appointment.type]}
            <span className="capitalize">{appointment.type.replace('_', ' ')}</span>
          </div>
        </div>

        {appointment.reason && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 mb-4 text-sm text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">{t.appointments.reason}: </span>
            {appointment.reason}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 justify-end">
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              {t.appointments.cancel}
            </button>
          )}
          {appointment.status === 'completed' && !appointment.rating && (
            <Link
              href={`/appointments/${appointment.id}/review`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 rounded-xl transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Leave Review
            </Link>
          )}
          {canJoin && onJoin && (
            <button
              onClick={() => onJoin(appointment.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t.appointments.join}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
