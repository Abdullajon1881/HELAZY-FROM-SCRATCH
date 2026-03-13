// ─── Mock Data Layer ──────────────────────────────────────────────────────────
// All API calls check USE_MOCK first. To go live, set USE_MOCK = false
// and ensure your Django backend is running at /api/*

export const USE_MOCK = true;
export const MOCK_DELAY = 600; // ms — simulates network latency

const delay = (ms = MOCK_DELAY) => new Promise(r => setTimeout(r, ms));

// ─── Mock Users ───────────────────────────────────────────────────────────────
export const MOCK_USERS = {
  patient: {
    id: 1,
    email: 'patient@healzy.uz',
    firstName: 'Amir',
    lastName: 'Karimov',
    role: 'patient',
    avatar: null,
    phone: '+998 90 123 45 67',
    dateOfBirth: '1992-05-15',
    createdAt: '2024-01-10T10:00:00Z',
  },
  doctor: {
    id: 2,
    email: 'doctor@healzy.uz',
    firstName: 'Dilnoza',
    lastName: 'Yusupova',
    role: 'doctor',
    avatar: null,
    phone: '+998 91 234 56 78',
    createdAt: '2024-01-05T09:00:00Z',
  },
  admin: {
    id: 3,
    email: 'admin@healzy.uz',
    firstName: 'Admin',
    lastName: 'Healzy',
    role: 'admin',
    avatar: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
};

// ─── Mock Doctors ─────────────────────────────────────────────────────────────
export const MOCK_DOCTORS = [
  {
    id: 1,
    userId: 2,
    firstName: 'Dilnoza',
    lastName: 'Yusupova',
    specialty: 'Cardiologist',
    specialtyRu: 'Кардиолог',
    specialtyUz: 'Kardiolog',
    experience: 12,
    rating: 4.9,
    reviewCount: 234,
    consultationCount: 1847,
    bio: 'Board-certified cardiologist with 12 years of experience in treating heart conditions. Specializes in preventive cardiology and heart failure management.',
    bioRu: 'Сертифицированный кардиолог с 12-летним опытом лечения сердечных заболеваний. Специализируется на профилактической кардиологии.',
    bioUz: '12 yillik tajribaga ega sertifikatlangan kardiolog. Profilaktik kardiologiya va yurak yetishmovchiligini davolashga ixtisoslashgan.',
    education: 'Tashkent Medical Academy, MD — 2010\nResidency: National Cardiology Center — 2014',
    languages: ['Uzbek', 'Russian', 'English'],
    workingHours: 'Mon–Fri: 9:00–18:00',
    isAvailable: true,
    isVerified: true,
    avatar: null,
    price: 150000,
    documents: ['diploma.pdf', 'license.pdf'],
  },
  {
    id: 2,
    userId: 10,
    firstName: 'Bobur',
    lastName: 'Toshmatov',
    specialty: 'Neurologist',
    specialtyRu: 'Невролог',
    specialtyUz: 'Nevrolog',
    experience: 8,
    rating: 4.7,
    reviewCount: 156,
    consultationCount: 982,
    bio: 'Neurologist specializing in headaches, epilepsy, and stroke management. Provides compassionate, evidence-based care.',
    bioRu: 'Невролог, специализирующийся на головных болях, эпилепсии и лечении инсульта.',
    bioUz: 'Bosh og\'riq, epilepsiya va insult davolashga ixtisoslashgan nevrolog.',
    education: 'Samarkand State Medical University — 2014\nFellowship: Russian Neurology Institute — 2016',
    languages: ['Uzbek', 'Russian'],
    workingHours: 'Mon–Sat: 10:00–17:00',
    isAvailable: true,
    isVerified: true,
    avatar: null,
    price: 120000,
    documents: ['diploma.pdf'],
  },
  {
    id: 3,
    userId: 11,
    firstName: 'Malika',
    lastName: 'Rashidova',
    specialty: 'Pediatrician',
    specialtyRu: 'Педиатр',
    specialtyUz: 'Pediatr',
    experience: 15,
    rating: 4.95,
    reviewCount: 412,
    consultationCount: 3200,
    bio: 'Dedicated pediatrician with 15 years caring for children from newborns to adolescents. Expert in developmental pediatrics.',
    bioRu: 'Педиатр с 15-летним опытом ухода за детьми от новорождённых до подростков.',
    bioUz: '15 yillik tajribaga ega bolalar shifokori. Yangi tug\'ilganlardan o\'spirinlargacha bo\'lgan bolalarga g\'amxo\'rlik qiladi.',
    education: 'Tashkent Pediatric Medical Institute — 2008',
    languages: ['Uzbek', 'Russian', 'English'],
    workingHours: 'Mon–Fri: 8:00–16:00',
    isAvailable: false,
    isVerified: true,
    avatar: null,
    price: 100000,
    documents: ['diploma.pdf', 'license.pdf', 'certificate.pdf'],
  },
  {
    id: 4,
    userId: 12,
    firstName: 'Jasur',
    lastName: 'Mirzoev',
    specialty: 'Dermatologist',
    specialtyRu: 'Дерматолог',
    specialtyUz: 'Dermatolog',
    experience: 6,
    rating: 4.6,
    reviewCount: 89,
    consultationCount: 540,
    bio: 'Dermatologist specializing in acne, psoriasis, and cosmetic dermatology. Passionate about skin health education.',
    bioRu: 'Дерматолог, специализирующийся на акне, псориазе и косметической дерматологии.',
    bioUz: 'Akne, psoriaz va kosmetik dermatologiyaga ixtisoslashgan dermatolог.',
    education: 'Andijan State Medical Institute — 2017',
    languages: ['Uzbek', 'Russian'],
    workingHours: 'Tue–Sat: 11:00–19:00',
    isAvailable: true,
    isVerified: true,
    avatar: null,
    price: 90000,
    documents: ['diploma.pdf'],
  },
  {
    id: 5,
    userId: 13,
    firstName: 'Nargiza',
    lastName: 'Abdullayeva',
    specialty: 'Gynecologist',
    specialtyRu: 'Гинеколог',
    specialtyUz: 'Ginekolog',
    experience: 20,
    rating: 4.92,
    reviewCount: 567,
    consultationCount: 4100,
    bio: 'Experienced gynecologist specializing in women\'s reproductive health, prenatal care, and menopause management.',
    bioRu: 'Опытный гинеколог, специализирующийся на репродуктивном здоровье женщин.',
    bioUz: 'Tajribali ginekolog. Ayollar reproduktiv sog\'lig\'i, prenatal parvarishga ixtisoslashgan.',
    education: 'Tashkent Medical Academy — 2003\nAdvanced Fellowship: Istanbul — 2007',
    languages: ['Uzbek', 'Russian', 'Turkish'],
    workingHours: 'Mon–Fri: 9:00–17:00',
    isAvailable: true,
    isVerified: true,
    avatar: null,
    price: 130000,
    documents: ['diploma.pdf', 'license.pdf'],
  },
  {
    id: 6,
    userId: 14,
    firstName: 'Otabek',
    lastName: 'Xolmatov',
    specialty: 'General Practitioner',
    specialtyRu: 'Терапевт',
    specialtyUz: 'Umumiy amaliyot',
    experience: 4,
    rating: 4.5,
    reviewCount: 43,
    consultationCount: 280,
    bio: 'General practitioner focused on preventive medicine, chronic disease management, and patient education.',
    bioRu: 'Терапевт, ориентированный на профилактику заболеваний и ведение хронических болезней.',
    bioUz: 'Profilaktik tibbiyot va surunkali kasalliklarni boshqarishga yo\'naltirilgan umumiy amaliyot shifokori.',
    education: 'Fergana Medical Institute — 2019',
    languages: ['Uzbek', 'Russian'],
    workingHours: 'Mon–Sat: 8:00–20:00',
    isAvailable: true,
    isVerified: true,
    avatar: null,
    price: 80000,
    documents: ['diploma.pdf'],
  },
];

// ─── Mock Reviews ─────────────────────────────────────────────────────────────
export const MOCK_REVIEWS = {
  1: [
    { id: 1, patientName: 'Amir K.', rating: 5, comment: 'Excellent doctor! Very thorough and explained everything clearly.', date: '2025-01-15' },
    { id: 2, patientName: 'Zulfiya M.', rating: 5, comment: 'Отличный врач, очень внимательный и профессиональный.', date: '2025-01-10' },
    { id: 3, patientName: 'Sardor T.', rating: 4, comment: 'Professional and knowledgeable. Highly recommend.', date: '2024-12-28' },
  ],
  2: [
    { id: 4, patientName: 'Lola B.', rating: 5, comment: 'Helped me understand my condition clearly. Very patient doctor.', date: '2025-01-12' },
    { id: 5, patientName: 'Mansur R.', rating: 4, comment: 'Хороший специалист, быстро разобрался с моей проблемой.', date: '2024-12-30' },
  ],
};

// ─── Mock Conversations ───────────────────────────────────────────────────────
export const MOCK_CONVERSATIONS = [
  {
    id: 1,
    doctor: MOCK_DOCTORS[0],
    patient: MOCK_USERS.patient,
    status: 'active',
    lastMessage: { text: 'How are you feeling today?', sentAt: '2025-01-20T14:30:00Z', senderId: 2 },
    unreadCount: 1,
    createdAt: '2025-01-18T10:00:00Z',
  },
  {
    id: 2,
    doctor: MOCK_DOCTORS[2],
    patient: MOCK_USERS.patient,
    status: 'ended',
    lastMessage: { text: 'Thank you, feel much better now!', sentAt: '2025-01-15T16:00:00Z', senderId: 1 },
    unreadCount: 0,
    createdAt: '2025-01-14T09:00:00Z',
  },
];

export const MOCK_MESSAGES = {
  1: [
    { id: 1, conversationId: 1, senderId: 2, text: 'Hello! I reviewed your information. What are your main symptoms?', type: 'text', sentAt: '2025-01-20T10:00:00Z' },
    { id: 2, conversationId: 1, senderId: 1, text: "I've been having chest pain and shortness of breath for 3 days.", type: 'text', sentAt: '2025-01-20T10:02:00Z' },
    { id: 3, conversationId: 1, senderId: 2, text: 'I see. Is the chest pain sharp or dull? Does it radiate anywhere?', type: 'text', sentAt: '2025-01-20T10:03:00Z' },
    { id: 4, conversationId: 1, senderId: 1, text: "It's dull and sometimes I feel it in my left arm too.", type: 'text', sentAt: '2025-01-20T10:05:00Z' },
    { id: 5, conversationId: 1, senderId: 2, text: 'Those are symptoms we should take seriously. I recommend you get an ECG done as soon as possible. I can write you a referral.', type: 'text', sentAt: '2025-01-20T10:07:00Z' },
    { id: 6, conversationId: 1, senderId: 1, text: 'Thank you doctor. Should I go to the emergency room?', type: 'text', sentAt: '2025-01-20T14:28:00Z' },
    { id: 7, conversationId: 1, senderId: 2, text: 'How are you feeling today?', type: 'text', sentAt: '2025-01-20T14:30:00Z' },
  ],
};

// ─── Mock Admin Stats ─────────────────────────────────────────────────────────
export const MOCK_ADMIN_STATS = {
  totalUsers: 1247,
  activeDoctors: 89,
  pendingApplications: 7,
  todayConsultations: 43,
  totalConsultations: 8920,
  revenueThisMonth: 45600000,
  newUsersThisWeek: 134,
};

export const MOCK_DOCTOR_APPLICATIONS = [
  {
    id: 1,
    user: { firstName: 'Kamol', lastName: 'Nazarov', email: 'kamol@example.com' },
    specialty: 'Orthopedist',
    experience: 9,
    education: 'Tashkent Medical Academy, 2014',
    status: 'pending',
    appliedAt: '2025-01-19T11:00:00Z',
    documents: ['diploma.pdf', 'license.pdf'],
  },
  {
    id: 2,
    user: { firstName: 'Gulnora', lastName: 'Saidova', email: 'gulnora@example.com' },
    specialty: 'Psychiatrist',
    experience: 11,
    education: 'Samarkand Medical University, 2012',
    status: 'pending',
    appliedAt: '2025-01-18T09:30:00Z',
    documents: ['diploma.pdf'],
  },
  {
    id: 3,
    user: { firstName: 'Timur', lastName: 'Ergashev', email: 'timur@example.com' },
    specialty: 'Ophthalmologist',
    experience: 5,
    education: 'Andijan State Medical Institute, 2018',
    status: 'approved',
    appliedAt: '2025-01-10T14:00:00Z',
    documents: ['diploma.pdf', 'certificate.pdf'],
  },
  {
    id: 4,
    user: { firstName: 'Feruza', lastName: 'Mirzayeva', email: 'feruza@example.com' },
    specialty: 'Endocrinologist',
    experience: 3,
    education: 'Tashkent Pediatric Medical Institute, 2020',
    status: 'rejected',
    appliedAt: '2025-01-05T10:00:00Z',
    documents: ['diploma.pdf'],
  },
];

export const MOCK_ALL_USERS = [
  { id: 1, firstName: 'Amir', lastName: 'Karimov', email: 'amir@example.com', role: 'patient', status: 'active', joinedAt: '2024-11-10' },
  { id: 2, firstName: 'Dilnoza', lastName: 'Yusupova', email: 'dilnoza@example.com', role: 'doctor', status: 'active', joinedAt: '2024-10-05' },
  { id: 4, firstName: 'Sardor', lastName: 'Toshev', email: 'sardor@example.com', role: 'patient', status: 'active', joinedAt: '2024-12-01' },
  { id: 5, firstName: 'Zulfiya', lastName: 'Hamidova', email: 'zulfiya@example.com', role: 'patient', status: 'banned', joinedAt: '2024-09-15' },
  { id: 6, firstName: 'Nodir', lastName: 'Alimov', email: 'nodir@example.com', role: 'doctor', status: 'active', joinedAt: '2024-08-20' },
];

// ─── Mock API Functions ────────────────────────────────────────────────────────
export const mockAuthAPI = {
  getCSRF: async () => ({ data: {} }),

  login: async ({ email, password }) => {
    await delay();
    const user = Object.values(MOCK_USERS).find(u => u.email === email);
    if (!user || password !== 'password123') {
      throw { response: { data: { error: 'Invalid credentials' }, status: 400 } };
    }
    return { data: { user, token: 'mock-token-' + user.id } };
  },

  register: async (data) => {
    await delay();
    const newUser = {
      id: Date.now(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'patient',
      avatar: null,
      createdAt: new Date().toISOString(),
    };
    return { data: { user: newUser, token: 'mock-token-' + newUser.id } };
  },

  logout: async () => { await delay(200); return { data: {} }; },

  googleAuth: async (token) => {
    await delay();
    return { data: { user: MOCK_USERS.patient, token: 'mock-google-token' } };
  },

  getProfile: async () => {
    await delay(300);
    return { data: MOCK_USERS.patient };
  },

  updateProfile: async (data) => {
    await delay();
    return { data: { ...MOCK_USERS.patient, ...data } };
  },

  resetPasswordRequest: async (email) => {
    await delay();
    return { data: { message: 'Reset link sent' } };
  },
};

export const mockDoctorsAPI = {
  search: async (params = {}) => {
    await delay();
    let doctors = [...MOCK_DOCTORS];
    if (params.search) {
      const q = params.search.toLowerCase();
      doctors = doctors.filter(d =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q)
      );
    }
    if (params.specialty) {
      doctors = doctors.filter(d => d.specialty === params.specialty);
    }
    if (params.available) {
      doctors = doctors.filter(d => d.isAvailable);
    }
    if (params.sort === 'rating') doctors.sort((a, b) => b.rating - a.rating);
    if (params.sort === 'experience') doctors.sort((a, b) => b.experience - a.experience);
    if (params.sort === 'consultations') doctors.sort((a, b) => b.consultationCount - a.consultationCount);
    return { data: { results: doctors, count: doctors.length } };
  },

  getById: async (id) => {
    await delay();
    const doctor = MOCK_DOCTORS.find(d => d.id === Number(id));
    if (!doctor) throw { response: { status: 404 } };
    return { data: doctor };
  },

  getReviews: async (doctorId) => {
    await delay(400);
    return { data: { results: MOCK_REVIEWS[doctorId] || [] } };
  },

  getFeatured: async () => {
    await delay();
    return { data: MOCK_DOCTORS.slice(0, 3) };
  },

  submitApplication: async (data) => {
    await delay(1200);
    return { data: { id: Date.now(), status: 'pending' } };
  },
};

export const mockChatAPI = {
  getConversations: async () => {
    await delay();
    return { data: MOCK_CONVERSATIONS };
  },

  getMessages: async (conversationId) => {
    await delay(400);
    return { data: { results: MOCK_MESSAGES[conversationId] || [] } };
  },

  startConsultation: async (doctorId) => {
    await delay();
    const doctor = MOCK_DOCTORS.find(d => d.id === Number(doctorId));
    const newConv = {
      id: Date.now(),
      doctor,
      patient: MOCK_USERS.patient,
      status: 'active',
      lastMessage: null,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };
    MOCK_CONVERSATIONS.unshift(newConv);
    return { data: newConv };
  },

  endConsultation: async (conversationId) => {
    await delay();
    return { data: { status: 'ended' } };
  },
};

export const mockAdminAPI = {
  getStats: async () => {
    await delay(500);
    return { data: MOCK_ADMIN_STATS };
  },

  getDoctorApplications: async (status) => {
    await delay();
    const apps = status && status !== 'all'
      ? MOCK_DOCTOR_APPLICATIONS.filter(a => a.status === status)
      : MOCK_DOCTOR_APPLICATIONS;
    return { data: apps };
  },

  approveDoctor: async (id) => {
    await delay();
    const app = MOCK_DOCTOR_APPLICATIONS.find(a => a.id === Number(id));
    if (app) app.status = 'approved';
    return { data: { status: 'approved' } };
  },

  rejectDoctor: async (id) => {
    await delay();
    const app = MOCK_DOCTOR_APPLICATIONS.find(a => a.id === Number(id));
    if (app) app.status = 'rejected';
    return { data: { status: 'rejected' } };
  },

  getUsers: async () => {
    await delay();
    return { data: { results: MOCK_ALL_USERS } };
  },

  banUser: async (id) => {
    await delay();
    const user = MOCK_ALL_USERS.find(u => u.id === Number(id));
    if (user) user.status = 'banned';
    return { data: {} };
  },

  unbanUser: async (id) => {
    await delay();
    const user = MOCK_ALL_USERS.find(u => u.id === Number(id));
    if (user) user.status = 'active';
    return { data: {} };
  },
};
