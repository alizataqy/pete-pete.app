"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  addSessionMember,
  removeSessionMember,
  saveAllocations,
  addSessionItem,
  updateSessionItem,
  deleteSessionItem,
  completeBillSession
} from "@/app/actions/session";
import { Button } from "@/components/base/buttons/button";
import { Plus, Edit02, Trash01, Save01, Check, ArrowLeft } from "@untitledui/icons";
import { redirect } from "next/navigation";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  shareAmount: number;
}

interface Item {
  id: string;
  name: string;
  quantity: number;
  totalPrice: number;
}

interface SplitBoardProps {
  session: {
    id: string;
    title: string;
    merchantName?: string;
    inviteCode: string;
    totalAmount: number;
    taxAmount: number;
    tipAmount: number;
    bankName?: string;
    bankAccount?: string;
    bankOwner?: string;
    status: string;
  };
  initialMembers: Member[];
  items: Item[];
  initialAllocations: { itemId: string; memberId: string }[];
}

export default function SplitBoard({
  session,
  initialMembers,
  items,
  initialAllocations,
}: SplitBoardProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [newMemberName, setNewMemberName] = useState("");
  const [allocations, setAllocations] = useState<{ itemId: string; memberId: string }[]>(initialAllocations);

  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // States untuk Tambah Menu Manual
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState("");

  // States untuk Edit Menu Inline
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQty, setEditItemQty] = useState(1);
  const [editItemPrice, setEditItemPrice] = useState("");

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setLoading(true);
    try {
      const res = await addSessionMember(session.id, newMemberName);
      if (res.success && res.member) {
        setMembers((prev) => [
          ...prev,
          { id: res.member.id, name: res.member.name, shareAmount: 0 },
        ]);
        setNewMemberName("");
        toast.success("Teman berhasil ditambahkan!");
      } else {
        setError(res.error || "Gagal menambahkan anggota");
        toast.error(res.error || "Gagal menambahkan anggota");
      }
    } catch (err) {
      console.log(err)
      setError("Gagal menambahkan anggota");
      toast.error("Gagal menambahkan anggota");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setLoading(true);
    try {
      const res = await removeSessionMember(memberId, session.id);
      if (res.success) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        setAllocations((prev) => prev.filter((a) => a.memberId !== memberId));
        toast.success("Teman berhasil dihapus");
      }
    } catch (err) {
      console.log(err)
      setError("Gagal menghapus anggota");
      toast.error("Gagal menghapus anggota");
    } finally {
      setLoading(false);
    }
  };

  // Toggle alokasi item ke member
  const handleToggleAllocation = (itemId: string, memberId: string) => {
    const exists = allocations.find((a) => a.itemId === itemId && a.memberId === memberId);
    if (exists) {
      setAllocations((prev) => prev.filter((a) => !(a.itemId === itemId && a.memberId === memberId)));
    } else {
      setAllocations((prev) => [...prev, { itemId, memberId }]);
    }
  };

  // Simpan pembagian tagihan & hitung ulang shareAmount di DB
  const handleSaveAndCalculate = () => {
    setError("");
    startTransition(async () => {
      const payload = allocations.map((a) => {
        const totalPeopleAllocated = allocations.filter((x) => x.itemId === a.itemId).length;
        return {
          itemId: a.itemId,
          memberId: a.memberId,
          quantity: 1,
          fraction: 1 / totalPeopleAllocated,
        };
      });

      const res = await saveAllocations(session.id, payload);
      if (res.success) {
        toast.success("Pembagian tagihan berhasil disimpan!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(res.error || "Gagal memproses pembagian");
        toast.error(res.error || "Gagal memproses pembagian");
      }
    });
  };

  const handleCompleteSession = async () => {
    if (!confirm("Apakah Anda yakin ingin menyelesaikan sesi PETE-PETE ini? Sesi yang selesai tidak dapat diubah lagi.")) return;
    setLoading(true);
    try {
      const res = await completeBillSession(session.id);
      if (res.success) {
        toast.success("Sesi PETE-PETE berhasil diselesaikan!");
        setTimeout(() => {
          redirect("/dashboard");
        }, 1200);
      } else {
        setError(res.error || "Gagal menyelesaikan sesi.");
        toast.error(res.error || "Gagal menyelesaikan sesi.");
      }
    } catch (err) {
      console.log(err)
      setError("Gagal menyelesaikan sesi.");
      toast.error("Gagal menyelesaikan sesi.");
    } finally {
      setLoading(false);
    }
  };

  // Tambah Item Manual
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    setLoading(true);
    try {
      const res = await addSessionItem(session.id, newItemName, newItemQty, Number(newItemPrice));
      if (res.success) {
        toast.success("Menu makanan berhasil ditambahkan!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(res.error || "Gagal menambah item.");
        toast.error(res.error || "Gagal menambah item.");
      }
    } catch (err) {
      console.log(err)
      setError("Gagal menambah item.");
      toast.error("Gagal menambah item.");
    } finally {
      setLoading(false);
    }
  };

  // Hapus Item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;
    setLoading(true);
    try {
      const res = await deleteSessionItem(itemId, session.id);
      if (res.success) {
        toast.success("Menu makanan berhasil dihapus");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(res.error || "Gagal menghapus item.");
        toast.error(res.error || "Gagal menghapus item.");
      }
    } catch (err) {
      console.log(err)

      setError("Gagal menghapus item.");
      toast.error("Gagal menghapus item.");
    } finally {
      setLoading(false);
    }
  };

  // Mulai Edit Item
  const startEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemQty(item.quantity);
    setEditItemPrice(String(Math.round(item.totalPrice / item.quantity)));
  };

  // Simpan Perubahan Edit Item
  const handleUpdateItem = async (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    if (!editItemName.trim() || !editItemPrice) return;

    setLoading(true);
    try {
      const res = await updateSessionItem(itemId, session.id, editItemName, editItemQty, Number(editItemPrice));
      if (res.success) {
        toast.success("Menu makanan berhasil diperbarui!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(res.error || "Gagal memperbarui item.");
        toast.error(res.error || "Gagal memperbarui item.");
      }
    } catch (err) {
      console.log(err)

      setError("Gagal memperbarui item.");
      toast.error("Gagal memperbarui item.");
    } finally {
      setLoading(false);
    }
  };

  // Menyusun dan menyalin rincian pesanan anggota ke clipboard
  const handleCopySummary = (member: Member) => {
    const memberAllocations = allocations.filter(a => a.memberId === member.id);

    let itemsText = "";
    let subtotal = 0;

    memberAllocations.forEach(alloc => {
      const item = items.find(i => i.id === alloc.itemId);
      if (item) {
        const totalAllocated = allocations.filter(a => a.itemId === item.id).length;
        const sharePrice = Math.round(Number(item.totalPrice) / totalAllocated);
        subtotal += sharePrice;

        itemsText += `  - ${item.name} (bagi ${totalAllocated}): Rp ${sharePrice.toLocaleString("id-ID")}\n`;
      }
    });

    const totalSubtotal = items.reduce((acc, item) => {
      const hasAlloc = allocations.some(a => a.itemId === item.id);
      return acc + (hasAlloc ? Number(item.totalPrice) : 0);
    }, 0);

    const taxAndTips = Number(session.taxAmount) + Number(session.tipAmount);
    const ratio = totalSubtotal > 0 ? taxAndTips / totalSubtotal : 0;
    const memberTaxAndTips = Math.round(subtotal * ratio);
    const grandTotal = subtotal + memberTaxAndTips;

    const bankDetails = session.bankName
      ? `🏦 Transfer ke: ${session.bankName}\n💳 No. Rekening: ${session.bankAccount}\n👤 A/N: ${session.bankOwner}`
      : "ℹ️ Silakan hubungi pembuat sesi untuk detail transfer.";

    const text = `📢 *TAGIHAN PETE-PETE: ${session.title}*
${session.merchantName ? `📍 ${session.merchantName}\n` : ""}
Halo *${member.name}*, berikut rincian tagihan kamu:
${itemsText || "  - Belum memilih menu makanan\n"}----------------------------------
Subtotal: Rp ${subtotal.toLocaleString("id-ID")}
Pajak & Servis: Rp ${memberTaxAndTips.toLocaleString("id-ID")}
💰 *Total Tagihan: Rp ${grandTotal.toLocaleString("id-ID")}*

${bankDetails}

Terima kasih! 🙏`;

    navigator.clipboard.writeText(text);
    setCopiedId(member.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col flex-1 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-lilac-ash-950/90 backdrop-blur-md border-b border-lilac-ash-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            href="/dashboard"
            color="primary"
            size="sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-extrabold text-slate-100 line-clamp-1">{session.title}</h1>
            <p className="text-[9px] text-slate-400">
              Kode: {session.inviteCode}
            </p>
          </div>
        </div>
        <Link
          href={`/pete-pete/${session.id}/items`}
          className="px-2.5 py-1.5 rounded-lg border border-lilac-ash-800 hover:bg-jet-black-900 text-slate-400 text-[10px] font-semibold transition-all active:scale-95"
        >
          Review Struk
        </Link>
      </header>

      {/* Body Content */}
      <div className="p-4 space-y-5 overflow-y-auto">
        {error && (
          <div className="p-3 text-xs text-lilac-ash-200 bg-lilac-ash-900 border border-lilac-ash-700 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* 1. Manajemen Anggota */}
        <div className="p-4 rounded-xl border border-lilac-ash-800 bg-jet-black-900/60 space-y-4">
          <h2 className="text-xs font-semibold text-jet-black-100 uppercase tracking-wider">👥 Anggota Sesi</h2>

          {session.status !== "COMPLETED" && (
            <form onSubmit={handleAddMember} className="flex gap-2">
              <input
                type="text"
                required
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 text-white placeholder-slate-600 focus:border-alice-blue-500 focus:ring-1 focus:ring-alice-blue-500 text-xs outline-none transition-all"
                placeholder="Nama teman..."
              />
              <Button
                type="submit"
                isDisabled={loading}
                isLoading={loading}
                size="sm"
              >
                Tambah
              </Button>
            </form>
          )}

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-xl bg-jet-black-950 border border-lilac-ash-800"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-200 text-xs">{member.name}</p>
                  <p className="text-[10px] text-indigo-400 font-medium">
                    Bagian: Rp {Number(member.shareAmount).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    onPress={() => handleCopySummary(member)}
                    color="link-color"
                    className="text-[10px] text-alice-blue-500 hover:text-alice-blue-400 font-bold transition-all"
                  >
                    {copiedId === member.id ? "Tersalin!" : "📋 Salin"}
                  </Button>
                  {member.name !== "Saya (Owner)" && session.status !== "COMPLETED" && (
                    <Button
                      onPress={() => handleRemoveMember(member.id)}
                      color="link-gray"
                      className="text-[10px] text-jet-black-400 hover:text-lilac-ash-200 font-semibold transition-colors"
                      iconLeading={Trash01}
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Papan Alokasi Item */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold text-jet-black-100 uppercase tracking-wider">🎯 Papan Alokasi Item</h2>
              <p className="text-[10px] text-slate-500 leading-normal">
                Pilih nama teman yang memakan menu/item belanja di bawah ini.
              </p>
            </div>
            {session.status !== "COMPLETED" && (
              <Button
                onPress={() => setShowAddForm(!showAddForm)}
                color="secondary"
                size="xs"
                className="px-2.5 py-1 text-[10px]"
                iconLeading={showAddForm ? undefined : Plus}
              >
                {showAddForm ? "Batal" : "Tambah Menu"}
              </Button>
            )}
          </div>

          {/* Form Tambah Menu Manual */}
          {showAddForm && (
            <form onSubmit={handleAddItem} className="p-3.5 rounded-xl bg-jet-black-900 border border-lilac-ash-800 space-y-3">
              <h4 className="text-[10px] font-bold text-jet-black-100 uppercase tracking-wider">Tambah Menu Baru</h4>

              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 text-xs text-white outline-none"
                  placeholder="Nama Menu (misal: Nasi Goreng)"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-jet-black-400 uppercase font-bold">Jumlah (Qty)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-jet-black-400 uppercase font-bold">Harga Satuan</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 text-xs text-white outline-none"
                      placeholder="Rp"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                isDisabled={loading}
                isLoading={loading}
                className="w-full py-2 rounded-lg bg-alice-blue-500 hover:bg-alice-blue-600 text-jet-black-950 font-bold text-xs active:scale-95 transition-all"
              >
                Tambah Menu
              </Button>
            </form>
          )}

          <div className="space-y-3">
            {items.map((item) => {
              const allocatedToThisItem = allocations.filter((a) => a.itemId === item.id);
              const isEditing = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-jet-black-900 border border-lilac-ash-800 space-y-3 shadow-sm hover:border-jet-black-700 transition-all"
                >
                  {isEditing ? (
                    // Form Edit Item Inline
                    <form onSubmit={(e) => handleUpdateItem(e, item.id)} className="space-y-3">
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={editItemName}
                          onChange={(e) => setEditItemName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-jet-black-950 border border-jet-black-700 text-xs text-white outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            required
                            min={1}
                            value={editItemQty}
                            onChange={(e) => setEditItemQty(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-jet-black-950 border border-jet-black-700 text-xs text-white outline-none"
                            placeholder="Qty"
                          />
                          <input
                            type="number"
                            required
                            min={0}
                            value={editItemPrice}
                            onChange={(e) => setEditItemPrice(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-jet-black-950 border border-jet-black-700 text-xs text-white outline-none"
                            placeholder="Harga Satuan"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end text-[10px]">
                        <Button
                          type="button"
                          onPress={() => setEditingItemId(null)}
                          color="secondary"
                          size="xs"
                          className="px-3 py-1 rounded bg-jet-black-950 border border-jet-black-700 text-slate-400"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          isDisabled={loading}
                          isLoading={loading}
                          size="xs"
                          className="px-3 py-1 rounded bg-alice-blue-500 text-jet-black-950 font-bold"
                        >
                          Simpan
                        </Button>
                      </div>
                    </form>
                  ) : (
                    // Display Item Info
                    <>
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                            <span>{item.name}</span>
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            {item.quantity}x • Rp {(Number(item.totalPrice) / item.quantity).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-indigo-400">
                            Rp {Number(item.totalPrice).toLocaleString("id-ID")}
                          </span>
                          {session.status !== "COMPLETED" && (
                            <div className="flex gap-2 text-[9px] font-bold text-jet-black-400">
                              <Button
                                onPress={() => startEditItem(item)}
                                color="link-color"
                                className="hover:text-alice-blue-400 transition-colors font-bold text-[9px]"
                                iconLeading={Edit02}
                              >
                                Edit
                              </Button>
                              <Button
                                onPress={() => handleDeleteItem(item.id)}
                                color="link-gray"
                                className="hover:text-rose-400 transition-colors font-bold text-[9px]"
                                iconLeading={Trash01}
                              >
                                Hapus
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Chips Pemilihan Anggota */}
                      <div className="flex flex-wrap gap-1.5">
                        {members.map((member) => {
                          const isAllocated = allocations.some(
                            (a) => a.itemId === item.id && a.memberId === member.id
                          );

                          return (
                            <Button
                              key={member.id}
                              onPress={() => handleToggleAllocation(item.id, member.id)}
                              isDisabled={session.status === "COMPLETED"}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all active:scale-95 border ${isAllocated
                                ? "bg-alice-blue-900 text-alice-blue-300 border-alice-blue-800"
                                : "bg-jet-black-950 text-slate-400 border-lilac-ash-800 hover:border-slate-700"
                                }`}
                            >
                              {member.name}
                            </Button>
                          );
                        })}
                      </div>

                      {allocatedToThisItem.length > 0 && (
                        <p className="text-[9px] text-[#98A2B3] italic">
                          Dibagi ke {allocatedToThisItem.length} orang (Rp{" "}
                          {Math.round(Number(item.totalPrice) / allocatedToThisItem.length).toLocaleString("id-ID")}/org)
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Bottom Actions (Mobile thumb friendly) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-lilac-ash-800 bg-lilac-ash-950/95 backdrop-blur-md z-20">
        {session.status === "COMPLETED" ? (
          <Button
            isDisabled
            className="w-full py-3 px-4 rounded-xl bg-lilac-ash-800 text-slate-400 text-xs font-semibold"
          >
            ✓ Sesi PETE-PETE Selesai
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onPress={handleSaveAndCalculate}
              isDisabled={isPending || loading}
              isLoading={isPending || loading}
              color="secondary"
              className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold"
              iconLeading={Save01}
            >
              Simpan & Hitung
            </Button>
            <Button
              onPress={handleCompleteSession}
              isDisabled={isPending || loading}
              isLoading={isPending || loading}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              iconLeading={Check}
            >
              Selesai
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
