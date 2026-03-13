'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, MessageSquare, MapPin, ChevronRight, ChevronLeft, Check, Calendar, Clock, CreditCard, Sparkles } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Avatar, StarRating } from '@/components/ui';
import Button from '@/components/ui/Button';
import { formatCurrency, cn } from '@/utils/helpers';

const DOCTOR = {
  id: '1', firstName: 'Dilnoza', lastName: 'Yusupova',
  specialty: 'Cardiologist', rating: 4.9, reviewCount: 234,
  price: 150000, avatar: null,
};

const TYPES = [
  { value: 'video', icon: <Video className="w-5 h-5" />, label: 'Video Call', desc: 'Face-to-face online consultation' },
  { value: 'chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Chat', desc: 'Text-based consultation' },
  { value: 'in_person', icon: <MapPin className="w-5 h-5" />, label: 'In Person', desc: 'Visit at the clinic' },
];

const TIMES = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

const STEPS = ['Type', 'Date & Time', 'Details', 'Payment'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
            i < current ? 'bg-primary-600 text-white' :
            i === current ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900' :
            'bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]'
          )}>
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span className={cn('text-xs hidden sm:block', i <= current ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]')}>{label}</span>
          {i < STEPS.length - 1 && <div className={cn('w-8 h-px', i < current ? 'bg-primary-400' : 'bg-[var(--border-color)]')} />}
        </div>
      ))}
    </div>
  );
}

export default function BookAppointmentPage() {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [type, setType] = useState(params.get('type') || 'video');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleBook = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    router.push('/appointments?booked=true');
  };

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const formatDay = (d: Date) => d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Doctor summary card */}
      <div className="card p-5 mb-6 flex items-center gap-4">
        <Avatar name={`${DOCTOR.firstName} ${DOCTOR.lastName}`} size="lg" />
        <div className="flex-1">
          <h2 className="font-heading font-bold">Dr. {DOCTOR.firstName} {DOCTOR.lastName}</h2>
          <p className="text-sm text-primary-600">{DOCTOR.specialty}</p>
          <div className="flex items-center gap-2 mt-1">
            <StarRating value={DOCTOR.rating} size="sm" />
            <span className="text-xs text-[var(--text-muted)]">({DOCTOR.reviewCount})</span>
            <span className="text-xs font-bold text-primary-600 ml-2">{formatCurrency(DOCTOR.price)}/session</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 0 — Consultation type */}
          {step === 0 && (
            <div>
              <h2 className="font-heading text-2xl font-bold mb-2">{t.appointments.selectType}</h2>
              <p className="text-[var(--text-secondary)] mb-6">Choose how you'd like to meet with Dr. {DOCTOR.lastName}</p>
              <div className="space-y-3">
                {TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all',
                      type === opt.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50' : 'border-[var(--border-color)] hover:border-primary-300'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                      type === opt.value ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    )}>
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{opt.label}</p>
                      <p className="text-sm text-[var(--text-muted)]">{opt.desc}</p>
                    </div>
                    {type === opt.value && <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Date & Time */}
          {step === 1 && (
            <div>
              <h2 className="font-heading text-2xl font-bold mb-2">{t.appointments.selectDate}</h2>
              <p className="text-[var(--text-secondary)] mb-5">Pick a date and time slot</p>

              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-500" /> Date</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {dates.map((d) => {
                  const val = d.toISOString().split('T')[0];
                  return (
                    <button
                      key={val}
                      onClick={() => setDate(val)}
                      className={cn(
                        'flex-shrink-0 px-4 py-3 rounded-2xl border text-center transition-colors min-w-[88px]',
                        date === val ? 'border-primary-500 bg-primary-600 text-white' : 'border-[var(--border-color)] hover:border-primary-400'
                      )}
                    >
                      <p className="text-xs opacity-70">{d.toLocaleDateString('en', { weekday: 'short' })}</p>
                      <p className="font-bold text-lg font-heading">{d.getDate()}</p>
                      <p className="text-xs opacity-70">{d.toLocaleDateString('en', { month: 'short' })}</p>
                    </button>
                  );
                })}
              </div>

              {date && (
                <>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary-500" /> Available Times</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {TIMES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTime(t)}
                        className={cn(
                          'py-2.5 text-sm rounded-xl border transition-colors font-medium',
                          time === t ? 'border-primary-500 bg-primary-600 text-white' : 'border-[var(--border-color)] hover:border-primary-400'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2 — Reason */}
          {step === 2 && (
            <div>
              <h2 className="font-heading text-2xl font-bold mb-2">{t.appointments.reason}</h2>
              <p className="text-[var(--text-secondary)] mb-6">Help the doctor prepare for your consultation</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.appointments.reason} *</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe why you're booking (e.g. chest pain for 3 days...)"
                    rows={4}
                    className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.appointments.symptoms} (optional)</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="List any specific symptoms (e.g. shortness of breath, dizziness...)"
                    rows={3}
                    className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
                {/* AI suggestion */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800">
                  <Sparkles className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary-700 dark:text-primary-300">AI Health Assistant</p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">Not sure what to write? <a href="/ai/symptom-checker" className="underline">Ask our AI assistant</a> to help describe your symptoms accurately.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Payment summary */}
          {step === 3 && (
            <div>
              <h2 className="font-heading text-2xl font-bold mb-2">Confirm & Pay</h2>
              <p className="text-[var(--text-secondary)] mb-6">Review your appointment details</p>

              {/* Summary card */}
              <div className="card p-5 mb-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Doctor</span>
                  <span className="font-semibold">Dr. {DOCTOR.firstName} {DOCTOR.lastName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Type</span>
                  <span className="font-semibold capitalize">{type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Date</span>
                  <span className="font-semibold">{date} at {time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Duration</span>
                  <span className="font-semibold">30 minutes</span>
                </div>
                <div className="border-t border-[var(--border-color)] pt-3 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary-600 text-lg">{formatCurrency(DOCTOR.price)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-3">
                <p className="font-semibold text-sm">Payment Method</p>
                {[
                  { value: 'card', label: 'Credit/Debit Card', icon: <CreditCard className="w-4 h-4" /> },
                  { value: 'click', label: 'Click', icon: <span className="text-xs font-bold">CK</span> },
                  { value: 'payme', label: 'Payme', icon: <span className="text-xs font-bold">PM</span> },
                ].map((pm) => (
                  <label key={pm.value} className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border-color)] cursor-pointer hover:border-primary-400 transition-colors">
                    <input type="radio" name="payment" value={pm.value} defaultChecked={pm.value === 'card'} className="accent-primary-600" />
                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">{pm.icon}</span>
                    <span className="font-medium text-sm">{pm.label}</span>
                  </label>
                ))}
              </div>

              <p className="text-xs text-[var(--text-muted)] mt-4">Free cancellation up to 24h before the appointment. Full refund will be issued.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-color)]">
        <Button variant="outline" onClick={back} disabled={step === 0} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          {t.common.back}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={next}
            disabled={(step === 1 && (!date || !time)) || (step === 2 && !reason.trim())}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            {t.common.next}
          </Button>
        ) : (
          <Button onClick={handleBook} loading={loading} leftIcon={<Check className="w-4 h-4" />}>
            {t.appointments.book}
          </Button>
        )}
      </div>
    </div>
  );
}
