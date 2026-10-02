"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Divide01, File06, ReceiptCheck } from "@untitledui/icons";

export interface SessionMember {
  id: string;
  name: string;
  isPaid: boolean;
}

export interface SessionItem {
  id: string;
  title: string;
  merchantName: string | null;
  inviteCode: string;
  status: string;
  totalAmount: number;
  members: SessionMember[];
}

interface TongkronganListProps {
  sessions: SessionItem[];
}

type FilterType = "ALL" | "DRAFT" | "COMPLETED";

export default function TongkronganList({ sessions }: TongkronganListProps) {
  const [statusFilter, setStatusFilter] = useState<FilterType>("ALL");

  const totalCount = sessions.length;
  const onGoingCount = sessions.filter((s) => s.status === "DRAFT").length;
  const completedCount = sessions.filter((s) => s.status === "COMPLETED").length;

  const filteredSessions = sessions.filter((session) => {
    if (statusFilter === "DRAFT") return session.status === "DRAFT";
    if (statusFilter === "COMPLETED") return session.status === "COMPLETED";
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 border border-secondary-800 p-3 rounded-xl bg-secondary-950/30">
      {/* Ringkasan & Filter Status Pete-Petean (Compact Single-Row Strip) */}
      <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider mb-2">List Pete-Petean Lo</h2>
      <div
        role="tablist"
        aria-label="Filter status pete-petean"
        className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-secondary-950/70 border border-secondary-800/80 mb-3"
      >
        
        <button
          type="button"
          role="tab"
          aria-selected={statusFilter === "ALL"}
          onClick={() => setStatusFilter("ALL")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border transition-all cursor-pointer active:scale-[0.98] ${
            statusFilter === "ALL"
              ? "bg-secondary-800/90 border-secondary-700/80 shadow-xs text-text-50"
              : "bg-secondary-900/30 border-transparent text-text-400 hover:bg-secondary-900/60 hover:text-text-200"
          }`}
        >
          <span className="text-3xs font-bold uppercase tracking-wider truncate">
            Semua
          </span>
          <span className="text-xs font-black tabular-nums">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={statusFilter === "DRAFT"}
          onClick={() => setStatusFilter("DRAFT")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border transition-all cursor-pointer active:scale-[0.98] ${
            statusFilter === "DRAFT"
              ? "bg-secondary-800/90 border-secondary-700/80 shadow-xs text-text-50"
              : "bg-secondary-900/30 border-transparent text-text-400 hover:bg-secondary-900/60 hover:text-text-200"
          }`}
        >
          <span className="text-3xs font-bold uppercase tracking-wider truncate">
            On Going
          </span>
          <span className="text-xs font-black tabular-nums">
            {onGoingCount}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={statusFilter === "COMPLETED"}
          onClick={() => setStatusFilter("COMPLETED")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border transition-all cursor-pointer active:scale-[0.98] ${
            statusFilter === "COMPLETED"
              ? "bg-secondary-800/90 border-secondary-700/80 shadow-xs text-text-50"
              : "bg-secondary-900/30 border-transparent text-text-400 hover:bg-secondary-900/60 hover:text-text-200"
          }`}
        >
          <span className="text-3xs font-bold uppercase tracking-wider truncate">
            Udah Kelar
          </span>
          <span className="text-xs font-black tabular-nums">
            {completedCount}
          </span>
        </button>
      </div>

      {/* Konten Daftar Sesi */}
      {sessions.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-secondary-800 rounded-xl space-y-3 bg-secondary-950/40">
          <p className="text-text-300 text-2xs max-w-50 mx-auto leading-relaxed">
            Sepi amat, belum ada splitbill nih. Yuk scan struk bareng geng lo biar gak ada drama!
          </p>
          <Button
            href="/pete-pete/new"
            color="primary"
            className="px-5 py-3 min-h-11 rounded-lg font-bold text-xs active:scale-[0.96] transition-transform"
          >
            Scan Struk Sekarang
          </Button>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-secondary-800/80 rounded-xl space-y-2 bg-secondary-950/30">
          <p className="text-text-300 text-xs font-semibold">
            {statusFilter === "DRAFT"
              ? "Lagi gak ada pete-petean yang on going nih!"
              : "Belum ada pete-petean yang udah kelar nih!"}
          </p>
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className="text-2xs text-primary-400 hover:text-primary-300 font-bold underline cursor-pointer"
          >
            Lihat semua pete-petean
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-16 space-y-3 scrollbar-hide">
          {filteredSessions.map((session) => {
            const totalMembers = session.members.length;
            const paidMembers = session.members.filter((m) => m.isPaid).length;
            const unpaidMembers = totalMembers - paidMembers;
            const isAllPaid = totalMembers > 0 && unpaidMembers === 0;
            const cleanTitle =
              session.title.replace(/^PETE-PETE\s*[-–—:]?\s*/i, "").trim() ||
              session.merchantName ||
              session.title;

            return (
              <div
                key={session.id}
                className="relative p-4 rounded-xl border border-secondary-800 bg-secondary-950/20 hover:bg-secondary-950/40 hover:border-primary-400/40 transition-all flex flex-col gap-3 group cursor-pointer"
              >
                {/* Klik area card membuka bagi tagihan */}
                <Link
                  href={`/pete-pete/${session.id}/split`}
                  className="absolute inset-0 z-0 rounded-xl"
                  aria-label={`Bagi tagihan ${cleanTitle}`}
                />

                {/* Header: Icon, Judul, Merchant/Kode, dan Status */}
                <div className="relative z-10 pointer-events-none flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-primary-400/10 border border-primary-400/20 text-primary-400 shrink-0">
                      <ReceiptCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-text-50 group-hover:text-primary-400 transition-colors wrap-break-word">
                        {cleanTitle}
                      </h3>
                      <p className="text-2xs text-text-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                        {session.merchantName &&
                        session.merchantName.toLowerCase() !== cleanTitle.toLowerCase() ? (
                          <>
                            <span className="font-medium text-text-300">
                              {session.merchantName}
                            </span>
                            <span className="text-secondary-700">•</span>
                          </>
                        ) : null}
                        <span>
                          Kode:{" "}
                          <strong className="font-mono text-text-200 font-semibold">
                            {session.inviteCode}
                          </strong>
                        </span>
                      </p>
                    </div>
                  </div>
                  <Badge
                    color={
                      session.status === "COMPLETED"
                        ? "success"
                        : session.status === "CANCELLED"
                          ? "error"
                          : "brand"
                    }
                    size="sm"
                    type="pill-color"
                    className="font-bold text-2xs shrink-0"
                  >
                    {session.status === "COMPLETED"
                      ? "Kelar"
                      : session.status === "CANCELLED"
                        ? "Batal"
                        : "Draft"}
                  </Badge>
                </div>

                {/* Info Tagihan & Sohib Progress */}
                <div className="relative z-10 pointer-events-none pt-2.5 pb-0.5 border-t border-secondary-800/80 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-3xs uppercase tracking-wider text-text-400 font-bold block">
                      Total Tagihan
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-primary-400 whitespace-nowrap block mt-0.5">
                      Rp {session.totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <Badge color="gray" size="sm" type="pill-color" className="font-semibold text-2xs">
                      {totalMembers} Sohib
                    </Badge>
                    {isAllPaid ? (
                      <Badge color="success" size="sm" type="pill-color" className="font-semibold text-2xs">
                        Lunas
                      </Badge>
                    ) : paidMembers > 0 ? (
                      <Badge color="warning" size="sm" type="pill-color" className="font-semibold text-2xs">
                        {paidMembers}/{totalMembers} Bayar
                      </Badge>
                    ) : (
                      <Badge color="gray" size="sm" type="pill-color" className="font-semibold text-2xs">
                        Belum Bayar
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="relative z-10 grid grid-cols-2 gap-2 pt-0.5">
                  <Button
                    href={`/pete-pete/${session.id}/split`}
                    color="primary"
                    size="xs"
                    noTextPadding
                    className="w-full min-h-11 h-11 rounded-lg font-bold text-xs active:scale-[0.96] transition-transform"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Divide01 className="w-4 h-4 shrink-0" />
                      <span>Bagi Tagihan</span>
                    </span>
                  </Button>
                  <Button
                    href={`/pete-pete/${session.id}/items`}
                    color="secondary"
                    size="xs"
                    noTextPadding
                    className="w-full min-h-11 h-11 rounded-lg font-semibold text-xs active:scale-[0.96] transition-transform"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <File06 className="w-4 h-4 shrink-0" />
                      <span>Cek Menu</span>
                    </span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
