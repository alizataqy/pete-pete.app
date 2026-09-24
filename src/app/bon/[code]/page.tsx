import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import BonView from "./BonView";

interface BonPageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ member?: string }>;
}

export default async function BonPage({ params, searchParams }: BonPageProps) {
  const { code } = await params;
  const { member: selectedMemberParam } = await searchParams;

  if (!code) {
    notFound();
  }

  // Cari sesi berdasarkan inviteCode (case-insensitive)
  const session = await prisma.billSession.findFirst({
    where: {
      inviteCode: {
        equals: code.trim(),
        mode: "insensitive",
      },
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      items: {
        include: {
          allocations: true,
        },
      },
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

  const creatorName = session.createdBy?.name || session.bankOwner || "Pembuat";

  const items = session.items.map((i) => ({
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    unitPrice: Number(i.unitPrice),
    totalPrice: Number(i.totalPrice),
    allocations: i.allocations.map((a) => ({
      memberId: a.memberId,
      quantity: a.quantity,
    })),
  }));

  const members = session.members.map((m) => {
    // Jika nama member terdaftar sebagai 'Saya (Owner)', 'Saya', 'Gua', atau berelasi dengan userId pembuat
    const isOwnerPlaceholder =
      (session.userId && m.userId === session.userId && /^(saya(\s*\(owner\))?|gua|owner)$/i.test(m.name.trim())) ||
      /^(saya(\s*\(owner\))?|gua|owner)$/i.test(m.name.trim());

    return {
      id: m.id,
      name: isOwnerPlaceholder && creatorName ? creatorName : m.name,
      isPaid: m.isPaid,
      shareAmount: Number(m.shareAmount),
      userId: m.userId,
    };
  });

  return (
    <BonView
      session={{
        id: session.id,
        title: session.title,
        merchantName: session.merchantName,
        inviteCode: session.inviteCode,
        totalAmount: Number(session.totalAmount),
        taxAmount: Number(session.taxAmount),
        tipAmount: Number(session.tipAmount),
        bankName: session.bankName,
        bankOwner: session.bankOwner,
        creatorName,
        status: session.status,
        createdAt: session.createdAt.toISOString(),
      }}
      items={items}
      members={members}
      preselectedMemberId={selectedMemberParam}
    />
  );
}
