"use client";

import React, { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { getAvatarUrl } from "@/utils/avatar";
import { Dot } from "@/components/foundations/dot-icon";
import {
  Users01,
  Share07,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Download01,
  Edit02,
  Trash01,
  DotsVertical,
} from "@untitledui/icons";
import { DialogTrigger, Popover, Dialog } from "react-aria-components";
import { toast } from "sonner";
import { Member, SplitSessionData } from "../types";

interface SplitMemberListProps {
  members: Member[];
  session: SplitSessionData;
  sessionStatus: string;
  loading: boolean;
  saveStatus: "saved" | "saving" | "error";
  onAddMember: (name: string) => Promise<void>;
  onRenameMember: (memberId: string, name: string) => Promise<void>;
  onDeleteMemberPrompt: (member: Member) => void;
  onTogglePaid: (memberId: string, currentPaid: boolean) => Promise<void>;
  onOpenAllSummaryShare: () => void;
  onOpenMemberSummaryShare: (member: Member) => void;
  onOpenReceiptModal: (member: Member) => void;
  getMemberShareAmount: (memberId: string) => number;
  copiedId: string | null;
}

export default function SplitMemberList({
  members,
  session,
  sessionStatus,
  loading,
  saveStatus,
  onAddMember,
  onRenameMember,
  onDeleteMemberPrompt,
  onTogglePaid,
  onOpenAllSummaryShare,
  onOpenMemberSummaryShare,
  onOpenReceiptModal,
  getMemberShareAmount,
  copiedId,
}: SplitMemberListProps) {
  const [showMembers, setShowMembers] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState("");

  const handleAddSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await onAddMember(newMemberName);
    setNewMemberName("");
  };

  const handleRenameSubmit = async (memberId: string) => {
    await onRenameMember(memberId, editingMemberName);
    setEditingMemberId(null);
  };

  return (
    <div
      role="region"
      aria-label="Daftar sohib sesi"
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
        className="flex items-center justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg p-1 -m-1"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Users01 className="w-4 h-4 text-text-300 shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs font-semibold text-text-100 tracking-wider wrap-break-word">
                {members.length} Sohib yang Join
              </span>
              {saveStatus === "saving" && (
                <span className="text-text-400 font-medium shrink-0">
                  <Dot color="primary" />
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-emerald-500 font-medium shrink-0">
                  <Dot color="success" />
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-danger-500 font-medium shrink-0">
                  <Dot color="danger" />
                </span>
              )}
            </div>
            <span className="text-2xs text-text-400 wrap-break-word">
              Buka ini untuk lokit sohib lo
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            onPress={() => {
              if (sessionStatus !== "COMPLETED") {
                toast.warning("Kelarin dulu bill-nya sebelum bagi rekap ya, Bos!");
                return;
              }
              onOpenAllSummaryShare();
            }}
            color="secondary"
            size="xs"
            className={`px-2 py-1 text-2xs shrink-0 ${sessionStatus !== "COMPLETED" ? "opacity-60" : ""
              }`}
            iconLeading={Share07}
          >
            Bagikan Rekap
          </Button>
          <Button
            onPress={() => setShowMembers(!showMembers)}
            color="secondary"
            aria-label={showMembers ? "Tutup daftar sohib" : "Buka daftar sohib"}
            aria-expanded={showMembers}
            className="px-2 py-1 shrink-0"
          >
            {showMembers ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {showMembers && (
        <div onClick={(e) => e.stopPropagation()} className="space-y-2.5">
          {session.status !== "COMPLETED" && (
            <form onSubmit={handleAddSubmit} className="flex gap-2">
              <input
                type="text"
                aria-label="Nama sohib baru"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-text placeholder-text-400 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 text-xs outline-none transition-all"
                placeholder="Ketik nama sohib lo..."
              />
              <Button type="submit" isDisabled={loading} isLoading={loading} size="sm">
                Tambahin
              </Button>
            </form>
          )}

          <div className="space-y-2 max-h-30 overflow-y-auto pr-1 scrollbar-hide">
            {members.map((member, index) => {
              const isCreator = session.userId
                ? Boolean(member.userId && member.userId === session.userId)
                : index === 0;
              const isNameGua = member.name.trim().toLowerCase() === "gua";
              const showGuaBadge = isCreator && !isNameGua;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 px-3 rounded-xl bg-secondary-950/40 border border-secondary-800/80 hover:bg-secondary-950/60 transition-all"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Avatar
                      src={getAvatarUrl(member.avatar || member.id)}
                      alt={member.name}
                      size="sm"
                      className="shadow-md border border-secondary-800"
                    />
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
                          onPress={() => handleRenameSubmit(member.id)}
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
                          {member.name}
                          {showGuaBadge && (
                            <span className="text-3xs font-normal text-text-400"> (Gua)</span>
                          )}
                        </p>
                        <p className="text-2xs text-primary-400 font-medium tabular-nums">
                          Tagihan: Rp {getMemberShareAmount(member.id).toLocaleString("id-ID")}
                        </p>
                      </div>
                    )}
                  </div>

                  {editingMemberId !== member.id && (
                    <div className="flex items-center gap-1.5">
                      {!isCreator && (
                        <Button
                          onPress={() => onTogglePaid(member.id, !!member.isPaid)}
                          color={!member.isPaid ? "primary" : "secondary"}
                          size="xs"
                          iconLeading={!member.isPaid ? Check : X}
                          className={`text-2xs font-bold tracking-wide transition-all duration-300 ${
                            !member.isPaid
                              ? "shadow-sm shadow-emerald-950/20"
                              : "opacity-80 hover:opacity-100"
                          }`}
                        >
                          {!member.isPaid ? "Udah Bayar" : "Belum Bayar"}
                        </Button>
                      )}
                      {/* Dropdown Menu Aksi Sohib */}
                      <DialogTrigger>
                        <Button
                          color="secondary"
                          size="xs"
                          aria-label={`Menu aksi untuk ${member.name}`}
                          className="p-1.5 rounded-lg active:scale-95 transition-all text-text-300 hover:text-text-100 flex items-center justify-center shrink-0"
                        >
                          <DotsVertical className="w-4 h-4" />
                        </Button>
                        <Popover
                          placement="bottom right"
                          offset={6}
                          className="z-50 w-44 p-1.5 rounded-xl border border-secondary-800 bg-secondary-950/95 backdrop-blur-md shadow-xl outline-hidden animate-in fade-in zoom-in-95 duration-150"
                        >
                          <Dialog className="outline-hidden">
                            {({ close }) => (
                              <div className="flex flex-col gap-0.5">
                                {/* Share Detail Bill */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    if (sessionStatus !== "COMPLETED") {
                                      toast.warning("Kelarin dulu bill-nya sebelum share detail ya, Bos!");
                                      return;
                                    }
                                    onOpenMemberSummaryShare(member);
                                  }}
                                  className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-semibold text-text-100 hover:bg-secondary-900 rounded-lg transition-colors cursor-pointer text-left"
                                >
                                  {copiedId === member.id ? (
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Share07 className="w-4 h-4 text-primary-400 shrink-0" />
                                  )}
                                  <span>Bagikan Bon</span>
                                </button>

                                {/* Download Kartu Bon */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    onOpenReceiptModal(member);
                                  }}
                                  className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-semibold text-text-100 hover:bg-secondary-900 rounded-lg transition-colors cursor-pointer text-left"
                                >
                                  <Download01 className="w-4 h-4 text-primary-400 shrink-0" />
                                  <span>Download Bon</span>
                                </button>

                                {/* Ganti Nama (Non-creator & Not completed) */}
                                {!isCreator && session.status !== "COMPLETED" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      close();
                                      setEditingMemberId(member.id);
                                      setEditingMemberName(member.name);
                                    }}
                                    className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-semibold text-text-100 hover:bg-secondary-900 rounded-lg transition-colors cursor-pointer text-left"
                                  >
                                    <Edit02 className="w-4 h-4 text-primary-400 shrink-0" />
                                    <span>Ganti Nama</span>
                                  </button>
                                )}

                                {/* Hapus Sohib (Non-creator & Not completed) */}
                                {!isCreator && session.status !== "COMPLETED" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      close();
                                      onDeleteMemberPrompt(member);
                                    }}
                                    className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-semibold text-danger-400 hover:bg-danger-950/40 rounded-lg transition-colors cursor-pointer text-left"
                                  >
                                    <Trash01 className="w-4 h-4 text-danger-400 shrink-0" />
                                    <span>Hapus Sohib</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </Dialog>
                        </Popover>
                      </DialogTrigger>
                    </div>
                  )}
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
