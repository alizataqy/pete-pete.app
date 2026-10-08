"use client";

import dynamic from "next/dynamic";

const InstallPwaPrompt = dynamic(
  () => import("@/components/features/pwa/InstallPwaPrompt"),
  { ssr: false }
);

const Toaster = dynamic(
  () => import("sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

export default function ClientProviders() {
  return (
    <>
      <InstallPwaPrompt />
      <Toaster position="top-center" richColors theme="dark" />
    </>
  );
}
