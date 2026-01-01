import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Event4u - Event Quote Calculator',
  description: 'Professional event planning and quote generation system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
