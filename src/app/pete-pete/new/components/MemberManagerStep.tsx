"use client";

import React from "react";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { Plus, XClose, Users01 } from "@untitledui/icons";

interface MemberManagerStepProps {
  newMemberInput: string;
  setNewMemberInput: (val: string) => void;
  handleAddMember: () => void;
  manualMembers: string[];
  setManualMembers: React.Dispatch<React.SetStateAction<string[]>>;
  currentUserName: string;
  editingManualIndex: number | null;
  setEditingManualIndex: (val: number | null) => void;
  editingManualName: string;
  setEditingManualName: (val: string) => void;
  handleSaveManualRename: (idx: number) => void;
}

export default function MemberManagerStep({
  newMemberInput,
  setNewMemberInput,
  handleAddMember,
  manualMembers,
  setManualMembers,
  currentUserName,
  editingManualIndex,
  setEditingManualIndex,
  editingManualName,
  setEditingManualName,
  handleSaveManualRename,
}: MemberManagerStepProps) {
  return (
    <div
      id="tour-members-manager"
      className="bg-secondary-950/40 border border-secondary-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-primary-400/10 border border-primary-400/20 text-primary-400 shrink-0">
          <Users01 className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-xs font-extrabold text-text-50 uppercase tracking-wider">
            Siapa Aja yang Ikut PETE-PETE?
          </h2>
          <p className="text-2xs text-text-400">Masukin nama temen-temen yang ikutan patungan</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          aria-label="Nama teman baru"
          value={newMemberInput}
          onChange={(e) => setNewMemberInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddMember();
            }
          }}
          className="flex-1 min-h-11 px-3.5 py-2.5 rounded-xl bg-secondary-900/60 border border-secondary-700/80 text-xs sm:text-sm text-text-50 placeholder-text-500 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all shadow-2xs"
          placeholder="Nama temen lo (misal: Budi, Sarah)"
        />
        <Button
          type="button"
          onPress={handleAddMember}
          size="sm"
          color="primary"
          iconLeading={Plus}
          className="min-h-11 px-4 rounded-xl font-bold text-xs active:scale-[0.96] transition-transform shrink-0"
        >
          Tambahin
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        {/* User (Owner) */}
        <div className="flex flex-col items-center gap-1.5 w-16 shrink-0">
          <div className="relative">
            <Avatar
              alt={currentUserName}
              size="lg"
              className="shadow-md border border-primary-400 ring-2 ring-primary-400/40"
            />
            <span className="absolute -bottom-1 -right-1 bg-primary-400 text-white rounded-full px-1 py-0.2 text-4xs font-extrabold shadow-xs">
              Gua
            </span>
          </div>
          <p className="text-2xs text-text font-bold wrap-break-word w-full text-center leading-tight">
            {currentUserName}
          </p>
        </div>

        {/* Added Friends */}
        {manualMembers.map((m, idx) => (
          <div
            key={m}
            className="flex flex-col items-center gap-1.5 w-16 shrink-0 relative group"
          >
            {editingManualIndex === idx ? (
              <div className="flex flex-col items-center gap-1 w-full">
                <Avatar alt={m} size="lg" className="shadow-md border border-secondary-800" />
                <input
                  type="text"
                  aria-label="Ubah nama teman"
                  value={editingManualName}
                  onChange={(e) => setEditingManualName(e.target.value)}
                  onBlur={() => handleSaveManualRename(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveManualRename(idx);
                    if (e.key === "Escape") setEditingManualIndex(null);
                  }}
                  autoFocus
                  className="w-full text-xs px-1.5 py-1 rounded bg-secondary-900 border border-primary-400 text-text text-center outline-none"
                />
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditingManualIndex(idx);
                    setEditingManualName(m);
                  }}
                  className="focus:outline-none cursor-pointer group-hover:scale-105 transition-all"
                  title="Klik untuk ubah nama"
                  aria-label={`Ubah nama ${m}`}
                >
                  <Avatar alt={m} size="lg" className="shadow-md border border-secondary-800" />
                </button>
                <p
                  onClick={() => {
                    setEditingManualIndex(idx);
                    setEditingManualName(m);
                  }}
                  className="text-2xs text-text font-semibold wrap-break-word w-full text-center leading-tight cursor-pointer hover:underline"
                  title="Klik untuk ubah nama"
                >
                  {m}
                </p>
                <button
                  type="button"
                  onClick={() => setManualMembers((prev) => prev.filter((x) => x !== m))}
                  className="absolute -top-1 -right-1 bg-danger-600 hover:bg-danger-700 text-white rounded-full size-5 flex items-center justify-center text-2xs font-bold shadow-md cursor-pointer transition-all active:scale-90"
                  title="Hapus"
                  aria-label={`Hapus ${m}`}
                >
                  <XClose className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
