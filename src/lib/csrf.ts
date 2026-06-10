/**
 * Basit same-origin (CSRF) kontrolü: Origin başlığı varsa host ile eşleşmeli.
 * Origin yoksa (bazı meşru istekler) izin verir; eşleşmiyorsa reddeder.
 */
export function isSameOrigin(req: Request): boolean {
  // Bazı proxy'ler başlıkları çiftleyip ", " ile birleştirebilir — ilk değeri al.
  const origin = req.headers.get("origin")?.split(",")[0].trim();
  if (!origin) return true;
  const host = req.headers.get("host")?.split(",")[0].trim();
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
