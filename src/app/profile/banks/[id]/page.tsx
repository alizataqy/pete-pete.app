import React from "react";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import BankDetailView from "./BankDetailView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BankDetailPage({ params }: Props) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const bank = await prisma.userBank.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!bank) {
    notFound();
  }

  const bankData = {
    id: bank.id,
    bankName: bank.bankName,
    bankAccount: decrypt(bank.bankAccount),
    bankOwner: bank.bankOwner,
    imageUrl: bank.imageUrl || "",
  };

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
      <BankDetailView bank={bankData} userId={session.user.id} />
    </main>
  );
}
