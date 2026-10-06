import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { Header } from '@/components/navigation/Header';
import { BackgroundCaustics } from '@/components/canvas/BackgroundCaustics';
import { OrderModal } from '@/components/modal/OrderModal';

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
          {/* Fixed Luminous Caustics WebGL Background */}
          <BackgroundCaustics />

          {/* Minimalist Floating Global Header */}
          <Header />

          {/* Page Main Content */}
          <main className="relative z-10">{children}</main>

          {/* Global Order Checkout Modal */}
          <OrderModal />
        </LanguageProvider>
      </body>
    </html>
  );
}
