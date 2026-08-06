import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import { Camera01, Users01, MessageChatCircle } from "@untitledui/icons";

export default async function Home() {
  // Ambil data session Better Auth dari incoming request headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden text-center select-none">
      <div className="w-full z-10 space-y-6 max-w-sm mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-alice-blue-500/20 bg-alice-blue-950 text-alice-blue-400 text-xs font-medium">
          PETE-PETE &mdash; Split Bill buat geng lo
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-alice-blue-400">
            PETE-PETE
          </h1>
          <p className="text-xs text-jet-black-300 leading-relaxed max-w-xs mx-auto">
            Udah ga perlu ribet ngitung-ngitung tagihan. Foto struk, tandain siapa mesen apa, terus share ke grup. Beres.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 pt-3">
          {user ? (
            <div className="space-y-4 w-full">
              <div className="p-3 rounded-xl border border-jet-black-900 bg-jet-black-900/40 flex items-center gap-3 text-left">
                {user.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User Avatar"}
                    className="w-10 h-10 rounded-full border border-alice-blue-500/50"
                  />
                )}
                <div>
                  <p className="text-[10px] text-jet-black-400">Woi, balik lagi nih!</p>
                  <p className="text-xs font-semibold text-jet-black-100">{user.name}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 rounded-lg bg-alice-blue-600 hover:bg-alice-blue-700 text-jet-black-50 text-xs font-semibold shadow-md shadow-alice-blue-500/10 active:scale-95 transition-all text-center"
                >
                  Masuk Dashboard
                </Link>
                <LogoutButton
                  className="w-full py-2.5 rounded-lg border border-jet-black-900 hover:bg-jet-black-900/50 text-jet-black-300 hover:text-jet-black-100 text-xs font-semibold active:scale-95 transition-all text-center"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link
                href="/login"
                className="w-full py-3 rounded-xl bg-alice-blue-600 hover:bg-alice-blue-700 text-jet-black-50 text-xs font-semibold shadow-md shadow-alice-blue-500/10 active:scale-95 transition-all text-center"
              >
                Cobain Sekarang — Gratis!
              </Link>
              <Link
                href="/prd.md"
                className="w-full py-3 rounded-xl border border-lilac-ash-800 hover:bg-jet-black-900 text-jet-black-300 hover:text-jet-black-100 text-xs font-semibold active:scale-95 transition-all text-center"
              >
                Baca Dokumentasi
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Feature Badges / Highlights */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-6 text-[10px] text-jet-black-400">
        <div className="flex items-center gap-1">
          <Camera01 className="w-3.5 h-3.5 text-alice-blue-400" />
          <span>AI OCR Struk</span>
        </div>
        <div className="flex items-center gap-1">
          <Users01 className="w-3.5 h-3.5 text-alice-blue-400" />
          <span>Split Bill Geng</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageChatCircle className="w-3.5 h-3.5 text-alice-blue-400" />
          <span>Share WhatsApp</span>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-alice-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
    </main>
  );
}
