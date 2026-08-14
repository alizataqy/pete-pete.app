"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createVacationPlan } from "@/app/actions/vacation";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Plus, ArrowLeft, CreditCard01, Users01, Compass } from "@untitledui/icons";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { Heading } from "react-aria-components";
import { toast } from "sonner";
import { Input } from "@/components/base/input/input";
import { Avatar } from "@/components/base/avatar/avatar";
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

export default function AgendaPlansView({ userId, userName, initialPlans }: AgendaPlansViewProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
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
        router.refresh();
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
      <div className="p-4 border-b border-secondary-800 bg-secondary-950/40 flex items-center justify-between gap-3 shrink-0">
        <Button
          onPress={() => router.push("/tongkrongan")}
          color="primary"
          size="sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-sm font-semibold text-text text-center flex-1">
          Make a Plan
        </h1>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scrollbar-hide">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold text-text-50 uppercase tracking-widest">
              Plan Kumpul Lo
            </h2>
            <p className="text-[10px] text-text-400">
              Kelola pete-pete liburan, bakar-bakar, atau agenda seru bareng geng lo biar ga pusing
            </p>
          </div>
          <Button
            onPress={() => setIsOpen(true)}
            color="primary"
            size="xs"
            className="rounded-lg text-xs active:scale-95 transition-all shadow-md"
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
              <p className="text-[10px] text-text-400 max-w-[240px]">
                Bikin plan kumpul-kumpul atau liburan bareng sohib lo sekarang, kuy!
              </p>
            </div>
            <Button
              onPress={() => setIsOpen(true)}
              color="secondary"
              size="xs"
              className="mt-2 active:scale-95 transition-all font-semibold"
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
                className="p-4 rounded-xl border border-secondary-800 bg-secondary-950/20 hover:bg-secondary-950/40 hover:border-primary-600 transition-all flex flex-col gap-3 group"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-50 group-hover:text-primary-400 transition-colors">
                      {plan.title}
                    </h3>
                    <p className="text-[10px] text-text-400 line-clamp-1 mt-0.5">
                      {plan.description || "Gak ada deskripsi plan."}
                    </p>
                    {plan.date && (
                      <p className="text-[9px] text-primary-400 font-bold mt-1 flex items-center gap-1">
                        📅 {formatDateString(plan.date)}
                      </p>
                    )}
                  </div>
                  <Badge color="brand" size="sm" type="pill-color" className="font-bold">
                    {plan.membersCount} Sohib
                  </Badge>
                </div>

                <div className="pt-2 border-t border-secondary-900/60 flex items-center justify-between text-[10px] text-text-400">
                  <div className="flex items-center gap-1.5">
                    <Users01 className="w-3.5 h-3.5 text-primary-400" />
                    <div>
                      <p className="text-[8px] text-text-500 uppercase font-semibold">Sohib Group</p>
                      <p className="font-bold text-text-50">{plan.membersCount} Sohib</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard01 className="w-3.5 h-3.5 text-text-50" />
                    <div>
                      <p className="text-[8px] text-text-500 uppercase font-semibold">Total Pete-Petean</p>
                      <p className="font-bold text-text-50">
                        {formatRupiah(plan.totalExpenses)}
                      </p>
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
        <Modal className="w-full max-w-sm overflow-hidden bg-active text-text p-5">
          <Dialog className="outline-hidden">
            {({ close }) => (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-1">
                  <Heading slot="title" className="text-sm font-bold text-text">
                    Bikin Plan Baru
                  </Heading>
                  <p className="text-[10px] text-text-400">
                    Isi detail rencana kumpul-kumpul atau liburan bareng temen-temen lo.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-text-400 uppercase">Judul Acara</label>
                  <Input
                    isRequired
                    value={title}
                    onChange={(val) => setTitle(val)}
                    placeholder="Contoh: Bali Getaway, Tahun Baru Grill..."
                  />

                  <div className="space-y-1 flex flex-col">
                    <label className="text-[9px] font-bold text-text-400 uppercase">Tanggal Acara (Opsional)</label>
                    <DatePicker
                      value={dateValue}
                      onChange={setDateValue}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-400 uppercase">Deskripsi (Opsional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-xs text-text outline-none focus:border-primary-500"
                      placeholder="Keterangan tambahan..."
                      rows={2}
                    />
                  </div>

                  {/* Tim Liburan */}
                  <div className="space-y-2 pt-1">
                    <label className="text-[9px] font-bold text-text-400 uppercase block">Sohib yang Ikut</label>
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
                        className="h-10 px-3"
                      >
                        Tambah
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1">
                      <Badge color="brand" size="sm" type="pill-color" className="flex items-center gap-1.5 font-bold">
                        <Avatar alt={userName} size="xs" />
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
                          <Avatar alt={m} size="xs" />
                          {m}
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m)}
                            className="text-rose-400 hover:text-rose-300 font-bold ml-1 text-xs"
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
