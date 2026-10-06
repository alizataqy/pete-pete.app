import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Plus, Compass } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { getAvatarUrl } from "@/utils/avatar";
import JoinBonInput from "./JoinBonInput";
import TongkronganList from "./TongkronganList";

export default async function TongkronganPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Ambil semua sesi split bill yang dibuat oleh user ini
  const mySessions = await prisma.billSession.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          isPaid: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatar: true },
  });

  const serializedSessions = mySessions.map((s) => ({
    id: s.id,
    title: s.title,
    merchantName: s.merchantName,
    inviteCode: s.inviteCode,
    status: s.status,
    totalAmount: Number(s.totalAmount),
    members: s.members,
  }));

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background text-text">


      {/* Header Tongkrongan */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/80 backdrop-blur-md border-b border-secondary-800/70 px-4 flex items-center justify-between gap-3">
        <div className="flex gap-2.5 items-center min-w-0 flex-1">
          <Link
            href="/profile"
            aria-label="Buka profil gua"
            className="flex items-center justify-center rounded-full hover:opacity-80 active:scale-95 transition-transform p-0.5 shrink-0"
          >
            <Avatar
              size="md"
              src={getAvatarUrl(dbUser?.avatar)}
              alt={session.user.name}
            />
          </Link>
          <div className="flex-col flex min-w-0 flex-1">
            <h1 className="text-sm font-extrabold text-text-50 truncate">Tongkrongan Gua</h1>
            <p className="text-2xs text-text-400 truncate mt-0.5">
              Wassup, <strong className="text-primary-400 font-semibold">{session.user.name}</strong>! Pete-petean lo udah kelar?
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <LogoutButton size="xs" />
        </div>
      </header>

      {/* Tongkrongan Body */}
      <div className="flex-1 p-3.5 flex flex-col space-y-4 min-h-0 overflow-hidden">
        {/* Link ke Vacation / Agenda Plans */}
        <Link
          href="/agenda"
          className="relative p-2.5 rounded-xl border border-secondary-800 bg-secondary-950/15 hover:bg-secondary-950/30 transition-all active:scale-[0.99] flex items-center justify-between gap-3 shrink-0 min-h-14"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2.5 bg-secondary-950/80 rounded-lg border border-secondary-800 shrink-0">
              <Compass className="w-4 h-4 text-primary-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-50">Make a Plan</p>
              <p className="text-2xs text-text-400 leading-normal">Bikin plan liburan, BBQ, atau agenda kumpul bareng sohib biar ga pusing pete-peteannya</p>
            </div>
          </div>
          <Badge color="brand" size="sm" type="pill-color" className="shrink-0 font-bold">
            Coba
          </Badge>
          <Badge color="danger" size="sm" type="pill-color" className="absolute -top-2.5 -right-3.5 text-4xs font-extrabold bg-danger text-white ring-0 shadow-lg shadow-danger-500/50 uppercase tracking-wider rotate-30">
            New
          </Badge>
        </Link>
        {/* Input Cepat Kode Bon */}
        <JoinBonInput />


        {/* Daftar Sesi Split Bill */}
        <div className="flex-1 flex flex-col min-h-0 gap-3">
          
          <TongkronganList sessions={serializedSessions} />
        </div>
      </div>

      {/* Floating Action Button (Thumb friendly 56px FAB in thumb zone) */}
      <div className="fixed bottom-6 max-w-md w-full px-5 flex justify-end z-30 pointer-events-none">
        <Button
          href="/pete-pete/new"
          color="primary"
          aria-label="Scan struk baru"
          className="shadow-2xl shadow-primary-400/40 rounded-full w-14 h-14 min-w-14 min-h-14 flex items-center justify-center p-0 hover:scale-105 active:scale-[0.96] transition-transform pointer-events-auto"
        >
          <Plus className="w-7 h-7 text-white" />
        </Button>
      </div>
    </main>
  );
}
