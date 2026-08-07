"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { ArrowLeft, Plus } from "@untitledui/icons";
import { UserBankData } from "@/app/actions/profile";

interface WalletsListViewProps {
  initialBanks: UserBankData[];
}

export default function WalletsListView({ initialBanks }: WalletsListViewProps) {
  const router = useRouter();
  const [banks] = useState<UserBankData[]>(initialBanks);

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onPress={() => router.push("/profile")}
            color="primary"
            size="sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-extrabold text-text-50">Semua Wallet</h1>
            <p className="text-[10px] text-text-300 mt-0.5">Daftar bank &amp; e-wallet terdaftar</p>
          </div>
        </div>
        <Button
          type="button"
          onPress={() => router.push("/profile/banks/new")}
          iconLeading={<Plus className="w-4 h-4" />}
          className="text-xs py-1.5 px-3"
          color="primary"
        >
          Tambah Bank
        </Button>
      </header> 

      {/* Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {banks.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-text-700 bg-text-950 flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-text-400">Belum ada rekening terdaftar</p>
            <Button
              onPress={() => router.push("/profile/banks/new")}
              className="text-[10px] font-bold text-primary-400 hover:text-primary-300 bg-transparent border-0"
            >
              Tambah rekening pertama lo
            </Button>
          </div>
        ) : (
          banks.map((b) => {
            const isEWallet = ["GoPay", "OVO", "Dana"].includes(b.bankName);
            const isQris = b.bankName === "QRIS";
            const maskedAccount = isQris
              ? "QRIS Image"
              : b.bankAccount.length > 4
                ? "••" + b.bankAccount.slice(-4)
                : b.bankAccount;

            return (
              <button
                key={b.id}
                onClick={() => router.push(`/profile/banks/${b.id}`)}
                className="w-full text-left p-0 bg-transparent border-0 flex flex-col cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-full relative rounded-2xl p-4 overflow-hidden transition-all active:scale-[0.98] ${
                      b.bankName === "BCA" ? "bg-brand-bca text-white" :
                      b.bankName === "Bank Mandiri" ? "bg-brand-mandiri text-white" :
                      b.bankName === "BRI" ? "bg-brand-bri text-white" :
                      b.bankName === "BNI" ? "bg-brand-bni text-white" :
                      b.bankName === "GoPay" ? "bg-brand-gopay text-white" :
                      b.bankName === "OVO" ? "bg-brand-ovo text-white" :
                      b.bankName === "Dana" ? "bg-brand-dana text-white" :
                      b.bankName === "QRIS" ? "bg-brand-qris text-white" :
                      "bg-primary text-text-950"
                    }`}
                >
                  <span className="absolute top-3 right-3 text-[8px] font-bold uppercase tracking-wider bg-white/15 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                    {isQris ? "QRIS" : isEWallet ? "E-Wallet" : "Bank Account"}
                  </span>

                  <div className="mb-6">
                    {b.imageUrl && !isQris ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.imageUrl} alt={b.bankName} className="h-8 w-auto object-contain brightness-0 invert" />
                    ) : isQris ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/bank-logos/qris.svg" alt="QRIS" className="h-8 w-auto object-contain brightness-0 invert" />
                    ) : (
                      <p className="text-lg font-extrabold text-white/90">{b.bankName}</p>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white/90 uppercase">{b.bankOwner}</p>
                    <p className="text-[10px] text-white/60 font-semibold uppercase">{b.bankName}</p>
                    <p className="text-sm font-bold text-white tracking-wider mt-1">{maskedAccount}</p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
