import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import MobileContainer from "@/components/MobileContainer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ceban-pertama.vercel.app"),
  title: "Split Bill Online & Hitung Patungan Otomatis — Ceban Pertama",
  description: "Aplikasi split bill online gratis di Indonesia. Tinggal foto struk makan, AI otomatis bagi tagihan, hitung persen pajak resto & service charge, langsung kirim rincian ke WhatsApp.",
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "split bill",
    "split bill online",
    "aplikasi split bill",
    "hitung patungan online",
    "kalkulator split bill",
    "bagi tagihan",
    "ocr scan struk",
    "scan struk patungan",
    "pete pete",
    "ceban pertama",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Split Bill Online & Hitung Patungan Otomatis — Ceban Pertama",
    description: "Aplikasi split bill online gratis di Indonesia. Tinggal foto struk makan, AI otomatis bagi tagihan, hitung persen pajak resto & service charge, langsung kirim rincian ke WhatsApp.",
    url: "https://ceban-pertama.vercel.app",
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
    title: "Split Bill Online & Hitung Patungan Otomatis — Ceban Pertama",
    description: "Aplikasi split bill online gratis di Indonesia. Tinggal foto struk makan, AI otomatis bagi tagihan, hitung persen pajak resto & service charge, langsung kirim rincian ke WhatsApp.",
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
        "url": "https://ceban-pertama.vercel.app",
        "description": "Aplikasi split bill online gratis di Indonesia untuk bagi tagihan makan dan hitung patungan otomatis lewat foto struk.",
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
        "description": "Langkah mudah bagi tagihan makan dan patungan otomatis memakai Ceban Pertama.",
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
            "text": "Pilih nama teman pada menu yang dipesan atau bagi rata untuk menu sharing bersama.",
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Kirim Rincian ke WhatsApp",
            "text": "Salin format rincian tagihan lengkap dengan nominal pas dan info rekening untuk langsung dibagikan ke grup WhatsApp.",
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
              "text": "Ceban Pertama adalah aplikasi split bill online dan kalkulator patungan otomatis gratis di Indonesia. Lo cuma perlu foto struk makanan, sistem otomatis menghitung porsi tiap orang beserta pajak dan service charge.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen`} suppressHydrationWarning>
        <MobileContainer>
          {children}
        </MobileContainer>
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
