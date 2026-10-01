import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ostrum — Art-Directed Technology & Design Studio',
  description:
    'We design your brand, build your website, connect your business systems (ERP/CRM), and automate the busywork so your company can grow.',
  keywords: [
    'Digital Transformation Studio',
    'Custom ERP Software',
    'CRM Systems',
    'Brand Identity Design',
    'WhatsApp Business Automation',
    'Education Campus Portals',
    'Next.js Web Applications',
  ],
  authors: [{ name: 'Ostrum Studio' }],
  metadataBase: new URL('https://ostrum.studio'),
  openGraph: {
    title: 'Ostrum — Art-Directed Technology & Design Studio',
    description:
      'We design your brand, build your website, connect your business systems (ERP/CRM), and automate the busywork so your company can grow.',
    url: 'https://ostrum.studio',
    siteName: 'Ostrum Studio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ostrum — Art-Directed Technology & Design Studio',
    description:
      'We design your brand, build your website, connect your business systems (ERP/CRM), and automate the busywork so your company can grow.',
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23D24B2C'/></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-canvas-warm text-ink-slate font-body selection:bg-accent-terracotta/20 selection:text-ink-primary">
        {/* Accessibility Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-5 py-2.5 bg-ink-primary text-white font-medium text-sm rounded-md shadow-lg outline-none ring-2 ring-accent-terracotta"
        >
          Skip to main content
        </a>

        {/* Global Site Header */}
        <SiteHeader />

        {/* Main Content Viewport */}
        <div id="main-content" className="flex-1">
          {children}
        </div>

        {/* Global Site Footer */}
        <SiteFooter />
      </body>
    </html>
  );
}
