"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUserBank } from "@/app/actions/profile";
import { ArrowLeft, Copy01, Share07, Trash01, Eye, EyeOff } from "@untitledui/icons";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";

interface BankDetailProps {
  bank: {
    id: string;
    bankName: string;
    bankAccount: string;
    bankOwner: string;
    imageUrl: string;
  };
  userId: string;
}

export default function BankDetailView({ bank, userId }: BankDetailProps) {
  const router = useRouter();
  const [showAccount, setShowAccount] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEWallet = ["GoPay", "OVO", "Dana"].includes(bank.bankName);
  const isQris = bank.bankName === "QRIS";

  const maskedAccount = isQris
    ? "QRIS Image"
    : bank.bankAccount.length > 4
      ? "••" + bank.bankAccount.slice(-4)
      : bank.bankAccount;

  const handleDelete = async () => {
    if (!confirm("Yakin mau hapus rekening ini?")) return;
    setDeleting(true);
    try {
      const res = await deleteUserBank(userId, bank.id);
      if (res.success) {
        toast.success("Rekening berhasil dihapus!");
        router.push("/profile");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus rekening.");
      }
    } catch {
      toast.error("Gagal menghapus rekening.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center justify-center relative">
        <Button
          href="/profile/banks"
          className="absolute left-4 p-2 rounded-lg border border-text-700 text-text-100 hover:bg-secondary-800 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-sm font-extrabold text-text-50">Detail Rekening</h1>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        {/* Premium Bank Card */}
        <div
          className={`relative rounded-2xl p-5 overflow-hidden ${
              bank.bankName === "BCA" ? "bg-brand-bca text-white" :
              bank.bankName === "Bank Mandiri" ? "bg-brand-mandiri text-white" :
              bank.bankName === "BRI" ? "bg-brand-bri text-white" :
              bank.bankName === "BNI" ? "bg-brand-bni text-white" :
              bank.bankName === "GoPay" ? "bg-brand-gopay text-white" :
              bank.bankName === "OVO" ? "bg-brand-ovo text-white" :
              bank.bankName === "Dana" ? "bg-brand-dana text-white" :
              bank.bankName === "QRIS" ? "bg-brand-qris text-white" :
              "bg-primary text-text-950"
          }`}
        >
          {/* Badge */}
          <span className="absolute top-4 right-4 text-[8px] font-bold uppercase tracking-wider bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
            {isQris ? "QRIS" : isEWallet ? "E-Wallet" : "Bank Account"}
          </span>

          {/* Logo */}
          <div className="mb-8">
            {bank.imageUrl && !isQris ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bank.imageUrl}
                alt={bank.bankName}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            ) : isQris ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/bank-logos/qris.svg"
                alt="QRIS"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            ) : (
              <p className="text-xl font-extrabold text-white/90">{bank.bankName}</p>
            )}
          </div>

          {/* Account Info */}
          <div className="space-y-1">
            <p className="text-sm font-bold text-white uppercase">{bank.bankOwner}</p>
            <p className="text-[10px] text-white/60 font-semibold uppercase">{bank.bankName}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-lg font-bold text-white tracking-widest">
                {showAccount ? bank.bankAccount : maskedAccount}
              </p>
              {!isQris && (
                <button
                  type="button"
                  onClick={() => setShowAccount(!showAccount)}
                  className="p-1 text-white/50 hover:text-white/80 transition-all"
                >
                  {showAccount ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(bank.bankAccount);
              toast.success("Nomor rekening disalin!");
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-secondary-800 bg-text-900 text-text-100 text-xs font-semibold hover:bg-text-800 active:scale-95 transition-all"
          >
            <Copy01 className="w-4 h-4" /> Salin Nomor
          </button>
          <button
            type="button"
            onClick={() => {
              const text = `Transfer ke ${bank.bankName}\nA/N: ${bank.bankOwner}\nNo. Rek: ${bank.bankAccount}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold active:scale-95 transition-all"
          >
            <Share07 className="w-4 h-4" /> Share WA
          </button>
        </div>

        {/* Delete Section */}
        <div className="pt-4 border-t border-secondary-800">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-rose-400 hover:text-rose-300 disabled:opacity-50 transition-all"
          >
            <Trash01 className="w-4 h-4" /> Hapus Rekening
          </button>
        </div>
      </div>
    </div>
  );
}
