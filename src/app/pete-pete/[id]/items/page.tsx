import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft } from "@untitledui/icons";

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

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">


      {/* Header */}
      <header className="sticky top-0 z-20 bg-lilac-ash-950/90 backdrop-blur-md border-b border-lilac-ash-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="p-2 rounded-lg border border-jet-black-700 text-jet-black-100 hover:bg-lilac-ash-800 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-extrabold text-jet-black-50">Review Item</h1>
            <p className="text-[10px] text-jet-black-300 line-clamp-1">{session.title}</p>
          </div>
        </div>
        <Link
          href={`/pete-pete/${session.id}/split`}
          className="px-3.5 py-2 rounded-lg bg-alice-blue-600 hover:bg-alice-blue-700 text-jet-black-50 font-semibold text-[10px] transition-all active:scale-95 shadow-md shadow-alice-blue-600/10"
        >
          Bagi
        </Link>
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Info Pajak & Service Charge */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-jet-black-900/60 rounded-xl border border-lilac-ash-800 text-center text-[10px] text-jet-black-300">
          <div>
            <p className="text-[9px] text-jet-black-400 font-semibold uppercase">Subtotal</p>
            <p className="font-bold text-jet-black-100 mt-1">
              Rp {itemsSubtotal.toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-jet-black-400 font-semibold uppercase">Pajak</p>
            <p className="font-bold text-jet-black-100 mt-1">
              Rp {Number(session.taxAmount).toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-jet-black-400 font-semibold uppercase">Servis</p>
            <p className="font-bold text-jet-black-100 mt-1">
              Rp {Number(session.tipAmount).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* List of Items (Mobile Optimized Card List) */}
        <div className="space-y-2">
          {session.items.map((item) => (
            <div key={item.id} className="bg-jet-black-900 border border-lilac-ash-800 rounded-xl p-3 flex items-center justify-between hover:bg-jet-black-800 transition-all">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-jet-black-50 block">{item.name}</span>
                <span className="text-[10px] text-jet-black-300">
                  {item.quantity}x • Rp {Number(item.unitPrice).toLocaleString("id-ID")}
                </span>
              </div>
              <span className="text-xs font-bold text-alice-blue-300">
                Rp {Number(item.totalPrice).toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>

        {/* Grand Total Summary Card */}
        <div className="p-4 bg-jet-black-900 border border-lilac-ash-800 rounded-xl flex justify-between items-center">
          <span className="text-xs font-semibold text-jet-black-100">Total Keseluruhan</span>
          <span className="text-sm font-extrabold text-lilac-ash-400">
            Rp {Number(session.totalAmount).toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </main>
  );
}
