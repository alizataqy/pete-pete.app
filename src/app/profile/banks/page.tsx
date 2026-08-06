import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import WalletsListView from "./WalletsListView";

export default async function WalletsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const userBanks = await prisma.userBank.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  const banks = userBanks.map((b) => ({
    id: b.id,
    bankName: b.bankName,
    bankAccount: decrypt(b.bankAccount),
    bankOwner: b.bankOwner,
    imageUrl: b.imageUrl || "",
  }));

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
      <WalletsListView initialBanks={banks} />
    </main>
  );
}
