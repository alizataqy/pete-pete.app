"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { LogOut01 } from "@untitledui/icons";

interface LogoutButtonProps {
  className?: string;
  size?: "xs" | "sm" | "md";
}

export default function LogoutButton({ className, size = "xs" }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Gagal logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onPress={handleLogout}
      isDisabled={loading}
      isLoading={loading}
      color="secondary"
      size={size}
      aria-label="Cabut / Logout"
      iconLeading={LogOut01}
      className={
        className ??
        "px-2.5 py-1.5 min-h-9 rounded-lg border border-secondary-800/80 bg-secondary-950/40 hover:bg-danger-950/20 hover:border-danger-800/40 hover:text-danger-400 text-text-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
      }
    >
      Cabut
    </Button>
  );
}

