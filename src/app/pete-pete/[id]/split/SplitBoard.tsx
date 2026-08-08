"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  addSessionMember,
  removeSessionMember,
  renameSessionMember,
  saveAllocations,
  addSessionItem,
  updateSessionItem,
  deleteSessionItem,
  completeBillSession
} from "@/app/actions/session";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { Plus, Edit02, Trash01, Save01, Check, ArrowLeft, AlertTriangle, Users01, Copy01, Target01, CreditCard01 } from "@untitledui/icons";
import { redirect, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSessionStorageState } from "@/hooks/useSessionStorageState";

interface Member {
  id: string;
  name: string;
  shareAmount: number;
  userId?: string | null;
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
    userId?: string | null;
  };
  initialMembers: Member[];
  items: Item[];
  initialAllocations: { itemId: string; memberId: string; quantity?: number }[];
}

export default function SplitBoard({
  session,
  initialMembers,
  items,
  initialAllocations,
}: SplitBoardProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [newMemberName, setNewMemberName] = useState("");
  const [allocations, setAllocations] = useSessionStorageState<{ itemId: string; memberId: string; quantity: number }[]>(
    `pete-pete-allocations-${session.id}`,
    initialAllocations.map((a) => ({ itemId: a.itemId, memberId: a.memberId, quantity: a.quantity || 1 }))
  );

  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // States untuk Rename Member
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState("");

  const handleRenameMember = async (memberId: string) => {
    if (!editingMemberName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await renameSessionMember(memberId, editingMemberName.trim(), session.id);
      if (res.success && res.member) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, name: res.member!.name } : m))
        );
        setEditingMemberId(null);
        toast.success("Nama anggota berhasil diubah!");
      } else {
        setError(res.error || "Gagal mengubah nama anggota.");
      }
    } catch {
      setError("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  // States untuk Tambah Menu Manual
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemTotal, setNewItemTotal] = useState("");

  const handleNewItemQtyChange = (qty: number) => {
    setNewItemQty(qty);
    if (newItemPrice) {
      setNewItemTotal(String(qty * Number(newItemPrice)));
    } else if (newItemTotal) {
      setNewItemPrice(String(Math.round(Number(newItemTotal) / qty)));
    }
  };

  const handleNewItemPriceChange = (price: string) => {
    setNewItemPrice(price);
    if (price) {
      setNewItemTotal(String(newItemQty * Number(price)));
    } else {
      setNewItemTotal("");
    }
  };

  const handleNewItemTotalChange = (total: string) => {
    setNewItemTotal(total);
    if (total) {
      setNewItemPrice(String(Math.round(Number(total) / newItemQty)));
    } else {
      setNewItemPrice("");
    }
  };

  // States untuk Edit Menu Inline
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQty, setEditItemQty] = useState(1);
  const [editItemPrice, setEditItemPrice] = useState("");
  const [editItemTotal, setEditItemTotal] = useState("");

  const handleEditItemQtyChange = (qty: number) => {
    setEditItemQty(qty);
    if (editItemPrice) {
      setEditItemTotal(String(qty * Number(editItemPrice)));
    } else if (editItemTotal) {
      setEditItemPrice(String(Math.round(Number(editItemTotal) / qty)));
    }
  };

  const handleEditItemPriceChange = (price: string) => {
    setEditItemPrice(price);
    if (price) {
      setEditItemTotal(String(editItemQty * Number(price)));
    } else {
      setEditItemTotal("");
    }
  };

  const handleEditItemTotalChange = (total: string) => {
    setEditItemTotal(total);
    if (total) {
      setEditItemPrice(String(Math.round(Number(total) / editItemQty)));
    } else {
      setEditItemPrice("");
    }
  };

  const [addPriceMode, setAddPriceMode] = useState<"unit" | "total">("unit");
  const [editPriceMode, setEditPriceMode] = useState<"unit" | "total">("unit");

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    let name = newMemberName.trim();
    if (!name) {
      let nextNum = 1;
      while (true) {
        const potentialName = `Sohib ${nextNum}`;
        if (!members.some((m) => m.name === potentialName)) {
          name = potentialName;
          break;
        }
        nextNum++;
      }
    }

    setLoading(true);
    try {
      const res = await addSessionMember(session.id, name);
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

  // Increase allocation quantity
  const handleIncreaseAllocation = (itemId: string, memberId: string) => {
    setAllocations((prev) => {
      const exists = prev.find((a) => a.itemId === itemId && a.memberId === memberId);
      if (exists) {
        return prev.map((a) =>
          a.itemId === itemId && a.memberId === memberId ? { ...a, quantity: a.quantity + 1 } : a
        );
      } else {
        return [...prev, { itemId, memberId, quantity: 1 }];
      }
    });
  };

  // Decrease allocation quantity
  const handleDecreaseAllocation = (itemId: string, memberId: string) => {
    setAllocations((prev) => {
      const exists = prev.find((a) => a.itemId === itemId && a.memberId === memberId);
      if (!exists) return prev;
      if (exists.quantity <= 1) {
        return prev.filter((a) => !(a.itemId === itemId && a.memberId === memberId));
      } else {
        return prev.map((a) =>
          a.itemId === itemId && a.memberId === memberId ? { ...a, quantity: a.quantity - 1 } : a
        );
      }
    });
  };

  // Simpan pembagian tagihan & hitung ulang shareAmount di DB
  const handleSaveAndCalculate = () => {
    setError("");
    startTransition(async () => {
      const payload = allocations.map((a) => {
        const itemAllocations = allocations.filter((x) => x.itemId === a.itemId);
        const totalAllocatedQty = itemAllocations.reduce((sum, x) => sum + x.quantity, 0);
        return {
          itemId: a.itemId,
          memberId: a.memberId,
          quantity: a.quantity,
          fraction: a.quantity / totalAllocatedQty,
        };
      });

      const res = await saveAllocations(session.id, payload);
      if (res.success) {
        sessionStorage.removeItem(`pete-pete-allocations-${session.id}`);
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
          redirect("/tongkrongan");
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
    setEditItemTotal(String(item.totalPrice));
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
        const itemAllocations = allocations.filter(x => x.itemId === item.id);
        const totalAllocatedQty = itemAllocations.reduce((sum, x) => sum + x.quantity, 0);
        const sharePrice = Math.round((alloc.quantity / totalAllocatedQty) * Number(item.totalPrice));
        subtotal += sharePrice;

        itemsText += `  - ${item.name} (${alloc.quantity}/${totalAllocatedQty} porsi): Rp ${sharePrice.toLocaleString("id-ID")}\n`;
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
      ? `Transfer ke: ${session.bankName}\n No. Rekening: ${session.bankAccount}\n👤 A/N: ${session.bankOwner}`
      : "Silakan hubungi pembuat sesi untuk detail transfer.";

    const cleanTitle = session.title.replace(/^PETE-PETE\s+/i, "");

    const text = `📢 *TAGIHAN PETE-PETE: ${cleanTitle}*
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
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Menyalin rekap tagihan seluruh anggota sekaligus (untuk dikirim ke grup WhatsApp)
  const handleCopyAllSummary = () => {
    let allMembersShareText = "";

    members.forEach((member) => {
      const memberAllocations = allocations.filter(a => a.memberId === member.id);
      let subtotal = 0;
      let memberItemsText = "";

      memberAllocations.forEach(alloc => {
        const item = items.find(i => i.id === alloc.itemId);
        if (item) {
          const itemAllocations = allocations.filter(x => x.itemId === item.id);
          const totalAllocatedQty = itemAllocations.reduce((sum, x) => sum + x.quantity, 0);
          const sharePrice = Math.round((alloc.quantity / totalAllocatedQty) * Number(item.totalPrice));
          subtotal += sharePrice;
          memberItemsText += `  • ${item.name} (${alloc.quantity}/${totalAllocatedQty} porsi)\n`;
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

      allMembersShareText += `👤 *${member.name}* : Rp ${grandTotal.toLocaleString("id-ID")}\n${memberItemsText || "  • Belum pilih menu\n"}\n`;
    });

    const bankDetails = session.bankName
      ? `Transfer ke: ${session.bankName}\n No. Rekening: ${session.bankAccount}\n👤 A/N: ${session.bankOwner}`
      : "Silakan hubungi pembuat sesi untuk detail transfer.";

    const cleanTitle = session.title.replace(/^PETE-PETE\s+/i, "");

    const text = `📢 *REKAP TAGIHAN PETE-PETE: ${cleanTitle}*
${session.merchantName ? `📍 ${session.merchantName}\n` : ""}
Total Tagihan Sesi: Rp ${session.totalAmount.toLocaleString("id-ID")}
----------------------------------
${allMembersShareText}----------------------------------
${bankDetails}

Ditunggu transferannya ya, Bos! Thank you 🙏`;

    navigator.clipboard.writeText(text);
    toast.success("Semua rekap tagihan disalin ke clipboard!");
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex flex-col flex-1 pb-16 overflow-hidden min-h-0 relative">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onPress={() => router.push("/tongkrongan")}
            color="primary"
            size="sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-extrabold text-text line-clamp-1">{session.title}</h1>
            <p className="text-[9px] text-text-300">
              Kode: {session.inviteCode}
            </p>
          </div>
        </div>
        <Button
          href={`/pete-pete/${session.id}/items`}
          color="secondary"
          className="px-2.5 py-1.5 rounded-lg border border-secondary-800 hover:bg-text-900 text-slate-400 text-[10px] font-semibold transition-all active:scale-95"
        >
          Review Struk
        </Button>
      </header>

      {/* Body Content */}
      <div className="flex-1 p-4 space-y-5 flex flex-col overflow-hidden min-h-0">
        {error && (
          <div className="p-3 text-xs text-secondary-200 bg-secondary-900 border border-secondary-700 rounded-xl flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-secondary-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Detail Rekening Penerima */}
        {session.bankName && (
          <div className="p-3.5 rounded-xl border border-secondary-800 bg-primary-950/20 text-xs flex items-center justify-between gap-3 shrink-0">
            <div className="space-y-0.5">
              <p className="text-[10px] text-text-400 font-bold uppercase flex items-center gap-1">
                <CreditCard01 className="w-3.5 h-3.5 text-text-400" />
                <span>Rekening Transfer Sesi Ini</span>
              </p>
              <p className="font-bold text-text-50">
                {session.bankName} - {session.bankAccount}
              </p>
              <p className="text-[10px] text-text-300">
                A/N: {session.bankOwner}
              </p>
            </div>
            <Button
              onPress={() => {
                if (session.bankAccount) {
                  const textToCopy = `${session.bankName}\nNo. Rek: ${session.bankAccount}\nA/N: ${session.bankOwner}`;
                  navigator.clipboard.writeText(textToCopy);
                  toast.success("Info rekening disalin!");
                }
              }}
              color="secondary"
              size="xs"
              className="px-2.5 py-1 text-[10px]"
              iconLeading={Copy01}
            >
              Salin Rek
            </Button>
          </div>
        )}

        {/* 1. Manajemen Anggota */}
        <div className="p-4 rounded-xl border border-secondary-800 bg-text-900/60 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Users01 className="w-4 h-4 text-text-300" />
              <span>Siapa Aja yang Ikut PETE-PETE?</span>
            </h2>
            <Button
              onPress={handleCopyAllSummary}
              color="secondary"
              size="xs"
              className="px-2 py-1 text-[10px]"
              iconLeading={Copy01}
            >
              Bagi tagihan group
            </Button>
          </div>

          {session.status !== "COMPLETED" && (
            <form onSubmit={handleAddMember} className="flex gap-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-text placeholder-text-600 focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none transition-all"
                placeholder="Nama temen lo..."
              />
              <Button
                type="submit"
                isDisabled={loading}
                isLoading={loading}
                size="sm"
              >
                Tambahin
              </Button>
            </form>
          )}

          <div className="space-y-2 max-h-55 overflow-y-auto pr-1 scrollbar-hide">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-xl bg-text-950 border border-secondary-800"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar alt={member.name} size="sm" className="shadow-md border border-secondary-800" />
                  {editingMemberId === member.id ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <input
                        type="text"
                        value={editingMemberName}
                        onChange={(e) => setEditingMemberName(e.target.value)}
                        className="px-2 py-1 rounded bg-text-900 border border-text-700 text-xs text-text outline-none flex-1 min-w-0"
                      />
                      <Button
                        onPress={() => setEditingMemberId(null)}
                        color="secondary"
                        size="xs"
                        className="text-xs"
                      >
                        Batal
                      </Button>
                      <Button
                        onPress={() => handleRenameMember(member.id)}
                        isDisabled={loading}
                        color="primary"
                        size="xs"
                        className="text-xs"
                      >
                        Simpan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-text text-xs truncate">{member.name}</p>
                      <p className="text-[10px] text-indigo-400 font-medium">
                        Patungan: Rp {Number(member.shareAmount).toLocaleString("id-ID")}
                      </p>
                    </div>
                  )}
                </div>

                {editingMemberId !== member.id && (
                  <div className="flex items-center gap-2.5">
                    <Button
                      onPress={() => handleCopySummary(member)}
                      color="link-color"
                      className="text-[10px] text-primary-500 hover:text-primary-400 font-bold transition-all"
                      iconLeading={copiedId === member.id ? Check : Copy01}
                    >
                      {copiedId === member.id ? "Udah disalin!" : "Bagi tagihan"}
                    </Button>
                    {member.userId !== session.userId && session.status !== "COMPLETED" && (
                      <>
                        <Button
                          onPress={() => {
                            setEditingMemberId(member.id);
                            setEditingMemberName(member.name);
                          }}
                          color="link-gray"
                          className="text-[10px] text-text-400 hover:text-secondary-200 font-semibold transition-colors"
                          iconLeading={Edit02}
                        >
                          Ubah
                        </Button>
                        <Button
                          onPress={() => handleRemoveMember(member.id)}
                          color="link-gray"
                          className="text-[10px] text-text-400 hover:text-secondary-200 font-semibold transition-colors"
                          iconLeading={Trash01}
                        >
                          Hapus
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Papan Alokasi Item */}
        <div className="space-y-3 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
                <Target01 className="w-4 h-4 text-text-300" />
                <span>Papan Alokasi Item</span>
              </h2>
              <p className="text-[10px] text-text-400 leading-normal">
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
            <form onSubmit={handleAddItem} className="p-3.5 rounded-xl bg-text-900 border border-secondary-800 space-y-3">
              <h4 className="text-[10px] font-bold text-text uppercase tracking-wider">Tambah Menu Baru</h4>

              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-xs text-text outline-none"
                  placeholder="Nama Menu (misal: Nasi Goreng)"
                />

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-text-400 uppercase font-bold">Jumlah (Qty)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newItemQty}
                      onChange={(e) => handleNewItemQtyChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-xs text-text outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-text-400 uppercase font-bold">Tipe Harga</label>
                    <div className="grid grid-cols-2 gap-1 bg-text-950/80 p-1 rounded-xl border border-secondary-800/40 h-9 items-center">
                      <Button
                        type="button"
                        onPress={() => setAddPriceMode("unit")}
                        color={addPriceMode === "unit" ? "primary" : "tertiary"}
                        size="xs"
                        className="h-full text-[10px] font-bold rounded-lg"
                      >
                        Satuan
                      </Button>
                      <Button
                        type="button"
                        onPress={() => setAddPriceMode("total")}
                        color={addPriceMode === "total" ? "primary" : "tertiary"}
                        size="xs"
                        className="h-full text-[10px] font-bold rounded-lg"
                      >
                        Total
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-text-400 uppercase font-bold">
                      {addPriceMode === "unit" ? "Harga Satuan" : "Harga Total"}
                    </label>
                    {addPriceMode === "unit" ? (
                      <input
                        type="number"
                        min={0}
                        value={newItemPrice}
                        onChange={(e) => handleNewItemPriceChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-xs text-text outline-none"
                        placeholder="Satuan"
                      />
                    ) : (
                      <input
                        type="number"
                        min={0}
                        value={newItemTotal}
                        onChange={(e) => handleNewItemTotalChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-xs text-text outline-none"
                        placeholder="Total"
                      />
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                isDisabled={loading}
                isLoading={loading}
                className="w-full text-xs active:scale-95 transition-all"
              >
                Tambah Menu
              </Button>
            </form>
          )}

          <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide min-h-0">
            {items.map((item) => {
              const isEditing = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-text-900 border border-secondary-800 space-y-3 shadow-sm hover:border-text-700 transition-all"
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
                          className="w-full px-3 py-1.5 rounded-lg bg-text-950 border border-text-700 text-xs text-text outline-none"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-text-400 uppercase font-bold">Jumlah (Qty)</label>
                            <input
                              type="number"
                              required
                              min={1}
                              value={editItemQty}
                              onChange={(e) => handleEditItemQtyChange(Number(e.target.value))}
                              className="w-full px-3 py-1.5 rounded-lg bg-text-950 border border-text-700 text-xs text-text outline-none"
                              placeholder="Qty"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-text-400 uppercase font-bold">Tipe Harga</label>
                            <div className="grid grid-cols-2 gap-1 bg-text-950/80 p-1 rounded-xl border border-secondary-800/40 h-9 items-center">
                              <Button
                                type="button"
                                onPress={() => setEditPriceMode("unit")}
                                color={editPriceMode === "unit" ? "primary" : "tertiary"}
                                size="xs"
                                className="h-full text-[10px] font-bold rounded-lg"
                              >
                                Satuan
                              </Button>
                              <Button
                                type="button"
                                onPress={() => setEditPriceMode("total")}
                                color={editPriceMode === "total" ? "primary" : "tertiary"}
                                size="xs"
                                className="h-full text-[10px] font-bold rounded-lg"
                              >
                                Total
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-text-400 uppercase font-bold">
                              {editPriceMode === "unit" ? "Harga Satuan" : "Harga Total"}
                            </label>
                            {editPriceMode === "unit" ? (
                              <input
                                type="number"
                                min={0}
                                value={editItemPrice}
                                onChange={(e) => handleEditItemPriceChange(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-text-950 border border-text-700 text-xs text-text outline-none"
                                placeholder="Satuan"
                              />
                            ) : (
                              <input
                                type="number"
                                min={0}
                                value={editItemTotal}
                                onChange={(e) => handleEditItemTotalChange(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-text-950 border border-text-700 text-xs text-text outline-none"
                                placeholder="Total"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end text-[10px]">
                        <Button
                          type="button"
                          onPress={() => setEditingItemId(null)}
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
                    // Display Item Info
                    <>
                      {(() => {
                        const itemAllocations = allocations.filter((a) => a.itemId === item.id);
                        const totalAllocatedCount = itemAllocations.reduce((sum, a) => sum + a.quantity, 0);
                        const isComplete = totalAllocatedCount > 0;

                        return (
                          <>
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                <h4 className="font-bold text-text text-xs flex items-center gap-1.5">
                                  <span>{item.name}</span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isComplete ? "bg-emerald-950 border border-emerald-800 text-emerald-300" : "bg-amber-950 border border-amber-800 text-amber-300"}`}>
                                    {isComplete ? `Udah dibagi: ${totalAllocatedCount} porsi` : "Belum dibagi"}
                                  </span>
                                </h4>
                                <p className="text-[10px] text-text-500">
                                  {item.quantity}x • Rp {(Number(item.totalPrice) / item.quantity).toLocaleString("id-ID")}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-bold text-indigo-400">
                                  Rp {Number(item.totalPrice).toLocaleString("id-ID")}
                                </span>
                                {session.status !== "COMPLETED" && (
                                  <div className="flex gap-2 text-[9px] font-bold text-text-400">
                                    <Button
                                      onPress={() => startEditItem(item)}
                                      color="link-color"
                                      className="hover:text-primary-400 transition-colors font-bold text-[9px]"
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

                            {/* Avatar Pemilihan Anggota */}
                            <div className="flex flex-wrap gap-4 pt-1">
                              {members.map((member) => {
                                const alloc = allocations.find(
                                  (a) => a.itemId === item.id && a.memberId === member.id
                                );
                                const qty = alloc ? alloc.quantity : 0;

                                return (
                                  <div key={member.id} className="flex flex-col items-center gap-1.5 w-12 shrink-0 relative">
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() => handleIncreaseAllocation(item.id, member.id)}
                                        disabled={session.status === "COMPLETED"}
                                        className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                                      >
                                        <Avatar
                                          alt={member.name}
                                          size="md"
                                          className={`shadow-md transition-all duration-200 ${qty > 0 ? "ring-2 ring-primary border-primary scale-105" : "opacity-40"}`}
                                        />
                                      </button>
                                      {qty > 0 && session.status !== "COMPLETED" && (
                                        <>
                                          {/* Quantity Badge on Top Right */}
                                          <span className="absolute -top-1 -right-1 bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md border border-text-950">
                                            {qty}
                                          </span>
                                          {/* Tiny Minus Button on Bottom Right */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDecreaseAllocation(item.id, member.id);
                                            }}
                                            className="absolute -bottom-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer border border-text-950 active:scale-90"
                                            title="Kurangi porsi"
                                          >
                                            -
                                          </button>
                                        </>
                                      )}
                                    </div>
                                    <p className={`text-[10px] truncate w-full text-center font-semibold ${qty > 0 ? "text-text font-bold" : "text-text-400"}`}>
                                      {member.name}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            {itemAllocations.length > 0 && (
                              <p className="text-[9px] text-text-400 italic">
                                Dibagi ke {itemAllocations.length} orang ({totalAllocatedCount} porsi)
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Bottom Actions (Mobile thumb friendly) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-800 bg-secondary-950/95 backdrop-blur-md z-20">
        {session.status === "COMPLETED" ? (
          <Button
            isDisabled
            className="w-full py-3 px-4 rounded-xl bg-secondary-800 text-text-300 text-xs font-semibold"
            iconLeading={Check}
          >
            Sesi PETE-PETE Selesai
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
