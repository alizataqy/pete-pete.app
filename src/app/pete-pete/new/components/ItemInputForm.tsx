"use client";

import React from "react";
import { Button } from "@/components/base/buttons/button";
import { Plus } from "@untitledui/icons";
import { formatRupiah, parseRupiah } from "../types";

interface ItemInputFormProps {
  name: string;
  setName: (val: string) => void;
  qty: string;
  onQtyChange: (val: string) => void;
  priceMode: "unit" | "total";
  setPriceMode: (val: "unit" | "total") => void;
  price: string;
  onPriceChange: (val: string) => void;
  amount: string;
  onAmountChange: (val: string) => void;
  onAdd: () => void;
  buttonLabel?: string;
  cancelLabel?: string;
  title?: string;
  onCancel?: () => void;
  className?: string;
}

export default function ItemInputForm({
  name,
  setName,
  qty,
  onQtyChange,
  priceMode,
  setPriceMode,
  price,
  onPriceChange,
  amount,
  onAmountChange,
  onAdd,
  buttonLabel = "Simpan Menu",
  cancelLabel = "Batal",
  title,
  onCancel,
  className = "space-y-3.5",
}: ItemInputFormProps) {
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onAdd();
  };

  return (
    <div className={className}>
      {/* Optional Card Title */}
      {title && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-text-100">
            {title}
          </span>
        </div>
      )}

      {/* Nama Menu */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-text-100 block">
          Nama Menu / Item
        </label>
        <input
          type="text"
          required
          aria-label="Nama Menu / Item"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="w-full min-h-11 px-3.5 py-2.5 rounded-xl bg-secondary-900/60 border border-secondary-700/80 text-xs sm:text-sm text-text-50 placeholder-text-500 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all shadow-2xs"
          placeholder="Contoh: Nasi Goreng Special, Es Teh"
        />
      </div>

      {/* Porsi, Tipe Harga, & Input Harga */}
      <div className="flex items-end gap-2 sm:gap-2.5">
        {/* Porsi / Qty */}
        <div className="w-14 sm:w-16 shrink-0 space-y-1.5">
          <div className="h-5 flex items-center justify-center">
            <label className="text-2xs sm:text-xs font-bold text-text-100 block text-center truncate">
              Porsi
            </label>
          </div>
          <input
            type="number"
            aria-label="Porsi atau Jumlah"
            min={1}
            inputMode="numeric"
            value={qty}
            onChange={(e) => onQtyChange(e.target.value)}
            className="w-full min-h-11 h-11 px-2 rounded-xl bg-secondary-900/60 border border-secondary-700/80 text-xs sm:text-sm text-text-50 font-bold outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all text-center shadow-2xs tabular-nums"
          />
        </div>

        {/* Tipe Harga */}
        <div className="w-28 sm:w-32 shrink-0 space-y-1.5">
          <div className="h-5 flex items-center justify-center">
            <label className="text-2xs sm:text-xs font-bold text-text-100 block text-center truncate">
              Tipe Harga
            </label>
          </div>
          <div className="grid grid-cols-2 gap-1 bg-secondary-900/90 p-1 rounded-xl border border-secondary-700/80 min-h-11 h-11 items-center shadow-2xs">
            <Button
              type="button"
              onPress={() => setPriceMode("unit")}
              color={priceMode === "unit" ? "primary" : "tertiary"}
              size="sm"
              className={`h-full px-1 text-3xs sm:text-xs font-bold rounded-lg transition-all ${
                priceMode === "unit" ? "" : "text-text-400 hover:text-text-200"
              }`}
            >
              Satuan
            </Button>
            <Button
              type="button"
              onPress={() => setPriceMode("total")}
              color={priceMode === "total" ? "primary" : "tertiary"}
              size="sm"
              className={`h-full px-1 text-3xs sm:text-xs font-bold rounded-lg transition-all ${
                priceMode === "total" ? "" : "text-text-400 hover:text-text-200"
              }`}
            >
              Total
            </Button>
          </div>
        </div>

        {/* Input Harga */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-5 flex items-center">
            <label className="text-2xs sm:text-xs font-bold text-text-100 block truncate">
              {priceMode === "unit" ? "Harga Satuan" : "Harga Total"}
            </label>
          </div>
          <input
            type="text"
            inputMode="numeric"
            aria-label={priceMode === "unit" ? "Harga Satuan" : "Harga Total"}
            value={
              priceMode === "unit" ? formatRupiah(price) : formatRupiah(amount)
            }
            onChange={(e) => {
              const raw = parseRupiah(e.target.value);
              if (priceMode === "unit") {
                onPriceChange(raw);
              } else {
                onAmountChange(raw);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={priceMode === "unit" ? "Rp Satuan" : "Rp Total"}
            className="w-full min-h-11 h-11 px-3.5 py-2.5 rounded-xl bg-secondary-900/60 border border-secondary-700/80 text-xs sm:text-sm text-text-50 placeholder-text-500 font-semibold outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all shadow-2xs tabular-nums"
          />
        </div>
      </div>

      {/* Action Buttons */}
      {onCancel ? (
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <Button
            type="button"
            onPress={onCancel}
            color="secondary"
            size="sm"
            className="min-h-10 px-4 rounded-xl font-bold text-xs active:scale-[0.98] transition-all"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onPress={() => handleSubmit()}
            color="primary"
            size="sm"
            className="min-h-10 px-5 rounded-xl font-bold text-xs active:scale-[0.98] transition-all shadow-xs"
          >
            {buttonLabel}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          onPress={() => handleSubmit()}
          color="primary"
          iconLeading={Plus}
          className="w-full min-h-11 py-2.5 rounded-xl font-bold text-xs active:scale-[0.98] transition-all shadow-xs"
        >
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
