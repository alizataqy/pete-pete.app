import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft, ArrowRight, ReceiptCheck } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";

export default async function ItemsReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.billSession.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!session) {
    notFound();
  }

  const itemsSubtotal = session.items.reduce((acc, i) => acc + Number(i.totalPrice), 0);
  const tax = Number(session.taxAmount);
  const tip = Number(session.tipAmount);
  const total = Number(session.totalAmount);

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background text-text">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-3.5 sm:px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Button
            href="/tongkrongan"
            color="primary"
            size="sm"
            aria-label="Kembali ke tongkrongan"
            className="min-w-[44px] min-h-[44px] p-2 rounded-lg active:scale-95 transition-all shrink-0 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-extrabold text-text-50 truncate">Cek Menu Struk</h1>
            <p className="text-[10px] text-text-300 truncate">
              {session.merchantName ? `${session.title} • ${session.merchantName}` : session.title}
            </p>
          </div>
        </div>
        <Badge color="brand" size="sm" type="pill-color" className="font-bold shrink-0">
          {session.items.length} Menu
        </Badge>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Rincian Biaya Struk Card */}
        <div className="p-4 rounded-2xl border border-secondary-800 bg-secondary-950/50 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 shrink-0">
              <ReceiptCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-text-50">Rincian Biaya Struk</h2>
              <p className="text-[10px] text-text-400">Pajak & servis otomatis dibagi rata pas patungan</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-secondary-800/80 text-center">
            <div className="p-2 rounded-xl bg-secondary-950/70 border border-secondary-800/60">
              <p className="text-[9px] text-text-400 font-semibold uppercase tracking-wider">Subtotal</p>
              <p className="text-xs font-bold text-text-100 mt-1">
                Rp {itemsSubtotal.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-secondary-950/70 border border-secondary-800/60">
              <p className="text-[9px] text-text-400 font-semibold uppercase tracking-wider">Pajak</p>
              <p className="text-xs font-bold text-text-100 mt-1">
                Rp {tax.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-secondary-950/70 border border-secondary-800/60">
              <p className="text-[9px] text-text-400 font-semibold uppercase tracking-wider">Servis</p>
              <p className="text-xs font-bold text-text-100 mt-1">
                Rp {tip.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* Section List of Items */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider">
                Daftar Menu ({session.items.length})
              </h2>
              <p className="text-[10px] text-text-400 mt-0.5">
                Pastiin pesenan & harganya udah pas ya, Bos!
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {session.items.map((item) => {
              const unitPrice = item.quantity > 0
                ? Math.round(Number(item.totalPrice) / item.quantity)
                : Number(item.unitPrice);

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-secondary-800 bg-secondary-950/40 hover:bg-secondary-950/60 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge color="brand" size="sm" type="pill-color" className="font-bold shrink-0">
                      {item.quantity}x
                    </Badge>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="text-xs font-bold text-text-50 block truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-text-400 block truncate">
                        Rp {unitPrice.toLocaleString("id-ID")} / porsi
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-primary-300 whitespace-nowrap shrink-0">
                    Rp {Number(item.totalPrice).toLocaleString("id-ID")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grand Total Card */}
        <div className="p-4 rounded-2xl bg-secondary-950/70 border border-secondary-800 flex justify-between items-center shadow-sm">
          <div>
            <span className="text-xs font-bold text-text-100 block">Total Keseluruhan Struk</span>
            <span className="text-[10px] text-text-400 block mt-0.5">Termasuk pajak & biaya servis</span>
          </div>
          <span className="text-base font-extrabold text-primary-400">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Docked Bottom Action Bar (Thumb-friendly on mobile) */}
      <div className="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-secondary-800 bg-secondary-950/95 backdrop-blur-md z-20">
        <Button
          href={`/pete-pete/${session.id}/split`}
          color="primary"
          size="lg"
          noTextPadding
          className="w-full min-h-[48px] py-3.5 text-sm font-bold active:scale-[0.96] transition-transform"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <span>Lanjut Bagi Tagihan</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </span>
        </Button>
      </div>
    </main>
  );
}
