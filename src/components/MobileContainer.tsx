"use client";

import { usePathname } from "next/navigation";

export default function MobileContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Halaman landing page (/) tampil full screen tanpa pembatasan lebar
  if (pathname === "/") {
    return (
      <div className="w-full min-h-screen bg-background relative flex flex-col">
        {children}
      </div>
    );
  }

  // Halaman selain landing page dibatasi ukuran mobile (max-w-md) dan diposisikan di tengah (mx-auto)
  return (
    <div className="w-full h-screen overflow-hidden bg-background border-x border-background-200 shadow-2xl relative flex flex-col max-w-md mx-auto">
      {children}
    </div>
  );
}
