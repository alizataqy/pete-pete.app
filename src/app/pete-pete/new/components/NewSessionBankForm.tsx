"use client";

import React from "react";
import { CreditCard01, Edit02, CheckCircle, User01, Link01 } from "@untitledui/icons";
import { UserBankData } from "@/app/actions/profile";
import { BANK_TEMPLATES } from "../types";
import { Input } from "@/components/base/input/input";

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
  const currentTemplate = BANK_TEMPLATES.find((t) => t.name === selectedTemplate);

  return (
    <div className="space-y-4">
      {/* Detail Sesi Pete-Pete */}
      <div id="tour-session-details" className="bg-secondary-950/40 border border-secondary-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary-400/10 border border-primary-400/20 text-primary-400 shrink-0">
            <Edit02 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-text-50 uppercase tracking-wider">
              Detail Pete-Pete
            </h2>
            <p className="text-2xs text-text-400">Kasih nama dan catatan buat acara patungan lo</p>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="Judul Pete-Pete"
            isRequired
            value={title}
            onChange={setTitle}
            placeholder="Contoh: Makan Siang di Gacoan bareng Tim"
            size="sm"
          />

          <Input
            label="Deskripsi / Catatan Tambahan (Opsional)"
            value={description}
            onChange={setDescription}
            placeholder="Contoh: Belum termasuk ongkir gofood ya guys"
            size="sm"
          />
        </div>
      </div>

      {/* Info Rekening Pembayaran */}
      <div id="tour-bank-account" className="bg-secondary-950/40 border border-secondary-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary-400/10 border border-primary-400/20 text-primary-400 shrink-0">
            <CreditCard01 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-text-50 uppercase tracking-wider">
              Rekening Buat Temen Transfer
            </h2>
            <p className="text-2xs text-text-400">Temen-temen lo bakal transfer ke rekening/e-wallet ini</p>
          </div>
        </div>

        {profileBanks.length > 0 ? (
          <div className="space-y-3">
            {/* Toggle Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                const nextVal = !useProfileBank;
                setUseProfileBank(nextVal);
                if (nextVal && profileBanks.length > 0) {
                  setSelectedBankId(profileBanks[0].id || "custom");
                } else {
                  setSelectedBankId("custom");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const nextVal = !useProfileBank;
                  setUseProfileBank(nextVal);
                  if (nextVal && profileBanks.length > 0) {
                    setSelectedBankId(profileBanks[0].id || "custom");
                  } else {
                    setSelectedBankId("custom");
                  }
                }
              }}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] select-none ${
                useProfileBank
                  ? "bg-primary-950/40 border-primary-400/70 ring-1 ring-primary-400/30"
                  : "bg-secondary-900/30 border-secondary-800/80 hover:border-secondary-700"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    useProfileBank
                      ? "bg-primary-500 border-primary-500 text-white"
                      : "bg-secondary-950/80 border-secondary-700"
                  }`}
                >
                  {useProfileBank && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-50">Pilih dari Rekening Profil Tersimpan</p>
                  <p className="text-2xs text-text-400 truncate">Pake rekening yang udah lo simpen sebelumnya</p>
                </div>
              </div>
            </div>

            {/* List of Saved Banks */}
            {useProfileBank && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-1 gap-2">
                  {profileBanks.map((b) => {
                    const isSelected = selectedBankId === b.id;
                    return (
                      <label
                        key={b.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                          isSelected
                            ? "bg-primary-950/50 border-primary-400 ring-2 ring-primary-400/25 text-text-50"
                            : "bg-secondary-900/30 border-secondary-800/80 hover:border-secondary-700 text-text-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="radio"
                            name="profileBankSelect"
                            checked={isSelected}
                            onChange={() => b.id && setSelectedBankId(b.id)}
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "border-primary-400 bg-primary-400"
                                : "border-secondary-700 bg-secondary-950"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          {b.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={b.imageUrl}
                              alt={b.bankName}
                              className="w-7 h-7 object-contain rounded shrink-0 bg-white/5 p-0.5"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-secondary-900 border border-secondary-800 flex items-center justify-center shrink-0 font-bold text-3xs text-primary-400">
                              {b.bankName.slice(0, 3)}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-text-50 text-xs truncate">{b.bankName}</p>
                            <p className="text-2xs text-text-400 truncate mt-0.5">
                              {b.bankName === "QRIS" ? "Gambar QRIS" : b.bankAccount}{" "}
                              <span className="text-text-500">•</span> A/N {b.bankOwner}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-2xs text-text-400 bg-secondary-900/40 border border-secondary-800/60 rounded-xl p-3">
            Lo belum punya rekening tersimpan di profil. Langsung isi detail rekening di bawah ini ya:
          </p>
        )}

        {/* Input Manual Rekening Baru */}
        {(!useProfileBank || selectedBankId === "custom") && (
          <div className="space-y-4 pt-1 border-t border-secondary-800/60">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-100 block">
                Pilih Tipe Bank / E-Wallet
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {BANK_TEMPLATES.map((t) => {
                  const isSelected = selectedTemplate === t.name;
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSelectedTemplate(t.name)}
                      className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer min-h-16 ${
                        isSelected
                          ? "bg-primary-950/60 border-primary-400 text-primary-300 ring-2 ring-primary-400/30 shadow-sm"
                          : "bg-secondary-900/30 border-secondary-800/80 hover:border-secondary-700 text-text-300 hover:bg-secondary-900/50"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.logo} alt={t.name} className="w-6 h-6 object-contain" />
                      <span className="text-3xs font-bold leading-tight line-clamp-1">
                        {t.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {selectedTemplate === "QRIS" ? (
                <Input
                  label="URL Gambar QRIS"
                  isRequired
                  icon={Link01}
                  value={qrisUrl}
                  onChange={setQrisUrl}
                  placeholder="https://link-gambar-qris.com/qris.jpg"
                  size="sm"
                />
              ) : (
                <Input
                  label="Nomor Rekening / No. HP"
                  isRequired
                  icon={CreditCard01}
                  value={bankAccount}
                  onChange={setBankAccount}
                  placeholder={currentTemplate?.placeholder || "Masukkan nomor rekening"}
                  size="sm"
                />
              )}

              <Input
                label="Nama Pemilik Rekening"
                isRequired
                icon={User01}
                value={bankOwner}
                onChange={setBankOwner}
                placeholder="Contoh: Usop"
                size="sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
