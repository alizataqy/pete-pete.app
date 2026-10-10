import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buat Split Bill Baru & Scan Struk Otomatis",
  description:
    "Mulai split bill baru dan patungan online gratis. Foto struk makan, OCR AI otomatis baca menu dan harga, hitung pajak resto tanpa ribet.",
  alternates: {
    canonical: "/pete-pete/new",
  },
  openGraph: {
    title: "Buat Split Bill Baru & Scan Struk Otomatis | Ceban Pertama",
    description:
      "Mulai split bill baru dan patungan online gratis. Foto struk makan, OCR AI otomatis baca menu dan harga, hitung pajak resto tanpa ribet.",
    url: "/pete-pete/new",
  },
};

export default function NewSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
