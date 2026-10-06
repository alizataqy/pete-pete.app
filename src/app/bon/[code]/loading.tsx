export default function BonLoading() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background text-text select-none min-h-screen">
      {/* Screen Header Bar */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="min-w-11 min-h-11 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="h-4 bg-secondary-900 rounded-md w-36 animate-pulse" />
              <div className="h-4 w-12 bg-secondary-900/80 rounded-full animate-pulse" />
            </div>
            <div className="h-2.5 bg-secondary-900/70 rounded-md w-44 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="size-9 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
          <div className="size-9 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
          <div className="size-9 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
          <div className="size-9 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-3.5 sm:p-4 space-y-3.5 overflow-y-auto min-h-0 pb-16">
        {/* Carousel Pilihan Anggota */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="h-3 w-24 bg-secondary-900 rounded animate-pulse" />
            <div className="h-2.5 w-12 bg-secondary-900/70 rounded animate-pulse" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 px-0.5 scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl border border-secondary-800 bg-secondary-950/70 min-w-22 sm:min-w-24 shrink-0 animate-pulse"
              >
                <div className="size-10 rounded-full bg-secondary-900 border border-secondary-800" />
                <div className="w-full space-y-1.5 flex flex-col items-center">
                  <div className="h-3 w-14 bg-secondary-900 rounded" />
                  <div className="h-3 w-16 bg-secondary-900/80 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Kartu Bon Digital (Rincian Anggota Terpilih) */}
        <article className="rounded-2xl border border-secondary-800 bg-secondary-950/80 shadow-sm overflow-hidden space-y-0">
          {/* Header Kartu */}
          <div className="p-3.5 sm:p-4 border-b border-secondary-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-10 rounded-full bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
              <div className="space-y-1">
                <div className="h-2.5 w-24 bg-secondary-900/60 rounded animate-pulse" />
                <div className="h-4 w-32 bg-secondary-900 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-5 w-20 bg-secondary-900 rounded-full shrink-0 animate-pulse" />
          </div>

          {/* Rincian Pesanan Menu */}
          <div className="p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-secondary-800/40 pb-2">
              <div className="h-3 w-36 bg-secondary-900/80 rounded animate-pulse" />
              <div className="h-3 w-10 bg-secondary-900/60 rounded animate-pulse" />
            </div>

            {/* List Menu Items */}
            <div className="space-y-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-secondary-900/50 border border-secondary-800/60 flex items-center justify-between gap-2 animate-pulse"
                >
                  <div className="space-y-1 flex-1">
                    <div className="h-3.5 w-40 bg-secondary-900 rounded" />
                    <div className="h-2.5 w-20 bg-secondary-900/60 rounded" />
                  </div>
                  <div className="h-4 w-16 bg-secondary-900 rounded shrink-0" />
                </div>
              ))}
            </div>

            {/* Subtotal & Breakdown */}
            <div className="pt-2 border-t border-secondary-800 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-secondary-900/70 rounded animate-pulse" />
                <div className="h-3 w-16 bg-secondary-900/70 rounded animate-pulse" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-secondary-900/70 rounded animate-pulse" />
                <div className="h-3 w-14 bg-secondary-900/70 rounded animate-pulse" />
              </div>

              {/* Total Tagihan Box */}
              <div className="p-3 rounded-xl bg-secondary-900/80 border border-secondary-800 flex justify-between items-center mt-2 animate-pulse">
                <div className="space-y-1">
                  <div className="h-2.5 w-32 bg-secondary-800 rounded" />
                  <div className="h-2 w-24 bg-secondary-800/60 rounded" />
                </div>
                <div className="h-5 w-24 bg-secondary-800 rounded" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="w-full h-11 rounded-xl bg-primary/40 border border-primary-600/30 animate-pulse" />
              <div className="w-full h-9 rounded-xl bg-secondary-900 border border-secondary-800 animate-pulse" />
            </div>
          </div>
        </article>

        {/* Transparansi Semua Menu Struk (Accordion Skeleton) */}
        <section className="rounded-2xl border border-secondary-800 bg-secondary-950/60 p-3.5 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="size-4 rounded bg-secondary-900" />
            <div className="space-y-1">
              <div className="h-3 w-40 bg-secondary-900 rounded" />
              <div className="h-2.5 w-28 bg-secondary-900/60 rounded" />
            </div>
          </div>
          <div className="size-4 rounded bg-secondary-900" />
        </section>
      </div>
    </main>
  );
}