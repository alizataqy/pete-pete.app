"use client";

import React, { useRef, useState } from "react";
import { ModalOverlay, Modal, Dialog } from "./modal";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import {
  Download01,
  Printer,
  XClose,
  ReceiptCheck,
} from "@untitledui/icons";
import { toast } from "sonner";

export interface ReceiptItem {
  id: string;
  name: string;
  portionCount: number;
  totalPortions: number;
  cost: number;
}

export interface DigitalReceiptData {
  title: string;
  merchantName?: string | null;
  date: string;
  inviteCode: string;
  memberName: string;
  isPaid: boolean;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  discount: number;
  grandTotal: number;
  bankName?: string | null;
  bankAccount?: string | null;
  bankOwner?: string | null;
}

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DigitalReceiptData;
}

export default function DigitalReceiptModal({
  isOpen,
  onClose,
  data,
}: DigitalReceiptModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const cleanTitle = data.title.replace(/^PETE-PETE\s+/i, "");

  // Ekspor kartu struk digital ke gambar PNG dengan Canvas 2x Retina
  const handleDownloadImage = async () => {
    try {
      setIsExporting(true);

      const scale = 2; // Retina sharpness
      const width = 420;
      // Perkirakan tinggi dinamis berdasarkan jumlah item
      const itemRowHeight = 28;
      const baseHeight = 520;
      const height = baseHeight + data.items.length * itemRowHeight;

      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Gagal menginisialisasi canvas");

      ctx.scale(scale, scale);

      // 1. Background Kartu Struk
      ctx.fillStyle = "#0c111d"; // background-950
      ctx.fillRect(0, 0, width, height);

      // Border luar
      ctx.strokeStyle = "#1f242f";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(8, 8, width - 16, height - 16);

      // Header Banner
      ctx.fillStyle = "#161b26"; // secondary-900
      ctx.fillRect(8, 8, width - 16, 80);

      // Branding App
      ctx.fillStyle = "#f59e0b"; // primary-400
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.fillText("CEBAN PERTAMA • BON DIGITAL", 24, 32);

      // Judul Sesi / Lokasi
      ctx.fillStyle = "#fcfcfd"; // text-50
      ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
      const displayTitle = data.merchantName ? `${cleanTitle} • ${data.merchantName}` : cleanTitle;
      ctx.fillText(displayTitle.slice(0, 36), 24, 54);

      ctx.fillStyle = "#94969c"; // text-400
      ctx.font = "10px system-ui, -apple-system, sans-serif";
      ctx.fillText(`Tanggal: ${data.date} • Kode: #${data.inviteCode}`, 24, 72);

      // Status Badge (Lunas / Belum Lunas)
      const badgeText = data.isPaid ? "LUNAS" : "BELUM LUNAS";
      const badgeWidth = data.isPaid ? 64 : 96;
      ctx.fillStyle = data.isPaid ? "#053321" : "#371e03";
      ctx.strokeStyle = data.isPaid ? "#12b76a" : "#f79009";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width - badgeWidth - 24, 28, badgeWidth, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = data.isPaid ? "#32d583" : "#fdb022";
      ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(badgeText, width - 24 - badgeWidth / 2, 43);
      ctx.textAlign = "left";

      // Nama Member Penerima Bon
      let curY = 112;
      ctx.fillStyle = "#94969c";
      ctx.font = "11px system-ui, -apple-system, sans-serif";
      ctx.fillText("Tagihan Atas Nama:", 24, curY);

      ctx.fillStyle = "#fcfcfd";
      ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
      ctx.fillText(data.memberName, 24, curY + 20);

      // Garis perforasi struk (Dashed Line)
      curY += 36;
      ctx.strokeStyle = "#344054";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(24, curY);
      ctx.lineTo(width - 24, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Judul Kolom Pesanan
      curY += 20;
      ctx.fillStyle = "#667085";
      ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
      ctx.fillText("MENU PESANAN", 24, curY);
      ctx.textAlign = "right";
      ctx.fillText("BIAYA", width - 24, curY);
      ctx.textAlign = "left";

      // Daftar Item
      curY += 8;
      data.items.forEach((item) => {
        curY += 22;
        ctx.fillStyle = "#eaecf0";
        ctx.font = "500 12px system-ui, -apple-system, sans-serif";
        const itemName = item.name.length > 28 ? `${item.name.slice(0, 26)}...` : item.name;
        ctx.fillText(itemName, 24, curY);

        // Portion subtitle
        const portionStr = item.portionCount === item.totalPortions && item.totalPortions === 1
          ? "1 porsi"
          : `${item.portionCount}/${item.totalPortions} porsi`;
        ctx.fillStyle = "#94969c";
        ctx.font = "10px system-ui, -apple-system, sans-serif";
        ctx.fillText(`(${portionStr})`, 24 + ctx.measureText(itemName).width + 6, curY);

        ctx.fillStyle = "#fcfcfd";
        ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`Rp ${item.cost.toLocaleString("id-ID")}`, width - 24, curY);
        ctx.textAlign = "left";
      });

      // Garis perforasi kedua
      curY += 20;
      ctx.strokeStyle = "#344054";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(24, curY);
      ctx.lineTo(width - 24, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rincian Biaya
      const drawFeeRow = (label: string, value: string, isDiscount = false) => {
        curY += 20;
        ctx.fillStyle = isDiscount ? "#32d583" : "#94969c";
        ctx.font = "11px system-ui, -apple-system, sans-serif";
        ctx.fillText(label, 24, curY);
        ctx.textAlign = "right";
        ctx.fillText(value, width - 24, curY);
        ctx.textAlign = "left";
      };

      drawFeeRow("Subtotal Menu", `Rp ${data.subtotal.toLocaleString("id-ID")}`);
      if (data.tax > 0) drawFeeRow("Porsi Pajak", `+ Rp ${data.tax.toLocaleString("id-ID")}`);
      if (data.tip > 0) drawFeeRow("Porsi Servis / Tip", `+ Rp ${data.tip.toLocaleString("id-ID")}`);
      if (data.discount > 0) drawFeeRow("Porsi Diskon / Promo", `- Rp ${data.discount.toLocaleString("id-ID")}`, true);

      // Kotak Total Tagihan
      curY += 16;
      ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
      ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(24, curY, width - 48, 48, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fcfcfd";
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.fillText("TOTAL YANG MESTI DIBAYAR", 36, curY + 22);

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`Rp ${data.grandTotal.toLocaleString("id-ID")}`, width - 36, curY + 31);
      ctx.textAlign = "left";

      // Info Transfer Bank
      curY += 66;
      if (data.bankName && data.bankAccount) {
        ctx.fillStyle = "#161b26";
        ctx.beginPath();
        ctx.roundRect(24, curY, width - 48, 54, 8);
        ctx.fill();

        ctx.fillStyle = "#94969c";
        ctx.font = "10px system-ui, -apple-system, sans-serif";
        ctx.fillText("Tujuan Transfer:", 36, curY + 20);

        ctx.fillStyle = "#fcfcfd";
        ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
        ctx.fillText(`${data.bankName} - ${data.bankAccount}`, 36, curY + 38);

        if (data.bankOwner) {
          ctx.fillStyle = "#94969c";
          ctx.font = "10px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(`A/N ${data.bankOwner}`, width - 36, curY + 38);
          ctx.textAlign = "left";
        }
        curY += 54;
      }

      // Footer
      curY += 20;
      ctx.fillStyle = "#475467";
      ctx.font = "10px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Splitbill gampang & anti drama • cebanpertama.com", width / 2, curY);

      // Download file PNG
      const link = document.createElement("a");
      const safeName = data.memberName.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `bon-${cleanTitle}-${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Kartu bon berhasil diunduh sebagai gambar!");
    } catch (err) {
      console.error("Gagal ekspor gambar:", err);
      toast.error("Gagal mendownload gambar struk. Coba lagi ya, Bos!");
    } finally {
      setIsExporting(false);
    }
  };

  // Cetak / Ekspor PDF langsung via native browser print
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onClose}>
      <Modal className="w-full max-w-md overflow-hidden bg-background text-text p-0 border border-secondary-800 rounded-2xl shadow-2xl">
        <Dialog className="outline-hidden">
          {({ close }) => (
            <div className="flex flex-col max-h-[85vh]">
              {/* Header Modal */}
              <div className="px-5 py-4 border-b border-secondary-800 flex items-center justify-between bg-secondary-950/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400">
                    <ReceiptCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-50">
                      Kartu Bon Digital
                    </h3>
                    <p className="text-2xs text-text-400">
                      Siap lo download gambar atau cetak PDF
                    </p>
                  </div>
                </div>
                <Button
                  onPress={close}
                  color="tertiary"
                  size="sm"
                  aria-label="Tutup modal"
                  className="size-8 p-1 rounded-lg text-text-400 hover:text-text hover:bg-secondary-900"
                >
                  <XClose className="w-4 h-4" />
                </Button>
              </div>

              {/* Scrollable Receipt Preview */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-background-950">
                {/* Kartu Struk Visual */}
                <div
                  id="receipt-card-print"
                  ref={cardRef}
                  className="rounded-2xl border border-secondary-800 bg-secondary-950/90 shadow-md p-5 space-y-4 text-xs relative overflow-hidden"
                >
                  {/* Perforasi Efek Kartu Atas */}
                  <div className="flex items-center justify-between border-b border-secondary-800/80 pb-3">
                    <div>
                      <span className="text-3xs font-extrabold text-primary-400 uppercase tracking-widest block">
                        CEBAN PERTAMA • BON SPLITBILL
                      </span>
                      <h4 className="text-base font-black text-text-50 mt-0.5">
                        {cleanTitle}
                      </h4>
                      {data.merchantName && (
                        <p className="text-2xs text-text-300">
                          {data.merchantName}
                        </p>
                      )}
                    </div>
                    <Badge
                      color={data.isPaid ? "success" : "warning"}
                      size="sm"
                      type="pill-color"
                      className="font-bold shrink-0 text-2xs"
                    >
                      {data.isPaid ? "Udah Lunas" : "Belum Bayar"}
                    </Badge>
                  </div>

                  {/* Info Tagihan Member */}
                  <div className="flex justify-between items-center text-2xs text-text-400">
                    <div>
                      <span>Untuk: </span>
                      <strong className="text-text-100 font-bold">{data.memberName}</strong>
                    </div>
                    <span>Kode: #{data.inviteCode}</span>
                  </div>

                  {/* Garis Putus-putus Struk */}
                  <div className="border-t border-dashed border-secondary-700/60 my-2" />

                  {/* Daftar Item Menu */}
                  <div className="space-y-2">
                    <span className="text-3xs font-bold text-text-400 uppercase tracking-wider block">
                      Rincian Menu Yang Dipesan:
                    </span>
                    {data.items.length === 0 ? (
                      <p className="text-2xs text-text-400 italic">
                        Belum ada menu yang dialokasikan
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {data.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center text-xs"
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <span className="text-text-100 font-medium block truncate">
                                {item.name}
                              </span>
                              <span className="text-3xs text-text-400">
                                {item.portionCount === item.totalPortions && item.totalPortions === 1
                                  ? "1 porsi"
                                  : `${item.portionCount}/${item.totalPortions} porsi`}
                              </span>
                            </div>
                            <span className="font-semibold text-text-200 tabular-nums shrink-0">
                              Rp {item.cost.toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Garis Putus-putus Struk */}
                  <div className="border-t border-dashed border-secondary-700/60 my-2" />

                  {/* Breakdown Pajak, Servis, Diskon */}
                  <div className="space-y-1 text-2xs text-text-300">
                    <div className="flex justify-between">
                      <span>Subtotal Menu</span>
                      <span className="font-semibold tabular-nums">
                        Rp {data.subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                    {data.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Porsi Pajak</span>
                        <span className="font-semibold tabular-nums">
                          + Rp {data.tax.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                    {data.tip > 0 && (
                      <div className="flex justify-between">
                        <span>Porsi Servis / Tip</span>
                        <span className="font-semibold tabular-nums">
                          + Rp {data.tip.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                    {data.discount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>Porsi Diskon / Promo</span>
                        <span className="font-semibold tabular-nums">
                          - Rp {data.discount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Grand Total Box */}
                  <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/25 flex justify-between items-center mt-3">
                    <span className="text-xs font-bold text-text-50">
                      Total Bayar
                    </span>
                    <span className="text-base font-black text-primary-400 tabular-nums">
                      Rp {data.grandTotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Detail Rekening Pembayaran */}
                  {data.bankName && data.bankAccount && (
                    <div className="p-3 rounded-xl bg-secondary-900/60 border border-secondary-800 text-2xs space-y-1">
                      <span className="text-3xs font-semibold text-text-400 uppercase tracking-wider block">
                        Tujuan Transfer:
                      </span>
                      <div className="flex justify-between items-center text-text-100 font-bold">
                        <span>{data.bankName}</span>
                        <span>{data.bankAccount}</span>
                      </div>
                      {data.bankOwner && (
                        <p className="text-text-400 text-3xs">
                          A/N: {data.bankOwner}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <p className="text-3xs text-text-400">
                      Splitbill anti ribet pakai cebanpertama.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 border-t border-secondary-800 bg-secondary-950 flex gap-2.5">
                <Button
                  onPress={handleDownloadImage}
                  color="primary"
                  size="md"
                  isDisabled={isExporting}
                  className="flex-1 font-bold shadow-md shadow-primary/20"
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <Download01 className="w-4 h-4" />
                    <span>{isExporting ? "Menyimpan..." : "Unduh Gambar (PNG)"}</span>
                  </span>
                </Button>

                <Button
                  onPress={handlePrintPdf}
                  color="secondary"
                  size="md"
                  className="flex-1 font-bold"
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <Printer className="w-4 h-4 text-primary-400" />
                    <span>Cetak / PDF</span>
                  </span>
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
