import React from "react";

export default function AgendaDetailLoading() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background text-text select-none min-h-screen">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center gap-3">
        <div className="min-w-11 min-h-11 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="h-4 bg-secondary-900 rounded-md w-44 animate-pulse" />
          <div className="h-2.5 bg-secondary-900/70 rounded-md w-36 animate-pulse" />
        </div>
      </header>

      {/* Main Layout Skeleton */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3.5 min-h-0">
        {/* Info Summary Box Skeleton */}
        <div className="p-4 rounded-xl border border-secondary-800 bg-secondary-950/15 flex items-center justify-between shrink-0">
          <div className="space-y-1.5">
            <div className="h-2.5 bg-secondary-800/70 rounded-md w-36 animate-pulse" />
            <div className="h-6 bg-secondary-800 rounded-md w-32 animate-pulse" />
          </div>
          <div className="w-9 h-9 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
        </div>

        {/* 1. Tim Sohib Accordion Skeleton */}
        <div className="p-3.5 rounded-xl border border-secondary-800 bg-secondary-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-secondary-800 shrink-0 animate-pulse" />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="h-3.5 bg-secondary-800 rounded-md w-28 animate-pulse" />
              <div className="h-2.5 bg-secondary-800/60 rounded-md w-20 animate-pulse" />
            </div>
          </div>
          <div className="w-6 h-6 rounded-md bg-secondary-800/60 shrink-0 animate-pulse" />
        </div>

        {/* 2. Daftar Biaya Accordion Skeleton */}
        <div className="p-3.5 rounded-xl border border-secondary-800 bg-secondary-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-secondary-800 shrink-0 animate-pulse" />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="h-3.5 bg-secondary-800 rounded-md w-36 animate-pulse" />
              <div className="h-2.5 bg-secondary-800/60 rounded-md w-24 animate-pulse" />
            </div>
          </div>
          <div className="w-6 h-6 rounded-md bg-secondary-800/60 shrink-0 animate-pulse" />
        </div>

        {/* 3. Ringkasan Transfer Card Skeleton */}
        <div className="p-3.5 rounded-xl border border-secondary-800 bg-secondary-900/60 flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-secondary-800 shrink-0 animate-pulse" />
              <div className="space-y-1 min-w-0 flex-1">
                <div className="h-3.5 bg-secondary-800 rounded-md w-32 animate-pulse" />
                <div className="h-2.5 bg-secondary-800/60 rounded-md w-40 animate-pulse" />
              </div>
            </div>
            <div className="w-6 h-6 rounded-md bg-secondary-800/60 shrink-0 animate-pulse" />
          </div>

          <div className="space-y-2 pt-2 border-t border-secondary-800/60 overflow-y-auto">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-secondary-800/80 bg-secondary-950/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-full bg-secondary-800 border border-secondary-700 shrink-0 animate-pulse" />
                  <div className="h-3 bg-secondary-800 rounded-md w-14 animate-pulse" />
                  <div className="w-4 h-3 bg-secondary-800/60 rounded shrink-0 animate-pulse" />
                  <div className="w-7 h-7 rounded-full bg-secondary-800 border border-secondary-700 shrink-0 animate-pulse" />
                  <div className="h-3 bg-secondary-800 rounded-md w-14 animate-pulse" />
                </div>
                <div className="h-4 bg-secondary-800 rounded-md w-20 shrink-0 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
