"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBillSession } from "@/app/actions/session";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/base/buttons/button";
import { Edit02, Camera01, Plus, ArrowLeft, AlertCircle, UploadCloud01 } from "@untitledui/icons";
import { getUserBanks, UserBankData } from "@/app/actions/profile";

interface ScanItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ScanResult {
  merchantName: string;
  items: ScanItem[];
  taxAmount: number;
  tipAmount: number;
  totalAmount: number;
  currency: string;
  isMock?: boolean;
}

type InputMode = "scan" | "manual";

const BANK_TEMPLATES = [
  { name: "BCA", logo: "/bank-logos/bca.svg", placeholder: "Contoh: 1234567890" },
  { name: "Bank Mandiri", logo: "/bank-logos/mandiri.svg", placeholder: "Contoh: 1370012345678" },
  { name: "BRI", logo: "/bank-logos/bri.svg", placeholder: "Contoh: 001201000123456" },
  { name: "BNI", logo: "/bank-logos/bni.svg", placeholder: "Contoh: 0123456789" },
  { name: "GoPay", logo: "/bank-logos/gopay.svg", placeholder: "Contoh: 081234567890" },
  { name: "OVO", logo: "/bank-logos/ovo.svg", placeholder: "Contoh: 081234567890" },
  { name: "Dana", logo: "/bank-logos/dana.svg", placeholder: "Contoh: 081234567890" },
  { name: "QRIS", logo: "/bank-logos/qris.svg", placeholder: "Paste URL gambar QRIS lo di sini" },
];

export default function NewSessionPage() {
  const router = useRouter();
  const { data: authSession, isPending } = useSession();

  // Mode selection
  const [inputMode, setInputMode] = useState<InputMode | null>(null);

  // Shared state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Bank details selection & inputs
  const [profileBanks, setProfileBanks] = useState<UserBankData[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>("custom");
  const [useProfileBank, setUseProfileBank] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("BCA");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankOwner, setBankOwner] = useState("");
  const [qrisUrl, setQrisUrl] = useState("");

  // Fetch profile bank details
  useEffect(() => {
    if (authSession?.user?.id) {
      getUserBanks(authSession.user.id).then((res) => {
        if (res.success && res.banks && res.banks.length > 0) {
          setProfileBanks(res.banks);
          setSelectedBankId(res.banks[0].id || "custom");
          setUseProfileBank(true);
        } else {
          setUseProfileBank(false);
          setSelectedBankId("custom");
        }
      });
    }
  }, [authSession]);

  // Scan mode state
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Manual mode state — new item form
  const [manualMembers, setManualMembers] = useState<string[]>([]);
  const [newMemberInput, setNewMemberInput] = useState("");
  const [draftItemName, setDraftItemName] = useState("");
  const [draftItemAmount, setDraftItemAmount] = useState("");
  const [draftItemSplitWith, setDraftItemSplitWith] = useState<string[]>([]);
  const [draftItemPaidBy, setDraftItemPaidBy] = useState<string>("");
  const [manualItems, setManualItems] = useState<ScanItem[]>([]);
  const [manualTax, setManualTax] = useState(0);
  const [manualTip, setManualTip] = useState(0);

  // All people in the session (current user + added members)
  const currentUserName = authSession?.user?.name ?? "Gua";
  const allPeople = [currentUserName, ...manualMembers];

  // Clean up object URL to avoid memory leak
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // --- Scan Mode Handlers ---
  const handleFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setScanResult(null);
      setError("");
    } else {
      setError("Silakan unggah file gambar struk (PNG, JPG, JPEG, dsb).");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleScanReceipt = async () => {
    if (!file) { setError("Silakan pilih file struk terlebih dahulu."); return; }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ocr/scan", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal memproses gambar.");
      setScanResult(result);
      if (result.merchantName) setMerchantName(result.merchantName);
      if (result.merchantName && !title) setTitle(`PETE-PETE ${result.merchantName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses scan struk.");
    } finally {
      setLoading(false);
    }
  };

  // --- Manual Mode Handlers ---
  const handleAddMember = () => {
    const name = newMemberInput.trim();
    if (!name || manualMembers.includes(name) || name === currentUserName) return;
    setManualMembers((prev) => [...prev, name]);
    setNewMemberInput("");
    setDraftItemSplitWith((prev) => [...prev, name]);
  };

  const handleToggleSplit = (person: string) => {
    setDraftItemSplitWith((prev) =>
      prev.includes(person) ? prev.filter((p) => p !== person) : [...prev, person]
    );
  };

  const handleAddDraftItem = () => {
    const name = draftItemName.trim();
    const total = parseFloat(draftItemAmount);
    if (!name || isNaN(total) || total <= 0) return;
    const splitCount = draftItemSplitWith.length || 1;
    setManualItems((prev) => [
      ...prev,
      { name, quantity: splitCount, unitPrice: total / splitCount, totalPrice: total },
    ]);
    setDraftItemName("");
    setDraftItemAmount("");
  };

  const handleRemoveManualItem = (idx: number) => {
    setManualItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const manualSubtotal = manualItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const manualTotal = manualSubtotal + Number(manualTax) + Number(manualTip);

  // --- Create Session ---
  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const isManual = inputMode === "manual";
    const isScan = inputMode === "scan";

    if (isScan && !scanResult) {
      setError("Silakan scan struk Anda terlebih dahulu untuk membagi tagihan.");
      return;
    }
    if (isManual && manualItems.some(i => !i.name.trim())) {
      setError("Nama menu tidak boleh kosong.");
      return;
    }
    if (isManual && manualItems.length === 0) {
      setError("Tambahkan minimal satu menu.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const items = isScan ? scanResult!.items : manualItems.filter(i => i.name.trim());
      const taxAmount = isScan ? scanResult!.taxAmount : Number(manualTax);
      const tipAmount = isScan ? scanResult!.tipAmount : Number(manualTip);
      const subtotal = items.reduce((acc, i) => acc + i.totalPrice, 0);
      const totalAmount = isScan ? scanResult!.totalAmount : subtotal + taxAmount + tipAmount;

      let finalBankName = bankName;
      let finalBankAccount = bankAccount;
      let finalBankOwner = bankOwner;

      if (useProfileBank && selectedBankId !== "custom") {
        const found = profileBanks.find((b) => b.id === selectedBankId);
        if (found) {
          finalBankName = found.bankName;
          finalBankAccount = found.bankAccount;
          finalBankOwner = found.bankOwner;
        }
      } else if (selectedTemplate === "QRIS") {
        finalBankName = "QRIS";
        finalBankAccount = qrisUrl;
      } else {
        finalBankName = selectedTemplate;
      }

      const res = await createBillSession({
        title: title || `PETE-PETE ${merchantName}`,
        description,
        merchantName: merchantName || (isScan ? scanResult!.merchantName : ""),
        totalAmount,
        taxAmount,
        tipAmount,
        userId: authSession?.user?.id,
        items,
        bankName: finalBankName,
        bankAccount: finalBankAccount,
        bankOwner: finalBankOwner,
      });

      if (!res.success) {
        setError(res.error || "Gagal membuat sesi.");
      } else {
        router.push(`/pete-pete/${res.session?.id}/split`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat sesi PETE-PETE.");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-alice-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-jet-black-300 text-sm">Bentar...</p>
        </div>
      </div>
    );
  }

  // --- Step 0: Choose Mode ---
  if (!inputMode) {
    return (
      <main className="flex-1 flex flex-col bg-lilac-ash-950">
        <header className="sticky top-0 z-20 bg-lilac-ash-950/90 backdrop-blur-md border-b border-lilac-ash-800 px-4 py-4 flex items-center gap-3">
          <Button href={authSession ? "/dashboard" : "/"} color="primary" size="sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-base font-semibold text-jet-black-50">Buat Sesi PETE-PETE</h1>
            <p className="text-[10px] text-jet-black-300">Pilih cara input menu</p>
          </div>
        </header>

        <div className="flex-1 p-5 flex flex-col justify-center gap-3">
          <p className="text-xs text-jet-black-300 text-center mb-1">Mau input gimana nih?</p>

          {/* Scan Mode Card */}
          <button
            type="button"
            onClick={() => setInputMode("scan")}
            className="w-full text-left p-4 rounded-2xl border border-lilac-ash-800 bg-jet-black-900 hover:border-alice-blue-700 hover:bg-jet-black-800 active:scale-[0.98] transition-all space-y-2.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-alice-blue-900/60 border border-alice-blue-800 flex items-center justify-center">
                <Camera01 className="w-5 h-5 text-alice-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-jet-black-50">Scan Foto Struk</p>
                <p className="text-[10px] text-jet-black-300">AI otomatis baca item &amp; harga dari foto</p>
              </div>
            </div>
            <p className="text-[10px] text-jet-black-400 leading-relaxed pl-[52px]">
              Foto struk makan atau belanja, semua menu &amp; harganya langsung kebaca otomatis.
            </p>
          </button>

          {/* Manual Mode Card */}
          <button
            type="button"
            onClick={() => setInputMode("manual")}
            className="w-full text-left p-4 rounded-2xl border border-lilac-ash-800 bg-jet-black-900 hover:border-emerald-700 hover:bg-jet-black-800 active:scale-[0.98] transition-all space-y-2.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-center">
                <Edit02 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-jet-black-50">Input Manual</p>
                <p className="text-[10px] text-jet-black-300">Ketik item &amp; jumlah sendiri satu per satu</p>
              </div>
            </div>
            <p className="text-[10px] text-jet-black-400 leading-relaxed pl-[52px]">
              Ga ada foto struk? Langsung ketik aja nama item sama harganya. Bebas mau split gimana.
            </p>
          </button>
        </div>
      </main>
    );
  }

  // --- Shared Details Form (shown after both modes have items ready) ---
  const isReadyForDetails = (inputMode === "scan" && scanResult) || inputMode === "manual";

  // Helper: shared details form
  const detailsForm = (
    <div className="bg-jet-black-900 border border-lilac-ash-800 rounded-xl p-4 shadow-sm space-y-4">
      <h2 className="text-xs font-semibold text-jet-black-100 uppercase tracking-wider">
        2. Detail Sesi
      </h2>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-jet-black-100">Judul Sesi</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 focus:border-alice-blue-500 focus:ring-1 focus:ring-alice-blue-500 text-jet-black-50 placeholder-jet-black-500 text-xs outline-none transition-all"
            placeholder="Misal: Makan Siang Bersama"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-jet-black-100">Nama Toko / Merchant</label>
          <input
            type="text"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 focus:border-alice-blue-500 focus:ring-1 focus:ring-alice-blue-500 text-jet-black-50 placeholder-jet-black-500 text-xs outline-none transition-all"
            placeholder="Misal: Restoran Selera"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-jet-black-100">Catatan (Opsional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 focus:border-alice-blue-500 focus:ring-1 focus:ring-alice-blue-500 text-jet-black-50 placeholder-jet-black-500 text-xs outline-none transition-all"
            placeholder="Keterangan tambahan..."
            rows={2}
          />
        </div>

        <div className="border-t border-lilac-ash-800 pt-3 space-y-3">
          <h3 className="text-[11px] font-bold text-alice-blue-400 uppercase tracking-wider">🏦 Rekening Transfer Sesi Ini</h3>

          {profileBanks.length > 0 ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-jet-black-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useProfileBank}
                  onChange={(e) => {
                    setUseProfileBank(e.target.checked);
                    if (e.target.checked && profileBanks.length > 0) {
                      setSelectedBankId(profileBanks[0].id || "custom");
                    } else {
                      setSelectedBankId("custom");
                    }
                  }}
                  className="rounded bg-jet-black-950 border-jet-black-700 text-alice-blue-500 focus:ring-alice-blue-500"
                />
                Pilih Rekening Profil
              </label>

              {useProfileBank ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    {profileBanks.map((b) => (
                      <label
                        key={b.id}
                        className={`p-3 rounded-lg border text-xs text-jet-black-300 flex items-center justify-between cursor-pointer transition-all ${selectedBankId === b.id
                            ? "bg-alice-blue-950/40 border-alice-blue-500 text-jet-black-100"
                            : "bg-jet-black-950 border-jet-black-800 hover:border-jet-black-700"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="profileBankSelect"
                            checked={selectedBankId === b.id}
                            onChange={() => b.id && setSelectedBankId(b.id)}
                            className="bg-jet-black-950 border-jet-black-700 text-alice-blue-500 focus:ring-alice-blue-500"
                          />
                          <div>
                            <p className="font-bold text-jet-black-50">{b.bankName}</p>
                            <p className="text-[10px]">
                              {b.bankName === "QRIS" ? "Gambar QRIS" : b.bankAccount} (A/N {b.bankOwner})
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-[10px] text-amber-400">
              * Belum ada rekening di profil. Langsung input baru aja di bawah ini:
            </p>
          )}

          {(!useProfileBank || selectedBankId === "custom") && (
            <div className="space-y-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-jet-black-100">Pilih Tipe Bank / E-Wallet</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {BANK_TEMPLATES.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSelectedTemplate(t.name)}
                      className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold transition-all text-center ${selectedTemplate === t.name
                          ? "bg-alice-blue-900 border-alice-blue-500 text-alice-blue-300"
                          : "bg-jet-black-950 border-jet-black-700 text-jet-black-300 hover:bg-jet-black-900"
                        }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTemplate === "QRIS" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-jet-black-100">URL Gambar QRIS</label>
                  <input
                    type="text"
                    required
                    value={qrisUrl}
                    onChange={(e) => setQrisUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 focus:border-alice-blue-500 focus:ring-1 focus:ring-alice-blue-500 text-jet-black-50 placeholder-jet-black-500 text-xs outline-none transition-all"
                    placeholder="https://link-gambar-qris.com/qris.jpg"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-jet-black-100">Nomor Rekening / No. HP</label>
                  <input
                    type="text"
                    required
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 focus:border-alice-blue-500 focus:ring-1 focus:ring-alice-blue-500 text-jet-black-50 placeholder-jet-black-500 text-xs outline-none transition-all"
                    placeholder={BANK_TEMPLATES.find((t) => t.name === selectedTemplate)?.placeholder}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-jet-black-100">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  required
                  value={bankOwner}
                  onChange={(e) => setBankOwner(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 focus:border-alice-blue-500 focus:ring-1 focus:ring-alice-blue-500 text-jet-black-50 placeholder-jet-black-500 text-xs outline-none transition-all"
                  placeholder="Contoh: Muhammad Ucup"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col bg-lilac-ash-950 relative pb-32">
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 bg-lilac-ash-950/90 backdrop-blur-md border-b border-lilac-ash-800 px-4 py-4 flex items-center gap-3">
        <Button
          onPress={() => {
            if (inputMode === "scan" && scanResult) { setScanResult(null); }
            else { setInputMode(null); }
          }}
          color="primary"
          size="sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-base font-semibold text-jet-black-50">
            {inputMode === "scan" ? "Scan Struk" : "Input Manual"}
          </h1>
          <p className="text-[10px] text-jet-black-300">
            {inputMode === "scan"
              ? (scanResult ? "Langkah 2: Detail Sesi" : "Langkah 1: Upload Foto")
              : "Masukkan item & detail sesi"}
          </p>
        </div>
      </header>

      {/* Form Body Scrollable */}
      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        {error && (
          <div className="p-3.5 rounded-xl border border-lilac-ash-700 bg-lilac-ash-950 text-lilac-ash-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        {/* ============================ SCAN MODE ============================ */}
        {inputMode === "scan" && (
          <>
            {scanResult?.isMock && (
              <div className="p-3.5 bg-alice-blue-950 border border-[#0f3557] rounded-xl text-xs text-jet-black-300">
                Mode Demo — set GEMINI_API_KEY di <code className="text-jet-black-50">.env</code> buat OCR beneran.
              </div>
            )}

            {/* Step 1: Upload File */}
            {!scanResult && (
              <div className="bg-jet-black-900 border border-lilac-ash-800 rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-semibold text-jet-black-100 uppercase tracking-wider">1. Pilih Foto Struk</h2>
                  {file && (
                    <Button onPress={() => { setFile(null); setFilePreview(null); }} color="link-gray" className="text-[10px] font-semibold text-lilac-ash-200">
                      Hapus Foto
                    </Button>
                  )}
                </div>

                {!filePreview ? (
                  <div
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input")?.click()}
                    className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.98] ${isDragOver ? "border-alice-blue-500 bg-alice-blue-950" : "border-jet-black-700 bg-jet-black-950 hover:border-jet-black-500"}`}
                  >
                    <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <div className="p-2.5 bg-lilac-ash-800 rounded-lg border border-jet-black-700 mb-3">
                      <UploadCloud01 className="w-5 h-5 text-jet-black-300" />
                    </div>
                    <p className="text-xs font-semibold text-jet-black-50 mb-0.5">Upload foto struk lo</p>
                    <p className="text-[10px] text-jet-black-300">Foto atau pilih dari galeri</p>
                  </div>
                ) : (
                  <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden bg-jet-black-950 border border-lilac-ash-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={filePreview} alt="Struk" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Scan Result Preview */}
            {scanResult && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-semibold text-jet-black-100 uppercase tracking-wider">Menu yang ketauan</h2>
                  <span className="text-[10px] font-medium bg-lilac-ash-800 text-jet-black-100 px-2 py-0.5 rounded-full border border-jet-black-700">
                    {scanResult.items.length} Menu
                  </span>
                </div>

                <div className="space-y-2">
                  {scanResult.items.map((item, idx) => (
                    <div key={idx} className="bg-jet-black-900 border border-lilac-ash-800 rounded-xl p-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-jet-black-50 block">{item.name}</span>
                        <span className="text-[10px] text-jet-black-300">{item.quantity}x • Rp {Number(item.unitPrice).toLocaleString("id-ID")}</span>
                      </div>
                      <span className="text-xs font-bold text-jet-black-50">Rp {Number(item.totalPrice).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-jet-black-900 border border-lilac-ash-800 rounded-xl p-3.5 space-y-2 text-xs text-jet-black-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-jet-black-50 font-medium">
                      Rp {scanResult.items.reduce((acc, i) => acc + i.totalPrice, 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                  {scanResult.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Pajak (PPN)</span>
                      <span className="text-jet-black-50">Rp {Number(scanResult.taxAmount).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  {scanResult.tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Service Charge / Tip</span>
                      <span className="text-jet-black-50">Rp {Number(scanResult.tipAmount).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-jet-black-50 pt-2.5 border-t border-lilac-ash-800">
                    <span>Total Tagihan</span>
                    <span className="text-alice-blue-400">Rp {Number(scanResult.totalAmount).toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {detailsForm}
              </div>
            )}
          </>
        )}

        {/* ============================ MANUAL MODE ============================ */}
        {inputMode === "manual" && (
          <div className="space-y-4">
            {/* Step 1: Tambah temen */}
            <div className="bg-jet-black-900 border border-lilac-ash-800 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-jet-black-100 uppercase tracking-wider">1. Siapa aja yang ikut?</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemberInput}
                  onChange={(e) => setNewMemberInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddMember(); } }}
                  className="flex-1 px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 text-xs text-jet-black-50 placeholder-jet-black-500 outline-none focus:border-alice-blue-500 transition-all"
                  placeholder="Nama temen lo..."
                />
                <Button type="button" onPress={handleAddMember} size="sm" iconLeading={<Plus />}>Tambah</Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-alice-blue-900 border border-alice-blue-700 text-alice-blue-300 text-[10px] font-semibold">
                  {currentUserName} <span className="text-[9px] opacity-60">(lo)</span>
                </div>
                {manualMembers.map((m) => (
                  <div key={m} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-jet-black-800 border border-jet-black-700 text-jet-black-100 text-[10px] font-semibold">
                    {m}
                    <button
                      type="button"
                      onClick={() => setManualMembers((prev) => prev.filter((x) => x !== m))}
                      className="ml-0.5 text-rose-400 hover:text-rose-300 text-[10px] leading-none"
                    >&times;</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Form tambah item satu-satu */}
            <div className="bg-jet-black-900 border border-lilac-ash-800 rounded-xl p-4 space-y-4">
              <h2 className="text-xs font-semibold text-jet-black-100 uppercase tracking-wider">2. Tambah Item</h2>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-jet-black-400 uppercase">Nama Item</label>
                  <input
                    type="text"
                    value={draftItemName}
                    onChange={(e) => setDraftItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 text-xs text-jet-black-50 placeholder-jet-black-500 outline-none focus:border-alice-blue-500 transition-all"
                    placeholder="Makan malam, Tiket..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-jet-black-400 uppercase">Jumlah (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={draftItemAmount}
                    onChange={(e) => setDraftItemAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-jet-black-950 border border-jet-black-700 text-xs text-jet-black-50 placeholder-jet-black-500 outline-none focus:border-alice-blue-500 transition-all"
                    placeholder="Contoh: 50.000"
                  />
                </div>
              </div>

              {/* Split dengan Siapa */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-bold text-jet-black-400 uppercase">Split dengan Siapa</label>
                  <button
                    type="button"
                    onClick={() => setDraftItemSplitWith(allPeople)}
                    className="text-[9px] font-semibold text-alice-blue-400 hover:text-alice-blue-300"
                  >
                    Pilih Semua
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allPeople.map((person) => {
                    const selected = draftItemSplitWith.includes(person);
                    return (
                      <button
                        key={person}
                        type="button"
                        onClick={() => handleToggleSplit(person)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${selected
                            ? "bg-alice-blue-900 text-alice-blue-300 border-alice-blue-700"
                            : "bg-jet-black-950 text-jet-black-400 border-jet-black-700"
                          }`}
                      >
                        {person === currentUserName ? `${person} (gua)` : person}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dibayar oleh */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-jet-black-400 uppercase">Dibayar oleh</label>
                <div className="flex flex-wrap gap-2">
                  {allPeople.map((person) => (
                    <button
                      key={person}
                      type="button"
                      onClick={() => setDraftItemPaidBy(person)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${draftItemPaidBy === person
                          ? "bg-emerald-900 text-emerald-300 border-emerald-700"
                          : "bg-jet-black-950 text-jet-black-400 border-jet-black-700"
                        }`}
                    >
                      {person === currentUserName ? `${person} (gua)` : person}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                onPress={handleAddDraftItem}
                iconLeading={<Plus />}
                className="w-full py-2.5"
              >
                Tambah Item ke Daftar
              </Button>
            </div>

            {/* Daftar Item yang sudah ditambah */}
            {manualItems.length > 0 && (
              <div className="bg-jet-black-900 border border-lilac-ash-800 rounded-xl p-4 space-y-2">
                <h2 className="text-xs font-semibold text-jet-black-100 uppercase tracking-wider">Item yang udah masuk</h2>
                {manualItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-jet-black-950 border border-jet-black-700">
                    <div>
                      <p className="text-xs font-semibold text-jet-black-50">{item.name}</p>
                      <p className="text-[10px] text-jet-black-400">Rp {item.totalPrice.toLocaleString("id-ID")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveManualItem(idx)}
                      className="text-rose-400 hover:text-rose-300 text-xs font-semibold"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-jet-black-700 text-xs font-bold text-jet-black-50">
                  <span>Total</span>
                  <span className="text-alice-blue-400">Rp {manualSubtotal.toLocaleString("id-ID")}</span>
                </div>
              </div>
            )}

            {manualItems.length > 0 && detailsForm}
          </div>
        )}
      </div>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-lilac-ash-800 bg-lilac-ash-950/95 backdrop-blur-md z-20">
        {inputMode === "scan" && !scanResult ? (
          file && (
            <Button
              type="button"
              onPress={handleScanReceipt}
              isDisabled={loading}
              isLoading={loading}
              className="w-full py-3 px-4 rounded-xl bg-alice-blue-600 hover:bg-alice-blue-700 text-jet-black-50 text-xs font-semibold"
            >
              Mulai Scan Struk
            </Button>
          )
        ) : isReadyForDetails ? (
          <Button
            onPress={() => handleCreate()}
            isDisabled={loading}
            isLoading={loading}
            className="w-full py-3 px-4 rounded-xl bg-alice-blue-600 hover:bg-alice-blue-700 text-jet-black-50 text-xs font-semibold"
          >
            Buat Sesi &amp; Mulai Pembagian
          </Button>
        ) : null}
      </div>
    </main>
  );
}
