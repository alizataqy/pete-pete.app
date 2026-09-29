"use client";

import React from "react";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import {
  Receipt,
  PlusCircle,
  ArrowUp,
  ArrowDown,
  Edit02,
  Trash01,
} from "@untitledui/icons";
import { Expense, Member, formatRupiah } from "../types";

interface AgendaExpensesSectionProps {
  expenses: Expense[];
  members: Member[];
  showExpenses: boolean;
  setShowExpenses: (val: boolean) => void;
  setShowAddExpense: (val: boolean) => void;
  handleStartEdit: (exp: Expense) => void;
  onRequestDeleteExpense: (exp: Expense) => void;
}

export default function AgendaExpensesSection({
  expenses,
  members,
  showExpenses,
  setShowExpenses,
  setShowAddExpense,
  handleStartEdit,
  onRequestDeleteExpense,
}: AgendaExpensesSectionProps) {
  return (
    <div
      className={`p-3.5 rounded-2xl border border-secondary-800 bg-secondary-950/60 flex flex-col gap-3 overflow-hidden transition-all ${
        showExpenses ? "flex-1 min-h-0" : "shrink-0"
      }`}
    >
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
            <p className="text-2xs text-text-400">{expenses.length} Biaya Tercatat</p>
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

      {showExpenses &&
        (expenses.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-secondary-800 bg-secondary-950/10 flex flex-col items-center justify-center text-center gap-1.5 shrink-0">
            <p className="text-2xs text-text-400">Belum ada catatan pengeluaran kumpul-kumpul.</p>
          </div>
        ) : (
          <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-hide min-h-0">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3 rounded-xl bg-secondary-900 border border-secondary-800 flex justify-between items-start gap-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div>
                    <p className="text-xs font-bold text-text-50 wrap-break-word">{exp.title}</p>
                    <p className="text-2xs text-text-400">
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
                        className="flex items-center gap-1 text-2xs font-semibold"
                      >
                        <Avatar alt={sh.memberName} size="xs" className="h-4 w-4 min-w-4" />
                        {sh.memberName} ({formatRupiah(sh.amount)})
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs font-black text-text-50">
                    {formatRupiah(exp.amount)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      onPress={() => handleStartEdit(exp)}
                      color="tertiary"
                      size="xs"
                      aria-label={`Edit ${exp.title}`}
                      className="min-w-9 min-h-9 h-9 w-9 p-0 rounded-lg text-primary-400/80 hover:text-primary-400 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Edit02 className="w-4 h-4" />
                    </Button>
                    <Button
                      onPress={() => onRequestDeleteExpense(exp)}
                      color="tertiary"
                      size="xs"
                      aria-label={`Hapus ${exp.title}`}
                      className="min-w-9 min-h-9 h-9 w-9 p-0 rounded-lg text-danger-400/80 hover:text-danger-400 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Trash01 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
