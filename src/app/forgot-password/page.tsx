"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { requestPasswordReset } from "@/lib/auth-client";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { ArrowLeft, ArrowRight, Mail01, AlertCircle, CheckCircle } from "@untitledui/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Masukin alamat email yang bener ya, Bos!");
      return;
    }

    setLoading(true);

    try {
      const response = await requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });

      if (response.error) {
        setError(response.error.message || "Gagal kirim link reset nih. Coba bentar lagi ya!");
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
    <main className="flex-1 flex flex-col min-h-screen bg-background relative overflow-y-auto scrollbar-hide">
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-background/90 backdrop-blur-md border-b border-secondary-800/80 px-4 sm:px-6 flex items-center justify-between">
        <Button
          href="/login"
          color="secondary"
          size="sm"
          aria-label="Kembali ke halaman login"
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
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-text leading-tight text-balance">
              Lupa Password.
            </h1>
            <p className="text-sm text-text-400 leading-normal font-normal text-pretty">
              Masukin email akun lo. Ntar dikirimin link buat bikin password baru.
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
                  <h3 className="text-sm font-bold text-text">Link Udah Meluncur!</h3>
                  <p className="text-xs text-text-300 leading-relaxed text-pretty">
                    Link reset password udah dikirim ke <strong className="text-text-50 font-semibold">{email}</strong>. Cek inbox atau folder spam lo ya, Bos.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  href="/login"
                  color="primary"
                  size="md"
                  className="w-full font-bold text-xs rounded-lg min-h-11"
                >
                  Balik ke Halaman Masuk
                </Button>
                <Button
                  onPress={() => setIsSuccess(false)}
                  color="secondary"
                  size="xs"
                  className="w-full text-xs font-medium text-text-400 hover:text-text rounded-lg py-2"
                >
                  Kirim ke email lain
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  id="email"
                  type="email"
                  isRequired
                  label="Email akun lo"
                  icon={Mail01}
                  value={email}
                  onChange={setEmail}
                  placeholder="nama@email.com"
                  size="md"
                  autoComplete="email"
                  autoFocus
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
                  Kirim Link Reset
                </Button>
              </div>
            </form>
          )}

          <div className="pt-6 border-t border-secondary-800/70">
            <p className="text-xs text-text-400">
              Inget password lo?{" "}
              <Link
                href="/login"
                className="font-bold text-primary-400 hover:underline"
              >
                Langsung masuk aja
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
