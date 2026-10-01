"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
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
  toggleMemberPaidStatus,
} from "@/app/actions/session";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import {
  Plus,
  Check,
  ArrowLeft,
  AlertTriangle,
  Target01,
  CreditCard01,
  Eye,
  EyeOff,
  Copy01,
  Share07,
  XClose,
} from "@untitledui/icons";
import { useSessionStorageState } from "@/hooks/useSessionStorageState";

import { Member, Item, Allocation, SplitSessionData, ShareModalConfig } from "./types";
import { generateMemberSummaryText, generateAllSummaryText } from "./utils/summaryShare";
import SplitMemberList from "./components/SplitMemberList";
import SplitItemRow from "./components/SplitItemRow";
import SplitShareModal from "./components/SplitShareModal";

const DeleteConfirmation = dynamic(
  () => import("@/components/application/modals/DeleteConfirmation"),
  { ssr: false }
);
const ConfirmationModal = dynamic(
  () => import("@/components/application/modals/ConfirmationModal"),
  { ssr: false }
);
const DigitalReceiptModal = dynamic(
  () => import("@/components/application/modals/DigitalReceiptModal"),
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

interface SplitBoardProps {
  session: SplitSessionData;
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

  const [allocations, setAllocations] = useSessionStorageState<Allocation[]>(
    `pete-pete-allocations-${session.id}`,
    initialAllocations.map((a) => ({ itemId: a.itemId, memberId: a.memberId, quantity: a.quantity || 1 }))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionStatus, setSessionStatus] = useState(session.status);
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

  const [shareModalConfig, setShareModalConfig] = useState<ShareModalConfig | null>(null);
  const [receiptModalMember, setReceiptModalMember] = useState<Member | null>(null);

  // States form Tambah Menu Manual
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemTotal, setNewItemTotal] = useState("");
  const [addPriceMode, setAddPriceMode] = useState<"unit" | "total">("unit");

  const receiptModalData = useMemo(() => {
    if (!receiptModalMember) return null;
    const memberAllocations = allocations.filter((a) => a.memberId === receiptModalMember.id);
    const memberItems = memberAllocations
      .map((alloc) => {
        const item = itemList.find((i) => i.id === alloc.itemId);
        if (!item) return null;
        const itemAllocations = allocations.filter((x) => x.itemId === item.id);
        const totalAllocatedQty = itemAllocations.reduce((sum, x) => sum + x.quantity, 0);
        const cost = Math.round((alloc.quantity / totalAllocatedQty) * Number(item.totalPrice));
        return {
          id: item.id,
          name: item.name,
          portionCount: alloc.quantity,
          totalPortions: totalAllocatedQty,
          cost,
        };
      })
      .filter((x): x is { id: string; name: string; portionCount: number; totalPortions: number; cost: number } => x !== null);

    const subtotal = memberItems.reduce((acc, i) => acc + i.cost, 0);
    const totalSubtotal = itemList.reduce((acc, item) => {
      const hasAlloc = allocations.some((a) => a.itemId === item.id);
      return acc + (hasAlloc ? Number(item.totalPrice) : 0);
    }, 0);

    const taxAmount = Number(session.taxAmount) || 0;
    const tipAmount = Number(session.tipAmount) || 0;
    const discountAmount = Number(session.discountAmount) || 0;

    const tax = totalSubtotal > 0 ? Math.round(subtotal * (taxAmount / totalSubtotal)) : 0;
    const tip = totalSubtotal > 0 ? Math.round(subtotal * (tipAmount / totalSubtotal)) : 0;
    const discount = totalSubtotal > 0 ? Math.round(subtotal * (discountAmount / totalSubtotal)) : 0;
    const grandTotal = Math.max(0, subtotal + tax + tip - discount);

    const displayName =
      receiptModalMember.userId === session.userId
        ? session.bankOwner || "Gua"
        : receiptModalMember.name;

    return {
      title: session.title,
      merchantName: session.merchantName,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      inviteCode: session.inviteCode,
      memberName: displayName,
      isPaid: !!receiptModalMember.isPaid,
      items: memberItems,
      subtotal,
      tax,
      tip,
      discount,
      grandTotal,
      bankName: session.bankName,
      bankAccount: session.bankAccount,
      bankOwner: session.bankOwner,
    };
  }, [receiptModalMember, allocations, itemList, session]);

  // Hitung splitbill member secara real-time
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

    const taxAmount = Number(session.taxAmount) || 0;
    const tipAmount = Number(session.tipAmount) || 0;
    const discountAmount = Number(session.discountAmount) || 0;
    const adjustments = taxAmount + tipAmount - discountAmount;
    const ratio = totalSubtotal > 0 ? adjustments / totalSubtotal : 0;
    const memberAdjustment = Math.round(subtotal * ratio);
    return Math.max(0, subtotal + memberAdjustment);
  };

  const isInitialMount = useRef(true);

  // Debounced auto-save allocations ke DB
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

  // Manajemen Member
  const handleAddMember = async (nameInput: string) => {
    let name = nameInput.trim();
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
      toast.error("Nama sohib ini udah ada di splitbill, pake nama lain ya!");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const prevMembers = members;
    setMembers((prev) => [...prev, { id: tempId, name, shareAmount: 0 }]);
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
    } catch {
      setMembers(prevMembers);
      setError("Gagal nambahin nama sohib nih, coba lagi ya!");
      toast.error("Gagal nambahin nama sohib nih, coba lagi ya!");
    }
  };

  const handleRenameMember = async (memberId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Nama sohib jangan dikosongin ya!");
      return;
    }
    const prevMembers = members;
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, name: trimmed } : m)));
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

  const handleRemoveMember = async (memberId: string) => {
    const prevMembers = members;
    const prevAllocations = allocations;
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setAllocations((prev) => prev.filter((a) => a.memberId !== memberId));
    setDeleteConfig(null);
    toast.success("Teman berhasil dihapus");

    try {
      const res = await removeSessionMember(memberId, session.id);
      if (!res.success) {
        setMembers(prevMembers);
        setAllocations(prevAllocations);
        setError(res.error || "Gagal ngehapus sohib dari splitbill nih, coba lagi ya!");
        toast.error(res.error || "Gagal ngehapus sohib dari splitbill nih, coba lagi ya!");
      }
    } catch {
      setMembers(prevMembers);
      setAllocations(prevAllocations);
      setError("Gagal ngehapus sohib dari splitbill nih, coba lagi ya!");
      toast.error("Gagal ngehapus sohib dari splitbill nih, coba lagi ya!");
    }
  };

  const handleTogglePaid = async (memberId: string, currentPaid: boolean) => {
    const newStatus = !currentPaid;
    const prevMembers = members;
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, isPaid: newStatus } : m)));
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

  // Alokasi Porsi
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

  const handleClearAllocations = (itemId: string) => {
    setAllocations((prev) => prev.filter((a) => a.itemId !== itemId));
    toast.success("Alokasi porsi menu ini di-reset!");
  };

  // Status Sesi
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
    } catch {
      setError("Gagal menyelesaikan sesi.");
      toast.error("Gagal menyelesaikan sesi.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: "CANCELLED" | "DRAFT") => {
    setLoading(true);
    try {
      const res = await updateBillSessionStatus(session.id, newStatus);
      if (res.success) {
        setSessionStatus(newStatus);
        const statusLabel =
          newStatus === "CANCELLED" ? "Bill berhasil DIBATALKAN!" : "Status bill diubah ke DRAFT!";
        toast.success(statusLabel);
      } else {
        setError(res.error || "Gagal mengubah status bill.");
        toast.error(res.error || "Gagal mengubah status bill.");
      }
    } catch {
      setError("Gagal mengubah status bill.");
      toast.error("Gagal mengubah status bill.");
    } finally {
      setLoading(false);
    }
  };

  // Manajemen Item
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
    const newItem: Item = { id: tempId, name: cleanName, quantity: qty, totalPrice };

    const prevItems = itemList;
    setItemList((prev) => [...prev, newItem]);
    setShowAddForm(false);
    setNewItemName("");
    setNewItemQty("1");
    setNewItemPrice("");
    setNewItemTotal("");
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
    } catch {
      setItemList(prevItems);
      toast.error("Gagal nambahin menu makanan nih, coba lagi ya!");
    }
  };

  const handleUpdateItem = async (
    itemId: string,
    cleanName: string,
    qty: number,
    unitPrice: number
  ) => {
    if (!cleanName) {
      toast.error("Nama menu makanannya jangan dikosongin ya, Bos!");
      return;
    }
    if (unitPrice <= 0) {
      toast.error("Harganya jangan kosong atau nol ya, Bos!");
      return;
    }

    const totalPrice = qty * unitPrice;
    const prevItems = itemList;

    setItemList((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, name: cleanName, quantity: qty, totalPrice } : i))
    );
    toast.success("Menu makanan berhasil diperbarui!");

    try {
      const res = await updateSessionItem(itemId, session.id, cleanName, qty, unitPrice);
      if (!res.success) {
        setItemList(prevItems);
        toast.error(res.error || "Gagal nyimpen perubahan menu makanan nih, coba lagi ya!");
      }
    } catch {
      setItemList(prevItems);
      toast.error("Gagal nyimpen perubahan menu makanan nih, coba lagi ya!");
    }
  };

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
    } catch {
      setItemList(prevItems);
      setAllocations(prevAllocations);
      toast.error("Gagal ngehapus menu makanan nih, coba lagi ya!");
    }
  };

  // Share Actions
  const handleOpenMemberSummaryShare = (member: Member) => {
    const text = generateMemberSummaryText(member, allocations, itemList, session);
    setShareModalConfig({
      isOpen: true,
      title: `Bagi Tagihan ${member.name}`,
      description: "Pilih mau salin rincian tagihan ke clipboard atau langsung gas ke WhatsApp, Bos!",
      text,
      memberId: member.id,
    });
  };

  const handleOpenAllSummaryShare = () => {
    const text = generateAllSummaryText(members, allocations, itemList, session);
    setShareModalConfig({
      isOpen: true,
      title: "Bagi Rekap Tagihan Grup",
      description: "Mau salin seluruh rekap ke clipboard atau langsung lempar ke grup WhatsApp?",
      text,
    });
  };

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
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Button
            onPress={() => router.push("/tongkrongan")}
            color="primary"
            size="sm"
            aria-label="Kembali ke tongkrongan"
            className="min-w-11 min-h-11 p-2 rounded-lg active:scale-95 transition-all shrink-0 flex items-center justify-center cursor-pointer"
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
              <p
                className="wrap-break-word leading-tight"
                title={
                  session.bankOwner
                    ? `${session.bankName}: ${session.bankAccount} (A/N: ${session.bankOwner})`
                    : undefined
                }
              >
                <span className="font-bold text-text-50">{session.bankName}</span>:{" "}
                {showAccount
                  ? session.bankAccount
                  : session.bankAccount && session.bankAccount.length > 4
                  ? `••••${session.bankAccount.slice(-4)}`
                  : session.bankAccount}{" "}
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
        <SplitMemberList
          members={members}
          session={session}
          sessionStatus={sessionStatus}
          loading={loading}
          saveStatus={saveStatus}
          onAddMember={handleAddMember}
          onRenameMember={handleRenameMember}
          onDeleteMemberPrompt={(member) =>
            setDeleteConfig({
              isOpen: true,
              title: "Hapus Teman dari Sesi?",
              description: `Yakin mau ngapus ${member.name} dari splitbill ini, Bos? Semua porsi makanannya bakal dihapus juga.`,
              confirmText: "Hapus Aja",
              onConfirm: () => handleRemoveMember(member.id),
            })
          }
          onTogglePaid={handleTogglePaid}
          onOpenAllSummaryShare={handleOpenAllSummaryShare}
          onOpenMemberSummaryShare={handleOpenMemberSummaryShare}
          onOpenReceiptModal={(member) => setReceiptModalMember(member)}
          getMemberShareAmount={getMemberShareAmount}
          copiedId={copiedId}
        />

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
            <form
              onSubmit={handleAddItem}
              className="p-3.5 rounded-xl bg-secondary-950/60 border border-secondary-800 space-y-3"
            >
              <h4 className="text-2xs font-bold text-text uppercase tracking-wider">
                Tambah Menu Baru
              </h4>

              <div className="space-y-2">
                <label className="text-3xs text-text-400 uppercase font-bold">Nama Menu</label>
                <input
                  type="text"
                  required
                  aria-label="Nama menu baru"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
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
                      onChange={(e) => {
                        setNewItemQty(e.target.value);
                        const q = parseFloat(e.target.value) || 0;
                        if (newItemPrice) {
                          setNewItemTotal(String(q * Number(newItemPrice)));
                        } else if (newItemTotal && q > 0) {
                          setNewItemPrice(String(Math.round(Number(newItemTotal) / q)));
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
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
                        onChange={(e) => {
                          const p = parseRupiah(e.target.value);
                          setNewItemPrice(p);
                          const q = parseFloat(newItemQty) || 0;
                          setNewItemTotal(p && q > 0 ? String(q * Number(p)) : "");
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
                        placeholder="Rp Satuan"
                      />
                    ) : (
                      <input
                        type="text"
                        aria-label="Harga total menu baru"
                        value={formatRupiah(newItemTotal)}
                        onChange={(e) => {
                          const t = parseRupiah(e.target.value);
                          setNewItemTotal(t);
                          const q = parseFloat(newItemQty) || 0;
                          setNewItemPrice(t && q > 0 ? String(Math.round(Number(t) / q)) : "");
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
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
            {itemList.map((item) => (
              <SplitItemRow
                key={item.id}
                item={item}
                members={members}
                allocations={allocations}
                sessionStatus={sessionStatus}
                sessionUserId={session.userId}
                loading={loading}
                onIncreaseAllocation={handleIncreaseAllocation}
                onDecreaseAllocation={handleDecreaseAllocation}
                onSplitEqually={handleSplitEqually}
                onClearAllocations={handleClearAllocations}
                onUpdateItem={handleUpdateItem}
                onDeleteItemPrompt={(targetItem) =>
                  setDeleteConfig({
                    isOpen: true,
                    title: "Hapus Menu Makanan?",
                    description: `Yakin mau ngapus menu "${targetItem.name}" ini, Bos? Semua porsi splitbill-nya bakal hilang.`,
                    confirmText: "Hapus Aja",
                    onConfirm: () => handleDeleteItem(targetItem.id),
                  })
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Bottom Actions */}
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
              color="primary-destructive"
              className="min-h-12 py-3.5 px-4"
              iconLeading={XClose}
            >
              Batalin
            </Button>
            <Button
              onPress={() => setShowCompleteConfirm(true)}
              isDisabled={loading}
              isLoading={loading}
              className="flex-1 min-h-12 py-3.5"
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
          onConfirm={async () => {
            setShowCancelConfirm(false);
            await handleUpdateStatus("CANCELLED");
          }}
          title="Batalin Bill Pete-Pete?"
          description="Yakin mau ngebatalin sesi splitbill ini, Bos? Statusnya bakal berubah jadi DIBATALKAN."
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

      <SplitShareModal
        isOpen={!!shareModalConfig}
        onClose={() => setShareModalConfig(null)}
        config={shareModalConfig}
        session={session}
        onShareToClipboard={handleShareToClipboard}
        onShareToWhatsApp={handleShareToWhatsApp}
        onOpenReceiptModal={(memberId) => {
          const targetMember = members.find((m) => m.id === memberId);
          if (targetMember) {
            setReceiptModalMember(targetMember);
          }
          setShareModalConfig(null);
        }}
      />

      {receiptModalData && (
        <DigitalReceiptModal
          isOpen={!!receiptModalMember}
          onClose={() => setReceiptModalMember(null)}
          data={receiptModalData}
        />
      )}
    </div>
  );
}
