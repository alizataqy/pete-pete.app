import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk Akun",
  description: "Masuk ke Ceban Pertama untuk simpan histori pete-pete dan kelola patungan tongkrongan lo.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
