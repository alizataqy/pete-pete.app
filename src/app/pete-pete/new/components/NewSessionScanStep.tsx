"use client";

import React from "react";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { UploadCloud01, Plus, Trash01 } from "@untitledui/icons";
import { ScanResult, formatRupiah, parseRupiah } from "../types";

interface NewSessionScanStepProps {
  scanResult: ScanResult | null;
  file: File | null;
  filePreview: string | null;
  isDragOver: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  handleRemoveScanItem: (idx: number) => void;
  showScanItemForm: boolean;
  setShowScanItemForm: (val: boolean) => void;
  draftItemName: string;
  setDraftItemName: (val: string) => void;
  draftItemAmount: string;
  setDraftItemAmount: (val: string) => void;
  draftItemPrice: string;
  setDraftItemPrice: (val: string) => void;
  draftItemQty: string;
  setDraftItemQty: (val: string) => void;
  draftPriceMode: "unit" | "total";
  setDraftPriceMode: (val: "unit" | "total") => void;
  handleAddScanDraftItem: () => void;
}

export default function NewSessionScanStep({
  scanResult,
  file,
  filePreview,
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
  onClearFile,
  handleRemoveScanItem,
  showScanItemForm,
  setShowScanItemForm,
  draftItemName,
  setDraftItemName,
  draftItemAmount,
  setDraftItemAmount,
  draftItemPrice,
  setDraftItemPrice,
  draftItemQty,
  setDraftItemQty,
  draftPriceMode,
  setDraftPriceMode,
  handleAddScanDraftItem,
}: NewSessionScanStepProps) {
  return (
    <>
      {scanResult?.isMock && (
        <div className="p-3.5 bg-primary-950 border border-secondary-800 rounded-xl text-xs text-text-300">
          Mode Demo — set GEMINI_API_KEY di <code className="text-text-50">.env</code> buat OCR beneran.
        </div>
      )}

      {/* Step 1: Upload File */}
      {!scanResult && (
        <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-primary-400/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">
                1
              </span>
              Pilih Foto Struk
            </h2>
            {file && (
              <Button onPress={onClearFile} color="link-gray" className="text-xs font-semibold text-secondary-200">
                Hapus Foto
              </Button>
            )}
          </div>

          {!filePreview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.99] group ${
                isDragOver
                  ? "border-primary-400 bg-primary-950/40"
                  : "border-secondary-700/80 bg-secondary-900/30 hover:border-primary-400/60 hover:bg-secondary-900/60"
              }`}
            >
              <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="w-14 h-14 rounded-xl bg-primary-400/10 border border-primary-400/20 text-primary-400 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-primary-400/20 transition-all shadow-xs">
                <UploadCloud01 className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-text-50 mb-1">Upload foto struk lo</p>
              <p className="text-xs text-text-300">Sentuh untuk buka kamera / galeri</p>
              <span className="text-2xs text-text-400 mt-2 bg-secondary-900/80 border border-secondary-800 px-2.5 py-1 rounded-full">
                Format: JPG, PNG, WebP (maks. 10MB)
              </span>
            </div>
          ) : (
            <div className="relative aspect-3/2 w-full rounded-2xl overflow-hidden bg-secondary-950/60 border border-secondary-800 p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={filePreview} alt="Struk" className="w-full h-full object-contain rounded-xl" />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Scan Result Preview */}
      {scanResult && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider">
                Menu yang ketauan
              </h2>
              <p className="text-2xs text-text-400">
                Ada struk kedua atau menu kurang? Tambahin langsung di bawah ya!
              </p>
            </div>
            <Badge color="gray" size="sm" type="pill-color" className="inline-flex font-semibold">
              {scanResult.items.length} Menu
            </Badge>
          </div>

          <div className="space-y-2">
            {scanResult.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-secondary-900/40 border border-secondary-800/80 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-bold text-text-50 block wrap-break-word">
                    {item.name}
                  </span>
                  <span className="text-xs text-text-300">
                    {item.quantity}x &bull; Rp {Number(item.unitPrice).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs sm:text-sm font-extrabold text-text-50">
                    Rp {Number(item.totalPrice).toLocaleString("id-ID")}
                  </span>
                  <Button
                    size="xs"
                    color="tertiary-destructive"
                    onPress={() => handleRemoveScanItem(idx)}
                    aria-label={`Hapus ${item.name}`}
                    iconLeading={Trash01}
                    className="p-1.5"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tambah Menu Manual / Struk Kedua */}
          {!showScanItemForm ? (
            <Button
              type="button"
              onPress={() => setShowScanItemForm(true)}
              iconLeading={<Plus className="w-4 h-4" />}
              color="secondary"
              className="w-full min-h-11 py-2.5 rounded-xl border border-dashed border-secondary-700 hover:border-primary-400/60 text-xs font-bold transition-all text-text-200"
            >
              Tambah Menu Lain / Struk Kedua
            </Button>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl border border-primary-400/30 bg-primary-950/20 space-y-4 shadow-sm">
              <h4 className="text-2xs font-bold text-text uppercase tracking-wider">
                Tambah Menu Tambahan
              </h4>
              <div className="space-y-1.5">
                <label className="text-3xs font-extrabold text-primary-400 uppercase tracking-wider block">
                  Nama Menu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Menu (misal: Nasi Goreng)"
                  aria-label="Nama menu tambahan"
                  value={draftItemName}
                  onChange={(e) => setDraftItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
                />
              </div>

              {/* 3 Kolom Sejajar: JUMLAH (QTY) | TIPE HARGA | HARGA TOTAL / SATUAN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="space-y-1.5">
                  <label className="text-3xs font-extrabold text-primary-400 uppercase tracking-wider block">
                    JUMLAH (QTY)
                  </label>
                  <input
                    type="text"
                    required
                    aria-label="Jumlah porsi menu tambahan"
                    value={draftItemQty}
                    onChange={(e) => {
                      const q = e.target.value;
                      setDraftItemQty(q);
                      const qtyNum = parseFloat(q) || 0;
                      if (draftPriceMode === "unit" && draftItemPrice) {
                        setDraftItemAmount(String(qtyNum * Number(draftItemPrice)));
                      } else if (draftPriceMode === "total" && draftItemAmount && qtyNum > 0) {
                        setDraftItemPrice(String(Math.round(Number(draftItemAmount) / qtyNum)));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-3xs font-extrabold text-primary-400 uppercase tracking-wider block">
                    TIPE HARGA
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-secondary-950/80 p-1 rounded-xl border border-secondary-800/60 h-9 items-center">
                    <Button
                      type="button"
                      onPress={() => setDraftPriceMode("unit")}
                      color={draftPriceMode === "unit" ? "primary" : "tertiary"}
                      size="xs"
                      className="h-full text-2xs font-bold rounded-lg"
                    >
                      Satuan
                    </Button>
                    <Button
                      type="button"
                      onPress={() => setDraftPriceMode("total")}
                      color={draftPriceMode === "total" ? "primary" : "tertiary"}
                      size="xs"
                      className="h-full text-2xs font-bold rounded-lg"
                    >
                      Total
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-3xs font-extrabold text-primary-400 uppercase tracking-wider block">
                    {draftPriceMode === "unit" ? "HARGA SATUAN" : "HARGA TOTAL"}
                  </label>
                  {draftPriceMode === "unit" ? (
                    <input
                      type="text"
                      required
                      aria-label="Harga satuan menu tambahan"
                      value={formatRupiah(draftItemPrice)}
                      onChange={(e) => {
                        const p = parseRupiah(e.target.value);
                        setDraftItemPrice(p);
                        const q = parseFloat(draftItemQty) || 1;
                        setDraftItemAmount(p ? String(q * Number(p)) : "");
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
                      placeholder="Rp Satuan"
                    />
                  ) : (
                    <input
                      type="text"
                      required
                      aria-label="Harga total menu tambahan"
                      value={formatRupiah(draftItemAmount)}
                      onChange={(e) => {
                        const a = parseRupiah(e.target.value);
                        setDraftItemAmount(a);
                        const q = parseFloat(draftItemQty) || 1;
                        setDraftItemPrice(a && q > 0 ? String(Math.round(Number(a) / q)) : "");
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
                      placeholder="Rp Total"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  onPress={() => setShowScanItemForm(false)}
                  color="secondary"
                  size="sm"
                  className="text-sm"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onPress={handleAddScanDraftItem}
                  color="primary"
                  size="sm"
                  className="text-sm"
                >
                  Simpan
                </Button>
              </div>
            </div>
          )}

          <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 space-y-2.5 text-xs text-text-300">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="text-text-50 font-semibold">
                Rp {scanResult.items.reduce((acc, i) => acc + i.totalPrice, 0).toLocaleString("id-ID")}
              </span>
            </div>
            {scanResult.taxAmount > 0 && (
              <div className="flex justify-between items-center">
                <span>Pajak (PPN)</span>
                <span className="text-text-50 font-semibold">
                  Rp {Number(scanResult.taxAmount).toLocaleString("id-ID")}
                </span>
              </div>
            )}
            {scanResult.tipAmount > 0 && (
              <div className="flex justify-between items-center">
                <span>Service Charge / Tip</span>
                <span className="text-text-50 font-semibold">
                  Rp {Number(scanResult.tipAmount).toLocaleString("id-ID")}
                </span>
              </div>
            )}
            {Number(scanResult.discountAmount || 0) > 0 && (
              <div className="flex justify-between items-center text-emerald-400 font-semibold">
                <span>Diskon / Promo</span>
                <span>- Rp {Number(scanResult.discountAmount).toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm sm:text-base font-extrabold text-text-50 pt-2.5 border-t border-secondary-800">
              <span>Total Tagihan</span>
              <span className="text-primary-400">
                Rp {Number(scanResult.totalAmount).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
