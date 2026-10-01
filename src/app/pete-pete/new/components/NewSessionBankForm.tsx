"use client";

import React from "react";
import { CreditCard01 } from "@untitledui/icons";
import { UserBankData } from "@/app/actions/profile";
import { BANK_TEMPLATES } from "../types";

interface NewSessionBankFormProps {
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  profileBanks: UserBankData[];
  useProfileBank: boolean;
  setUseProfileBank: (val: boolean) => void;
  selectedBankId: string;
  setSelectedBankId: (val: string) => void;
  selectedTemplate: string;
  setSelectedTemplate: (val: string) => void;
  bankAccount: string;
  setBankAccount: (val: string) => void;
  bankOwner: string;
  setBankOwner: (val: string) => void;
  qrisUrl: string;
  setQrisUrl: (val: string) => void;
}

export default function NewSessionBankForm({
  title,
  setTitle,
  description,
  setDescription,
  profileBanks,
  useProfileBank,
  setUseProfileBank,
  selectedBankId,
  setSelectedBankId,
  selectedTemplate,
  setSelectedTemplate,
  bankAccount,
  setBankAccount,
  bankOwner,
  setBankOwner,
  qrisUrl,
  setQrisUrl,
}: NewSessionBankFormProps) {
  return (
    <div className="space-y-4">
      {/* Detail Sesi */}
      <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
        <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider">
          Detail Pete-Pete
        </h2>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-100">Judul Pete-Pete</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
            placeholder="Contoh: Makan Siang di Gacoan bareng Tim"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-100">
            Deskripsi / Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
            placeholder="Contoh: Belum termasuk ongkir gofood ya guys"
          />
        </div>
      </div>

      {/* Info Rekening Pembayaran */}
      <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider flex items-center gap-2">
            <CreditCard01 className="w-4 h-4 text-primary-400" />
            Rekening Buat Temen Transfer
          </h2>
        </div>

        {profileBanks.length > 0 ? (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-100 cursor-pointer">
              <input
                type="checkbox"
                checked={useProfileBank}
                onChange={(e) => {
                  setUseProfileBank(e.target.checked);
                  if (e.target.checked && profileBanks.length > 0) {
                    setSelectedBankId(profileBanks[0].id || "custom");
                  } else {
                    setSelectedBankId("custom");
                  }
                }}
                className="rounded bg-secondary-950/80 border-secondary-700 text-primary-400 focus:ring-primary-400 w-4 h-4 cursor-pointer"
              />
              Pilih dari Rekening Profil Tersimpan
            </label>

            {useProfileBank && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  {profileBanks.map((b) => (
                    <label
                      key={b.id}
                      className={`p-3 rounded-xl border text-xs text-text-300 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                        selectedBankId === b.id
                          ? "bg-primary-950/40 border-primary-400 text-text-100 ring-2 ring-primary-400/20"
                          : "bg-secondary-900/40 border-secondary-800 hover:border-secondary-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="profileBankSelect"
                          checked={selectedBankId === b.id}
                          onChange={() => b.id && setSelectedBankId(b.id)}
                          className="bg-secondary-950/80 border-secondary-700 text-primary-400 focus:ring-primary-400 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <p className="font-bold text-text-50">{b.bankName}</p>
                          <p className="text-xs text-text-300 mt-0.5">
                            {b.bankName === "QRIS" ? "Gambar QRIS" : b.bankAccount} (A/N {b.bankOwner})
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-warning-400">
            * Belum ada rekening di profil. Langsung input baru aja di bawah ini:
          </p>
        )}

        {(!useProfileBank || selectedBankId === "custom") && (
          <div className="space-y-3.5 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-100">Pilih Tipe Bank / E-Wallet</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {BANK_TEMPLATES.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setSelectedTemplate(t.name)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      selectedTemplate === t.name
                        ? "bg-primary-950/60 border-primary-400 text-primary-300 ring-2 ring-primary-400/30"
                        : "bg-secondary-900/40 border-secondary-800 hover:border-secondary-700 text-text-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.logo} alt={t.name} className="w-6 h-6 object-contain" />
                    <span className="text-2xs font-bold wrap-break-word text-center">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedTemplate === "QRIS" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-100">URL Gambar QRIS</label>
                <input
                  type="text"
                  required
                  value={qrisUrl}
                  onChange={(e) => setQrisUrl(e.target.value)}
                  className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
                  placeholder="https://link-gambar-qris.com/qris.jpg"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-100">Nomor Rekening / No. HP</label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
                  placeholder={BANK_TEMPLATES.find((t) => t.name === selectedTemplate)?.placeholder}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-100">Nama Pemilik Rekening</label>
              <input
                type="text"
                required
                value={bankOwner}
                onChange={(e) => setBankOwner(e.target.value)}
                className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
                placeholder="Contoh: Muhammad Ucup"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
