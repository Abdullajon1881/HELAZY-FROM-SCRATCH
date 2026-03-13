import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useT } from '../../i18n/useT';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useT();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="var(--color-primary)" />
              <path d="M14 7v14M7 14h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span>Healzy</span>
          </div>
          <p className={styles.tagline}>
            Modern healthcare, delivered online.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4>Platform</h4>
            <Link to="/doctors">Find Doctors</Link>
            <Link to="/ai">AI Assistant</Link>
            <Link to="/register">Sign Up Free</Link>
          </div>
          <div className={styles.linkGroup}>
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© 2025 Healzy. Made with <Heart size={12} className={styles.heart} /> for better healthcare.</span>
      </div>
    </footer>
  );
}
