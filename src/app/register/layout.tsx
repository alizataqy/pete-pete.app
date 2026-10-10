import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Akun Baru",
  description: "Daftar akun Ceban Pertama gratis. Split bill otomatis dengan AI, simpan kontak sohib, dan kelola patungan makin praktis.",
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
