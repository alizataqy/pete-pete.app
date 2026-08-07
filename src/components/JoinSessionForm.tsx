"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { joinSessionByCode } from "@/app/actions/session";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";

interface JoinSessionFormProps {
  userId: string;
  userName: string;
}

export default function JoinSessionForm({ userId, userName }: JoinSessionFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await joinSessionByCode(code.trim(), userId, userName);
      if (res.success && res.sessionId) {
        setSuccess(true);
        router.push(`/pete-pete/${res.sessionId}/split`);
      } else {
        setError(res.error || "Gagal bergabung ke sesi.");
      }
    } catch (err) {
      console.log(err);
      setError("Terjadi kesalahan server saat mencoba bergabung.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-secondary-800 bg-text-900 space-y-3">
      <div>
        <h3 className="text-xs font-bold text-text-100 uppercase tracking-wider">Gabung Sesi</h3>
        <p className="text-[10px] text-text-300 mt-0.5">
          Minta kode 6 digit dari temen lo yang bikin sesi, terus masukin di sini.
        </p>
      </div>

      {error && (
        <div className="p-2.5 text-[10px] text-secondary-200 bg-secondary-900 border border-secondary-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-2.5 text-[10px] text-emerald-300 bg-emerald-950 border border-emerald-800 rounded-lg">
          Berhasil! Nunggu bentar ya...
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            type="text"
            isRequired
            maxLength={8}
            value={code}
            onChange={setCode}
            inputClassName="uppercase tracking-widest font-bold text-center"
            placeholder="KODE"
            size="sm"
          />
        </div>
        <Button
          type="submit"
          isDisabled={loading || success}
          isLoading={loading}
          size="sm"
        >
          Ikut!
        </Button>
      </form>
    </div>
  );
}

