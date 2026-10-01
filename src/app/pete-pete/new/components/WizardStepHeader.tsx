"use client";

import React from "react";

interface WizardStepHeaderProps {
  wizardStep: number;
  step1Title: string;
}

export default function WizardStepHeader({
  wizardStep,
  step1Title,
}: WizardStepHeaderProps) {
  return (
    <div className="bg-secondary-950/40 border border-secondary-800/80 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-primary-400 uppercase tracking-wider flex items-center gap-2 min-w-0">
          <span className="w-5 h-5 rounded-md bg-primary-400/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold shrink-0">
            {wizardStep}
          </span>
          <span className="truncate">
            {wizardStep === 1 && step1Title}
            {wizardStep === 2 && "Langkah 2: Tambah Teman Patungan"}
            {wizardStep === 3 && "Langkah 3: Info Rekening & Bayar"}
          </span>
        </span>
        <span className="text-2xs font-bold text-text-400 bg-secondary-900/60 px-2.5 py-0.5 rounded-full border border-secondary-800/60 shrink-0">
          {wizardStep} dari 3
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            wizardStep >= 1
              ? "bg-primary-400"
              : "bg-secondary-800"
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            wizardStep >= 2
              ? "bg-primary-400"
              : "bg-secondary-800"
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            wizardStep >= 3
              ? "bg-primary-400"
              : "bg-secondary-800"
          }`}
        />
      </div>
    </div>
  );
}
