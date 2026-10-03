import React from "react";

export default function PetePeteLoading() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background text-text select-none min-h-screen">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="min-w-11 min-h-11 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-4 bg-secondary-900 rounded-md w-44 animate-pulse" />
            <div className="h-2.5 bg-secondary-900/70 rounded-md w-32 animate-pulse" />
          </div>
        </div>

        <div className="w-20 h-8 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
      </header>

      {/* Body Content Skeleton */}
      <div className="flex-1 p-3.5 space-y-3.5 flex flex-col overflow-hidden min-h-0">
        {/* Detail Rekening Strip Skeleton */}
        <div className="p-2.5 px-3 rounded-lg border border-secondary-800 bg-secondary-950/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-4 h-4 rounded bg-secondary-800 shrink-0 animate-pulse" />
            <div className="h-3.5 bg-secondary-800/80 rounded-md w-56 animate-pulse" />
          </div>
          <div className="gap-1 flex">
            <div className="w-6 h-5 rounded bg-secondary-800 shrink-0 animate-pulse" />
            <div className="w-6 h-5 rounded bg-secondary-800 shrink-0 animate-pulse" />
          </div>
        </div>

        {/* Member List Strip Skeleton */}
        <div className="p-3 rounded-xl border border-secondary-800 bg-secondary-900/60 flex items-center justify-between gap-2 shrink-0">
          <div className="w-4 h-4 rounded bg-secondary-800 shrink-0 animate-pulse" />
          <div className="items-center gap-1 grid overflow-hidden flex-1">
            <div className="w-30 h-4 rounded bg-secondary-800 shrink-0 animate-pulse" />
            <div className="w-40 h-3 rounded bg-secondary-800 shrink-0 animate-pulse" />
          </div>
          <div className="w-23 h-5 rounded bg-secondary-800 shrink-0 animate-pulse" />
          <div className="w-6 h-5 rounded bg-secondary-800 shrink-0 animate-pulse" />
        </div>

        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1 ">
            <div className="flex gap-1">
              <div className="w-6 h-5 rounded bg-secondary-800 shrink-0 animate-pulse" />
              <div className="w-35 h-4 rounded bg-secondary-800 shrink-0 animate-pulse" />
            </div>
            <div className="w-60 h-3 rounded bg-secondary-800 shrink-0 animate-pulse" />
          </div>
          <div className="w-25 h-5 rounded mt-1 items-center bg-secondary-800 animate-pulse" />
        </div>

        {/* Item Rows Skeleton */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-secondary-800 bg-secondary-900/40 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-4 bg-secondary-800 rounded-md w-40 animate-pulse" />
                  <div className="h-3 bg-secondary-800/60 rounded-md w-28 animate-pulse" />
                  <div className="h-3 mt-3 bg-secondary-800/90 rounded-md w-28 animate-pulse" />
                </div>
                <div className="h-4.5 bg-secondary-800 rounded-md w-24 shrink-0 animate-pulse" />
                <div className="h-4.5 bg-secondary-800 rounded-md w-5 shrink-0 animate-pulse" />
                <div className="h-4.5 bg-secondary-800 rounded-md w-5 shrink-0 animate-pulse" />
              </div>

              <div className="pt-2 gap-1 border-secondary-800/60 flex items-center justify-end">
                <div className="w-16 h-5 mr-3 rounded-full bg-secondary-800/60 animate-pulse" />
                <div className="w-10 h-2 rounded-full bg-secondary-800/60 animate-pulse" />
              </div>
              <div className="flex items-center gap-3 pt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary-800 border border-secondary-700 animate-pulse" />
                    <div className="w-10 h-2 rounded-full bg-secondary-800/60 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar Skeleton */}
        <div className="p-3 bg-secondary-950/90 border-t border-secondary-800 flex items-center justify-between gap-3 shrink-0 rounded-xl">
          <div className="w-25 h-11 rounded-lg bg-secondary-800 animate-pulse" />
          <div className="w-70 h-11 rounded-lg bg-secondary-800 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
