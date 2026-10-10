import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileContainer from "@/components/MobileContainer";
import ClientProviders from "@/components/ClientProviders";
import { getAppUrl } from "@/utils/url";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  themeColor: "#3129d6",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const appUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Split Bill Online | Ceban Pertama",
    template: "%s | Ceban Pertama",
  },
  description: "Aplikasi split bill online gratis di Indonesia. Tinggal foto struk makan, AI otomatis split bill, hitung pajak resto & service charge, langsung share ke WhatsApp.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ceban Pertama",
  },
  icons: {
    icon: [
      { url: "/icon-maskable-512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "split bill",
    "split bill online",
    "aplikasi split bill",
    "hitung splitbill online",
    "kalkulator split bill",
    "bagi tagihan",
    "ocr scan struk",
    "scan struk splitbill",
    "pete pete",
    "ceban pertama",
  ],
  openGraph: {
    title: "Split Bill Online | Ceban Pertama",
    description: "Aplikasi split bill online gratis di Indonesia. Tinggal foto struk makan, AI otomatis split bill, hitung pajak resto & service charge, langsung share ke WhatsApp.",
    url: appUrl,
    siteName: "Ceban Pertama",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ceban Pertama - Aplikasi Split Bill Online",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split Bill Online | Ceban Pertama",
    description: "Aplikasi split bill online gratis di Indonesia. Tinggal foto struk makan, AI otomatis split bill, hitung pajak resto & service charge, langsung share ke WhatsApp.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "CtKabgz4N2_NiMCQ74QNaLx6QFZhGUfvUuIcyk03IKc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Ceban Pertama",
        "url": appUrl,
        "description": "Aplikasi split bill online gratis di Indonesia untuk split bill dan hitung patungan otomatis lewat foto struk.",
        "applicationCategory": "UtilityApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "IDR",
        },
      },
      {
        "@type": "HowTo",
        "name": "Cara Split Bill Otomatis dengan Foto Struk",
        "description": "Langkah mudah split bill dan hitung patungan otomatis memakai Ceban Pertama.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Jepret Struk Makan",
            "text": "Foto atau upload struk makan lo. AI otomatis membaca nama menu, harga, pajak resto, dan service charge.",
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Tandai Siapa Makan Apa",
            "text": "Pilih nama sohib pada menu yang dipesan atau bagi rata untuk menu sharing bersama.",
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Share Bill ke WhatsApp",
            "text": "Format detail bill lengkap dengan nominal pas dan info rekening untuk langsung di-share ke grup WhatsApp.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Apa itu aplikasi split bill Ceban Pertama?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ceban Pertama adalah aplikasi split bill online dan kalkulator splitbill otomatis gratis di Indonesia. Lo cuma perlu foto struk makanan, sistem otomatis menghitung porsi tiap orang beserta pajak dan service charge.",
            },
          },
          {
            "@type": "Question",
            "name": "Bagaimana cara hitung split bill dengan pajak dan diskon restoran?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ceban Pertama menghitung pajak resto dan service charge secara proporsional sesuai nominal pesanan masing-masing orang, jadi pembagian tagihan adil dan akurat.",
            },
          },
          {
            "@type": "Question",
            "name": "Apakah Ceban Pertama gratis dan harus download aplikasi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "100% gratis dan langsung bisa dipakai lewat browser tanpa wajib install aplikasi atau daftar akun.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.dicebear.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen`} suppressHydrationWarning>
        <MobileContainer>
          {children}
        </MobileContainer>
        <ClientProviders />
      </body>
    </html>
  );
}
