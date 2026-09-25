"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  addSessionMember,
  removeSessionMember,
  renameSessionMember,
  saveAllocations,
  addSessionItem,
  updateSessionItem,
  deleteSessionItem,
  completeBillSession,
  updateBillSessionStatus,
  toggleMemberPaidStatus
} from "@/app/actions/session";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import { Plus, Edit02, Trash01, Check, ArrowLeft, AlertTriangle, Users01, Copy01, Target01, CreditCard01, ArrowUp, ArrowDown, Eye, EyeOff, Minus, X, Share07, MessageChatSquare, XClose } from "@untitledui/icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSessionStorageState } from "@/hooks/useSessionStorageState";
import { Dot } from "@/components/foundations/dot-icon";
import dynamic from "next/dynamic";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Heading } from "react-aria-components";

const DeleteConfirmation = dynamic(
  () => import("@/components/application/modals/DeleteConfirmation"),
  { ssr: false }
);
const ConfirmationModal = dynamic(
  () => import("@/components/application/modals/ConfirmationModal"),
  { ssr: false }
);


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

interface Member {
  id: string;
  name: string;
  shareAmount: number;
  userId?: string | null;
  isPaid?: boolean;
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
  const [itemList, setItemList] = useState<Item[]>(items);
  const [newMemberName, setNewMemberName] = useState("");

  const [allocations, setAllocations] = useSessionStorageState<{ itemId: string; memberId: string; quantity: number }[]>(
    `pete-pete-allocations-${session.id}`,
    initialAllocations.map((a) => ({ itemId: a.itemId, memberId: a.memberId, quantity: a.quantity || 1 }))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionStatus, setSessionStatus] = useState(session.status);
  const [showMembers, setShowMembers] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [showAccount, setShowAccount] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);
  const [shareModalConfig, setShareModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    text: string;
    memberId?: string;
  } | null>(null);


  // Hitung patungan member secara real-time di client
  const getMemberShareAmount = (memberId: string) => {
    const memberAllocations = allocations.filter((a) => a.memberId === memberId);
    let subtotal = 0;

    memberAllocations.forEach((alloc) => {
      const item = itemList.find((i) => i.id === alloc.itemId);
      if (item) {
        const itemAllocations = allocations.filter((x) => x.itemId === item.id);
        const totalAllocatedQty = itemAllocations.reduce((sum, x) => sum + x.quantity, 0);
        if (totalAllocatedQty > 0) {
          const sharePrice = Math.round((alloc.quantity / totalAllocatedQty) * Number(item.totalPrice));
          subtotal += sharePrice;
        }
      }
    });

    const totalSubtotal = itemList.reduce((acc, item) => {
      const hasAlloc = allocations.some((a) => a.itemId === item.id);
      return acc + (hasAlloc ? Number(item.totalPrice) : 0);
    }, 0);

    const taxAndTips = Number(session.taxAmount) + Number(session.tipAmount);
    const ratio = totalSubtotal > 0 ? taxAndTips / totalSubtotal : 0;
    const memberTaxAndTips = Math.round(subtotal * ratio);
    return subtotal + memberTaxAndTips;
  };

  const isInitialMount = useRef(true);

  // Debounced auto-save allocations ke DB (hanya berjalan saat ada perubahan pengguna)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const statusTimer = setTimeout(() => {
      setSaveStatus("saving");
    }, 0);

    const timer = setTimeout(async () => {
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

      try {
        const res = await saveAllocations(session.id, payload);
        if (res.success) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } catch (err) {
        console.error("Gagal auto-save:", err);
        setSaveStatus("error");
      }
    }, 800);

    return () => {
      clearTimeout(statusTimer);
      clearTimeout(timer);
    };
  }, [allocations, session.id]);

  // States untuk Rename Member
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState("");

  const handleRenameMember = async (memberId: string) => {
    const trimmed = editingMemberName.trim();
    if (!trimmed) {
      toast.error("Nama sohib jangan dikosongin ya!");
      return;
    }
    const prevMembers = members;
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, name: trimmed } : m))
    );
    setEditingMemberId(null);
    toast.success("Nama anggota berhasil diubah!");

    try {
      const res = await renameSessionMember(memberId, trimmed, session.id);
      if (!res.success) {
        setMembers(prevMembers);
        setError(res.error || "Gagal ganti nama sohib nih, coba lagi ya!");
        toast.error(res.error || "Gagal ganti nama sohib nih, coba lagi ya!");
      }
    } catch {
      setMembers(prevMembers);
      setError("Gagal ganti nama sohib nih, coba lagi ya!");
      toast.error("Gagal ganti nama sohib nih, coba lagi ya!");
    }
  };

  // States untuk Tambah Menu Manual
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemTotal, setNewItemTotal] = useState("");

  const handleNewItemQtyChange = (qty: string) => {
    setNewItemQty(qty);
    const q = parseFloat(qty) || 0;
    if (newItemPrice) {
      setNewItemTotal(String(q * Number(newItemPrice)));
    } else if (newItemTotal && q > 0) {
      setNewItemPrice(String(Math.round(Number(newItemTotal) / q)));
    }
  };

  const handleNewItemPriceChange = (price: string) => {
    setNewItemPrice(price);
    const q = parseFloat(newItemQty) || 0;
    if (price && q > 0) {
      setNewItemTotal(String(q * Number(price)));
    } else {
      setNewItemTotal("");
    }
  };

  const handleNewItemTotalChange = (total: string) => {
    setNewItemTotal(total);
    const q = parseFloat(newItemQty) || 0;
    if (total && q > 0) {
      setNewItemPrice(String(Math.round(Number(total) / q)));
    } else {
      setNewItemPrice("");
    }
  };

  // States untuk Edit Menu Inline
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQty, setEditItemQty] = useState("1");
  const [editItemPrice, setEditItemPrice] = useState("");
  const [editItemTotal, setEditItemTotal] = useState("");

  const handleEditItemQtyChange = (qty: string) => {
    setEditItemQty(qty);
    const q = parseFloat(qty) || 0;
    if (editItemPrice) {
      setEditItemTotal(String(q * Number(editItemPrice)));
    } else if (editItemTotal && q > 0) {
      setEditItemPrice(String(Math.round(Number(editItemTotal) / q)));
    }
  };

  const handleEditItemPriceChange = (price: string) => {
    setEditItemPrice(price);
    const q = parseFloat(editItemQty) || 0;
    if (price && q > 0) {
      setEditItemTotal(String(q * Number(price)));
    } else {
      setEditItemTotal("");
    }
  };

  const handleEditItemTotalChange = (total: string) => {
    setEditItemTotal(total);
    const q = parseFloat(editItemQty) || 0;
    if (total && q > 0) {
      setEditItemPrice(String(Math.round(Number(total) / q)));
    } else {
      setEditItemPrice("");
    }
  };

  const [addPriceMode, setAddPriceMode] = useState<"unit" | "total">("unit");
  const [editPriceMode, setEditPriceMode] = useState<"unit" | "total">("unit");

  const handleAddMember = async (e: React.SyntheticEvent) => {
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
    } else if (members.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Nama sohib ini udah ada di patungan, pake nama lain ya!");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const prevMembers = members;
    setMembers((prev) => [
      ...prev,
      { id: tempId, name, shareAmount: 0 },
    ]);
    setNewMemberName("");
    toast.success("Teman berhasil ditambahkan!");

    try {
      const res = await addSessionMember(session.id, name);
      if (res.success && res.member) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === tempId ? { id: res.member.id, name: res.member.name, shareAmount: 0 } : m
          )
        );
      } else {
        setMembers(prevMembers);
        setError(res.error || "Gagal nambahin nama sohib nih, coba lagi ya!");
        toast.error(res.error || "Gagal nambahin nama sohib nih, coba lagi ya!");
      }
    } catch (err) {
      console.log(err);
      setMembers(prevMembers);
      setError("Gagal nambahin nama sohib nih, coba lagi ya!");
      toast.error("Gagal nambahin nama sohib nih, coba lagi ya!");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const prevMembers = members;
    const prevAllocations = allocations;
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setAllocations((prev) => prev.filter((a) => a.memberId !== memberId));
    toast.success("Teman berhasil dihapus");

    try {
      const res = await removeSessionMember(memberId, session.id);
      if (!res.success) {
        setMembers(prevMembers);
        setAllocations(prevAllocations);
        setError(res.error || "Gagal ngehapus sohib dari patungan nih, coba lagi ya!");
        toast.error(res.error || "Gagal ngehapus sohib dari patungan nih, coba lagi ya!");
      }
    } catch (err) {
      console.log(err);
      setMembers(prevMembers);
      setAllocations(prevAllocations);
      setError("Gagal ngehapus sohib dari patungan nih, coba lagi ya!");
      toast.error("Gagal ngehapus sohib dari patungan nih, coba lagi ya!");
    }
  };

  const handleTogglePaid = async (memberId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const prevMembers = members;
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, isPaid: newStatus } : m))
    );
    const memberName = members.find((m) => m.id === memberId)?.name || "Sohib";
    toast.success(newStatus ? `${memberName} udah bayar, mantap!` : `Tandai ${memberName} belum bayar!`);

    try {
      const res = await toggleMemberPaidStatus(memberId, newStatus, session.id);
      if (!res.success) {
        setMembers(prevMembers);
        toast.error(res.error || "Gagal update status pembayaran sohib nih.");
      }
    } catch {
      setMembers(prevMembers);
      toast.error("Gagal update status pembayaran sohib nih.");
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

  // Bagi rata porsi menu ke semua anggota
  const handleSplitEqually = (itemId: string) => {
    if (members.length === 0) return;
    setAllocations((prev) => {
      const otherAllocs = prev.filter((a) => a.itemId !== itemId);
      const newAllocs = members.map((m) => ({
        itemId,
        memberId: m.id,
        quantity: 1,
      }));
      return [...otherAllocs, ...newAllocs];
    });
    toast.success("Menu berhasil dibagi rata ke semua sohib!");
  };

  // Reset alokasi porsi untuk satu menu
  const handleClearAllocations = (itemId: string) => {
    setAllocations((prev) => prev.filter((a) => a.itemId !== itemId));
    toast.success("Alokasi porsi menu ini di-reset!");
  };

  const handleCompleteSession = () => {
    setShowCompleteConfirm(true);
  };

  const handleConfirmCompleteSession = async () => {
    setShowCompleteConfirm(false);
    setLoading(true);
    try {
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

      // Simpan alokasi terakhir sebelum menyelesaikan sesi
      await saveAllocations(session.id, payload);

      const res = await completeBillSession(session.id);
      if (res.success) {
        sessionStorage.removeItem(`pete-pete-allocations-${session.id}`);
        toast.success("Bill PETE-PETE udah kelar, Bos!");
        setSessionStatus("COMPLETED");
        handleOpenAllSummaryShare();
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

  // Handler update status sesi ke CANCELLED atau DRAFT
  const handleUpdateStatus = async (newStatus: "CANCELLED" | "DRAFT") => {
    setLoading(true);
    try {
      const res = await updateBillSessionStatus(session.id, newStatus);
      if (res.success) {
        setSessionStatus(newStatus);
        const statusLabel =
          newStatus === "CANCELLED"
            ? "Bill berhasil DIBATALKAN!"
            : "Status bill diubah ke DRAFT!";
        toast.success(statusLabel);
      } else {
        setError(res.error || "Gagal mengubah status bill.");
        toast.error(res.error || "Gagal mengubah status bill.");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal mengubah status bill.");
      toast.error("Gagal mengubah status bill.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancelSession = async () => {
    setShowCancelConfirm(false);
    await handleUpdateStatus("CANCELLED");
  };


  // Tambah Item Manual
  const handleAddItem = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const cleanName = newItemName.trim();
    if (!cleanName) {
      toast.error("Nama menu makanannya jangan dikosongin ya, Bos!");
      return;
    }
    const unitPrice = Number(newItemPrice);
    if (!newItemPrice || isNaN(unitPrice) || unitPrice <= 0) {
      toast.error("Harganya jangan kosong atau nol ya, Bos!");
      return;
    }

    const qty = Number(newItemQty) || 1;
    const totalPrice = qty * unitPrice;
    const tempId = `temp-${Date.now()}`;
    const newItem: Item = {
      id: tempId,
      name: cleanName,
      quantity: qty,
      totalPrice,
    };

    const prevItems = itemList;
    setItemList((prev) => [...prev, newItem]);
    setShowAddForm(false);
    setNewItemName("");
    setNewItemQty("1");
    setNewItemPrice("");
    toast.success("Menu makanan berhasil ditambahkan!");

    try {
      const res = await addSessionItem(session.id, newItem.name, qty, unitPrice);
      if (res.success && res.item) {
        setItemList((prev) =>
          prev.map((i) =>
            i.id === tempId
              ? {
                id: res.item.id,
                name: res.item.name,
                quantity: res.item.quantity,
                totalPrice: Number(res.item.totalPrice),
              }
              : i
          )
        );
      } else {
        setItemList(prevItems);
        toast.error(res.error || "Gagal nambahin menu makanan nih, coba lagi ya!");
      }
    } catch (err) {
      console.log(err);
      setItemList(prevItems);
      toast.error("Gagal nambahin menu makanan nih, coba lagi ya!");
    }
  };

  // Hapus Item
  const handleDeleteItem = async (itemId: string) => {
    const prevItems = itemList;
    const prevAllocations = allocations;

    setItemList((prev) => prev.filter((i) => i.id !== itemId));
    setAllocations((prev) => prev.filter((a) => a.itemId !== itemId));
    setDeleteConfig(null);
    toast.success("Menu makanan berhasil dihapus");

    try {
      const res = await deleteSessionItem(itemId, session.id);
      if (!res.success) {
        setItemList(prevItems);
        setAllocations(prevAllocations);
        toast.error(res.error || "Gagal ngehapus menu makanan nih, coba lagi ya!");
      }
    } catch (err) {
      console.log(err);
      setItemList(prevItems);
      setAllocations(prevAllocations);
      toast.error("Gagal ngehapus menu makanan nih, coba lagi ya!");
    }
  };

  // Mulai Edit Item
  const startEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemQty(String(item.quantity));
    setEditItemPrice(String(Math.round(item.totalPrice / item.quantity)));
    setEditItemTotal(String(item.totalPrice));
  };

  // Simpan Perubahan Edit Item
  const handleUpdateItem = async (e: React.SyntheticEvent, itemId: string) => {
    e.preventDefault();
    const cleanName = editItemName.trim();
    if (!cleanName) {
      toast.error("Nama menu makanannya jangan dikosongin ya, Bos!");
      return;
    }
    const unitPrice = Number(editItemPrice);
    if (!editItemPrice || isNaN(unitPrice) || unitPrice <= 0) {
      toast.error("Harganya jangan kosong atau nol ya, Bos!");
      return;
    }

    const qty = Number(editItemQty) || 1;
    const totalPrice = qty * unitPrice;
    const prevItems = itemList;

    setItemList((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
            ...i,
            name: cleanName,
            quantity: qty,
            totalPrice,
          }
          : i
      )
    );
    setEditingItemId(null);
    toast.success("Menu makanan berhasil diperbarui!");

    try {
      const res = await updateSessionItem(itemId, session.id, cleanName, qty, unitPrice);
      if (!res.success) {
        setItemList(prevItems);
        toast.error(res.error || "Gagal nyimpen perubahan menu makanan nih, coba lagi ya!");
      }
    } catch (err) {
      console.log(err);
      setItemList(prevItems);
      toast.error("Gagal nyimpen perubahan menu makanan nih, coba lagi ya!");
    }
  };

  // Generate teks rincian pesanan satu anggota
  const generateMemberSummaryText = (member: Member) => {
    const memberAllocations = allocations.filter(a => a.memberId === member.id);

    let itemsText = "";
    let subtotal = 0;

    memberAllocations.forEach(alloc => {
      const item = itemList.find(i => i.id === alloc.itemId);
      if (item) {
        const itemAllocations = allocations.filter(x => x.itemId === item.id);
        const totalAllocatedQty = itemAllocations.reduce((sum, x) => sum + x.quantity, 0);
        const sharePrice = Math.round((alloc.quantity / totalAllocatedQty) * Number(item.totalPrice));
        subtotal += sharePrice;

        const portionLabel = alloc.quantity === totalAllocatedQty && totalAllocatedQty === 1
          ? ""
          : ` (${alloc.quantity}/${totalAllocatedQty} porsi)`;

        itemsText += `  • ${item.name}${portionLabel} ➔ Rp ${sharePrice.toLocaleString("id-ID")}\n`;
      }
    });

    const totalSubtotal = itemList.reduce((acc, item) => {
      const hasAlloc = allocations.some(a => a.itemId === item.id);
      return acc + (hasAlloc ? Number(item.totalPrice) : 0);
    }, 0);

    const taxAmount = Number(session.taxAmount) || 0;
    const tipAmount = Number(session.tipAmount) || 0;
    const taxAndTips = taxAmount + tipAmount;
    const memberTax = totalSubtotal > 0 ? Math.round(subtotal * (taxAmount / totalSubtotal)) : 0;
    const memberTips = totalSubtotal > 0 ? Math.round(subtotal * (tipAmount / totalSubtotal)) : 0;
    const memberTaxAndTips = memberTax + memberTips;
    const grandTotal = subtotal + memberTaxAndTips;

    let feeBreakdownText = "";
    if (taxAmount > 0) {
      const taxPercent = totalSubtotal > 0 ? ((taxAmount / totalSubtotal) * 100).toFixed(1).replace(/\.0$/, "") : "0";
      feeBreakdownText += `Pajak (${taxPercent}%): Rp ${memberTax.toLocaleString("id-ID")}\n`;
    }
    if (tipAmount > 0) {
      const tipPercent = totalSubtotal > 0 ? ((tipAmount / totalSubtotal) * 100).toFixed(1).replace(/\.0$/, "") : "0";
      feeBreakdownText += `Servis/Tip (${tipPercent}%): Rp ${memberTips.toLocaleString("id-ID")}\n`;
    }
    if (!feeBreakdownText && taxAndTips > 0) {
      feeBreakdownText = `Pajak & Servis: Rp ${memberTaxAndTips.toLocaleString("id-ID")}\n`;
    }

    const bankDetails = session.bankName
      ? `💳 *Info Pembayaran:*\nTransfer ke: ${session.bankName}\nNo. Rekening: ${session.bankAccount}\nA/N: ${session.bankOwner}`
      : "Silakan hubungi pembuat sesi untuk detail transfer.";

    const cleanTitle = session.title.replace(/^PETE-PETE\s+/i, "");

    const bonUrl = typeof window !== "undefined"
      ? `${window.location.origin}/bon/${session.inviteCode}?member=${member.id}`
      : `/bon/${session.inviteCode}?member=${member.id}`;

    return `🧾 *TAGIHAN PETE-PETE: ${cleanTitle}*
${session.merchantName ? `📍 Lokasi: ${session.merchantName}\n` : ""}Halo *${member.name}*, ini rincian tagihan lo:

🍽️ *Menu Pesanan:*
${itemsText || "  • Belum memilih menu makanan\n"}
───────────────────
Subtotal Pesanan: Rp ${subtotal.toLocaleString("id-ID")}
${feeBreakdownText}💰 *Total Tagihan: Rp ${grandTotal.toLocaleString("id-ID")}*

${bankDetails}

🔗 *Cek Bon & Konfirmasi Transfer:*
${bonUrl}

🙏 Ditunggu transferannya ya, Bos! Thank you.`;
  };

  // Generate teks rekap tagihan semua anggota untuk grup
  const generateAllSummaryText = () => {
    let allMembersShareText = "";

    const totalSubtotal = itemList.reduce((acc, item) => {
      const hasAlloc = allocations.some(a => a.itemId === item.id);
      return acc + (hasAlloc ? Number(item.totalPrice) : 0);
    }, 0);

    const taxAmount = Number(session.taxAmount) || 0;
    const tipAmount = Number(session.tipAmount) || 0;
    const taxAndTips = taxAmount + tipAmount;

    members.forEach((member) => {
      const memberAllocations = allocations.filter(a => a.memberId === member.id);
      let subtotal = 0;
      let memberItemsText = "";

      memberAllocations.forEach(alloc => {
        const item = itemList.find(i => i.id === alloc.itemId);
        if (item) {
          const itemAllocations = allocations.filter(x => x.itemId === item.id);
          const totalAllocatedQty = itemAllocations.reduce((sum, x) => sum + x.quantity, 0);
          const sharePrice = Math.round((alloc.quantity / totalAllocatedQty) * Number(item.totalPrice));
          subtotal += sharePrice;

          const portionLabel = alloc.quantity === totalAllocatedQty && totalAllocatedQty === 1
            ? ""
            : ` _(${alloc.quantity}/${totalAllocatedQty} porsi)_`;

          memberItemsText += `  • ${item.name}${portionLabel} ➔ Rp ${sharePrice.toLocaleString("id-ID")}\n`;
        }
      });

      const memberTax = totalSubtotal > 0 ? Math.round(subtotal * (taxAmount / totalSubtotal)) : 0;
      const memberTips = totalSubtotal > 0 ? Math.round(subtotal * (tipAmount / totalSubtotal)) : 0;
      const memberTaxAndTips = memberTax + memberTips;
      const grandTotal = subtotal + memberTaxAndTips;

      let memberFeeText = "";
      if (taxAmount > 0 && tipAmount > 0) {
        memberFeeText = `  _↳ Subtotal: Rp ${subtotal.toLocaleString("id-ID")} + Pajak: Rp ${memberTax.toLocaleString("id-ID")} + Servis: Rp ${memberTips.toLocaleString("id-ID")}_\n`;
      } else if (taxAndTips > 0) {
        memberFeeText = `  _↳ Subtotal: Rp ${subtotal.toLocaleString("id-ID")} + Pajak/Servis: Rp ${memberTaxAndTips.toLocaleString("id-ID")}_\n`;
      }

      allMembersShareText += `👤 *${member.name}* : *Rp ${grandTotal.toLocaleString("id-ID")}*\n${memberItemsText || "  • Belum pilih menu\n"}${memberFeeText}\n`;
    });

    let overallFeeText = `Subtotal Struk: Rp ${totalSubtotal.toLocaleString("id-ID")}\n`;
    if (taxAmount > 0) {
      const taxPercent = totalSubtotal > 0 ? ((taxAmount / totalSubtotal) * 100).toFixed(1).replace(/\.0$/, "") : "0";
      overallFeeText += `Pajak (${taxPercent}%): Rp ${taxAmount.toLocaleString("id-ID")}\n`;
    }
    if (tipAmount > 0) {
      const tipPercent = totalSubtotal > 0 ? ((tipAmount / totalSubtotal) * 100).toFixed(1).replace(/\.0$/, "") : "0";
      overallFeeText += `Servis/Tip (${tipPercent}%): Rp ${tipAmount.toLocaleString("id-ID")}\n`;
    }

    const bankDetails = session.bankName
      ? `💳 *Info Pembayaran:*\nTransfer ke: ${session.bankName}\nNo. Rekening: ${session.bankAccount}\nA/N: ${session.bankOwner}`
      : "Silakan hubungi pembuat sesi untuk detail transfer.";

    const cleanTitle = session.title.replace(/^PETE-PETE\s+/i, "");

    const bonUrl = typeof window !== "undefined"
      ? `${window.location.origin}/bon/${session.inviteCode}`
      : `/bon/${session.inviteCode}`;

    return `🧾 *REKAP TAGIHAN PETE-PETE: ${cleanTitle}*
${session.merchantName ? `📍 Lokasi: ${session.merchantName}\n` : ""}
📊 *Rincian Keseluruhan Bill:*
${overallFeeText}💰 Total Tagihan: *Rp ${session.totalAmount.toLocaleString("id-ID")}*
───────────────────
👥 *Rincian per Orang:*
${allMembersShareText}───────────────────
${bankDetails}

🔗 *Cek Bon & Rincian Lengkap Online:*
${bonUrl}

🙏 Ditunggu transferannya ya, Bos! Thank you.`;
  };

  // Menampilkan modal pilihan bagikan rincian pesanan satu anggota
  const handleOpenMemberSummaryShare = (member: Member) => {
    const text = generateMemberSummaryText(member);
    setShareModalConfig({
      isOpen: true,
      title: `Bagi Tagihan ${member.name}`,
      description: "Pilih mau salin rincian tagihan ke clipboard atau langsung gas ke WhatsApp, Bos!",
      text,
      memberId: member.id,
    });
  };

  // Menampilkan modal pilihan bagikan rekap seluruh anggota ke grup
  const handleOpenAllSummaryShare = () => {
    const text = generateAllSummaryText();
    setShareModalConfig({
      isOpen: true,
      title: "Bagi Rekap Tagihan Grup",
      description: "Mau salin seluruh rekap ke clipboard atau langsung lempar ke grup WhatsApp?",
      text,
    });
  };

  // Aksi eksekusi bagikan ke Clipboard
  const handleShareToClipboard = (text: string, memberId?: string) => {
    navigator.clipboard.writeText(text);
    if (memberId) {
      setCopiedId(memberId);
      setTimeout(() => setCopiedId(null), 2000);
    }
    if (!session.bankName || !session.bankAccount) {
      toast.warning("Rincian disalin, tapi info rekening bank lo belum diisi nih, Bos!");
    } else {
      toast.success("Rincian tagihan berhasil disalin ke clipboard!");
    }
    setShareModalConfig(null);
  };

  // Aksi eksekusi bagikan ke WhatsApp
  const handleShareToWhatsApp = (text: string) => {
    if (!session.bankName || !session.bankAccount) {
      toast.warning("Info rekening bank lo belum diisi nih di rincian!");
    }
    setShareModalConfig(null);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0 relative">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-3.5 sm:px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Button
            onPress={() => router.push("/tongkrongan")}
            color="primary"
            size="sm"
            aria-label="Kembali ke tongkrongan"
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-extrabold text-text wrap-break-word">{session.title}</h1>
            <div className="text-3xs text-text-300 flex items-center gap-1.5 mt-0.5">
              <span className="shrink-0">Kode: {session.inviteCode}</span>
              <span>•</span>
              <Badge
                color={
                  sessionStatus === "COMPLETED"
                    ? "success"
                    : sessionStatus === "CANCELLED"
                      ? "error"
                      : "gray"
                }
                size="sm"
                type="color"
                className="inline-flex font-semibold text-3xs py-0 px-1.5 shrink-0"
              >
                {sessionStatus === "COMPLETED"
                  ? "Kelar"
                  : sessionStatus === "CANCELLED"
                    ? "Dibatalkan"
                    : "Draft"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            href={`/pete-pete/${session.id}/items`}
            color="primary"
            className="px-2.5 py-1.5 text-xs transition-all active:scale-95 shrink-0"
          >
            Cek Struk
          </Button>
        </div>
      </header>

      {/* Body Content */}
      <div className="flex-1 p-3.5 space-y-3.5 flex flex-col overflow-hidden min-h-0">
        {error && (
          <div className="p-3 text-xs text-secondary-200 bg-secondary-900 border border-secondary-700 rounded-xl flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-secondary-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Detail Rekening Penerima */}
        {session.bankName && (
          <div className="p-2 px-3 rounded-lg border border-secondary-800 bg-secondary-950/40 text-xs flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1 text-text-200">
              <CreditCard01 className="w-3.5 h-3.5 text-primary-400 shrink-0" />
              <p className="wrap-break-word leading-tight" title={session.bankOwner ? `${session.bankName}: ${session.bankAccount} (A/N: ${session.bankOwner})` : undefined}>
                <span className="font-bold text-text-50">{session.bankName}</span>:{" "}
                {showAccount
                  ? session.bankAccount
                  : (session.bankAccount && session.bankAccount.length > 4
                    ? `••••${session.bankAccount.slice(-4)}`
                    : session.bankAccount)}{" "}
                <span className="text-2xs text-text-400 shrink-0">(A/N: {session.bankOwner})</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                onPress={() => setShowAccount(!showAccount)}
                color="secondary"
                size="xs"
                aria-label={showAccount ? "Sembunyikan nomor rekening" : "Tampilkan nomor rekening"}
                className="p-1.5 rounded-lg active:scale-95 transition-all flex items-center justify-center"
              >
                {showAccount ? (
                  <EyeOff className="w-3.5 h-3.5 text-primary-400" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-primary-400" />
                )}
              </Button>
              <Button
                onPress={() => {
                  if (session.bankAccount) {
                    const textToCopy = `${session.bankName}\nNo. Rek: ${session.bankAccount}\nA/N: ${session.bankOwner}`;
                    navigator.clipboard.writeText(textToCopy);
                    setCopiedAccount(true);
                    setTimeout(() => setCopiedAccount(false), 2000);
                    toast.success("Rekening udah disalin, Bos!");
                  }
                }}
                color="secondary"
                size="xs"
                aria-label="Salin nomor rekening"
                className="p-1.5 rounded-lg active:scale-95 transition-all flex items-center justify-center"
              >
                {copiedAccount ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy01 className="w-3.5 h-3.5 text-primary-400" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 1. Manajemen Anggota */}
        <div
          role="region"
          aria-label="Daftar anggota sesi"
          className="p-3 rounded-xl border border-secondary-800 bg-secondary-950/60 space-y-2.5 shrink-0 select-none"
        >
          <div
            role="button"
            tabIndex={0}
            aria-expanded={showMembers}
            aria-label={showMembers ? "Tutup daftar sohib" : "Buka daftar sohib"}
            onClick={() => setShowMembers(!showMembers)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowMembers(!showMembers);
              }
            }}
            className="flex items-center justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg p-1 -m-1"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Users01 className="w-4 h-4 text-text-300 shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-xs font-semibold text-text-100 tracking-wider wrap-break-word">{members.length} Sohib yang Join</span>
                  {saveStatus === "saving" && <span className="text-text-400 font-medium shrink-0"> <Dot color="primary" /> </span>}
                  {saveStatus === "saved" && <span className="text-emerald-500 font-medium shrink-0"> <Dot color="success" /> </span>}
                  {saveStatus === "error" && <span className="text-danger-500 font-medium shrink-0"> <Dot color="danger" /> </span>}
                </div>
                <span className="text-2xs text-text-400 wrap-break-word">Buka ini untuk lokit sohib lo</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <Button
                onPress={() => {
                  if (sessionStatus !== "COMPLETED") {
                    toast.warning("Kelarin dulu bill-nya sebelum bagi rekap ya, Bos!");
                    return;
                  }
                  handleOpenAllSummaryShare();
                }}
                color="secondary"
                size="xs"
                className={`px-2 py-1 text-2xs shrink-0 ${sessionStatus !== "COMPLETED" ? "opacity-60" : ""}`}
                iconLeading={Share07}
              >
                Bagikan Rekap
              </Button>
              <Button
                onPress={() => setShowMembers(!showMembers)}
                color="secondary"
                aria-label={showMembers ? "Tutup daftar anggota" : "Buka daftar anggota"}
                aria-expanded={showMembers}
                className="px-2 py-1 shrink-0"
              >
                {showMembers ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {showMembers && (
            <div onClick={(e) => e.stopPropagation()} className="space-y-2.5">
              <>
                {session.status !== "COMPLETED" && (
                  <form onSubmit={handleAddMember} className="flex gap-2">
                    <input
                      type="text"
                      aria-label="Nama sohib baru"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-text placeholder-text-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-xs outline-none transition-all"
                      placeholder="Ketik nama sohib lo..."
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

                <div className="space-y-2 max-h-30 overflow-y-auto pr-1 scrollbar-hide">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 px-3 rounded-xl bg-secondary-950/40 border border-secondary-800/80 hover:bg-secondary-950/60 transition-all"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <Avatar alt={member.name} size="sm" className="shadow-md border border-secondary-800" />
                        {editingMemberId === member.id ? (
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <input
                              type="text"
                              aria-label="Ubah nama sohib"
                              value={editingMemberName}
                              onChange={(e) => setEditingMemberName(e.target.value)}
                              className="px-2 py-1 rounded bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none flex-1 min-w-0"
                            />
                            <Button
                              onPress={() => setEditingMemberId(null)}
                              color="secondary"
                              size="xs"
                              className="text-xs"
                            >
                              Gak Jadi
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
                          <div className="flex flex-col min-w-0">
                            <p className="font-semibold text-text text-xs wrap-break-word">
                              {member.name} {member.userId === session.userId && <span className="text-3xs font-normal text-text-400">(Gua)</span>}
                            </p>
                            <p className="text-2xs text-primary-400 font-medium">
                              Patungan: Rp {getMemberShareAmount(member.id).toLocaleString("id-ID")}
                            </p>
                          </div>
                        )}
                      </div>

                      {editingMemberId !== member.id && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            onPress={() => handleTogglePaid(member.id, !!member.isPaid)}
                            color={!member.isPaid ? "primary" : "secondary"}
                            size="xs"
                            iconLeading={!member.isPaid ? Check : X}
                            className={`text-2xs font-bold tracking-wide transition-all duration-300 ${!member.isPaid
                              ? "shadow-sm shadow-emerald-950/20"
                              : "opacity-80 hover:opacity-100"
                              }`}
                          >
                            {!member.isPaid ? "Udah Bayar" : "Belum Bayar"}
                          </Button>
                          <Button
                            onPress={() => {
                              if (sessionStatus !== "COMPLETED") {
                                toast.warning("Kelarin dulu bill-nya sebelum bagi rincian ya, Bos!");
                                return;
                              }
                              handleOpenMemberSummaryShare(member);
                            }}
                            color="secondary"
                            size="xs"
                            aria-label={`Bagi rincian tagihan untuk ${member.name}`}
                            className={`p-1.5 rounded-lg active:scale-95 transition-all flex items-center justify-center ${sessionStatus !== "COMPLETED" ? "opacity-60" : ""}`}
                          >
                            {copiedId === member.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share07 className="w-3.5 h-3.5 text-primary-400" />}
                          </Button>
                          {member.userId !== session.userId && session.status !== "COMPLETED" && (
                            <>
                              <Button
                                onPress={() => {
                                  setEditingMemberId(member.id);
                                  setEditingMemberName(member.name);
                                }}
                                color="tertiary"
                                size="xs"
                                aria-label={`Ubah nama ${member.name}`}
                                className="p-1.5 rounded-lg active:scale-95 transition-all text-primary-400 hover:text-primary-300 flex items-center justify-center"
                              >
                                <Edit02 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                onPress={() => {
                                  setDeleteConfig({
                                    isOpen: true,
                                    title: "Hapus Sohib?",
                                    description: `Beneran mau hapus ${member.name} dari pete-pete ini? Semua alokasi menu dia bakal diapus juga, lho.`,
                                    confirmText: "Hapus Teman",
                                    onConfirm: async () => {
                                      await handleRemoveMember(member.id);
                                      setDeleteConfig(null);
                                    },
                                  });
                                }}
                                color="tertiary"
                                size="xs"
                                aria-label={`Hapus ${member.name}`}
                                className="p-1.5 rounded-lg active:scale-95 transition-all text-danger-400/80 hover:text-danger-400 flex items-center justify-center"
                              >
                                <Trash01 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            </div>
          )}
        </div>

        {/* 2. Papan Alokasi Item */}
        <div className="space-y-3 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5 min-w-0 flex-1">
              <h2 className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
                <Target01 className="w-4 h-4 text-text-300 shrink-0" />
                <span>Siapa Pesen Apa Nih?</span>
              </h2>
              <p className="text-2xs text-text-400 leading-normal">
                Klik avatar sohib lo buat bagi porsi makanannya, Bos!
              </p>
            </div>
            {session.status !== "COMPLETED" && (
              <Button
                onPress={() => setShowAddForm(!showAddForm)}
                color="secondary"
                size="xs"
                className="px-2.5 py-1 text-2xs shrink-0"
                iconLeading={showAddForm ? undefined : Plus}
              >
                {showAddForm ? "Gak Jadi" : "Tambah Menu"}
              </Button>
            )}
          </div>

          {/* Form Tambah Menu Manual */}
          {showAddForm && (
            <form onSubmit={handleAddItem} className="p-3.5 rounded-xl bg-secondary-950/60 border border-secondary-800 space-y-3">
              <h4 className="text-2xs font-bold text-text uppercase tracking-wider">Tambah Menu Baru</h4>

              <div className="space-y-2">
                <input
                  type="text"
                  required
                  aria-label="Nama menu baru"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                  placeholder="Nama Menu (misal: Nasi Goreng)"
                />

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-3xs text-text-400 uppercase font-bold">Jumlah (Qty)</label>
                    <input
                      type="text"
                      required
                      aria-label="Jumlah porsi menu baru"
                      value={newItemQty}
                      onChange={(e) => handleNewItemQtyChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-3xs text-text-400 uppercase font-bold">Tipe Harga</label>
                    <div className="grid grid-cols-2 gap-1 bg-secondary-950/80 p-1 rounded-xl border border-secondary-800/60 h-9 items-center">
                      <Button
                        type="button"
                        onPress={() => setAddPriceMode("unit")}
                        color={addPriceMode === "unit" ? "primary" : "tertiary"}
                        size="xs"
                        className="h-full text-2xs font-bold rounded-lg"
                      >
                        Satuan
                      </Button>
                      <Button
                        type="button"
                        onPress={() => setAddPriceMode("total")}
                        color={addPriceMode === "total" ? "primary" : "tertiary"}
                        size="xs"
                        className="h-full text-2xs font-bold rounded-lg"
                      >
                        Total
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-3xs text-text-400 uppercase font-bold">
                      {addPriceMode === "unit" ? "Harga Satuan" : "Harga Total"}
                    </label>
                    {addPriceMode === "unit" ? (
                      <input
                        type="text"
                        aria-label="Harga satuan menu baru"
                        value={formatRupiah(newItemPrice)}
                        onChange={(e) => handleNewItemPriceChange(parseRupiah(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                        placeholder="Rp Satuan"
                      />
                    ) : (
                      <input
                        type="text"
                        aria-label="Harga total menu baru"
                        value={formatRupiah(newItemTotal)}
                        onChange={(e) => handleNewItemTotalChange(parseRupiah(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                        placeholder="Rp Total"
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

          <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide min-h-0 pb-6">
            {itemList.map((item) => {
              const isEditing = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-secondary-950/60 border border-secondary-800 space-y-3 shadow-xs hover:border-secondary-700 transition-all"
                >
                  {isEditing ? (
                    // Form Edit Item Inline
                    <form onSubmit={(e) => handleUpdateItem(e, item.id)} className="space-y-3">
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          aria-label="Ubah nama menu"
                          value={editItemName}
                          onChange={(e) => setEditItemName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-3xs text-text-400 uppercase font-bold">Jumlah (Qty)</label>
                            <input
                              type="text"
                              required
                              aria-label="Ubah jumlah porsi menu"
                              value={editItemQty}
                              onChange={(e) => handleEditItemQtyChange(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
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
                                value={formatRupiah(editItemPrice)}
                                onChange={(e) => handleEditItemPriceChange(parseRupiah(e.target.value))}
                                className="w-full px-3 py-1.5 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                                placeholder="Rp Satuan"
                              />
                            ) : (
                              <input
                                type="text"
                                aria-label="Ubah harga total menu"
                                value={formatRupiah(editItemTotal)}
                                onChange={(e) => handleEditItemTotalChange(parseRupiah(e.target.value))}
                                className="w-full px-3 py-1.5 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                                placeholder="Rp Total"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end text-2xs">
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
                        const hasAllocations = totalAllocatedCount > 0;
                        const isExact = totalAllocatedCount === item.quantity;
                        const isUnder = totalAllocatedCount < item.quantity && totalAllocatedCount > 0;
                        const isOver = totalAllocatedCount > item.quantity;
                        const sharePerPortion = totalAllocatedCount > 0
                          ? Math.round(Number(item.totalPrice) / totalAllocatedCount)
                          : (item.quantity > 0 ? Math.round(Number(item.totalPrice) / item.quantity) : 0);

                        return (
                          <>
                            {/* Baris 1: Header Nama Menu & Harga */}
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-text text-sm leading-snug wrap-break-word" title={item.name}>
                                  {item.name}
                                </h4>
                                <p className="text-2xs text-text-400 mt-0.5 font-medium">
                                  {item.quantity} porsi {item.quantity > 0 && `(Rp ${Math.round(Number(item.totalPrice) / item.quantity).toLocaleString("id-ID")}/porsi)`}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-sm font-extrabold text-primary-400 whitespace-nowrap">
                                  Rp {Number(item.totalPrice).toLocaleString("id-ID")}
                                </span>
                                {session.status !== "COMPLETED" && (
                                  <div className="flex items-center gap-0.5 ml-1">
                                    <Button
                                      onPress={() => startEditItem(item)}
                                      color="tertiary"
                                      size="xs"
                                      aria-label={`Ubah menu ${item.name}`}
                                      className="p-1.5 min-w-7 min-h-7 rounded-lg active:scale-90 transition-transform duration-160 text-text-400 hover:text-primary-400 flex items-center justify-center"
                                    >
                                      <Edit02 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      onPress={() => {
                                        setDeleteConfig({
                                          isOpen: true,
                                          title: "Hapus Menu Makanan?",
                                          description: `Beneran mau hapus menu "${item.name}"? Porsi temen-temen lo buat menu ini bakal ikut kehapus.`,
                                          confirmText: "Hapus Menu",
                                          onConfirm: () => handleDeleteItem(item.id),
                                        });
                                      }}
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

                            {/* Baris 2: Status Alokasi & Tombol Aksi Cepat (Bagi Rata) */}
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

                              {session.status !== "COMPLETED" && (
                                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                                  <Button
                                    onPress={() => handleSplitEqually(item.id)}
                                    color="secondary"
                                    size="xs"
                                    iconLeading={Users01}
                                    className="px-2 py-1 text-3xs font-semibold rounded-lg active:scale-95 transition-transform duration-160"
                                  >
                                    Bagi ke Semua
                                  </Button>
                                  {hasAllocations && (
                                    <Button
                                      onPress={() => handleClearAllocations(item.id)}
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

                            {/* Baris 3: Avatar Pemilihan Anggota (Format Kompak & Rapat) */}
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
                                          onClick={() => handleIncreaseAllocation(item.id, member.id)}
                                          disabled={session.status === "COMPLETED"}
                                          aria-label={`Tambah porsi untuk ${member.name}`}
                                          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-full transition-transform active:scale-95 cursor-pointer min-w-10 min-h-10 sm:min-w-11 sm:min-h-11 flex items-center justify-center p-0.5"
                                        >
                                          <Avatar
                                            alt={member.name}
                                            size="md"
                                            className={`shadow-md transition-all duration-200 ${qty > 0 ? "ring-2 ring-primary border-primary scale-105" : "opacity-45 hover:opacity-80"}`}
                                          />
                                        </button>
                                        {qty > 0 && session.status !== "COMPLETED" && (
                                          <>
                                            {/* Minus Button on Top Left */}
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDecreaseAllocation(item.id, member.id);
                                              }}
                                              className="absolute -top-1 -left-1 z-10 bg-danger-600 hover:bg-danger-700 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md cursor-pointer border border-secondary-950 active:scale-90 transition-transform"
                                              title="Kurangi porsi"
                                              aria-label={`Kurangi porsi untuk ${member.name}`}
                                            >
                                              <Minus className="w-3 h-3 stroke-[3px]" />
                                            </button>
                                            {/* Quantity Badge on Top Right */}
                                            <span className="absolute -top-1 -right-1 z-10 bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-3xs font-bold shadow-md border border-secondary-950 pointer-events-none">
                                              {qty}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      <p
                                        className={`text-3xs sm:text-2xs truncate w-full text-center leading-tight font-semibold ${qty > 0 ? "text-text font-bold" : "text-text-400"}`}
                                        title={member.name}
                                      >
                                        {member.userId === session.userId ? "Gua" : member.name}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
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

      {/* Floating Bottom Actions (Mobile thumb friendly min 48px tap target) */}
      <div className="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-secondary-800 bg-secondary-950/95 backdrop-blur-md z-30">
        {sessionStatus === "COMPLETED" ? (
          <Button
            onPress={handleOpenAllSummaryShare}
            color="primary"
            className="w-full min-h-12 py-3.5 px-4 rounded-lg text-text-950 text-sm font-bold active:scale-[0.96] transition-transform"
            iconLeading={Share07}
          >
            Bagikan Rekap Tagihan Grup
          </Button>
        ) : sessionStatus === "CANCELLED" ? (
          <div className="flex gap-2">
            <Button
              onPress={() => handleUpdateStatus("DRAFT")}
              isDisabled={loading}
              isLoading={loading}
              color="primary"
              className="flex-1 min-h-12 py-3.5 px-4 rounded-lg text-sm font-bold active:scale-[0.96] transition-transform"
            >
              Buka Kembali Bill
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Button
              onPress={() => setShowCancelConfirm(true)}
              isDisabled={loading}
              color="secondary"
              className="min-h-12 py-3.5 px-4 rounded-lg text-xs font-semibold text-danger-300 hover:text-danger-400 hover:bg-danger-950/40 border-danger-800/60 active:scale-[0.96] transition-transform"
              iconLeading={XClose}
            >
              Batalin
            </Button>
            <Button
              onPress={handleCompleteSession}
              isDisabled={loading}
              isLoading={loading}
              className="flex-1 min-h-12 py-3.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-[0.96] transition-transform"
              iconLeading={Check}
            >
              Selesai
            </Button>
          </div>
        )}
      </div>
      {deleteConfig && (
        <DeleteConfirmation
          isOpen={deleteConfig.isOpen}
          onClose={() => setDeleteConfig(null)}
          onConfirm={deleteConfig.onConfirm}
          title={deleteConfig.title}
          description={deleteConfig.description}
          confirmText={deleteConfig.confirmText}
          isLoading={loading}
        />
      )}
      {showCancelConfirm && (
        <ConfirmationModal
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={handleConfirmCancelSession}
          title="Batalin Bill Pete-Pete?"
          description="Yakin mau ngebatalin sesi patungan ini, Bos? Statusnya bakal berubah jadi DIBATALKAN."
          confirmText="Batalin Bill"
          cancelText="Gak Jadi"
          color="error"
          icon={AlertTriangle}
          isLoading={loading}
        />
      )}
      {showCompleteConfirm && (
        <ConfirmationModal
          isOpen={showCompleteConfirm}
          onClose={() => setShowCompleteConfirm(false)}
          onConfirm={handleConfirmCompleteSession}
          title="Kelarin Bill Pete-Pete?"
          description="Yakin mau kelarin Bill PETE-PETE ini? Kalo udah selesai gak bisa diotak-atik lagi ya, Bos!"
          confirmText="Kelarin Aja"
          cancelText="Gak Jadi"
          color="warning"
          icon={AlertTriangle}
          isLoading={loading}
        />
      )}
      {shareModalConfig && (
        <ModalOverlay
          isOpen={shareModalConfig.isOpen}
          onOpenChange={() => setShareModalConfig(null)}
          className="fixed inset-0 z-50 flex min-h-dvh w-full items-end justify-center bg-overlay/70 outline-hidden backdrop-blur-[6px] sm:items-center sm:justify-center sm:px-8 pt-(--modal-pt) pb-(--modal-pb) [--modal-pb:clamp(16px,8vh,64px)] [--modal-pt:16px] sm:[--modal-pb:32px] sm:[--modal-pt:32px]"
        >
          <Modal className="w-full max-w-sm overflow-hidden bg-active text-text p-5 rounded-xl sm:rounded-2xl shadow-xl outline-hidden">
            <Dialog className="outline-hidden">
              {({ close }) => (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <FeaturedIcon
                      icon={Share07}
                      color="brand"
                      theme="modern"
                      size="md"
                      className="bg-primary-950 text-primary-500 border border-primary-800"
                    />
                    <div className="grid grid-cols-1">
                      <Heading slot="title" className="text-sm font-bold text-text">
                        {shareModalConfig.title}
                      </Heading>
                      <p className="text-xs text-text-400 leading-relaxed">
                        {shareModalConfig.description}
                      </p>
                    </div>
                    <Button
                      color="tertiary"
                      size="xs"
                      onPress={close}
                      aria-label="Tutup dialog"
                      className="text-text-400 hover:text-text"
                    >
                      <X />
                    </Button>
                  </div>

                  {(!session.bankName || !session.bankAccount) && (
                    <div className="p-2.5 rounded-xl bg-warning-950/60 border border-warning-800/80 flex items-start gap-2.5 text-warning-100 text-xs leading-snug">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-warning-400 mt-0.5" />
                      <span>Info rekening pembayaran belum lo atur, temen-temen lo bakal disuruh nanya manual detail transfernya.</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 w-full pt-1">
                    <Button
                      color="secondary"
                      size="sm"
                      iconLeading={Copy01}
                      className="w-full justify-center py-2.5 text-xs font-semibold"
                      onPress={() => handleShareToClipboard(shareModalConfig.text, shareModalConfig.memberId)}
                    >
                      Salin ke Clipboard
                    </Button>
                    <Button
                      color="primary"
                      size="sm"
                      iconLeading={MessageChatSquare}
                      className="w-full justify-center py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                      onPress={() => handleShareToWhatsApp(shareModalConfig.text)}
                    >
                      Kirim ke WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      )}
    </div>

  );
}
