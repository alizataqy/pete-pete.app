"use client";

import { useRouter } from "next/navigation";
import { SearchRefraction } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center bg-background text-text min-h-screen">
      <SearchRefraction className="w-12 h-12 text-text-400" />
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-text-50">404</h1>
        <p className="text-sm text-text-400">
          Ngapain lo di sokin, ngab!
        </p>
      </div>
      <Button
        onPress={() => router.back()}
        color="primary"
        size="md"
        className="mt-2"
      >
        Balik
      </Button>
    </main>
  );
}
