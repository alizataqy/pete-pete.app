"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { ArrowLeft, ArrowRight, Lock01, AlertCircle, CheckCircle } from "@untitledui/icons";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const urlError = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    urlError === "INVALID_TOKEN" ? "Link reset ini udah gak bisa dipake atau udah kadaluwarsa ya, Bos!" : ""
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token reset gak ketemu nih. Coba klik lagi link yang di email ya!");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password baru minimal 6 karakter ya biar aman!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password gak cocok nih, coba cek lagi ya!");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        newPassword: password,
        token,
      });

      if (response.error) {
        setError(response.error.message || "Gagal ganti password nih. Coba minta link baru ya!");
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal terhubung ke server nih. Cek koneksi internet lo ya, Bos!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-text leading-tight text-balance">
          Bikin Password Baru.
        </h1>
        <p className="text-sm text-text-400 leading-normal font-normal text-pretty">
          Bikin password baru yang aman dan gampang lo inget ya.
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

      {isSuccess ? (
        <div className="space-y-5 rounded-xl border border-secondary-800/80 bg-secondary-950/40 p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text">Password Baru Udah Beres!</h3>
              <p className="text-xs text-text-300 leading-relaxed text-pretty">
                Password akun lo udah ganti. Sekarang langsung gas masuk lagi yuk!
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              href="/login"
              color="primary"
              size="lg"
              iconTrailing={ArrowRight}
              className="w-full min-h-12 rounded-lg font-bold text-sm"
            >
              Masuk Sekarang
            </Button>
          </div>
        </div>
      ) : !token || urlError === "INVALID_TOKEN" ? (
        <div className="space-y-5 rounded-xl border border-secondary-800/80 bg-secondary-950/40 p-5">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text">Link-nya Udah Basi Nih</h3>
            <p className="text-xs text-text-400 leading-relaxed text-pretty">
              Link reset ini kayaknya udah lewat sejam atau udah pernah lo pake. Bikin link baru aja yuk!
            </p>
          </div>
          <Button
            href="/forgot-password"
            color="primary"
            size="md"
            className="w-full min-h-11 rounded-lg font-bold text-xs"
          >
            Minta Link Baru
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Input
              id="password"
              type="password"
              isRequired
              label="Password baru"
              icon={Lock01}
              value={password}
              onChange={setPassword}
              placeholder="Minimal 6 karakter"
              size="md"
              autoComplete="new-password"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Input
              id="confirmPassword"
              type="password"
              isRequired
              label="Ulangi password baru"
              icon={Lock01}
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
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
              Simpan Password Baru
            </Button>
          </div>
        </form>
      )}

      <div className="pt-6 border-t border-secondary-800/70">
        <p className="text-xs text-text-400">
          Inget password lama?{" "}
          <Link
            href="/login"
            className="font-bold text-primary-400 hover:underline"
          >
            Langsung masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background relative overflow-y-auto scrollbar-hide">
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-background/90 backdrop-blur-md border-b border-secondary-800/80 px-4 sm:px-6 flex items-center justify-between">
        <Button
          href="/login"
          color="secondary"
          size="sm"
          aria-label="Kembali ke login"
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
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-text-400">Bentar, lagi disiapin...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
