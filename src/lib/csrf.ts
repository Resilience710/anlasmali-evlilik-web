/**
 * Basit same-origin (CSRF) kontrolü: Origin başlığı varsa host ile eşleşmeli.
 * Origin yoksa (bazı meşru istekler) izin verir; eşleşmiyorsa reddeder.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
