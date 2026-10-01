"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share07,
  Copy01,
  Check,
  CheckCircle,
  Clock,
  ChevronDown,
  ReceiptCheck,
  User01,
  Printer,
  Download01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import DigitalReceiptModal from "@/components/application/modals/DigitalReceiptModal";

interface BonItemAllocation {
  memberId: string;
  quantity: number;
}

interface BonItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  allocations: BonItemAllocation[];
}

interface BonMember {
  id: string;
  name: string;
  isPaid: boolean;
  shareAmount: number;
  userId: string | null;
}

interface BonSession {
  id: string;
  title: string;
  merchantName: string | null;
  inviteCode: string;
  totalAmount: number;
  taxAmount: number;
  tipAmount: number;
  discountAmount?: number;
  bankName: string | null;
  bankAccount?: string | null;
  bankOwner: string | null;
  creatorName?: string | null;
  status: "DRAFT" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

interface BonViewProps {
  session: BonSession;
  items: BonItem[];
  members: BonMember[];
  preselectedMemberId?: string;
}

export default function BonView({
  session,
  items,
  members,
  preselectedMemberId,
}: BonViewProps) {
  const router = useRouter();

  // Jika ada query param member yang cocok, langsung jadikan default selected
  const initialMember = useMemo(() => {
    if (preselectedMemberId) {
      const match = members.find(
        (m) =>
          m.id === preselectedMemberId ||
          m.name.toLowerCase() === preselectedMemberId.toLowerCase()
      );
      if (match) return match.id;
    }
    return members[0]?.id || "";
  }, [members, preselectedMemberId]);

  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMember);
  const [showAllItems, setShowAllItems] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Ref & status scroll untuk carousel anggota
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollIndicators = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  };

  useEffect(() => {
    updateScrollIndicators();
    window.addEventListener("resize", updateScrollIndicators);
    return () => window.removeEventListener("resize", updateScrollIndicators);
  }, [members]);

  // Kalkulasi total tagihan per anggota secara proporsional
  const calculations = useMemo(() => {
    const totalSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = session.taxAmount || 0;
    const tip = session.tipAmount || 0;
    const discount = session.discountAmount || 0;

    const memberDetails = members.map((member) => {
      let memberSubtotal = 0;
      const memberItems: {
        id: string;
        name: string;
        portionCount: number;
        totalPortions: number;
        cost: number;
      }[] = [];

      items.forEach((item) => {
        const alloc = item.allocations.find((a) => a.memberId === member.id);
        if (alloc && alloc.quantity > 0) {
          const totalAllocated = item.allocations.reduce((sum, a) => sum + a.quantity, 0);
          const shareCost =
            totalAllocated > 0
              ? Math.round((alloc.quantity / totalAllocated) * item.totalPrice)
              : 0;

          memberSubtotal += shareCost;
          memberItems.push({
            id: item.id,
            name: item.name,
            portionCount: alloc.quantity,
            totalPortions: totalAllocated,
            cost: shareCost,
          });
        }
      });

      const memberTax = totalSubtotal > 0 ? Math.round(memberSubtotal * (tax / totalSubtotal)) : 0;
      const memberTip = totalSubtotal > 0 ? Math.round(memberSubtotal * (tip / totalSubtotal)) : 0;
      const memberDiscount =
        totalSubtotal > 0 ? Math.round(memberSubtotal * (discount / totalSubtotal)) : 0;
      const memberGrandTotal = Math.max(0, memberSubtotal + memberTax + memberTip - memberDiscount);

      return {
        member,
        subtotal: memberSubtotal,
        tax: memberTax,
        tip: memberTip,
        discount: memberDiscount,
        grandTotal: memberGrandTotal,
        items: memberItems,
      };
    });

    return { totalSubtotal, tax, tip, discount, memberDetails };
  }, [items, members, session]);

  const activeMemberDetail =
    calculations.memberDetails.find((d) => d.member.id === selectedMemberId) ||
    calculations.memberDetails[0];

  const cleanSessionTitle = session.title.replace(/^PETE-PETE\s+/i, "");

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success("Link bon berhasil disalin!");
  };

  const handleShareLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Bon: ${cleanSessionTitle}`,
          text: `Cek rincian bon splitbill "${cleanSessionTitle}" di Ceban Pertama:`,
          url,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    handleCopyLink();
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleConfirmTransferWA = () => {
    if (!activeMemberDetail) return;
    const isPlaceholder = /^(saya(\s*\(owner\))?|gua|owner)$/i.test(activeMemberDetail.member.name.trim());
    const memberName = isPlaceholder && session.creatorName ? session.creatorName : activeMemberDetail.member.name;
    const text = `Halo, gua (${memberName}) udah transfer splitbill *${cleanSessionTitle}* sebesar *Rp ${activeMemberDetail.grandTotal.toLocaleString("id-ID")}* ya! Tolong dicek, thank you!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const formattedDate = useMemo(() => {
    try {
      const d = new Date(session.createdAt);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, [session.createdAt]);

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background text-text min-h-0 print:bg-white print:text-black print:overflow-visible print:h-auto">
      {/* Header Khusus Print/PDF (Hanya muncul saat dicetak ke PDF) */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-black text-black">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xl font-black tracking-tight block">CEBAN PERTAMA</span>
            <span className="text-xs text-black/60 uppercase tracking-widest font-semibold block mt-0.5">
              Bukti Tagihan Patungan Digital
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-black/60 font-mono block">Kode Sesi: {session.inviteCode}</span>
            <span className="text-xs text-black/60 block">{formattedDate}</span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-black/15 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold block">{cleanSessionTitle}</span>
            {session.merchantName && (
              <span className="text-xs text-black/70 block">{session.merchantName}</span>
            )}
          </div>
          <div className="text-right">
            <span className="text-3xs uppercase font-bold text-black/50 block">Status Patungan</span>
            <span className="text-xs font-bold uppercase">
              {session.status === "COMPLETED" ? "Selesai (Kelar)" : "Draft Berjalan"}
            </span>
          </div>
        </div>
      </div>

      {/* Screen Header Bar (Disembunyikan saat dicetak) */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Button
            onPress={() => router.back()}
            color="primary"
            size="sm"
            aria-label="Kembali"
            className="min-w-11 min-h-11 p-2 rounded-lg active:scale-95 transition-all shrink-0 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-sm font-extrabold text-text-50 leading-tight truncate">
                {cleanSessionTitle}
              </h1>
              <Badge
                color={session.status === "COMPLETED" ? "success" : "warning"}
                size="sm"
                type="pill-color"
                className="font-bold shrink-0 text-3xs px-2 py-0.5"
              >
                {session.status === "COMPLETED" ? "Kelar" : "Draft"}
              </Badge>
            </div>
            <p className="text-2xs text-text-300 leading-tight mt-0.5 flex items-center gap-1.5 truncate">
              {session.merchantName ? (
                <>
                  <span className="font-medium truncate">{session.merchantName}</span>
                  <span className="text-secondary-800 shrink-0">•</span>
                </>
              ) : null}
              {formattedDate ? (
                <>
                  <span className="shrink-0">{formattedDate}</span>
                  <span className="text-secondary-800 shrink-0">•</span>
                </>
              ) : null}
              <span className="shrink-0">
                Kode: <strong className="font-mono font-bold text-primary-400">{session.inviteCode}</strong>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            onPress={handlePrint}
            color="tertiary"
            size="sm"
            aria-label="Cetak atau simpan PDF"
            className="size-9 min-w-9 min-h-9 p-1.5 rounded-lg border border-secondary-800 text-text-300 hover:text-text-50 hover:bg-secondary-900 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </Button>
          <Button
            onPress={handleCopyLink}
            color="tertiary"
            size="sm"
            aria-label="Salin link bon"
            className="size-9 min-w-9 min-h-9 p-1.5 rounded-lg border border-secondary-800 text-text-300 hover:text-text-50 hover:bg-secondary-900 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy01 className="w-4 h-4" />
            )}
          </Button>
          <Button
            onPress={handleShareLink}
            color="tertiary"
            size="sm"
            aria-label="Bagikan link bon"
            className="size-9 min-w-9 min-h-9 p-1.5 rounded-lg border border-secondary-800 text-text-300 hover:text-text-50 hover:bg-secondary-900 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <Share07 className="w-4 h-4" />
          </Button>
          <Button
            onPress={() => setIsReceiptModalOpen(true)}
            color="tertiary"
            size="sm"
            aria-label="Download kartu bon digital"
            className="size-9 min-w-9 min-h-9 p-1.5 rounded-lg border border-secondary-800 text-primary-400 hover:text-primary-300 hover:bg-secondary-900 active:scale-95 transition-all flex items-center justify-center"
          >
            <Download01 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-3.5 sm:p-4 space-y-3.5 overflow-y-auto min-h-0 pb-16 print:p-0 print:m-0 print:overflow-visible print:pb-0">
        {/* Carousel Pilihan Anggota (Disembunyikan saat dicetak) */}
        <section aria-labelledby="member-select-title" className="space-y-2 print:hidden">
          <div className="flex items-center justify-between px-0.5">
            <h2 id="member-select-title" className="text-xs font-bold text-text-50 uppercase tracking-wider flex items-center gap-1.5">
              <User01 className="w-3.5 h-3.5 text-primary-400" />
              <span>Pilih Nama Lo</span>
            </h2>
            <span className="text-2xs text-text-400 font-medium">
              {members.length} Orang
            </span>
          </div>

          <div className="relative">
            {/* Scroll Indicator Shadow Kiri */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute left-0 top-0 bottom-2.5 w-6 bg-linear-to-r from-background to-transparent z-10 transition-opacity duration-150 ${canScrollLeft ? "opacity-100" : "opacity-0"
                }`}
            />

            <div
              ref={scrollContainerRef}
              onScroll={updateScrollIndicators}
              className="flex gap-2 overflow-x-auto pb-2 pt-0.5 px-0.5 scrollbar-hide"
            >
              {members.map((m) => {
                const isSelected = m.id === selectedMemberId;
                const detail = calculations.memberDetails.find((d) => d.member.id === m.id);
                const grandTotal = Math.round(detail?.grandTotal || 0);
                const isPlaceholder = /^(saya(\s*\(owner\))?|gua|owner)$/i.test(m.name.trim());
                const displayName = isPlaceholder && session.creatorName ? session.creatorName : m.name;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMemberId(m.id)}
                    aria-pressed={isSelected}
                    aria-label={`Pilih ${displayName}, total bagian Rp ${grandTotal.toLocaleString("id-ID")}`}
                    className={`group relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-100 cursor-pointer min-w-22 sm:min-w-24 shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${isSelected
                        ? "bg-brand-solid text-white border-white/20 shadow-sm"
                        : "bg-secondary-950/70 border-secondary-800 hover:border-secondary-700 text-text-50"
                      }`}
                  >
                    <div className="relative">
                      <Avatar
                        alt={displayName}
                        size="md"
                        className={`transition-transform duration-100 ${isSelected ? "ring-2 ring-white shadow-xs" : "border border-secondary-800"
                          }`}
                      />
                      {m.isPaid ? (
                        <span
                          className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full size-4 flex items-center justify-center border-2 border-background shadow-xs"
                          title="Udah Lunas"
                        >
                          <CheckCircle className="w-2.5 h-2.5 stroke-[2.5px]" />
                        </span>
                      ) : (
                        <span
                          className="absolute -top-1 -right-1 bg-secondary-800 text-text-300 rounded-full size-4 flex items-center justify-center border-2 border-background shadow-xs"
                          title="Belum Bayar"
                        >
                          <Clock className="w-2.5 h-2.5 stroke-[2.5px]" />
                        </span>
                      )}
                    </div>

                    <div className="w-full text-center min-w-0">
                      <span
                        className={`text-xs block truncate leading-tight font-bold ${isSelected ? "text-white" : "text-text-50"
                          }`}
                        title={displayName}
                      >
                        {displayName}
                      </span>
                      <span
                        className={`inline-block text-3xs font-semibold tabular-nums px-1.5 py-0.5 rounded-md mt-1 ${isSelected
                            ? "bg-white/20 text-white font-bold"
                            : "bg-secondary-900 text-text-300"
                          }`}
                      >
                        Rp {grandTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Scroll Indicator Shadow Kanan */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute right-0 top-0 bottom-2.5 w-6 bg-linear-to-l from-background to-transparent z-10 transition-opacity duration-150 ${canScrollRight ? "opacity-100" : "opacity-0"
                }`}
            />
          </div>
        </section>

        {/* KARTU BON DIGITAL (Rincian Anggota Terpilih) */}
        {activeMemberDetail && (() => {
          const isPlaceholder = /^(saya(\s*\(owner\))?|gua|owner)$/i.test(activeMemberDetail.member.name.trim());
          const displayName = isPlaceholder && session.creatorName ? session.creatorName : activeMemberDetail.member.name;

          return (
            <article className="rounded-2xl border border-secondary-800 bg-secondary-950/80 shadow-sm overflow-hidden space-y-0 print:border print:border-black/25 print:bg-white print:rounded-xl print:shadow-none print:text-black">
              {/* Header Kartu */}
              <div className="p-3.5 sm:p-4 border-b border-secondary-800 flex items-center justify-between gap-3 print:border-b print:border-black/15 print:bg-black/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="print:hidden">
                    <Avatar alt={displayName} size="md" className="border border-secondary-800 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-3xs font-semibold text-text-400 uppercase tracking-wider block print:text-black/60">
                      Rincian Tagihan Buat:
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold text-text-50 truncate leading-tight print:text-black print:text-lg">
                      {displayName}
                    </h2>
                  </div>
                </div>

                <Badge
                  color={activeMemberDetail.member.isPaid ? "success" : "warning"}
                  size="sm"
                  type="pill-color"
                  className="font-bold shrink-0 text-2xs px-2.5 py-0.5 print:border print:border-black print:bg-white print:text-black"
                >
                  {activeMemberDetail.member.isPaid ? "Udah Lunas" : "Belum Bayar"}
                </Badge>
              </div>

              {/* Rincian Pesanan Menu */}
              <div className="p-3.5 sm:p-4 space-y-3 print:p-4 print:space-y-4">
                <div className="flex items-center justify-between border-b border-secondary-800/40 pb-2 print:border-b print:border-black/15">
                  <span className="text-2xs font-bold text-text-400 uppercase tracking-wider print:text-black/80">
                    Daftar Menu Yang Dipesen
                  </span>
                  <span className="text-2xs text-text-400 font-medium print:text-black/60">
                    {activeMemberDetail.items.length} item
                  </span>
                </div>

                {activeMemberDetail.items.length === 0 ? (
                  <div className="p-3 rounded-xl bg-secondary-900/40 border border-secondary-800/60 text-center print:bg-black/5 print:border-black/15">
                    <p className="text-xs text-text-400 italic print:text-black/60">
                      Belum ada menu yang dipilih buat nama ini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 print:space-y-2">
                    {activeMemberDetail.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-secondary-900/50 border border-secondary-800/60 flex items-center justify-between gap-2 print:bg-transparent print:border-b print:border-black/10 print:rounded-none print:px-0 print:py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-text-50 block truncate print:text-black print:text-sm">
                            {item.name}
                          </span>
                          <span className="text-3xs text-text-400 block mt-0.5 print:text-black/70">
                            {item.portionCount === item.totalPortions && item.totalPortions === 1
                              ? "1 porsi penuh"
                              : `${item.portionCount} dari ${item.totalPortions} porsi`}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-text-50 tabular-nums whitespace-nowrap shrink-0 print:text-black print:text-sm">
                          Rp {item.cost.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtotal, Pajak, Diskon Breakdown */}
                <div className="pt-2 border-t border-secondary-800 space-y-1.5 text-xs print:border-t-2 print:border-black/15 print:pt-3">
                  <div className="flex justify-between text-text-300 print:text-black/80">
                    <span>Subtotal Menu</span>
                    <span className="font-semibold tabular-nums text-text-50 print:text-black">
                      Rp {activeMemberDetail.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {activeMemberDetail.tax > 0 && (
                    <div className="flex justify-between text-text-300 print:text-black/80">
                      <span>Pajak Resto</span>
                      <span className="font-semibold tabular-nums text-text-50 print:text-black">
                        Rp {activeMemberDetail.tax.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                  {activeMemberDetail.tip > 0 && (
                    <div className="flex justify-between text-text-300 print:text-black/80">
                      <span>Servis / Tip</span>
                      <span className="font-semibold tabular-nums text-text-50 print:text-black">
                        Rp {activeMemberDetail.tip.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                  {activeMemberDetail.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 print:text-emerald-700">
                      <span className="font-medium">Diskon / Promo</span>
                      <span className="font-bold tabular-nums">
                        - Rp {activeMemberDetail.discount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                  {/* Total Tagihan Box */}
                  <div className="p-3 rounded-xl bg-secondary-900 border border-secondary-800 flex justify-between items-center mt-2 print:bg-black/5 print:border-2 print:border-black print:p-3 print:rounded-lg">
                    <div>
                      <span className="text-2xs font-bold text-text-400 uppercase tracking-wider block print:text-black print:text-xs">
                        Total Yang Mesti Lo Bayar
                      </span>
                      <span className="text-3xs text-text-300 block mt-0.5 print:hidden">
                        {activeMemberDetail.member.isPaid
                          ? "Udah lunas dibayar"
                          : "Belum ditransfer ke yang nalangin"}
                      </span>
                    </div>
                    <span className="text-base sm:text-lg font-black text-text-50 tabular-nums print:text-black print:text-xl">
                      Rp {activeMemberDetail.grandTotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Action Buttons (Hanya untuk Layar, tidak dicetak) */}
                <div className="space-y-2 pt-1 print:hidden">
                  <Button
                    onPress={handleConfirmTransferWA}
                    color="primary"
                    size="lg"
                    iconLeading={Share07}
                    className="w-full min-h-11 py-3 text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    Kirim Bukti Transfer ke Temen Lo
                  </Button>

                  <Button
                    onPress={() => setIsReceiptModalOpen(true)}
                    color="secondary"
                    size="md"
                    iconLeading={ReceiptCheck}
                    className="w-full min-h-9 py-2 text-xs cursor-pointer"
                  >
                    Cetak / Simpan Bon Digital (PDF)
                  </Button>
                </div>
              </div>
            </article>
          );
        })()}

        {/* Transparansi Semua Menu Struk (Disembunyikan saat print agar dokumen cetak fokus dan tidak boros halaman) */}
        <section aria-label="Transparansi Semua Menu Struk" className="rounded-2xl border border-secondary-800 bg-secondary-950/60 p-3.5 space-y-2.5 print:hidden">
          <button
            type="button"
            onClick={() => setShowAllItems(!showAllItems)}
            aria-expanded={showAllItems}
            className="w-full flex items-center justify-between text-left cursor-pointer group active:scale-[0.99] transition-transform duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <ReceiptCheck className="w-4 h-4 text-primary-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-text-50 block group-hover:text-primary-400 transition-colors">
                  Transparansi Semua Menu Struk
                </span>
                <span className="text-2xs text-text-400 block">
                  Total {items.length} menu • Rp {session.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
            <span
              className={`p-1 text-text-400 group-hover:text-text-50 transition-transform duration-150 ease-out ${showAllItems ? "rotate-180" : "rotate-0"
                }`}
            >
              <ChevronDown className="w-4 h-4" />
            </span>
          </button>

          {showAllItems && (
            <div className="space-y-2 pt-2 border-t border-secondary-800">
              {items.map((item) => {
                const allocatedMembers = item.allocations
                  .filter((a) => a.quantity > 0)
                  .map((a) => {
                    const m = members.find((mem) => mem.id === a.memberId);
                    return m ? { member: m, quantity: a.quantity } : null;
                  })
                  .filter((x): x is { member: BonMember; quantity: number } => x !== null);

                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-secondary-900/40 border border-secondary-800/70 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-text-50 block leading-snug truncate">
                          {item.name}
                        </span>
                        <span className="text-3xs text-text-400 font-medium block mt-0.5">
                          {item.quantity}x @ Rp {item.unitPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-text-50 whitespace-nowrap tabular-nums">
                        Rp {item.totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-secondary-800/50 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-3xs font-semibold text-text-400 uppercase tracking-wider shrink-0">
                        Dibagi:
                      </span>
                      {allocatedMembers.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap justify-end flex-1 min-w-0">
                          {allocatedMembers.map(({ member, quantity }) => (
                            <div
                              key={member.id}
                              className="inline-flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-md bg-secondary-900 border border-secondary-800 text-3xs"
                            >
                              <Avatar
                                alt={member.name}
                                size="xs"
                                className="size-4 shrink-0"
                              />
                              <span className="font-medium text-text-50 max-w-20 truncate">
                                {member.name}
                              </span>
                              <span className="text-text-400 font-bold">
                                • {quantity} porsi
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-3xs text-text-400 italic">
                          Belum dibagi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Print Only Footer */}
        <div className="hidden print:block text-center text-xs text-black/60 pt-6 mt-6 border-t border-black/15">
          <p className="font-semibold text-black">CEBAN PERTAMA</p>
          <p className="mt-0.5">Dokumen ini merupakan bukti pembagian tagihan patungan digital yang sah.</p>
        </div>
      </div>

      {/* Docked Footer (Layar) */}
      <footer className="shrink-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-secondary-800 bg-background/95 backdrop-blur-md z-20 text-center print:hidden">
        <p className="text-xs text-text-400">
          Splitbill anti drama pakai{" "}
          <Link href="/" className="font-extrabold text-primary-400 hover:underline">
            Ceban Pertama
          </Link>
        </p>
      </footer>

      {/* Modal Kartu Bon Digital */}
      {activeMemberDetail && (
        <DigitalReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          data={{
            title: session.title,
            merchantName: session.merchantName,
            date: new Date(session.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            inviteCode: session.inviteCode,
            memberName:
              /^(saya(\s*\(owner\))?|gua|owner)$/i.test(activeMemberDetail.member.name.trim()) && session.creatorName
                ? session.creatorName
                : activeMemberDetail.member.name,
            isPaid: activeMemberDetail.member.isPaid,
            items: activeMemberDetail.items,
            subtotal: activeMemberDetail.subtotal,
            tax: activeMemberDetail.tax,
            tip: activeMemberDetail.tip,
            discount: activeMemberDetail.discount,
            grandTotal: activeMemberDetail.grandTotal,
          }}
        />
      )}
    </main>
  );
}
