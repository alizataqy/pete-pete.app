"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/base/buttons/button";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
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
      size="sm"
      className={className}
    >
      Keluar
    </Button>
  );
}

