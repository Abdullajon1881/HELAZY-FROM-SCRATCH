export const APP_NAME = 'Healzy';
export const APP_DESCRIPTION = 'Modern healthcare platform for Uzbekistan';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export const LOCALES = ['en', 'ru', 'uz'] as const;
export const LOCALE_LABELS = { en: 'English', ru: 'Русский', uz: "O'zbek" };

export const APPOINTMENT_DURATIONS = [15, 20, 30, 45, 60] as const;
export const DEFAULT_CURRENCY = 'UZS';
export const DEFAULT_LOCALE = 'en';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export const CONSULTATION_TYPES = [
  { value: 'video', icon: '📹' },
  { value: 'chat', icon: '💬' },
  { value: 'in_person', icon: '🏥' },
] as const;

export const LANGUAGES = ['Uzbek', 'Russian', 'English', 'Karakalpak'];

export const RATING_LABELS = {
  5: 'Excellent',
  4: 'Good',
  3: 'Average',
  2: 'Below Average',
  1: 'Poor',
};
