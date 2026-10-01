"use client";

import React from "react";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import { Plus, Trash01, XClose } from "@untitledui/icons";
import { ScanItem, formatRupiah, parseRupiah } from "../types";

interface NewSessionManualStepsProps {
  wizardStep: number;
  draftItemName: string;
  setDraftItemName: (val: string) => void;
  draftItemQty: string;
  handleDraftItemQtyChange: (val: string) => void;
  addPriceMode: "unit" | "total";
  setAddPriceMode: (val: "unit" | "total") => void;
  draftItemPrice: string;
  handleDraftItemPriceChange: (val: string) => void;
  draftItemAmount: string;
  handleDraftItemAmountChange: (val: string) => void;
  handleAddManualItem: () => void;
  manualItems: ScanItem[];
  setManualItems: React.Dispatch<React.SetStateAction<ScanItem[]>>;
  manualTax: number;
  setManualTax: (val: number) => void;
  manualTip: number;
  setManualTip: (val: number) => void;
  manualDiscount: number;
  setManualDiscount: (val: number) => void;
  manualSubtotal: number;
  newMemberInput: string;
  setNewMemberInput: (val: string) => void;
  handleAddMember: () => void;
  manualMembers: string[];
  setManualMembers: React.Dispatch<React.SetStateAction<string[]>>;
  currentUserName: string;
  editingManualIndex: number | null;
  setEditingManualIndex: (val: number | null) => void;
  editingManualName: string;
  setEditingManualName: (val: string) => void;
  handleSaveManualRename: (idx: number) => void;
  manualItemAllocations: Record<number, Record<string, number>>;
  setManualItemAllocations: React.Dispatch<
    React.SetStateAction<Record<number, Record<string, number>>>
  >;
  allPeople: string[];
  detailsForm: React.ReactNode;
}

export default function NewSessionManualSteps({
  wizardStep,
  draftItemName,
  setDraftItemName,
  draftItemQty,
  handleDraftItemQtyChange,
  addPriceMode,
  setAddPriceMode,
  draftItemPrice,
  handleDraftItemPriceChange,
  draftItemAmount,
  handleDraftItemAmountChange,
  handleAddManualItem,
  manualItems,
  setManualItems,
  manualTax,
  setManualTax,
  manualTip,
  setManualTip,
  manualDiscount,
  setManualDiscount,
  manualSubtotal,
  newMemberInput,
  setNewMemberInput,
  handleAddMember,
  manualMembers,
  setManualMembers,
  currentUserName,
  editingManualIndex,
  setEditingManualIndex,
  editingManualName,
  setEditingManualName,
  handleSaveManualRename,
  manualItemAllocations,
  setManualItemAllocations,
  allPeople,
  detailsForm,
}: NewSessionManualStepsProps) {
  return (
    <div className="space-y-4 pb-4">
      {/* Step Indicator */}
      <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary-400/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">
              {wizardStep}
            </span>
            {wizardStep === 1 && "Langkah 1: Input Daftar Menu"}
            {wizardStep === 2 && "Langkah 2: Tambah Teman Patungan"}
            {wizardStep === 3 && "Langkah 3: Bagi Porsi & Info Bayar"}
          </span>
          <span className="text-2xs font-bold text-text-400">{wizardStep}/3</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              wizardStep >= 1 ? "bg-primary-400" : "bg-secondary-800"
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all ${
              wizardStep >= 2 ? "bg-primary-400" : "bg-secondary-800"
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all ${
              wizardStep >= 3 ? "bg-primary-400" : "bg-secondary-800"
            }`}
          />
        </div>
      </div>

      {/* WIZARD STEP 1: INPUT ITEMS */}
      {wizardStep === 1 && (
        <div className="space-y-4">
          <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-primary-400/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">
                  1
                </span>
                Masukin Semua Menu Dulu
              </h2>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-100">Nama Menu / Item</label>
                <input
                  type="text"
                  aria-label="Nama Menu / Item"
                  value={draftItemName}
                  onChange={(e) => setDraftItemName(e.target.value)}
                  className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs sm:text-sm text-text-50 placeholder-text-500 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                  placeholder="Nasi Goreng, Es Teh, Tiket Bioskop..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-100">Porsi / Qty</label>
                  <input
                    type="number"
                    aria-label="Porsi atau Jumlah"
                    min={1}
                    inputMode="numeric"
                    value={draftItemQty}
                    onChange={(e) => handleDraftItemQtyChange(e.target.value)}
                    className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs sm:text-sm text-text-50 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-100">Tipe Harga</label>
                  <div className="grid grid-cols-2 gap-1 bg-secondary-900/80 p-1 rounded-lg border border-secondary-700/80 min-h-11 items-center">
                    <button
                      type="button"
                      onClick={() => setAddPriceMode("unit")}
                      className={`h-full py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        addPriceMode === "unit"
                          ? "bg-primary-400 text-white shadow-xs"
                          : "text-text-400 hover:text-text-200"
                      }`}
                    >
                      Satuan
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddPriceMode("total")}
                      className={`h-full py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        addPriceMode === "total"
                          ? "bg-primary-400 text-white shadow-xs"
                          : "text-text-400 hover:text-text-200"
                      }`}
                    >
                      Total
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-100">
                    {addPriceMode === "unit" ? "Harga Satuan" : "Harga Total"}
                  </label>
                  {addPriceMode === "unit" ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label="Harga Satuan"
                      value={formatRupiah(draftItemPrice)}
                      onChange={(e) => handleDraftItemPriceChange(parseRupiah(e.target.value))}
                      className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs sm:text-sm text-text-50 placeholder-text-500 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="Rp Satuan"
                    />
                  ) : (
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label="Harga Total"
                      value={formatRupiah(draftItemAmount)}
                      onChange={(e) => handleDraftItemAmountChange(parseRupiah(e.target.value))}
                      className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs sm:text-sm text-text-50 placeholder-text-500 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="Rp Total"
                    />
                  )}
                </div>
              </div>

              <Button
                type="button"
                onPress={handleAddManualItem}
                iconLeading={<Plus className="w-4 h-4" />}
                className="w-full min-h-11 py-2.5 rounded-lg bg-secondary-900 hover:bg-secondary-800 text-text-100 text-xs font-bold active:scale-[0.98] transition-all border border-secondary-700"
              >
                Tambah Menu Ini
              </Button>
            </div>

            {/* Pajak & Service Charge Opsional */}
            <div className="pt-3 border-t border-secondary-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold text-text-300">Pajak / PPN (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Pajak atau PPN"
                    value={formatRupiah(manualTax)}
                    onChange={(e) => setManualTax(Number(parseRupiah(e.target.value)) || 0)}
                    className="w-full min-h-10 px-3 py-2 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs text-text-50 outline-none focus:border-primary-400"
                    placeholder="Rp 0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold text-text-300">
                    Service Charge / Tip (Rp)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Service Charge atau Tip"
                    value={formatRupiah(manualTip)}
                    onChange={(e) => setManualTip(Number(parseRupiah(e.target.value)) || 0)}
                    className="w-full min-h-10 px-3 py-2 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs text-text-50 outline-none focus:border-primary-400"
                    placeholder="Rp 0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold text-emerald-400">
                    Diskon / Promo (Rp)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Diskon atau Promo"
                    value={formatRupiah(manualDiscount)}
                    onChange={(e) => setManualDiscount(Number(parseRupiah(e.target.value)) || 0)}
                    className="w-full min-h-10 px-3 py-2 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs text-emerald-400 outline-none focus:border-primary-400"
                    placeholder="Rp 0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* List Menu yang Udah Ditambahin */}
          {manualItems.length > 0 && (
            <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-text-100 uppercase tracking-wider">
                  Menu Ditambahkan ({manualItems.length})
                </h3>
              </div>
              <div className="space-y-2">
                {manualItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-secondary-900/40 border border-secondary-800/80 rounded-xl p-3 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-bold text-text-50 block wrap-break-word">
                        {item.name}
                      </span>
                      <span className="text-xs text-text-300">
                        {item.quantity}x &bull; Rp {Math.round(item.unitPrice).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs sm:text-sm font-extrabold text-text-50">
                        Rp {item.totalPrice.toLocaleString("id-ID")}
                      </span>
                      <Button
                        size="xs"
                        color="tertiary-destructive"
                        onPress={() => setManualItems((prev) => prev.filter((_, i) => i !== idx))}
                        aria-label={`Hapus ${item.name}`}
                        iconLeading={Trash01}
                        className="p-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-secondary-800 text-xs sm:text-sm font-extrabold text-text-50">
                <span>Total Sementara</span>
                <span className="text-primary-400">Rp {manualSubtotal.toLocaleString("id-ID")}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WIZARD STEP 2: INPUT MEMBERS */}
      {wizardStep === 2 && (
        <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-primary-400/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">
                2
              </span>
              Siapa Aja yang Ikut PETE-PETE?
            </h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              aria-label="Nama teman baru"
              value={newMemberInput}
              onChange={(e) => setNewMemberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
              className="flex-1 min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs sm:text-sm text-text-50 placeholder-text-500 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              placeholder="Nama temen lo (misal: Budi, Sarah)..."
            />
            <Button
              type="button"
              onPress={handleAddMember}
              size="sm"
              color="primary"
              iconLeading={<Plus className="w-4 h-4" />}
              className="min-h-11 px-4 rounded-lg font-bold text-xs active:scale-[0.96] transition-transform shrink-0"
            >
              Tambahin
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            {/* User (Owner) */}
            <div className="flex flex-col items-center gap-1.5 w-16 shrink-0">
              <div className="relative">
                <Avatar
                  alt={currentUserName}
                  size="lg"
                  className="shadow-md border border-primary-400 ring-2 ring-primary-400/40"
                />
                <span className="absolute -bottom-1 -right-1 bg-primary-400 text-white rounded-full px-1 py-0.2 text-4xs font-extrabold shadow-xs">
                  Gua
                </span>
              </div>
              <p className="text-2xs text-text font-bold wrap-break-word w-full text-center leading-tight">
                {currentUserName}
              </p>
            </div>
            {/* Added Friends */}
            {manualMembers.map((m, idx) => (
              <div key={m} className="flex flex-col items-center gap-1.5 w-16 shrink-0 relative group">
                {editingManualIndex === idx ? (
                  <div className="flex flex-col items-center gap-1 w-full">
                    <Avatar alt={m} size="lg" className="shadow-md border border-secondary-800" />
                    <input
                      type="text"
                      aria-label="Ubah nama teman"
                      value={editingManualName}
                      onChange={(e) => setEditingManualName(e.target.value)}
                      onBlur={() => handleSaveManualRename(idx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveManualRename(idx);
                        if (e.key === "Escape") setEditingManualIndex(null);
                      }}
                      autoFocus
                      className="w-full text-xs px-1.5 py-1 rounded bg-secondary-900 border border-primary-400 text-text text-center outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingManualIndex(idx);
                        setEditingManualName(m);
                      }}
                      className="focus:outline-none cursor-pointer group-hover:scale-105 transition-all"
                      title="Klik untuk ubah nama"
                      aria-label={`Ubah nama ${m}`}
                    >
                      <Avatar alt={m} size="lg" className="shadow-md border border-secondary-800" />
                    </button>
                    <p
                      onClick={() => {
                        setEditingManualIndex(idx);
                        setEditingManualName(m);
                      }}
                      className="text-2xs text-text font-semibold wrap-break-word w-full text-center leading-tight cursor-pointer hover:underline"
                      title="Klik untuk ubah nama"
                    >
                      {m}
                    </p>
                    <button
                      type="button"
                      onClick={() => setManualMembers((prev) => prev.filter((x) => x !== m))}
                      className="absolute -top-1 -right-1 bg-danger-600 hover:bg-danger-700 text-white rounded-full size-5 flex items-center justify-center text-2xs font-bold shadow-md cursor-pointer transition-all active:scale-90"
                      title="Hapus"
                      aria-label={`Hapus ${m}`}
                    >
                      <XClose className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WIZARD STEP 3: PORTION ALLOCATION & DETAILS */}
      {wizardStep === 3 && (
        <div className="space-y-4">
          <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-primary-400/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">
                  3
                </span>
                Siapa Pesen Apa Nih?
              </h2>
            </div>
            <div className="space-y-3.5">
              {manualItems.map((item, idx) => {
                const itemAlloc = manualItemAllocations[idx] || {};
                const allocatedCount = Object.values(itemAlloc).reduce((a, b) => a + b, 0);
                const isComplete = allocatedCount > 0;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-secondary-800/80 bg-secondary-900/40 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-text-50 text-xs sm:text-sm leading-snug wrap-break-word">
                          {item.name}
                        </h4>
                        <p className="text-xs text-text-300 mt-0.5">
                          Qty: {item.quantity}x &bull; Rp{" "}
                          {(item.totalPrice / item.quantity).toLocaleString("id-ID")}/porsi
                        </p>
                      </div>
                      <Badge
                        color={isComplete ? "success" : "warning"}
                        size="sm"
                        type="pill-color"
                        className="inline-flex font-semibold text-2xs shrink-0"
                      >
                        {isComplete ? `Dibagi: ${allocatedCount} porsi` : "Belum dibagi"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1">
                      {allPeople.map((person) => {
                        const qty = itemAlloc[person] || 0;
                        return (
                          <div
                            key={person}
                            className="flex flex-col items-center gap-1.5 w-14 shrink-0 relative"
                          >
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => {
                                  setManualItemAllocations((prev) => ({
                                    ...prev,
                                    [idx]: {
                                      ...prev[idx],
                                      [person]: qty + 1,
                                    },
                                  }));
                                }}
                                className="focus:outline-none transition-transform active:scale-95 cursor-pointer rounded-full min-w-11 min-h-11 flex items-center justify-center p-0.5"
                                aria-label={`Tambah porsi untuk ${person}`}
                              >
                                <Avatar
                                  alt={person}
                                  size="md"
                                  className={`shadow-md transition-all duration-200 ${
                                    qty > 0
                                      ? "ring-2 ring-primary-400/40 border-primary-400/60 scale-105"
                                      : "opacity-40"
                                  }`}
                                />
                              </button>

                              {qty > 0 && (
                                <>
                                  <span className="absolute -top-1 -right-1 bg-primary-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-2xs font-bold shadow-md border border-secondary-950 pointer-events-none">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setManualItemAllocations((prev) => ({
                                        ...prev,
                                        [idx]: {
                                          ...prev[idx],
                                          [person]: Math.max(0, qty - 1),
                                        },
                                      }));
                                    }}
                                    className="absolute -bottom-1.5 -right-1.5 bg-danger-600 hover:bg-danger-700 text-white rounded-full w-6 h-6 min-w-6 min-h-6 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer border border-secondary-950 active:scale-90"
                                    title="Kurangi porsi"
                                    aria-label={`Kurangi porsi untuk ${person}`}
                                  >
                                    -
                                  </button>
                                </>
                              )}
                            </div>
                            <p
                              className={`text-2xs text-center wrap-break-word w-full leading-tight font-semibold ${
                                qty > 0 ? "text-text font-bold" : "text-text-400"
                              }`}
                            >
                              {person}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {detailsForm}
        </div>
      )}
    </div>
  );
}
