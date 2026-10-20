import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aperçu Studio (Français)',
  description: 'Aperçu de développement du studio d’ingénierie et de technologie OSTRUM.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function FrenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
