import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/base/buttons/button";
import { User01, Plus } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";

export default async function DashboardPage() {
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


      {/* Header Dashboard */}
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
            <h1 className="text-sm font-extrabold text-text-50">Dashboard</h1>
            <p className="text-[10px] text-text-300 mt-0.5">
              Ey, <strong className="text-primary-400 font-medium">{session.user.name}</strong>!
            </p>
          </div>
        </div>
        <div className="flex ">
          <LogoutButton
            className="px-2.5 py-1.5 rounded-lg border border-secondary-800 hover:bg-text-900 text-danger-300 hover:text-danger-400 text-[10px] font-medium transition-all"
          />
        </div>
      </header>

      {/* Dashboard Body */}
      <div className="flex-1 p-4 flex flex-col min-h-0 gap-5 overflow-hidden">
        {/* Statistik/Overview Ringkas */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl border border-secondary-800 bg-text-900 text-center">
            <p className="text-[9px] text-text-400 font-semibold uppercase tracking-wider">Total</p>
            <p className="text-lg font-bold text-text-50 mt-1">{mySessions.length}</p>
          </div>
          <div className="p-3 rounded-xl border border-secondary-800 bg-text-900 text-center">
            <p className="text-[9px] text-text-400 font-semibold uppercase tracking-wider">Aktif</p>
            <p className="text-lg font-bold text-primary-300 mt-1">
              {mySessions.filter((s) => s.status === "DRAFT" || s.status === "ACTIVE").length}
            </p>
          </div>
          <div className="p-3 rounded-xl border border-secondary-800 bg-text-900 text-center">
            <p className="text-[9px] text-text-400 font-semibold uppercase tracking-wider">Selesai</p>
            <p className="text-lg font-bold text-primary-300 mt-1">
              {mySessions.filter((s) => s.status === "COMPLETED").length}
            </p>
          </div>
        </div>


        {/* Daftar Sesi Split Bill */}
        <div className="flex-1 flex flex-col min-h-0 gap-3">
          <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider">PETE-PETEAN lo</h2>
          <div className="flex-1 flex flex-col min-h-0 border border-secondary-800 p-3 rounded-xl bg-text-900/10">

            {mySessions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-secondary-800 rounded-xl space-y-3 bg-text-900/40">
                <p className="text-text-300 text-[10px] max-w-[200px] mx-auto leading-relaxed">
                  Belum ada sesi nih. Yuk scan struk bareng geng lo!
                </p>
                <Link
                  href="/pete-pete/new"
                  className="inline-block px-4 py-2 rounded-lg bg-primary-900 hover:bg-primary/20 border border-primary-500/30 text-primary-400 font-semibold text-[10px] transition-all"
                >
                  Mulai Scan Struk
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pb-16 space-y-3 scrollbar-hide">
                {mySessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border border-secondary-800 bg-text-900 hover:bg-text-800 transition-all flex flex-col space-y-3 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-text-950 text-text-300 border border-text-700">
                          {session.inviteCode}
                        </span>
                        <span
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded ${session.status === "COMPLETED"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : session.status === "ACTIVE"
                              ? "bg-primary-950 text-primary-300 border border-primary-800"
                              : "bg-text-950 text-primary-400 border border-text-700"
                            }`}
                        >
                          {session.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-text-50 group-hover:text-primary-400 transition-colors">
                        {session.title}
                      </h3>
                      {session.merchantName && (
                        <p className="text-[10px] text-text-400">
                          {session.merchantName}
                        </p>
                      )}
                      {session.description && (
                        <p className="text-[10px] text-text-300 line-clamp-1">{session.description}</p>
                      )}
                    </div>

                    <div className="border-t border-secondary-800 pt-3 flex items-center justify-between text-xs text-text-300">
                      <div>
                        <p className="text-[9px] text-text-400">Totalnya</p>
                        <p className="font-bold text-text-100 mt-0.5">
                          Rp {Number(session.totalAmount).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-text-400">Temen lo</p>
                        <p className="font-semibold text-text-200 mt-0.5">
                          {session.members.length} orang ({session.members.filter((m) => m.isPaid).length} lunas)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <Button
                        href={`/pete-pete/${session.id}/split`}
                        color="primary"
                        className="w-full text-center py-2 rounded-lg text-text-950 font-bold text-[10px] transition-all active:scale-[0.98]"
                      >
                        Bagi Tagihan
                      </Button>
                      <Button
                        href={`/pete-pete/${session.id}/items`}
                        color="secondary"
                        className="w-full text-center py-2 rounded-lg text-text-100 text-[10px] font-semibold transition-all active:scale-[0.98]"
                      >
                        Lihat Struk
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
