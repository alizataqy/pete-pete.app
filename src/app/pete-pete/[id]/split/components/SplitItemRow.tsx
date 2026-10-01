"use client";

import React, { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import {
  Edit02,
  Trash01,
  Users01,
  Minus,
} from "@untitledui/icons";
import { Item, Member, Allocation } from "../types";

const formatRupiah = (value: number | string): string => {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value);
  const isNegative = str.startsWith("-") || (typeof value === "number" && value < 0);
  const cleaned = str.replace(/[^0-9]/g, "");
  if (!cleaned) {
    if (str === "0") return "Rp 0";
    return isNegative ? "Rp -" : "";
  }
  const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${isNegative ? "-" : ""}${formatted}`;
};

const parseRupiah = (formatted: string): string => {
  if (!formatted) return "";
  const isNegative = formatted.includes("-");
  const cleaned = formatted.replace(/[^0-9]/g, "");
  return isNegative ? `-${cleaned}` : cleaned;
};

interface SplitItemRowProps {
  item: Item;
  members: Member[];
  allocations: Allocation[];
  sessionStatus: string;
  sessionUserId?: string | null;
  loading: boolean;
  onIncreaseAllocation: (itemId: string, memberId: string) => void;
  onDecreaseAllocation: (itemId: string, memberId: string) => void;
  onSplitEqually: (itemId: string) => void;
  onClearAllocations: (itemId: string) => void;
  onUpdateItem: (itemId: string, name: string, quantity: number, unitPrice: number) => Promise<void>;
  onDeleteItemPrompt: (item: Item) => void;
}

export default function SplitItemRow({
  item,
  members,
  allocations,
  sessionStatus,
  sessionUserId,
  loading,
  onIncreaseAllocation,
  onDecreaseAllocation,
  onSplitEqually,
  onClearAllocations,
  onUpdateItem,
  onDeleteItemPrompt,
}: SplitItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQty, setEditQty] = useState(String(item.quantity));
  const [editPrice, setEditPrice] = useState(String(Math.round(item.totalPrice / (item.quantity || 1))));
  const [editTotal, setEditTotal] = useState(String(item.totalPrice));
  const [editPriceMode, setEditPriceMode] = useState<"unit" | "total">("unit");

  const startEdit = () => {
    setIsEditing(true);
    setEditName(item.name);
    setEditQty(String(item.quantity));
    setEditPrice(String(Math.round(item.totalPrice / (item.quantity || 1))));
    setEditTotal(String(item.totalPrice));
  };

  const handleQtyChange = (qty: string) => {
    setEditQty(qty);
    const q = parseFloat(qty) || 0;
    if (editPrice) {
      setEditTotal(String(q * Number(editPrice)));
    } else if (editTotal && q > 0) {
      setEditPrice(String(Math.round(Number(editTotal) / q)));
    }
  };

  const handlePriceChange = (price: string) => {
    setEditPrice(price);
    const q = parseFloat(editQty) || 0;
    if (price && q > 0) {
      setEditTotal(String(q * Number(price)));
    } else {
      setEditTotal("");
    }
  };

  const handleTotalChange = (total: string) => {
    setEditTotal(total);
    const q = parseFloat(editQty) || 0;
    if (total && q > 0) {
      setEditPrice(String(Math.round(Number(total) / q)));
    } else {
      setEditPrice("");
    }
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const qty = Number(editQty) || 1;
    const unitPrice = Number(editPrice) || 0;
    await onUpdateItem(item.id, editName.trim(), qty, unitPrice);
    setIsEditing(false);
  };

  const itemAllocations = allocations.filter((a) => a.itemId === item.id);
  const totalAllocatedCount = itemAllocations.reduce((sum, a) => sum + a.quantity, 0);
  const hasAllocations = totalAllocatedCount > 0;
  const isExact = totalAllocatedCount === item.quantity;
  const isUnder = totalAllocatedCount < item.quantity && totalAllocatedCount > 0;
  const isOver = totalAllocatedCount > item.quantity;
  const sharePerPortion =
    totalAllocatedCount > 0
      ? Math.round(Number(item.totalPrice) / totalAllocatedCount)
      : item.quantity > 0
      ? Math.round(Number(item.totalPrice) / item.quantity)
      : 0;

  return (
    <div className="p-3.5 rounded-xl bg-secondary-950/60 border border-secondary-800 space-y-3 shadow-xs hover:border-secondary-700 transition-all">
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <h4 className="text-2xs font-bold text-text uppercase tracking-wider">Ganti Menu</h4>
          <div className="space-y-2">
            <label className="text-3xs text-text-400 uppercase font-bold">Nama Menu</label>
            <input
              type="text"
              required
              aria-label="Nama menu makanan"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
            />
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-3xs text-text-400 uppercase font-bold">Jumlah (Qty)</label>
                <input
                  type="text"
                  required
                  aria-label="Ubah jumlah porsi menu"
                  value={editQty}
                  onChange={(e) => handleQtyChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
                  placeholder="Qty"
                />
              </div>
              <div className="space-y-1">
                <label className="text-3xs text-text-400 uppercase font-bold">Tipe Harga</label>
                <div className="grid grid-cols-2 gap-1 bg-secondary-950/80 p-1 rounded-xl border border-secondary-800/60 h-9 items-center">
                  <Button
                    type="button"
                    onPress={() => setEditPriceMode("unit")}
                    color={editPriceMode === "unit" ? "primary" : "tertiary"}
                    size="xs"
                    className="h-full text-2xs font-bold rounded-lg"
                  >
                    Satuan
                  </Button>
                  <Button
                    type="button"
                    onPress={() => setEditPriceMode("total")}
                    color={editPriceMode === "total" ? "primary" : "tertiary"}
                    size="xs"
                    className="h-full text-2xs font-bold rounded-lg"
                  >
                    Total
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-3xs text-text-400 uppercase font-bold">
                  {editPriceMode === "unit" ? "Harga Satuan" : "Harga Total"}
                </label>
                {editPriceMode === "unit" ? (
                  <input
                    type="text"
                    aria-label="Ubah harga satuan menu"
                    value={formatRupiah(editPrice)}
                    onChange={(e) => handlePriceChange(parseRupiah(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
                    placeholder="Rp Satuan"
                  />
                ) : (
                  <input
                    type="text"
                    aria-label="Ubah harga total menu"
                    value={formatRupiah(editTotal)}
                    onChange={(e) => handleTotalChange(parseRupiah(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
                    placeholder="Rp Total"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end text-2xs">
            <Button
              type="button"
              onPress={() => setIsEditing(false)}
              color="secondary"
              size="xs"
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              isDisabled={loading}
              isLoading={loading}
              size="xs"
              className="text-xs"
            >
              Simpan
            </Button>
          </div>
        </form>
      ) : (
        <>
          {/* Header Item */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-text text-sm leading-snug wrap-break-word" title={item.name}>
                {item.name}
              </h4>
              <p className="text-2xs text-text-400 mt-0.5 font-medium">
                {item.quantity} porsi{" "}
                {item.quantity > 0 &&
                  `(Rp ${Math.round(Number(item.totalPrice) / item.quantity).toLocaleString("id-ID")}/porsi)`}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-sm font-extrabold text-primary-400 whitespace-nowrap">
                Rp {Number(item.totalPrice).toLocaleString("id-ID")}
              </span>
              {sessionStatus !== "COMPLETED" && (
                <div className="flex items-center gap-0.5 ml-1">
                  <Button
                    onPress={startEdit}
                    color="tertiary"
                    size="xs"
                    aria-label={`Ubah menu ${item.name}`}
                    className="p-1.5 min-w-7 min-h-7 rounded-lg active:scale-90 transition-transform duration-160 text-text-400 hover:text-primary-400 flex items-center justify-center"
                  >
                    <Edit02 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onPress={() => onDeleteItemPrompt(item)}
                    color="tertiary"
                    size="xs"
                    aria-label={`Hapus menu ${item.name}`}
                    className="p-1.5 min-w-7 min-h-7 rounded-lg active:scale-90 transition-transform duration-160 text-danger-400/80 hover:text-danger-400 flex items-center justify-center"
                  >
                    <Trash01 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Status Alokasi & Tombol Aksi Cepat */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {isExact && (
                <Badge color="success" size="sm" type="pill-color" className="inline-flex font-semibold text-3xs sm:text-2xs">
                  Pas {totalAllocatedCount} porsi • Rp {sharePerPortion.toLocaleString("id-ID")}/porsi
                </Badge>
              )}
              {isUnder && (
                <Badge color="warning" size="sm" type="pill-color" className="inline-flex font-semibold text-3xs sm:text-2xs">
                  {totalAllocatedCount} dari {item.quantity} porsi (Kurang {item.quantity - totalAllocatedCount}) • Rp {sharePerPortion.toLocaleString("id-ID")}/porsi
                </Badge>
              )}
              {isOver && (
                <Badge color="brand" size="sm" type="pill-color" className="inline-flex font-semibold text-3xs sm:text-2xs">
                  {totalAllocatedCount} porsi patungan • Rp {sharePerPortion.toLocaleString("id-ID")}/porsi
                </Badge>
              )}
              {!hasAllocations && (
                <Badge color="gray" size="sm" type="pill-color" className="inline-flex font-semibold text-3xs sm:text-2xs">
                  Belum dibagi
                </Badge>
              )}
            </div>

            {sessionStatus !== "COMPLETED" && (
              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                <Button
                  onPress={() => onSplitEqually(item.id)}
                  color="secondary"
                  size="xs"
                  iconLeading={Users01}
                  className="px-2 py-1 text-3xs font-semibold rounded-lg active:scale-95 transition-transform duration-160"
                >
                  Bagi ke Semua
                </Button>
                {hasAllocations && (
                  <Button
                    onPress={() => onClearAllocations(item.id)}
                    color="tertiary"
                    size="xs"
                    className="px-2 py-1 text-3xs text-text-400 hover:text-danger-400 rounded-lg active:scale-95 transition-transform duration-160"
                  >
                    Reset
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Avatar Pemilihan Anggota */}
          {members.length > 0 && (
            <div className="flex flex-wrap gap-x-2.5 sm:gap-x-3 gap-y-2.5 sm:gap-y-3 items-start pt-1.5">
              {members.map((member) => {
                const alloc = allocations.find(
                  (a) => a.itemId === item.id && a.memberId === member.id
                );
                const qty = alloc ? alloc.quantity : 0;

                return (
                  <div key={member.id} className="flex flex-col items-center w-12 sm:w-13 shrink-0 relative">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => onIncreaseAllocation(item.id, member.id)}
                        disabled={sessionStatus === "COMPLETED"}
                        aria-label={`Tambah porsi untuk ${member.name}`}
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-full transition-transform active:scale-95 cursor-pointer min-w-10 min-h-10 sm:min-w-11 sm:min-h-11 flex items-center justify-center p-0.5"
                      >
                        <Avatar
                          alt={member.name}
                          size="md"
                          className={`shadow-md transition-all duration-200 ${
                            qty > 0 ? "ring-2 ring-primary-400/40 border-primary-400/60 scale-105" : "opacity-45 hover:opacity-80"
                          }`}
                        />
                      </button>
                      {qty > 0 && sessionStatus !== "COMPLETED" && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDecreaseAllocation(item.id, member.id);
                            }}
                            className="absolute -top-1 -left-1 z-10 bg-danger-600 hover:bg-danger-700 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md cursor-pointer border border-secondary-950 active:scale-90 transition-transform"
                            title="Kurangi porsi"
                            aria-label={`Kurangi porsi untuk ${member.name}`}
                          >
                            <Minus className="w-3 h-3 stroke-[3px]" />
                          </button>
                          <span className="absolute -top-1 -right-1 z-10 bg-primary-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-3xs font-bold shadow-md border border-secondary-950 pointer-events-none">
                            {qty}
                          </span>
                        </>
                      )}
                    </div>
                    <p
                      className={`text-3xs sm:text-2xs truncate w-full text-center leading-tight font-semibold ${
                        qty > 0 ? "text-text font-bold" : "text-text-400"
                      }`}
                      title={member.name}
                    >
                      {member.userId === sessionUserId ? "Gua" : member.name}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
