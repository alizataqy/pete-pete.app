import React from "react";

export default function AgendaLoading() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background text-text overflow-hidden select-none min-h-screen">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center justify-between gap-3">
        <div className="min-w-11 min-h-11 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
        <div className="h-4 bg-secondary-900 rounded-md w-28 animate-pulse mx-auto" />
        <div className="w-11 h-11 shrink-0" />
      </header>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scrollbar-hide">
        {/* Title & Button Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 bg-secondary-800 rounded-md w-32 animate-pulse" />
            <div className="h-2.5 bg-secondary-800/70 rounded-md w-4/5 max-w-sm animate-pulse" />
          </div>
          <div className="w-28 h-11 rounded-lg bg-secondary-800 border border-secondary-700 shrink-0 animate-pulse" />
        </div>

        {/* List Rencana Liburan Cards Skeleton */}
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-secondary-800 bg-secondary-950/20 flex flex-col gap-3"
            >
              {/* Header: Icon, Judul, Deskripsi & Badge Anggota */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-primary-400/10 border border-primary-400/20 shrink-0 animate-pulse" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-4 bg-secondary-800 rounded-md w-44 animate-pulse" />
                    <div className="h-2.5 bg-secondary-800/70 rounded-md w-36 animate-pulse" />
                  </div>
                </div>
                <div className="w-16 h-5 rounded-full bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
              </div>

              {/* Info Tagihan, Tanggal & Detail */}
              <div className="pt-2.5 pb-0.5 border-t border-secondary-800/80 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="h-2 bg-secondary-800/60 rounded-md w-24 animate-pulse" />
                  <div className="h-5 bg-secondary-800 rounded-md w-32 animate-pulse" />
                </div>
                <div className="w-24 h-6 rounded-md bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
