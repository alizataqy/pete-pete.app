import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PETE-PETE — Akhir dari Drama Patungan",
  description: "Bagi tagihan makan dan belanja bersama jadi lebih gampang dengan AI OCR scan struk dan tagih langsung ke WhatsApp.",
  openGraph: {
    title: "PETE-PETE — Akhir dari Drama Patungan",
    description: "Bagi tagihan makan dan belanja bersama jadi lebih gampang dengan AI OCR scan struk dan tagih langsung ke WhatsApp.",
    url: "https://ceban-pertama.vercel.app",
    siteName: "PETE-PETE",
    images: [
      {
        url: "https://ceban-pertama.vercel.app/og-image.png",
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
    images: ["https://ceban-pertama.vercel.app/og-image.png"],
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
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} bg-powder-blue-950 text-jet-black-50 antialiased min-h-screen flex justify-center`} suppressHydrationWarning>
        {/* Halaman landing page (mengandung LandingView) bebas dari constraint max-w-md agar tampil responsif desktop */}
        <div className="w-full min-h-screen bg-lilac-ash-950 border-x border-lilac-ash-900 shadow-2xl relative flex flex-col has-[[data-landing-view]]:max-w-none has-[[data-landing-view]]:border-x-0 max-w-md">
          {children}
        </div>
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
