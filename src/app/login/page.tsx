"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { Button } from "@/components/base/buttons/button";
import { GoogleIcon } from "@/components/foundations/social-icons/google-icon";
import { ArrowLeft, ArrowRight, Mail01, Lock01, AlertCircle } from "@untitledui/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/tongkrongan",
      });
    } catch (err) {
      console.error(err);
      setError("Gagal masuk pake Google nih. Cek koneksi internet lo ya, Bos!");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email lo jangan dikosongin ya, Bos!");
      return;
    }

    if (!password) {
      setError("Password lo jangan dikosongin ya, Bos!");
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
            ? "Email atau password lo gak cocok nih, coba cek lagi ya!"
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
              Masuk Akun.
            </h1>
            <p className="text-sm text-text-400 leading-normal font-normal text-pretty">
              Masuk buat lanjutin dan pantau semua pete-petean lo.
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

          <div className="space-y-4">
            <Button
              type="button"
              color="secondary"
              size="lg"
              isDisabled={googleLoading || loading}
              isLoading={googleLoading}
              iconLeading={GoogleIcon}
              onPress={handleGoogleSignIn}
              className="w-full min-h-12 rounded-lg font-bold text-sm text-text border border-secondary-800 bg-secondary-950/60 hover:bg-secondary-900 active:scale-[0.97] transition-all"
            >
              Lanjut pake Google
            </Button>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-800/80" />
              </div>
              <span className="relative px-3 bg-background text-2xs font-medium uppercase tracking-wider text-text-400 select-none">
                atau
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center">
                <Label isRequired>Password lo</Label>
              </div>
              <Input
                id="password"
                type="password"
                isRequired
                icon={Lock01}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                size="md"
                autoComplete="current-password"
              />
              <div className="flex justify-end pt-0.5">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
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
                Masuk Sekarang
              </Button>
            </div>
          </form>
          </div>

          <div className="pt-6 border-t border-secondary-800/70">
            <p className="text-xs text-text-400">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-bold text-primary-400 hover:underline"
              >
                Bikin akun baru
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
