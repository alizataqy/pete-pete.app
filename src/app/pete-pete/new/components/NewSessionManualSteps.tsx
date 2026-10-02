"use client";

import React from "react";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Trash01, ReceiptCheck } from "@untitledui/icons";
import { ScanItem } from "../types";
import WizardStepHeader from "./WizardStepHeader";
import MemberManagerStep from "./MemberManagerStep";
import FeeAdjustmentsFields from "./FeeAdjustmentsFields";
import ItemInputForm from "./ItemInputForm";

interface NewSessionManualStepsProps {
  wizardStep: number;
  draftItemName: string;
  setDraftItemName: (val: string) => void;
  draftItemQty: string;
  handleDraftItemQtyChange: (val: string) => void;
  addPriceMode: "unit" | "total";
  setAddPriceMode: (val: "unit" | "total") => void;
  draftItemPrice: string;
  handleDraftItemPriceChange: (val: string) => void;
  draftItemAmount: string;
  handleDraftItemAmountChange: (val: string) => void;
  handleAddManualItem: () => void;
  manualItems: ScanItem[];
  setManualItems: React.Dispatch<React.SetStateAction<ScanItem[]>>;
  manualTax: number;
  setManualTax: (val: number) => void;
  manualTip: number;
  setManualTip: (val: number) => void;
  manualDiscount: number;
  setManualDiscount: (val: number) => void;
  manualSubtotal: number;
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
  detailsForm: React.ReactNode;
}

export default function NewSessionManualSteps({
  wizardStep,
  draftItemName,
  setDraftItemName,
  draftItemQty,
  handleDraftItemQtyChange,
  addPriceMode,
  setAddPriceMode,
  draftItemPrice,
  handleDraftItemPriceChange,
  draftItemAmount,
  handleDraftItemAmountChange,
  handleAddManualItem,
  manualItems,
  setManualItems,
  manualTax,
  setManualTax,
  manualTip,
  setManualTip,
  manualDiscount,
  setManualDiscount,
  manualSubtotal,
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
  detailsForm,
}: NewSessionManualStepsProps) {
  return (
    <div className="space-y-4 pb-4">
      {/* Step Indicator */}
      <WizardStepHeader
        wizardStep={wizardStep}
        step1Title="Langkah 1: Input Daftar Menu"
      />

      {/* WIZARD STEP 1: INPUT ITEMS */}
      {wizardStep === 1 && (
        <div className="space-y-4">
          {/* Form Input Item & Biaya */}
          <div
            id="tour-manual-items"
            className="bg-secondary-950/40 border border-secondary-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary-400/10 border border-primary-400/20 text-primary-400 shrink-0">
                <ReceiptCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold text-text-50 uppercase tracking-wider">
                  Masukin Semua Menu Dulu
                </h2>
                <p className="text-2xs text-text-400">Tulis menu makanan, minuman, porsi, dan harganya</p>
              </div>
            </div>

            {/* Reusable Item Input Form */}
            <ItemInputForm
              name={draftItemName}
              setName={setDraftItemName}
              qty={draftItemQty}
              onQtyChange={handleDraftItemQtyChange}
              priceMode={addPriceMode}
              setPriceMode={setAddPriceMode}
              price={draftItemPrice}
              onPriceChange={handleDraftItemPriceChange}
              amount={draftItemAmount}
              onAmountChange={handleDraftItemAmountChange}
              onAdd={handleAddManualItem}
              buttonLabel="Tambah Menu Ini"
            />

            {/* Pajak, Service Charge, & Diskon */}
            <FeeAdjustmentsFields
              tax={manualTax}
              onTaxChange={setManualTax}
              tip={manualTip}
              onTipChange={setManualTip}
              discount={manualDiscount}
              onDiscountChange={setManualDiscount}
            />
          </div>

          {/* List Menu yang Udah Ditambahin */}
          {manualItems.length > 0 && (
            <div className="bg-secondary-950/40 border border-secondary-800/80 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-extrabold text-text-50 uppercase tracking-wider">
                    Menu Ditambahkan
                  </h3>
                  <Badge color="brand" size="sm" type="pill-color" className="font-bold text-3xs">
                    {manualItems.length} Menu
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                {manualItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-secondary-900/50 border border-secondary-800/80 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-secondary-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-lg bg-secondary-800/80 border border-secondary-700/80 text-text-300 flex items-center justify-center text-3xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-bold text-text-50 block truncate">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-2xs text-text-400">
                          <span className="bg-secondary-950/80 px-1.5 py-0.2 rounded border border-secondary-800/60">
                            {item.quantity}x
                          </span>
                          <span>&bull;</span>
                          <span>@ Rp {Math.round(item.unitPrice).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs sm:text-sm font-extrabold text-text-50 tabular-nums">
                        Rp {item.totalPrice.toLocaleString("id-ID")}
                      </span>
                      <Button
                        size="xs"
                        color="tertiary-destructive"
                        onPress={() => setManualItems((prev) => prev.filter((_, i) => i !== idx))}
                        aria-label={`Hapus ${item.name}`}
                        iconLeading={Trash01}
                        className="p-1.5 text-danger-400 hover:bg-danger-950/40 rounded-lg active:scale-95 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Sementara */}
              <div className="flex justify-between items-center pt-3 border-t border-secondary-800/80">
                <span className="text-xs font-extrabold uppercase tracking-wider text-text-300">
                  Total Sementara
                </span>
                <span className="text-sm sm:text-base font-black text-primary-400 tabular-nums">
                  Rp {manualSubtotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WIZARD STEP 2: INPUT MEMBERS */}
      {wizardStep === 2 && (
        <MemberManagerStep
          newMemberInput={newMemberInput}
          setNewMemberInput={setNewMemberInput}
          handleAddMember={handleAddMember}
          manualMembers={manualMembers}
          setManualMembers={setManualMembers}
          currentUserName={currentUserName}
          editingManualIndex={editingManualIndex}
          setEditingManualIndex={setEditingManualIndex}
          editingManualName={editingManualName}
          setEditingManualName={setEditingManualName}
          handleSaveManualRename={handleSaveManualRename}
        />
      )}

      {/* WIZARD STEP 3: DETAILS */}
      {wizardStep === 3 && (
        <div className="space-y-4">
          {/* Form Detail Rekening & Judul */}
          {detailsForm}
        </div>
      )}
    </div>
  );
}
