import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { PreloaderProvider } from '@/context/PreloaderContext';
import { OstrumPreloader } from '@/components/ui/OstrumPreloader';
import { OstrumContinuousJourney } from '@/components/visuals/OstrumContinuousJourney';
import { Header } from '@/components/navigation/Header';
import { BackgroundCaustics } from '@/components/canvas/BackgroundCaustics';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { SmoothScroll } from '@/components/providers/SmoothScroll';

export const metadata: Metadata = {
  title: 'OSTRUM — Digital Transformation Studio',
  description:
    'We build the technology that helps ambitious businesses grow. Custom software development, integrations, and digital infrastructure.',
  keywords: [
    'Ostrum',
    'Digital Transformation',
    'Technology Studio',
    'Software Architecture',
    'Integrations',
    'Three.js',
    'WebGL',
  ],
  metadataBase: new URL('https://ostrum.com'),
  openGraph: {
    title: 'OSTRUM — Digital Transformation Studio',
    description:
      'We build the technology that helps ambitious businesses grow.',
    url: 'https://ostrum.com',
    siteName: 'OSTRUM',
    locale: 'en_US',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-black">
      <body className="bg-black text-white antialiased selection:bg-white selection:text-black">
        <LanguageProvider>
          <PreloaderProvider>
            <SmoothScroll>
              {/* Fixed Luminous Caustics WebGL Background */}
              <BackgroundCaustics />

              {/* Luxury Cinematic Multi-color Preloader Atmosphere (z-[25]) */}
              <OstrumPreloader />

              {/* Continuous 3D Journey Canvas (z-[35] during loader, z-[12] after complete) */}
              <OstrumContinuousJourney />

              {/* Custom Precision Desktop Circular Cursor */}
              <CustomCursor />

              {/* Minimalist Floating Global Header */}
              <Header />

              {/* Page Main Content */}
              <main className="relative z-10">{children}</main>
            </SmoothScroll>
          </PreloaderProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
