import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import ErrorBoundary from '@/components/ErrorBoundary';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ASTROVISION - AI Destekli Astroloji Haritaları",
  description: "Doğum haritanızı hesaplayın, transit haritalarını keşfedin. Yapay zeka ile astroloji yorumları.",
  keywords: "astroloji, doğum haritası, transit, burçlar, gezegenler, AI, ASTROVISION",
  authors: [{ name: "ASTROVISION" }],
  creator: "ASTROVISION",
  publisher: "ASTROVISION",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3003'),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ASTROVISION",
  },
  applicationName: "ASTROVISION",
  openGraph: {
    type: "website",
    title: "ASTROVISION - AI Destekli Astroloji Haritaları",
    description: "Doğum haritanızı hesaplayın, transit haritalarını keşfedin. Yapay zeka ile astroloji yorumları.",
    siteName: "ASTROVISION",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASTROVISION - AI Destekli Astroloji Haritaları",
    description: "Doğum haritanızı hesaplayın, transit haritalarını keşfedin.",
    images: ["/logo.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ServiceWorkerRegistration />
          <PWAInstallPrompt />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
