import React from "react";

interface LoadingScreenProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
}

export default function LoadingScreen({
  showHeader = true,
}: LoadingScreenProps) {
  return (
    <div className="flex-1 flex flex-col bg-background text-text select-none min-h-screen">
      {/* Header Skeleton */}
      {showHeader && (
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
            <div className="space-y-1.5 flex-1 max-w-xs">
              <div className="h-4 bg-secondary-900 border border-secondary-800/60 rounded-md w-3/4 animate-pulse" />
              <div className="h-2.5 bg-secondary-900 border border-secondary-800/60 rounded-md w-1/2 animate-pulse" />
            </div>
          </div>
          <div className="w-16 h-8 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
        </header>
      )}

      {/* Main Skeleton Content */}
      <div className="flex-1 p-4 flex flex-col gap-3.5 overflow-hidden">
        {/* Banner Card Skeleton */}
        <div className="p-4 rounded-xl border border-secondary-800 bg-secondary-950/30 flex items-center justify-between gap-3 shrink-0 min-h-14">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-secondary-900 rounded-md w-28 animate-pulse" />
              <div className="h-2.5 bg-secondary-900 rounded-md w-4/5 animate-pulse" />
            </div>
          </div>
          <div className="w-12 h-6 rounded-full bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
        </div>

        {/* Action / Search Skeleton */}
        <div className="w-full h-11 rounded-xl bg-secondary-950/30 border border-secondary-800 animate-pulse shrink-0" />

        {/* Section Heading Skeleton */}
        <div className="h-3 bg-secondary-900 rounded-md w-32 shrink-0 animate-pulse mt-1" />

        {/* Main Card Container Skeleton */}
        <div className="flex-1 flex flex-col gap-3 border border-secondary-800 p-3.5 rounded-xl bg-secondary-950/30 overflow-hidden">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-secondary-800 bg-secondary-950/60 flex flex-col items-center gap-1.5"
              >
                <div className="h-2.5 bg-secondary-900 rounded-md w-12 animate-pulse" />
                <div className="h-6 bg-secondary-900 rounded-md w-8 animate-pulse" />
              </div>
            ))}
          </div>

          {/* List Items Skeletons */}
          <div className="space-y-2.5 pt-1 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-secondary-800/80 bg-secondary-900/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-secondary-800/60 border border-secondary-700/60 shrink-0 animate-pulse" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="h-3.5 bg-secondary-800/80 rounded-md w-36 animate-pulse" />
                    <div className="h-2.5 bg-secondary-800/60 rounded-md w-24 animate-pulse" />
                  </div>
                </div>
                <div className="w-16 h-4 bg-secondary-800/80 rounded-md shrink-0 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
