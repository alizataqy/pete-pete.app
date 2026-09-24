"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { ArrowLeft } from "@untitledui/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email lo jangan dikosongin ya, Bos!");
      return;
    }

    if (!password) {
      setError("Kata sandi lo jangan dikosongin ya!");
      return;
    }

    setLoading(true);

    try {
      const response = await signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/tongkrongan",
      });

      if (response.error) {
        const raw = response.error.message || "";
        const friendlyMessage =
          /invalid|credential|password|user|not\s*found/i.test(raw)
            ? "Email atau kata sandi lo gak cocok nih, coba cek lagi ya!"
            : "Gagal masuk nih, coba cek lagi akun lo ya!";
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
    <main className="flex-1 flex flex-col justify-center p-6 relative overflow-hidden bg-transparent">
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <Button
          href="/"
          color="secondary"
          size="sm"
          aria-label="Kembali ke beranda"
          className="min-w-11 min-h-11 p-2 rounded-lg flex items-center justify-center active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </header>

      <div className="w-full z-10 space-y-6 max-w-sm mx-auto">
        <div className="text-center space-y-1.5">
          <Link href="/" className="text-2xl font-extrabold text-primary-400">
            Ceban Pertama
          </Link>
          <h2 className="text-lg font-bold text-text-50">Balik lagi!</h2>
          <p className="text-xs text-text-300">Masuk dulu yuk</p>
        </div>

        {error && (
          <div className="p-3 text-xs text-secondary-200 bg-secondary-900 text-error border border-secondary-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              label="Password lo"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              size="md"
            />
          </div>

          <Button
            type="submit"
            isDisabled={loading}
            isLoading={loading}
            color="primary"
            size="lg"
            className="w-full min-h-12 py-3.5 rounded-lg font-bold text-sm active:scale-[0.96] transition-transform"
          >
            Masuk
          </Button>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs text-text-50">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary-400 hover:underline">
              Daftar sini dong
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

