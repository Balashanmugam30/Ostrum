import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { PreloaderProvider } from '@/context/PreloaderContext';
import { OstrumPreloader } from '@/components/ui/OstrumPreloader';
import { OstrumContinuousJourney } from '@/components/visuals/OstrumContinuousJourney';
import { Header } from '@/components/navigation/Header';
import { BackgroundCaustics } from '@/components/canvas/BackgroundCaustics';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { SITE_CONFIG, hasValidLinkedIn, getVerifiedLinkedInUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  title: {
    default: 'OSTRUM — Digital Transformation & Engineering Studio',
    template: '%s — OSTRUM',
  },
  description:
    'Independent digital engineering, technology architecture, and product design studio. We build intelligent systems, business platforms, and immersive web experiences.',
  keywords: [
    'Ostrum',
    'Digital Transformation',
    'Technology Studio',
    'Software Architecture',
    'AI Systems',
    'Integrations',
    'Next.js',
    'WebGL',
    'Product Engineering',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'OSTRUM — Digital Transformation & Engineering Studio',
    description:
      'Independent digital engineering, technology architecture, and product design studio.',
    url: SITE_CONFIG.baseUrl,
    siteName: 'OSTRUM',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/ostrum-og.png',
        width: 1200,
        height: 630,
        alt: 'OSTRUM — Digital Experience & Technology Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OSTRUM — Digital Transformation & Engineering Studio',
    description:
      'Independent digital engineering, technology architecture, and product design studio.',
    images: ['/images/ostrum-og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

const verifiedSameAs = [
  SITE_CONFIG.githubUrl,
  ...(hasValidLinkedIn() && getVerifiedLinkedInUrl() ? [getVerifiedLinkedInUrl()!] : []),
].filter(Boolean);

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.baseUrl}/#organization`,
      name: 'OSTRUM',
      legalName: 'Ostrum',
      url: SITE_CONFIG.baseUrl,
      logo: `${SITE_CONFIG.baseUrl}/images/ostrum-logo.png`,
      email: SITE_CONFIG.contactEmail,
      description:
        'Independent digital product engineering, technology architecture, and venture design studio.',
      sameAs: verifiedSameAs,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_CONFIG.baseUrl}/#website`,
      url: SITE_CONFIG.baseUrl,
      name: 'OSTRUM',
      publisher: {
        '@id': `${SITE_CONFIG.baseUrl}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-black">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-black text-white antialiased">
        <LanguageProvider>
          <PreloaderProvider>
            <SmoothScroll>
              {/* Fixed Luminous Caustics WebGL Background */}
              <BackgroundCaustics />

              {/* Luxury Cinematic 3D Preloader (Stage A Pearl -> Stage B Crimson -> Stage C Handoff) */}
              <OstrumPreloader />

              {/* Master Continuous 3D Möbius Journey (z-[35] during preloader, z-[12] after complete) */}
              <OstrumContinuousJourney />

              {/* Minimalist Floating Global Header */}
              <Header />

              {/* Page Main Content */}
              <main id="main-content" className="relative w-full min-h-screen">
                {children}
              </main>
            </SmoothScroll>
          </PreloaderProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
