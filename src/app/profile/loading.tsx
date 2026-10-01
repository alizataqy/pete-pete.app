import React from "react";

export default function ProfileLoading() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background text-text select-none min-h-screen">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center gap-3">
        <div className="min-w-11 min-h-11 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-secondary-900 rounded-md w-24 animate-pulse" />
          <div className="h-2.5 bg-secondary-900 rounded-md w-40 animate-pulse" />
        </div>
      </header>

      {/* Scrollable Body Skeleton */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Card 1: Informasi Profil */}
        <div className="p-4 rounded-xl border border-secondary-800 bg-secondary-900/60 space-y-4">
          <div className="space-y-1">
            <div className="h-3.5 bg-secondary-800 rounded-md w-20 animate-pulse" />
            <div className="h-2.5 bg-secondary-800/70 rounded-md w-48 animate-pulse" />
          </div>

          <div className="flex gap-4">
            {/* Avatar Column */}
            <div className="flex flex-col gap-2 items-center mt-2 shrink-0">
              <div className="w-16 h-16 rounded-full bg-secondary-800 border-2 border-secondary-700 animate-pulse shadow-md" />
              <div className="w-22 h-8 rounded-lg bg-secondary-800 border border-secondary-700 animate-pulse mt-1" />
            </div>

            {/* Form Column */}
            <div className="flex-1 space-y-3.5">
              <div className="space-y-1.5">
                <div className="h-3 bg-secondary-800 rounded-md w-16 animate-pulse" />
                <div className="h-10 bg-secondary-800/60 rounded-lg border border-secondary-700/60 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <div className="h-3 bg-secondary-800 rounded-md w-24 animate-pulse" />
                <div className="h-10 bg-secondary-800/60 rounded-lg border border-secondary-700/60 animate-pulse" />
              </div>

              <div className="w-full h-11 rounded-lg bg-secondary-800 animate-pulse mt-1" />
            </div>
          </div>
        </div>

        {/* Card 2: Wallet Summary Block */}
        <div className="p-4 rounded-xl border border-secondary-800 bg-secondary-900/60 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-secondary-800 border border-secondary-700 flex items-center justify-center shrink-0 animate-pulse" />
              <div className="space-y-1.5 min-w-0">
                <div className="h-4 bg-secondary-800 rounded-md w-20 animate-pulse" />
                <div className="h-2.5 bg-secondary-800/70 rounded-md w-32 animate-pulse" />
              </div>
            </div>
            <div className="w-24 h-9 rounded-lg bg-secondary-800 border border-secondary-700 shrink-0 animate-pulse" />
          </div>

          <div className="space-y-2 pt-2 border-t border-secondary-800/60">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-secondary-800/80 bg-secondary-950/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded bg-secondary-800 border border-secondary-700 shrink-0 animate-pulse" />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="h-3.5 bg-secondary-800 rounded-md w-24 animate-pulse" />
                    <div className="h-2.5 bg-secondary-800/70 rounded-md w-40 animate-pulse" />
                  </div>
                </div>
                <div className="w-6 h-6 rounded-md bg-secondary-800/60 shrink-0 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Ganti Kata Sandi */}
        <div className="p-4 rounded-xl border border-secondary-800 bg-secondary-900/60 space-y-3.5">
          <div className="space-y-1">
            <div className="h-3.5 bg-secondary-800 rounded-md w-28 animate-pulse" />
            <div className="h-2.5 bg-secondary-800/70 rounded-md w-40 animate-pulse" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 bg-secondary-800 rounded-md w-24 animate-pulse" />
                <div className="h-10 bg-secondary-800/60 rounded-lg border border-secondary-700/60 animate-pulse" />
              </div>
            ))}
            <div className="w-full h-11 rounded-lg bg-secondary-800 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
