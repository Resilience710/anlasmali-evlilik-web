import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getSiteSettings } from "@/lib/site";
import { ContactForm } from "@/components/contact-form";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "İletişim - AnlaşmalıEvlilik.net",
  description:
    "AnlaşmalıEvlilik.net üyelik, ilan, şikayet, güvenlik ve iş birliği talepleri için iletişim sayfası.",
  path: "/iletisim",
  keywords: ["evlilik sitesi iletişim", "üyelik destek", "ilan şikayet"],
});

const DEFAULT_TEXT =
  "Şikâyet, reklam/iş birliği ve diğer talepleriniz için bize ulaşabilirsiniz. Mesajınızı sağdaki formdan iletin, en kısa sürede dönüş yapalım.";

export default async function ContactPage() {
  const s = await getSiteSettings();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">İletişim</h1>
      <p className="mt-2 text-muted-foreground">Sorularınız için bize ulaşın.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Sol: metin + iletişim bilgileri */}
        <div className="flex flex-col gap-5">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:p-6">
            <p className="whitespace-pre-line break-words leading-relaxed text-foreground/90">
              {s.contactText || DEFAULT_TEXT}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {s.contactEmail && (
              <a
                href={`mailto:${s.contactEmail}`}
                className="inline-flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm hover:bg-elevated"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Mail className="size-4" />
                </span>
                {s.contactEmail}
              </a>
            )}
          </div>
        </div>

        {/* Sağ: form */}
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:p-6">
          <h2 className="mb-4 font-semibold">Bize Yazın</h2>
          <ContactForm />
        </div>
      </div>

      {/* Neden Bu Platformu Kurduk? */}
      <section className="mt-10 rounded-[var(--radius-card)] border border-border bg-surface p-5 sm:p-8">
        <h2 className="text-xl font-bold sm:text-2xl">
          Neden Bu Platformu Kurduk?
        </h2>
        <div className="mt-4 space-y-4 leading-relaxed text-foreground/90">
          <p>
            Her insanın evlilikten beklentisi farklıdır. Kimi hayatını
            paylaşacağı bir eş ararken, kimi ortak hedeflere ve benzer yaşam
            planlarına sahip bir kişiyle tanışmak ister.
          </p>
          <p>
            Platformumuz; ciddi evlilik düşünen, hayatını düzenlemek isteyen,
            çocuk sahibi olmayı hedefleyen veya yaşam koşulları nedeniyle
            evlilik planı yapan kişilerin güvenli ve saygılı bir ortamda
            tanışabilmesi amacıyla kurulmuştur.
          </p>
          <p>
            Burada amaç; dürüstlük, karşılıklı anlayış ve şeffaf iletişim
            temelinde insanları bir araya getirmektir. Üyelerimiz beklentilerini
            açıkça belirterek benzer hedeflere sahip kişilerle iletişim kurabilir
            ve geleceğe yönelik ortak kararlar alabilir.
          </p>
          <p>
            Platformumuz tamamen ücretsizdir. Üyelerimiz herhangi bir üyelik
            ücreti veya gizli maliyet olmadan kayıt olabilir, profil oluşturabilir
            ve diğer üyelerle iletişim kurabilir.
          </p>
          <p>
            Mutlu ve sağlam temeller üzerine kurulan birlikteliklerin başlangıç
            noktası olmayı hedefliyoruz.
          </p>
        </div>
      </section>
    </div>
  );
}
