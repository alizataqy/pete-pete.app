"use client";

import React from "react";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import { getAvatarUrl } from "@/utils/avatar";
import { Input } from "@/components/base/input/input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { DialogTrigger, Popover, Dialog } from "react-aria-components";
import {
  Plus,
  Trash01,
  Users01,
  Check,
  ArrowUp,
  ArrowDown,
  Edit02,
  Share07,
  DotsVertical,
} from "@untitledui/icons";
import { Member, formatRupiah } from "../types";

interface AgendaMembersSectionProps {
  members: Member[];
  balances: Record<string, number>;
  userId: string;
  isOwner: boolean;
  showMembers: boolean;
  setShowMembers: (val: boolean) => void;
  newMemberName: string;
  setNewMemberName: (val: string) => void;
  handleAddMember: (e: React.SyntheticEvent) => void;
  loading: boolean;
  editingMemberId: string | null;
  setEditingMemberId: (val: string | null) => void;
  editingMemberName: string;
  setEditingMemberName: (val: string) => void;
  handleRenameMember: (memberId: string) => void;
  handleOpenMemberSummaryShare: (member: Member) => void;
  copiedId: string | null;
  onRequestDeleteMember: (member: Member) => void;
}

export default function AgendaMembersSection({
  members,
  balances,
  userId,
  isOwner,
  showMembers,
  setShowMembers,
  newMemberName,
  setNewMemberName,
  handleAddMember,
  loading,
  editingMemberId,
  setEditingMemberId,
  editingMemberName,
  setEditingMemberName,
  handleRenameMember,
  handleOpenMemberSummaryShare,
  copiedId,
  onRequestDeleteMember,
}: AgendaMembersSectionProps) {
  return (
    <div
      className={`p-3.5 rounded-2xl border border-secondary-800 bg-secondary-950/60 flex flex-col gap-3 overflow-hidden transition-all ${
        showMembers ? "flex-1 min-h-0" : "shrink-0"
      }`}
    >
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
            <h2 className="text-xs font-bold text-text-50">{members.length} Sohib yang Join</h2>
            <p className="text-2xs text-text-400">Buka ini untuk lokit sohib lo</p>
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
              <p className="text-xs text-text-400">Belum ada sohib yang didaftarin nih, tambahin di atas ya!</p>
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
                      <div className="relative shrink-0">
                        <Avatar
                          src={getAvatarUrl(member.avatar || member.name)}
                          alt={member.name}
                          size="sm"
                          className="shadow-xs border border-secondary-800 shrink-0"
                        />
                        {isMe && (
                          <span className="absolute -bottom-1 -right-1 bg-primary-400 text-white rounded-full px-1 py-0.2 text-4xs font-extrabold shadow-xs pointer-events-none">
                            Gua
                          </span>
                        )}
                      </div>
                      {editingMemberId === member.id ? (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <input
                            type="text"
                            value={editingMemberName}
                            onChange={(e) => setEditingMemberName(e.target.value)}
                            className="flex-1 px-2.5 py-1 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-400"
                            autoFocus
                          />
                          <Button
                            onPress={() => setEditingMemberId(null)}
                            color="secondary"
                            size="xs"
                            className="h-7 text-2xs"
                          >
                            Gak Jadi
                          </Button>
                          <Button
                            onPress={() => handleRenameMember(member.id)}
                            color="primary"
                            size="xs"
                            className="h-7 text-2xs"
                          >
                            Simpan
                          </Button>
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-text-50 text-xs wrap-break-word">
                              {member.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {balance < 0 ? (
                              <Badge
                                color="error"
                                size="sm"
                                type="pill-color"
                                className="text-2xs font-semibold px-2 py-0.5"
                              >
                                Utang: {formatRupiah(Math.abs(balance))}
                              </Badge>
                            ) : balance > 0 ? (
                              <Badge
                                color="success"
                                size="sm"
                                type="pill-color"
                                className="text-2xs font-semibold px-2 py-0.5"
                              >
                                Piutang: {formatRupiah(balance)}
                              </Badge>
                            ) : (
                              <Badge
                                color="gray"
                                size="sm"
                                type="pill-color"
                                className="text-2xs font-medium px-2 py-0.5"
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
                                      handleOpenMemberSummaryShare(member);
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

                                  {/* Ganti Nama */}
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

                                  {/* Hapus Sohib */}
                                  {!isMe && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        close();
                                        onRequestDeleteMember(member);
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
  );
}
