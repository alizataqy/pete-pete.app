"use client";

import React from "react";
import { Heading } from "react-aria-components";
import { ModalOverlay, Modal, Dialog } from "./modal";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { FC } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  color?: "brand" | "gray" | "success" | "warning" | "error";
  icon?: FC<{ className?: string }>;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Ya, Lanjut",
  cancelText = "Gak Jadi",
  isLoading = false,
  color = "brand",
  icon,
}: ConfirmationModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onClose}>
      <Modal className="w-full max-w-sm overflow-hidden bg-active text-text p-5">
        <Dialog className="outline-hidden">
          {({ close }) => (
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                {icon && (
                  <FeaturedIcon
                    icon={icon}
                    color={color}
                    theme="modern"
                    size="md"
                    className={
                      color === "success"
                        ? "bg-emerald-950 text-emerald-500 border border-emerald-800"
                        : color === "warning"
                        ? "bg-warning-950 text-warning-500 border border-warning-800"
                        : color === "error"
                        ? "bg-danger-950 text-danger-500 border border-danger-800"
                        : "bg-primary-950 text-primary-500 border border-primary-800"
                    }
                  />
                )}
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
                  color={color === "error" ? "primary-destructive" : "primary"}
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
