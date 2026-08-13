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
      icon: <Camera01 className="w-5 h-5 text-primary-400" />,
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
      icon: <Users01 className="w-5 h-5 text-primary-200" />,
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
        "Integrasi nomor rekening & E-Wallet",
        "Gak ada lagi drama lupa bayar"
      ]
    }
  };

  return (
    <div data-landing-view className="flex-1 flex flex-col bg-background text-text select-none pb-16 overflow-y-auto overflow-x-hidden w-full items-center relative">
      
      {/* Desktop Header Navigation */}
      <header className="w-full max-w-5xl px-6 py-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3 group cursor-pointer">
          <span className="font-black text-text text-lg tracking-wider">PETE-PETE</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Button
              onPress={() => router.push("/tongkrongan")}
              className="py-2 px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.03] cursor-pointer"
            >
              Sokin Masuk Aje
            </Button>
          ) : (
            <Button
              onPress={() => router.push("/login")}
              className="py-2 px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.03] cursor-pointer"
            >
              Masuk
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 text-center overflow-hidden w-full max-w-5xl flex flex-col items-center z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-500/20 bg-primary-950/60 backdrop-blur-md text-primary-400 text-xs font-semibold mb-10 shadow-inner">
          <Camera01 className="w-3.5 h-3.5 text-primary-400 animate-pulse" />
          <span className="tracking-wide">PETE-PETE &mdash; Akhir dari Drama Patungan</span>
        </div>

        {/* Desktop Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full text-left">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-text leading-tight">
              Split Tagihan dari <br/>
              <span className="text-primary-400">
                Foto Struk Makan lo!
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-text-300 leading-relaxed max-w-lg">
              Gak perlu lagi hitung manual pake kalkulator. Foto struk belanjanya, tandain siapa makan apa, lalu share hasil patungan langsung ke WhatsApp temen lo. Cepat, presisi, anti drama!
            </p>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center gap-5 text-[11px] text-text-400 py-2 justify-center lg:justify-start">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-text-900/40 border border-secondary-800/20">
                <Star01 className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-text">4.9/5 Rating Squad</span>
              </div>
              <span className="text-text-800 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-text-900/40 border border-secondary-800/20">
                <Lock01 className="w-3.5 h-3.5 text-text-200" />
                <span className="font-semibold text-text">Tanpa Login/OTP</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-2">
              {user ? (
                <Button
                  onPress={() => router.push("/tongkrongan")}
                  iconTrailing={ArrowRight}
                  className="w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                >
                  Sokin Masuk Aje
                </Button>
              ) : (
                <>
                  <Button
                    onPress={() => router.push("/pete-pete/new")}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    Mulai Scan Struk Gratis
                  </Button>
                  <Button
                    onPress={() => router.push("/register")}
                    color="secondary"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-secondary-800 bg-text-950/40 text-text-100 hover:text-white hover:bg-text-900 text-sm font-bold transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    Daftar Akun
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right Live Interactive Mockup Simulator */}
          <div className="lg:col-span-5 flex justify-center relative">

            <div className="relative w-full max-w-[330px] bg-text-950/80 backdrop-blur-xl border-[6px] border-text-800/90 rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-6 overflow-hidden min-h-[480px] flex flex-col justify-between z-10">
              
              {/* Phone Camera Punch-hole */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-text-800 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-text-950" />
              </div>

              {/* Simulator Screen Header */}
              <div className="flex items-center justify-between border-b border-text-900 pb-3.5 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary-900/60 flex items-center justify-center font-bold text-[10px] text-primary-300">
                    P
                  </div>
                  <span className="text-[11px] font-bold text-text-50 tracking-wide">Makan Ramen Geng 🍜</span>
                </div>
                <span className="text-[9px] font-semibold bg-primary-950 border border-primary-800/40 text-primary-400 px-2 py-0.5 rounded-full">
                  Live Demo
                </span>
              </div>

              {/* Simulation Steps View */}
              {ocrStep === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-primary-900/40 border border-primary-800/50 flex items-center justify-center shadow-lg relative group">
                    <Camera01 className="w-8 h-8 text-primary-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-text-50">Langkah 1: Upload Struk</h4>
                    <p className="text-[10px] text-text-300 max-w-[200px] leading-relaxed">Simulasikan deteksi AI OCR dengan klik tombol di bawah.</p>
                  </div>
                  <Button
                    onPress={() => setOcrStep(1)}
                    className="py-2 px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-[10px] shadow-lg shadow-primary/30 transition-all hover:scale-105 cursor-pointer"
                  >
                    Simulasikan Scan Struk
                  </Button>
                </div>
              )}

              {ocrStep === 1 && (
                <div className="flex-1 flex flex-col justify-between py-5 text-left animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-4">
                    <p className="text-[9px] font-extrabold text-primary-200 uppercase tracking-widest leading-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                      AI OCR Membaca Data...
                    </p>
                    <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
                      <div className="flex justify-between items-center bg-text-900/60 p-2.5 rounded-xl border border-secondary-800/10">
                        <div>
                          <p className="text-[10px] font-bold text-text-50">🍜 Spicy Miso Ramen</p>
                          <p className="text-[8px] text-text-400">Qty: 2 x Rp 45.000</p>
                        </div>
                        <span className="text-[10px] font-bold text-text-50">Rp 90.000</span>
                      </div>
                      <div className="flex justify-between items-center bg-text-900/60 p-2.5 rounded-xl border border-secondary-800/10">
                        <div>
                          <p className="text-[10px] font-bold text-text-50">🥤 Ocha Cold (Refill)</p>
                          <p className="text-[8px] text-text-400">Qty: 3 x Rp 12.000</p>
                        </div>
                        <span className="text-[10px] font-bold text-text-50">Rp 36.000</span>
                      </div>
                      <div className="flex justify-between items-center bg-text-900/60 p-2.5 rounded-xl border border-secondary-800/10">
                        <div>
                          <p className="text-[10px] font-bold text-text-50">🥟 Gyoza Original</p>
                          <p className="text-[8px] text-text-400">Qty: 1 x Rp 28.000</p>
                        </div>
                        <span className="text-[10px] font-bold text-text-50">Rp 28.000</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onPress={() => setOcrStep(2)}
                    className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-[10px] shadow-lg shadow-primary/30 transition-all hover:scale-102 cursor-pointer"
                  >
                    Bagi Tagihan &bull; Langkah 2
                  </Button>
                </div>
              )}

              {ocrStep === 2 && (
                <div className="flex-1 flex flex-col justify-between py-5 text-left animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-4">
                    <p className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest leading-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Tagihan Per Orang
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary-950/40 border border-primary-900/35">
                        <span className="text-[10px] text-text-50 font-medium">Budi (Ramen + Ocha)</span>
                        <span className="text-[10px] font-bold text-primary-400">Rp 57.000</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary-950/40 border border-primary-900/35">
                        <span className="text-[10px] text-text-50 font-medium">Ucup (Ramen + Gyoza)</span>
                        <span className="text-[10px] font-bold text-primary-400">Rp 73.000</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary-950/40 border border-primary-900/35">
                        <span className="text-[10px] text-text-50 font-medium">Siti (Ocha + Gyoza)</span>
                        <span className="text-[10px] font-bold text-primary-400">Rp 40.000</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onPress={() => setOcrStep(0)}
                      className="w-1/2 py-2.5 rounded-xl bg-text-900 border border-secondary-800/20 text-text-200 hover:text-white font-extrabold text-[10px] transition-all cursor-pointer"
                    >
                      Ulangi
                    </Button>
                    <Button
                      onPress={() => {
                        toast.success("Rincian tagihan WhatsApp disalin ke clipboard!");
                        setOcrStep(0);
                      }}
                      className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] shadow-lg shadow-amber-900/30 transition-all hover:scale-102 cursor-pointer"
                    >
                      Share WA
                    </Button>
                  </div>
                </div>
              )}

              {/* Simulator Screen Footer */}
              <div className="border-t border-text-900 pt-3.5 flex items-center justify-between text-[9px] text-text-400 font-medium">
                <span>Total Struk: Rp 154.000</span>
                <span className="text-primary-200 font-semibold">Tax Terhitung</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Interactive Feature Showcases */}
      <section className="px-6 py-8 w-full max-w-5xl z-10">
        <div className="p-6 md:p-10 rounded-3xl border border-secondary-800/40 bg-text-950/30 backdrop-blur-md space-y-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-left space-y-2">
              <h2 className="text-xs font-black text-primary-400 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary-400" /> Alur Canggih
              </h2>
              <p className="text-xl md:text-2xl font-extrabold text-text">Gimana PETE-PETE Ngebantu Lo?</p>
            </div>

            {/* Tabs selector */}
            <div className="grid grid-cols-3 gap-1 bg-text-950/90 p-1 rounded-2xl border border-secondary-800/20 w-full max-w-xs md:max-w-sm">
              {Object.keys(features).map((key) => (
                <Button
                  key={key}
                  type="button"
                  onPress={() => setActiveTab(key as "ocr" | "split" | "share")}
                  className={`py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all text-center cursor-pointer ${
                    activeTab === key
                      ? "shadow-md shadow-primary/25 scale-[1.02]"
                      : "text-primary hover:text-white bg-transparent "
                  }`}
                >
                  {key === "ocr" ? "1. Scan" : key === "split" ? "2. Split" : "3. Share"}
                </Button>
              ))}
            </div>
          </div>

          {/* Active Tab Panel with Side-by-Side Visuals */}
          <div className="p-6 md:p-8 rounded-2xl bg-text-950/60 border border-secondary-800/20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-inner">
            
            {/* Left Content (Text and info details) */}
            <div className="md:col-span-7 space-y-6 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-text-900 border border-secondary-800/20 text-primary-400">
                    {features[activeTab].icon}
                  </div>
                  <h3 className="text-lg font-bold text-text">{features[activeTab].title}</h3>
                </div>
                <span className="text-[10px] font-bold bg-primary-950/80 border border-primary-900/40 text-primary-200 px-2.5 py-1 rounded-full">
                  {features[activeTab].badge}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-text-300 leading-relaxed">
                {features[activeTab].desc}
              </p>

              <div className="border-t border-secondary-900/60 pt-5 space-y-3">
                {features[activeTab].detail.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary-200 shrink-0" />
                    <span className="text-xs text-text-100 font-medium">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content (Visual mockup of the active feature) */}
            <div className="md:col-span-5 flex justify-center bg-text-900/40 p-6 rounded-2xl border border-secondary-800/10 min-h-[220px]">
              
              {activeTab === "ocr" && (
                <div className="w-full max-w-[240px] bg-text-950 p-4 rounded-xl border border-secondary-800/20 shadow-lg space-y-3 relative overflow-hidden animate-in zoom-in-95 duration-300">
                  {/* AI Scanning Beam Effect */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-bounce" />
                  
                  <div className="flex items-center justify-between border-b border-text-800 pb-2">
                    <span className="text-[9px] text-text-400 uppercase tracking-wider font-bold">Struk Belanja</span>
                    <span className="text-[8px] bg-primary-950 text-primary-400 px-1.5 py-0.5 rounded border border-primary-900/40">AI OCR Active</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-text-50 font-medium">1. Spicy Miso Ramen</span>
                      <span className="text-text-50 font-bold">Rp 45.000</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-text-50 font-medium">2. Original Gyoza</span>
                      <span className="text-text-50 font-bold">Rp 28.000</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-text-50 font-medium">3. Ocha Cold (Refill)</span>
                      <span className="text-text-50 font-bold">Rp 12.000</span>
                    </div>
                  </div>

                  <div className="border-t border-text-800 pt-2 flex justify-between text-[10px] text-primary-200 font-bold">
                    <span>Tax & Service (10%)</span>
                    <span>Rp 8.500</span>
                  </div>
                </div>
              )}

              {activeTab === "split" && (
                <div className="w-full max-w-[240px] bg-text-950 p-4 rounded-xl border border-secondary-800/20 shadow-lg space-y-3 animate-in zoom-in-95 duration-300">
                  <div className="border-b border-text-800 pb-2">
                    <span className="text-[9px] text-text-400 uppercase tracking-wider font-bold">Menu & Anggota</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-text-900 border border-secondary-800/10 flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-text-50 font-bold">Spicy Miso Ramen</span>
                        <span className="text-text-300">Rp 45.000</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[8px] bg-primary-900/60 border border-primary-800/50 text-primary-300 px-1.5 py-0.5 rounded-full font-medium">Budi</span>
                        <span className="text-[8px] bg-primary-950/60 border border-primary-900/50 text-primary-200 px-1.5 py-0.5 rounded-full font-medium">Ucup</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-text-900 border border-secondary-800/10 flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-text-50 font-bold">Original Gyoza</span>
                        <span className="text-text-300">Rp 28.000</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[8px] bg-primary-900/60 border border-primary-800/50 text-primary-300 px-1.5 py-0.5 rounded-full font-medium">Budi</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "share" && (
                <div className="w-full max-w-[240px] bg-[#0b141a] p-3.5 rounded-xl border border-zinc-800 shadow-lg space-y-2.5 animate-in zoom-in-95 duration-300 relative">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-[9px] text-white font-bold">WhatsApp Send</span>
                  </div>

                  <div className="bg-[#202c33] p-2.5 rounded-xl text-[9px] text-white space-y-1.5 border-l-4 border-primary max-w-[90%]">
                    <p className="font-extrabold text-primary-200">PETE-PETE: Ramen Geng 🍜</p>
                    <p>Total tagihan lo: <span className="font-bold text-white">Rp 73.000</span></p>
                    <p className="text-[8px] text-zinc-400">Menu: 1x Spicy Miso Ramen + 1x Gyoza</p>
                    <div className="mt-2 text-center bg-primary-600 py-1.5 rounded font-extrabold text-white text-[8px]">
                      Konfirmasi & Bayar
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* Info Stats Section */}
      <section className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-5xl z-10">
        <div className="p-6 rounded-3xl border border-secondary-800/40 bg-text-950/30 backdrop-blur-md text-left space-y-4 hover:border-primary-500/25 transition-all duration-300 hover:scale-[1.02] group">
          <div className="p-3 rounded-2xl bg-primary-950 border border-primary-900/40 w-fit group-hover:scale-110 transition-transform">
            <Coins01 className="w-6 h-6 text-primary-400" />
          </div>
          <h4 className="text-lg font-bold text-text leading-none">Tanpa Biaya</h4>
          <p className="text-xs text-text-300 leading-relaxed">
            Pakai semua fitur scan struk &amp; kelola banyak rekening sepuasnya gratis tanpa dipungut biaya sepeser pun.
          </p>
        </div>
        <div className="p-6 rounded-3xl border border-secondary-800/40 bg-text-950/30 backdrop-blur-md text-left space-y-4 hover:border-primary-500/25 transition-all duration-300 hover:scale-[1.02] group">
          <div className="p-3 rounded-2xl bg-primary-950 border border-primary-900/40 w-fit group-hover:scale-110 transition-transform">
            <Users01 className="w-6 h-6 text-primary-400" />
          </div>
          <h4 className="text-lg font-bold text-text-200 leading-none">Geng Happy</h4>
          <p className="text-xs text-text-300 leading-relaxed">
            Nggak ada lagi rasa sungkan nagih patungan secara manual. Hubungan tongkrongan tetap asyik &amp; harmonis!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center px-6 w-full max-w-5xl border-t border-text-900/60 pt-8 z-10">
        <p className="text-xs text-text-400 font-medium">
          PETE-PETE &mdash; Dibuat khusus biar patungan geng lo beres instan.
        </p>
      </footer>
    </div>
  );
}
