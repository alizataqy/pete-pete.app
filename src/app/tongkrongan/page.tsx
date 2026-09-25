import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Plus, Compass, Divide01, File06, ReceiptCheck } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import JoinBonInput from "./JoinBonInput";

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
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background text-text">


      {/* Header Tongkrongan */}
      <header className="sticky top-0 z-20 h-16 shrink-0 bg-secondary-950/90 backdrop-blur-md border-b border-secondary-800 px-4 flex items-center justify-between">
        <div className="flex gap-2.5 items-center min-w-0 flex-1">
          <Button
            href="/profile"
            color="link-gray"
            aria-label="Buka profil gua"
            className="border-0 bg-transparent flex items-center justify-center rounded-full hover:opacity-80 active:scale-95 transition-all p-1 min-w-11 min-h-11"
          >
            <Avatar
              size="md"
              src={dbUser?.avatar ? `https://api.dicebear.com/9.x/dylan/svg?seed=${encodeURIComponent(dbUser.avatar)}` : undefined}
              alt={session.user.name}
            />
          </Button>
          <div className="flex-col flex min-w-0 flex-1">
            <h1 className="text-sm font-extrabold text-text-50">Tongkrongan Gua</h1>
            <p className="text-2xs text-text-300 mt-0.5">
              Wassup, <strong className="text-primary-400 font-medium">{session.user.name}</strong>! Tongkrongan lo udah beres patungannya?
            </p>
          </div>
        </div>
        <div className="flex shrink-0">
          <LogoutButton
            className="px-3 py-2 rounded-lg border border-secondary-800 hover:bg-secondary-950/80 text-danger-300 hover:text-danger-400 text-xs font-semibold min-h-10 flex items-center justify-center transition-all active:scale-95"
          />
        </div>
      </header>

      {/* Tongkrongan Body */}
      <div className="flex-1 p-4 flex flex-col min-h-0 gap-5 overflow-hidden">
        {/* Statistik/Overview Ringkas */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl border border-secondary-800 bg-secondary-950/60 text-center">
            <p className="text-3xs text-text-400 font-semibold uppercase tracking-wider">Semua</p>
            <p className="text-lg font-bold text-primary-300 mt-1">{mySessions.length}</p>
          </div>
          <div className="p-3 rounded-xl border border-secondary-800 bg-secondary-950/60 text-center">
            <p className="text-3xs text-text-400 font-semibold uppercase tracking-wider">On Going</p>
            <p className="text-lg font-bold text-primary-300 mt-1">
              {mySessions.filter((s) => s.status === "DRAFT").length}
            </p>
          </div>
          <div className="p-3 rounded-xl border border-secondary-800 bg-secondary-950/60 text-center">
            <p className="text-3xs text-text-400 font-semibold uppercase tracking-wider">Udah Kelar</p>
            <p className="text-lg font-bold text-primary-300 mt-1">
              {mySessions.filter((s) => s.status === "COMPLETED").length}
            </p>
          </div>
        </div>

        {/* Input Cepat Kode Bon */}
        <JoinBonInput />

        {/* Link ke Vacation / Agenda Plans */}
        <Link
          href="/agenda"
          className="relative p-4 rounded-xl border border-secondary-800 bg-secondary-950/15 hover:bg-secondary-950/30 transition-all active:scale-[0.99] flex items-center justify-between gap-3 shrink-0 min-h-14"
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

        {/* Daftar Sesi Split Bill */}
        <div className="flex-1 flex flex-col min-h-0 gap-3">
          <h2 className="text-xs font-semibold text-text-100 uppercase tracking-wider">List Pete-Petean Lo</h2>
          <div className="flex-1 flex flex-col min-h-0 border border-secondary-800 p-3 rounded-xl bg-secondary-950/30">

            {mySessions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-secondary-800 rounded-xl space-y-3 bg-secondary-950/40">
                <p className="text-text-300 text-2xs max-w-50 mx-auto leading-relaxed">
                  Sepi amat, belum ada patungan nih. Yuk scan struk bareng geng lo biar gak ada drama!
                </p>
                <Link
                  href="/pete-pete/new"
                  className="inline-flex items-center justify-center px-5 py-3 min-h-11 rounded-lg bg-primary hover:bg-primary-600 text-text-950 font-bold text-xs transition-all active:scale-[0.96]"
                >
                  Scan Struk Sekarang
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pb-16 space-y-3 scrollbar-hide">
                {mySessions.map((session) => {
                  const totalMembers = session.members.length;
                  const paidMembers = session.members.filter((m) => m.isPaid).length;
                  const unpaidMembers = totalMembers - paidMembers;
                  const isAllPaid = totalMembers > 0 && unpaidMembers === 0;
                  const cleanTitle = session.title.replace(/^PETE-PETE\s*[-–—:]?\s*/i, "").trim() || session.merchantName || session.title;

                  return (
                    <div
                      key={session.id}
                      className="relative p-4 rounded-xl border border-secondary-800 bg-secondary-950/20 hover:bg-secondary-950/40 hover:border-primary-600/40 transition-all flex flex-col gap-3 group cursor-pointer"
                    >
                      {/* Klik area card membuka bagi tagihan */}
                      <Link
                        href={`/pete-pete/${session.id}/split`}
                        className="absolute inset-0 z-0 rounded-xl"
                        aria-label={`Bagi tagihan ${cleanTitle}`}
                      />

                      {/* Header: Icon, Judul, Merchant/Kode, dan Status */}
                      <div className="relative z-10 pointer-events-none flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 shrink-0">
                            <ReceiptCheck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-sm text-text-50 group-hover:text-primary-400 transition-colors wrap-break-word">
                              {cleanTitle}
                            </h3>
                            <p className="text-2xs text-text-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                              {session.merchantName && session.merchantName.toLowerCase() !== cleanTitle.toLowerCase() ? (
                                <>
                                  <span className="font-medium text-text-300">{session.merchantName}</span>
                                  <span className="text-secondary-700">•</span>
                                </>
                              ) : null}
                              <span>Kode: <strong className="font-mono text-text-200 font-semibold">{session.inviteCode}</strong></span>
                            </p>
                          </div>
                        </div>
                        <Badge
                          color={
                            session.status === "COMPLETED"
                              ? "success"
                              : session.status === "CANCELLED"
                                ? "error"
                                : "brand"
                          }
                          size="sm"
                          type="pill-color"
                          className="font-bold text-2xs shrink-0"
                        >
                          {session.status === "COMPLETED"
                            ? "Kelar"
                            : session.status === "CANCELLED"
                              ? "Batal"
                              : "Draft"}
                        </Badge>
                      </div>

                      {/* Info Tagihan & Sohib Progress */}
                      <div className="relative z-10 pointer-events-none pt-2.5 pb-0.5 border-t border-secondary-800/80 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-3xs uppercase tracking-wider text-text-400 font-bold block">Total Tagihan</span>
                          <span className="text-sm sm:text-base font-extrabold text-primary-400 whitespace-nowrap block mt-0.5">
                            Rp {Number(session.totalAmount).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                          <Badge color="gray" size="sm" type="pill-color" className="font-semibold text-2xs">
                            {totalMembers} Sohib
                          </Badge>
                          {isAllPaid ? (
                            <Badge color="success" size="sm" type="pill-color" className="font-semibold text-2xs">
                              Lunas
                            </Badge>
                          ) : paidMembers > 0 ? (
                            <Badge color="warning" size="sm" type="pill-color" className="font-semibold text-2xs">
                              {paidMembers}/{totalMembers} Bayar
                            </Badge>
                          ) : (
                            <Badge color="gray" size="sm" type="pill-color" className="font-semibold text-2xs">
                              Belum Bayar
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons (Thumb friendly min 44px tap target) */}
                      <div className="relative z-10 grid grid-cols-2 gap-2 pt-0.5">
                        <Button
                          href={`/pete-pete/${session.id}/split`}
                          color="primary"
                          size="xs"
                          noTextPadding
                          className="w-full min-h-11 h-11 rounded-lg font-bold text-xs active:scale-[0.96] transition-transform"
                        >
                          <span className="inline-flex items-center justify-center gap-1.5">
                            <Divide01 className="w-4 h-4 shrink-0" />
                            <span>Bagi Tagihan</span>
                          </span>
                        </Button>
                        <Button
                          href={`/pete-pete/${session.id}/items`}
                          color="secondary"
                          size="xs"
                          noTextPadding
                          className="w-full min-h-11 h-11 rounded-lg font-semibold text-xs active:scale-[0.96] transition-transform"
                        >
                          <span className="inline-flex items-center justify-center gap-1.5">
                            <File06 className="w-4 h-4 shrink-0" />
                            <span>Cek Menu</span>
                          </span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button (Thumb friendly 56px FAB in thumb zone) */}
      <div className="fixed bottom-6 max-w-md w-full px-5 flex justify-end z-30 pointer-events-none">
        <Button
          href="/pete-pete/new"
          color="primary"
          aria-label="Scan struk baru"
          className="shadow-2xl shadow-primary/45 rounded-full w-14 h-14 min-w-14 min-h-14 flex items-center justify-center p-0 hover:scale-105 active:scale-[0.96] transition-transform pointer-events-auto"
        >
          <Plus className="w-7 h-7 text-text-950" />
        </Button>
      </div>
    </main>
  );
}
