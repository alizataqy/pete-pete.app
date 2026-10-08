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
                <body style="margin: 0; padding: 0; background-color: #050514; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050514; min-height: 100vh;">
                    <tr>
                      <td align="center" style="padding: 48px 16px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #0b0a1a; border: 1px solid #242250; border-radius: 12px; overflow: hidden;">
                          <!-- Header -->
                          <tr>
                            <td style="padding: 24px 28px 20px;">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="vertical-align: middle; padding-right: 10px;">
                                    <img src="${logoUrl}" width="28" height="28" alt="Ceban Pertama" style="display: block; width: 28px; height: 28px; border-radius: 6px; border: 0;" />
                                  </td>
                                  <td style="vertical-align: middle;">
                                    <span style="font-size: 15px; font-weight: 700; color: #ebe9fc; letter-spacing: -0.01em;">
                                      Ceban Pertama
                                    </span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>

                          <!-- Content -->
                          <tr>
                            <td style="padding: 0 28px 28px;">
                              <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #ebe9fc; line-height: 1.3; letter-spacing: -0.02em;">
                                Reset password akun lo
                              </h1>
                              <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #ebe9fc;">
                                Halo ${safeName},
                              </p>
                              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #afa6f2;">
                                Kami menerima permintaan untuk mereset password akun Ceban Pertama lo. Klik tombol di bawah untuk membuat password baru:
                              </p>

                              <!-- CTA Button -->
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                                <tr>
                                  <td align="center" style="border-radius: 8px; background-color: #5b54de;">
                                    <a href="${url}" target="_blank" style="display: inline-block; padding: 11px 22px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                                      Ganti Password
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <!-- Fallback Link -->
                              <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #8779ec;">
                                Atau buka langsung tautan ini di browser:
                              </p>
                              <p style="margin: 0 0 24px; font-size: 12px; line-height: 1.5; word-break: break-all;">
                                <a href="${url}" style="color: #847ee7; text-decoration: underline;">
                                  ${url}
                                </a>
                              </p>

                              <!-- Notice -->
                              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #8779ec; border-top: 1px solid #242250; padding-top: 16px;">
                                Tautan ini hanya berlaku selama 1 jam. Kalau lo tidak meminta reset password, lo bisa abaikan email ini dengan aman.
                              </p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="padding: 16px 28px; background-color: #15132d; border-top: 1px solid #242250;">
                              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #8779ec;">
                                Ceban Pertama — Split bill online anti drama. Email ini dikirim otomatis, mohon tidak membalas langsung.
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
