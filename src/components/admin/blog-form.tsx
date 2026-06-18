import Link from "next/link";
import { upsertBlogPostAction } from "@/app/_actions/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type BlogPostData = {
  id: string;
  slug: string;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  excerpt: string | null;
  keyword: string | null;
  content: string;
  coverImageUrl: string | null;
  order: number;
  published: boolean;
};

export function BlogForm({ post }: { post?: BlogPostData }) {
  const f = (k: keyof BlogPostData) => (post ? (post[k] ?? "") : "");

  return (
    <form action={upsertBlogPostAction} className="flex flex-col gap-4">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div>
        <label className="text-sm font-medium">Başlık (H1)</label>
        <Input
          name="title"
          required
          defaultValue={f("title") as string}
          className="mt-1.5"
          placeholder="Örn: Anlaşmalı Evlilik Nedir?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">
            URL (slug){" "}
            <span className="text-muted-foreground">— boşsa başlıktan üretilir</span>
          </label>
          <Input
            name="slug"
            defaultValue={f("slug") as string}
            className="mt-1.5"
            placeholder="anlasmali-evlilik-nedir"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Anahtar Kelime (SEO)</label>
          <Input
            name="keyword"
            defaultValue={f("keyword") as string}
            className="mt-1.5"
            placeholder="anlaşmalı evlilik nedir"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">
          Meta Başlık <span className="text-muted-foreground">(&lt;title&gt;)</span>
        </label>
        <Input
          name="metaTitle"
          defaultValue={f("metaTitle") as string}
          className="mt-1.5"
          placeholder="Anlaşmalı Evlilik Nedir? | Detaylı Rehber"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Meta Açıklama</label>
        <Textarea
          name="metaDescription"
          defaultValue={f("metaDescription") as string}
          className="mt-1.5"
          rows={2}
          placeholder="Arama sonuçlarında görünecek kısa açıklama (155 karakter)."
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Özet <span className="text-muted-foreground">— liste kartında görünür</span>
        </label>
        <Textarea
          name="excerpt"
          defaultValue={f("excerpt") as string}
          className="mt-1.5"
          rows={2}
          placeholder="Boş bırakılırsa meta açıklama kullanılır."
        />
      </div>

      <div>
        <label className="text-sm font-medium">İçerik (Markdown)</label>
        <p className="mt-1 text-xs text-muted-foreground">
          Başlık için <code>## Başlık</code> veya <code>### Alt başlık</code>, madde için{" "}
          <code>- madde</code>, kalın için <code>**metin**</code>. Boş satır
          paragrafları ayırır.
        </p>
        <Textarea
          name="content"
          required
          defaultValue={f("content") as string}
          className="mt-1.5 min-h-[420px] font-mono text-sm"
          placeholder={"Giriş paragrafı...\n\n## Bir Başlık\n\nParagraf...\n\n- Madde 1\n- Madde 2"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Kapak Görseli URL (opsiyonel)</label>
          <Input
            name="coverImageUrl"
            defaultValue={f("coverImageUrl") as string}
            className="mt-1.5"
            placeholder="/uploads/... veya boş"
          />
        </div>
        <div className="w-28">
          <label className="text-sm font-medium">Sıra</label>
          <Input
            name="order"
            type="number"
            defaultValue={post ? post.order : 0}
            className="mt-1.5"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={post ? post.published : true}
          className="h-4 w-4 accent-[var(--color-primary)]"
        />
        Yayında (işaretli değilse taslak — sitede görünmez)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit">{post ? "Kaydet" : "Yayınla"}</Button>
        <Link
          href="/admin/blog"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}
