"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  addVacationMember,
  removeVacationMember,
  addVacationExpense,
  deleteVacationExpense,
  updateVacationExpense,
  renameVacationMember,
} from "@/app/actions/vacation";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import {
  Plus,
  ArrowLeft,
  Trash01,
  Coins01,
  Users01,
  CreditCard01,
  PlusCircle,
  Receipt,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Copy01,
  Edit02,
  Share07,
  MessageChatSquare,
  X,
  Calendar,
} from "@untitledui/icons";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { Heading } from "react-aria-components";
import { toast } from "sonner";
import { Input } from "@/components/base/input/input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

const DeleteConfirmation = dynamic(
  () => import("@/components/application/modals/DeleteConfirmation"),
  { ssr: false }
);

interface Member {
  id: string;
  name: string;
  userId?: string | null;
}

interface Share {
  memberId: string;
  memberName: string;
  amount: number;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  payerId: string;
  payerName: string;
  shares: Share[];
  createdAt: string;
}

interface VacationPlanDetailViewProps {
  userId: string;
  plan: {
    id: string;
    title: string;
    description: string;
    budget: number;
    date?: string;
    createdAt: string;
  };
  initialMembers: Member[];
  initialExpenses: Expense[];
}

const formatRupiah = (value: number | string): string => {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value);
  const cleaned = str.replace(/[^0-9]/g, "");
  if (!cleaned) {
    if (str === "0") return "Rp 0";
    return "";
  }
  const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${formatted}`;
};

const parseRupiah = (formatted: string): string => {
  if (!formatted) return "";
  return formatted.replace(/[^0-9]/g, "");
};

const formatDateString = (dateStr?: string) => {
  if (!dateStr) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const y = parts[0];
    const m = months[parseInt(parts[1], 10) - 1];
    const d = parseInt(parts[2], 10);
    return `${d} ${m} ${y}`;
  }
  return dateStr;
};

export default function VacationPlanDetailView({
  userId,
  plan,
  initialMembers,
  initialExpenses,
}: VacationPlanDetailViewProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const [loading, setLoading] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [showSettlements, setShowSettlements] = useState(true);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState("");

  // Add Expense Form States
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePayerId, setExpensePayerId] = useState(initialMembers[0]?.id || "");
  const [expenseParticipants, setExpenseParticipants] = useState<string[]>(
    initialMembers.map((m) => m.id)
  );

  // Delete modal state
  const [deleteConfig, setDeleteConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Share modal state
  const [shareModalConfig, setShareModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    text: string;
    memberId?: string;
  } | null>(null);

  // Client-only state to check owner from sessionStorage (SSR safe)
  const [isOwner, setIsOwner] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`pete-pete-vacation-owner-${plan.id}`) !== "false";
    }
    return true;
  });

  // Keep isOwner in sync if plan.id changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ownerStatus = sessionStorage.getItem(`pete-pete-vacation-owner-${plan.id}`) !== "false";
      Promise.resolve().then(() => {
        setIsOwner(ownerStatus);
      });
    }
  }, [plan.id]);

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

    if (members.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Nama sohib ini udah ada di tim!");
      return;
    }

    // Optimistic UI: tampilkan langsung seketika
    const tempId = `temp-${Date.now()}`;
    const optimisticMember: Member = {
      id: tempId,
      name,
      userId: null,
    };
    setMembers((prev) => [...prev, optimisticMember]);
    setExpenseParticipants((prev) => [...prev, tempId]);
    setNewMemberName("");
    toast.success("Sohib berhasil ditambahkan!");

    try {
      const res = await addVacationMember(plan.id, name);
      if (res.success && res.member) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, id: res.member.id, userId: res.member.userId }
              : m
          )
        );
        setExpenseParticipants((prev) =>
          prev.map((id) => (id === tempId ? res.member.id : id))
        );
      } else {
        setMembers((prev) => prev.filter((m) => m.id !== tempId));
        setExpenseParticipants((prev) => prev.filter((id) => id !== tempId));
        toast.error(res.error || "Gagal nambahin sohib");
      }
    } catch {
      setMembers((prev) => prev.filter((m) => m.id !== tempId));
      setExpenseParticipants((prev) => prev.filter((id) => id !== tempId));
      toast.error("Gagal nambahin sohib");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const prevMembers = members;
    const prevParticipants = expenseParticipants;
    const prevPayerId = expensePayerId;

    // Optimistic UI: hapus langsung dari state
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setExpenseParticipants((prev) => prev.filter((id) => id !== memberId));
    if (expensePayerId === memberId) {
      setExpensePayerId(members.find((m) => m.id !== memberId)?.id || "");
    }
    setDeleteConfig(null);
    toast.success("Sohib berhasil dikeluarkan dari tim");

    try {
      const res = await removeVacationMember(memberId, plan.id);
      if (!res.success) {
        setMembers(prevMembers);
        setExpenseParticipants(prevParticipants);
        setExpensePayerId(prevPayerId);
        toast.error(res.error || "Gagal ngeluarin sohib");
      }
    } catch {
      setMembers(prevMembers);
      setExpenseParticipants(prevParticipants);
      setExpensePayerId(prevPayerId);
      toast.error("Gagal ngeluarin sohib");
    }
  };

  const handleStartEdit = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setExpenseTitle(exp.title);
    setExpenseAmount(String(exp.amount));
    setExpensePayerId(exp.payerId);
    setExpenseParticipants(exp.shares.map((sh) => sh.memberId));
    setShowAddExpense(true);
  };

  const handleCloseModal = () => {
    setShowAddExpense(false);
    setEditingExpenseId(null);
    setExpenseTitle("");
    setExpenseAmount("");
    setExpensePayerId(members[0]?.id || "");
    setExpenseParticipants(members.map((m) => m.id));
  };

  const generateSettlementSummaryText = () => {
    if (transfers.length === 0) return "";

    const cleanTitle = plan.title.replace(/^PETE-PETE\s+/i, "");
    let text = `📢 *REKAP TRANSFER PETE-PETE: ${cleanTitle}*\n`;
    if (plan.description) {
      text += `📝 ${plan.description}\n`;
    }
    if (plan.date) {
      text += `📅 Tanggal: ${formatDateString(plan.date)}\n`;
    }
    text += `💰 Total Pengeluaran: ${formatRupiah(totalSpent)}\n`;
    text += `───────────────────\n`;
    text += `📋 *Rincian Transfer Antar Sohib:*\n`;
    transfers.forEach((t) => {
      text += `• *${t.from}* ➡️ transfer ke *${t.to}* : *${formatRupiah(t.amount)}*\n`;
    });
    text += `───────────────────\n`;
    text += `Ditunggu transferannya ya, Bos! Biar cepet lunas 🙏`;
    return text;
  };

  const handleOpenSettlementShare = () => {
    const text = generateSettlementSummaryText();
    if (!text) return;
    setShareModalConfig({
      isOpen: true,
      title: "Bagi Rekap Transfer Grup",
      description: "Mau salin seluruh rekap ke clipboard atau langsung lempar ke grup WhatsApp, Bos?",
      text,
    });
  };

  const generateMemberSummaryText = (member: Member) => {
    const balance = balances[member.id] || 0;

    // List of expenses they paid
    const paidExpenses = expenses.filter((e) => e.payerId === member.id);
    // List of expenses they participated in
    const joinedExpenses = expenses.filter((e) =>
      e.shares.some((s) => s.memberId === member.id)
    );

    const cleanTitle = plan.title.replace(/^PETE-PETE\s+/i, "");
    let text = `📢 *RINCIAN PETE-PETE: ${cleanTitle}*\n`;
    text += `Halo *${member.name}*, berikut rincian pete-pete lo:\n\n`;

    if (paidExpenses.length > 0) {
      text += `💸 *Pengeluaran yang Lo Talangin:*\n`;
      paidExpenses.forEach((e) => {
        text += `  • ${e.title}: ${formatRupiah(e.amount)}\n`;
      });
      text += `\n`;
    }

    if (joinedExpenses.length > 0) {
      text += `🤝 *Pengeluaran yang Lo Ikuti:*\n`;
      joinedExpenses.forEach((e) => {
        const share = e.shares.find((s) => s.memberId === member.id);
        if (share) {
          text += `  • ${e.title}: ${formatRupiah(share.amount)}\n`;
        }
      });
      text += `\n`;
    }

    text += `───────────────────\n`;
    if (balance < 0) {
      text += `🔴 *Status: Harus Bayar (Utang) ${formatRupiah(Math.abs(balance))}*\n\n`;
      text += `*Rincian Transfer Lo:*\n`;
      const myDebts = transfers.filter((t) => t.from === member.name);
      if (myDebts.length > 0) {
        myDebts.forEach((d) => {
          text += `  👉 Transfer ke *${d.to}*: *${formatRupiah(d.amount)}*\n`;
        });
      }
    } else if (balance > 0) {
      text += `🟢 *Status: Terima Uang (Piutang) ${formatRupiah(balance)}*\n\n`;
      text += `*Rincian Transfer ke Lo:*\n`;
      const myCredits = transfers.filter((t) => t.to === member.name);
      if (myCredits.length > 0) {
        myCredits.forEach((c) => {
          text += `  👈 Dari *${c.from}*: *${formatRupiah(c.amount)}*\n`;
        });
      }
    } else {
      text += `✅ *Status: LUNAS* 🎉\n`;
    }
    text += `───────────────────\n`;
    text += `Ditunggu transferannya ya, Bos! Thank you 🙏`;
    return text;
  };

  const handleOpenMemberSummaryShare = (member: Member) => {
    const text = generateMemberSummaryText(member);
    setShareModalConfig({
      isOpen: true,
      title: `Bagi Tagihan ${member.name}`,
      description: "Pilih mau salin rincian pete-pete ke clipboard atau langsung gas ke WhatsApp, Bos!",
      text,
      memberId: member.id,
    });
  };

  const handleShareToClipboard = (text: string, memberId?: string) => {
    navigator.clipboard.writeText(text);
    if (memberId) {
      setCopiedId(memberId);
      setTimeout(() => setCopiedId(null), 2000);
    }
    toast.success("Rincian pete-pete berhasil disalin ke clipboard!");
    setShareModalConfig(null);
  };

  const handleShareToWhatsApp = (text: string) => {
    setShareModalConfig(null);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleRenameMember = async (memberId: string) => {
    if (!editingMemberName.trim()) {
      toast.error("Nama sohib ga boleh kosong!");
      return;
    }

    if (members.some((m) => m.id !== memberId && m.name.toLowerCase() === editingMemberName.trim().toLowerCase())) {
      toast.error("Nama sohib ini udah ada di tim!");
      return;
    }

    setLoading(true);
    try {
      const res = await renameVacationMember(memberId, plan.id, editingMemberName.trim());
      if (res.success) {
        toast.success("Nama sohib berhasil diubah!");
        setMembers(
          members.map((m) =>
            m.id === memberId ? { ...m, name: editingMemberName.trim() } : m
          )
        );
        setEditingMemberId(null);
      } else {
        toast.error(res.error || "Gagal mengubah nama sohib");
      }
    } catch {
      toast.error("Gagal mengubah nama sohib");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim()) {
      toast.error("Nama pengeluaran ga boleh kosong!");
      return;
    }

    const amt = Number(parseRupiah(expenseAmount));
    if (!amt || amt <= 0) {
      toast.error("Nominal pengeluaran harus lebih besar dari 0!");
      return;
    }

    if (!expensePayerId) {
      toast.error("Pilih siapa yang bayar dulu, Bos!");
      return;
    }

    if (expenseParticipants.length === 0) {
      toast.error("Minimal harus ada 1 orang yang ikutan patungan!");
      return;
    }

    const payerName = members.find((m) => m.id === expensePayerId)?.name || "Sohib";
    const shareAmount = Math.round(amt / expenseParticipants.length);
    const shares: Share[] = expenseParticipants.map((mId) => ({
      memberId: mId,
      memberName: members.find((m) => m.id === mId)?.name || "Sohib",
      amount: shareAmount,
    }));

    const prevExpenses = expenses;
    const isEdit = !!editingExpenseId;
    const currentEditId = editingExpenseId;
    const tempId = `temp-${Date.now()}`;

    // Optimistic UI: langsung tampilkan di list & kalkulasi ulang seketika
    if (isEdit && currentEditId) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === currentEditId
            ? {
                ...e,
                title: expenseTitle.trim(),
                amount: amt,
                payerId: expensePayerId,
                payerName,
                shares,
              }
            : e
        )
      );
    } else {
      const newExp: Expense = {
        id: tempId,
        title: expenseTitle.trim(),
        amount: amt,
        payerId: expensePayerId,
        payerName,
        createdAt: new Date().toISOString(),
        shares,
      };
      setExpenses((prev) => [newExp, ...prev]);
    }

    handleCloseModal();
    toast.success(isEdit ? "Biaya pengeluaran berhasil diubah!" : "Biaya pengeluaran berhasil dicatat!");

    try {
      if (isEdit && currentEditId) {
        const res = await updateVacationExpense(currentEditId, plan.id, {
          title: expenseTitle.trim(),
          amount: amt,
          payerId: expensePayerId,
          memberIds: expenseParticipants,
        });
        if (!res.success) {
          setExpenses(prevExpenses);
          toast.error(res.error || "Gagal menyimpan pengeluaran");
        }
      } else {
        const res = await addVacationExpense(plan.id, {
          title: expenseTitle.trim(),
          amount: amt,
          payerId: expensePayerId,
          memberIds: expenseParticipants,
        });
        if (res.success && res.expenseId) {
          setExpenses((prev) =>
            prev.map((e) => (e.id === tempId ? { ...e, id: res.expenseId! } : e))
          );
        } else if (!res.success) {
          setExpenses(prevExpenses);
          toast.error(res.error || "Gagal menyimpan pengeluaran");
        }
      }
    } catch {
      setExpenses(prevExpenses);
      toast.error("Gagal menyimpan pengeluaran");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const prevExpenses = expenses;

    // Optimistic UI: hapus langsung seketika
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    setDeleteConfig(null);
    toast.success("Pengeluaran berhasil dihapus!");

    try {
      const res = await deleteVacationExpense(expenseId, plan.id);
      if (!res.success) {
        setExpenses(prevExpenses);
        toast.error(res.error || "Gagal menghapus pengeluaran");
      }
    } catch {
      setExpenses(prevExpenses);
      toast.error("Gagal menghapus pengeluaran");
    }
  };

  const handleToggleParticipant = (memberId: string) => {
    if (expenseParticipants.includes(memberId)) {
      setExpenseParticipants(expenseParticipants.filter((id) => id !== memberId));
    } else {
      setExpenseParticipants([...expenseParticipants, memberId]);
    }
  };

  // --- Patungan / Settlement Calculation Algorithm ---
  const calculateSettlements = () => {
    // 1. Initialize balances for each member
    const balances: { [memberId: string]: number } = {};
    members.forEach((m) => {
      balances[m.id] = 0;
    });

    // 2. Add payer amounts and subtract shares
    expenses.forEach((exp) => {
      // Payer gets back the amount they paid
      if (balances[exp.payerId] !== undefined) {
        balances[exp.payerId] += exp.amount;
      }
      // Participants owe their share
      exp.shares.forEach((share) => {
        if (balances[share.memberId] !== undefined) {
          balances[share.memberId] -= share.amount;
        }
      });
    });

    // 3. Separate into debtors and creditors
    const debtors: { memberId: string; name: string; balance: number }[] = [];
    const creditors: { memberId: string; name: string; balance: number }[] = [];

    members.forEach((m) => {
      const bal = balances[m.id];
      if (bal < -1) {
        debtors.push({ memberId: m.id, name: m.name, balance: bal });
      } else if (bal > 1) {
        creditors.push({ memberId: m.id, name: m.name, balance: bal });
      }
    });

    // Sort: debtors ascending (most negative first), creditors descending (most positive first)
    debtors.sort((a, b) => a.balance - b.balance);
    creditors.sort((a, b) => b.balance - a.balance);

    // 4. Match debtors and creditors to find minimal transfers
    const transfers: {
      from: string;
      to: string;
      fromMemberId: string;
      toMemberId: string;
      amount: number;
    }[] = [];

    let dIdx = 0;
    let cIdx = 0;

    // Work with copies of balances to prevent mutating local states
    const localDebtors = debtors.map((d) => ({ ...d }));
    const localCreditors = creditors.map((c) => ({ ...c }));

    while (dIdx < localDebtors.length && cIdx < localCreditors.length) {
      const debtor = localDebtors[dIdx];
      const creditor = localCreditors[cIdx];

      const owes = Math.abs(debtor.balance);
      const isOwed = creditor.balance;

      const transferAmount = Math.min(owes, isOwed);

      transfers.push({
        from: debtor.name,
        to: creditor.name,
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: Math.round(transferAmount),
      });

      debtor.balance += transferAmount;
      creditor.balance -= transferAmount;

      if (Math.abs(debtor.balance) < 1) {
        dIdx++;
      }
      if (creditor.balance < 1) {
        cIdx++;
      }
    }

    return { balances, transfers };
  };

  const { balances, transfers } = calculateSettlements();
  const totalBudget = plan.budget;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background text-text overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onPress={() => router.push("/agenda")}
            color="primary"
            size="sm"
            aria-label="Kembali ke daftar agenda"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-extrabold text-text line-clamp-1">{plan.title}</h1>
            <p className="text-[10px] text-text-300 flex items-center gap-1.5 flex-wrap">
              <span>{plan.description || "Pete-Pete Seru & Kumpul Bareng"}</span>
              {plan.date && (
                <>
                  <span className="text-text-500">•</span>
                  <span className="text-primary-400 font-bold inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateString(plan.date)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </header>

      {/* Main layout wrapper */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3.5 min-h-0">
        {/* Info Summary */}
        <div className="p-4 rounded-xl border border-secondary-800 bg-secondary-950/15 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] text-text-400 font-bold uppercase tracking-wider">Total Pengeluaran Kelompok</p>
            <p className="text-lg font-black text-text-50 mt-0.5">{formatRupiah(totalSpent)}</p>
          </div>
          <div className="p-2 bg-text-900 border border-secondary-800 rounded-lg">
            <Coins01 className="w-5 h-5 text-text-500" />
          </div>
        </div>

        {/* 1. TIM SOHIB (Vacation Members) */}
        <div className={`p-3.5 rounded-2xl border border-secondary-800 bg-secondary-950/60 flex flex-col gap-3 overflow-hidden transition-all ${showMembers ? "flex-1 min-h-0" : "shrink-0"}`}>
          <div
            role="button"
            tabIndex={0}
            aria-expanded={showMembers}
            onClick={() => setShowMembers(!showMembers)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowMembers(!showMembers);
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none shrink-0"
          >
            <div className="flex items-center gap-2">
              <FeaturedIcon icon={Users01} size="sm" color="brand" theme="modern" />
              <div>
                <h2 className="text-xs font-bold text-text-50">Sohib yang Join</h2>
                <p className="text-[10px] text-text-400">{members.length} Sohib Terdaftar</p>
              </div>
            </div>
            <Button
              onPress={() => setShowMembers(!showMembers)}
              color="secondary"
              className="px-2 py-1"
              aria-label={showMembers ? "Tutup daftar sohib" : "Buka daftar sohib"}
            >
              {showMembers ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </Button>
          </div>

          {showMembers && (
            <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
              {/* Add member inline form */}
              {isOwner && (
                <form onSubmit={handleAddMember} className="flex gap-2 items-center shrink-0">
                  <div className="flex-1">
                    <Input
                      placeholder="Ketik nama sohib lo..."
                      value={newMemberName}
                      onChange={(val) => setNewMemberName(val)}
                      size="sm"
                      icon={Users01}
                    />
                  </div>
                  <Button
                    type="submit"
                    isDisabled={loading || !newMemberName.trim()}
                    isLoading={loading}
                    size="sm"
                    color="primary"
                    iconLeading={Plus}
                    className="shrink-0"
                  >
                    Tambahin
                  </Button>
                </form>
              )}

              {/* Members list */}
              {members.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-secondary-800 bg-secondary-950/10 flex items-center justify-center text-center">
                  <p className="text-[11px] text-text-400">Belum ada sohib yang didaftarin nih, tambahin di atas ya!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 scrollbar-hide min-h-0">
                  {members.map((member) => {
                    const balance = balances[member.id] || 0;
                    const isMe = member.userId === userId;
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-secondary-950/40 border border-secondary-800/80 hover:bg-secondary-950/60 hover:border-secondary-700/80 transition-all shrink-0 gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Avatar alt={member.name} size="sm" className="shadow-xs border border-secondary-800 shrink-0" />
                          {editingMemberId === member.id ? (
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <input
                                type="text"
                                value={editingMemberName}
                                onChange={(e) => setEditingMemberName(e.target.value)}
                                className="flex-1 px-2.5 py-1 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                                autoFocus
                              />
                              <Button
                                onPress={() => setEditingMemberId(null)}
                                color="secondary"
                                size="xs"
                                className="h-7 text-[10px]"
                              >
                                Gak Jadi
                              </Button>
                              <Button
                                onPress={() => handleRenameMember(member.id)}
                                color="primary"
                                size="xs"
                                className="h-7 text-[10px]"
                              >
                                Simpan
                              </Button>
                            </div>
                          ) : (
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-semibold text-text-50 text-xs truncate">
                                  {member.name}
                                </p>
                                {isMe && (
                                  <Badge
                                    color="brand"
                                    size="sm"
                                    type="pill-color"
                                    className="text-[9px] px-1.5 py-0 font-medium"
                                  >
                                    Gua
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                {balance < 0 ? (
                                  <Badge
                                    color="error"
                                    size="sm"
                                    type="pill-color"
                                    className="text-[10px] font-semibold px-2 py-0.5"
                                  >
                                    Utang: {formatRupiah(Math.abs(balance))}
                                  </Badge>
                                ) : balance > 0 ? (
                                  <Badge
                                    color="success"
                                    size="sm"
                                    type="pill-color"
                                    className="text-[10px] font-semibold px-2 py-0.5"
                                  >
                                    Piutang: {formatRupiah(balance)}
                                  </Badge>
                                ) : (
                                  <Badge
                                    color="gray"
                                    size="sm"
                                    type="pill-color"
                                    className="text-[10px] font-medium px-2 py-0.5"
                                  >
                                    Lunas
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {editingMemberId !== member.id && (
                            <>
                              <Button
                                onPress={() => handleOpenMemberSummaryShare(member)}
                                color="secondary"
                                size="xs"
                                aria-label={`Bagikan rincian tagihan ${member.name}`}
                                className="h-8 w-8 p-0 rounded-lg flex items-center justify-center shrink-0"
                              >
                                {copiedId === member.id ? (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Share07 className="w-4 h-4 text-text-400" />
                                )}
                              </Button>

                              <Button
                                onPress={() => {
                                  setEditingMemberId(member.id);
                                  setEditingMemberName(member.name);
                                }}
                                color="secondary"
                                size="xs"
                                aria-label={`Ubah nama ${member.name}`}
                                className="h-8 w-8 p-0 rounded-lg flex items-center justify-center shrink-0"
                              >
                                <Edit02 className="w-4 h-4 text-text-400" />
                              </Button>

                              {!isMe && (
                                <Button
                                  onPress={() => {
                                    setDeleteConfig({
                                      isOpen: true,
                                      title: "Hapus Sohib Dari Tim?",
                                      description: `Beneran mau hapus "${member.name}"? Semua catatan pengeluaran & pete-pete dia di plan ini bakal ilang, lho.`,
                                      confirmText: "Hapus",
                                      onConfirm: () => handleRemoveMember(member.id),
                                    });
                                  }}
                                  color="secondary-destructive"
                                  size="xs"
                                  aria-label={`Hapus ${member.name} dari tim`}
                                  className="h-8 w-8 p-0 rounded-lg flex items-center justify-center shrink-0"
                                >
                                  <Trash01 className="w-4 h-4 text-danger-400" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. DAFTAR BIAYA / PENGELUARAN */}
        <div className={`p-3.5 rounded-2xl border border-secondary-800 bg-secondary-950/60 flex flex-col gap-3 overflow-hidden transition-all ${showExpenses ? "flex-1 min-h-0" : "shrink-0"}`}>
          <div
            role="button"
            tabIndex={0}
            aria-expanded={showExpenses}
            onClick={() => setShowExpenses(!showExpenses)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowExpenses(!showExpenses);
              }
            }}
            className="flex justify-between items-center cursor-pointer select-none shrink-0"
          >
            <div className="flex items-center gap-2">
              <FeaturedIcon icon={Receipt} size="sm" color="success" theme="modern" />
              <div>
                <h2 className="text-xs font-bold text-text-50">Daftar Pengeluaran</h2>
                <p className="text-[10px] text-text-400">{expenses.length} Biaya Tercatat</p>
              </div>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {members.length > 0 && (
                <Button
                  onPress={() => setShowAddExpense(true)}
                  color="secondary"
                  size="xs"
                  className="font-bold"
                  iconLeading={PlusCircle}
                >
                  Catat Biaya
                </Button>
              )}
              <Button
                onPress={() => setShowExpenses(!showExpenses)}
                color="secondary"
                className="px-2 py-1"
                aria-label={showExpenses ? "Tutup daftar pengeluaran" : "Buka daftar pengeluaran"}
              >
                {showExpenses ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {showExpenses && (
            expenses.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-secondary-800 bg-secondary-950/10 flex flex-col items-center justify-center text-center gap-1.5 shrink-0">
                <p className="text-[10px] text-text-400">Belum ada catatan pengeluaran kumpul-kumpul.</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-hide min-h-0">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-xl bg-text-900 border border-secondary-800 flex justify-between items-start gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div>
                        <p className="text-xs font-bold text-text-50 truncate">{exp.title}</p>
                        <p className="text-[10px] text-text-400">
                          Dibayar oleh: <span className="font-semibold text-text-300">{exp.payerName}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {exp.shares.map((sh) => (
                  <Badge
                    key={sh.memberId}
                    color="gray"
                    size="sm"
                    type="color"
                    className="flex items-center gap-1 text-[10px] font-semibold"
                  >
                    <Avatar alt={sh.memberName} size="xs" className="h-4 w-4 min-w-[16px]" />
                    {sh.memberName} ({formatRupiah(sh.amount)})
                  </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-xs font-black text-text-50">
                        {formatRupiah(exp.amount)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          onPress={() => handleStartEdit(exp)}
                          color="tertiary"
                          size="xs"
                          aria-label={`Edit ${exp.title}`}
                          className="p-1 rounded-lg text-primary-400/80 hover:text-primary-400 flex items-center justify-center"
                        >
                          <Edit02 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          onPress={() => {
                            setDeleteConfig({
                              isOpen: true,
                              title: "Hapus Biaya Pengeluaran?",
                              description: `Beneran mau hapus biaya "${exp.title}" sebesar ${formatRupiah(exp.amount)}? Perhitungan pete-pete plan bakal berubah otomatis.`,
                              confirmText: "Hapus Pengeluaran",
                              onConfirm: () => handleDeleteExpense(exp.id),
                            });
                          }}
                          color="tertiary"
                          size="xs"
                          aria-label={`Hapus ${exp.title}`}
                          className="p-1 rounded-lg text-danger-400/80 hover:text-danger-400 flex items-center justify-center"
                        >
                          <Trash01 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* 3. RINGKASAN SETTLEMENT (Who owes whom) */}
        <div className={`p-3.5 rounded-2xl border border-secondary-800 bg-secondary-950/60 flex flex-col gap-3 overflow-hidden transition-all ${showSettlements ? "flex-1 min-h-0" : "shrink-0"}`}>
          <div
            role="button"
            tabIndex={0}
            aria-expanded={showSettlements}
            onClick={() => setShowSettlements(!showSettlements)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowSettlements(!showSettlements);
              }
            }}
            className="flex justify-between items-center cursor-pointer select-none shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <FeaturedIcon icon={CreditCard01} size="sm" color="brand" theme="modern" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-text-50">Hasil Akhir / Transfer Patungan</h2>
                </div>
                <div>
                  {transfers.length > 0 ? (
                    <div className="flex items-center gap-2 text-[11px] text-text-400">
                      {transfers.length} transfer patungan tercatat
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[11px] text-text-400">
                      <p className="font-semibold">Tidak ada transfer patungan</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {transfers.length > 0 && (
                <Button
                  onPress={handleOpenSettlementShare}
                  color="secondary"
                  size="xs"
                  className="font-bold flex items-center gap-1"
                  iconLeading={Share07}
                >
                  Share WA
                </Button>
              )}
              <Button
                onPress={() => setShowSettlements(!showSettlements)}
                color="secondary"
                className="px-2 py-1"
                aria-label={showSettlements ? "Tutup hasil akhir patungan" : "Buka hasil akhir patungan"}
              >
                {showSettlements ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {showSettlements && (
            transfers.length === 0 ? (
              <div className="p-4 rounded-xl border border-secondary-800 bg-secondary-950/10 flex items-center justify-center gap-2 text-center shrink-0">
                <p className="text-[10px] text-text-400">
                  Semua aman! Tidak ada utang-piutang transfer yang perlu diselesaikan.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 scrollbar-hide min-h-0">
              {transfers.map((t, idx) => {
                const fromMember = members.find((m) => m.id === t.fromMemberId || m.name === t.from);
                const toMember = members.find((m) => m.id === t.toMemberId || m.name === t.to);
                const isFromMe = fromMember?.userId === userId;
                const isToMe = toMember?.userId === userId;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border transition-all flex flex-col gap-2.5 ${isFromMe
                      ? "border-rose-900/60 bg-rose-950/15"
                      : isToMe
                        ? "border-primary-800/60 bg-primary-950/15"
                        : "border-secondary-800 bg-secondary-950/40"
                      }`}
                  >
                    {/* Status badge when current user is involved */}
                    {(isFromMe || isToMe) && (
                      <div className="flex items-center justify-between">
                        <Badge
                          color={isFromMe ? "error" : "success"}
                          size="sm"
                          type="color"
                          className="text-[9px] font-bold inline-flex items-center gap-1"
                        >
                          {isFromMe ? "Lo Harus Transfer" : "Lo Bakal Terima Uang"}
                        </Badge>
                      </div>
                    )}

                    {/* Transfer visual flow with Avatars */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Payer (From) */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Avatar
                          alt={t.from}
                          size="sm"
                          className={`shadow-md border shrink-0 ${isFromMe
                            ? "border-rose-500/70 ring-1 ring-rose-500/50"
                            : "border-secondary-800"
                            }`}
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-text-50 truncate flex items-center gap-1">
                            {t.from}
                            {isFromMe && <span className="text-[9px] font-normal text-danger-400">(Gua)</span>}
                          </p>
                          <p className="text-[9px] text-text-400 font-medium">Yang Bayar</p>
                        </div>
                      </div>

                      {/* Direction arrow & Amount */}
                      <div className="flex flex-col items-center shrink-0 px-1">
                        <div className="flex items-center gap-1">
                          <div className="h-px w-2 sm:w-4 bg-secondary-700" />
                          <div className="p-1 rounded-full bg-secondary-900 border border-secondary-700 text-text-300">
                            <ArrowRight className="w-3 h-3" />
                          </div>
                          <div className="h-px w-2 sm:w-4 bg-secondary-700" />
                        </div>
                        <span className="text-xs font-black text-primary-400 tracking-tight mt-1">
                          {formatRupiah(t.amount)}
                        </span>
                      </div>

                      {/* Receiver (To) */}
                      <div className="flex items-center justify-end gap-2.5 min-w-0 flex-1 text-right">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-text-50 truncate flex items-center justify-end gap-1">
                            {isToMe && <span className="text-[9px] font-normal text-danger-400">(Gua)</span>}
                            {t.to}
                          </p>
                          <p className="text-[9px] text-text-400 font-medium">Penerima</p>
                        </div>
                        <Avatar
                          alt={t.to}
                          size="sm"
                          className={`shadow-md border shrink-0 ${isToMe
                            ? "border-primary-500/70 ring-1 ring-primary-500/50"
                            : "border-secondary-800"
                            }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal Add Expense */}
      <ModalOverlay isOpen={showAddExpense} onOpenChange={setShowAddExpense}>
        <Modal className="w-full max-w-sm overflow-hidden bg-active text-text p-5">
          <Dialog className="outline-hidden">
            {() => (
              <form onSubmit={handleAddExpenseSubmit} className="flex flex-col gap-4">
                <div className="space-y-1">
                  <Heading slot="title" className="text-sm font-bold text-text">
                    {editingExpenseId ? "Ubah Rincian Pengeluaran" : "Catat Pengeluaran Baru"}
                  </Heading>
                  <p className="text-[10px] text-text-400">
                    Masukkan nominal pengeluaran dan siapa saja yang pete-pete.
                  </p>
                </div>

                <div className="space-y-3">
                  <Input
                    label="Nama Pengeluaran"
                    isRequired
                    value={expenseTitle}
                    onChange={(val) => setExpenseTitle(val)}
                    placeholder="Contoh: Belanja Daging, Sewa Villa, Tiket Wisata..."
                  />

                  <Input
                    label="Nominal (Total)"
                    isRequired
                    value={formatRupiah(expenseAmount)}
                    onChange={(val) => setExpenseAmount(parseRupiah(val))}
                    placeholder="Contoh: Rp 300.000"
                  />

                  {/* Payer selection */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-text-400 uppercase block">Siapa yang Bayar?</label>
                    <div className="flex flex-wrap gap-3.5 max-h-[110px] overflow-y-auto p-1 scrollbar-hide">
                      {members.map((m) => {
                        const isSelected = expensePayerId === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setExpensePayerId(m.id)}
                            className="flex flex-col items-center gap-1.5 w-12 shrink-0 focus:outline-hidden active:scale-95 transition-all cursor-pointer group"
                          >
                            <div className="relative">
                              <Avatar
                                alt={m.name}
                                size="md"
                                className={`shadow-md transition-all duration-200 border border-secondary-800 ${isSelected
                                  ? "ring-2 ring-primary border-primary scale-105"
                                  : "opacity-40 group-hover:opacity-75"
                                  }`}
                              />
                              {isSelected && (
                                <span className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-md border border-text-950">
                                  <Check className="w-2.5 h-2.5 stroke-[3px]" />
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10px] truncate w-full text-center font-semibold ${isSelected ? "text-text font-bold" : "text-text-400"
                                }`}
                            >
                              {m.name}
                              {m.userId === userId && " (Gua)"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Participants checkboxes */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-bold text-text-400 uppercase block">Sohib yang Ikut Pete-Pete</label>
                      <button
                        type="button"
                        onClick={() => {
                          if (expenseParticipants.length === members.length) {
                            setExpenseParticipants([]);
                          } else {
                            setExpenseParticipants(members.map((m) => m.id));
                          }
                        }}
                        className="text-[9px] font-semibold text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
                      >
                        {expenseParticipants.length === members.length ? "Batal Semua" : "Pilih Semua"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3.5 max-h-[120px] overflow-y-auto p-1 scrollbar-hide">
                      {members.map((m) => {
                        const isParticipating = expenseParticipants.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleToggleParticipant(m.id)}
                            className="flex flex-col items-center gap-1.5 w-12 shrink-0 focus:outline-hidden active:scale-95 transition-all cursor-pointer group"
                          >
                            <div className="relative">
                              <Avatar
                                alt={m.name}
                                size="md"
                                className={`shadow-md transition-all duration-200 border border-secondary-800 ${isParticipating
                                  ? "ring-2 ring-primary border-primary scale-105"
                                  : "opacity-40 group-hover:opacity-75"
                                  }`}
                              />
                              {isParticipating && (
                                <span className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-md border border-text-950">
                                  <Check className="w-2.5 h-2.5 stroke-[3px]" />
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10px] truncate w-full text-center font-semibold ${isParticipating ? "text-text font-bold" : "text-text-400"
                                }`}
                            >
                              {m.name}
                              {m.userId === userId && " (Gua)"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <Button
                    type="button"
                    onPress={handleCloseModal}
                    color="secondary"
                    size="sm"
                    isDisabled={loading}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    size="sm"
                    isLoading={loading}
                    isDisabled={loading}
                  >
                    Simpan Biaya
                  </Button>
                </div>
              </form>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>

      {/* Delete Confirmation Modal */}
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

      {/* WhatsApp / Share Modal (sama seperti Pete-Pete) */}
      {shareModalConfig && (
        <ModalOverlay
          isOpen={shareModalConfig.isOpen}
          onOpenChange={() => setShareModalConfig(null)}
          className="fixed inset-0 z-50 flex min-h-dvh w-full items-end justify-center bg-overlay/70 outline-hidden backdrop-blur-[6px] sm:items-center sm:justify-center sm:px-8 pt-(--modal-pt) pb-(--modal-pb) [--modal-pb:clamp(16px,8vh,64px)] [--modal-pt:16px] sm:[--modal-pb:32px] sm:[--modal-pt:32px]"
        >
          <Modal className="w-full max-w-sm overflow-hidden bg-active text-text p-5 rounded-xl sm:rounded-2xl shadow-xl outline-hidden duration-0 animate-none transform-none transition-none">
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
                      className="text-text-400 hover:text-text"
                    >
                      <X />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 w-full pt-1">
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
