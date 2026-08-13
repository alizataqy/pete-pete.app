"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  AlertTriangle,
  Receipt,
  Check,
  ArrowUp,
  ArrowDown,
  Copy01,
  Edit02
} from "@untitledui/icons";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { Heading } from "react-aria-components";
import { toast } from "sonner";
import DeleteConfirmation from "@/components/application/modals/DeleteConfirmation";
import { Input } from "@/components/base/input/input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

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

    setLoading(true);
    try {
      const res = await addVacationMember(plan.id, name);
      if (res.success && res.member) {
        toast.success("Sohib berhasil ditambahkan!");
        const newM: Member = {
          id: res.member.id,
          name: res.member.name,
          userId: res.member.userId,
        };
        setMembers([...members, newM]);
        // Add to default participants if we are creating an expense later
        setExpenseParticipants([...expenseParticipants, newM.id]);
        setNewMemberName("");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal nambahin sohib");
      }
    } catch {
      toast.error("Gagal nambahin sohib");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setLoading(true);
    try {
      const res = await removeVacationMember(memberId, plan.id);
      if (res.success) {
        toast.success("Sohib berhasil dikeluarkan dari tim");
        setMembers(members.filter((m) => m.id !== memberId));
        setExpenseParticipants(expenseParticipants.filter((id) => id !== memberId));
        if (expensePayerId === memberId) {
          setExpensePayerId(members.find((m) => m.id !== memberId)?.id || "");
        }
        router.refresh();
      } else {
        toast.error(res.error || "Gagal ngeluarin sohib");
      }
    } catch {
      toast.error("Gagal ngeluarin sohib");
    } finally {
      setLoading(false);
      setDeleteConfig(null);
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
    setExpensePayerId(initialMembers[0]?.id || "");
    setExpenseParticipants(initialMembers.map((m) => m.id));
  };

  const handleShareSettlements = () => {
    if (transfers.length === 0) return;

    let text = `📢 *REKAP TRANSFER PETE-PETE PLAN: ${plan.title}*\n`;
    if (plan.description) {
      text += `📝 ${plan.description}\n`;
    }
    text += `----------------------------------\n`;
    transfers.forEach((t) => {
      text += `👤 *${t.from}* ➡️ transfer ke *${t.to}* sebesar *${formatRupiah(t.amount)}*\n`;
    });
    text += `----------------------------------\n`;
    text += `Ditunggu transferannya ya, Guys! Biar cepet lunas 🙏`;

    navigator.clipboard.writeText(text);
    toast.success("Rincian transfer pete-pete disalin ke clipboard!");
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

  const handleShareMemberSummary = (member: Member) => {
    const balance = balances[member.id] || 0;

    // List of expenses they paid
    const paidExpenses = expenses.filter((e) => e.payerId === member.id);
    // List of expenses they participated in
    const joinedExpenses = expenses.filter((e) =>
      e.shares.some((s) => s.memberId === member.id)
    );

    let text = `📢 *RINCIAN PETE-PETE PLAN: ${plan.title}*\n`;
    text += `Halo *${member.name}*, berikut rincian pete-pete kamu:\n\n`;

    if (paidExpenses.length > 0) {
      text += `💸 *Pengeluaran yang Kamu Bayar:*\n`;
      paidExpenses.forEach((e) => {
        text += `  • ${e.title}: ${formatRupiah(e.amount)}\n`;
      });
      text += `\n`;
    }

    if (joinedExpenses.length > 0) {
      text += `🤝 *Pengeluaran yang Kamu Ikuti:*\n`;
      joinedExpenses.forEach((e) => {
        const share = e.shares.find((s) => s.memberId === member.id);
        if (share) {
          text += `  • ${e.title}: ${formatRupiah(share.amount)}\n`;
        }
      });
      text += `\n`;
    }

    text += `----------------------------------\n`;
    if (balance < 0) {
      text += `🔴 *Status: Harus Bayar (Utang) ${formatRupiah(Math.abs(balance))}*\n\n`;
      text += `*Rincian Transfer Kamu:*\n`;
      const myDebts = transfers.filter((t) => t.from === member.name);
      if (myDebts.length > 0) {
        myDebts.forEach((d) => {
          text += `  👉 Transfer ke *${d.to}*: *${formatRupiah(d.amount)}*\n`;
        });
      }
    } else if (balance > 0) {
      text += `🟢 *Status: Terima Uang (Piutang) ${formatRupiah(balance)}*\n\n`;
      text += `*Rincian Transfer ke Kamu:*\n`;
      const myCredits = transfers.filter((t) => t.to === member.name);
      if (myCredits.length > 0) {
        myCredits.forEach((c) => {
          text += `  👈 Dari *${c.from}*: *${formatRupiah(c.amount)}*\n`;
        });
      }
    } else {
      text += `✅ *Status: LUNAS* 🎉\n`;
    }
    text += `----------------------------------\n`;
    text += `Ditunggu transferannya ya, Bos! Thank you 🙏`;

    navigator.clipboard.writeText(text);
    setCopiedId(member.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(`Rincian pete-pete ${member.name} disalin ke clipboard!`);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
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

    setLoading(true);
    try {
      let res;
      if (editingExpenseId) {
        res = await updateVacationExpense(editingExpenseId, plan.id, {
          title: expenseTitle.trim(),
          amount: amt,
          payerId: expensePayerId,
          memberIds: expenseParticipants,
        });
      } else {
        res = await addVacationExpense(plan.id, {
          title: expenseTitle.trim(),
          amount: amt,
          payerId: expensePayerId,
          memberIds: expenseParticipants,
        });
      }

      if (res.success) {
        toast.success(editingExpenseId ? "Biaya pengeluaran berhasil diubah!" : "Biaya pengeluaran berhasil dicatat!");
        handleCloseModal();
        // Reload details
        window.location.reload();
      } else {
        toast.error(res.error || "Gagal menyimpan pengeluaran");
      }
    } catch {
      toast.error("Gagal menyimpan pengeluaran");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    setLoading(true);
    try {
      const res = await deleteVacationExpense(expenseId, plan.id);
      if (res.success) {
        toast.success("Pengeluaran berhasil dihapus!");
        setExpenses(expenses.filter((e) => e.id !== expenseId));
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus pengeluaran");
      }
    } catch {
      toast.error("Gagal menghapus pengeluaran");
    } finally {
      setLoading(false);
      setDeleteConfig(null);
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
    const transfers: { from: string; to: string; amount: number }[] = [];

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
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-extrabold text-text line-clamp-1">{plan.title}</h1>
            <p className="text-[9px] text-text-300 flex items-center gap-1.5">
              <span>{plan.description || "Pete-Pete Seru & Kumpul Bareng"}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Main layout wrapper */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scrollbar-hide">
        {/* Info Summary */}
        <div className="p-4 rounded-xl border border-secondary-800 bg-secondary-950/15 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[9px] text-text-500 font-bold uppercase tracking-wider">Total Pengeluaran Kelompok</p>
            <p className="text-lg font-black text-text-50 mt-0.5">{formatRupiah(totalSpent)}</p>
          </div>
          <div className="p-2 bg-text-900 border border-secondary-800 rounded-lg">
            <Coins01 className="w-5 h-5 text-text-500" />
          </div>
        </div>

        {/* 1. TIM SOHIB (Vacation Members) */}
        <div className="p-4 rounded-2xl border border-secondary-800 bg-secondary-950/20 flex flex-col gap-4">
          <div
            onClick={() => setShowMembers(!showMembers)}
            className="flex items-center justify-between cursor-pointer select-none"
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
            >
              {showMembers ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </Button>
          </div>

          {showMembers && (
            <div className="flex flex-col gap-4">
              {/* Add member inline form */}
              {isOwner && (
                <form onSubmit={handleAddMember} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Ketik nama sohib lo..."
                      value={newMemberName}
                      onChange={(val) => setNewMemberName(val)}
                    />
                  </div>
                  <Button
                    type="submit"
                    isDisabled={loading}
                    isLoading={loading}
                    size="md"
                    className="h-10"
                  >
                    Tambahin
                  </Button>
                </form>
              )}

              {/* Members list */}
              <div className="grid gap-2 max-h-[140px] overflow-y-auto pr-1 scrollbar-hide">
                {members.map((member) => {
                  const balance = balances[member.id] || 0;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-text-950 border border-secondary-800"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Avatar alt={member.name} size="sm" className="shadow-md border border-secondary-800" />
                        {editingMemberId === member.id ? (
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <input
                              type="text"
                              value={editingMemberName}
                              onChange={(e) => setEditingMemberName(e.target.value)}
                              className="flex-1 px-2 py-1 rounded bg-text-900 border border-text-700 text-xs text-text outline-none focus:border-primary"
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
                            <p className="font-semibold text-text text-xs truncate">
                              {member.name}
                              {member.userId === userId && (
                                <span className="text-[9px] font-normal text-text-400 ml-1.5">(Gua)</span>
                              )}
                            </p>
                            <p
                              className={`text-[9px] font-bold ${balance < 0
                                ? "text-rose-400"
                                : balance > 0
                                  ? "text-text-50"
                                  : "text-text-400"
                                }`}
                            >
                              {balance < 0
                                ? `Utang: ${formatRupiah(Math.abs(balance))}`
                                : balance > 0
                                  ? `Piutang: ${formatRupiah(balance)}`
                                  : "Lunas"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {editingMemberId !== member.id && (
                          <>
                            <Button
                              onPress={() => handleShareMemberSummary(member)}
                              color="secondary"
                              size="xs"
                              className="p-1.5 rounded-lg active:scale-95 transition-all flex items-center justify-center"
                            >
                              {copiedId === member.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy01 className="w-3.5 h-3.5 text-primary-400" />}
                            </Button>

                            <Button
                              onPress={() => {
                                setEditingMemberId(member.id);
                                setEditingMemberName(member.name);
                              }}
                              color="tertiary"
                              size="xs"
                              className="p-1.5 rounded-lg active:scale-95 transition-all text-primary-400 hover:text-primary-300 flex items-center justify-center"
                            >
                              <Edit02 className="w-3.5 h-3.5" />
                            </Button>

                            {member.userId !== userId && (
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
                                color="tertiary"
                                size="xs"
                                className="p-1.5 rounded-lg text-danger-400/80 hover:text-danger-400 flex items-center justify-center active:scale-95 transition-all"
                              >
                                <Trash01 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. DAFTAR BIAYA / PENGELUARAN */}
        <div className="p-4 rounded-2xl border border-secondary-800 bg-secondary-950/20 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FeaturedIcon icon={Receipt} size="sm" color="success" theme="modern" />
              <div>
                <h2 className="text-xs font-bold text-text-50">Daftar Pengeluaran</h2>
                <p className="text-[10px] text-text-400">{expenses.length} Biaya Tercatat</p>
              </div>
            </div>
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
          </div>

          {expenses.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-secondary-800 bg-secondary-950/10 flex flex-col items-center justify-center text-center gap-2">
              <p className="text-[10px] text-text-400">Belum ada catatan pengeluaran kumpul-kumpul.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-hide">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-xl bg-text-900 border border-secondary-800 flex justify-between items-start gap-3"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div>
                      <p className="text-xs font-bold text-text-50 truncate">{exp.title}</p>
                      <p className="text-[9px] text-text-400">
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
                          className="flex items-center gap-1 text-[8px] font-semibold"
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
                        className="p-1 rounded-lg text-danger-400/80 hover:text-danger-400 flex items-center justify-center"
                      >
                        <Trash01 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. RINGKASAN SETTLEMENT (Who owes whom) */}
        <div className="p-4 rounded-2xl border border-secondary-800 bg-secondary-950/20 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div>
                <h2 className="text-xs font-bold text-text-50">Hasil Akhir / Transfer Patungan</h2>
                <p className="text-[10px] text-text-400">Instruksi transfer patungan paling ringkas</p>
              </div>
            </div>
            {transfers.length > 0 && (
              <Button
                onPress={handleShareSettlements}
                color="secondary"
                size="xs"
                className="font-bold flex items-center gap-1"
                iconLeading={Copy01}
              >
                Share WA
              </Button>
            )}
          </div>

          {transfers.length === 0 ? (
            <div className="p-4 rounded-xl border border-secondary-800 bg-secondary-950/10 flex items-center justify-center gap-2 text-center">
              <p className="text-[10px] text-text-400">
                Semua aman! Tidak ada utang-piutang transfer yang perlu diselesaikan.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-secondary-800 bg-primary-950/10 flex flex-col gap-2">
                {transfers.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 text-xs border-b border-secondary-900/60 last:border-0 pb-2 last:pb-0 pt-1.5 first:pt-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-text-400 text-[10px] font-medium leading-relaxed">
                        <span className="font-bold text-text-50">{t.from}</span> transfer ke{" "}
                        <span className="font-bold text-primary-400">{t.to}</span>
                      </p>
                    </div>
                    <span className="font-extrabold text-primary-400 shrink-0 text-right">
                      {formatRupiah(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-400 uppercase">Siapa yang Bayar?</label>
                    <select
                      value={expensePayerId}
                      onChange={(e) => setExpensePayerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-xs text-text outline-none focus:border-primary-500"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.userId === userId ? "(Gua)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Participants checkboxes */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-text-400 uppercase block">Sohib yang Ikut Pete-Pete</label>
                    <div className="grid gap-2 max-h-[110px] overflow-y-auto pr-1">
                      {members.map((m) => {
                        const checked = expenseParticipants.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleToggleParticipant(m.id)}
                            className={`flex items-center justify-between p-2 rounded-lg border text-left active:scale-[0.98] transition-all cursor-pointer ${checked
                              ? "bg-primary-950/20 border-primary-500"
                              : "bg-text-950 border-text-800"
                              }`}
                          >
                            <span className="text-xs font-semibold text-text">{m.name}</span>
                            {checked && <Check className="w-3.5 h-3.5 text-primary-400" />}
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
    </div>
  );
}
