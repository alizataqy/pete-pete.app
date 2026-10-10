import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import SplitBoard from "./SplitBoard";
import { decrypt } from "@/lib/encryption";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function SessionSplitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmPayMember?: string }>;
}) {
  const { id } = await params;
  const { confirmPayMember } = await searchParams;

  const authSession = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = authSession?.user?.id || null;

  if (confirmPayMember && !currentUserId) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(
        `/pete-pete/${id}/split?confirmPayMember=${confirmPayMember}`
      )}`
    );
  }

  const session = await prisma.billSession.findUnique({
    where: { id },
    include: {
      items: true,
      members: {
        orderBy: { id: "asc" },
        include: {
          allocations: true,
          user: {
            select: {
              avatar: true,
            },
          },
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
    discountAmount: Number(session.discountAmount || 0),
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
    avatar: m.user?.avatar || m.name,
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
        currentUserId={currentUserId}
        confirmPayMemberId={confirmPayMember}
      />
    </main>
  );
}
