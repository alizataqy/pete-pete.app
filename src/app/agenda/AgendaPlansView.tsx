"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createVacationPlan } from "@/app/actions/vacation";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Plus, ArrowLeft, Compass, Calendar, ChevronRight } from "@untitledui/icons";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { Heading } from "react-aria-components";
import { toast } from "sonner";
import { Input } from "@/components/base/input/input";
import { Avatar } from "@/components/base/avatar/avatar";
import { getAvatarUrl } from "@/utils/avatar";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import type { DateValue } from "react-aria-components";

interface PlanItem {
  id: string;
  title: string;
  description: string;
  budget: number;
  membersCount: number;
  expensesCount: number;
  totalExpenses: number;
  date?: string;
  createdAt: string;
}

interface AgendaPlansViewProps {
  userId: string;
  userName: string;
  userAvatar?: string | null;
  initialPlans: PlanItem[];
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

export default function AgendaPlansView({ userId, userName, userAvatar, initialPlans }: AgendaPlansViewProps) {
  const router = useRouter();
  const [plans] = useState<PlanItem[]>(initialPlans);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateValue, setDateValue] = useState<DateValue | null>(null);
  const [members, setMembers] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState("");

  const handleAddMember = () => {
    let name = newMemberName.trim();
    if (!name) {
      let nextNum = 1;
      while (true) {
        const potentialName = `Sohib ${nextNum}`;
        if (!members.includes(potentialName) && potentialName !== userName) {
          name = potentialName;
          break;
        }
        nextNum++;
      }
    }

    if (members.includes(name) || name === userName) {
      toast.error("Nama sohib ini udah ada!");
      return;
    }
    setMembers([...members, name]);
    setNewMemberName("");
  };

  const handleRemoveMember = (nameToRemove: string) => {
    setMembers(members.filter((m) => m !== nameToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul plan acara ga boleh kosong, Bos!");
      return;
    }

    setLoading(true);
    try {
      const res = await createVacationPlan(userId, {
        title,
        description,
        budget: 0,
        members,
        date: dateValue ? dateValue.toString() : undefined,
      });

      if (res.success && res.planId) {
        toast.success("Rencana sukses dibuat!");
        setIsOpen(false);
        // Clear form
        setTitle("");
        setDescription("");
        setDateValue(null);
        setMembers([]);
        router.push(`/agenda/${res.planId}`);
      } else {
        toast.error(res.error || "Gagal bikin plan baru");
      }
    } catch {
      toast.error("Gagal bikin plan baru");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background text-text overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center justify-between gap-3">
        <Button
          href="/tongkrongan"
          color="primary"
          size="sm"
          aria-label="Kembali ke tongkrongan"
          className="min-w-11 min-h-11 p-2 rounded-lg flex items-center justify-center active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-sm font-extrabold text-text-50 text-center flex-1">
          Make a Plan
        </h1>
        <Link
          href="/profile"
          aria-label="Buka profil gua"
          className="flex items-center justify-center rounded-full hover:opacity-80 active:scale-95 transition-transform p-0.5 shrink-0"
        >
          <Avatar
            size="sm"
            src={getAvatarUrl(userAvatar)}
            alt={userName}
          />
        </Link>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scrollbar-hide">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold text-text-50 uppercase tracking-widest">
              Plan Kumpul Lo
            </h2>
            <p className="text-2xs text-text-400">
              Manage pete-pete liburan, bakar-bakar, atau agenda seru bareng geng lo biar ga pusing
            </p>
          </div>
          <Button
            onPress={() => setIsOpen(true)}
            color="primary"
            size="xs"
            className="rounded-lg min-h-11 px-3.5 text-xs font-bold active:scale-95 transition-all shadow-md"
            iconLeading={Plus}
          >
            Bikin Plan
          </Button>
        </div>

        {/* List Rencana Liburan */}
        {plans.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-secondary-800 bg-secondary-950/10 flex flex-col items-center justify-center text-center gap-3 mt-4">
            <div className="p-3 bg-secondary-950 rounded-full border border-secondary-800">
              <Compass className="w-6 h-6 text-primary-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-text-50">Belum Ada Plan Kumpul</h3>
              <p className="text-2xs text-text-400 max-w-60">
                Bikin plan kumpul-kumpul atau liburan bareng sohib lo sekarang, kuy!
              </p>
            </div>
            <Button
              onPress={() => setIsOpen(true)}
              color="secondary"
              size="xs"
              className="mt-2 min-h-11 px-4 rounded-lg active:scale-95 transition-all font-semibold"
              iconLeading={Plus}
            >
              Mulai Bikin Plan
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/agenda/${plan.id}`}
                className="relative p-4 rounded-xl border border-secondary-800 bg-secondary-950/20 hover:bg-secondary-950/40 hover:border-primary-400/40 transition-all flex flex-col gap-3 group cursor-pointer"
              >
                {/* Header: Icon, Judul, Deskripsi & Badge Anggota */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-primary-400/10 border border-primary-400/20 text-primary-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-text-50 group-hover:text-primary-400 transition-colors truncate">
                        {plan.title}
                      </h3>
                      <p className="text-2xs text-text-400 truncate mt-0.5">
                        {plan.description || "Pete-pete liburan & kumpul bareng"}
                      </p>
                    </div>
                  </div>
                  <Badge color="gray" size="sm" type="pill-color" className="font-semibold text-2xs shrink-0">
                    {plan.membersCount} Sohib
                  </Badge>
                </div>

                {/* Info Tagihan, Tanggal & Detail */}
                <div className="pt-2.5 pb-0.5 border-t border-secondary-800/80 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-3xs uppercase tracking-wider text-text-400 font-bold block">
                      Total Pete-Petean
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-primary-400 whitespace-nowrap block mt-0.5">
                      {formatRupiah(plan.totalExpenses) || "Rp 0"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {plan.date && (
                      <span className="inline-flex items-center gap-1 text-3xs font-semibold text-text-300 bg-secondary-900 border border-secondary-800 px-2 py-1 rounded-md">
                        <Calendar className="w-3 h-3 text-primary-400 shrink-0" />
                        <span>{formatDateString(plan.date)}</span>
                      </span>
                    )}
                    <div className="w-6 h-6 rounded-md bg-secondary-900/60 border border-secondary-800/60 flex items-center justify-center text-text-400 group-hover:text-primary-400 group-hover:border-primary-400/40 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modal Bikin Plan Baru */}
      <ModalOverlay isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal className="w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto bg-active text-text p-4 sm:p-5">
          <Dialog className="outline-hidden">
            {({ close }) => (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-1">
                  <Heading slot="title" className="text-sm font-bold text-text">
                    Bikin Plan Baru
                  </Heading>
                  <p className="text-2xs text-text-400">
                    Isi detail rencana kumpul-kumpul atau liburan bareng sohib-sohib lo.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-3xs font-bold text-text-400 uppercase">Judul Acara</label>
                  <Input
                    isRequired
                    value={title}
                    onChange={(val) => setTitle(val)}
                    placeholder="Contoh: Bali Getaway, Tahun Baru Grill..."
                  />

                  <div className="space-y-1 flex flex-col">
                    <label className="text-3xs font-bold text-text-400 uppercase">Tanggal Acara (Opsional)</label>
                    <DatePicker
                      value={dateValue}
                      onChange={setDateValue}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-bold text-text-400 uppercase">Deskripsi (Opsional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-secondary-950 border border-secondary-800 text-xs text-text outline-none focus:border-primary-400"
                      placeholder="Keterangan tambahan..."
                      rows={2}
                    />
                  </div>

                  {/* Tim Liburan */}
                  <div className="space-y-2 pt-1">
                    <label className="text-3xs font-bold text-text-400 uppercase block">Sohib yang Ikut</label>
                    <div className="flex gap-1.5 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Nama sohib lo..."
                          value={newMemberName}
                          onChange={(val) => setNewMemberName(val)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddMember();
                            }
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        onPress={handleAddMember}
                        color="secondary"
                        size="md"
                        className="h-10 min-h-11 px-3.5 rounded-lg font-semibold active:scale-95 transition-transform"
                      >
                        Tambah
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                      <Badge color="brand" size="sm" type="pill-color" className="flex items-center gap-1.5 font-bold">
                        <Avatar src={getAvatarUrl(userAvatar || userName)} alt={userName} size="xs" />
                        {userName} (Gua)
                      </Badge>
                      {members.map((m) => (
                        <Badge
                          key={m}
                          color="gray"
                          size="sm"
                          type="pill-color"
                          className="flex items-center gap-1.5 font-bold"
                        >
                          <Avatar src={getAvatarUrl(m)} alt={m} size="xs" />
                          {m}
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m)}
                            className="text-danger-400 hover:text-danger-300 font-bold ml-1 w-6 h-6 min-w-6 min-h-6 flex items-center justify-center rounded-full text-sm active:scale-90"
                            aria-label={`Hapus ${m}`}
                          >
                            &times;
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <Button
                    type="button"
                    onPress={close}
                    color="secondary"
                    size="sm"
                    isDisabled={loading}
                    className="min-h-11 px-4 rounded-lg text-sm font-semibold active:scale-95 transition-transform"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    size="sm"
                    isLoading={loading}
                    isDisabled={loading}
                    className="min-h-11 px-4 rounded-lg text-sm font-bold active:scale-95 transition-transform"
                  >
                    Bikin Plan
                  </Button>
                </div>
              </form>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
