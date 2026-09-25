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
  ChevronUp,
  ReceiptCheck,
  User01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  bankName: string | null;
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
        (m) => m.id === preselectedMemberId || m.name.toLowerCase() === preselectedMemberId.toLowerCase()
      );
      if (match) return match.id;
    }
    return members[0]?.id || "";
  }, [members, preselectedMemberId]);

  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMember);
  const [showAllItems, setShowAllItems] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Ref & status scroll untuk efek shadow di tepi kiri & kanan carousel anggota
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
          const shareCost = totalAllocated > 0
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
      const memberGrandTotal = memberSubtotal + memberTax + memberTip;

      return {
        member,
        subtotal: memberSubtotal,
        tax: memberTax,
        tip: memberTip,
        grandTotal: memberGrandTotal,
        items: memberItems,
      };
    });

    return { totalSubtotal, tax, tip, memberDetails };
  }, [items, members, session]);

  const activeMemberDetail = calculations.memberDetails.find(
    (d) => d.member.id === selectedMemberId
  ) || calculations.memberDetails[0];

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
          text: `Cek rincian bon patungan "${cleanSessionTitle}" di Ceban Pertama:`,
          url,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    handleCopyLink();
  };

  const handleConfirmTransferWA = () => {
    if (!activeMemberDetail) return;
    const cleanTitle = session.title.replace(/^PETE-PETE\s+/i, "");
    const text = `Halo, gua (${activeMemberDetail.member.name}) udah transfer patungan *${cleanTitle}* sebesar *Rp ${activeMemberDetail.grandTotal.toLocaleString("id-ID")}* ya! Tolong dicek, thank you!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const cleanSessionTitle = session.title.replace(/^PETE-PETE\s+/i, "");

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background text-text min-h-0">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-3 sm:px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button
            onPress={() => router.back()}
            color="primary"
            size="sm"
            aria-label="Kembali"
            className="size-10 min-w-10 min-h-10 p-2 rounded-lg active:scale-95 transition-all shrink-0 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-sm font-extrabold text-text-50 leading-tight">
                {cleanSessionTitle}
              </h1>
              <Badge
                color={session.status === "COMPLETED" ? "success" : "warning"}
                size="sm"
                type="pill-color"
                className="font-bold shrink-0 text-2xs px-1.5 py-0.5"
              >
                {session.status === "COMPLETED" ? "Kelar" : "Draft"}
              </Badge>
            </div>
            <p className="text-2xs text-text-400 leading-tight mt-0.5 flex items-center gap-1.5">
              {session.merchantName ? (
                <>
                  <span className="text-text-300 font-medium">{session.merchantName}</span>
                  <span className="text-secondary-700">•</span>
                </>
              ) : null}
              <span>
                Kode: <strong className="font-mono font-bold text-primary-400">{session.inviteCode}</strong>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            onPress={handleCopyLink}
            color="tertiary"
            size="sm"
            aria-label="Salin link bon"
            className="size-9 min-w-9 min-h-9 p-1.5 rounded-lg border border-secondary-800 text-text-300 hover:text-text hover:bg-secondary-900 active:scale-95 transition-all flex items-center justify-center"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy01 className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            onPress={handleShareLink}
            color="tertiary"
            size="sm"
            aria-label="Bagikan link bon"
            className="size-9 min-w-9 min-h-9 p-1.5 rounded-lg border border-secondary-800 text-text-300 hover:text-text hover:bg-secondary-900 active:scale-95 transition-all flex items-center justify-center"
          >
            <Share07 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0 pb-16">
        {/* Pemilihan Nama Anggota ("Pilih Nama Lo") */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-bold text-text-100 uppercase tracking-wider flex items-center gap-1.5">
              <User01 className="w-3.5 h-3.5 text-primary-400" />
              <span>Pilih Nama Lo Buat Cek Bagian</span>
            </h2>
            <span className="text-2xs text-text-400 font-medium">
              {members.length} Orang
            </span>
          </div>

          <div className="relative">
            {/* Shadow tepi kiri */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute left-0 top-0 bottom-3 w-8 bg-linear-to-r from-background via-background/70 to-transparent z-10 transition-opacity duration-200 ${canScrollLeft ? "opacity-100" : "opacity-0"
                }`}
            />

            <div
              ref={scrollContainerRef}
              onScroll={updateScrollIndicators}
              className="flex gap-2.5 overflow-x-auto pb-3 pt-1.5 px-0.5 scrollbar-hide"
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
                    aria-label={`Pilih ${displayName}, total tagihan Rp ${grandTotal.toLocaleString("id-ID")}`}
                    className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-150 cursor-pointer min-w-24 sm:min-w-26 shrink-0 active:scale-[0.96] ${isSelected
                        ? "bg-primary-500/15 border-primary-500/80 shadow-md shadow-primary-500/10 ring-1 ring-primary-500/40"
                        : "bg-secondary-950/60 border-secondary-800/90 hover:border-secondary-700 hover:bg-secondary-900/50 shadow-xs"
                      }`}
                  >
                    <div className="relative">
                      <Avatar
                        alt={displayName}
                        size="lg"
                        className={`shadow-xs transition-transform duration-150 ${isSelected
                            ? "scale-105 ring-2 ring-primary-500 ring-offset-2 ring-offset-secondary-950"
                            : "border border-secondary-800"
                          }`}
                      />
                      {m.isPaid ? (
                        <span
                          className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-secondary-950 shadow-xs"
                          title="Udah Lunas"
                        >
                          <CheckCircle className="w-3 h-3 stroke-[2.5px]" />
                        </span>
                      ) : (
                        <span
                          className="absolute -top-1 -right-1 bg-secondary-800 text-text-400 rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-secondary-950 shadow-xs"
                          title="Belum Lunas"
                        >
                          <Clock className="w-3 h-3 stroke-[2.5px]" />
                        </span>
                      )}
                    </div>

                    <div className="w-full text-center min-w-0 space-y-0.5">
                      <span
                        className={`text-xs block wrap-break-word leading-tight transition-colors ${isSelected ? "text-primary-300 font-extrabold" : "text-text-100 font-semibold"
                          }`}
                        title={displayName}
                      >
                        {displayName}
                      </span>
                      <span
                        className={`inline-block text-2xs font-bold tabular-nums px-2 py-0.5 rounded-full border transition-all ${isSelected
                            ? "bg-primary-500/20 border-primary-500/40 text-primary-200"
                            : "bg-secondary-900/80 border-secondary-800/80 text-text-300"
                          }`}
                      >
                        Rp {grandTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Shadow tepi kanan */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute right-0 top-0 bottom-3 w-8 bg-linear-to-l from-background via-background/70 to-transparent z-10 transition-opacity duration-200 ${canScrollRight ? "opacity-100" : "opacity-0"
                }`}
            />
          </div>
        </div>

        {/* Card Rincian Tagihan Personal Anggota Terpilih */}
        {activeMemberDetail && (() => {
          const isPlaceholder = /^(saya(\s*\(owner\))?|gua|owner)$/i.test(activeMemberDetail.member.name.trim());
          const displayName = isPlaceholder && session.creatorName ? session.creatorName : activeMemberDetail.member.name;

          return (
            <div className="p-4 rounded-2xl border border-secondary-800 bg-secondary-950/70 space-y-4 shadow-sm ring-1 ring-primary-500/15">
              <div className="flex items-center justify-between border-b border-secondary-800/80 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar alt={displayName} size="md" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-text-50 wrap-break-word">
                      {displayName}
                    </h3>
                    <p className="text-2xs text-text-400 mt-0.5">
                      {activeMemberDetail.items.length} menu makanan/minuman
                    </p>
                  </div>
                </div>
                <Badge
                  color={activeMemberDetail.member.isPaid ? "success" : "warning"}
                  size="sm"
                  type="pill-color"
                  className="font-bold shrink-0 text-2xs"
                >
                  {activeMemberDetail.member.isPaid ? "Udah Lunas" : "Belum Bayar"}
                </Badge>
              </div>

              {/* Menu-menu yang dimakan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-text-400 uppercase tracking-wider">
                    Menu Yang Lo Pesen
                  </span>
                  <span className="text-2xs font-medium text-text-400">
                    {activeMemberDetail.items.length} item
                  </span>
                </div>
                {activeMemberDetail.items.length === 0 ? (
                  <p className="text-xs text-text-400 italic py-2">
                    Belum ada menu yang dialokasiin buat nama ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeMemberDetail.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-secondary-900/30 hover:bg-secondary-900/50 border border-secondary-800/80 hover:border-secondary-700/80 transition-all flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-text-50 block wrap-break-word">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center text-3xs font-semibold text-primary-400 bg-primary-500/10 border border-primary-500/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                              {item.portionCount === item.totalPortions && item.totalPortions === 1
                                ? "1 porsi penuh"
                                : `${item.portionCount} dari ${item.totalPortions} porsi`}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-extrabold text-primary-400 whitespace-nowrap tabular-nums shrink-0">
                          Rp {item.cost.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rincian Biaya & Grand Total */}
              <div className="space-y-2 pt-2 border-t border-secondary-800/80 text-xs">
                <div className="space-y-1.5 px-0.5">
                  <div className="flex justify-between text-text-300 text-xs">
                    <span>Subtotal Menu</span>
                    <span className="font-semibold tabular-nums text-text-200">
                      Rp {activeMemberDetail.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {activeMemberDetail.tax > 0 && (
                    <div className="flex justify-between text-text-300 text-xs">
                      <span>Porsi Pajak</span>
                      <span className="font-semibold tabular-nums text-text-200">
                        Rp {activeMemberDetail.tax.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  {activeMemberDetail.tip > 0 && (
                    <div className="flex justify-between text-text-300 text-xs">
                      <span>Porsi Servis / Tip</span>
                      <span className="font-semibold tabular-nums text-text-200">
                        Rp {activeMemberDetail.tip.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-primary-500/10 border border-primary-500/20 flex justify-between items-center mt-2.5 shadow-xs">
                  <div>
                    <span className="text-xs font-bold text-text-50 block">
                      Total Yang Mesti Lo Bayar
                    </span>
                    <span className="text-2xs text-text-400 block mt-0.5">
                      {activeMemberDetail.member.isPaid ? "Udah beres dibayar" : "Belum ditransfer ke yang nalangin"}
                    </span>
                  </div>
                  <span className="text-base sm:text-lg font-black text-primary-400 tabular-nums">
                    Rp {activeMemberDetail.grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Tombol Konfirmasi Transfer via WhatsApp */}
              <Button
                onPress={handleConfirmTransferWA}
                color="primary"
                size="lg"
                className="w-full min-h-12 py-3.5 text-sm font-bold active:scale-[0.96] transition-transform shadow-md shadow-primary/20"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Share07 className="w-4 h-4 shrink-0" />
                  <span>Kirim Bukti Transfer ke Temen Lo</span>
                </span>
              </Button>
            </div>
          );
        })()}

        {/* Transparansi Seluruh Struk (Accordion) */}
        <div className="p-3.5 rounded-2xl border border-secondary-800 bg-secondary-950/40 space-y-3">
          <button
            type="button"
            onClick={() => setShowAllItems(!showAllItems)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ReceiptCheck className="w-4 h-4 text-primary-400" />
              <div>
                <span className="text-xs font-bold text-text-100 block">
                  Transparansi Semua Menu Struk
                </span>
                <span className="text-2xs text-text-400 block">
                  Total {items.length} menu • Rp {session.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
            {showAllItems ? (
              <ChevronUp className="w-4 h-4 text-text-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-400" />
            )}
          </button>

          {showAllItems && (
            <div className="space-y-2 pt-2 border-t border-secondary-800/80">
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
                    className="p-3 rounded-xl bg-secondary-950/60 border border-secondary-800/70 hover:border-secondary-700/80 transition-all space-y-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-text-50 block leading-snug wrap-break-word">
                          {item.name}
                        </span>
                        <span className="text-2xs text-text-400 font-medium block mt-0.5">
                          {item.quantity}x @ Rp {item.unitPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <span className="text-xs font-black text-primary-400 whitespace-nowrap tabular-nums">
                        Rp {item.totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-secondary-800/60 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-2xs font-bold text-text-400 uppercase tracking-wider shrink-0">
                        Dibagi:
                      </span>
                      {allocatedMembers.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap justify-end flex-1 min-w-0">
                          {allocatedMembers.map(({ member, quantity }) => (
                            <div
                              key={member.id}
                              className="inline-flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-secondary-900/90 border border-secondary-800 text-2xs shadow-xs"
                            >
                              <Avatar
                                alt={member.name}
                                size="xs"
                                className="size-5 shrink-0 ring-1 ring-secondary-800"
                              />
                              <span className="font-semibold text-text-100 max-w-20 wrap-break-word leading-tight">
                                {member.name}
                              </span>
                              <span className="text-3xs font-bold text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                {quantity} porsi
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-2xs text-text-400 italic">
                          Belum dibagi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Docked Footer CTA to Home/App */}
      <footer className="shrink-0 p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t border-secondary-800 bg-secondary-950/95 backdrop-blur-md z-20 text-center">
        <p className="text-xs text-text-400">
          Patungan anti drama pakai{" "}
          <Link href="/" className="font-extrabold text-primary-400 hover:underline">
            Ceban Pertama
          </Link>
        </p>
      </footer>
    </main>
  );
}
