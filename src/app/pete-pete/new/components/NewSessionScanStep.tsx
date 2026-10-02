"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import {
  UploadCloud01,
  Plus,
  Trash01,
  ReceiptCheck,
  XClose,
  Image01,
  ArrowUpRight,
  MessageChatCircle,
  CheckCircle,
  Camera01,
} from "@untitledui/icons";
import { ScanResult, ScanItem, formatRupiah, parseRupiah } from "../types";
import WizardStepHeader from "./WizardStepHeader";
import MemberManagerStep from "./MemberManagerStep";
import FeeAdjustmentsFields from "./FeeAdjustmentsFields";
import ItemInputForm from "./ItemInputForm";
import DeleteConfirmation from "@/components/application/modals/DeleteConfirmation";

interface NewSessionScanStepProps {
  wizardStep: number;
  scanResult: ScanResult | null;
  file: File | null;
  filePreview: string | null;
  loading?: boolean;
  isDragOver: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  handleRemoveScanItem: (idx: number) => void;
  showScanItemForm: boolean;
  setShowScanItemForm: (val: boolean) => void;
  draftItemName: string;
  setDraftItemName: (val: string) => void;
  draftItemAmount: string;
  setDraftItemAmount: (val: string) => void;
  draftItemPrice: string;
  setDraftItemPrice: (val: string) => void;
  draftItemQty: string;
  setDraftItemQty: (val: string) => void;
  draftPriceMode: "unit" | "total";
  setDraftPriceMode: (val: "unit" | "total") => void;
  handleAddScanDraftItem: () => void;
  updateScanResultCalculations: (
    updatedItems: ScanItem[],
    taxAmount?: number,
    tipAmount?: number,
    discountAmount?: number
  ) => void;
  newMemberInput: string;
  setNewMemberInput: (val: string) => void;
  handleAddMember: () => void;
  manualMembers: string[];
  setManualMembers: React.Dispatch<React.SetStateAction<string[]>>;
  currentUserName: string;
  editingManualIndex: number | null;
  setEditingManualIndex: (val: number | null) => void;
  editingManualName: string;
  setEditingManualName: (val: string) => void;
  handleSaveManualRename: (idx: number) => void;
  detailsForm: React.ReactNode;
}

const TONGKRONGAN_QUOTES = [
  "Bentar ya Bos, AI lagi ngitung bon sambil mikirin senyum lo...",
  "Bhaappp",
  "Die lagi aja yang bayarinn",
  "Bhaappp!",
  "Die lagi aja yang bayarinnn...",
  "Gak usah sok kaget liat totalan, tadi siapa yang nambah truffle fries dua porsi?",
  "Momen hening cipta paling sakral: Pas pelayan naroh map bon di tengah meja.",
  "Muka lo pas liat service charge 10% padahal manggil masnya aja kudu dadah-dadah tiga kali.",
  "Kalo tagihan makan bisa dibagi rata, kenapa rasa sayang lo gak bisa?",
  "Tenang ngab, tagihan lo gak bakal seberat beban hidup kok.",
  "Lagi deteksi apakah ada sohib yang mesen wagyu tapi ngaku makan nasi goreng...",
  "Temen lu: 'Gua lagi cut sugar'. Pas liat dessert: 'Minta secuil dong', tau-tau abis setengah piring.",
  "Skenario klasik: Masuk cafe aesthetic, mesen artisan tea 60 ribu cuma demi numpang ngecas laptop.",
  "Duit bisa dicari lagi, tapi momen nongkrong gokil bareng sohib gini yang langka.",
  "Mata AI lagi fokus nih... Jangan sampe ada yang pura-pura ke toilet pas bayar!",
  "Sabar ya, AI lagi berjuang kayak perjuangan lo ngejar dia yang gak peka.",
  "Lagi nyisir baris struk... Siapa tau nemu diskon rahasia buat lo.",
  "Tadi bilangnya 'Ngopi santai bentar yuk', taunya pas bubar udah ganti hari dan bonnya beranak.",
  "Tongkrongan elite, pas scan QRIS saling lirik siapa yang mau jadi tumbal ditalangin dulu.",
  "Lagi kalkulasi... Semoga gak ada yang bayar pake jurus 'Nanti gua transfer ya' terus amnesia selamanya.",
  "Cinta mungkin bikin buta, tapi AI kita gak bakal buta baca harga di bon.",
  "Sedang mengkalkulasi... Semoga dompet lo tetep aman sentosa abis nongkrong ini.",
  "Bagi tagihan tanpa drama, biar tongkrongan tetep asik sampe tua.",
  "Lagi baca struk lecek lo nih... Tenang, AI kita udah terlatih hadapi kenyataan pahit.",
  "Nongkrong berjam-jam, pesennya es teh tawar refill... Ketauan lu ya!",
  "Tarik napas dulu, bentar lagi liat totalan yang bikin elus dada...",
  "Ada temen pas mesen: 'Gua mah apa aja terserah'. Pas bon dateng: 'Kok mahal banget?' Ya lu mesen salmon steak, Bambang!",
  "Lagi investigasi sohib yang tadi sok asik nawarin 'Coba nih cicip menu gua', tapi pas bayar minta dibagi rata.",
  "Deteksi radar: Ada yang tangannya mendadak kram pas dompet mau dikeluarin, pura-pura HP-nya lowbatt.",
  "Temen lu: 'Gua talangin dulu ya pake kartu'. Dalem hati: Lumayan dapet poin reward sama miles gratis.",
  "Definisi panik: Pas bon dateng, semua tiba-tiba sibuk natap layar HP padahal lagi buka kalkulator bawaan.",
  "Pesanan: Kopi satu, kentang goreng satu. Nongkrongnya dari jam 3 sore sampe barista ganti shift dua kali.",
  "Ada sohib yang pamit ke toilet jam 9 malem, pas balik udah jam 10 pas kasir udah beres dibayar.",
  "Biar silaturahmi gak terputus, pinjem dulu seratus... Terus jangan lupa pete-pete bon hari ini!",
  "Tips nongkrong hemat: Jangan pernah pesen menu yang ada hiasan daun mint di atas piringnya, pasti mahal.",
  "AI mencium aroma sohib yang bilang 'Terserah mau makan apa', tapi diajak ke warteg alesannya lagi radang.",
  "Kalo kata pepatah: Bersatu kita teguh, pas bagi bon pura-pura gak denger.",
  "Jangan sedih liat bonnya, yang penting feeds Instagram lo keliatan aesthetic dan mewah.",
  "Nongkrongnya fomo, pas bagi bon langsung overthinking mikirin masa depan.",
  "AI lagi verifikasi: Siapa yang tadi paling kenceng ngide pindah tempat padahal dompet udah sekarat?",
  "Curiga ada oknum yang pas pelayan nganter bon langsung pura-pura dapet telpon darurat.",
  "Bon udah kebaca... Siapin mental dan buka m-banking masing-masing, no kabur-kaburan!",
];

function ScanLoadingOverlay() {
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * TONGKRONGAN_QUOTES.length)
  );
  const [scanProgress, setScanProgress] = useState(8);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) return prev;
        const inc = prev < 35 ? 3.5 : prev < 70 ? 2 : prev < 88 ? 1.2 : 0.5;
        return Math.min(95, prev + inc);
      });
    }, 120);

    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => {
        let next = Math.floor(Math.random() * TONGKRONGAN_QUOTES.length);
        if (next === prev && TONGKRONGAN_QUOTES.length > 1) {
          next = (next + 1) % TONGKRONGAN_QUOTES.length;
        }
        return next;
      });
    }, 3600);

    return () => {
      clearInterval(progressTimer);
      clearInterval(quoteTimer);
    };
  }, []);

  const getProgressLabel = (progress: number) => {
    if (progress < 30) return "Membaca gambar struk";
    if (progress < 65) return "Mengekstrak menu & harga";
    if (progress < 85) return "Mendeteksi pajak & diskon";
    return "Menyiapkan rincian tagihan";
  };

  const currentQuote = TONGKRONGAN_QUOTES[quoteIndex];

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-5 bg-secondary-950/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-3.5 text-center animate-in zoom-in-95 duration-200">
        {/* Scanner Icon */}
        <div className="relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-primary-400/15 border border-primary-400/30 text-primary-400 shadow-sm">
          <MessageChatCircle className="w-6 h-6" />
        </div>
        {/* Title */}
        <div className="space-y-0.5">
          <h3 className="text-xs sm:text-sm font-extrabold text-text-50 tracking-tight">
            AI Lagi Memindai Struk
          </h3>
          <p className="text-3xs sm:text-2xs text-text-400">
            Santai dulu ya, bon lo lagi dibaca dan dihitung sama AI
          </p>
        </div>
        {/* In-Place Quote Card */}
        <div className="w-full text-left p-3.5 rounded-2xl bg-secondary-900/80 border border-secondary-800/90 flex flex-col gap-2.5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-3xs text-text-400 font-semibold">Pete-Pete AI</span>
          </div>
          <div className="min-h-17 sm:min-h-19 flex items-center justify-center text-center px-1">
            <p
              key={quoteIndex}
              className="text-xs sm:text-sm font-semibold text-text-50 leading-relaxed italic transition-all duration-300 animate-in fade-in slide-in-from-bottom-1"
            >
              &ldquo;{currentQuote}&rdquo;
            </p>
          </div>
          {/* Dynamic Scan Progress Bar */}
          <div className="space-y-1.5 pt-1 border-t border-secondary-800/60">
            <div className="flex items-center justify-between text-3xs font-semibold">
              <span className="text-text-300 flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                <span className="truncate">{getProgressLabel(scanProgress)}</span>
              </span>
              <span className="text-primary-400 font-extrabold tabular-nums shrink-0 ml-2">
                {Math.round(scanProgress)}%
              </span>
            </div>
            <div className="w-full bg-secondary-950/90 h-2 rounded-full overflow-hidden border border-secondary-800/80 p-0.5 shadow-inner">
              <div
                style={{ width: `${Math.min(100, Math.max(8, scanProgress))}%` }}
                className="h-full bg-linear-to-r from-primary-600 via-primary-500 to-primary-400 rounded-full transition-all duration-200 ease-out shadow-[0_0_8px_var(--color-primary-400)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function NewSessionScanStep({
  wizardStep,
  scanResult,
  file,
  filePreview,
  loading = false,
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
  onClearFile,
  handleRemoveScanItem,
  showScanItemForm,
  setShowScanItemForm,
  draftItemName,
  setDraftItemName,
  draftItemAmount,
  setDraftItemAmount,
  draftItemPrice,
  setDraftItemPrice,
  draftItemQty,
  setDraftItemQty,
  draftPriceMode,
  setDraftPriceMode,
  handleAddScanDraftItem,
  updateScanResultCalculations,
  newMemberInput,
  setNewMemberInput,
  handleAddMember,
  manualMembers,
  setManualMembers,
  currentUserName,
  editingManualIndex,
  setEditingManualIndex,
  editingManualName,
  setEditingManualName,
  handleSaveManualRename,
  detailsForm,
}: NewSessionScanStepProps) {
  const scanItems = scanResult?.items || [];
  const [deleteItemIndex, setDeleteItemIndex] = useState<number | null>(null);

  // Update item menu langsung dari form input baris
  const handleUpdateItem = (
    idx: number,
    field: "name" | "quantity" | "unitPrice" | "totalPrice",
    val: string
  ) => {
    const updatedItems = [...scanItems];
    const item = { ...updatedItems[idx] };

    if (field === "name") {
      item.name = val;
    } else if (field === "quantity") {
      const q = val === "" ? 0 : Math.max(0, parseInt(val) || 0);
      item.quantity = q;
      item.totalPrice = (item.unitPrice || 0) * q;
    } else if (field === "unitPrice") {
      const u = val === "" ? 0 : Math.max(0, parseFloat(val) || 0);
      item.unitPrice = u;
      item.totalPrice = u * (item.quantity || 1);
    } else if (field === "totalPrice") {
      const t = val === "" ? 0 : Math.max(0, parseFloat(val) || 0);
      item.totalPrice = t;
      const q = item.quantity || 1;
      item.unitPrice = q > 0 ? t / q : t;
    }

    updatedItems[idx] = item;
    updateScanResultCalculations(
      updatedItems,
      scanResult?.taxAmount,
      scanResult?.tipAmount,
      scanResult?.discountAmount
    );
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Step Indicator */}
      <WizardStepHeader
        wizardStep={wizardStep}
        step1Title="Langkah 1: Upload & Verifikasi Menu"
      />

      {/* WIZARD STEP 1: UPLOAD & VERIFY SCAN ITEMS */}
      {wizardStep === 1 && (
        <div className="space-y-4">
          {/* Step 1: Upload File (sebelum scan) */}
          {!scanResult && (
            <div
              id="tour-receipt-upload"
              className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-primary-400/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">
                    1
                  </span>
                  PILIH FOTO STRUK
                </h2>
                {file && (
                  <Button onPress={onClearFile} color="link-gray" className="text-xs font-semibold text-secondary-200">
                    Hapus Foto
                  </Button>
                )}
              </div>

              {!filePreview ? (
                <div className="space-y-3">
                  {/* Hidden Inputs: Kamera HP bawaan (capture) & File picker galeri */}
                  <input
                    id="camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />

                  {/* Opsi 1: Ambil Foto Langsung dengan Aplikasi Kamera HP */}
                  <label
                    htmlFor="camera-input"
                    className="w-full p-4 sm:p-5 rounded-2xl border-2 border-primary-500/40 bg-linear-to-br from-primary-950/40 via-secondary-950/60 to-secondary-900/40 hover:border-primary-400 hover:bg-primary-950/60 transition-all text-left flex items-center justify-between gap-3 group cursor-pointer active:scale-[0.99] shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary-400/20 border border-primary-400/30 text-primary-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary-400/30 transition-all shadow-xs">
                        <Camera01 className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-text-50 group-hover:text-primary-300 transition-colors">
                          Foto Struk Langsung
                        </p>
                        <p className="text-2xs text-text-300 mt-0.5">
                          Buka aplikasi kamera bawaan HP buat langsung jepret bon
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-3xs font-extrabold bg-primary-400/20 text-primary-300 px-2.5 py-1 rounded-md border border-primary-400/30 group-hover:bg-primary-400 group-hover:text-secondary-950 transition-colors">
                      Buka Kamera
                    </span>
                  </label>

                  {/* Opsi 2: Dropzone / Upload dari Galeri atau File */}
                  <label
                    htmlFor="file-input"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.99] group ${
                      isDragOver
                        ? "border-primary-400 bg-primary-950/40"
                        : "border-secondary-700/80 bg-secondary-900/30 hover:border-secondary-600 hover:bg-secondary-900/60"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary-800/80 border border-secondary-700 text-text-300 flex items-center justify-center mb-2.5 group-hover:scale-105 group-hover:text-text-100 transition-all shadow-xs">
                      <UploadCloud01 className="w-5 h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-text-100">
                      Atau pilih dari galeri / file
                    </p>
                    <p className="text-2xs text-text-400 mt-0.5">
                      Klik buat cari file atau tarik foto struk ke sini
                    </p>
                    <span className="text-3xs text-text-400 mt-2 bg-secondary-900/80 border border-secondary-800 px-2.5 py-0.5 rounded-full">
                      Format: JPG, PNG, WebP (maks. 10MB)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Hidden Inputs untuk ganti / foto ulang */}
                  <input
                    id="camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />

                  <div className="relative w-full rounded-2xl overflow-hidden bg-secondary-950/60 border border-secondary-800 p-2 flex items-center justify-center max-h-122 sm:max-h-136">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={filePreview}
                      alt="Struk"
                      className="max-h-104 sm:max-h-128 w-auto max-w-full object-contain rounded-xl"
                    />
                    {/* Loading Overlay khusus di dalam frame foto struk */}
                    {loading && <ScanLoadingOverlay />}
                  </div>

                  {!loading && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <p className="text-2xs text-text-400">
                        Foto kurang pas? Bisa foto ulang atau ganti file
                      </p>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="camera-input"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-secondary-700 bg-secondary-900 text-xs font-semibold text-text-100 hover:bg-secondary-800 hover:text-text-50 transition-all cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <Camera01 className="w-3.5 h-3.5 shrink-0" />
                          <span>Foto Ulang</span>
                        </label>
                        <label
                          htmlFor="file-input"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-secondary-700 bg-secondary-900 text-xs font-semibold text-text-100 hover:bg-secondary-800 hover:text-text-50 transition-all cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <UploadCloud01 className="w-3.5 h-3.5 shrink-0" />
                          <span>Ganti File</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tips Foto Struk Biar Akurat */}
              <div className="p-3.5 rounded-xl bg-secondary-900/40 border border-secondary-800/70 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-text-200 font-bold">
                  <CheckCircle className="w-4 h-4 text-primary-400 shrink-0" />
                  <span>Tips Foto Struk Biar Akurat:</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-2xs text-text-400">
                  <li className="flex items-start gap-1.5 bg-secondary-950/40 p-2.5 rounded-lg border border-secondary-800/40">
                    <span className="text-primary-400 font-bold">•</span>
                    <span>Foto tegak lurus dan sejajar sama kertas struk</span>
                  </li>
                  <li className="flex items-start gap-1.5 bg-secondary-950/40 p-2.5 rounded-lg border border-secondary-800/40">
                    <span className="text-primary-400 font-bold">•</span>
                    <span>Pencahayaan terang &amp; gak kena bayangan gelap</span>
                  </li>
                  <li className="flex items-start gap-1.5 bg-secondary-950/40 p-2.5 rounded-lg border border-secondary-800/40">
                    <span className="text-primary-400 font-bold">•</span>
                    <span>Pastiin nama menu &amp; total nominal kebaca jelas</span>
                  </li>
                </ul>
              </div>
            </div>
          )}


          {/* Hasil Scan & List Item */}
          {scanResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div
                id="tour-scan-items"
                className="bg-secondary-950/40 border border-secondary-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary-400/10 border border-primary-400/20 text-primary-400">
                      <ReceiptCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-text-50 uppercase tracking-wider">
                        Rincian Menu Struk
                      </h3>
                      <p className="text-2xs text-text-400 mr-0.5">
                        Bisa langsung diedit di kotak masing-masing kalo ada nama, porsi, atau harga yang keliru dibaca AI
                      </p>
                    </div>
                  </div>
                  <Badge color="brand" size="sm" type="pill-color" className="font-bold text-3xs">
                    {scanItems.length} Menu
                  </Badge>
                </div>

                {/* Items List - Form Input Langsung */}
                <div className="space-y-2.5">
                  {scanItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-secondary-900/60 border border-secondary-800/90 hover:border-secondary-700/90 focus-within:border-primary-400/60 focus-within:ring-1 focus-within:ring-primary-400/20 rounded-xl p-3 space-y-2.5 transition-all shadow-xs"
                    >
                      {/* Baris 1: Nomor Urut, Input Nama Menu, dan Tombol Hapus */}
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-secondary-800/80 border border-secondary-700/80 text-text-300 flex items-center justify-center text-3xs font-black shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleUpdateItem(idx, "name", e.target.value)
                          }
                          aria-label={`Nama Menu #${idx + 1}`}
                          placeholder="Nama menu struk"
                          className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-secondary-950/80 border border-secondary-700/80 text-xs sm:text-sm font-bold text-text-50 placeholder-text-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-colors"
                        />
                        <Button
                          size="xs"
                          color="tertiary-destructive"
                          onPress={() => setDeleteItemIndex(idx)}
                          aria-label={`Hapus ${item.name}`}
                          iconLeading={Trash01}
                          className="p-1.5 text-danger-400 hover:bg-danger-950/40 rounded-lg active:scale-95 transition-all shrink-0"
                        />
                      </div>

                      {/* Baris 2: Input Porsi & Input Harga Satuan (Satuan mengisi sisa gap di kanan) */}
                      <div className="flex items-center gap-2 pt-1 border-t border-secondary-800/60">
                        {/* Porsi / Qty */}
                        <div className="flex items-center gap-1.5 bg-secondary-950/80 border border-secondary-700/80 rounded-lg px-2.5 py-1 focus-within:border-primary-400 shrink-0">
                          <span className="text-3xs text-text-400 font-bold uppercase tracking-wider">
                            Porsi
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity === 0 ? "" : item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(idx, "quantity", e.target.value)
                            }
                            aria-label={`Porsi #${idx + 1}`}
                            className="w-8 text-center text-xs font-black text-text-50 bg-transparent outline-none tabular-nums"
                          />
                          <span className="text-3xs text-text-400 font-bold">x</span>
                        </div>

                        {/* Harga Satuan - Mengisi sisa gap lebar di kanan */}
                        <div className="flex-1 min-w-0 flex items-center gap-1.5 bg-secondary-950/80 border border-secondary-700/80 rounded-lg px-2.5 py-1 focus-within:border-primary-400">
                          <span className="text-3xs text-text-400 font-bold uppercase tracking-wider shrink-0">
                            Satuan
                          </span>
                          <input
                            type="text"
                            value={formatRupiah(String(Math.round(item.unitPrice)))}
                            onChange={(e) =>
                              handleUpdateItem(
                                idx,
                                "unitPrice",
                                parseRupiah(e.target.value)
                              )
                            }
                            aria-label={`Harga satuan #${idx + 1}`}
                            placeholder="0"
                            className="flex-1 min-w-0 text-xs font-bold text-text-50 bg-transparent outline-none tabular-nums"
                          />
                        </div>
                      </div>

                      {/* Baris 3: Total Harga w-full, nominal di pojok kanan (end) */}
                      <div className="w-full flex items-center justify-between gap-2 bg-secondary-950/80 border border-secondary-700/80 rounded-lg px-2.5 py-1 focus-within:border-primary-400">
                        <span className="text-3xs text-text-400 font-bold uppercase tracking-wider shrink-0">
                          Total
                        </span>
                        <input
                          type="text"
                          value={formatRupiah(String(Math.round(item.totalPrice)))}
                          onChange={(e) =>
                            handleUpdateItem(
                              idx,
                              "totalPrice",
                              parseRupiah(e.target.value)
                            )
                          }
                          aria-label={`Total harga #${idx + 1}`}
                          placeholder="0"
                          className="flex-1 min-w-0 text-right text-xs sm:text-sm font-black text-primary-400 bg-transparent outline-none tabular-nums"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tombol / Form Tambah Menu Manual ke Struk */}
                {!showScanItemForm ? (
                  <Button
                    type="button"
                    onPress={() => setShowScanItemForm(true)}
                    size="sm"
                    color="secondary"
                    iconLeading={Plus}
                    className="w-full"
                  >
                    Tambah Menu Tambahan
                  </Button>
                ) : (
                  <div className="p-4 rounded-xl border border-secondary-800 bg-secondary-950/60 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-50">
                        Tambah Menu Tambahan
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-300 block">
                        Nama Menu
                      </label>
                      <input
                        type="text"
                        required
                        aria-label="Nama Menu Tambahan"
                        value={draftItemName}
                        onChange={(e) => setDraftItemName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text-50 placeholder-text-500 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                        placeholder="Contoh: Es Teh Manis, Nasi Putih"
                      />
                    </div>

                    <div className="flex items-end gap-2 sm:gap-2.5">
                      {/* Porsi: simpel & ramping */}
                      <div className="w-14 sm:w-16 shrink-0 space-y-1.5">
                        <label className="text-2xs sm:text-xs font-semibold text-text-300 block text-center truncate">
                          Porsi
                        </label>
                        <input
                          type="number"
                          min={1}
                          aria-label="Porsi atau Jumlah Menu Tambahan"
                          value={draftItemQty}
                          onChange={(e) => {
                            const q = e.target.value;
                            setDraftItemQty(q);
                            const qtyNum = parseFloat(q) || 0;
                            if (draftPriceMode === "unit" && draftItemPrice) {
                              setDraftItemAmount(String(qtyNum * Number(draftItemPrice)));
                            } else if (draftPriceMode === "total" && draftItemAmount && qtyNum > 0) {
                              setDraftItemPrice(
                                String(Math.round(Number(draftItemAmount) / qtyNum))
                              );
                            }
                          }}
                          className="w-full h-10 px-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs font-bold text-text-50 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 text-center tabular-nums"
                        />
                      </div>

                      {/* Tipe Harga: ringkas */}
                      <div className="w-28 sm:w-32 shrink-0 space-y-1.5">
                        <label className="text-2xs sm:text-xs font-semibold text-text-300 block text-center truncate">
                          Tipe Harga
                        </label>
                        <div className="grid grid-cols-2 gap-0.5 bg-secondary-900 p-1 rounded-lg border border-secondary-800 h-10 items-center">
                          <Button
                            type="button"
                            onPress={() => setDraftPriceMode("unit")}
                            color={draftPriceMode === "unit" ? "primary" : "tertiary"}
                            size="xs"
                            className="h-full px-1 text-3xs sm:text-xs font-bold rounded"
                          >
                            Satuan
                          </Button>
                          <Button
                            type="button"
                            onPress={() => setDraftPriceMode("total")}
                            color={draftPriceMode === "total" ? "primary" : "tertiary"}
                            size="xs"
                            className="h-full px-1 text-3xs sm:text-xs font-bold rounded"
                          >
                            Total
                          </Button>
                        </div>
                      </div>

                      {/* Input Harga: fleksibel mengambil sisa ruang yang banyak */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <label className="text-2xs sm:text-xs font-semibold text-text-300 block truncate">
                          {draftPriceMode === "unit" ? "Harga Satuan" : "Harga Total"}
                        </label>
                        {draftPriceMode === "unit" ? (
                          <input
                            type="text"
                            required
                            aria-label="Harga satuan menu tambahan"
                            value={formatRupiah(draftItemPrice)}
                            onChange={(e) => {
                              const p = parseRupiah(e.target.value);
                              setDraftItemPrice(p);
                              const q = parseFloat(draftItemQty) || 1;
                              setDraftItemAmount(p ? String(q * Number(p)) : "");
                            }}
                            className="w-full h-10 px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs sm:text-sm font-semibold text-text-50 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 tabular-nums"
                            placeholder="Rp Satuan"
                          />
                        ) : (
                          <input
                            type="text"
                            required
                            aria-label="Harga total menu tambahan"
                            value={formatRupiah(draftItemAmount)}
                            onChange={(e) => {
                              const a = parseRupiah(e.target.value);
                              setDraftItemAmount(a);
                              const q = parseFloat(draftItemQty) || 1;
                              setDraftItemPrice(
                                a && q > 0 ? String(Math.round(Number(a) / q)) : ""
                              );
                            }}
                            className="w-full h-10 px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs sm:text-sm font-semibold text-text-50 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 tabular-nums"
                            placeholder="Rp Total"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <Button
                        type="button"
                        onPress={() => setShowScanItemForm(false)}
                        color="secondary"
                        size="xs"
                        className="rounded-lg font-semibold min-h-9 px-3 active:scale-95"
                      >
                        Batal
                      </Button>
                      <Button
                        type="button"
                        onPress={handleAddScanDraftItem}
                        color="primary"
                        size="xs"
                        className="rounded-lg font-bold min-h-9 px-4 active:scale-95"
                      >
                        Simpan Menu
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pajak, Service Charge, & Diskon */}
                <div id="tour-scan-fees">
                  <FeeAdjustmentsFields
                    tax={scanResult.taxAmount || 0}
                    onTaxChange={(val) =>
                      updateScanResultCalculations(
                        scanItems,
                        val,
                        scanResult.tipAmount,
                        scanResult.discountAmount
                      )
                    }
                    tip={scanResult.tipAmount || 0}
                    onTipChange={(val) =>
                      updateScanResultCalculations(
                        scanItems,
                        scanResult.taxAmount,
                        val,
                        scanResult.discountAmount
                      )
                    }
                    discount={scanResult.discountAmount || 0}
                    onDiscountChange={(val) =>
                      updateScanResultCalculations(
                        scanItems,
                        scanResult.taxAmount,
                        scanResult.tipAmount,
                        val
                      )
                    }
                  />
                </div>

                {/* Total Sementara */}
                <div className="flex justify-between items-center pt-3 border-t border-secondary-800/80">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-text-300">
                    Total Sementara
                  </span>
                  <span className="text-sm sm:text-base font-black text-primary-400 tabular-nums">
                    Rp {scanResult.totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WIZARD STEP 2: INPUT MEMBERS */}
      {wizardStep === 2 && (
        <MemberManagerStep
          newMemberInput={newMemberInput}
          setNewMemberInput={setNewMemberInput}
          handleAddMember={handleAddMember}
          manualMembers={manualMembers}
          setManualMembers={setManualMembers}
          currentUserName={currentUserName}
          editingManualIndex={editingManualIndex}
          setEditingManualIndex={setEditingManualIndex}
          editingManualName={editingManualName}
          setEditingManualName={setEditingManualName}
          handleSaveManualRename={handleSaveManualRename}
        />
      )}

      {/* WIZARD STEP 3: DETAILS */}
      {wizardStep === 3 && (
        <div className="space-y-4">
          {/* Form Detail Rekening & Judul */}
          {detailsForm}
        </div>
      )}

      {/* Modal Konfirmasi Hapus Menu Struk */}
      <DeleteConfirmation
        isOpen={deleteItemIndex !== null}
        onClose={() => setDeleteItemIndex(null)}
        onConfirm={() => {
          if (deleteItemIndex !== null) {
            handleRemoveScanItem(deleteItemIndex);
            setDeleteItemIndex(null);
          }
        }}
        title="Hapus Menu Ini?"
        description={
          deleteItemIndex !== null && scanItems[deleteItemIndex]
            ? `Yakin mau hapus menu "${scanItems[deleteItemIndex].name || `Menu #${deleteItemIndex + 1}`}" dari struk? Nominal total bakal otomatis dihitung ulang.`
            : "Yakin mau hapus menu ini dari struk? Nominal total bakal otomatis dihitung ulang."
        }
        confirmText="Hapus Aja"
        cancelText="Gak Jadi"
      />
    </div>
  );
}
