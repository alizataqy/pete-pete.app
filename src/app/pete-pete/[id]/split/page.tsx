import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import SplitBoard from "./SplitBoard";
import { decrypt } from "@/lib/encryption";

export default async function SessionSplitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.billSession.findUnique({
    where: { id },
    include: {
      items: true,
      members: {
        include: {
          allocations: true,
        },
      },
    },
  });

  if (!session) {
    notFound();
  }

  // Petakan alokasi awal dari database agar sinkron setelah refresh halaman
  const initialAllocations: { itemId: string; memberId: string; quantity: number }[] = [];
  session.members.forEach((member) => {
    member.allocations.forEach((alloc) => {
      initialAllocations.push({
        itemId: alloc.itemId,
        memberId: alloc.memberId,
        quantity: Number(alloc.quantity),
      });
    });
  });

  // Susun data mapping untuk dioper ke Client Component
  const formattedSession = {
    id: session.id,
    title: session.title,
    merchantName: session.merchantName || "",
    inviteCode: session.inviteCode,
    totalAmount: Number(session.totalAmount),
    taxAmount: Number(session.taxAmount),
    tipAmount: Number(session.tipAmount),
    bankName: session.bankName || "",
    bankAccount: session.bankAccount ? decrypt(session.bankAccount) : "",
    bankOwner: session.bankOwner || "",
    status: session.status,
    userId: session.userId,
  };

  const formattedMembers = session.members.map((m) => ({
    id: m.id,
    name: m.name,
    shareAmount: Number(m.shareAmount),
    userId: m.userId,
    isPaid: m.isPaid,
  }));

  const formattedItems = session.items.map((i) => ({
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    totalPrice: Number(i.totalPrice),
  }));

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background text-text">
      {/* Board Utama Pembagian */}
      <SplitBoard
        session={formattedSession}
        initialMembers={formattedMembers}
        items={formattedItems}
        initialAllocations={initialAllocations}
      />
    </main>
  );
}
