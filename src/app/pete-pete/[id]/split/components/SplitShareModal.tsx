"use client";

import React from "react";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import {
  Share07,
  Copy01,
  MessageChatSquare,
  X,
  AlertTriangle,
  Download01,
} from "@untitledui/icons";
import { ShareModalConfig, SplitSessionData } from "../types";

interface SplitShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ShareModalConfig | null;
  session: SplitSessionData;
  onShareToClipboard: (text: string, memberId?: string) => void;
  onShareToWhatsApp: (text: string) => void;
  onOpenReceiptModal?: (memberId: string) => void;
}

export default function SplitShareModal({
  isOpen,
  onClose,
  config,
  session,
  onShareToClipboard,
  onShareToWhatsApp,
  onOpenReceiptModal,
}: SplitShareModalProps) {
  if (!config) return null;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onClose}
      className="fixed inset-0 z-50 flex min-h-dvh w-full items-end justify-center bg-overlay/70 outline-hidden backdrop-blur-[6px] sm:items-center sm:justify-center sm:px-8 pt-(--modal-pt) pb-(--modal-pb) [--modal-pb:clamp(16px,8vh,64px)] [--modal-pt:16px] sm:[--modal-pb:32px] sm:[--modal-pt:32px]"
    >
      <Modal className="w-full max-w-sm overflow-hidden bg-active text-text p-5 rounded-xl sm:rounded-2xl shadow-xl outline-hidden border border-secondary-800">
        <Dialog className="outline-hidden">
          {({ close }) => (
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <FeaturedIcon
                  icon={Share07}
                  color="brand"
                  theme="modern"
                  size="md"
                  className="bg-primary-950 text-primary-400 border border-primary-800"
                />
                <div className="grid grid-cols-1">
                  <Heading slot="title" className="text-sm font-bold text-text">
                    {config.title}
                  </Heading>
                  <p className="text-xs text-text-400 leading-relaxed">
                    {config.description}
                  </p>
                </div>
                <Button
                  color="tertiary"
                  size="xs"
                  onPress={close}
                  aria-label="Tutup dialog"
                  className="text-text-400 hover:text-text"
                >
                  <X />
                </Button>
              </div>

              {(!session.bankName || (session.bankName !== "Cash" && !session.bankAccount)) && (
                <div className="p-2.5 rounded-xl bg-warning-950/60 border border-warning-800/80 flex items-start gap-2.5 text-warning-100 text-xs leading-snug">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-warning-400 mt-0.5" />
                  <span>
                    Info rekening transfer belum diatur nih, sohib lo bakal nanya manual rekeningnya nanti.
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2 w-full pt-1">
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 w-full">
                  <Button
                    color="secondary"
                    size="sm"
                    iconLeading={Copy01}
                    className="w-full justify-center py-2.5 text-xs font-semibold"
                    onPress={() => onShareToClipboard(config.text, config.memberId)}
                  >
                    Copy Teks
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    iconLeading={MessageChatSquare}
                    className="w-full justify-center py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    onPress={() => onShareToWhatsApp(config.text)}
                  >
                    Share ke WhatsApp
                  </Button>
                </div>

                {config.memberId && onOpenReceiptModal && (
                  <Button
                    color="secondary"
                    size="sm"
                    iconLeading={Download01}
                    className="w-full justify-center py-2.5 text-xs font-semibold border border-secondary-700 text-primary-400"
                    onPress={() => {
                      onOpenReceiptModal(config.memberId!);
                      onClose();
                    }}
                  >
                    Download Bon Digital (PDF)
                  </Button>
                )}
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
