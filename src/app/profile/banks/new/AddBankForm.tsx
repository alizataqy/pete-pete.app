"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { addUserBank } from "@/app/actions/profile";
import { ArrowLeft, Plus } from "@untitledui/icons";
import { toast } from "sonner";

const BANK_TEMPLATES = [
  { name: "BCA", logo: "/bank-logos/bca.svg", placeholder: "Contoh: 1234567890" },
  { name: "Bank Mandiri", logo: "/bank-logos/mandiri.svg", placeholder: "Contoh: 1370012345678" },
  { name: "BRI", logo: "/bank-logos/bri.svg", placeholder: "Contoh: 001201000123456" },
  { name: "BNI", logo: "/bank-logos/bni.svg", placeholder: "Contoh: 0123456789" },
  { name: "GoPay", logo: "/bank-logos/gopay.svg", placeholder: "Contoh: 081234567890" },
  { name: "OVO", logo: "/bank-logos/ovo.svg", placeholder: "Contoh: 081234567890" },
  { name: "Dana", logo: "/bank-logos/dana.svg", placeholder: "Contoh: 081234567890" },
];

interface AddBankFormProps {
  userId: string;
}

export default function AddBankForm({ userId }: AddBankFormProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState("BCA");
  const [newBankAccount, setNewBankAccount] = useState("");
  const [newBankOwner, setNewBankOwner] = useState("");
  const [newQrisUrl, setNewQrisUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddBank = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newBankOwner.trim()) {
      toast.error("Nama pemilik rekeningnya jangan dikosongin ya, Bos!");
      return;
    }

    const isQris = selectedTemplate === "QRIS";
    const accountVal = isQris ? newQrisUrl : newBankAccount;
    if (!accountVal.trim()) {
      toast.error(isQris ? "Link QRIS-nya jangan dikosongin ya!" : "Nomor rekening atau nomor HP jangan dikosongin ya!");
      return;
    }

    setLoading(true);
    try {
      const res = await addUserBank(userId, {
        bankName: selectedTemplate,
        bankAccount: accountVal,
        bankOwner: newBankOwner.trim(),
        imageUrl: isQris ? newQrisUrl : `/bank-logos/${selectedTemplate.toLowerCase().replace(/\s+/g, "")}.svg`,
      });

      if (res.success) {
        toast.success("Rekening baru lo berhasil disimpen!");
        router.push("/profile");
      } else {
        toast.error(res.error || "Gagal nyimpen rekening nih, coba lagi ya!");
      }
    } catch (err) {
      console.log(err);
      toast.error("Gagal nyimpen rekening nih, coba lagi ya!");
    } finally {
      setLoading(false);
    }
  };

  const template = BANK_TEMPLATES.find((t) => t.name === selectedTemplate);

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center gap-3">
        <Button
          href="/profile"
          color="secondary"
          aria-label="Kembali ke profil"
          className="min-w-11 min-h-11 p-2 rounded-lg border border-text-700 text-text-100 hover:bg-secondary-800 active:scale-95 transition-all flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-sm font-extrabold text-text-50">Tambah Rekening Baru</h1>
          <p className="text-2xs text-text-300 mt-0.5">Daftarkan bank atau e-wallet lo</p>
        </div>
      </header>

      {/* Form Body */}
      <div className="p-4 flex-1 overflow-y-auto">
        <form onSubmit={handleAddBank} className="p-4 rounded-xl border border-secondary-800 bg-text-900/60 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-100">Pilih Tipe Bank / E-Wallet</label>
            <div className="grid grid-cols-4 gap-2">
              {BANK_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedTemplate(t.name)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedTemplate === t.name
                      ? "bg-primary-900/40 border-primary-500"
                      : "bg-text-950 border-text-800 hover:bg-text-900"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.logo} alt={t.name} className="w-8 h-8 object-contain" />
                  <span className="text-3xs font-bold text-text-100">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedTemplate === "QRIS" ? (
            <Input
              label="URL Gambar QRIS"
              isRequired
              type="text"
              value={newQrisUrl}
              onChange={setNewQrisUrl}
              placeholder="https://link-gambar-qris.com/qris.jpg"
              size="sm"
            />
          ) : (
            <Input
              label="Nomor Rekening / No. HP"
              isRequired
              type="text"
              value={newBankAccount}
              onChange={setNewBankAccount}
              placeholder={template?.placeholder}
              size="sm"
            />
          )}

          <Input
            label="Nama Pemilik Rekening"
            isRequired
            type="text"
            value={newBankOwner}
            onChange={setNewBankOwner}
            placeholder="Contoh: Muhammad Ucup"
            size="sm"
          />

          <Button
            type="submit"
            isDisabled={loading}
            isLoading={loading}
            iconLeading={<Plus />}
            className="w-full min-h-12 py-3.5 px-4 text-sm font-bold rounded-lg active:scale-[0.96] transition-transform"
            color='primary'
          >
            Tambah Rekening
          </Button>
        </form>
      </div>
    </div>
  );
}
