"use client";

import React from "react";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { Heading } from "react-aria-components";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { Check } from "@untitledui/icons";
import { Member, formatRupiah, parseRupiah } from "../types";

interface AgendaExpenseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingExpenseId: string | null;
  expenseTitle: string;
  setExpenseTitle: (val: string) => void;
  expenseAmount: string;
  setExpenseAmount: (val: string) => void;
  expensePayerId: string;
  setExpensePayerId: (val: string) => void;
  expenseParticipants: string[];
  setExpenseParticipants: React.Dispatch<React.SetStateAction<string[]>>;
  members: Member[];
  userId: string;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleClose: () => void;
  handleToggleParticipant: (memberId: string) => void;
}

export default function AgendaExpenseModal({
  isOpen,
  onOpenChange,
  editingExpenseId,
  expenseTitle,
  setExpenseTitle,
  expenseAmount,
  setExpenseAmount,
  expensePayerId,
  setExpensePayerId,
  expenseParticipants,
  setExpenseParticipants,
  members,
  userId,
  loading,
  handleSubmit,
  handleClose,
  handleToggleParticipant,
}: AgendaExpenseModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal className="w-full max-w-sm overflow-hidden bg-active text-text p-5">
        <Dialog className="outline-hidden">
          {() => (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1">
                <Heading slot="title" className="text-sm font-bold text-text">
                  {editingExpenseId ? "Ubah Rincian Pengeluaran" : "Catat Pengeluaran Baru"}
                </Heading>
                <p className="text-2xs text-text-400">
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
                <div className="space-y-1.5">
                  <label className="text-3xs font-bold text-text-400 uppercase block">Siapa yang Bayar?</label>
                  <div className="flex flex-wrap gap-3.5 max-h-28 overflow-y-auto p-1 scrollbar-hide">
                    {members.map((m) => {
                      const isSelected = expensePayerId === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setExpensePayerId(m.id)}
                          className="flex flex-col items-center gap-1.5 w-12 shrink-0 focus:outline-hidden active:scale-95 transition-all cursor-pointer group min-h-14"
                        >
                          <div className="relative min-w-11 min-h-11 flex items-center justify-center">
                            <Avatar
                              alt={m.name}
                              size="md"
                              className={`shadow-md transition-all duration-200 border border-secondary-800 ${
                                isSelected
                                  ? "ring-2 ring-primary border-primary scale-105"
                                  : "opacity-40 group-hover:opacity-75"
                              }`}
                            />
                            {isSelected && (
                              <span className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-md border border-secondary-950 pointer-events-none">
                                <Check className="w-2.5 h-2.5 stroke-[3px]" />
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-2xs wrap-break-word w-full text-center leading-tight font-semibold ${
                              isSelected ? "text-text font-bold" : "text-text-400"
                            }`}
                          >
                            {m.name}
                            {m.userId === userId && " (Gua)"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Participants checkboxes */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-3xs font-bold text-text-400 uppercase block">Sohib yang Ikut Pete-Pete</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (expenseParticipants.length === members.length) {
                          setExpenseParticipants([]);
                        } else {
                          setExpenseParticipants(members.map((m) => m.id));
                        }
                      }}
                      className="text-3xs font-semibold text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
                    >
                      {expenseParticipants.length === members.length ? "Batal Semua" : "Pilih Semua"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3.5 max-h-30 overflow-y-auto p-1 scrollbar-hide">
                    {members.map((m) => {
                      const isParticipating = expenseParticipants.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleToggleParticipant(m.id)}
                          className="flex flex-col items-center gap-1.5 w-12 shrink-0 focus:outline-hidden active:scale-95 transition-all cursor-pointer group min-h-14"
                        >
                          <div className="relative min-w-11 min-h-11 flex items-center justify-center">
                            <Avatar
                              alt={m.name}
                              size="md"
                              className={`shadow-md transition-all duration-200 border border-secondary-800 ${
                                isParticipating
                                  ? "ring-2 ring-primary border-primary scale-105"
                                  : "opacity-40 group-hover:opacity-75"
                              }`}
                            />
                            {isParticipating && (
                              <span className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-md border border-secondary-950 pointer-events-none">
                                <Check className="w-2.5 h-2.5 stroke-[3px]" />
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-2xs wrap-break-word w-full text-center leading-tight font-semibold ${
                              isParticipating ? "text-text font-bold" : "text-text-400"
                            }`}
                          >
                            {m.name}
                            {m.userId === userId && " (Gua)"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <Button
                  type="button"
                  onPress={handleClose}
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
                  Simpan Biaya
                </Button>
              </div>
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
