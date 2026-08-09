import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/base/buttons/button";
import { User01, Plus } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";

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

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">


      {/* Header Tongkrongan */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Button
            href="/profile"
            color="link-gray"
            className="border-0 bg-transparent flex items-center justify-center rounded-full hover:opacity-80 active:scale-95 transition-all"
          >
            <Avatar
              size="md"
              src={dbUser?.avatar ? `https://api.dicebear.com/9.x/dylan/svg?seed=${encodeURIComponent(dbUser.avatar)}` : undefined}
              alt={session.user.name}
            />
          </Button>
          <div className="flex-col flex">
            <h1 className="text-sm font-extrabold text-text-50">Tongkrongan Gua</h1>
            <p className="text-[10px] text-text-300 mt-0.5">
              Wassup, <strong className="text-primary-400 font-medium">{session.user.name}</strong>! Tongkrongan lo udah beres patungannya?
            </p>
          </div>
        </div>
        <div className="flex ">
          <LogoutButton
            className="px-2.5 py-1.5 rounded-lg border border-secondary-800 hover:bg-text-900 text-danger-300 hover:text-danger-400 text-[10px] font-medium transition-all"
          />
        </div>
      </header>

      {/* Tongkrongan Body */}
      <div className="flex-1 p-4 flex flex-col min-h-0 gap-5 overflow-hidden">
        {/* Statistik/Overview Ringkas */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl border border-secondary-800 bg-text-900 text-center">
            <p className="text-[9px] text-text-400 font-semibold uppercase tracking-wider">Semua</p>
            <p className="text-lg font-bold text-primary-300 mt-1">{mySessions.length}</p>
          </div>
          <div className="p-3 rounded-xl border border-secondary-800 bg-text-900 text-center">
            <p className="text-[9px] text-text-400 font-semibold uppercase tracking-wider">On Going</p>
            <p className="text-lg font-bold text-primary-300 mt-1">
              {mySessions.filter((s) => s.status === "DRAFT" || s.status === "ACTIVE").length}
            </p>
          </div>
          <div className="p-3 rounded-xl border border-secondary-800 bg-text-900 text-center">
            <p className="text-[9px] text-text-400 font-semibold uppercase tracking-wider">Udah Kelar</p>
            <p className="text-lg font-bold text-primary-300 mt-1">
              {mySessions.filter((s) => s.status === "COMPLETED").length}
            </p>
          </div>
        </div>


        {/* Daftar Sesi Split Bill */}
        <div className="flex-1 flex flex-col min-h-0 gap-3">
          <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider">List Pete-Petean Lo</h2>
          <div className="flex-1 flex flex-col min-h-0 border border-secondary-800 p-3 rounded-xl bg-text-900/10">

            {mySessions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-secondary-800 rounded-xl space-y-3 bg-text-900/40">
                <p className="text-text-300 text-[10px] max-w-[200px] mx-auto leading-relaxed">
                  Sepi amat, belum ada patungan nih. Yuk scan struk bareng geng lo biar gak ada drama!
                </p>
                <Link
                  href="/pete-pete/new"
                  className="inline-block px-4 py-2 rounded-lg bg-primary-900 hover:bg-primary/20 border border-primary-500/30 text-primary-400 font-semibold text-[10px] transition-all"
                >
                  Scan Struk Sekarang
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pb-16 space-y-3 scrollbar-hide">
                {mySessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3.5 rounded-xl border border-secondary-800 bg-text-900 hover:bg-text-800 transition-all flex flex-col space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-text-50 group-hover:text-primary-400 transition-colors truncate">
                          {session.title}
                        </h3>
                        {session.merchantName ? (
                          <p className="text-[10px] text-text-400 truncate">
                            {session.merchantName}
                          </p>
                        ) : (
                          <p className="text-[10px] text-text-400">Kode: {session.inviteCode}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        {session.merchantName && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-text-950 text-text-300 border border-text-700">
                            {session.inviteCode}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${session.status === "COMPLETED"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : session.status === "ACTIVE"
                              ? "bg-primary-950 text-primary-300 border border-primary-800"
                              : "bg-text-950 text-primary-400 border border-text-700"
                            }`}
                        >
                          {session.status === "COMPLETED" ? "Kelar" : session.status === "ACTIVE" ? "Jalan" : "Draft"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-300 pt-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-text-400">Tagihan:</span>
                        <span className="font-bold text-text-100">
                          Rp {Number(session.totalAmount).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="text-text-400 text-right">
                        <span className="font-semibold text-text-200">
                          {session.members.length} Sohib
                        </span>
                        {session.members.filter((m) => m.isPaid).length > 0 && (
                          <span className="text-emerald-400 font-medium ml-1">
                            ({session.members.filter((m) => m.isPaid).length} bayar)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        href={`/pete-pete/${session.id}/split`}
                        color="primary"
                        className="w-full text-center py-1.5 rounded-lg text-text-950 font-bold text-[10px] transition-all active:scale-[0.98]"
                      >
                        Bagi Tagihan
                      </Button>
                      <Button
                        href={`/pete-pete/${session.id}/items`}
                        color="secondary"
                        className="w-full text-center py-1.5 rounded-lg text-text-100 text-[10px] font-semibold transition-all active:scale-[0.98]"
                      >
                        Cek Menu
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 max-w-md w-full px-6 flex justify-end z-30 pointer-events-none">
        <Button
          href="/pete-pete/new"
          color="primary"
          className="shadow-2xl shadow-primary/45 rounded-full w-12 h-12 flex items-center justify-center p-0 hover:scale-105 active:scale-95 transition-all pointer-events-auto"
        >
          <Plus className="w-6 h-6 text-text-950" />
        </Button>
      </div>
    </main>
  );
}
