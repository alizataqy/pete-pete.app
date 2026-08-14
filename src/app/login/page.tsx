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
    setLoading(true);
    setError("");

    try {
      const response = await signIn.email({
        email,
        password,
        callbackURL: "/tongkrongan",
      });

      if (response.error) {
        setError(response.error.message || "Gagal masuk. Silakan cek kembali email & password Anda.");
      } else {
        router.push("/tongkrongan");
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan server saat mencoba login.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center p-6 relative overflow-hidden bg-transparent">
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <Link href="/">
          <Button size="xs">
            <ArrowLeft />
          </Button>
        </Link>
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
            size="md"
            className="w-full py-3 hover:from-primary-600 hover:to-primary-700"
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

