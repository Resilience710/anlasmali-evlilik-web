import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { addBannedWordAction } from "@/app/_actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CatalogDeleteButton } from "@/components/admin/simple-action-buttons";

export const metadata: Metadata = { title: "Yasaklı Kelimeler — Yönetim" };

export default async function AdminBannedWordsPage() {
  await requireAdmin(); // yalnız admin
  const words = await prisma.bannedWord.findMany({
    orderBy: { word: "asc" },
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Yasaklı Kelimeler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bu kelimeleri içeren ilan ve mesajlar otomatik olarak engellenir
          (kullanıcı içeriği gönderemez). Büyük/küçük harf duyarsızdır.
        </p>
      </div>

      <form
        action={addBannedWordAction}
        className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="text-sm text-muted-foreground">Yeni kelime</label>
          <Input
            name="word"
            required
            minLength={2}
            maxLength={60}
            placeholder="Örn: dolandırıcı"
            className="mt-1.5"
          />
        </div>
        <Button type="submit">Ekle</Button>
      </form>

      {words.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-10 text-center text-muted-foreground">
          Henüz yasaklı kelime yok.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {words.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5"
            >
              <span className="text-sm">{w.word}</span>
              <CatalogDeleteButton kind="bannedWord" id={w.id} label="" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
