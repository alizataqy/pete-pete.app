import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { getAppUrl } from "@/utils/url";

const envAppUrl = process.env.NEXT_PUBLIC_APP_URL;
const envBetterAuthUrl = process.env.BETTER_AUTH_URL;

const dynamicOrigins: string[] = [
  "http://localhost:3000",
  "https://*.trycloudflare.com",
];

[envAppUrl, envBetterAuthUrl].forEach((url) => {
  if (url) {
    dynamicOrigins.push(url);
    if (url.startsWith("https://")) {
      dynamicOrigins.push(url.replace("https://", "https://*."));
    }
  }
});

export const auth = betterAuth({
  trustedOrigins: Array.from(new Set(dynamicOrigins)),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (resendApiKey) {
        try {
          const rawFrom = process.env.EMAIL_FROM?.replace(/^["']|["']$/g, "").trim();
          let from = "Ceban Pertama <onboarding@resend.dev>";

          if (rawFrom) {
            if (rawFrom.includes("@")) {
              from = rawFrom;
            } else {
              // Jika di .env hanya diisi nama (misal: "Ceban Pertama"), kombinasikan dengan email default
              from = `${rawFrom} <onboarding@resend.dev>`;
            }
          }

          const rawName = user.name || "Sohib";
          const safeName = rawName.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c] || c));
          const appUrl = getAppUrl();
          const logoUrl = `${appUrl}/icon-192.png`;

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from,
              to: user.email,
              subject: "Reset Password Akun Ceban Pertama Lo",
              html: `
                <!DOCTYPE html>
                <html lang="id">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Reset Password Ceban Pertama</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; min-height: 100vh;">
                    <tr>
                      <td align="center" style="padding: 48px 16px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
                          <!-- Header -->
                          <tr>
                            <td style="padding: 32px 32px 24px;">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="vertical-align: middle; padding-right: 12px;">
                                    <img src="${logoUrl}" width="32" height="32" alt="Ceban Pertama" style="display: block; width: 32px; height: 32px; border-radius: 8px; border: 0;" />
                                  </td>
                                  <td style="vertical-align: middle;">
                                    <span style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em;">
                                      Ceban Pertama
                                    </span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>

                          <!-- Main Content -->
                          <tr>
                            <td style="padding: 0 32px 32px;">
                              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3; letter-spacing: -0.02em;">
                                Bikin Password Baru
                              </h1>
                              <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #0f172a;">
                                Halo <strong>${safeName}</strong>,
                              </p>
                              <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.6; color: #334155;">
                                Ada yang minta reset password akun Ceban Pertama lo. Klik tombol di bawah buat lanjut:
                              </p>

                              <!-- CTA Button -->
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                                <tr>
                                  <td align="center" style="border-radius: 8px; background-color: #3129d6;">
                                    <a href="${url}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                                      Ganti Password
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <!-- Notice -->
                              <p style="margin: 0 0 24px; font-size: 13px; line-height: 1.6; color: #64748b;">
                                Link ini cuma aktif 1 jam. Kalo bukan lo yang minta, cuekin aja email ini. Akun lo tetep aman.
                              </p>

                              <!-- Fallback Link -->
                              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                                <p style="margin: 0 0 6px; font-size: 12px; line-height: 1.5; color: #64748b;">
                                  Kalo tombol di atas gak bisa diklik, salin link ini ke browser lo:
                                </p>
                                <p style="margin: 0; font-size: 12px; line-height: 1.5; word-break: break-all;">
                                  <a href="${url}" style="color: #3129d6; text-decoration: underline;">
                                    ${url}
                                  </a>
                                </p>
                              </div>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="padding: 20px 32px 28px; border-top: 1px solid #f1f5f9; background-color: #f8fafc;">
                              <p style="margin: 0 0 4px; font-size: 12px; line-height: 1.5; color: #64748b;">
                                Ceban Pertama — Split bill online anti drama.
                              </p>
                              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #94a3b8;">
                                Email otomatis dari sistem, gak usah dibalas ya.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
              `,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("[Auth] Resend API Error:", errData);
          }
        } catch (error) {
          console.error("[Auth] Gagal kirim email reset password:", error);
        }
      } else {
        console.log(`\n========================================\n[DEV MODE - RESET PASSWORD LINK]\nUser: ${user.email}\nURL: ${url}\n========================================\n`);
      }
    },
  },
});
