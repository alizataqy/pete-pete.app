/**
 * Helper untuk membuat URL Dicebear Dylan avatar secara konsisten
 */
export function getAvatarUrl(seed?: string | null): string | undefined {
  if (!seed || !seed.trim()) return undefined;
  return `https://api.dicebear.com/9.x/dylan/svg?seed=${encodeURIComponent(seed.trim())}`;
}
