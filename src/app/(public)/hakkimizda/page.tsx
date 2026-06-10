import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Hakkımızda — Neden Bu Platformu Kurduk?",
  description:
    "AnlaşmalıEvlilik.net'in kuruluş amacı, vizyonu ve üyelerine sunduğu güvenli, ücretsiz tanışma ortamı.",
  path: "/hakkimizda",
  keywords: [
    "hakkımızda",
    "anlaşmalı evlilik platformu",
    "ciddi evlilik sitesi misyon",
  ],
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">
        Neden Bu Platformu Kurduk?
      </h1>

      <div className="mt-6 space-y-5 leading-relaxed text-foreground/90">
        <p>
          Her insanın evlilikten beklentisi farklıdır. Kimi hayatını paylaşacağı
          bir eş ararken, kimi ortak hedeflere ve benzer yaşam planlarına sahip
          bir kişiyle tanışmak ister.
        </p>
        <p>
          Platformumuz; ciddi evlilik düşünen, hayatını düzenlemek isteyen,
          çocuk sahibi olmayı hedefleyen veya yaşam koşulları nedeniyle evlilik
          planı yapan kişilerin güvenli ve saygılı bir ortamda tanışabilmesi
          amacıyla kurulmuştur.
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
    </div>
  );
}
