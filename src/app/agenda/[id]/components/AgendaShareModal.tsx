"use client";

import React from "react";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Share07, Copy01, MessageChatSquare, X } from "@untitledui/icons";

interface AgendaShareModalConfig {
  isOpen: boolean;
  title: string;
  description: string;
  text: string;
  memberId?: string;
}

interface AgendaShareModalProps {
  config: AgendaShareModalConfig | null;
  onClose: () => void;
  onShareToClipboard: (text: string, memberId?: string) => void;
  onShareToWhatsApp: (text: string) => void;
}

export default function AgendaShareModal({
  config,
  onClose,
  onShareToClipboard,
  onShareToWhatsApp,
}: AgendaShareModalProps) {
  if (!config) return null;

  return (
    <ModalOverlay
      isOpen={config.isOpen}
      onOpenChange={onClose}
      className="fixed inset-0 z-50 flex min-h-dvh w-full items-end justify-center bg-overlay/70 outline-hidden backdrop-blur-[6px] sm:items-center sm:justify-center sm:px-8 pt-(--modal-pt) pb-(--modal-pb) [--modal-pb:clamp(16px,8vh,64px)] [--modal-pt:16px] sm:[--modal-pb:32px] sm:[--modal-pt:32px]"
    >
      <Modal className="w-full max-w-sm overflow-hidden bg-active text-text p-5 rounded-xl sm:rounded-2xl shadow-xl outline-hidden duration-0 animate-none transform-none transition-none">
        <Dialog className="outline-hidden">
          {({ close }) => (
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <FeaturedIcon
                  icon={Share07}
                  color="brand"
                  theme="modern"
                  size="md"
                  className="bg-primary-950 text-primary-500 border border-primary-800"
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
                  className="text-text-400 hover:text-text"
                >
                  <X />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full pt-1">
                <Button
                  color="secondary"
                  size="sm"
                  iconLeading={Copy01}
                  className="w-full justify-center min-h-11 py-3 text-xs font-bold rounded-lg active:scale-[0.96] transition-transform"
                  onPress={() => onShareToClipboard(config.text, config.memberId)}
                >
                  Salin ke Clipboard
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  iconLeading={MessageChatSquare}
                  className="w-full justify-center min-h-11 py-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg active:scale-[0.96] transition-transform"
                  onPress={() => onShareToWhatsApp(config.text)}
                >
                  Kirim ke WhatsApp
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
