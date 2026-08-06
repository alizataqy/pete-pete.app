"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";

interface UserSessionProp {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export default function LandingView({ user }: UserSessionProp) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ocr" | "split" | "share">("ocr");

  // Mock data untuk simulasi interaktif scan struk
  const [ocrStep, setOcrStep] = useState<number>(0);

  const features = {
    ocr: {
      title: "Scan Struk Pake AI",
      desc: "Foto struk makan-makan lo, AI langsung otomatis baca nama menu, jumlah, porsi, sampai ke pajaknya. Ga usah capek nulis ulang satu-satu!",
      icon: <Camera01 className="w-5 h-5 text-alice-blue-400" />,
      badge: "Otomatis 100%",
      detail: [
        "Deteksi nama item & harga presisi",
        "Deteksi PPN & Service Charge otomatis",
        "Support struk panjang & robek"
      ]
    },
    split: {
      title: "Split Bill Ga Kaku",
      desc: "Bebas atur siapa bayar apa. Bisa bagi rata, bagi per item menu, atau custom porsi. Bahkan bisa pilih siapa yang nalangin duluan gampang banget!",
      icon: <Users01 className="w-5 h-5 text-emerald-400" />,
      badge: "Suka-suka lo",
      detail: [
        "Tandai menu per anggota geng",
        "Sistem talangan otomatis terhitung",
        "Support multi-anggota tanpa batas"
      ]
    },
    share: {
      title: "Tagih Langsung Ke WA",
      desc: "Kelar bagi tagihan, langsung kirim rinciannya ke WhatsApp temen lo lengkap dengan link bayar & list menu yang dia pesen. Ga pake drama sungkan!",
      icon: <MessageChatCircle className="w-5 h-5 text-amber-400" />,
      badge: "Sekali Tap",
      detail: [
        "Rincian tagihan rapi & transparan",
        "Integrasi nomor rekening & QRIS",
        "Gak ada lagi drama lupa bayar"
      ]
    }
  };

  return (
    <div data-landing-view className="flex-1 flex flex-col bg-powder-blue-950 text-jet-black-50 select-none pb-12 overflow-y-auto w-full items-center">
      
      {/* Desktop Header Navigation */}
      <header className="w-full max-w-5xl px-6 py-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-alice-blue-600 flex items-center justify-center font-black text-white text-base">
            P
          </div>
          <span className="font-extrabold text-white text-base tracking-wider">PETE-PETE</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Button
              onPress={() => router.push("/dashboard")}
              className="py-1.5 px-4 rounded-lg bg-alice-blue-600 hover:bg-alice-blue-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Dashboard
            </Button>
          ) : (
            <Button
              onPress={() => router.push("/login")}
              className="py-1.5 px-4 rounded-lg bg-alice-blue-600 hover:bg-alice-blue-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Masuk
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 text-center overflow-hidden w-full max-w-5xl flex flex-col items-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-alice-blue-500/20 bg-alice-blue-950/80 text-alice-blue-400 text-xs font-semibold mb-8 animate-pulse">
          <Camera01 className="w-3.5 h-3.5 text-alice-blue-400" />
          <span>PETE-PETE &mdash; Akhir dari Drama Patungan</span>
        </div>

        {/* Desktop Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full text-left">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Split Tagihan dari <br/>
              <span className="text-alice-blue-400">
                Foto Struk Makan lo!
              </span>
            </h1>

            <p className="text-xs md:text-sm text-jet-black-300 leading-relaxed max-w-md">
              Gak perlu lagi hitung manual pake kalkulator. Foto struk belanjanya, tandain siapa makan apa, lalu share hasil patungan langsung ke WhatsApp temen lo. Cepat, presisi, anti drama!
            </p>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-jet-black-400 py-2 justify-center lg:justify-start">
              <div className="flex items-center gap-1">
                <Star01 className="w-3.5 h-3.5 text-amber-400" />
                <span>4.9/5 Rating Squad</span>
              </div>
              <span className="text-jet-black-700">|</span>
              <div className="flex items-center gap-1">
                <Lock01 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tanpa Login/OTP</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              {user ? (
                <Button
                  onPress={() => router.push("/dashboard")}
                  className="w-full py-3.5 rounded-xl bg-alice-blue-600 hover:bg-alice-blue-700 text-white font-bold text-xs shadow-lg shadow-alice-blue-900/20 transition-all flex items-center justify-center gap-1.5"
                >
                  Masuk ke Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <>
                  <Button
                    onPress={() => router.push("/pete-pete/new")}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-alice-blue-600 hover:bg-alice-blue-700 text-white font-bold text-xs shadow-lg shadow-alice-blue-900/20 transition-all"
                  >
                    Mulai Scan Struk Gratis
                  </Button>
                  <Button
                    onPress={() => router.push("/register")}
                    color="secondary"
                    className="w-full sm:w-auto px-8 py-3 rounded-xl border border-lilac-ash-800 bg-transparent text-jet-black-100 hover:text-white hover:bg-jet-black-900 text-xs font-semibold"
                  >
                    Daftar Akun
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right Live Interactive Mockup Simulator */}
          <div className="lg:col-span-5 flex justify-center relative">
            
            <div className="relative w-full max-w-[320px] bg-jet-black-950 border-[6px] border-jet-black-800 rounded-[36px] shadow-2xl p-5 overflow-hidden min-h-[460px] flex flex-col justify-between">
              
              {/* Simulator Screen Header */}
              <div className="flex items-center justify-between border-b border-jet-black-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-alice-blue-900 flex items-center justify-center font-bold text-[9px] text-alice-blue-400">
                    P
                  </div>
                  <span className="text-[10px] font-black text-white">Makan Ramen Geng 🍜</span>
                </div>
                <span className="text-[8px] bg-alice-blue-950 text-alice-blue-300 px-2 py-0.5 rounded border border-alice-blue-900/50">
                  Live Demo
                </span>
              </div>

              {/* Simulation Steps View */}
              {ocrStep === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-4 animate-in fade-in duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-alice-blue-900/40 border border-alice-blue-800 flex items-center justify-center shadow-lg">
                    <Camera01 className="w-7 h-7 text-alice-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Langkah 1: Upload Struk</h4>
                    <p className="text-[10px] text-jet-black-300 max-w-[200px]">Simulasikan deteksi AI OCR dengan klik tombol di bawah.</p>
                  </div>
                  <Button
                    onPress={() => setOcrStep(1)}
                    className="py-1.5 px-4 rounded-lg bg-alice-blue-600 text-white font-bold text-[10px]"
                  >
                    Simulasikan Scan Struk
                  </Button>
                </div>
              )}

              {ocrStep === 1 && (
                <div className="flex-1 flex flex-col justify-between py-4 text-left animate-in fade-in duration-200">
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none">&bull; AI OCR Membaca Data...</p>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      <div className="flex justify-between items-center bg-jet-black-900 p-2 rounded border border-jet-black-800">
                        <div>
                          <p className="text-[10px] font-bold text-white">🍜 Spicy Miso Ramen</p>
                          <p className="text-[8px] text-jet-black-400">Qty: 2 x Rp 45.000</p>
                        </div>
                        <span className="text-[10px] font-bold text-white">Rp 90.000</span>
                      </div>
                      <div className="flex justify-between items-center bg-jet-black-900 p-2 rounded border border-jet-black-800">
                        <div>
                          <p className="text-[10px] font-bold text-white">🥤 Ocha Cold (Refill)</p>
                          <p className="text-[8px] text-jet-black-400">Qty: 3 x Rp 12.000</p>
                        </div>
                        <span className="text-[10px] font-bold text-white">Rp 36.000</span>
                      </div>
                      <div className="flex justify-between items-center bg-jet-black-900 p-2 rounded border border-jet-black-800">
                        <div>
                          <p className="text-[10px] font-bold text-white">🥟 Gyoza Original</p>
                          <p className="text-[8px] text-jet-black-400">Qty: 1 x Rp 28.000</p>
                        </div>
                        <span className="text-[10px] font-bold text-white">Rp 28.000</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onPress={() => setOcrStep(2)}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                  >
                    Bagi Tagihan &bull; Langkah 2
                  </Button>
                </div>
              )}

              {ocrStep === 2 && (
                <div className="flex-1 flex flex-col justify-between py-4 text-left animate-in fade-in duration-200">
                  <div className="space-y-4">
                    <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest leading-none">&bull; Tagihan Per Orang</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded bg-alice-blue-900/10 border border-alice-blue-800/30">
                        <span className="text-[10px] text-white font-medium">Budi (Ramen + Ocha)</span>
                        <span className="text-[10px] font-bold text-alice-blue-300">Rp 57.000</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-alice-blue-900/10 border border-alice-blue-800/30">
                        <span className="text-[10px] text-white font-medium">Ucup (Ramen + Gyoza)</span>
                        <span className="text-[10px] font-bold text-alice-blue-300">Rp 73.000</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-alice-blue-900/10 border border-alice-blue-800/30">
                        <span className="text-[10px] text-white font-medium">Siti (Ocha + Gyoza)</span>
                        <span className="text-[10px] font-bold text-alice-blue-300">Rp 40.000</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onPress={() => setOcrStep(0)}
                      className="w-1/2 py-2 rounded-lg bg-jet-black-900 border border-jet-black-800 text-jet-black-100 font-bold text-[10px]"
                    >
                      Ulangi
                    </Button>
                    <Button
                      onPress={() => {
                        toast.success("Rincian tagihan WhatsApp disalin ke clipboard!");
                        setOcrStep(0);
                      }}
                      className="w-1/2 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px]"
                    >
                      Share WA
                    </Button>
                  </div>
                </div>
              )}

              {/* Simulator Screen Footer */}
              <div className="border-t border-jet-black-800 pt-3 flex items-center justify-between text-[8px] text-jet-black-400">
                <span>Total Struk: Rp 154.000</span>
                <span>Tax &amp; Service Terdeteksi</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Interactive Feature Showcases */}
      <section className="px-4 py-6 w-full max-w-5xl">
        <div className="p-5 md:p-8 rounded-2xl border border-lilac-ash-800/60 bg-jet-black-900/50 space-y-6">
          <div className="text-left space-y-1">
            <h2 className="text-xs font-bold text-alice-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Alur Canggih
            </h2>
            <p className="text-sm md:text-base font-extrabold text-white">Gimana PETE-PETE Ngebantu Lo?</p>
          </div>

          {/* Tabs selector */}
          <div className="grid grid-cols-3 gap-1 bg-jet-black-950 p-1.5 rounded-xl border border-jet-black-800 max-w-lg">
            {Object.keys(features).map((key) => (
              <Button
                key={key}
                type="button"
                onPress={() => setActiveTab(key as "ocr" | "split" | "share")}
                className={`py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all text-center cursor-pointer ${
                  activeTab === key
                    ? "bg-alice-blue-900 text-alice-blue-300 border border-alice-blue-800/40"
                    : "bg-transparent text-jet-black-300 hover:text-jet-black-50 border-0"
                }`}
              >
                {key === "ocr" ? "1. Scan" : key === "split" ? "2. Split" : "3. Share"}
              </Button>
            ))}
          </div>

          {/* Active Tab Panel */}
          <div className="p-5 rounded-xl bg-jet-black-950 border border-jet-black-800/80 space-y-4 text-left animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {features[activeTab].icon}
                <h3 className="text-sm font-bold text-white">{features[activeTab].title}</h3>
              </div>
              <span className="text-[9px] font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full">
                {features[activeTab].badge}
              </span>
            </div>

            <p className="text-xs text-jet-black-300 leading-relaxed max-w-2xl">
              {features[activeTab].desc}
            </p>

            <div className="border-t border-jet-black-800 pt-4 space-y-2">
              {features[activeTab].detail.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-jet-black-100">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info Stats Section */}
      <section className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-5xl">
        <div className="p-5 rounded-xl border border-lilac-ash-800/40 bg-jet-black-900/40 text-left space-y-3">
          <Coins01 className="w-7 h-7 text-alice-blue-400" />
          <h4 className="text-base font-bold text-white leading-none">Tanpa Biaya</h4>
          <p className="text-xs text-jet-black-300 leading-relaxed">
            Pakai semua fitur scan struk &amp; kelola banyak rekening sepuasnya gratis tanpa dipungut biaya sepeser pun.
          </p>
        </div>
        <div className="p-5 rounded-xl border border-lilac-ash-800/40 bg-jet-black-900/40 text-left space-y-3">
          <Users01 className="w-7 h-7 text-emerald-400" />
          <h4 className="text-base font-bold text-white leading-none">Geng Happy</h4>
          <p className="text-xs text-jet-black-300 leading-relaxed">
            Nggak ada lagi rasa sungkan nagih patungan secara manual. Hubungan tongkrongan tetap asyik &amp; harmonis!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 text-center px-6 w-full max-w-5xl border-t border-jet-black-900 pt-6">
        <p className="text-[10px] text-jet-black-400">
          PETE-PETE &mdash; Dibuat khusus biar patungan geng lo beres instan.
        </p>
      </footer>
    </div>
  );
}
