import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PETE-PETE",
  description: "Bagi tagihan makan dan belanja bersama jadi lebih gampang dengan OCR scan struk dan pembayaran langsung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} bg-powder-blue-950 text-jet-black-50 antialiased min-h-screen flex justify-center`} suppressHydrationWarning>
        <div className="w-full max-w-md min-h-screen bg-lilac-ash-950 border-x border-lilac-ash-900 shadow-2xl relative flex flex-col">
          {children}
        </div>
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
