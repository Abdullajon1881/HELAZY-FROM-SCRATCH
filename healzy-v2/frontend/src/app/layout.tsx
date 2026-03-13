import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import QueryProvider from '@/features/auth/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Healzy — Healthcare at Your Fingertips', template: '%s | Healzy' },
  description: 'Connect with certified doctors, get AI-powered health insights, and manage your health — all in one place.',
  keywords: ['healthcare', 'doctor', 'telemedicine', 'uzbekistan', 'AI health', 'online consultation'],
  openGraph: {
    siteName: 'Healzy',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  boxShadow: 'var(--shadow-md)',
                },
                success: { iconTheme: { primary: '#0d9488', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
