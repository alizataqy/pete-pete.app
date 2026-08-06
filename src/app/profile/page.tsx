import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Ambil profil lengkap dan daftar bank dari DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      banks: {
        select: {
          id: true,
          bankName: true,
          bankAccount: true,
          bankOwner: true,
          imageUrl: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const initialBanks = user.banks.map((b) => ({
    id: b.id,
    bankName: b.bankName,
    bankAccount: decrypt(b.bankAccount),
    bankOwner: b.bankOwner,
    imageUrl: b.imageUrl || "",
  }));

  const initialData = {
    id: user.id,
    name: user.name,
    email: user.email,
    banks: initialBanks,
  };

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
      <ProfileForm initialData={initialData} />
    </main>
  );
}
