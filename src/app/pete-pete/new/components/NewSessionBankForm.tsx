"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { CreditCard01, Edit02, CheckCircle, User01, Link01, Coins01, Check, ChevronRight } from "@untitledui/icons";
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
  isLoggedIn?: boolean;
  formSubmitted?: boolean;
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
  isLoggedIn = false,
  formSubmitted = false,
}: NewSessionBankFormProps) {
  const currentTemplate = BANK_TEMPLATES.find(
    (t) => t.name === selectedTemplate || (t.name === "Mandiri" && selectedTemplate === "Bank Mandiri")
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftShadow(scrollLeft > 4);
    setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 180, behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

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

        {/* Check Button: Tidak Memilih / Tanpa Rekening */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setSelectedTemplate(selectedTemplate === "none" ? "BCA" : "none");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedTemplate(selectedTemplate === "none" ? "BCA" : "none");
            }
          }}
          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] select-none ${
            selectedTemplate === "none"
              ? "bg-primary-950/40 border-primary-400/70 ring-1 ring-primary-400/30"
              : "bg-secondary-900/30 border-secondary-800/80 hover:border-secondary-700"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                selectedTemplate === "none"
                  ? "bg-primary-500 border-primary-500 text-white"
                  : "bg-secondary-950/80 border-secondary-700"
              }`}
            >
              {selectedTemplate === "none" && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-50">Tidak Memilih / Tanpa Rekening</p>
              <p className="text-2xs text-text-400 truncate">Lewati info rekening</p>
            </div>
          </div>
        </div>

        {selectedTemplate === "none" ? (
          <div className="p-3.5 rounded-xl bg-secondary-900/30 border border-secondary-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary-800/40 text-text-300 shrink-0">
              <Coins01 className="w-5 h-5 text-primary-400" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs font-semibold text-text-100">
                Sesi Pete-Pete Tanpa Info Rekening
              </p>
              <p className="text-2xs text-text-400 leading-relaxed">
                Rincian tagihan tetep dibikin rapi tanpa rekening. Temen lo bisa langsung bayar tunai (cash) atau transfer manual nanti.
              </p>
            </div>
          </div>
        ) : (
          <>
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
            ) : isLoggedIn ? (
              <p className="text-2xs text-text-400 bg-secondary-900/40 border border-secondary-800/60 rounded-xl p-3">
                Lo belum punya rekening tersimpan di profil. Langsung isi detail rekening di bawah ini ya:
              </p>
            ) : (
              <p className="text-2xs text-text-400 bg-secondary-900/40 border border-secondary-800/60 rounded-xl p-3">
                Lo lagi bikin pete-petean tanpa login (guest). Langsung isi detail rekening tujuan transfer di bawah ini ya:
              </p>
            )}

            {/* Input Manual Rekening Baru */}
            {(!useProfileBank || selectedBankId === "custom") && (
              <div className="space-y-4 pt-1 border-t border-secondary-800/60">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-100 block">
                      Pilih Tipe Bank / E-Wallet
                    </label>
                    <button
                      type="button"
                      onClick={scrollRight}
                      aria-label="Geser opsi bank ke kanan"
                      className="text-3xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors select-none group cursor-pointer active:scale-95"
                      title="Geser opsi bank ke kanan"
                    >
                      <span>Geser untuk opsi lain</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform stroke-[2.5px]" />
                    </button>
                  </div>

                  <div className="relative -mx-1">
                    {/* Shadow / Fade Kiri */}
                    <div
                      className={`absolute left-0 top-0 bottom-2 w-8 sm:w-10 bg-linear-to-r from-secondary-950 via-secondary-950/80 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                        showLeftShadow ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    {/* Horizontal Scroll List */}
                    <div
                      ref={scrollRef}
                      onScroll={checkScroll}
                      className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1 scrollbar-hide px-2 snap-x touch-pan-x"
                    >
                      {BANK_TEMPLATES.map((t) => {
                        const isSelected =
                          selectedTemplate === t.name ||
                          (t.name === "Mandiri" && selectedTemplate === "Bank Mandiri");
                        return (
                          <button
                            key={t.name}
                            type="button"
                            onClick={() => setSelectedTemplate(t.name)}
                            className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer snap-start shrink-0 min-w-22 w-22 sm:min-w-24 sm:w-24 active:scale-95 select-none relative ${
                              isSelected
                                ? "bg-primary-950/70 border-primary-400 text-primary-300 ring-2 ring-primary-400/40 shadow-md shadow-primary-950/40 -translate-y-0.5"
                                : "bg-secondary-900/40 border-secondary-800/80 text-text-300 hover:border-secondary-700 hover:bg-secondary-900/70 hover:text-text-100 shadow-xs"
                            }`}
                          >
                            {/* Logo Container Lebih Besar */}
                            <div
                              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center p-2 transition-colors ${
                                isSelected ? "bg-white/10" : "bg-secondary-950/60"
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={t.logo} alt={t.name} className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
                            </div>
                            <span
                              className={`text-xs font-bold leading-tight text-center truncate w-full ${
                                isSelected ? "text-primary-300" : "text-text-200"
                              }`}
                            >
                              {t.name}
                            </span>
                            {isSelected && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-500 border-2 border-secondary-950 flex items-center justify-center shadow-xs">
                                <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Shadow / Fade Kanan */}
                    <div
                      className={`absolute right-0 top-0 bottom-2 w-8 sm:w-10 bg-linear-to-l from-secondary-950 via-secondary-950/80 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                        showRightShadow ? "opacity-100" : "opacity-0"
                      }`}
                    />
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
                      isInvalid={formSubmitted && !qrisUrl.trim()}
                      hint={formSubmitted && !qrisUrl.trim() ? "Wajib diisi ya, Bos!" : undefined}
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
                      isInvalid={formSubmitted && !bankAccount.trim()}
                      hint={formSubmitted && !bankAccount.trim() ? "Wajib diisi ya, Bos!" : undefined}
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
                    isInvalid={formSubmitted && !bankOwner.trim()}
                    hint={formSubmitted && !bankOwner.trim() ? "Wajib diisi ya, Bos!" : undefined}
                    placeholder="Contoh: Usop"
                    size="sm"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
