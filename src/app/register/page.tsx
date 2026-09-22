"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await signUp.email({
        name,
        email,
        password,
        callbackURL: "/tongkrongan",
      });

      if (response.error) {
        setError(response.error.message || "Gagal mendaftar. Email mungkin sudah terdaftar.");
      } else {
        router.push("/tongkrongan");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan server saat mencoba mendaftar.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center p-6 relative overflow-hidden bg-transparent">


      <div className="w-full z-10 space-y-6 max-w-sm mx-auto">
        <div className="text-center space-y-1.5">
          <Link href="/" className="text-2xl font-extrabold text-primary-400">
            Ceban Pertama
          </Link>
          <h2 className="text-lg font-bold text-text-50">Gabung yuk!</h2>
        </div>

        {error && (
          <div className="p-3 text-xs text-secondary-200 bg-secondary-900 border border-secondary-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Input
              id="name"
              type="text"
              isRequired
              label="Nama lo"
              value={name}
              onChange={setName}
              placeholder="Panggilan atau nama lengkap"
              size="md"
            />
          </div>

          <div className="space-y-1.5">
            <Input
              id="email"
              type="email"
              isRequired
              label="Email lo"
              value={email}
              onChange={setEmail}
              placeholder="nama@email.com"
              size="md"
            />
          </div>

          <div className="space-y-1.5">
            <Input
              id="password"
              type="password"
              isRequired
              label="Bikin password"
              value={password}
              onChange={setPassword}
              placeholder="Minimal 6 karakter ya"
              size="md"
            />
          </div>

          <Button
            type="submit"
            isDisabled={loading}
            isLoading={loading}
            size="md"
            className="w-full py-3 "
          >
            Daftar Sekarang!
          </Button>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs text-text-50">
            Udah punya akun?{" "}
            <Link href="/login" className="text-primary-400 hover:underline">
              Masuk aja
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

