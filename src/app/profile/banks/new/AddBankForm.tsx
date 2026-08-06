"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { addUserBank } from "@/app/actions/profile";
import { ArrowLeft, Plus } from "@untitledui/icons";
import { toast } from "sonner";

// Gambar SVG / Logo Bank Mandiri, BCA, BRI, BNI, GoPay, OVO, Dana, QRIS
const BANK_TEMPLATES = [
  { name: "BCA", logo: "/bank-logos/bca.svg", placeholder: "Contoh: 1234567890" },
  { name: "Bank Mandiri", logo: "/bank-logos/mandiri.svg", placeholder: "Contoh: 1370012345678" },
  { name: "BRI", logo: "/bank-logos/bri.svg", placeholder: "Contoh: 001201000123456" },
  { name: "BNI", logo: "/bank-logos/bni.svg", placeholder: "Contoh: 0123456789" },
  { name: "GoPay", logo: "/bank-logos/gopay.svg", placeholder: "Contoh: 081234567890" },
  { name: "OVO", logo: "/bank-logos/ovo.svg", placeholder: "Contoh: 081234567890" },
  { name: "Dana", logo: "/bank-logos/dana.svg", placeholder: "Contoh: 081234567890" },
  { name: "QRIS", logo: "/bank-logos/qris.svg", placeholder: "Paste URL gambar QRIS lo di sini" },
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

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankOwner.trim()) {
      toast.error("Nama pemilik rekening harus diisi!");
      return;
    }

    const isQris = selectedTemplate === "QRIS";
    const accountVal = isQris ? newQrisUrl : newBankAccount;
    if (!accountVal.trim()) {
      toast.error(isQris ? "Link QRIS harus diisi!" : "Nomor rekening harus diisi!");
      return;
    }

    setLoading(true);
    try {
      const res = await addUserBank(userId, {
        bankName: selectedTemplate,
        bankAccount: accountVal,
        bankOwner: newBankOwner,
        imageUrl: isQris ? newQrisUrl : `/bank-logos/${selectedTemplate.toLowerCase().replace(/\s+/g, "")}.svg`,
      });

      if (res.success) {
        toast.success("Rekening berhasil ditambahkan!");
        router.push("/profile");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menambahkan rekening.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Gagal menyimpan rekening.");
    } finally {
      setLoading(false);
    }
  };

  const template = BANK_TEMPLATES.find((t) => t.name === selectedTemplate);

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-lilac-ash-950/90 backdrop-blur-md border-b border-lilac-ash-800 px-4 py-4 flex items-center gap-3">
        <Link 
          href="/profile" 
          className="p-2 rounded-lg border border-jet-black-700 text-jet-black-100 hover:bg-lilac-ash-800 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-sm font-extrabold text-jet-black-50">Tambah Rekening Baru</h1>
          <p className="text-[10px] text-jet-black-300 mt-0.5">Daftarkan bank, e-wallet, atau QRIS lo</p>
        </div>
      </header>

      {/* Form Body */}
      <div className="p-4 flex-1 overflow-y-auto">
        <form onSubmit={handleAddBank} className="p-4 rounded-xl border border-lilac-ash-800 bg-jet-black-900/60 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-jet-black-100">Pilih Tipe Bank / E-Wallet</label>
            <div className="grid grid-cols-4 gap-2">
              {BANK_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedTemplate(t.name)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedTemplate === t.name
                      ? "bg-alice-blue-900/40 border-alice-blue-500"
                      : "bg-jet-black-950 border-jet-black-800 hover:bg-jet-black-900"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.logo} alt={t.name} className="w-8 h-8 object-contain" />
                  <span className="text-[9px] font-bold text-jet-black-100">{t.name}</span>
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
            className="w-full py-3 rounded-lg bg-alice-blue-600 hover:bg-alice-blue-700 text-white text-xs font-semibold mt-2"
          >
            Tambah Rekening
          </Button>
        </form>
      </div>
    </div>
  );
}
