import Link from 'next/link';
import { Heart, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Platform: [
      { label: 'Find Doctors', href: '/doctors' },
      { label: 'Book Appointment', href: '/appointments' },
      { label: 'AI Assistant', href: '/ai/symptom-checker' },
      { label: 'Chat with Doctor', href: '/chat' },
    ],
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
    Support: [
      { label: 'Help Center', href: '/help' },
      { label: 'For Doctors', href: '/for-doctors' },
      { label: 'Patient Guide', href: '/guide' },
    ],
  };

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold font-heading text-sm">H</span>
              </div>
              <span className="font-bold text-lg font-heading">Heal<span className="text-primary-600">zy</span></span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Modern healthcare platform connecting patients with certified doctors across Uzbekistan.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: <Github className="w-4 h-4" />, href: '#' },
                { icon: <Twitter className="w-4 h-4" />, href: '#' },
                { icon: <Linkedin className="w-4 h-4" />, href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href} className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:text-primary-600 hover:border-primary-400 transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm font-heading mb-3">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-[var(--text-secondary)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[var(--text-muted)]">
          <p>© {year} Healzy. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in Uzbekistan
          </p>
        </div>
      </div>
    </footer>
  );
}
