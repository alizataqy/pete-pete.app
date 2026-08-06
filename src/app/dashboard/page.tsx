import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/base/buttons/button";
import { User01, Plus } from "@untitledui/icons";

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

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">


      {/* Header Dashboard */}
      <header className="sticky top-0 z-20 bg-lilac-ash-950/90 backdrop-blur-md border-b border-lilac-ash-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-extrabold text-jet-black-50">Dashboard</h1>
          <p className="text-[10px] text-jet-black-300 mt-0.5">
            Ey, <strong className="text-alice-blue-400 font-medium">{session.user.name}</strong>!
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            href="/pete-pete/new"
            iconLeading={<Plus />}
          >
            Sesi Baru
          </Button>
          <Button
            href="/profile"
            color="secondary"
            className="px-2.5 py-1.5 rounded-lg border border-lilac-ash-800 hover:bg-jet-black-900 text-jet-black-300 hover:text-jet-black-100 text-[10px] font-medium transition-all"
            iconLeading={<User01 />}
          >
            Profil
          </Button>
          <LogoutButton
            className="px-2.5 py-1.5 rounded-lg border border-lilac-ash-800 hover:bg-jet-black-900 text-jet-black-300 hover:text-jet-black-100 text-[10px] font-medium transition-all"
          />
        </div>
      </header>

      {/* Scrollable Dashboard Body */}
      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        {/* Statistik/Overview Ringkas */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl border border-lilac-ash-800 bg-jet-black-900 text-center">
            <p className="text-[9px] text-jet-black-400 font-semibold uppercase tracking-wider">Total</p>
            <p className="text-lg font-bold text-jet-black-50 mt-1">{mySessions.length}</p>
          </div>
          <div className="p-3 rounded-xl border border-lilac-ash-800 bg-jet-black-900 text-center">
            <p className="text-[9px] text-jet-black-400 font-semibold uppercase tracking-wider">Aktif</p>
            <p className="text-lg font-bold text-alice-blue-300 mt-1">
              {mySessions.filter((s) => s.status === "DRAFT" || s.status === "ACTIVE").length}
            </p>
          </div>
          <div className="p-3 rounded-xl border border-lilac-ash-800 bg-jet-black-900 text-center">
            <p className="text-[9px] text-jet-black-400 font-semibold uppercase tracking-wider">Selesai</p>
            <p className="text-lg font-bold text-emerald-500 mt-1">
              {mySessions.filter((s) => s.status === "COMPLETED").length}
            </p>
          </div>
        </div>


        {/* Daftar Sesi Split Bill */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-jet-black-100 uppercase tracking-wider">PETE-PETEAN lo</h2>

          {mySessions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-lilac-ash-800 rounded-xl space-y-3 bg-jet-black-900/40">
              <p className="text-jet-black-300 text-[10px] max-w-[200px] mx-auto leading-relaxed">
                Belum ada sesi nih. Yuk scan struk bareng geng lo!
              </p>
              <Link
                href="/pete-pete/new"
                className="inline-block px-4 py-2 rounded-lg bg-alice-blue-900 hover:bg-alice-blue-500/20 border border-alice-blue-500/30 text-alice-blue-400 font-semibold text-[10px] transition-all"
              >
                Mulai Scan Struk
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {mySessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl border border-lilac-ash-800 bg-jet-black-900 hover:bg-jet-black-800 transition-all flex flex-col space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-jet-black-950 text-jet-black-300 border border-jet-black-700">
                        {session.inviteCode}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded ${session.status === "COMPLETED"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : session.status === "ACTIVE"
                              ? "bg-alice-blue-950 text-alice-blue-300 border border-alice-blue-800"
                              : "bg-jet-black-950 text-alice-blue-400 border border-jet-black-700"
                          }`}
                      >
                        {session.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-jet-black-50 group-hover:text-alice-blue-400 transition-colors">
                      {session.title}
                    </h3>
                    {session.merchantName && (
                      <p className="text-[10px] text-jet-black-400">
                        {session.merchantName}
                      </p>
                    )}
                    {session.description && (
                      <p className="text-[10px] text-jet-black-300 line-clamp-1">{session.description}</p>
                    )}
                  </div>

                  <div className="border-t border-lilac-ash-800 pt-3 flex items-center justify-between text-xs text-jet-black-300">
                    <div>
                      <p className="text-[9px] text-jet-black-400">Totalnya</p>
                      <p className="font-bold text-jet-black-100 mt-0.5">
                        Rp {Number(session.totalAmount).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-jet-black-400">Temen lo</p>
                      <p className="font-semibold text-jet-black-200 mt-0.5">
                        {session.members.length} orang ({session.members.filter((m) => m.isPaid).length} lunas)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    <Link
                      href={`/pete-pete/${session.id}/split`}
                      className="w-full text-center py-2 rounded-lg bg-alice-blue-500 hover:bg-alice-blue-600 text-jet-black-950 font-bold text-[10px] transition-all active:scale-[0.98]"
                    >
                      Bagi Tagihan
                    </Link>
                    <Link
                      href={`/pete-pete/${session.id}/items`}
                      className="w-full text-center py-2 rounded-lg border border-lilac-ash-800 hover:bg-jet-black-950 text-jet-black-100 text-[10px] font-semibold transition-all active:scale-[0.98]"
                    >
                      Lihat Struk
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
