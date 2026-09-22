"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Camera01,
  Users01,
  MessageChatCircle,
  Coins01,
  CheckCircle,
  ArrowRight,
  Zap,
  Star01,
  Lock01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";

interface UserSessionProp {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export default function LandingView({ user }: UserSessionProp) {
  const [activeStep, setActiveStep] = useState<"ocr" | "split" | "share">("ocr");

  const steps = [
    {
      id: "ocr" as const,
      number: "1",
      tabTitle: "1. Foto Struk",
      title: "Jepret Struk Makan Lo",
      desc: "Gak usah capek ngetik ulang menu satu per satu. AI otomatis baca nama menu, harga satuan, sampe pajak restoran dalam hitungan detik.",
      badge: "Deteksi Otomatis",
      icon: Camera01,
      details: [
        "Deteksi menu & harga secara instan",
        "Pajak & service charge langsung terhitung",
        "Struk lecek atau panjang tetep kebaca",
      ],
    },
    {
      id: "split" as const,
      number: "2",
      tabTitle: "2. Tandai Menu",
      title: "Tentukan Siapa Makan Apa",
      desc: "Tinggal klik nama temen lo di menu yang dia pesen. Kalau ada menu yang dimakan barengan, tinggal bagi rata tanpa pusing.",
      badge: "Fleksibel Banget",
      icon: Users01,
      details: [
        "Tandai pesanan per nama temen",
        "Bisa bagi rata untuk menu sharing",
        "Porsi & harga dibagi proporsional",
      ],
    },
    {
      id: "share" as const,
      number: "3",
      tabTitle: "3. Kirim ke WA",
      title: "Kirim Rincian Langsung ke Grup",
      desc: "Format pesan WhatsApp rapi langsung siap kirim. Lengkap sama nominal pas tiap orang dan nomor rekening atau QRIS lo.",
      badge: "Sekali Tap",
      icon: MessageChatCircle,
      details: [
        "Rincian transparan, no debat",
        "Langsung ada nomor rekening / E-Wallet",
        "Gak ada lagi drama nagih manual",
      ],
    },
  ];

  const currentStep = steps.find((s) => s.id === activeStep) || steps[0];
  const StepIcon = currentStep.icon;

  return (
    <div data-landing-view className="flex-1 flex flex-col bg-background text-text pb-20 overflow-y-auto overflow-x-hidden w-full items-center relative">

      {/* Header Navigation */}
      <header className="w-full max-w-5xl px-6 py-5 flex items-center justify-between z-30">
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-lg transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <span className="font-black text-text text-lg tracking-tight">Ceban Pertama</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Button
              href="/tongkrongan"
              iconTrailing={ArrowRight}
              className="py-2 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.97] text-white font-bold text-xs shadow-md shadow-primary/20 transition-transform duration-150 ease-out cursor-pointer"
            >
              Tongkrongan Gua
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                href="/login"
                color="secondary"
                className="py-2 px-3.5 rounded-xl border border-secondary-800 bg-text-950/40 hover:bg-text-900 active:scale-[0.97] text-text-200 text-xs font-semibold transition-transform duration-150 ease-out cursor-pointer"
              >
                Masuk
              </Button>
              <Button
                href="/pete-pete/new"
                className="py-2 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.97] text-white font-bold text-xs shadow-md shadow-primary/20 transition-transform duration-150 ease-out cursor-pointer"
              >
                Coba Gratis
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Landmark */}
      <main id="main-content" className="w-full flex flex-col items-center">

        {/* Hero Section */}
        <section className="relative px-6 pt-12 pb-16 text-center overflow-hidden w-full max-w-4xl flex flex-col items-center z-10">

          {/* Badge */}
          <Badge
            color="brand"
            size="md"
            type="pill-color"
            className="mb-6 font-semibold tracking-wide inline-flex items-center gap-2"
          >
            <Camera01 className="w-3.5 h-3.5 text-primary-400" />
            <span>Cara Paling Simpel Bagi Tagihan Makan</span>
          </Badge>

          {/* Hero Content */}
          <div className="space-y-6 text-center flex flex-col items-center max-w-2xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-text leading-[1.15] [text-wrap:balance]">
              Bagi Tagihan Makan <br />
              <span className="text-primary-400">
                Tinggal Foto Struk Aja!
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-text-300 leading-relaxed max-w-lg [text-wrap:pretty]">
              Gak perlu lagi capek ngitung manual pake kalkulator. Foto struknya, pilih siapa makan apa, langsung kirim rinciannya ke WhatsApp temen lo. Beres seketika!
            </p>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-400 py-1 justify-center">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-text-900/60 border border-secondary-800/30">
                <Star01 className="w-3.5 h-3.5 text-warning-500" />
                <span className="font-semibold text-text-100">100% Gratis</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-text-900/60 border border-secondary-800/30">
                <Lock01 className="w-3.5 h-3.5 text-primary-400" />
                <span className="font-semibold text-text-100">Tanpa Wajib Login</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-text-900/60 border border-secondary-800/30">
                <Zap className="w-3.5 h-3.5 text-warning-400" />
                <span className="font-semibold text-text-100">Hitung Pajak Otomatis</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2 justify-center">
              {user ? (
                <Button
                  href="/tongkrongan"
                  iconTrailing={ArrowRight}
                  className="w-full py-3.5 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 active:scale-[0.97] text-white font-extrabold text-sm shadow-lg shadow-primary/25 transition-transform duration-150 ease-out flex items-center justify-center gap-2 cursor-pointer"
                >
                  Buka Tongkrongan Gua
                </Button>
              ) : (
                <>
                  <Button
                    href="/pete-pete/new"
                    iconTrailing={ArrowRight}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 active:scale-[0.97] text-white font-extrabold text-sm shadow-lg shadow-primary/25 transition-transform duration-150 ease-out flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Foto Struk Sekarang
                  </Button>
                  <Button
                    href="/register"
                    color="secondary"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-secondary-800 bg-text-950/40 text-text-100 hover:text-white hover:bg-text-900 active:scale-[0.97] text-sm font-bold transition-transform duration-150 ease-out cursor-pointer"
                  >
                    Daftar Akun
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Cara Pakenya: 3 Langkah Mudah & Interaktif */}
        <section className="px-6 py-10 w-full max-w-5xl z-10">
          <div className="p-6 md:p-10 rounded-3xl border border-secondary-800/40 bg-text-950/30 backdrop-blur-md space-y-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-secondary-900/50 pb-6">
              <div className="text-left space-y-1.5">
                <h2 className="text-xs font-black text-primary-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary-400" /> Cara Pakenya
                </h2>
                <p className="text-2xl md:text-3xl font-extrabold text-text [text-wrap:balance]">
                  Cuma 3 Langkah, Patungan Beres
                </p>
              </div>

              {/* Steps Tabs Selector */}
              <div
                role="tablist"
                aria-label="Langkah cara pakai"
                className="grid grid-cols-3 gap-1 bg-text-950/90 p-1.5 rounded-2xl border border-secondary-800/20 w-full max-w-xs md:max-w-sm"
              >
                {steps.map((step) => {
                  const isSelected = activeStep === step.id;
                  return (
                    <button
                      key={step.id}
                      id={`tab-${step.id}`}
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls={`panel-${step.id}`}
                      tabIndex={isSelected ? 0 : -1}
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-transform duration-150 ease-out active:scale-[0.97] text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
                        isSelected
                          ? "bg-primary-600 text-white shadow-sm shadow-primary-600/30"
                          : "text-text-300 hover:text-text-50 bg-transparent"
                      }`}
                    >
                      {step.tabTitle}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Step Panel */}
            <div
              role="tabpanel"
              id={`panel-${currentStep.id}`}
              aria-labelledby={`tab-${currentStep.id}`}
              className="p-6 md:p-8 rounded-2xl bg-text-950/60 border border-secondary-800/20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-inner animate-in fade-in duration-150"
            >
              {/* Left Content */}
              <div className="md:col-span-7 space-y-5 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-950 border border-primary-900/60 flex items-center justify-center text-primary-400">
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <Badge size="sm" color="brand" type="pill-color" className="font-semibold text-xs">
                    {currentStep.badge}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-text">{currentStep.title}</h3>
                  <p className="text-xs sm:text-sm text-text-300 leading-relaxed [text-wrap:pretty]">
                    {currentStep.desc}
                  </p>
                </div>

                <div className="border-t border-secondary-900/60 pt-4 space-y-2.5">
                  {currentStep.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-primary-400 shrink-0" />
                      <span className="text-xs text-text-100 font-medium">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Mockup Preview */}
              <div className="md:col-span-5 flex justify-center bg-text-900/40 p-5 rounded-2xl border border-secondary-800/10 min-h-[200px]">
                {currentStep.id === "ocr" && (
                  <div className="w-full max-w-[260px] bg-text-950 p-4 rounded-xl border border-secondary-800/20 shadow-lg space-y-3 relative overflow-hidden animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-text-800 pb-2">
                      <span className="text-xs text-text-400 uppercase tracking-wider font-bold">Struk Makan</span>
                      <Badge size="sm" color="brand" type="pill-color" className="text-[11px] font-semibold">
                        Terbaca AI
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-100">Spicy Miso Ramen</span>
                        <span className="text-text-50 font-bold tabular-nums">Rp 45.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-100">Original Gyoza</span>
                        <span className="text-text-50 font-bold tabular-nums">Rp 28.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-100">Ocha Dingin</span>
                        <span className="text-text-50 font-bold tabular-nums">Rp 12.000</span>
                      </div>
                    </div>

                    <div className="border-t border-text-800 pt-2 flex justify-between text-xs text-primary-300 font-bold">
                      <span>Pajak Resto (10%)</span>
                      <span className="tabular-nums">Rp 8.500</span>
                    </div>
                  </div>
                )}

                {currentStep.id === "split" && (
                  <div className="w-full max-w-[260px] bg-text-950 p-4 rounded-xl border border-secondary-800/20 shadow-lg space-y-3 animate-in fade-in duration-200">
                    <div className="border-b border-text-800 pb-2">
                      <span className="text-xs text-text-400 uppercase tracking-wider font-bold">Pilih Pemilik Menu</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-2.5 rounded-lg bg-text-900/60 border border-secondary-800/20 flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Spicy Miso Ramen</span>
                          <span className="text-primary-300 tabular-nums">Rp 45.000</span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="text-[11px] bg-primary-900/60 border border-primary-800/40 text-primary-200 px-2 py-0.5 rounded-full font-medium">Budi</span>
                          <span className="text-[11px] bg-primary-950/60 border border-primary-900/40 text-primary-300 px-2 py-0.5 rounded-full font-medium">Ucup</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-text-900/60 border border-secondary-800/20 flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Original Gyoza</span>
                          <span className="text-primary-300 tabular-nums">Rp 28.000</span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="text-[11px] bg-primary-900/60 border border-primary-800/40 text-primary-200 px-2 py-0.5 rounded-full font-medium">Siti</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.id === "share" && (
                  <div className="w-full max-w-[260px] bg-background-950 p-4 rounded-xl border border-secondary-800/40 shadow-lg space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 border-b border-secondary-800/40 pb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs text-text-50 font-bold">Preview Pesan WA</span>
                    </div>

                    <div className="bg-background-900 p-3 rounded-xl text-xs text-text-100 space-y-1 border-s-2 border-primary-500">
                      <p className="font-bold text-primary-300">Rincian Patungan: Ramen</p>
                      <p className="text-text-300 text-[11px]">Budi: <strong className="text-text-50">Rp 57.000</strong></p>
                      <p className="text-text-300 text-[11px]">Ucup: <strong className="text-text-50">Rp 45.000</strong></p>
                      <div className="mt-2 text-center bg-primary-600 py-2 rounded-xl font-bold text-white text-xs shadow-sm shadow-primary-600/25">
                        Siap Kirim ke Grup WA
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Kenapa Ceban Pertama (Keunggulan Utama) */}
        <section className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-5xl z-10">
          <div className="p-6 rounded-3xl border border-secondary-800/40 bg-text-950/30 backdrop-blur-md text-left space-y-3">
            <div className="p-2.5 rounded-2xl bg-primary-950 border border-primary-900/40 w-fit text-primary-400">
              <Coins01 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-text">Pajak &amp; Diskon Dihitung Rata</h3>
            <p className="text-xs text-text-300 leading-relaxed [text-wrap:pretty]">
              Gak usah pusing ngitung PPN 10% atau service charge secara manual. Semuanya dibagi secara proporsional sesuai pesanan masing-masing.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-secondary-800/40 bg-text-950/30 backdrop-blur-md text-left space-y-3">
            <div className="p-2.5 rounded-2xl bg-primary-950 border border-primary-900/40 w-fit text-primary-400">
              <Users01 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-text">Hubungan Tongkrongan Aman</h3>
            <p className="text-xs text-text-300 leading-relaxed [text-wrap:pretty]">
              Rinciannya jelas dan transparan. Gak ada lagi yang ngerasa nombok atau bayar kemahalan. Selesai nongkrong, langsung beres!
            </p>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="px-6 py-8 w-full max-w-5xl z-10">
          <div className="p-8 sm:p-10 rounded-3xl border border-primary-800/40 bg-primary-950/30 backdrop-blur-md text-center flex flex-col items-center space-y-5 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text [text-wrap:balance]">
              Udah Kelar Nongkrong? Yuk Hitung Sekarang!
            </h2>
            <p className="text-xs sm:text-sm text-text-300 max-w-md leading-relaxed [text-wrap:pretty]">
              Cukup upload foto struk makan lo, sistem langsung beresin hitungannya dalam hitungan detik.
            </p>
            <Button
              href="/pete-pete/new"
              iconTrailing={ArrowRight}
              className="py-3.5 px-8 rounded-2xl bg-primary-600 hover:bg-primary-700 active:scale-[0.97] text-white font-extrabold text-sm shadow-lg shadow-primary/30 transition-transform duration-150 ease-out flex items-center justify-center gap-2 cursor-pointer"
            >
              Mulai Scan Struk Gratis
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center px-6 w-full max-w-5xl border-t border-text-900/60 pt-6 z-10">
        <p className="text-xs text-text-400 font-medium">
          Ceban Pertama &mdash; Dibuat khusus biar patungan geng lo beres instan tanpa drama.
        </p>
      </footer>
    </div>
  );
}
