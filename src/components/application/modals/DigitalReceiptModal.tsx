"use client";

import { ModalOverlay, Modal, Dialog } from "./modal";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import {
  Printer,
  XClose,
  ReceiptCheck,
} from "@untitledui/icons";

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
  const cleanTitle = data.title.replace(/^PETE-PETE\s+/i, "");

  // Cetak / Ekspor PDF langsung via native browser print
  const handlePrintPdf = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 100);
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
                      Siap lo cetak atau simpan ke PDF
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
                {/* Kartu Struk Visual (Tactile Ticket Style) */}
                <div
                  id="receipt-card-print"
                  className="rounded-2xl border border-secondary-800 bg-secondary-950/90 shadow-xl p-5 space-y-4 text-xs relative overflow-hidden before:absolute before:-left-3 before:top-32 before:size-6 before:rounded-full before:bg-background-950 before:border-r before:border-secondary-800 after:absolute after:-right-3 after:top-32 after:size-6 after:rounded-full after:bg-background-950 after:border-l after:border-secondary-800"
                >
                  {/* Perforasi Efek Kartu Atas */}
                  <div className="flex items-center justify-between border-b border-secondary-800/80 pb-3">
                    <div>
                      <span className="text-3xs font-extrabold text-primary-400 uppercase tracking-widest block">
                        PETE-PETE • BON SPLITBILL
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
                      color={data.isPaid ? "success" : "secondary"}
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

                  {/* Garis Putus-putus Struk (Perforation) */}
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
                      <div className="space-y-2">
                        {data.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-start text-xs gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-text-100 font-medium block truncate">
                                {item.name}
                              </span>
                              <span className="text-3xs text-text-400 font-normal">
                                {item.portionCount === item.totalPortions && item.totalPortions === 1
                                  ? "1 porsi"
                                  : `${item.portionCount}/${item.totalPortions} porsi`}
                              </span>
                            </div>
                            <span className="font-semibold text-text-100 tabular-nums shrink-0 pt-0.5">
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

                  {/* Grand Total Box (Tactile Elevated Total - Brand Palette) */}
                  <div className="p-3.5 rounded-xl bg-primary-600/15 border border-primary-400/40 flex justify-between items-center mt-3 shadow-xs">
                    <span className="text-xs font-bold text-text-300 uppercase tracking-wider">
                      Total Bayar
                    </span>
                    <span className="text-lg font-black text-text-50 tabular-nums">
                      Rp {data.grandTotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Barcode & Verification Footer */}
                  <div className="pt-2 flex flex-col items-center gap-1.5 border-t border-dashed border-secondary-800/80">
                    <div className="h-4 flex items-center gap-0.5 opacity-50">
                      {[2, 1, 3, 1, 2, 2, 1, 3, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 3, 1, 2].map((w, i) => (
                        <div key={i} className="h-4 bg-text-400 rounded-xs" style={{ width: `${w}px` }} />
                      ))}
                    </div>
                    <span className="font-mono text-3xs text-text-400 tracking-wider">
                      BON-#{data.inviteCode.toUpperCase()}
                    </span>
                    <p className="text-3xs text-text-400">
                      Splitbill anti ribet pakai ceban pertama
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 border-t border-secondary-800 bg-secondary-950">
                <Button
                  onPress={handlePrintPdf}
                  color="primary"
                  size="md"
                  iconLeading={Printer}
                  className="w-full font-bold shadow-md shadow-primary/20 active:scale-97 transition-transform duration-160 cursor-pointer"
                >
                  Cetak / Simpan PDF
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
