import { prisma } from "@/lib/prisma";

// Yasaklı kelimeleri kısa süreli cache'ler (her istekte DB'ye gitmesin).
let cache: { words: string[]; at: number } | null = null;
const TTL_MS = 60_000;

export async function getBannedWords(): Promise<string[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.words;
  const rows = await prisma.bannedWord.findMany({ select: { word: true } });
  cache = { words: rows.map((r) => r.word.toLocaleLowerCase("tr-TR")), at: Date.now() };
  return cache.words;
}

/** Metinde yasaklı kelime varsa ilkini döndürür, yoksa null. */
export async function findBannedWord(text: string): Promise<string | null> {
  if (!text) return null;
  const lower = text.toLocaleLowerCase("tr-TR");
  const words = await getBannedWords();
  for (const w of words) {
    if (w && lower.includes(w)) return w;
  }
  return null;
}

export const BANNED_CONTENT_MESSAGE =
  "İçeriğiniz uygun olmayan bir ifade içeriyor. Lütfen düzenleyip tekrar deneyin.";
