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
import { ArrowLeft, Coins01, Calendar } from "@untitledui/icons";
import { toast } from "sonner";

import {
  Member,
  Expense,
  Share,
  Transfer,
  VacationPlanDetailViewProps,
  formatRupiah,
  parseRupiah,
  formatDateString,
} from "./types";
import AgendaMembersSection from "./components/AgendaMembersSection";
import AgendaExpensesSection from "./components/AgendaExpensesSection";
import AgendaSettlementsSection from "./components/AgendaSettlementsSection";
import AgendaExpenseModal from "./components/AgendaExpenseModal";
import AgendaShareModal from "./components/AgendaShareModal";

const DeleteConfirmation = dynamic(
  () => import("@/components/application/modals/DeleteConfirmation"),
  { ssr: false }
);

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

    const paidExpenses = expenses.filter((e) => e.payerId === member.id);
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
    const balances: { [memberId: string]: number } = {};
    members.forEach((m) => {
      balances[m.id] = 0;
    });

    expenses.forEach((exp) => {
      if (balances[exp.payerId] !== undefined) {
        balances[exp.payerId] += exp.amount;
      }
      exp.shares.forEach((share) => {
        if (balances[share.memberId] !== undefined) {
          balances[share.memberId] -= share.amount;
        }
      });
    });

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

    debtors.sort((a, b) => a.balance - b.balance);
    creditors.sort((a, b) => b.balance - a.balance);

    const transfers: Transfer[] = [];

    let dIdx = 0;
    let cIdx = 0;

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
            className="min-w-11 min-h-11 p-2 rounded-lg flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-extrabold text-text wrap-break-word">{plan.title}</h1>
            <p className="text-2xs text-text-300 flex items-center gap-1.5 flex-wrap">
              <span>{plan.description || "Pete-Pete Seru & Kumpul Bareng"}</span>
              {plan.date && (
                <>
                  <span className="text-text-500">&bull;</span>
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
            <p className="text-2xs text-text-400 font-bold uppercase tracking-wider">Total Pengeluaran Kelompok</p>
            <p className="text-lg font-black text-text-50 mt-0.5">{formatRupiah(totalSpent)}</p>
          </div>
          <div className="p-2 bg-text-900 border border-secondary-800 rounded-lg">
            <Coins01 className="w-5 h-5 text-text-500" />
          </div>
        </div>

        {/* 1. TIM SOHIB (Vacation Members) */}
        <AgendaMembersSection
          members={members}
          balances={balances}
          userId={userId}
          isOwner={isOwner}
          showMembers={showMembers}
          setShowMembers={setShowMembers}
          newMemberName={newMemberName}
          setNewMemberName={setNewMemberName}
          handleAddMember={handleAddMember}
          loading={loading}
          editingMemberId={editingMemberId}
          setEditingMemberId={setEditingMemberId}
          editingMemberName={editingMemberName}
          setEditingMemberName={setEditingMemberName}
          handleRenameMember={handleRenameMember}
          handleOpenMemberSummaryShare={handleOpenMemberSummaryShare}
          copiedId={copiedId}
          onRequestDeleteMember={(member) => {
            setDeleteConfig({
              isOpen: true,
              title: "Hapus Sohib Dari Tim?",
              description: `Beneran mau hapus "${member.name}"? Semua catatan pengeluaran & pete-pete dia di plan ini bakal ilang, lho.`,
              confirmText: "Hapus",
              onConfirm: () => handleRemoveMember(member.id),
            });
          }}
        />

        {/* 2. DAFTAR BIAYA / PENGELUARAN */}
        <AgendaExpensesSection
          expenses={expenses}
          members={members}
          showExpenses={showExpenses}
          setShowExpenses={setShowExpenses}
          setShowAddExpense={setShowAddExpense}
          handleStartEdit={handleStartEdit}
          onRequestDeleteExpense={(exp) => {
            setDeleteConfig({
              isOpen: true,
              title: "Hapus Biaya Pengeluaran?",
              description: `Beneran mau hapus biaya "${exp.title}" sebesar ${formatRupiah(exp.amount)}? Perhitungan pete-pete plan bakal berubah otomatis.`,
              confirmText: "Hapus Pengeluaran",
              onConfirm: () => handleDeleteExpense(exp.id),
            });
          }}
        />

        {/* 3. RINGKASAN SETTLEMENT (Who owes whom) */}
        <AgendaSettlementsSection
          transfers={transfers}
          members={members}
          userId={userId}
          showSettlements={showSettlements}
          setShowSettlements={setShowSettlements}
          handleOpenSettlementShare={handleOpenSettlementShare}
        />
      </div>

      {/* Modal Add Expense */}
      <AgendaExpenseModal
        isOpen={showAddExpense}
        onOpenChange={setShowAddExpense}
        editingExpenseId={editingExpenseId}
        expenseTitle={expenseTitle}
        setExpenseTitle={setExpenseTitle}
        expenseAmount={expenseAmount}
        setExpenseAmount={setExpenseAmount}
        expensePayerId={expensePayerId}
        setExpensePayerId={setExpensePayerId}
        expenseParticipants={expenseParticipants}
        setExpenseParticipants={setExpenseParticipants}
        members={members}
        userId={userId}
        loading={loading}
        handleSubmit={handleAddExpenseSubmit}
        handleClose={handleCloseModal}
        handleToggleParticipant={handleToggleParticipant}
      />

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

      {/* WhatsApp / Share Modal */}
      <AgendaShareModal
        config={shareModalConfig}
        onClose={() => setShareModalConfig(null)}
        onShareToClipboard={handleShareToClipboard}
        onShareToWhatsApp={handleShareToWhatsApp}
      />
    </div>
  );
}
