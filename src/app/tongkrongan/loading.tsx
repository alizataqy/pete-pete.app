import React from "react";

export default function TongkronganLoading() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background text-text select-none min-h-screen">
      {/* Header Tongkrongan Skeleton */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center justify-between gap-3">
        <div className="flex gap-2.5 items-center min-w-0 flex-1">
          {/* Avatar User */}
          <div className="w-10 h-10 rounded-full bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
          <div className="flex-col flex min-w-0 flex-1 space-y-1.5">
            <div className="h-4 bg-secondary-900 border border-secondary-800/60 rounded-md w-36 animate-pulse" />
            <div className="h-2.5 bg-secondary-900 border border-secondary-800/60 rounded-md w-52 animate-pulse" />
          </div>
        </div>
        {/* Logout Button Skeleton */}
        <div className="w-18 h-8 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
      </header>

      {/* Tongkrongan Body Skeleton */}
      <div className="flex-1 p-4 flex flex-col min-h-0 gap-3 overflow-hidden">
        {/* Banner Make a Plan Skeleton */}
        <div className="relative p-4 rounded-xl border border-secondary-800 bg-secondary-950/15 flex items-center justify-between gap-3 shrink-0 min-h-14">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 bg-secondary-950/80 rounded-lg border border-secondary-800 flex items-center justify-center shrink-0 animate-pulse" />
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="h-3.5 bg-secondary-900 rounded-md w-24 animate-pulse" />
              <div className="h-2.5 bg-secondary-900 rounded-md w-4/5 animate-pulse" />
            </div>
          </div>
          <div className="w-12 h-6 rounded-full bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
        </div>

        {/* Input Cepat Kode Bon Skeleton */}
        <div className="p-1 rounded-xl border border-secondary-800 bg-secondary-900/60 flex items-center justify-between pl-3.5 pr-1 min-h-12 shrink-0">
          <div className="h-3.5 bg-secondary-800/80 rounded-md w-44 animate-pulse" />
          <div className="w-20 h-9 rounded-lg bg-secondary-800/90 border border-secondary-700/60 shrink-0 animate-pulse" />
        </div>

        {/* List Pete-Petean Lo Skeleton */}
        <div className="flex-1 flex flex-col min-h-0 gap-3">
          <div className="h-3.5 bg-secondary-900 rounded-md w-36 shrink-0 animate-pulse" />

          <div className="flex-1 flex flex-col min-h-0 border border-secondary-800 p-3 rounded-xl bg-secondary-950/30 overflow-hidden">
            {/* 3-Column Stats Skeleton */}
            <div className="grid grid-cols-3 gap-2 pb-3 shrink-0">
              {[
                { labelW: "w-10", valW: "w-5" },
                { labelW: "w-12", valW: "w-5" },
                { labelW: "w-14", valW: "w-5" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-secondary-800 bg-secondary-950/60 text-center flex flex-col items-center gap-1.5"
                >
                  <div className={`h-2.5 bg-secondary-900 rounded-md ${stat.labelW} animate-pulse`} />
                  <div className={`h-6 bg-secondary-900 rounded-md ${stat.valW} animate-pulse mt-0.5`} />
                </div>
              ))}
            </div>

            {/* List Sesi Cards Skeleton */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-8 scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-secondary-800 bg-secondary-950/20 flex flex-col gap-3"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-primary-400/10 border border-primary-400/20 shrink-0 animate-pulse" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="h-4 bg-secondary-800 rounded-md w-40 animate-pulse" />
                        <div className="h-2.5 bg-secondary-800/70 rounded-md w-28 animate-pulse" />
                      </div>
                    </div>
                    <div className="w-16 h-5 rounded-full bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2.5 pb-0.5 border-t border-secondary-800/80 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="h-2 bg-secondary-800/60 rounded-md w-16 animate-pulse" />
                      <div className="h-4.5 bg-secondary-800 rounded-md w-28 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex -space-x-1.5">
                        <div className="w-6 h-6 rounded-full bg-secondary-800 border border-secondary-950 animate-pulse" />
                        <div className="w-6 h-6 rounded-full bg-secondary-800 border border-secondary-950 animate-pulse" />
                      </div>
                      <div className="w-16 h-7 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
