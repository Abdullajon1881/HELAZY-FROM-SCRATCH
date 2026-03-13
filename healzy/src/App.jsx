import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import { useAuthStore } from './store';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import { LoginPage, RegisterPage, ResetPasswordPage } from './pages/AuthPage';
import { DoctorsPage, DoctorProfilePage } from './pages/DoctorsPage';
import ChatPage from './pages/ChatPage';
import AIPage from './pages/AIPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';

// ── Protected Route ──────────────────────────────────────────────────────────
function Protected({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// ── Guest Only Route (redirect if logged in) ─────────────────────────────────
function GuestOnly({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

// ── Layout wrapper ───────────────────────────────────────────────────────────
const NO_FOOTER_ROUTES = ['/chat', '/ai'];

function Layout({ children }) {
  const location = useLocation();
  const noFooter = NO_FOOTER_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      {!noFooter && <Footer />}
    </>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            borderRadius: '12px',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
          },
          success: { iconTheme: { primary: 'var(--color-success)', secondary: 'white' } },
          error: { iconTheme: { primary: 'var(--color-error)', secondary: 'white' } },
        }}
      />
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorProfilePage />} />
          <Route path="/ai" element={<AIPage />} />

          {/* Guest only */}
          <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
          <Route path="/reset-password" element={<GuestOnly><ResetPasswordPage /></GuestOnly>} />

          {/* Protected */}
          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/chat" element={<Protected><ChatPage /></Protected>} />

          {/* Admin only */}
          <Route path="/admin" element={<Protected roles={['admin']}><AdminPage /></Protected>} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
