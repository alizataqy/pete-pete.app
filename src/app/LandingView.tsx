"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Camera01,
  Users01,
  MessageChatCircle,
  MessageChatSquare,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ReceiptCheck,
  Target01,
  Minus,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";

interface UserSessionProp {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

const steps = [
  {
    index: "01",
    title: "Foto Struknya.",
    desc: "Cukup foto struk resto atau kafe. Nama menu, harga, pajak, dan service charge langsung kebaca otomatis tanpa perlu ngetik ulang.",
    icon: Camera01,
    details: [
      "Nama menu dan harga kebaca otomatis",
      "Pajak resto dan service charge dihitung proporsional",
      "Foto struk tidak disimpan di server",
    ],
  },
  {
    index: "02",
    title: "Pilih Siapa Pesen Apa.",
    desc: "Klik nama temen di tiap pesanan. Kalau ada menu yang dimakan barengan, porsi dan harganya langsung dibagi rata.",
    icon: Users01,
    details: [
      "Bagi pesanan per orang atau per porsi",
      "Menu patungan otomatis dibagi rata",
      "Pajak ngikutin porsi masing-masing",
    ],
  },
  {
    index: "03",
    title: "Kirim Rincian ke WhatsApp.",
    desc: "Dapet format teks siap kirim ke grup WhatsApp, lengkap dengan rincian tiap orang serta nomor rekening atau QRIS.",
    icon: MessageChatCircle,
    details: [
      "Rincian per orang jelas dan transparan",
      "Nomor rekening dan QRIS langsung tertera",
      "Tiap orang tau persis nominal yang harus dibayar",
    ],
  },
];

const testimonials = [
  {
    quote:
      "Biasanya ngitung bill bersepuluh butuh 20 menit lempar-lemparan kalkulator. Sekarang kelar pas kasir masih nyetak struk.",
    author: "Dimas",
  },
  {
    quote:
      "Paling males kalo pesen dikit tapi tetep disuruh bayar rata. Pake ini pajaknya ngikut porsi yang gua makan, adil.",
    author: "Rania",
  },
  {
    quote:
      "Begitu rinciannya dikirim ke grup, langsung ada total per orang plus nomer rekening. Gak perlu repot rekap ulang di Notes.",
    author: "Fajar",
  },
];

const faqs = [
  {
    q: "Ceban Pertama tuh apaan sih?",
    a: "Web app buat bagi tagihan makan bareng. Cukup foto struk, menu dan harga otomatis kebaca, pajak sama service charge langsung dibagi proporsional ke tiap orang. Gratis tanpa install.",
  },
  {
    q: "Foto struk gua disimpen gak?",
    a: "Gak. Foto struk cuma diproses sekali saat pembacaan menu, setelah itu langsung dihapus. Kita gak nyimpen file foto struk di database.",
  },
  {
    q: "Pajak sama service charge-nya diitung gimana?",
    a: "Dibagi proporsional sesuai nominal pesanan masing-masing. Yang pesen es teh gak bakal nanggung beban pajak dari pesanan temen yang lebih mahal.",
  },
  {
    q: "Harus download atau bikin akun dulu gak?",
    a: "Gak perlu. Langsung buka lewat browser di hp atau laptop buat scan struk. Bikin akun cuma kalau lo pengen nyimpen riwayat tagihan.",
  },
];

export default function LandingView({ user }: UserSessionProp) {
  return (
    <div
      data-landing-view
      className="flex-1 flex flex-col bg-background text-text min-h-screen w-full relative selection:bg-primary-400 selection:text-white"
    >
      {/* Header */}
      <header className="w-full border-b border-secondary-800/40 bg-background/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 rounded-xl transition-transform duration-150 active:scale-[0.98]"
          >
            <Image
              src="/logo.svg"
              alt="Ceban Pertama"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg group-hover:scale-105 transition-transform duration-150"
              priority
            />
            <span className="font-extrabold text-text text-lg tracking-tight leading-none">
              Ceban Pertama
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <Button
                href="/tongkrongan"
                size="sm"
                color="primary"
                iconTrailing={ArrowRight}
              >
                Tongkrongan Gua
              </Button>
            ) : (
              <>
                <Button
                  href="/login"
                  size="sm"
                  color="secondary"
                >
                  Masuk
                </Button>
                <Button
                  href="/pete-pete/new"
                  size="sm"
                  color="primary"
                >
                  Coba Gratis
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="w-full flex flex-col items-center">
        {/* Hero */}
        <section className="w-full border-b border-secondary-800/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-32">
            <div className="max-w-4xl space-y-8">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.035em] text-text leading-[0.92] sm:leading-[0.90]">
                <span className="block">Abis Nongkrong Ramean?</span>
                <span className="text-primary-400 block">Foto Struknya Aja.</span>
              </h1>

              <p className="text-lg/8 sm:text-xl/8 md:text-2xl/8 text-text-100 leading-relaxed max-w-2xl text-pretty font-normal">
                Foto struk, tentuin siapa pesen apa, langsung kirim rincian ke
                grup WhatsApp. Pajak dan service charge kebagi otomatis.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {user ? (
                  <Button
                    href="/tongkrongan"
                    size="xl"
                    color="primary"
                    iconTrailing={ArrowRight}
                    className="font-bold tracking-tight"
                  >
                    Buka Tongkrongan Gua
                  </Button>
                ) : (
                  <>
                    <Button
                      href="/pete-pete/new"
                      size="xl"
                      color="primary"
                      iconTrailing={ArrowRight}
                      className="font-bold tracking-tight"
                    >
                      Scan Struk Sekarang
                    </Button>
                    <Button
                      href="/register"
                      size="xl"
                      color="secondary"
                      className="font-semibold tracking-tight"
                    >
                      Bikin Akun
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Cara Kerja */}
        <section className="w-full border-b border-secondary-800/40 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                  Gimana Caranya.
                </h2>
                <p className="text-sm text-text-300 mt-1 max-w-md text-pretty">
                  Tiga langkah ringkas, gak perlu pusing mikirin rumus kalkulator lagi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={step.index}
                    className="group relative p-6 sm:p-7 rounded-2xl border border-secondary-800/70 bg-secondary-950/35 hover:bg-secondary-950/60 hover:border-primary-400/50 hover:-translate-y-0.5 transition-all duration-150 ease-out active:scale-[0.99] flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Icon on Left, Step Pill on Right */}
                      <div className="flex items-center justify-between pb-5">
                        <div className="w-11 h-11 rounded-xl bg-primary-400/10 border border-primary-400/20 text-primary-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-primary-400/15 group-hover:border-primary-400/40 transition-all duration-150 ease-out shadow-xs">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <Badge
                          color="brand"
                          size="sm"
                          type="pill-color"
                          className="font-mono font-bold tracking-wider"
                        >
                          {step.index}
                        </Badge>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl font-extrabold text-text tracking-tight group-hover:text-primary-400 transition-colors duration-150">
                          {step.title}
                        </h3>
                        <p className="text-sm text-text-300 leading-relaxed text-pretty">
                          {step.desc}
                        </p>
                      </div>

                      {/* Interactive Visual Micro-Preview */}
                      {step.index === "01" && (
                        <div className="my-5 rounded-xl border border-secondary-800/80 bg-background overflow-hidden shadow-xs">
                          {/* Scanner Top Bar */}
                          <div className="bg-primary-950 px-3.5 py-2 flex items-center justify-between border-b border-primary-900/40">
                            <div className="flex items-center gap-2">
                              <ReceiptCheck className="w-4 h-4 text-primary-400 shrink-0" />
                              <span className="font-bold text-xs text-text-50">OCR Scanner AI</span>
                            </div>
                          </div>

                          {/* Digital Receipt Slip */}
                          <div className="p-3 bg-secondary-950/40 space-y-2">
                            <div className="p-3 rounded-lg bg-background border border-secondary-800/70 shadow-xs font-mono text-xs space-y-2 text-text-100">
                              <div className="flex items-center justify-between border-b border-dashed border-secondary-800/60 pb-1.5 text-pretty font-sans">
                                <div>
                                  <span className="font-bold text-xs text-text-50 block">Kopi Kenangan Senopati</span>
                                  <span className="text-3xs text-text-400">Struk #CP-8849</span>
                                </div>
                                <Badge color="brand" size="sm" type="pill-color" className="text-3xs font-bold">
                                  Auto Deteksi
                                </Badge>
                              </div>

                              <div className="space-y-1.5 pt-0.5">
                                <div className="flex justify-between items-center">
                                  <span>1x Kopi Kenangan Mantan</span>
                                  <span className="font-semibold text-text">Rp 22.000</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>1x Toast Coklat Klasik</span>
                                  <span className="font-semibold text-text">Rp 28.000</span>
                                </div>
                              </div>

                              <div className="pt-1.5 border-t border-dashed border-secondary-800/60 flex justify-between items-center text-3xs text-pretty font-sans text-text-300">
                                <span>Pajak Resto (10%) + Servis (5%)</span>
                                <span className="font-bold text-primary-400 font-mono">+Rp 7.500</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between px-1 text-3xs text-text-400 text-pretty font-sans">
                              <span>3 Item terdeteksi otomatis</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.index === "02" && (
                        <div className="my-5 rounded-xl border border-secondary-800/80 bg-background overflow-hidden shadow-xs">
                          {/* Board Header */}
                          <div className="bg-primary-950 px-3.5 py-2 flex items-center justify-between border-b border-primary-900/40">
                            <div className="flex items-center gap-2">
                              <Target01 className="w-4 h-4 text-primary-400 shrink-0" />
                              <span className="font-bold text-xs text-text-50">Siapa Pesen Apa Nih?</span>
                            </div>
                            <span className="text-3xs font-mono text-text-400">Tap Avatar Sohib</span>
                          </div>

                          {/* Split Item Card (Authentic SplitItemRow from App) */}
                          <div className="p-3 bg-secondary-950/40 space-y-2">
                            <div className="p-3.5 rounded-xl bg-secondary-950/60 border border-secondary-800 space-y-3 shadow-xs">
                              {/* Header Item */}
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-text text-sm leading-snug wrap-break-word">
                                    Pizza Quattro Formaggi
                                  </h4>
                                  <p className="text-2xs text-text-400 mt-0.5 font-medium">
                                    1 porsi (Rp 120.000/porsi)
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-sm font-extrabold text-primary-400 whitespace-nowrap">
                                    Rp 120.000
                                  </span>
                                </div>
                              </div>

                              {/* Status Alokasi & Tombol Aksi Cepat */}
                              <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                  <Badge color="brand" size="sm" type="pill-color" className="inline-flex font-semibold text-3xs sm:text-2xs">
                                    3 porsi patungan • Rp 40.000/porsi
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                                  <Button
                                    color="secondary"
                                    size="xs"
                                    iconLeading={Users01}
                                    className="px-2 py-1 text-3xs font-semibold rounded-lg pointer-events-none"
                                  >
                                    Bagi ke Semua
                                  </Button>
                                </div>
                              </div>

                              {/* Avatar Pemilihan Anggota (Exact real app style from SplitItemRow) */}
                              <div className="flex flex-wrap gap-x-2.5 sm:gap-x-3 gap-y-2.5 items-start pt-1.5 justify-around">
                                {/* Dimas (selected) */}
                                <div className="flex flex-col items-center w-12 sm:w-13 shrink-0 relative">
                                  <div className="relative">
                                    <div className="rounded-full min-w-10 min-h-10 sm:min-w-11 sm:min-h-11 flex items-center justify-center p-0.5">
                                      <Avatar
                                        alt="Dimas"
                                        size="md"
                                        src="https://api.dicebear.com/9.x/dylan/svg?seed=Dimas"
                                        className="shadow-md ring-2 ring-primary-400/40 border-primary-400/60 scale-105"
                                      />
                                    </div>
                                    <span className="absolute -top-1 -left-1 z-10 bg-danger-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-secondary-950">
                                      <Minus className="w-3 h-3 stroke-[3px]" />
                                    </span>
                                    <span className="absolute -top-1 -right-1 z-10 bg-primary-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-3xs font-bold shadow-md border border-secondary-950 pointer-events-none">
                                      1
                                    </span>
                                  </div>
                                  <p className="text-3xs sm:text-2xs truncate w-full text-center leading-tight font-bold text-text mt-1">
                                    Dimas
                                  </p>
                                </div>

                                {/* Rania (selected) */}
                                <div className="flex flex-col items-center w-12 sm:w-13 shrink-0 relative">
                                  <div className="relative">
                                    <div className="rounded-full min-w-10 min-h-10 sm:min-w-11 sm:min-h-11 flex items-center justify-center p-0.5">
                                      <Avatar
                                        alt="Rania"
                                        size="md"
                                        src="https://api.dicebear.com/9.x/dylan/svg?seed=Rania"
                                        className="shadow-md ring-2 ring-primary-400/40 border-primary-400/60 scale-105"
                                      />
                                    </div>
                                    <span className="absolute -top-1 -left-1 z-10 bg-danger-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-secondary-950">
                                      <Minus className="w-3 h-3 stroke-[3px]" />
                                    </span>
                                    <span className="absolute -top-1 -right-1 z-10 bg-primary-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-3xs font-bold shadow-md border border-secondary-950 pointer-events-none">
                                      1
                                    </span>
                                  </div>
                                  <p className="text-3xs sm:text-2xs truncate w-full text-center leading-tight font-bold text-text mt-1">
                                    Rania
                                  </p>
                                </div>

                                {/* Fajar (selected) */}
                                <div className="flex flex-col items-center w-12 sm:w-13 shrink-0 relative">
                                  <div className="relative">
                                    <div className="rounded-full min-w-10 min-h-10 sm:min-w-11 sm:min-h-11 flex items-center justify-center p-0.5">
                                      <Avatar
                                        alt="Fajar"
                                        size="md"
                                        src="https://api.dicebear.com/9.x/dylan/svg?seed=Fajar"
                                        className="shadow-md ring-2 ring-primary-400/40 border-primary-400/60 scale-105"
                                      />
                                    </div>
                                    <span className="absolute -top-1 -left-1 z-10 bg-danger-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-secondary-950">
                                      <Minus className="w-3 h-3 stroke-[3px]" />
                                    </span>
                                    <span className="absolute -top-1 -right-1 z-10 bg-primary-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-3xs font-bold shadow-md border border-secondary-950 pointer-events-none">
                                      1
                                    </span>
                                  </div>
                                  <p className="text-3xs sm:text-2xs truncate w-full text-center leading-tight font-bold text-text mt-1">
                                    Fajar
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between px-1 text-3xs text-text-400">
                              <span>Pajak & service charge auto ikut porsi</span>
                              <span className="text-primary-400 font-bold">Fair & Rapi</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.index === "03" && (
                        <div className="my-5 rounded-xl border border-secondary-800/80 bg-background overflow-hidden shadow-xs">
                          {/* WhatsApp Chat Bar Header */}
                          <div className="bg-emerald-600 px-3.5 py-2 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2 min-w-0">
                              <MessageChatSquare className="w-4 h-4 shrink-0" />
                              <span className="font-bold text-xs truncate">WhatsApp • Grup Tongkrongan</span>
                            </div>
                            <span className="text-3xs font-medium text-emerald-100 shrink-0">Hari ini</span>
                          </div>

                          {/* WhatsApp Chat Bubble Body */}
                          <div className="p-3 bg-secondary-950/40 space-y-2.5">
                            <div className="p-3 rounded-lg bg-background border border-secondary-800/70 shadow-xs text-xs font-mono space-y-2 leading-relaxed text-text-100">
                              <div className="flex items-center justify-between border-b border-dashed border-secondary-800/60 pb-1.5 text-pretty font-sans">
                                <span className="font-bold text-xs text-text-50">REKAP TAGIHAN</span>
                                <Badge color="brand" size="sm" type="pill-color" className="text-3xs font-bold font-mono">
                                  LUNAS 2/3
                                </Badge>
                              </div>

                              <div className="space-y-1.5 pt-0.5">
                                <div>
                                  <div className="flex justify-between">
                                    <span className="font-bold text-text-50">Dimas</span>
                                    <span className="font-bold text-primary-400">Rp 64.400</span>
                                  </div>
                                  <p className="text-3xs text-text-400 text-pretty font-sans">
                                    ↳ 1x Nasi Goreng Gila + Pajak
                                  </p>
                                </div>

                                <div>
                                  <div className="flex justify-between">
                                    <span className="font-bold text-text-50">Rania</span>
                                    <span className="font-bold text-primary-400">Rp 35.000</span>
                                  </div>
                                  <p className="text-3xs text-text-400 text-pretty font-sans">
                                    ↳ 1x Kopi Susu Aren + Pajak
                                  </p>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-dashed border-secondary-800/60 text-3xs text-pretty font-sans text-text-300 space-y-0.5">
                                <p className="font-semibold text-text-200">
                                  Transfer: BCA 8045xxxx (a/n Taqy)
                                </p>
                                <p className="text-primary-400 font-mono text-2xs font-bold">
                                  ceban-pertama.vercel.app/bon/VSED3
                                </p>
                              </div>

                              <div className="flex justify-end items-center gap-1 text-3xs text-text-400 pt-0.5 text-pretty font-sans">
                                <span>21:42</span>
                                <span className="text-primary-400 font-bold">✓✓</span>
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>

                    {/* Feature Details / Checklist */}
                    <div className="border-t border-secondary-800/60 pt-4 mt-2 space-y-2.5">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs text-text-200 font-medium">
                          <CheckCircle className="w-4 h-4 text-primary-400 shrink-0 stroke-[2.25px]" />
                          <span>
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimoni */}
        <section className="w-full border-b border-secondary-800/40 py-16 sm:py-24 bg-secondary-950/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
              Kata Mereka Yang Udah Pake.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-2xl border border-secondary-800/70 bg-secondary-950/35 hover:bg-secondary-950/50 hover:border-secondary-800 transition-all duration-150 ease-out flex flex-col justify-between space-y-6"
                >
                  <p className="text-sm text-text-100 leading-relaxed text-pretty">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="border-t border-secondary-800/60 pt-4">
                    <span className="font-bold text-sm text-text block">
                      {t.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full border-b border-secondary-800/40 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
              Yang Sering Ditanyain.
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group rounded-2xl border border-secondary-800/70 bg-secondary-950/35 p-5 sm:p-6 transition-all duration-150 ease-out hover:border-secondary-800 open:bg-secondary-950/60"
                >
                  <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-text select-none list-none [&::-webkit-details-marker]:hidden">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-4 h-4 text-text-400 transition-transform duration-200 group-open:rotate-180 shrink-0 ml-4" />
                  </summary>
                  <p className="mt-3 text-sm text-text-300 leading-relaxed max-w-3xl text-pretty">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-background border-t border-secondary-800/40 overflow-hidden select-none">
        <div className="w-full py-12 sm:py-16 text-center overflow-hidden">
          <h2 className="text-[10.5vw] font-extrabold uppercase tracking-tighter text-text leading-none whitespace-nowrap text-center">
            CEBAN PERTAMA
          </h2>
        </div>
      </footer>
    </div>
  );
}
