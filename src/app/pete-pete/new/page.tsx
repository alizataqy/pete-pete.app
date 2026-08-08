"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBillSession, createManualBillSession } from "@/app/actions/session";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/base/buttons/button";
import { Edit02, Camera01, Plus, ArrowLeft, AlertCircle, UploadCloud01, Check, CreditCard01 } from "@untitledui/icons";
import { getUserBanks, UserBankData } from "@/app/actions/profile";
import { Avatar } from "@/components/base/avatar/avatar";
import { toast } from "sonner";
import { useSessionStorageState } from "@/hooks/useSessionStorageState";

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
  const [inputMode, setInputMode] = useSessionStorageState<InputMode | null>("pete-pete-new-input-mode", null);

  // Shared state
  const [title, setTitle] = useSessionStorageState("pete-pete-new-title", "");
  const [description, setDescription] = useSessionStorageState("pete-pete-new-description", "");
  const [merchantName, setMerchantName] = useSessionStorageState("pete-pete-new-merchant-name", "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          title: title || `PETE-PETE ${merchantName || "Bill Patungan"}`,
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
          setError(res.error || "Gagal membuat sesi manual.");
        } else {
          clearSessionStorage();
          router.push(`/pete-pete/${res.session?.id}/split`);
        }
      } else {
        // Scan mode uses standard createBillSession
        const items = scanResult!.items;
        const totalAmount = scanResult!.totalAmount;

        const res = await createBillSession({
          title: title || `PETE-PETE ${merchantName}`,
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
          setError(res.error || "Gagal membuat sesi.");
        } else {
          clearSessionStorage();
          router.push(`/pete-pete/${res.session?.id}/split`);
        }
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
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-text-300 text-sm">Sabar Bos</p>
        </div>
      </div>
    );
  }

  // --- Step 0: Choose Mode ---
  if (!inputMode) {
    return (
      <main className="flex-1 flex flex-col bg-secondary-950">
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center gap-3">
          <Button href={authSession ? "/tongkrongan" : "/"} color="primary" size="sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-base font-semibold text-text-50">Bikin Bill PETE-PETE</h1>
            <p className="text-[10px] text-text-300">Pilih cara input menu</p>
          </div>
        </header>

        <div className="flex-1 p-5 flex flex-col justify-center gap-3">
          <p className="text-xs text-text-300 text-center mb-1">Mau input gimana nih?</p>

          {/* Scan Mode Card */}
          <button
            type="button"
            onClick={() => setInputMode("scan")}
            className="w-full text-left p-4 rounded-2xl border border-secondary-800 bg-text-900 hover:border-primary-700 hover:bg-text-800 active:scale-[0.98] transition-all space-y-2.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-primary-900/60 border border-primary-800 flex items-center justify-center">
                <Camera01 className="w-5 h-5 text-primary-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-50">Scan Foto Struk</p>
                <p className="text-[10px] text-text-300">AI otomatis baca item &amp; harga dari foto</p>
              </div>
            </div>
            <p className="text-[10px] text-text-400 leading-relaxed pl-[52px]">
              Foto struk makan atau belanja, semua menu &amp; harganya langsung kebaca otomatis.
            </p>
          </button>

          {/* Manual Mode Card */}
          <button
            type="button"
            onClick={() => setInputMode("manual")}
            className="w-full text-left p-4 rounded-2xl border border-secondary-800 bg-text-900 hover:border-emerald-700 hover:bg-text-800 active:scale-[0.98] transition-all space-y-2.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-center">
                <Edit02 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-50">Input Manual</p>
                <p className="text-[10px] text-text-300">Ketik item &amp; jumlah sendiri satu per satu</p>
              </div>
            </div>
            <p className="text-[10px] text-text-400 leading-relaxed pl-[52px]">
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
    <div className="bg-text-900 border border-secondary-800 rounded-xl p-4 shadow-sm space-y-4">
      <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider">
        2. Detail Bill
      </h2>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-100">Judul Bill</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-50 placeholder-text-500 text-xs outline-none transition-all"
            placeholder="Misal: Makan Siang Bersama"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-100">Nama Toko / Merchant</label>
          <input
            type="text"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-50 placeholder-text-500 text-xs outline-none transition-all"
            placeholder="Misal: Restoran Selera"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-100">Catatan (Opsional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-50 placeholder-text-500 text-xs outline-none transition-all"
            placeholder="Keterangan tambahan..."
            rows={2}
          />
        </div>

        {inputMode === "manual" && (
          <div className="grid grid-cols-2 gap-3 pt-1.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-100">Pajak / Tax (Rp)</label>
              <input
                type="number"
                min={0}
                value={manualTax || ""}
                onChange={(e) => setManualTax(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-50 placeholder-text-500 text-xs outline-none transition-all"
                placeholder="Contoh: 10000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-100">Servis / Tip (Rp)</label>
              <input
                type="number"
                min={0}
                value={manualTip || ""}
                onChange={(e) => setManualTip(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-50 placeholder-text-500 text-xs outline-none transition-all"
                placeholder="Contoh: 5000"
              />
            </div>
          </div>
        )}

        <div className="border-t border-secondary-800 pt-3 space-y-3">
          <h3 className="text-[11px] font-bold text-primary-400 uppercase tracking-wider flex items-center gap-1">
            <CreditCard01 className="w-3.5 h-3.5" />
            <span>Rekening Transfer Bill Ini</span>
          </h3>

          {profileBanks.length > 0 ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-text-100 cursor-pointer">
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
                  className="rounded bg-text-950 border-text-700 text-primary-500 focus:ring-primary-500"
                />
                Pilih Rekening Profil
              </label>

              {useProfileBank ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    {profileBanks.map((b) => (
                      <label
                        key={b.id}
                        className={`p-3 rounded-lg border text-xs text-text-300 flex items-center justify-between cursor-pointer transition-all ${selectedBankId === b.id
                          ? "bg-primary-950/40 border-primary-500 text-text-100"
                          : "bg-text-950 border-text-800 hover:border-text-700"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="profileBankSelect"
                            checked={selectedBankId === b.id}
                            onChange={() => b.id && setSelectedBankId(b.id)}
                            className="bg-text-950 border-text-700 text-primary-500 focus:ring-primary-500"
                          />
                          <div>
                            <p className="font-bold text-text-50">{b.bankName}</p>
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
                <label className="text-xs font-semibold text-text-100">Pilih Tipe Bank / E-Wallet</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {BANK_TEMPLATES.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSelectedTemplate(t.name)}
                      className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold transition-all text-center ${selectedTemplate === t.name
                        ? "bg-primary-900 border-primary-500 text-primary-300"
                        : "bg-text-950 border-text-700 text-text-300 hover:bg-text-900"
                        }`}
                    >
                      {t.name}
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
                    className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-50 placeholder-text-500 text-xs outline-none transition-all"
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
                    className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-50 placeholder-text-500 text-xs outline-none transition-all"
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
                  className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-50 placeholder-text-500 text-xs outline-none transition-all"
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
    <main className="flex-1 flex flex-col bg-secondary-950 relative h-full min-h-0 overflow-hidden">
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center gap-3">
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
          <h1 className="text-base font-semibold text-text-50">
            {inputMode === "scan" ? "Scan Struk" : "Input Manual"}
          </h1>
          <p className="text-[10px] text-text-300">
            {inputMode === "scan"
              ? (scanResult ? "Langkah 2: Detail Bill" : "Langkah 1: Upload Foto")
              : "Masukkan item & detail Bill"}
          </p>
        </div>
      </header>

      {/* Form Body Scrollable */}
      <div className="flex-1 p-4 pb-28 space-y-5 overflow-y-auto">
        {error && (
          <div className="p-3.5 rounded-xl border border-secondary-700 bg-secondary-950 text-secondary-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        {/* ============================ SCAN MODE ============================ */}
        {inputMode === "scan" && (
          <>
            {scanResult?.isMock && (
              <div className="p-3.5 bg-primary-950 border border-[#0f3557] rounded-xl text-xs text-text-300">
                Mode Demo — set GEMINI_API_KEY di <code className="text-text-50">.env</code> buat OCR beneran.
              </div>
            )}

            {/* Step 1: Upload File */}
            {!scanResult && (
              <div className="bg-text-900 border border-secondary-800 rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider">1. Pilih Foto Struk</h2>
                  {file && (
                    <Button onPress={() => { setFile(null); setFilePreview(null); }} color="link-gray" className="text-[10px] font-semibold text-secondary-200">
                      Hapus Foto
                    </Button>
                  )}
                </div>

                {!filePreview ? (
                  <div
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input")?.click()}
                    className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.98] ${isDragOver ? "border-primary-500 bg-primary-950" : "border-text-700 bg-text-950 hover:border-text-500"}`}
                  >
                    <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <div className="p-2.5 bg-secondary-800 rounded-lg border border-text-700 mb-3">
                      <UploadCloud01 className="w-5 h-5 text-text-300" />
                    </div>
                    <p className="text-xs font-semibold text-text-50 mb-0.5">Upload foto struk lo</p>
                    <p className="text-[10px] text-text-300">Foto atau pilih dari galeri</p>
                  </div>
                ) : (
                  <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden bg-text-950 border border-secondary-800">
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
                  <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider">Menu yang ketauan</h2>
                  <span className="text-[10px] font-medium bg-secondary-800 text-text-100 px-2 py-0.5 rounded-full border border-text-700">
                    {scanResult.items.length} Menu
                  </span>
                </div>

                <div className="space-y-2">
                  {scanResult.items.map((item, idx) => (
                    <div key={idx} className="bg-text-900 border border-secondary-800 rounded-xl p-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-text-50 block">{item.name}</span>
                        <span className="text-[10px] text-text-300">{item.quantity}x • Rp {Number(item.unitPrice).toLocaleString("id-ID")}</span>
                      </div>
                      <span className="text-xs font-bold text-text-50">Rp {Number(item.totalPrice).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-text-900 border border-secondary-800 rounded-xl p-3.5 space-y-2 text-xs text-text-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-text-50 font-medium">
                      Rp {scanResult.items.reduce((acc, i) => acc + i.totalPrice, 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                  {scanResult.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Pajak (PPN)</span>
                      <span className="text-text-50">Rp {Number(scanResult.taxAmount).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  {scanResult.tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Service Charge / Tip</span>
                      <span className="text-text-50">Rp {Number(scanResult.tipAmount).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-text-50 pt-2.5 border-t border-secondary-800">
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
          <div className="space-y-4 pb-20">
            {/* Step Indicator */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">
                Langkah {wizardStep} dari 3
              </span>
              <div className="flex gap-1">
                <div className={`h-1.5 w-6 rounded-full transition-all ${wizardStep >= 1 ? "bg-secondary-800" : "bg-primary"}`} />
                <div className={`h-1.5 w-6 rounded-full transition-all ${wizardStep >= 2 ? "bg-secondary-800" : "bg-primary"}`} />
                <div className={`h-1.5 w-6 rounded-full transition-all ${wizardStep >= 3 ? "bg-secondary-800" : "bg-primary"}`} />
              </div>
            </div>

            {/* WIZARD STEP 1: INPUT ITEMS */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="bg-text-900 border border-secondary-800 rounded-xl p-4 space-y-4">
                  <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. Masukin Semua Menu Dulu</span>
                  </h2>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-text-400 uppercase">Nama Menu / Item</label>
                      <input
                        type="text"
                        value={draftItemName}
                        onChange={(e) => setDraftItemName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-xs text-text-50 placeholder-text-500 outline-none focus:border-primary-500 transition-all"
                        placeholder="Nasi Goreng, Es Teh, Tiket Bioskop..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-text-400 uppercase">Porsi / Qty</label>
                        <input
                          type="number"
                          min={1}
                          value={draftItemQty}
                          onChange={(e) => handleDraftItemQtyChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-xs text-text-50 outline-none focus:border-primary-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-text-400 uppercase">Tipe Harga</label>
                        <div className="grid grid-cols-2 gap-1 bg-text-950/80 p-1 rounded-xl border border-secondary-800/40 h-9 items-center">
                          <Button
                            type="button"
                            onPress={() => setAddPriceMode("unit")}
                            color={addPriceMode === "unit" ? "primary" : "tertiary"}
                            size="xs"
                            className="h-full text-[10px] font-bold rounded-lg"
                          >
                            Satuan
                          </Button>
                          <Button
                            type="button"
                            onPress={() => setAddPriceMode("total")}
                            color={addPriceMode === "total" ? "primary" : "tertiary"}
                            size="xs"
                            className="h-full text-[10px] font-bold rounded-lg"
                          >
                            Total
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-text-400 uppercase">
                          {addPriceMode === "unit" ? "Harga Satuan" : "Harga Total"}
                        </label>
                        {addPriceMode === "unit" ? (
                          <input
                            type="number"
                            min={0}
                            value={draftItemPrice}
                            onChange={(e) => handleDraftItemPriceChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-xs text-text-50 placeholder-text-500 outline-none focus:border-primary-500 transition-all"
                            placeholder="Satuan"
                          />
                        ) : (
                          <input
                            type="number"
                            min={0}
                            value={draftItemAmount}
                            onChange={(e) => handleDraftItemAmountChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-xs text-text-50 placeholder-text-500 outline-none focus:border-primary-500 transition-all"
                            placeholder="Total"
                          />
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      onPress={handleAddDraftItem}
                      iconLeading={<Plus />}
                      className="w-full py-2.5 mt-2"
                      color="primary"
                    >
                      Tambahin Menu ke Daftar
                    </Button>
                  </div>
                </div>

                {/* Daftar Item yang sudah ditambah */}
                {manualItems.length > 0 && (
                  <div className="bg-text-900 border border-secondary-800 rounded-xl p-4 space-y-3">
                    <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider">Menu yang Udah Masuk</h2>
                    <div className="space-y-2">
                      {manualItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-text-950 border border-text-800">
                          <div>
                            <p className="text-xs font-semibold text-text-50">{item.name}</p>
                            <p className="text-[10px] text-text-400">{item.quantity}x • Rp {item.totalPrice.toLocaleString("id-ID")}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveManualItem(idx)}
                            className="text-rose-400 hover:text-rose-300 text-xs font-semibold px-2 py-1"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-2 border-t border-text-800 text-xs font-bold text-text-50">
                      <span>Total Sementara</span>
                      <span className="text-primary-400">Rp {manualSubtotal.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WIZARD STEP 2: INPUT MEMBERS */}
            {wizardStep === 2 && (
              <div className="bg-text-900 border border-secondary-800 rounded-xl p-4 space-y-4">
                <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider">2. Siapa Aja yang Ikut PETE-PETE?</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMemberInput}
                    onChange={(e) => setNewMemberInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddMember(); } }}
                    className="flex-1 px-3 py-2 rounded-lg bg-text-950 border border-text-700 text-xs text-text-50 placeholder-text-500 outline-none focus:border-primary-500 transition-all"
                    placeholder="Nama temen lo..."
                  />
                  <Button type="button" onPress={handleAddMember} size="sm" iconLeading={<Plus />}>Tambahin</Button>
                </div>
                <div className="flex flex-wrap gap-4 pt-3">
                  {/* User (Owner) */}
                  <div className="flex flex-col items-center gap-1.5 w-16 shrink-0">
                    <Avatar alt={currentUserName} size="lg" className="shadow-md border border-primary-700 ring-2 ring-primary-900" />
                    <p className="text-[10px] text-text font-bold truncate w-full text-center">
                      {currentUserName} <span className="text-[9px] opacity-60 font-normal">(lo)</span>
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
                            value={editingManualName}
                            onChange={(e) => setEditingManualName(e.target.value)}
                            onBlur={() => handleSaveManualRename(idx)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveManualRename(idx);
                              if (e.key === "Escape") setEditingManualIndex(null);
                            }}
                            autoFocus
                            className="w-full text-[9px] px-0.5 py-0.5 rounded bg-text-950 border border-text-700 text-text text-center outline-none"
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
                            className="focus:outline-none cursor-pointer"
                            title="Klik untuk ubah nama"
                          >
                            <Avatar alt={m} size="lg" className="shadow-md border border-secondary-800 hover:scale-105 transition-all" />
                          </button>
                          <p
                            onClick={() => {
                              setEditingManualIndex(idx);
                              setEditingManualName(m);
                            }}
                            className="text-[10px] text-text font-semibold truncate w-full text-center cursor-pointer hover:underline"
                            title="Klik untuk ubah nama"
                          >
                            {m}
                          </p>
                          <button
                            type="button"
                            onClick={() => setManualMembers((prev) => prev.filter((x) => x !== m))}
                            className="absolute top-0 right-0 bg-rose-600 hover:bg-rose-700 text-white rounded-full size-4 flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition-all active:scale-90"
                            title="Hapus"
                          >
                            &times;
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
                <div className="bg-text-900 border border-secondary-800 rounded-xl p-4 space-y-4">
                  <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider">3. Siapa Pesen Apa Nih?</h2>
                  <div className="space-y-4">
                    {manualItems.map((item, idx) => {
                      const itemAlloc = manualItemAllocations[idx] || {};
                      const allocatedCount = Object.values(itemAlloc).reduce((a, b) => a + b, 0);
                      const isComplete = allocatedCount > 0;

                      return (
                        <div key={idx} className="p-3.5 rounded-xl border border-secondary-800 bg-text-950/40 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-text-50 text-xs">{item.name}</h4>
                              <p className="text-[10px] text-text-400 mt-0.5">
                                Qty: {item.quantity}x • Rp {(item.totalPrice / item.quantity).toLocaleString("id-ID")}/org
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isComplete ? "bg-emerald-950 border border-emerald-800 text-emerald-300" : "bg-amber-950 border border-amber-800 text-amber-300"}`}>
                              {isComplete ? `Udah dibagi: ${allocatedCount} porsi` : "Belum dibagi"}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 pt-1">
                            {allPeople.map((person) => {
                              const qty = itemAlloc[person] || 0;
                              return (
                                <div key={person} className="flex flex-col items-center gap-1.5 w-12 shrink-0 relative">
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
                                      className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                                    >
                                      <Avatar
                                        alt={person}
                                        size="md"
                                        className={`shadow-md transition-all duration-200 ${qty > 0 ? "ring-2 ring-primary border-primary scale-105" : "opacity-40"}`}
                                      />
                                    </button>

                                    {qty > 0 && (
                                      <>
                                        {/* Quantity Badge on Top Right */}
                                        <span className="absolute -top-1 -right-1 bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md border border-text-950">
                                          {qty}
                                        </span>
                                        {/* Tiny Minus Button on Bottom Right */}
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
                                          className="absolute -bottom-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer border border-text-950 active:scale-90"
                                          title="Kurangi porsi"
                                        >
                                          -
                                        </button>
                                      </>
                                    )}
                                  </div>
                                  <p className={`text-[10px] truncate w-full text-center font-semibold ${qty > 0 ? "text-text font-bold" : "text-text-400"}`}>
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

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-800 bg-secondary-950/95 backdrop-blur-md z-20">
        {inputMode === "scan" && !scanResult ? (
          file && (
            <Button
              type="button"
              onPress={handleScanReceipt}
              isDisabled={loading}
              isLoading={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-700 text-text-50 text-xs font-semibold"
            >
              Mulai Scan Struk
            </Button>
          )
        ) : inputMode === "manual" ? (
          <div className="flex gap-2">
            {wizardStep > 1 && (
              <Button
                type="button"
                onPress={() => setWizardStep(prev => prev - 1)}
                color="secondary"
                className="flex-1 py-3 text-xs"
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
                className="flex-1 py-3 text-white text-xs font-bold"
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
                className="flex-1 py-3 text-white text-xs font-bold"
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
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-700 text-text-50 text-xs font-semibold"
          >
            Buat Bill &amp; Mulai Pembagian
          </Button>
        ) : null}
      </div>
    </main>
  );
}
