"use client";

import React from "react";
import { Heading } from "react-aria-components";
import { ModalOverlay, Modal, Dialog } from "./modal";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Trash01 } from "@untitledui/icons";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title = "Yakin Mau Hapus?",
  description = "Kalo lo apus, data ini bakal ilang selamanya dan gabisa balik lagi. Beneran nih?",
  confirmText = "Hapus Aja",
  cancelText = "Gak Jadi",
  isLoading = false,
}: DeleteConfirmationProps) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onClose}>
      <Modal className="w-full max-w-sm overflow-hidden bg-active text-text p-5">
        <Dialog className="outline-hidden">
          {({ close }) => (
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <FeaturedIcon
                  icon={Trash01}
                  color="error"
                  theme="modern"
                  size="md"
                  className="bg-danger-950 text-danger-500 border border-danger-800"
                />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Heading slot="title" className="text-sm font-bold text-text">
                    {title}
                  </Heading>
                  <p className="text-xs text-text-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <Button
                  color="secondary"
                  onPress={close}
                  isDisabled={isLoading}
                  size="sm"
                >
                  {cancelText}
                </Button>
                <Button
                  color="primary-destructive"
                  onPress={onConfirm}
                  isLoading={isLoading}
                  isDisabled={isLoading}
                  size="sm"
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
