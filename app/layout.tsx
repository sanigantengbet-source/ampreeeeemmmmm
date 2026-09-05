import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'AM Prem Verifier - Sistem Verifikasi Akun Alight Motion',
  description: 'Layanan verifikasi akun Alight Motion via magic link dengan antarmuka web modern dan aman.',
  openGraph: {
    title: 'AM Prem Verifier - Sistem Verifikasi Akun Alight Motion',
    description: 'Layanan verifikasi akun Alight Motion via magic link dengan antarmuka web modern dan aman.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AM Prem Verifier - Sistem Verifikasi Akun Alight Motion',
    description: 'Layanan verifikasi akun Alight Motion via magic link dengan antarmuka web modern dan aman.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
