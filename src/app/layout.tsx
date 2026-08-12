import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import MobileContainer from "@/components/MobileContainer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ceban-pertama.vercel.app"),
  title: "PETE-PETE — Akhir dari Drama Patungan",
  description: "Bagi tagihan makan dan belanja bersama jadi lebih gampang dengan AI OCR scan struk dan tagih langsung ke WhatsApp.",
  robots: {
    index: true,
    follow: true,
  },
  keywords: ["patungan", "split bill", "bagi tagihan", "ocr scan struk", "pete pete", "aplikasi patungan", "hitung patungan online", "scan struk patungan", "ceban pertama"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PETE-PETE — Akhir dari Drama Patungan",
    description: "Bagi tagihan makan dan belanja bersama jadi lebih gampang dengan AI OCR scan struk dan tagih langsung ke WhatsApp.",
    url: "https://ceban-pertama.vercel.app",
    siteName: "PETE-PETE",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PETE-PETE Preview Image",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PETE-PETE — Akhir dari Drama Patungan",
    description: "Bagi tagihan makan dan belanja bersama jadi lebih gampang dengan AI OCR scan struk dan tagih langsung ke WhatsApp.",
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
    "@type": "WebApplication",
    "name": "PETE-PETE",
    "url": "https://ceban-pertama.vercel.app",
    "description": "Bagi tagihan makan dan belanja bersama jadi lebih gampang dengan AI OCR scan struk dan tagih langsung ke WhatsApp.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    }
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
