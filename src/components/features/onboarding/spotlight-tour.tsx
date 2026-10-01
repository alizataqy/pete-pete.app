"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { TourStep, SpotlightTourProps } from "./types";
import { Button } from "@/components/base/buttons/button";
import { ArrowRight, ArrowLeft, CheckCircle, XClose } from "@untitledui/icons";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
}

export function SpotlightTour({
  steps,
  isOpen,
  onClose,
  storageKey = "has_seen_new_bill_tour",
}: SpotlightTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [tooltipHeight, setTooltipHeight] = useState(200);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Reset to first step whenever tour opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const step = steps[currentStep];

  const updateTargetRect = useCallback(() => {
    if (!step) return;
    const el = document.getElementById(step.targetId);
    if (!el) {
      setTargetRect(null);
      return;
    }

    if (tooltipRef.current?.offsetHeight) {
      setTooltipHeight(tooltipRef.current.offsetHeight);
    }

    const r = el.getBoundingClientRect();
    setTargetRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
      bottom: r.bottom,
    });
  }, [step]);

  // Window resize & scroll listener
  useEffect(() => {
    if (!isOpen) return;

    const handleResizeOrScroll = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      updateTargetRect();
    };

    handleResizeOrScroll();
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [isOpen, updateTargetRect]);

  // Measure tooltip height dynamically
  useEffect(() => {
    if (!tooltipRef.current) return;
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const h = entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height;
          if (h && h > 0) {
            setTooltipHeight(Math.round(h));
          }
        }
      });
      observer.observe(tooltipRef.current);
      return () => observer.disconnect();
    } else {
      setTooltipHeight(tooltipRef.current.offsetHeight || 200);
    }
  }, [step]);

  // Scroll target into view on step change
  useEffect(() => {
    if (!isOpen || !step) return;

    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      const isTall = rect.height > window.innerHeight * 0.45;
      el.scrollIntoView({ behavior: "smooth", block: isTall ? "start" : "center" });
      // Berikan jeda sejenak untuk smooth scroll sebelum hitung bounding rect baru
      const timer = setTimeout(updateTargetRect, 250);
      return () => clearTimeout(timer);
    } else {
      updateTargetRect();
    }
  }, [isOpen, currentStep, step, updateTargetRect]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // Ignore localStorage errors in private browsing
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen || !step) return null;

  // Padding di sekitar elemen yang di-highlight
  const padding = 8;
  const radius = 16;
  const isLastStep = currentStep === steps.length - 1;

  // Kalkulasi posisi tooltip
  let tooltipTop = 16;
  let tooltipLeft = 16;
  const tooltipWidth = 340;

  if (targetRect && windowSize.width > 0 && windowSize.height > 0) {
    // Horizontally clamp tooltip agar tidak off-screen
    const preferredLeft = targetRect.left + (targetRect.width - tooltipWidth) / 2;
    tooltipLeft = Math.max(16, Math.min(preferredLeft, windowSize.width - tooltipWidth - 16));

    const gap = 12;
    const effectiveTooltipHeight = tooltipHeight || 200;

    // Available space strictly above and below
    const spaceBelow = Math.max(0, windowSize.height - (targetRect.bottom + padding + gap));
    const spaceAbove = Math.max(0, targetRect.top - padding - gap);

    if (spaceBelow >= effectiveTooltipHeight) {
      tooltipTop = targetRect.bottom + padding + gap;
    } else if (spaceAbove >= effectiveTooltipHeight) {
      tooltipTop = targetRect.top - padding - effectiveTooltipHeight - gap;
    } else {
      // Jika elemen tinggi dan memenuhi hampir seluruh layar:
      // Posisikan tooltip di bawah layar dengan margin aman agar tidak tembus
      if (spaceBelow >= spaceAbove) {
        tooltipTop = windowSize.height - effectiveTooltipHeight - 20;
      } else {
        tooltipTop = 20;
      }
    }

    // Hard clamp vertikal: DIJAMIN 100% TIDAK PERNAH TEMBUS KE BAWAH MAUPUN KE ATAS
    const maxTop = Math.max(16, windowSize.height - effectiveTooltipHeight - 20);
    tooltipTop = Math.max(16, Math.min(tooltipTop, maxTop));
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto" role="dialog" aria-modal="true" aria-label="Panduan Aplikasi">
      {/* SVG Spotlight Mask Backdrop */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ width: "100vw", height: "100vh" }}
      >
        <defs>
          <mask id="spotlight-tour-mask">
            {/* White covers all (blocks view) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black punches hole through mask to reveal highlighted target */}
            {targetRect && (
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx={radius}
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Semi-transparent dark overlay with punched hole */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(5, 4, 12, 0.78)"
          mask="url(#spotlight-tour-mask)"
        />
      </svg>

      {/* Target Highlight Glow Ring */}
      {targetRect && (
        <div
          className="fixed pointer-events-none transition-all duration-300 ease-out border-2 border-primary-400 rounded-2xl ring-4 ring-primary-500/20"
          style={{
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
          }}
        />
      )}

      {/* Backdrop Click Dismiss Interceptor */}
      <div
        className="fixed inset-0 cursor-default"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Tooltip Card */}
      <div
        ref={tooltipRef}
        className="fixed z-50 transition-all duration-300 ease-out bg-secondary-950/95 border border-secondary-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3.5 max-w-[calc(100vw-32px)]"
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipWidth,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-2xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/20 text-primary-300 border border-primary-500/30">
            {step.badge}
          </span>
          <Button
            size="xs"
            color="tertiary"
            aria-label="Tutup panduan"
            onPress={handleDismiss}
            iconLeading={XClose}
            className="min-w-7 min-h-7 w-7 h-7 p-1 rounded-md text-text-400 hover:text-text hover:bg-secondary-900 flex items-center justify-center cursor-pointer"
          />
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-text tracking-tight text-balance leading-snug">
            {step.title}
          </h3>
          <p className="text-xs text-text-300 font-normal leading-relaxed text-pretty">
            {step.description}
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-secondary-800/80">
          <Button
            size="sm"
            color="link-gray"
            onPress={handleDismiss}
            className="text-xs font-semibold text-text-400 hover:text-text py-1 px-1"
          >
            Lewati
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                size="sm"
                color="secondary"
                aria-label="Langkah sebelumnya"
                onPress={handlePrev}
                iconLeading={ArrowLeft}
                className="min-w-9 min-h-9 w-9 h-9 p-0 rounded-lg bg-secondary-900 border border-secondary-800 text-text-300 hover:text-text active:scale-[0.97]"
              />
            )}

            <Button
              size="sm"
              color="primary"
              onPress={handleNext}
              iconTrailing={isLastStep ? CheckCircle : ArrowRight}
              className="min-h-9 py-2 px-3.5 rounded-lg font-bold text-xs shadow-md active:scale-[0.97]"
            >
              {isLastStep ? "Paham, Mulai!" : "Lanjut"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
