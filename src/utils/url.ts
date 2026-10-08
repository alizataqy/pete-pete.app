/**
 * Helper utility untuk resolusi URL aplikasi dinamis berdasarkan environment variable NEXT_PUBLIC_APP_URL.
 */

/**
 * Mengambil base URL aplikasi secara dinamis dari NEXT_PUBLIC_APP_URL.
 * Menghasilkan URL lengkap dengan protokol (http/https).
 */
export function getAppUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return envUrl.startsWith("http://") || envUrl.startsWith("https://")
    ? envUrl
    : `https://${envUrl}`;
}

/**
 * Mengambil host/domain bersih aplikasi tanpa protokol dan trailing slash.
 * Contoh: "cebanpertama.com" atau "localhost:3000".
 */
export function getAppHost(): string {
  return getAppUrl().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}
