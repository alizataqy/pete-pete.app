"use client";

import React from "react";
import { formatRupiah, parseRupiah } from "../types";

interface FeeAdjustmentsFieldsProps {
  tax: number;
  onTaxChange: (val: number) => void;
  tip: number;
  onTipChange: (val: number) => void;
  discount: number;
  onDiscountChange: (val: number) => void;
}

export default function FeeAdjustmentsFields({
  tax,
  onTaxChange,
  tip,
  onTipChange,
  discount,
  onDiscountChange,
}: FeeAdjustmentsFieldsProps) {
  return (
    <div className="space-y-3 pt-3 border-t border-secondary-800/80">
      <div className="flex items-center gap-1.5 text-text-300">
        <span className="text-2xs font-extrabold uppercase tracking-wider">
          Pajak, Service &amp; Diskon (Opsional)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pajak (PB1 / PPN) */}
        <div className="space-y-1.5">
          <div className="h-5 flex items-center">
            <label className="text-2xs font-bold text-text-300 block truncate">
              Pajak (PB1 / PPN)
            </label>
          </div>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Pajak PB1 atau PPN"
            value={formatRupiah(tax || 0)}
            onChange={(e) => onTaxChange(Number(parseRupiah(e.target.value)) || 0)}
            className="w-full min-h-10 px-3 py-2 rounded-xl bg-secondary-900/60 border border-secondary-700/70 text-xs text-text-50 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 shadow-2xs transition-all"
            placeholder="Rp 0"
          />
        </div>

        {/* Service Charge / Tip */}
        <div className="space-y-1.5">
          <div className="h-5 flex items-center">
            <label className="text-2xs font-bold text-text-300 block truncate">
              Service Charge / Tip
            </label>
          </div>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Service Charge atau Tip"
            value={formatRupiah(tip || 0)}
            onChange={(e) => onTipChange(Number(parseRupiah(e.target.value)) || 0)}
            className="w-full min-h-10 px-3 py-2 rounded-xl bg-secondary-900/60 border border-secondary-700/70 text-xs text-text-50 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 shadow-2xs transition-all"
            placeholder="Rp 0"
          />
        </div>

        {/* Diskon / Promo */}
        <div className="space-y-1.5">
          <div className="h-5 flex items-center">
            <label className="text-2xs font-bold text-text-300 block truncate">
              Diskon / Promo
            </label>
          </div>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Diskon atau Promo"
            value={formatRupiah(discount || 0)}
            onChange={(e) => onDiscountChange(Number(parseRupiah(e.target.value)) || 0)}
            className="w-full min-h-10 px-3 py-2 rounded-xl bg-secondary-900/60 border border-secondary-700/70 text-xs text-text-50 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 shadow-2xs transition-all"
            placeholder="Rp 0"
          />
        </div>
      </div>
    </div>
  );
}
