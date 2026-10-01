"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { ArrowLeft, ArrowRight, User01, Mail01, Lock01, AlertCircle } from "@untitledui/icons";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama panggilan lo jangan dikosongin ya!");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Format email lo belum pas nih, coba cek lagi ya!");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password minimal 6 karakter ya biar akun lo aman!");
      return;
    }

    setLoading(true);

    try {
      const response = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: "/tongkrongan",
      });

      if (response.error) {
        const raw = response.error.message || "";
        const friendlyMessage =
          /already|exists|registered/i.test(raw)
            ? "Email ini udah pernah kedaftar, Bos. Langsung masuk aja!"
            : "Gagal daftar nih, coba pastiin data lo bener ya!";
        setError(friendlyMessage);
      } else {
        router.push("/tongkrongan");
      }
    } catch (error) {
      console.error(error);
      setError("Gagal terhubung ke server nih. Cek koneksi internet lo ya, Bos!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background relative overflow-y-auto scrollbar-hide">
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-background/90 backdrop-blur-md border-b border-secondary-800/80 px-4 sm:px-6 flex items-center justify-between">
        <Button
          href="/"
          color="secondary"
          size="sm"
          aria-label="Kembali ke beranda"
          className="min-w-10 min-h-10 w-10 h-10 p-0 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-text" />
        </Button>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-extrabold text-primary-400 group">
          <Image
            src="/logo.svg"
            alt="Ceban Pertama"
            width={22}
            height={22}
            className="w-5.5 h-5.5 rounded-sm"
            priority
          />
          <span>Ceban Pertama</span>
        </Link>
        <div className="w-10 h-10 shrink-0" aria-hidden="true" />
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-sm w-full mx-auto">
        <div className="space-y-8">
          {/* Swiss Typography Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-text leading-tight text-balance">
              Bikin Akun.
            </h1>
            <p className="text-sm text-text-400 leading-normal font-normal text-pretty">
              Daftar sekali buat simpen riwayat dan pantau pete-petean bareng sohib.
            </p>
          </div>

          {error && (
            <div
              className="p-3 text-xs text-danger-300 bg-danger-950/40 border border-danger-800/80 rounded-lg flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-danger-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Input
                id="name"
                type="text"
                isRequired
                label="Nama panggilan lo"
                icon={User01}
                value={name}
                onChange={setName}
                placeholder="Misal: Dimas / Rania"
                size="md"
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Input
                id="email"
                type="email"
                isRequired
                label="Email lo"
                icon={Mail01}
                value={email}
                onChange={setEmail}
                placeholder="nama@email.com"
                size="md"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Input
                id="password"
                type="password"
                isRequired
                label="Bikin password"
                icon={Lock01}
                value={password}
                onChange={setPassword}
                placeholder="Minimal 6 karakter"
                size="md"
                autoComplete="new-password"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                isDisabled={loading}
                isLoading={loading}
                color="primary"
                size="lg"
                iconTrailing={ArrowRight}
                className="w-full min-h-12 rounded-lg font-bold text-sm active:scale-[0.97] transition-transform"
              >
                Bikin Akun Sekarang
              </Button>
            </div>
          </form>

          <div className="pt-6 border-t border-secondary-800/70">
            <p className="text-xs text-text-400">
              Udah punya akun?{" "}
              <Link
                href="/login"
                className="font-bold text-primary-400 hover:underline"
              >
                Langsung masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
