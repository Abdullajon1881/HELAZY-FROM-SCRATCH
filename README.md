🏥 Healzy V2 — Healthcare Platform

A modern, full-stack telemedicine platform connecting patients with doctors. Built with Next.js 14, NestJS, PostgreSQL, and AI-powered health assistance.

✨ Features

 For Patients
- 🔍 **Doctor Search** — Filter by specialty, rating, price, language, and availability
- 📅 **Appointment Booking** — 4-step booking flow with video, chat, or in-person options
- 🤖 **AI Symptom Checker** — Powered by Claude Sonnet 4.6 with voice input and image analysis
- 💬 **Real-time Chat** — WebSocket-based messaging with doctors
- 📋 **Medical Records** — Store and manage personal health documents
- 🔔 **Notifications** — Stay updated on appointment status changes

 For Doctors
- 👨‍⚕️ **Doctor Dashboard** — Manage today's schedule, confirm/reject appointments
- 📆 **Schedule Management** — Set weekly availability and slot durations
- ⭐ **Reviews & Ratings** — Build reputation through patient feedback
- 💰 **Earnings Overview** — Track consultations and monthly revenue

 For Admins
- 🛡️ **Admin Panel** — Approve/reject doctor applications
- 👥 **User Management** — View and manage all platform users
- 📊 **Analytics** — Platform stats and revenue charts

 Platform
- 🌍 **Multilingual** — English, Russian, and Uzbek (UZ) support
- 🌙 **Dark / Light Mode** — Full theme support
- 📱 **Responsive Design** — Works on mobile, tablet, and desktop
- 🔐 **JWT Auth + Google OAuth** — Secure authentication

 🛠 Tech Stack

 Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| TanStack Query | Server state management |
| Zustand | Client state management |
| Socket.io Client | Real-time chat |
| React Hook Form + Zod | Forms & validation |

 Backend
| Technology | Purpose |
|---|---|
| NestJS 10 | Node.js framework |
| TypeScript | Type safety |
| Prisma 5 | ORM |
| PostgreSQL 16 | Database |
| Socket.io | WebSocket gateway |
| Passport + JWT | Authentication |
| Anthropic Claude Sonnet 4.6 | AI health assistant |
| Google Gemini 2.5 Flash | Voice TTS + image analysis |
| Swagger | API documentation |
