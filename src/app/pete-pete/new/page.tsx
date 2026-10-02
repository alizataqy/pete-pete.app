"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createManualBillSession } from "@/app/actions/session";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import {
  Edit02,
  Camera01,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  HelpCircle,
} from "@untitledui/icons";
import { SpotlightTour } from "@/components/features/onboarding/spotlight-tour";
import { getUserBanks, UserBankData } from "@/app/actions/profile";
import { toast } from "sonner";
import { useSessionStorageState } from "@/hooks/useSessionStorageState";

import { ScanItem, ScanResult, InputMode } from "./types";
import NewSessionBankForm from "./components/NewSessionBankForm";
import NewSessionScanStep from "./components/NewSessionScanStep";
import NewSessionManualSteps from "./components/NewSessionManualSteps";

// Kompres foto struk di client sebelum upload (pangkas 4-15MB jadi ~250KB, hemat data & loading 5-10x lebih cepat)
async function compressReceiptImage(file: File, maxDimension = 1600, quality = 0.8): Promise<File | Blob> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Jika resolusi dan ukuran sudah kecil, kirim langsung
      if (width <= maxDimension && height <= maxDimension && file.size < 500 * 1024) {
        resolve(file);
        return;
      }

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export default function NewSessionPage() {
  const router = useRouter();
  const { data: authSession, isPending } = useSession();

  // Mode selection
  const [inputMode, setInputMode] = useSessionStorageState<InputMode | null>(
    "pete-pete-new-input-mode",
    null
  );

  // Shared state
  const [title, setTitle] = useSessionStorageState("pete-pete-new-title", "");
  const [description, setDescription] = useSessionStorageState("pete-pete-new-description", "");
  const [merchantName, setMerchantName] = useSessionStorageState("pete-pete-new-merchant-name", "");
  const [loading, setLoading] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const chooseModeTourSteps = [
    {
      targetId: "tour-scan-mode",
      badge: "Langkah 1 dari 2",
      title: "Scan Struk AI (Rekomendasi)",
      description: "Foto struk kasir lo, sistem otomatis deteksi nama menu, jumlah, harga, pajak, dan diskon dalam hitungan detik!",
    },
    {
      targetId: "tour-manual-mode",
      badge: "Langkah 2 dari 2",
      title: "Input Menu Manual",
      description: "Kalo struknya ilang atau ga kebagian struk fisik, lo bisa ketik daftar menu dan harga patungan satu-satu.",
    },
  ];

  const detailsTourSteps = [
    {
      targetId: "tour-session-details",
      badge: "Langkah 1 dari 2",
      title: "Kasih Nama Tongkrongan",
      description: "Tulis nama acaranya (misal: 'Kopi Nako Tebet') biar sohib lo gak bingung pas nerima link bill.",
    },
    {
      targetId: "tour-bank-account",
      badge: "Langkah 2 dari 2",
      title: "Rekening Buat Sohib Transfer",
      description: "Tentukan ke mana sohib-sohib lo harus transfer patungannya (BCA, Mandiri, GoPay, atau QRIS).",
    },
  ];

  // Bank details selection & inputs
  const [profileBanks, setProfileBanks] = useState<UserBankData[]>([]);
  const [selectedBankId, setSelectedBankId] = useSessionStorageState<string>(
    "pete-pete-new-selected-bank-id",
    "custom"
  );
  const [useProfileBank, setUseProfileBank] = useSessionStorageState(
    "pete-pete-new-use-profile-bank",
    false
  );
  const [selectedTemplate, setSelectedTemplate] = useSessionStorageState(
    "pete-pete-new-selected-template",
    "BCA"
  );
  const [bankName] = useSessionStorageState("pete-pete-new-bank-name", "");
  const [bankAccount, setBankAccount] = useSessionStorageState("pete-pete-new-bank-account", "");
  const [bankOwner, setBankOwner] = useSessionStorageState("pete-pete-new-bank-owner", "");
  const [qrisUrl, setQrisUrl] = useSessionStorageState("pete-pete-new-qris-url", "");
  const [formSubmitted, setFormSubmitted] = useState(false);

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
  const [scanResult, setScanResult] = useSessionStorageState<ScanResult | null>(
    "pete-pete-new-scan-result",
    null
  );
  const [isDragOver, setIsDragOver] = useState(false);

  // Manual mode state
  const [manualMembers, setManualMembers] = useSessionStorageState<string[]>(
    "pete-pete-new-manual-members",
    ["Sohib 1"]
  );
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

  const [manualItems, setManualItems] = useSessionStorageState<ScanItem[]>(
    "pete-pete-new-manual-items",
    []
  );
  const [manualTax, setManualTax] = useSessionStorageState<number>("pete-pete-new-manual-tax", 0);
  const [manualTip, setManualTip] = useSessionStorageState<number>("pete-pete-new-manual-tip", 0);
  const [manualDiscount, setManualDiscount] = useSessionStorageState<number>(
    "pete-pete-new-manual-discount",
    0
  );
  const [showScanItemForm, setShowScanItemForm] = useState(false);

  const updateScanResultCalculations = (
    updatedItems: ScanItem[],
    taxAmount = Number(scanResult?.taxAmount || 0),
    tipAmount = Number(scanResult?.tipAmount || 0),
    discountAmount = Number(scanResult?.discountAmount || 0)
  ) => {
    if (!scanResult) return;
    const itemsSubtotal = updatedItems.reduce((acc, i) => acc + i.totalPrice, 0);
    setScanResult({
      ...scanResult,
      items: updatedItems,
      taxAmount,
      tipAmount,
      discountAmount,
      totalAmount: Math.max(0, itemsSubtotal + taxAmount + tipAmount - discountAmount),
    });
  };

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

    updateScanResultCalculations([...scanResult.items, newItem]);
    setDraftItemName("");
    setDraftItemAmount("");
    setDraftItemPrice("");
    setDraftItemQty("1");
    setShowScanItemForm(false);
    toast.success("Menu tambahan berhasil ditambahin!");
  };

  const handleRemoveScanItem = (idx: number) => {
    if (!scanResult) return;
    updateScanResultCalculations(scanResult.items.filter((_, i) => i !== idx));
    toast.success("Menu berhasil dihapus!");
  };

  const [editingManualIndex, setEditingManualIndex] = useState<number | null>(null);
  const [editingManualName, setEditingManualName] = useState("");
  const [wizardStep, setWizardStep] = useSessionStorageState<number>(
    "pete-pete-new-wizard-step",
    1
  );
  const [manualItemAllocations, setManualItemAllocations] = useSessionStorageState<
    Record<number, Record<string, number>>
  >("pete-pete-new-manual-item-allocations", {});

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
      "pete-pete-new-manual-discount",
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

  const currentUserName = authSession?.user?.name ?? "Gua";
  const allPeople = [currentUserName, ...manualMembers];

  const getActiveTourStage = (): string => {
    if (!inputMode) return "mode_select";
    if (inputMode === "scan" && !scanResult) return "scan_upload";
    if (inputMode === "scan" && scanResult && wizardStep === 1) return "scan_verify";
    if (inputMode === "manual" && wizardStep === 1) return "manual_items";
    if (wizardStep === 2) return "members";
    if (wizardStep === 3) return "details";
    return "default";
  };

  const getActiveTourSteps = () => {
    if (!inputMode) {
      return chooseModeTourSteps;
    }

    if (inputMode === "scan" && !scanResult) {
      return [
        {
          targetId: "tour-receipt-upload",
          badge: "Tips Foto Struk",
          title: "Pilih / Ambil Foto Struk",
          description:
            "Pastiin foto struk tegak lurus, pencahayaan terang, dan nominal total keliatan jelas biar AI gampang deteksi daftar menu dan harganya!",
        },
        {
          targetId: "tour-scan-action-btn",
          badge: "Mulai Scan AI",
          title: "Mulai Scan Otomatis",
          description:
            "Klik tombol ini setelah foto struk dipilih. AI bakal langsung ekstrak daftar menu, porsi, harga, dan pajaknya dalam sekejap!",
        },
      ];
    }

    if (inputMode === "scan" && scanResult && wizardStep === 1) {
      return [
        {
          targetId: "tour-scan-items",
          badge: "Review Menu",
          title: "Cek Menu Hasil Scan",
          description:
            "Periksa hasil pembacaan AI. Lo bisa edit harga, hapus menu, atau nambah menu baru kalo ada yang kelewatan.",
        },
        {
          targetId: "tour-scan-fees",
          badge: "Pajak & Diskon",
          title: "Sesuaikan Biaya Tambahan",
          description:
            "Cek pajak resto, service charge, atau diskon promosi dari struk biar perhitungannya akurat.",
        },
      ];
    }

    if (inputMode === "manual" && wizardStep === 1) {
      return [
        {
          targetId: "tour-manual-items",
          badge: "Input Menu",
          title: "Masukin Menu & Harga",
          description:
            "Tulis menu yang dipesen bareng-bareng beserta porsi dan harganya. Lo bisa tambah menu sebanyak mungkin!",
        },
      ];
    }

    if (wizardStep === 2) {
      return [
        {
          targetId: "tour-members-manager",
          badge: "Sohib Patungan",
          title: "Tambah Sohib Nongkrong",
          description:
            "Masukin nama-nama sohib lo yang ikut patungan buat split bill per porsi menunya.",
        },
      ];
    }

    return detailsTourSteps;
  };

  const currentStage = getActiveTourStage();

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    try {
      const storageKey = `has_seen_tour_${currentStage}`;
      const hasSeen = localStorage.getItem(storageKey);
      if (!hasSeen) {
        timer = setTimeout(() => setIsTourOpen(true), 500);
      }
    } catch {
      // Ignore localStorage errors
    }
    return () => {
      setIsTourOpen(false);
      if (timer) clearTimeout(timer);
    };
  }, [currentStage]);

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Scan Mode Handlers
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
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

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
      const uploadFile = await compressReceiptImage(file);
      const formData = new FormData();
      formData.append("file", uploadFile);
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
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal scan struk nih, coba foto yang lebih terang atau input manual ya!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Manual Mode Handlers
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

  const manualSubtotal = manualItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const manualTotal = Math.max(
    0,
    manualSubtotal + Number(manualTax) + Number(manualTip) - Number(manualDiscount)
  );

  // Create Session
  const handleCreate = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();

    const isManual = inputMode === "manual";
    const isScan = inputMode === "scan";

    if (isScan && !scanResult) {
      toast.error("Scan dulu foto struk lo biar bisa split bill, Bos!");
      return;
    }
    if (isManual && manualItems.some((i) => !i.name.trim())) {
      toast.error("Ada nama menu yang masih kosong nih, lengkapi dulu ya!");
      return;
    }
    if (isManual && manualItems.length === 0) {
      toast.error("Masukin minimal satu menu makanan atau minuman dulu ya, Bos!");
      return;
    }
    if (isManual && manualItems.some((i) => i.totalPrice <= 0)) {
      toast.error("Harga menu harus lebih dari Rp 0 ya, Bos!");
      return;
    }

    const isCustomBank = !useProfileBank || selectedBankId === "custom";
    if (selectedTemplate !== "none" && isCustomBank) {
      if (selectedTemplate === "QRIS") {
        if (!qrisUrl.trim()) {
          setFormSubmitted(true);
          toast.error("URL gambar QRIS wajib diisi ya, Bos!");
          return;
        }
      } else {
        if (!bankAccount.trim()) {
          setFormSubmitted(true);
          toast.error("Nomor rekening atau nomor HP wajib diisi ya, Bos!");
          return;
        }
      }
      if (!bankOwner.trim()) {
        setFormSubmitted(true);
        toast.error("Nama pemilik rekening wajib diisi ya, Bos!");
        return;
      }
    }

    setLoading(true);
    try {
      const taxAmount = isScan ? scanResult!.taxAmount : Number(manualTax);
      const tipAmount = isScan ? scanResult!.tipAmount : Number(manualTip);
      const discountAmount = isScan
        ? Number(scanResult!.discountAmount || 0)
        : Number(manualDiscount);

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
      } else if (selectedTemplate === "none") {
        finalBankName = "";
        finalBankAccount = "";
        finalBankOwner = "";
      } else if (selectedTemplate === "QRIS") {
        finalBankName = "QRIS";
        finalBankAccount = qrisUrl;
      } else {
        finalBankName = selectedTemplate;
      }

      const currentItems = isManual ? manualItems : scanResult!.items;
      const currentTotal = isManual ? manualTotal : scanResult!.totalAmount;

      const itemsPayload = currentItems.map((item, idx) => {
        const allocationsMap = manualItemAllocations[idx] || {};
        const allocationsList = Object.entries(allocationsMap)
          .filter(([, qty]) => qty > 0)
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
        title:
          title ||
          merchantName ||
          (isScan ? scanResult?.merchantName : undefined) ||
          "Bill Splitbill",
        description,
        merchantName: merchantName || (isScan ? scanResult?.merchantName : undefined),
        totalAmount: currentTotal,
        taxAmount,
        tipAmount,
        discountAmount,
        userId: authSession?.user?.id,
        members: allPeople,
        items: itemsPayload,
        bankName: finalBankName,
        bankAccount: finalBankAccount,
        bankOwner: finalBankOwner,
      });

      if (!res.success) {
        toast.error(res.error || "Gagal nyimpen sesi split bill nih, coba periksa data menu lo ya!");
      } else {
        clearSessionStorage();
        router.push(`/pete-pete/${res.session?.id}/split`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kendala saat nyimpen sesi split bill nih, coba lagi ya!");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <main className="flex-1 flex flex-col bg-background text-text h-full min-h-0 overflow-hidden select-none">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center gap-3">
          <div className="min-w-11 min-h-11 rounded-lg bg-secondary-900 border border-secondary-800 shrink-0 animate-pulse" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="h-4 bg-secondary-900 rounded-md w-36 animate-pulse" />
            <div className="h-2.5 bg-secondary-900/70 rounded-md w-40 animate-pulse" />
          </div>
        </header>

        {/* Body Skeleton */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-1.5 pt-1">
            <div className="h-5 bg-secondary-900 rounded-lg w-56 animate-pulse" />
            <div className="h-3.5 bg-secondary-900/70 rounded-md w-full max-w-sm animate-pulse" />
          </div>

          <div className="space-y-3 pt-1">
            {/* Scan Mode Skeleton Card */}
            <div className="w-full p-4 sm:p-5 rounded-2xl border-2 border-primary-400/25 bg-secondary-950/40 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-primary-400/15 border border-primary-400/25 animate-pulse mt-0.5" />
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-secondary-800 rounded-md w-36 animate-pulse" />
                    <div className="w-20 h-5 rounded-full bg-primary-400/15 animate-pulse" />
                  </div>
                  <div className="h-3 bg-secondary-800/70 rounded-md w-4/5 animate-pulse" />
                  <div className="h-2.5 bg-secondary-800/50 rounded-md w-3/5 animate-pulse" />
                </div>
              </div>
              <div className="w-5 h-5 rounded bg-secondary-800 shrink-0 animate-pulse mt-1" />
            </div>

            {/* Manual Mode Skeleton Card */}
            <div className="w-full p-4 sm:p-5 rounded-2xl border border-secondary-800/80 bg-secondary-950/30 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-secondary-900/80 border border-secondary-800 animate-pulse mt-0.5" />
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-secondary-800 rounded-md w-32 animate-pulse" />
                    <div className="w-16 h-5 rounded-full bg-secondary-800/60 animate-pulse" />
                  </div>
                  <div className="h-3 bg-secondary-800/70 rounded-md w-4/5 animate-pulse" />
                  <div className="h-2.5 bg-secondary-800/50 rounded-md w-2/3 animate-pulse" />
                </div>
              </div>
              <div className="w-5 h-5 rounded bg-secondary-800 shrink-0 animate-pulse mt-1" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Step 0: Choose Mode
  if (!inputMode) {
    return (
      <main className="flex-1 flex flex-col bg-background text-text h-full min-h-0 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
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
              <p className="text-2xs text-text-300">Pilih cara input menu split bill</p>
            </div>
          </div>
          <Button
            size="sm"
            color="secondary"
            aria-label="Panduan bikin pete-petean"
            onPress={() => setIsTourOpen(true)}
            iconLeading={HelpCircle}
            className="min-w-10 min-h-10 w-10 h-10 p-0 rounded-lg bg-secondary-900 border border-secondary-800 text-primary-400 hover:text-primary-300 flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer"
          />
        </header>

        {/* Body Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-1.5 pt-1">
            <h2 className="text-base sm:text-lg font-extrabold text-text-50 text-balance">
              Mau input menu gimana nih?
            </h2>
            <p className="text-xs text-text-300 leading-relaxed text-pretty">
              Pilih cara paling praktis buat lo &amp; geng. Pake foto struk jauh lebih cepet dan anti ribet!
            </p>
          </div>

          <div className="space-y-3">
            {/* Scan Mode Card */}
            <button
              id="tour-scan-mode"
              type="button"
              onClick={() => setInputMode("scan")}
              className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-primary-400/40 bg-linear-to-br from-primary-950/40 via-secondary-950/60 to-secondary-950/30 hover:border-primary-400/80 hover:bg-secondary-950/80 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] transition-all shadow-xs group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-primary-400/20 border border-primary-400/35 text-primary-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-primary-400/30 transition-all shadow-xs mt-0.5">
                    <Camera01 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-text-50 group-hover:text-primary-300 transition-colors">
                        Scan Foto Struk
                      </h3>
                      <Badge
                        color="brand"
                        size="sm"
                        type="pill-color"
                        className="font-extrabold text-3xs px-2 py-0.5 shadow-xs"
                      >
                        Rekomendasi
                      </Badge>
                    </div>
                    <p className="text-xs text-text-300 mt-1 leading-relaxed text-pretty">
                      Foto struk kasir lo, AI otomatis deteksi nama menu, porsi, harga, pajak &amp; diskon dalam hitungan detik.
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary-400/10 border border-primary-400/20 text-primary-400 flex items-center justify-center shrink-0 group-hover:bg-primary-400/25 group-hover:translate-x-0.5 transition-all mt-1">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Manual Mode Card */}
            <button
              id="tour-manual-mode"
              type="button"
              onClick={() => setInputMode("manual")}
              className="w-full text-left p-4 sm:p-5 rounded-2xl border border-secondary-800 bg-secondary-950/40 hover:border-secondary-700 hover:bg-secondary-950/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] transition-all shadow-xs group cursor-pointer relative"
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
                      <Badge
                        color="gray"
                        size="sm"
                        type="pill-color"
                        className="font-semibold text-3xs px-2 py-0.5"
                      >
                        Alternatif
                      </Badge>
                    </div>
                    <p className="text-xs text-text-300 mt-1 leading-relaxed text-pretty">
                      Ketik satu-satu nama menu, porsi, dan harga secara manual kalo lagi gak pegang struk fisik.
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-secondary-900 border border-secondary-800 text-text-400 flex items-center justify-center shrink-0 group-hover:bg-secondary-800 group-hover:translate-x-0.5 transition-all mt-1">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>
        </div>

        <SpotlightTour
          steps={chooseModeTourSteps}
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          storageKey={`has_seen_tour_${currentStage}`}
        />
      </main>
    );
  }

  const detailsForm = (
    <NewSessionBankForm
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      profileBanks={profileBanks}
      useProfileBank={useProfileBank}
      setUseProfileBank={setUseProfileBank}
      selectedBankId={selectedBankId}
      setSelectedBankId={setSelectedBankId}
      selectedTemplate={selectedTemplate}
      setSelectedTemplate={setSelectedTemplate}
      bankAccount={bankAccount}
      setBankAccount={setBankAccount}
      bankOwner={bankOwner}
      setBankOwner={setBankOwner}
      qrisUrl={qrisUrl}
      setQrisUrl={setQrisUrl}
      isLoggedIn={!!authSession?.user}
      formSubmitted={formSubmitted}
    />
  );

  return (
    <main className="flex-1 flex flex-col bg-background text-text h-full min-h-0 overflow-hidden">
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            onPress={() => {
              if (wizardStep > 1) {
                setWizardStep((prev) => prev - 1);
              } else if (inputMode === "scan" && scanResult) {
                setScanResult(null);
              } else {
                setInputMode(null);
              }
            }}
            color="primary"
            size="sm"
            aria-label="Kembali"
            className="min-w-11 min-h-11 p-2 rounded-lg active:scale-95 transition-all flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold text-text-50">
              {inputMode === "scan" ? "Scan Struk" : "Input Manual"}
            </h1>
            <p className="text-2xs text-text-300">
              {wizardStep === 1
                ? inputMode === "scan" && !scanResult
                  ? "Langkah 1: Upload Foto Struk"
                  : "Langkah 1: Review Menu"
                : wizardStep === 2
                ? "Langkah 2: Tambah Sohib Patungan"
                : "Langkah 3: Info Rekening & Bayar"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          color="secondary"
          aria-label="Panduan bikin pete-petean"
          onPress={() => setIsTourOpen(true)}
          iconLeading={HelpCircle}
          className="min-w-10 min-h-10 w-10 h-10 p-0 rounded-lg bg-secondary-900 border border-secondary-800 text-primary-400 hover:text-primary-300 flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer"
        />
      </header>

      {/* Form Body Scrollable */}
      <div className="flex-1 min-h-0 p-4 space-y-5 overflow-y-auto">
        {inputMode === "scan" && (
          <NewSessionScanStep
            wizardStep={wizardStep}
            scanResult={scanResult}
            file={file}
            filePreview={filePreview}
            loading={loading}
            isDragOver={isDragOver}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileChange={handleFileChange}
            onClearFile={() => {
              setFile(null);
              setFilePreview(null);
            }}
            handleRemoveScanItem={handleRemoveScanItem}
            showScanItemForm={showScanItemForm}
            setShowScanItemForm={setShowScanItemForm}
            draftItemName={draftItemName}
            setDraftItemName={setDraftItemName}
            draftItemAmount={draftItemAmount}
            setDraftItemAmount={setDraftItemAmount}
            draftItemPrice={draftItemPrice}
            setDraftItemPrice={setDraftItemPrice}
            draftItemQty={draftItemQty}
            setDraftItemQty={setDraftItemQty}
            draftPriceMode={draftPriceMode}
            setDraftPriceMode={setDraftPriceMode}
            handleAddScanDraftItem={handleAddScanDraftItem}
            updateScanResultCalculations={updateScanResultCalculations}
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
            detailsForm={detailsForm}
          />
        )}

        {inputMode === "manual" && (
          <NewSessionManualSteps
            wizardStep={wizardStep}
            draftItemName={draftItemName}
            setDraftItemName={setDraftItemName}
            draftItemQty={draftItemQty}
            handleDraftItemQtyChange={handleDraftItemQtyChange}
            addPriceMode={addPriceMode}
            setAddPriceMode={setAddPriceMode}
            draftItemPrice={draftItemPrice}
            handleDraftItemPriceChange={handleDraftItemPriceChange}
            draftItemAmount={draftItemAmount}
            handleDraftItemAmountChange={handleDraftItemAmountChange}
            handleAddManualItem={handleAddDraftItem}
            manualItems={manualItems}
            setManualItems={setManualItems}
            manualTax={manualTax}
            setManualTax={setManualTax}
            manualTip={manualTip}
            setManualTip={setManualTip}
            manualDiscount={manualDiscount}
            setManualDiscount={setManualDiscount}
            manualSubtotal={manualSubtotal}
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
            detailsForm={detailsForm}
          />
        )}
      </div>

      {/* Floating Bottom Action */}
      <div className="shrink-0 p-4 border-t border-secondary-800 bg-secondary-950/95 backdrop-blur-md z-30">
        {inputMode === "scan" && !scanResult ? (
          <div id="tour-scan-action-btn" className="w-full">
            <Button
              type="button"
              onPress={handleScanReceipt}
              isDisabled={!file || loading}
              isLoading={loading}
              color="primary"
              className="w-full min-h-12 py-3.5 px-4 rounded-lg text-sm font-bold active:scale-[0.96] transition-transform"
              iconLeading={<Camera01 className="w-4 h-4" />}
            >
              {loading ? "Lagi Baca Struk" : "Mulai Scan Struk"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {wizardStep > 1 && (
              <Button
                type="button"
                onPress={() => setWizardStep((prev) => Math.max(1, prev - 1))}
                color="secondary"
                size="md"
                className="min-h-12 py-3.5 px-4 rounded-lg text-sm font-bold active:scale-[0.96] transition-transform shrink-0"
                iconLeading={<ArrowLeft className="w-4 h-4" />}
              >
                Kembali
              </Button>
            )}

            {wizardStep < 3 ? (
              <Button
                type="button"
                onPress={() => {
                  if (inputMode === "manual" && manualItems.length === 0) {
                    toast.error("Masukin minimal satu menu makanan atau minuman dulu ya, Bos!");
                    return;
                  }
                  if (inputMode === "scan" && (!scanResult || scanResult.items.length === 0)) {
                    toast.error("Minimal harus ada satu menu di struk ya, Bos!");
                    return;
                  }
                  setWizardStep((prev) => prev + 1);
                }}
                color="primary"
                className="flex-1 min-h-12 py-3.5 px-4 rounded-lg text-sm font-bold active:scale-[0.96] transition-transform"
                iconTrailing={<ChevronRight className="w-4 h-4" />}

              >
                Lanjut ke Langkah {wizardStep + 1}
              </Button>
            ) : (
              <Button
                type="button"
                onPress={() => handleCreate()}
                isDisabled={loading}
                isLoading={loading}
                color="primary"
                className="flex-1 min-h-12 py-3.5 px-4 rounded-lg text-sm font-bold active:scale-[0.96] transition-transform"
                iconLeading={<CheckCircle className="w-4 h-4" />}
              >
                Gas, Bikin Bill &amp; Bagi Tagihan!
              </Button>
            )}
          </div>
        )}
      </div>

      <SpotlightTour
        steps={getActiveTourSteps()}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        storageKey={`has_seen_tour_${currentStage}`}
      />
    </main>
  );
}
