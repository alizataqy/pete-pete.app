"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Ticket01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

export default function JoinBonInput() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode) {
      router.push(`/bon/${cleanCode}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-2.5 rounded-xl border border-secondary-800 bg-secondary-950/40 flex items-center gap-2.5"
    >
      <div className="p-2 rounded-lg bg-secondary-900 border border-secondary-800 text-primary-400 shrink-0">
        <Ticket01 className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Masukan Kode Bon"
          maxLength={6}
          className="w-full bg-transparent text-xs font-semibold text-text placeholder:text-text-500 outline-none uppercase tracking-wider"
          aria-label="Masukkan kode bon patungan"
        />
      </div>
      <Button
        type="submit"
        aria-label="Buka"
        iconTrailing={<ArrowRight className="w-3.5 h-3.5" />}
        size="xs"
        color="secondary"
        isDisabled={code.trim().length !== 6}
        className="min-h-9 px-3 rounded-lg text-xs font-bold active:scale-95 transition-transform shrink-0"
      >
        Buka
      </Button>
    </form>
  );
}
