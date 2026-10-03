"use client";

import React from "react";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import { getAvatarUrl } from "@/utils/avatar";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import {
  CreditCard01,
  Share07,
  ArrowUp,
  ArrowDown,
  ArrowRight,
} from "@untitledui/icons";
import { Member, Transfer, formatRupiah } from "../types";

interface AgendaSettlementsSectionProps {
  transfers: Transfer[];
  members: Member[];
  userId: string;
  showSettlements: boolean;
  setShowSettlements: (val: boolean) => void;
  handleOpenSettlementShare: () => void;
}

export default function AgendaSettlementsSection({
  transfers,
  members,
  userId,
  showSettlements,
  setShowSettlements,
  handleOpenSettlementShare,
}: AgendaSettlementsSectionProps) {
  return (
    <div
      className={`p-3.5 rounded-2xl border border-secondary-800 bg-secondary-950/60 flex flex-col gap-3 overflow-hidden transition-all ${
        showSettlements ? "flex-1 min-h-0" : "shrink-0"
      }`}
    >
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
                <div className="flex items-center gap-2 text-xs text-text-400">
                  {transfers.length} transfer patungan tercatat
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-text-400">
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

      {showSettlements &&
        (transfers.length === 0 ? (
          <div className="p-4 rounded-xl border border-secondary-800 bg-secondary-950/10 flex items-center justify-center gap-2 text-center shrink-0">
            <p className="text-2xs text-text-400">
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
                  className={`p-3.5 rounded-lg border transition-all flex flex-col gap-2.5 ${
                    isFromMe
                      ? "border-danger-900/60 bg-danger-950/15"
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
                        className="text-3xs font-bold inline-flex items-center gap-1"
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
                        src={getAvatarUrl(members.find((m) => m.id === t.fromMemberId)?.avatar || t.fromMemberId)}
                        alt={t.from}
                        size="sm"
                        className={`shadow-md border shrink-0 ${
                          isFromMe
                            ? "border-danger-500/70 ring-1 ring-danger-500/50"
                            : "border-secondary-800"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-50 wrap-break-word flex items-center gap-1">
                          {t.from}
                          {isFromMe && <span className="text-3xs font-normal text-danger-400">(Gua)</span>}
                        </p>
                        <p className="text-3xs text-text-400 font-medium">Yang Bayar</p>
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
                        <p className="text-xs font-bold text-text-50 wrap-break-word flex items-center justify-end gap-1">
                          {isToMe && <span className="text-3xs font-normal text-danger-400">(Gua)</span>}
                          {t.to}
                        </p>
                        <p className="text-3xs text-text-400 font-medium">Penerima</p>
                      </div>
                      <Avatar
                        src={getAvatarUrl(members.find((m) => m.id === t.toMemberId)?.avatar || t.toMemberId)}
                        alt={t.to}
                        size="sm"
                        className={`shadow-md border shrink-0 ${
                          isToMe
                            ? "border-primary-400/70 ring-1 ring-primary-400/50"
                            : "border-secondary-800"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}
