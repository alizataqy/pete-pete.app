"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBillSession, createManualBillSession } from "@/app/actions/session";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Edit02, Camera01, Plus, ArrowLeft, UploadCloud01, CreditCard01, Zap, ChevronRight, CheckCircle, Trash01, XClose, Users01 } from "@untitledui/icons";
import { getUserBanks, UserBankData } from "@/app/actions/profile";
import { Avatar } from "@/components/base/avatar/avatar";
import { toast } from "sonner";
import { useSessionStorageState } from "@/hooks/useSessionStorageState";
import LoadingScreen from "@/components/application/LoadingScreen";

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
];

const formatRupiah = (value: number | string): string => {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value);
  const isNegative = str.startsWith("-") || (typeof value === "number" && value < 0);
  const cleaned = str.replace(/[^0-9]/g, "");
  if (!cleaned) {
    if (str === "0") return "Rp 0";
    return isNegative ? "Rp -" : "";
  }
  const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${isNegative ? "-" : ""}${formatted}`;
};

const parseRupiah = (formatted: string): string => {
  if (!formatted) return "";
  const isNegative = formatted.includes("-");
  const cleaned = formatted.replace(/[^0-9]/g, "");
  return isNegative ? `-${cleaned}` : cleaned;
};

export default function NewSessionPage() {
  const router = useRouter();
  const { data: authSession, isPending } = useSession();

  // Mode selection
  const [inputMode, setInputMode] = useSessionStorageState<InputMode | null>("pete-pete-new-input-mode", null);

  // Shared state
  const [title, setTitle] = useSessionStorageState("pete-pete-new-title", "");
  const [description, setDescription] = useSessionStorageState("pete-pete-new-description", "");
  const [merchantName, setMerchantName] = useSessionStorageState("pete-pete-new-merchant-name", "");
  const [loading, setLoading] = useState(false);

  // Bank details selection & inputs
  const [profileBanks, setProfileBanks] = useState<UserBankData[]>([]);
  const [selectedBankId, setSelectedBankId] = useSessionStorageState<string>("pete-pete-new-selected-bank-id", "custom");
  const [useProfileBank, setUseProfileBank] = useSessionStorageState("pete-pete-new-use-profile-bank", false);
  const [selectedTemplate, setSelectedTemplate] = useSessionStorageState("pete-pete-new-selected-template", "BCA");
  const [bankName, setBankName] = useSessionStorageState("pete-pete-new-bank-name", "");
  const [bankAccount, setBankAccount] = useSessionStorageState("pete-pete-new-bank-account", "");
  const [bankOwner, setBankOwner] = useSessionStorageState("pete-pete-new-bank-owner", "");
  const [qrisUrl, setQrisUrl] = useSessionStorageState("pete-pete-new-qris-url", "");

  // Fetch profile bank details
  useEffect(() => {
    if (authSession?.user?.id) {
      getUserBanks(authSession.user.id).then((res) => {
        if (res.success && res.banks && res.banks.length > 0) {
          setProfileBanks(res.banks);
          if (!sessionStorage.getItem("pete-pete-new-selected-bank-id")) {
            setSelectedBankId(res.banks[0].id || "custom");
          }
          if (!sessionStorage.getItem("pete-pete-new-use-profile-bank")) {
            setUseProfileBank(true);
          }
        } else {
          if (!sessionStorage.getItem("pete-pete-new-use-profile-bank")) {
            setUseProfileBank(false);
          }
          if (!sessionStorage.getItem("pete-pete-new-selected-bank-id")) {
            setSelectedBankId("custom");
          }
        }
      });
    }
  }, [authSession, setSelectedBankId, setUseProfileBank]);

  const [draftPriceMode, setDraftPriceMode] = useState<"unit" | "total">("unit");

  // Scan mode state  
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useSessionStorageState<ScanResult | null>("pete-pete-new-scan-result", null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Manual mode state — new item form
  const [manualMembers, setManualMembers] = useSessionStorageState<string[]>("pete-pete-new-manual-members", ["Sohib 1"]);
  const [newMemberInput, setNewMemberInput] = useState("");
  const [draftItemName, setDraftItemName] = useState("");
  const [draftItemAmount, setDraftItemAmount] = useState("");
  const [draftItemQty, setDraftItemQty] = useState("1");
  const [draftItemPrice, setDraftItemPrice] = useState("");
  const [addPriceMode, setAddPriceMode] = useState<"unit" | "total">("total");

  const handleDraftItemQtyChange = (qty: string) => {
    setDraftItemQty(qty);
    const q = parseFloat(qty) || 0;
    if (addPriceMode === "unit" && draftItemPrice) {
      setDraftItemAmount(String(q * Number(draftItemPrice)));
    } else if (addPriceMode === "total" && draftItemAmount && q > 0) {
      setDraftItemPrice(String(Math.round(Number(draftItemAmount) / q)));
    }
  };

  const handleDraftItemPriceChange = (price: string) => {
    setDraftItemPrice(price);
    const q = parseFloat(draftItemQty) || 1;
    if (price) {
      setDraftItemAmount(String(q * Number(price)));
    } else {
      setDraftItemAmount("");
    }
  };

  const handleDraftItemAmountChange = (amount: string) => {
    setDraftItemAmount(amount);
    const q = parseFloat(draftItemQty) || 1;
    if (amount && q > 0) {
      setDraftItemPrice(String(Math.round(Number(amount) / q)));
    } else {
      setDraftItemPrice("");
    }
  };

  const [manualItems, setManualItems] = useSessionStorageState<ScanItem[]>("pete-pete-new-manual-items", []);
  const [manualTax, setManualTax] = useSessionStorageState<number>("pete-pete-new-manual-tax", 0);
  const [manualTip, setManualTip] = useSessionStorageState<number>("pete-pete-new-manual-tip", 0);
  const [showScanItemForm, setShowScanItemForm] = useState(false);

  const handleAddScanDraftItem = () => {
    const name = draftItemName.trim();
    const total = parseFloat(draftItemAmount);
    const qty = parseInt(draftItemQty) || 1;
    if (!name || isNaN(total) || total <= 0 || qty <= 0 || !scanResult) {
      toast.error("Isi nama dan harga menu dengan bener dulu ya, Bos!");
      return;
    }

    const newItem: ScanItem = {
      name,
      quantity: qty,
      unitPrice: total / qty,
      totalPrice: total,
    };

    const updatedItems = [...scanResult.items, newItem];
    const itemsSubtotal = updatedItems.reduce((acc, i) => acc + i.totalPrice, 0);

    setScanResult({
      ...scanResult,
      items: updatedItems,
      totalAmount: itemsSubtotal + Number(scanResult.taxAmount || 0) + Number(scanResult.tipAmount || 0),
    });

    setDraftItemName("");
    setDraftItemAmount("");
    setDraftItemPrice("");
    setDraftItemQty("1");
    setShowScanItemForm(false);
    toast.success("Menu tambahan berhasil ditambahin!");
  };

  const handleRemoveScanItem = (idx: number) => {
    if (!scanResult) return;
    const updatedItems = scanResult.items.filter((_, i) => i !== idx);
    const itemsSubtotal = updatedItems.reduce((acc, i) => acc + i.totalPrice, 0);

    setScanResult({
      ...scanResult,
      items: updatedItems,
      totalAmount: itemsSubtotal + Number(scanResult.taxAmount || 0) + Number(scanResult.tipAmount || 0),
    });
    toast.success("Menu berhasil dihapus!");
  };

  const [editingManualIndex, setEditingManualIndex] = useState<number | null>(null);
  const [editingManualName, setEditingManualName] = useState("");

  const [wizardStep, setWizardStep] = useSessionStorageState<number>("pete-pete-new-wizard-step", 1);
  const [manualItemAllocations, setManualItemAllocations] = useSessionStorageState<Record<number, Record<string, number>>>("pete-pete-new-manual-item-allocations", {});

  const clearSessionStorage = () => {
    const keys = [
      "pete-pete-new-input-mode",
      "pete-pete-new-title",
      "pete-pete-new-description",
      "pete-pete-new-merchant-name",
      "pete-pete-new-scan-result",
      "pete-pete-new-bank-name",
      "pete-pete-new-bank-account",
      "pete-pete-new-bank-owner",
      "pete-pete-new-qris-url",
      "pete-pete-new-selected-template",
      "pete-pete-new-selected-bank-id",
      "pete-pete-new-use-profile-bank",
      "pete-pete-new-manual-members",
      "pete-pete-new-manual-items",
      "pete-pete-new-manual-tax",
      "pete-pete-new-manual-tip",
      "pete-pete-new-wizard-step",
      "pete-pete-new-manual-item-allocations",
    ];
    keys.forEach((key) => sessionStorage.removeItem(key));
  };

  const handleSaveManualRename = (index: number) => {
    if (!editingManualName.trim()) {
      setEditingManualIndex(null);
      return;
    }
    const newName = editingManualName.trim();
    const oldName = manualMembers[index];
    setManualMembers((prev) => {
      const copy = [...prev];
      copy[index] = newName;
      return copy;
    });

    // Update allocations map
    setManualItemAllocations((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((itemIdx) => {
        const itemAlloc = { ...copy[Number(itemIdx)] };
        if (oldName in itemAlloc) {
          itemAlloc[newName] = itemAlloc[oldName];
          delete itemAlloc[oldName];
          copy[Number(itemIdx)] = itemAlloc;
        }
      });
      return copy;
    });
    setEditingManualIndex(null);
  };

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
    } else {
      toast.error("Pilih file foto struk lo dulu ya (format JPG, PNG, atau WEBP)!");
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
    if (!file) {
      toast.error("Pilih file foto struk lo dulu baru pencet scan ya, Bos!");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ocr/scan", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Gagal baca gambar struk nih, coba pastiin fotonya jelas ya!");
        return;
      }
      setScanResult(result);
      if (result.merchantName) setMerchantName(result.merchantName);
      if (result.merchantName && !title) setTitle(result.merchantName);
      toast.success("Struk berhasil dibaca!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal scan struk nih, coba foto yang lebih terang atau input manual ya!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Manual Mode Handlers ---
  const handleAddMember = () => {
    let name = newMemberInput.trim();
    if (!name) {
      let nextNum = 1;
      while (true) {
        const potentialName = `Sohib ${nextNum}`;
        if (!manualMembers.includes(potentialName) && potentialName !== currentUserName) {
          name = potentialName;
          break;
        }
        nextNum++;
      }
    }
    if (manualMembers.includes(name) || name === currentUserName) return;
    setManualMembers((prev) => [...prev, name]);
    setNewMemberInput("");
  };

  const handleAddDraftItem = () => {
    const name = draftItemName.trim();
    const total = parseFloat(draftItemAmount);
    const qty = parseInt(draftItemQty) || 1;
    if (!name || isNaN(total) || total <= 0 || qty <= 0) return;
    setManualItems((prev) => [
      ...prev,
      { name, quantity: qty, unitPrice: total / qty, totalPrice: total },
    ]);
    setDraftItemName("");
    setDraftItemAmount("");
    setDraftItemPrice("");
    setDraftItemQty("1");
  };

  const handleRemoveManualItem = (idx: number) => {
    setManualItems((prev) => prev.filter((_, i) => i !== idx));
    setManualItemAllocations((prev) => {
      const copy = { ...prev };
      delete copy[idx];
      return copy;
    });
  };

  const manualSubtotal = manualItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const manualTotal = manualSubtotal + Number(manualTax) + Number(manualTip);

  // --- Create Session ---
  const handleCreate = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();

    const isManual = inputMode === "manual";
    const isScan = inputMode === "scan";

    if (isScan && !scanResult) {
      toast.error("Scan dulu foto struk lo biar bisa bagi tagihan, Bos!");
      return;
    }
    if (isManual && manualItems.some(i => !i.name.trim())) {
      toast.error("Ada nama menu yang masih kosong nih, lengkapi dulu ya!");
      return;
    }
    if (isManual && manualItems.length === 0) {
      toast.error("Masukin minimal satu menu makanan atau minuman dulu ya, Bos!");
      return;
    }
    if (isManual && manualItems.some(i => i.totalPrice <= 0)) {
      toast.error("Harga menu harus lebih dari Rp 0 ya, Bos!");
      return;
    }

    setLoading(true);
    try {
      const taxAmount = isScan ? scanResult!.taxAmount : Number(manualTax);
      const tipAmount = isScan ? scanResult!.tipAmount : Number(manualTip);

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

      if (isManual) {
        // Construct items payload with custom allocations
        const itemsPayload = manualItems.map((item, idx) => {
          const allocationsMap = manualItemAllocations[idx] || {};
          const allocationsList = Object.entries(allocationsMap)
            .filter(([_, qty]) => qty > 0)
            .map(([memberName, qty]) => ({ memberName, quantity: qty }));

          return {
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            allocations: allocationsList,
          };
        });

        const res = await createManualBillSession({
          title: title || merchantName || "Bill Patungan",
          description,
          merchantName,
          totalAmount: manualTotal,
          taxAmount,
          tipAmount,
          userId: authSession?.user?.id,
          members: allPeople,
          items: itemsPayload,
          bankName: finalBankName,
          bankAccount: finalBankAccount,
          bankOwner: finalBankOwner,
        });

        if (!res.success) {
          toast.error(res.error || "Gagal nyimpen sesi manual nih, coba periksa data menu lo ya!");
        } else {
          clearSessionStorage();
          router.push(`/pete-pete/${res.session?.id}/split`);
        }
      } else {
        // Scan mode uses standard createBillSession
        const items = scanResult!.items;
        const totalAmount = scanResult!.totalAmount;

        const res = await createBillSession({
          title: title || merchantName || scanResult!.merchantName || "Bill Patungan",
          description,
          merchantName: merchantName || scanResult!.merchantName,
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
          toast.error(res.error || "Gagal nyimpen sesi patungan nih, coba beberapa saat lagi ya!");
        } else {
          clearSessionStorage();
          router.push(`/pete-pete/${res.session?.id}/split`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kendala saat nyimpen sesi patungan nih, coba lagi ya!");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <LoadingScreen title="Sabar ya, ngab!" description="Lagi memproses data lu" />
    );
  }

  // --- Step 0: Choose Mode ---
  if (!inputMode) {
    return (
      <main className="flex-1 flex flex-col bg-background text-text h-full min-h-0 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center gap-3">
          <Button
            href={authSession ? "/tongkrongan" : "/"}
            color="primary"
            size="sm"
            aria-label="Kembali"
            className="min-w-11 min-h-11 p-2 rounded-lg flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-extrabold text-text-50">Bikin Bill PETE-PETE</h1>
            <p className="text-2xs text-text-300">Pilih cara input menu patungan</p>
          </div>
        </header>

        {/* Body Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Welcome / Intro Hero */}
          <div className="space-y-1.5 pt-1">
            <h2 className="text-base sm:text-lg font-extrabold text-text-50 [text-wrap:balance]">
              Mau input menu gimana nih?
            </h2>
            <p className="text-xs text-text-300 leading-relaxed [text-wrap:pretty]">
              Pilih cara paling praktis buat kamu &amp; geng. Pake foto struk jauh lebih cepet dan anti ribet!
            </p>
          </div>

          {/* Action Cards */}
          {/* Action Cards */}
          <div className="space-y-3">
            {/* Scan Mode Card (Recommended) */}
            <button
              type="button"
              onClick={() => setInputMode("scan")}
              className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-primary-500/40 bg-gradient-to-br from-primary-950/40 via-secondary-950/60 to-secondary-950/30 hover:border-primary-500/80 hover:bg-secondary-950/80 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] transition-all shadow-xs group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-primary-500/20 border border-primary-500/35 text-primary-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-primary-500/30 transition-all shadow-xs mt-0.5">
                    <Camera01 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-text-50 group-hover:text-primary-300 transition-colors">
                        Scan Foto Struk
                      </h3>
                      <Badge color="brand" size="sm" type="pill-color" className="font-extrabold text-3xs px-2 py-0.5 shadow-xs">
                        Rekomendasi
                      </Badge>
                    </div>
                    <p className="text-xs text-text-300 mt-1 leading-relaxed [text-wrap:pretty]">
                      Foto struk kasir lo, AI otomatis deteksi nama menu, porsi, harga, pajak &amp; diskon dalam hitungan detik.
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center shrink-0 group-hover:bg-primary-500/25 group-hover:translate-x-0.5 transition-all mt-1">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Manual Mode Card (Alternative) */}
            <button
              type="button"
              onClick={() => setInputMode("manual")}
              className="w-full text-left p-4 sm:p-5 rounded-2xl border border-secondary-800 bg-secondary-950/40 hover:border-secondary-700 hover:bg-secondary-950/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] transition-all shadow-xs group cursor-pointer relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-secondary-900 border border-secondary-700/80 text-secondary-300 flex items-center justify-center group-hover:scale-105 group-hover:bg-secondary-800 transition-all shadow-xs mt-0.5">
                    <Edit02 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-text-50 group-hover:text-primary-300 transition-colors">
                        Input Menu Manual
                      </h3>
                      <Badge color="gray" size="sm" type="pill-color" className="font-semibold text-3xs px-2 py-0.5">
                        Alternatif
                      </Badge>
                    </div>
                    <p className="text-xs text-text-300 mt-1 leading-relaxed [text-wrap:pretty]">
                      Gak ada struk fisik? Masukin nama makanan, jumlah porsi, dan harga sendiri secara bebas sesuai pesanan.
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-secondary-900 border border-secondary-800 text-text-400 flex items-center justify-center shrink-0 group-hover:text-primary-400 group-hover:border-secondary-700 group-hover:translate-x-0.5 transition-all mt-1">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>

          {/* Quick Perks / Trust Highlights */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-secondary-800/80 bg-secondary-950/30 backdrop-blur-xs space-y-2.5 mt-auto shadow-xs">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary-400" />
              <p className="text-2xs font-extrabold uppercase tracking-wider text-text-400">
                Kenapa Enak Pake Ceban Pertama?
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-text-300">
                <CheckCircle className="w-4 h-4 text-primary-400 shrink-0" />
                <span>Pajak &amp; diskon struk dihitung adil proporsional</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-300">
                <CheckCircle className="w-4 h-4 text-primary-400 shrink-0" />
                <span>Bisa dibagi rata atau spesifik per porsi sohib</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-300">
                <CheckCircle className="w-4 h-4 text-primary-400 shrink-0" />
                <span>Link bon publik langsung kirim via WhatsApp tanpa login</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- Shared Details Form (shown after both modes have items ready) ---
  const isReadyForDetails = (inputMode === "scan" && scanResult) || inputMode === "manual";

  // Helper: shared details form
  const detailsForm = (
    <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-primary-500/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">2</span>
          Detail Bill &amp; Info Transfer
        </h2>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-100">Judul Bill</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
            placeholder="Misal: Makan Siang Bersama"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-100">Nama Toko / Merchant</label>
          <input
            type="text"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
            placeholder="Misal: Restoran Selera"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-100">Catatan (Opsional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
            placeholder="Keterangan tambahan..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1.5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-100">Pajak / Tax (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formatRupiah(inputMode === "scan" ? (scanResult?.taxAmount ?? 0) : manualTax)}
              onChange={(e) => {
                const val = Number(parseRupiah(e.target.value)) || 0;
                if (inputMode === "scan" && scanResult) {
                  const subtotal = scanResult.items.reduce((acc, i) => acc + i.totalPrice, 0);
                  setScanResult({
                    ...scanResult,
                    taxAmount: val,
                    totalAmount: subtotal + val + Number(scanResult.tipAmount || 0),
                  });
                } else {
                  setManualTax(val);
                }
              }}
              className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
              placeholder="Contoh: Rp 10.000"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-100">Servis / Tip (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formatRupiah(inputMode === "scan" ? (scanResult?.tipAmount ?? 0) : manualTip)}
              onChange={(e) => {
                const val = Number(parseRupiah(e.target.value)) || 0;
                if (inputMode === "scan" && scanResult) {
                  const subtotal = scanResult.items.reduce((acc, i) => acc + i.totalPrice, 0);
                  setScanResult({
                    ...scanResult,
                    tipAmount: val,
                    totalAmount: subtotal + Number(scanResult.taxAmount || 0) + val,
                  });
                } else {
                  setManualTip(val);
                }
              }}
              className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
              placeholder="Contoh: Rp 5.000"
            />
          </div>
        </div>

        <div className="border-t border-secondary-800 pt-3 space-y-3">
          <h3 className="text-xs font-bold text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard01 className="w-4 h-4" />
            <span>Rekening Transfer Bill Ini</span>
          </h3>

          {profileBanks.length > 0 ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-text-100 cursor-pointer">
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
                  className="rounded bg-secondary-950/80 border-secondary-700 text-primary-500 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                />
                Pilih dari Rekening Profil Tersimpan
              </label>

              {useProfileBank ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    {profileBanks.map((b) => (
                      <label
                        key={b.id}
                        className={`p-3 rounded-xl border text-xs text-text-300 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${selectedBankId === b.id
                          ? "bg-primary-950/40 border-primary-500 text-text-100 ring-2 ring-primary-500/20"
                          : "bg-secondary-900/40 border-secondary-800 hover:border-secondary-700"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="profileBankSelect"
                            checked={selectedBankId === b.id}
                            onChange={() => b.id && setSelectedBankId(b.id)}
                            className="bg-secondary-950/80 border-secondary-700 text-primary-500 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <p className="font-bold text-text-50">{b.bankName}</p>
                            <p className="text-xs text-text-300 mt-0.5">
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
            <p className="text-xs text-warning-400">
              * Belum ada rekening di profil. Langsung input baru aja di bawah ini:
            </p>
          )}

          {(!useProfileBank || selectedBankId === "custom") && (
            <div className="space-y-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-100">Pilih Tipe Bank / E-Wallet</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {BANK_TEMPLATES.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSelectedTemplate(t.name)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${selectedTemplate === t.name
                        ? "bg-primary-950/60 border-primary-500 text-primary-300 ring-2 ring-primary-500/30"
                        : "bg-secondary-900/40 border-secondary-800 hover:border-secondary-700 text-text-300"
                        }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.logo} alt={t.name} className="w-6 h-6 object-contain" />
                      <span className="text-2xs font-bold wrap-break-word text-center">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedTemplate === "QRIS" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-100">URL Gambar QRIS</label>
                  <input
                    type="text"
                    required
                    value={qrisUrl}
                    onChange={(e) => setQrisUrl(e.target.value)}
                    className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
                    placeholder="https://link-gambar-qris.com/qris.jpg"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-100">Nomor Rekening / No. HP</label>
                  <input
                    type="text"
                    required
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
                    placeholder={BANK_TEMPLATES.find((t) => t.name === selectedTemplate)?.placeholder}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-100">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  required
                  value={bankOwner}
                  onChange={(e) => setBankOwner(e.target.value)}
                  className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-text-50 placeholder-text-500 text-xs sm:text-sm outline-none transition-all"
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
    <main className="flex-1 flex flex-col bg-background text-text h-full min-h-0 overflow-hidden">
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center gap-3">
        <Button
          onPress={() => {
            if (inputMode === "scan" && scanResult) { setScanResult(null); }
            else { setInputMode(null); }
          }}
          color="primary"
          size="sm"
          aria-label="Kembali"
          className="min-w-11 min-h-11 p-2 rounded-lg active:scale-95 transition-all flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-base font-semibold text-text-50">
            {inputMode === "scan" ? "Scan Struk" : "Input Manual"}
          </h1>
          <p className="text-2xs text-text-300">
            {inputMode === "scan"
              ? (scanResult ? "Langkah 2: Detail Bill" : "Langkah 1: Upload Foto")
              : "Masukkan item & detail Bill"}
          </p>
        </div>
      </header>

      {/* Form Body Scrollable */}
      <div className="flex-1 min-h-0 p-4 space-y-5 overflow-y-auto">
        {/* ============================ SCAN MODE ============================ */}
        {inputMode === "scan" && (
          <>
            {scanResult?.isMock && (
              <div className="p-3.5 bg-primary-950 border border-secondary-800 rounded-xl text-xs text-text-300">
                Mode Demo — set GEMINI_API_KEY di <code className="text-text-50">.env</code> buat OCR beneran.
              </div>
            )}

            {/* Step 1: Upload File */}
            {!scanResult && (
              <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-primary-500/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">1</span>
                    Pilih Foto Struk
                  </h2>
                  {file && (
                    <Button onPress={() => { setFile(null); setFilePreview(null); }} color="link-gray" className="text-xs font-semibold text-secondary-200">
                      Hapus Foto
                    </Button>
                  )}
                </div>

                {!filePreview ? (
                  <div
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input")?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.99] group ${isDragOver ? "border-primary-500 bg-primary-950/40" : "border-secondary-700/80 bg-secondary-900/30 hover:border-primary-500/60 hover:bg-secondary-900/60"}`}
                  >
                    <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <div className="w-14 h-14 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-primary-500/20 transition-all shadow-xs">
                      <UploadCloud01 className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-text-50 mb-1">Upload foto struk lo</p>
                    <p className="text-xs text-text-300">Sentuh untuk buka kamera / galeri</p>
                    <span className="text-2xs text-text-400 mt-2 bg-secondary-900/80 border border-secondary-800 px-2.5 py-1 rounded-full">
                      Format: JPG, PNG, WebP (maks. 10MB)
                    </span>
                  </div>
                ) : (
                  <div className="relative aspect-3/2 w-full rounded-2xl overflow-hidden bg-secondary-950/60 border border-secondary-800 p-2 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={filePreview} alt="Struk" className="w-full h-full object-contain rounded-xl" />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Scan Result Preview */}
            {scanResult && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider">Menu yang ketauan</h2>
                    <p className="text-2xs text-text-400">Ada struk kedua atau menu kurang? Tambahin langsung di bawah ya!</p>
                  </div>
                  <Badge color="gray" size="sm" type="pill-color" className="inline-flex font-semibold">
                    {scanResult.items.length} Menu
                  </Badge>
                </div>

                <div className="space-y-2">
                  {scanResult.items.map((item, idx) => (
                    <div key={idx} className="bg-secondary-900/40 border border-secondary-800/80 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-bold text-text-50 block wrap-break-word">{item.name}</span>
                        <span className="text-xs text-text-300">{item.quantity}x &bull; Rp {Number(item.unitPrice).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs sm:text-sm font-extrabold text-text-50">Rp {Number(item.totalPrice).toLocaleString("id-ID")}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveScanItem(idx)}
                          className="p-1.5 rounded-lg text-text-400 hover:text-red-400 hover:bg-secondary-800/60 active:scale-95 transition-all cursor-pointer"
                          aria-label={`Hapus ${item.name}`}
                        >
                          <Trash01 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tambah Menu Manual / Struk Kedua */}
                {!showScanItemForm ? (
                  <Button
                    type="button"
                    onPress={() => setShowScanItemForm(true)}
                    iconLeading={<Plus className="w-4 h-4" />}
                    color="secondary"
                    className="w-full min-h-11 py-2.5 rounded-xl border border-dashed border-secondary-700 hover:border-primary-500/60 text-xs font-bold transition-all text-text-200"
                  >
                    Tambah Menu Manual / Dari Struk Kedua
                  </Button>
                ) : (
                  <div className="p-4 sm:p-5 rounded-2xl border border-primary-500/30 bg-primary-950/20 space-y-4 shadow-sm">
                    <h4 className="text-2xs font-bold text-text uppercase tracking-wider">Tambah Menu Tambahan</h4>
                    <div className="space-y-1.5">
                      <label className="text-3xs font-extrabold text-primary-400 uppercase tracking-wider block">Nama Menu</label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Menu (misal: Nasi Goreng)"
                        aria-label="Nama menu tambahan"
                        value={draftItemName}
                        onChange={(e) => setDraftItemName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                      />
                    </div>


                    {/* 3 Kolom Sejajar: JUMLAH (QTY) | TIPE HARGA | HARGA TOTAL / SATUAN */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="space-y-1.5">
                        <label className="text-3xs font-extrabold text-primary-400 uppercase tracking-wider block">
                          JUMLAH (QTY)
                        </label>
                        <input
                          type="number"
                          min={1}
                          inputMode="numeric"
                          value={draftItemQty}
                          onChange={(e) => handleDraftItemQtyChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-3xs font-extrabold text-primary-400 uppercase tracking-wider block">
                          TIPE HARGA
                        </label>
                        <div className="grid grid-cols-2 gap-1 bg-secondary-950/80 p-1 rounded-xl border border-secondary-800/60 h-10 items-center">
                          <Button
                            type="button"
                            color={draftPriceMode === "unit" ? "primary" : "tertiary"}
                            size="sm"
                            onPress={() => setDraftPriceMode("unit")}
                            className="h-full text-2xs font-bold rounded-lg"
                          >
                            Satuan
                          </Button>
                          <Button
                            type="button"
                            color={draftPriceMode === "total" ? "primary" : "tertiary"}
                            size="sm"
                            onPress={() => setDraftPriceMode("total")}
                            className="h-full text-2xs font-bold rounded-lg"
                          >
                            Total
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-3xs text-text-400 uppercase font-bold">
                          {draftPriceMode === "unit" ? "Harga Satuan" : "Harga Total"}
                        </label>
                        {draftPriceMode === "unit" ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatRupiah(draftItemPrice)}
                            onChange={(e) => handleDraftItemPriceChange(parseRupiah(e.target.value))}
                            placeholder="Rp Satuan"
                            className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                          />
                        ) : (
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatRupiah(draftItemAmount)}
                            onChange={(e) => handleDraftItemAmountChange(parseRupiah(e.target.value))}
                            placeholder="Rp Total"
                            className="w-full px-3 py-2 rounded-lg bg-secondary-950/80 border border-secondary-700 text-xs text-text outline-none focus:border-primary-500"
                          />
                        )}
                      </div>
                    </div>

                    {/* Tombol Aksi di Kanan Bawah: Batal & Simpan */}
                    <div className="flex justify-end gap-2.5 pt-2">
                      <Button
                        type="button"
                        onPress={() => {
                          setDraftItemName("");
                          setDraftItemAmount("");
                          setDraftItemPrice("");
                          setDraftItemQty("1");
                          setShowScanItemForm(false);
                        }}
                        color="secondary"
                        size="sm"
                      >
                        Batal
                      </Button>
                      <Button
                        type="button"
                        onPress={handleAddScanDraftItem}
                        color="primary"
                        size="sm"
                        className="text-sm"
                      >
                        Simpan
                      </Button>
                    </div>
                  </div>
                )}

                <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 space-y-2.5 text-xs text-text-300">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="text-text-50 font-semibold">
                      Rp {scanResult.items.reduce((acc, i) => acc + i.totalPrice, 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                  {scanResult.taxAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Pajak (PPN)</span>
                      <span className="text-text-50 font-semibold">Rp {Number(scanResult.taxAmount).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  {scanResult.tipAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Service Charge / Tip</span>
                      <span className="text-text-50 font-semibold">Rp {Number(scanResult.tipAmount).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm sm:text-base font-extrabold text-text-50 pt-2.5 border-t border-secondary-800">
                    <span>Total Tagihan</span>
                    <span className="text-primary-400">Rp {Number(scanResult.totalAmount).toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {detailsForm}
              </div>
            )}
          </>
        )}

        {/* ============================ MANUAL MODE ============================ */}
        {inputMode === "manual" && (
          <div className="space-y-4 pb-4">
            {/* Step Indicator */}
            <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">
                    {wizardStep}
                  </span>
                  {wizardStep === 1 && "Langkah 1: Input Daftar Menu"}
                  {wizardStep === 2 && "Langkah 2: Tambah Teman Patungan"}
                  {wizardStep === 3 && "Langkah 3: Bagi Porsi & Info Bayar"}
                </span>
                <span className="text-2xs font-bold text-text-400">
                  {wizardStep}/3
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className={`h-1.5 rounded-full transition-all ${wizardStep >= 1 ? "bg-primary-500" : "bg-secondary-800"}`} />
                <div className={`h-1.5 rounded-full transition-all ${wizardStep >= 2 ? "bg-primary-500" : "bg-secondary-800"}`} />
                <div className={`h-1.5 rounded-full transition-all ${wizardStep >= 3 ? "bg-primary-500" : "bg-secondary-800"}`} />
              </div>
            </div>

            {/* WIZARD STEP 1: INPUT ITEMS */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-primary-500/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">1</span>
                      Masukin Semua Menu Dulu
                    </h2>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-100">Nama Menu / Item</label>
                      <input
                        type="text"
                        aria-label="Nama Menu / Item"
                        value={draftItemName}
                        onChange={(e) => setDraftItemName(e.target.value)}
                        className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs sm:text-sm text-text-50 placeholder-text-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        placeholder="Nasi Goreng, Es Teh, Tiket Bioskop..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-100">Porsi / Qty</label>
                        <input
                          type="number"
                          aria-label="Porsi atau Jumlah"
                          min={1}
                          inputMode="numeric"
                          value={draftItemQty}
                          onChange={(e) => handleDraftItemQtyChange(e.target.value)}
                          className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs sm:text-sm text-text-50 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-100">Tipe Harga</label>
                        <div className="grid grid-cols-2 gap-1 bg-secondary-900/80 p-1 rounded-lg border border-secondary-700/80 min-h-11 items-center">
                          <button
                            type="button"
                            onClick={() => setAddPriceMode("unit")}
                            className={`h-full py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${addPriceMode === "unit"
                              ? "bg-primary-500 text-white shadow-xs"
                              : "text-text-400 hover:text-text-200"
                              }`}
                          >
                            Satuan
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddPriceMode("total")}
                            className={`h-full py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${addPriceMode === "total"
                              ? "bg-primary-500 text-white shadow-xs"
                              : "text-text-400 hover:text-text-200"
                              }`}
                          >
                            Total
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-100">
                          {addPriceMode === "unit" ? "Harga Satuan" : "Harga Total"}
                        </label>
                        {addPriceMode === "unit" ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            aria-label="Harga Satuan"
                            value={formatRupiah(draftItemPrice)}
                            onChange={(e) => handleDraftItemPriceChange(parseRupiah(e.target.value))}
                            className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs sm:text-sm text-text-50 placeholder-text-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="Rp Satuan"
                          />
                        ) : (
                          <input
                            type="text"
                            inputMode="numeric"
                            aria-label="Harga Total"
                            value={formatRupiah(draftItemAmount)}
                            onChange={(e) => handleDraftItemAmountChange(parseRupiah(e.target.value))}
                            className="w-full min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs sm:text-sm text-text-50 placeholder-text-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="Rp Total"
                          />
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      onPress={handleAddDraftItem}
                      iconLeading={<Plus className="w-4 h-4" />}
                      className="w-full min-h-11 py-2.5 mt-2 rounded-lg font-bold text-xs active:scale-[0.96] transition-transform"
                      color="primary"
                    >
                      Tambahin Menu ke Daftar
                    </Button>
                  </div>
                </div>

                {/* Daftar Item yang sudah ditambah */}
                {manualItems.length > 0 && (
                  <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider">
                        Menu yang Udah Masuk ({manualItems.length})
                      </h2>
                    </div>
                    <div className="space-y-2">
                      {manualItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-secondary-900/40 border border-secondary-800/80 gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-text-50 wrap-break-word">{item.name}</p>
                            <p className="text-xs text-text-300 mt-0.5">
                              {item.quantity}x &bull; Rp {(item.totalPrice / item.quantity).toLocaleString("id-ID")}/porsi = Rp {item.totalPrice.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveManualItem(idx)}
                            aria-label={`Hapus ${item.name}`}
                            className="min-w-8 min-h-8 flex items-center justify-center rounded-lg text-danger-400 hover:text-danger-300 hover:bg-danger-950/30 transition-all active:scale-90 cursor-pointer"
                            title="Hapus menu"
                          >
                            <Trash01 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-secondary-800 text-xs sm:text-sm font-extrabold text-text-50">
                      <span>Total Sementara</span>
                      <span className="text-primary-400">Rp {manualSubtotal.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WIZARD STEP 2: INPUT MEMBERS */}
            {wizardStep === 2 && (
              <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-primary-500/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">2</span>
                    Siapa Aja yang Ikut PETE-PETE?
                  </h2>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    aria-label="Nama teman baru"
                    value={newMemberInput}
                    onChange={(e) => setNewMemberInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddMember(); } }}
                    className="flex-1 min-h-11 px-3.5 py-2.5 rounded-lg bg-secondary-900/60 border border-secondary-700 text-xs sm:text-sm text-text-50 placeholder-text-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="Nama temen lo (misal: Budi, Sarah)..."
                  />
                  <Button
                    type="button"
                    onPress={handleAddMember}
                    size="sm"
                    color="primary"
                    iconLeading={<Plus className="w-4 h-4" />}
                    className="min-h-11 px-4 rounded-lg font-bold text-xs active:scale-[0.96] transition-transform shrink-0"
                  >
                    Tambahin
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                  {/* User (Owner) */}
                  <div className="flex flex-col items-center gap-1.5 w-16 shrink-0">
                    <div className="relative">
                      <Avatar alt={currentUserName} size="lg" className="shadow-md border border-primary-500 ring-2 ring-primary-500/40" />
                      <span className="absolute -bottom-1 -right-1 bg-primary-500 text-white rounded-full px-1 py-0.2 text-4xs font-extrabold shadow-xs">
                        Gua
                      </span>
                    </div>
                    <p className="text-2xs text-text font-bold wrap-break-word w-full text-center leading-tight">
                      {currentUserName}
                    </p>
                  </div>
                  {/* Added Friends */}
                  {manualMembers.map((m, idx) => (
                    <div key={m} className="flex flex-col items-center gap-1.5 w-16 shrink-0 relative group">
                      {editingManualIndex === idx ? (
                        <div className="flex flex-col items-center gap-1 w-full">
                          <Avatar alt={m} size="lg" className="shadow-md border border-secondary-800" />
                          <input
                            type="text"
                            aria-label="Ubah nama teman"
                            value={editingManualName}
                            onChange={(e) => setEditingManualName(e.target.value)}
                            onBlur={() => handleSaveManualRename(idx)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveManualRename(idx);
                              if (e.key === "Escape") setEditingManualIndex(null);
                            }}
                            autoFocus
                            className="w-full text-xs px-1.5 py-1 rounded bg-secondary-900 border border-primary-500 text-text text-center outline-none"
                          />
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingManualIndex(idx);
                              setEditingManualName(m);
                            }}
                            className="focus:outline-none cursor-pointer group-hover:scale-105 transition-all"
                            title="Klik untuk ubah nama"
                            aria-label={`Ubah nama ${m}`}
                          >
                            <Avatar alt={m} size="lg" className="shadow-md border border-secondary-800" />
                          </button>
                          <p
                            onClick={() => {
                              setEditingManualIndex(idx);
                              setEditingManualName(m);
                            }}
                            className="text-2xs text-text font-semibold wrap-break-word w-full text-center leading-tight cursor-pointer hover:underline"
                            title="Klik untuk ubah nama"
                          >
                            {m}
                          </p>
                          <button
                            type="button"
                            onClick={() => setManualMembers((prev) => prev.filter((x) => x !== m))}
                            className="absolute -top-1 -right-1 bg-danger-600 hover:bg-danger-700 text-white rounded-full size-5 flex items-center justify-center text-2xs font-bold shadow-md cursor-pointer transition-all active:scale-90"
                            title="Hapus"
                            aria-label={`Hapus ${m}`}
                          >
                            <XClose className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WIZARD STEP 3: PORTION ALLOCATION & PAYER */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                {/* Portion Allocations */}
                <div className="bg-secondary-950/60 border border-secondary-800 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-extrabold text-text-100 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-primary-500/20 text-primary-400 flex items-center justify-center text-2xs font-extrabold">3</span>
                      Siapa Pesen Apa Nih?
                    </h2>
                  </div>
                  <div className="space-y-3.5">
                    {manualItems.map((item, idx) => {
                      const itemAlloc = manualItemAllocations[idx] || {};
                      const allocatedCount = Object.values(itemAlloc).reduce((a, b) => a + b, 0);
                      const isComplete = allocatedCount > 0;

                      return (
                        <div key={idx} className="p-3.5 rounded-xl border border-secondary-800/80 bg-secondary-900/40 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-text-50 text-xs sm:text-sm leading-snug wrap-break-word">{item.name}</h4>
                              <p className="text-xs text-text-300 mt-0.5">
                                Qty: {item.quantity}x &bull; Rp {(item.totalPrice / item.quantity).toLocaleString("id-ID")}/porsi
                              </p>
                            </div>
                            <Badge color={isComplete ? "success" : "warning"} size="sm" type="pill-color" className="inline-flex font-semibold text-2xs shrink-0">
                              {isComplete ? `Dibagi: ${allocatedCount} porsi` : "Belum dibagi"}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-4 pt-1">
                            {allPeople.map((person) => {
                              const qty = itemAlloc[person] || 0;
                              return (
                                <div key={person} className="flex flex-col items-center gap-1.5 w-14 shrink-0 relative">
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setManualItemAllocations((prev) => ({
                                          ...prev,
                                          [idx]: {
                                            ...(prev[idx] || {}),
                                            [person]: qty + 1,
                                          },
                                        }));
                                      }}
                                      className="focus:outline-none transition-transform active:scale-95 cursor-pointer rounded-full min-w-11 min-h-11 flex items-center justify-center p-0.5"
                                      aria-label={`Tambah porsi untuk ${person}`}
                                    >
                                      <Avatar
                                        alt={person}
                                        size="md"
                                        className={`shadow-md transition-all duration-200 ${qty > 0 ? "ring-2 ring-primary-500 border-primary-500 scale-105" : "opacity-40"}`}
                                      />
                                    </button>

                                    {qty > 0 && (
                                      <>
                                        {/* Quantity Badge on Top Right */}
                                        <span className="absolute -top-1 -right-1 bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-2xs font-bold shadow-md border border-secondary-950 pointer-events-none">
                                          {qty}
                                        </span>
                                        {/* Minus Button on Bottom Right */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setManualItemAllocations((prev) => ({
                                              ...prev,
                                              [idx]: {
                                                ...(prev[idx] || {}),
                                                [person]: Math.max(0, qty - 1),
                                              },
                                            }));
                                          }}
                                          className="absolute -bottom-1.5 -right-1.5 bg-danger-600 hover:bg-danger-700 text-white rounded-full w-6 h-6 min-w-6 min-h-6 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer border border-secondary-950 active:scale-90"
                                          title="Kurangi porsi"
                                          aria-label={`Kurangi porsi untuk ${person}`}
                                        >
                                          -
                                        </button>
                                      </>
                                    )}
                                  </div>
                                  <p className={`text-2xs wrap-break-word w-full text-center leading-tight font-semibold ${qty > 0 ? "text-text-50 font-bold" : "text-text-400"}`}>
                                    {person === currentUserName ? "Gua" : person}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bank / Payer Details */}
                {detailsForm}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Docked Bottom Action */}
      <div className="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-secondary-800 bg-secondary-950/95 backdrop-blur-md z-30">
        {inputMode === "scan" && !scanResult ? (
          file ? (
            <Button
              type="button"
              onPress={handleScanReceipt}
              isDisabled={loading}
              isLoading={loading}
              color="primary"
              className="w-full min-h-12 py-3.5 px-4 rounded-lg text-sm font-bold active:scale-[0.96] transition-transform"
            >
              Mulai Scan Struk
            </Button>
          ) : (
            <Button
              type="button"
              onPress={() => document.getElementById("file-input")?.click()}
              color="secondary"
              className="w-full min-h-12 py-3.5 px-4 rounded-lg text-sm font-bold active:scale-[0.96] transition-transform"
            >
              Pilih Foto Struk Dulu
            </Button>
          )
        ) : inputMode === "manual" ? (
          <div className="flex gap-2">
            {wizardStep > 1 && (
              <Button
                type="button"
                onPress={() => setWizardStep(prev => prev - 1)}
                color="secondary"
                className="flex-1 min-h-12 py-3.5 text-sm font-semibold rounded-lg active:scale-[0.96] transition-transform"
              >
                Balik
              </Button>
            )}
            {wizardStep < 3 ? (
              <Button
                type="button"
                onPress={() => {
                  if (wizardStep === 1 && manualItems.length === 0) {
                    toast.error("Tambahin minimal 1 menu makanan dulu, Bos!");
                    return;
                  }
                  setWizardStep(prev => prev + 1);
                }}
                color="primary"
                className="flex-1 min-h-12 py-3.5 text-white text-sm font-bold rounded-lg active:scale-[0.96] transition-transform"
              >
                Lanjut Bos
              </Button>
            ) : (
              <Button
                onPress={() => {
                  // Validate that all items have at least one allocation
                  const unallocatedItem = manualItems.find((item, idx) => {
                    const allocatedCount = Object.values(manualItemAllocations[idx] || {}).reduce((a, b) => a + b, 0);
                    return allocatedCount === 0;
                  });
                  if (unallocatedItem) {
                    toast.error(`Menu "${unallocatedItem.name}" belum dibagi ke siapa-siapa, Bos!`);
                    return;
                  }
                  handleCreate();
                }}
                isDisabled={loading}
                isLoading={loading}
                color="primary"
                className="flex-1 min-h-12 py-3.5 text-white text-sm font-bold rounded-lg active:scale-[0.96] transition-transform"
              >
                Bikin Bill Patungan
              </Button>
            )}
          </div>
        ) : isReadyForDetails ? (
          <Button
            onPress={() => handleCreate()}
            isDisabled={loading}
            isLoading={loading}
            className="w-full min-h-12 py-3.5 px-4 rounded-lg bg-primary hover:bg-primary-700 text-text-50 text-sm font-bold active:scale-[0.96] transition-transform"
          >
            Buat Bill &amp; Mulai Pembagian
          </Button>
        ) : null}
      </div>
    </main>
  );
}
