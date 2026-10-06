"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Download01, Share07, Plus, XClose, CheckCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { Heading } from "react-aria-components";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getStandaloneSnapshot() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

function getStandaloneServerSnapshot() {
  return true;
}

function checkIsIos() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isClassicIos = /iphone|ipad|ipod/.test(ua);
  const isIpadOs = /macintosh/.test(ua) && window.navigator.maxTouchPoints > 1;
  return (isClassicIos || isIpadOs) && !(window as unknown as { MSStream?: boolean }).MSStream;
}

export function useIsStandalone() {
  return useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  );
}

export function triggerPwaInstall() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-pwa-install"));
  }
}

export default function InstallPwaPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const isStandalone = useIsStandalone();
  const isIos = useSyncExternalStore(
    () => () => {},
    checkIsIos,
    () => false
  );
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showIosModal, setShowIosModal] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Service Worker Management (production only to prevent stale dev caches)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            reg.update().catch(() => {});
          })
          .catch(() => {});
      } else {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().catch(() => {});
          }
        });
      }
    }

    if (isStandalone) {
      return;
    }

    // 2. Check dismissal in localStorage
    const dismissedTime = localStorage.getItem("ceban_pwa_dismissed");
    const hasDismissedRecently =
      dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 3 * 24 * 60 * 60 * 1000;

    // 3. Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      if (!hasDismissedRecently) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If iOS and not dismissed recently, show banner after brief delay
    let iosTimer: NodeJS.Timeout | undefined;
    if (isIos && !hasDismissedRecently) {
      iosTimer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    }

    // 4. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      deferredPromptRef.current = null;
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // 5. Listen for custom trigger event
    const handleCustomTrigger = () => {
      if (isIos) {
        setShowIosModal(true);
      } else if (deferredPromptRef.current) {
        deferredPromptRef.current.prompt();
        deferredPromptRef.current.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            setShowBanner(false);
          }
          deferredPromptRef.current = null;
        });
      } else {
        // Fallback for browsers that don't dispatch beforeinstallprompt
        setShowIosModal(true);
      }
    };
    window.addEventListener("open-pwa-install", handleCustomTrigger);

    return () => {
      if (iosTimer) clearTimeout(iosTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-install", handleCustomTrigger);
    };
  }, [isStandalone, isIos]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (deferredPromptRef.current) {
      await deferredPromptRef.current.prompt();
      const choiceResult = await deferredPromptRef.current.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowBanner(false);
      }
      deferredPromptRef.current = null;
    } else {
      setShowIosModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("ceban_pwa_dismissed", Date.now().toString());
  };

  if (isStandalone || isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Install Banner */}
      {showBanner && (
        <aside
          aria-label="Install Aplikasi Ceban Pertama"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-background-900 border border-secondary-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300 print:hidden"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 relative">
              <Image
                src="/icon-192.png"
                alt="Logo Ceban Pertama"
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl border border-secondary-800 shadow-sm"
              />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h3 className="font-bold text-sm text-text leading-snug text-balance">
                Install Ceban Pertama
              </h3>
              <p className="text-xs text-text-400 mt-1 leading-relaxed text-pretty line-clamp-2">
                Biar sat-set buka split bill langsung dari layar utama perangkat lo, gak perlu ribet bolak-balik buka browser.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  type="button"
                  size="sm"
                  color="primary"
                  iconLeading={Download01}
                  onPress={handleInstallClick}
                  className="font-bold cursor-pointer"
                >
                  Install Sekarang
                </Button>
                <Button
                  type="button"
                  size="sm"
                  color="tertiary"
                  onPress={handleDismiss}
                  className="text-text-400 hover:text-text cursor-pointer"
                >
                  Ntar Aja
                </Button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Tutup saran"
              className="text-text-400 hover:text-text p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 cursor-pointer shrink-0"
            >
              <XClose className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Modal Petunjuk Install iOS Safari & Browser Lainnya */}
      <ModalOverlay isOpen={showIosModal} onOpenChange={setShowIosModal}>
        <Modal className="w-full max-w-sm overflow-hidden bg-background-900 border border-secondary-800 text-text p-5 rounded-2xl shadow-2xl">
          <Dialog className="outline-hidden">
            {({ close }) => (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <FeaturedIcon
                    icon={Download01}
                    color="brand"
                    theme="modern"
                    size="md"
                    className="bg-primary-950 text-primary-400 border border-primary-800 shrink-0"
                  />
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <Heading slot="title" className="text-base font-bold text-text text-balance">
                      Cara Install Aplikasi
                    </Heading>
                    <p className="text-xs text-text-400 text-pretty">
                      Gampang banget, ikuti 3 langkah simpel ini biar sat-set:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Tutup modal"
                    className="text-text-400 hover:text-text p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 cursor-pointer shrink-0"
                  >
                    <XClose className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 bg-secondary-950/60 border border-secondary-800 rounded-xl p-3.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="text-text font-medium leading-relaxed">
                        Ketuk tombol <span className="font-semibold text-primary-400">Bagikan (Share)</span> di bilah bawah browser Safari lo.
                      </p>
                      <div className="inline-flex items-center gap-1 text-2xs text-text-400 mt-1 bg-background-950/60 px-2 py-0.5 rounded border border-secondary-800/80">
                        <Share07 className="w-3.5 h-3.5 text-primary-400" />
                        <span>Ikon kotak dengan panah ke atas</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="text-text font-medium leading-relaxed">
                        Gulir ke bawah, terus pilih opsi <span className="font-semibold text-primary-400">Tambah ke Layar Utama</span> (Add to Home Screen).
                      </p>
                      <div className="inline-flex items-center gap-1 text-2xs text-text-400 mt-1 bg-background-950/60 px-2 py-0.5 rounded border border-secondary-800/80">
                        <Plus className="w-3.5 h-3.5 text-primary-400" />
                        <span>Add to Home Screen</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-text font-medium leading-relaxed">
                        Ketuk <span className="font-semibold text-primary-400">Tambah</span> (Add) di pojok kanan atas. Kelar deh!
                      </p>
                      <div className="inline-flex items-center gap-1 text-2xs text-text-400 mt-1 bg-background-950/60 px-2 py-0.5 rounded border border-secondary-800/80">
                        <CheckCircle className="w-3.5 h-3.5 text-success-500" />
                        <span>Langsung nangkring di layar utama lo</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    size="md"
                    color="primary"
                    onPress={close}
                    className="w-full font-bold cursor-pointer"
                  >
                    Oke, Paham!
                  </Button>
                </div>
              </div>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
