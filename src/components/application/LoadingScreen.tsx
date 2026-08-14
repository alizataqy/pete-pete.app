import React from "react";

interface LoadingScreenProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
}

export default function LoadingScreen({
  title = "Sabar ya, ngab!",
  description = "Data lu lagi gua proses nih",
  showHeader = false,
}: LoadingScreenProps) {
  return (
    <div className="flex-1 flex flex-col bg-background text-text select-none pb-16 min-h-screen">
      {/* Header Loading Skeleton */}
      {showHeader && (
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 border-b border-secondary-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-lg bg-secondary-800 animate-pulse shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-secondary-800 rounded-md w-2/3 animate-pulse" />
              <div className="h-2.5 bg-secondary-800 rounded-md w-1/3 animate-pulse" />
            </div>
          </div>
        </header>
      )}

      {/* Main Skeleton Body */}
      <div className="flex-1 p-4 space-y-6 flex flex-col justify-center items-center">
        <div className="relative flex items-center justify-center">
          {/* Animated Spinner with Gradient Rings */}
          <div className="w-16 h-16 rounded-full border-4 border-secondary-800 border-t-primary animate-spin" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-sm font-bold text-text-50">{title}</h3>
          <p className="text-xs text-text-400">{description}</p>
        </div>
      </div>
    </div>
  );
}
