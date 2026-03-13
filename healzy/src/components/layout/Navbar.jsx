import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Globe, Bell, Menu, X,
  LogOut, User, Settings, LayoutDashboard, Shield
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';
import { useT } from '../../i18n/useT';
import { LANGUAGES } from '../../i18n/translations';
import { authAPI } from '../../api';
import Avatar from '../common/Avatar';
import styles from './Navbar.module.css';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme, language, setLanguage } = useUIStore();
  const { t } = useT();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = () => { setLangOpen(false); setProfileOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    logout();
    navigate('/');
    toast.success('Signed out successfully');
  };

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';

  const navLinks = [
    { to: '/', label: t.nav.home, exact: true },
    { to: '/doctors', label: t.nav.doctors },
    { to: '/ai', label: t.nav.aiAssistant },
    ...(isAuthenticated ? [{ to: '/chat', label: t.nav.consultations }] : []),
    ...(isAdmin ? [{ to: '/admin', label: t.nav.admin }] : []),
  ];

  return (
    <header className={[styles.navbar, scrolled ? styles.scrolled : ''].join(' ')}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoMark}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="currentColor" className={styles.logoRect} />
              <path d="M14 7v14M7 14h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className={styles.logoText}>Healzy</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Language */}
          <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
            <button
              className={styles.iconBtn}
              onClick={() => setLangOpen(o => !o)}
              title={t.common.language}
            >
              <Globe size={18} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  className={styles.dropdownMenu}
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                    <button
                      key={code}
                      className={[styles.dropdownItem, language === code ? styles.dropdownItemActive : ''].join(' ')}
                      onClick={() => { setLanguage(code); setLangOpen(false); }}
                    >
                      <span>{flag}</span>
                      <span>{name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <motion.button
            className={styles.iconBtn}
            onClick={toggleTheme}
            title={theme === 'light' ? t.common.darkMode : t.common.lightMode}
            whileTap={{ scale: 0.9, rotate: 15 }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </motion.button>

          {/* Auth */}
          {isAuthenticated ? (
            <>
              <button className={styles.iconBtn} title={t.common.notifications}>
                <Bell size={18} />
              </button>
              <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setProfileOpen(o => !o)}
                >
                  <Avatar
                    src={user?.avatar}
                    name={`${user?.firstName} ${user?.lastName}`}
                    size="sm"
                  />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className={[styles.dropdownMenu, styles.profileMenu].join(' ')}
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className={styles.profileHeader}>
                        <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="md" />
                        <div>
                          <div className={styles.profileName}>{user?.firstName} {user?.lastName}</div>
                          <div className={styles.profileEmail}>{user?.email}</div>
                        </div>
                      </div>
                      <div className={styles.dropdownDivider} />
                      <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard size={15} />{t.nav.dashboard}
                      </Link>
                      <Link to="/profile" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                        <User size={15} />{t.nav.profile}
                      </Link>
                      <Link to="/settings" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                        <Settings size={15} />{t.common.settings}
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                          <Shield size={15} />{t.nav.admin}
                        </Link>
                      )}
                      <div className={styles.dropdownDivider} />
                      <button className={[styles.dropdownItem, styles.dropdownItemDanger].join(' ')} onClick={handleLogout}>
                        <LogOut size={15} />{t.nav.logout}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login" className={styles.loginBtn}>{t.nav.login}</Link>
              <Link to="/register" className={styles.registerBtn}>{t.nav.register}</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className={styles.mobileToggle} onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                className={({ isActive }) =>
                  [styles.mobileLink, isActive ? styles.mobileLinkActive : ''].join(' ')
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div className={styles.mobileAuth}>
                <Link to="/login" className={styles.loginBtn} onClick={() => setMobileOpen(false)}>{t.nav.login}</Link>
                <Link to="/register" className={styles.registerBtn} onClick={() => setMobileOpen(false)}>{t.nav.register}</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
