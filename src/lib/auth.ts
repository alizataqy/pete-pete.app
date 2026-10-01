import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (resendApiKey) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || "Ceban Pertama <onboarding@resend.dev>",
              to: user.email,
              subject: "Reset Password Akun Ceban Pertama Lo",
              html: `
                <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0b0a1a; color: #ebe9fc; border-radius: 12px; border: 1px solid #242250;">
                  <h2 style="color: #847ee7; margin-top: 0;">Reset Password Ceban Pertama</h2>
                  <p>Halo <strong>${user.name || "Sohib"}</strong>,</p>
                  <p>Ada yang minta reset password buat akun lo nih. Klik tombol di bawah ini buat bikin password baru:</p>
                  <div style="margin: 28px 0;">
                    <a href="${url}" style="background: #5b54de; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                      Ganti Password Sekarang
                    </a>
                  </div>
                  <p style="color: #8779ec; font-size: 13px;">Link ini cuma berlaku 1 jam ya. Kalo bukan lo yang minta, cuekin aja.</p>
                  <hr style="border: none; border-top: 1px solid #242250; margin: 24px 0;" />
                  <p style="color: #afa6f2; font-size: 11px;">Ceban Pertama — Split bill online anti drama.</p>
                </div>
              `,
            }),
          });
        } catch (error) {
          console.error("[Auth] Gagal kirim email reset password:", error);
        }
      } else {
        console.log(`\n========================================\n[DEV MODE - RESET PASSWORD LINK]\nUser: ${user.email}\nURL: ${url}\n========================================\n`);
      }
    },
  },
});
