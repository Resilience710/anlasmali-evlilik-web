import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Yasal Prosedür ve Başvuru Süreçleri",
  description:
    "AnlaşmalıEvlilik.net yasal prosedürleri: içerik şikayeti ve kaldırma, KVKK başvurusu, hukuka aykırı içerik bildirimi ve yetkili mercilere bilgi paylaşımı.",
  path: "/yasal-prosedur",
  keywords: [
    "yasal prosedür",
    "içerik kaldırma talebi",
    "KVKK başvuru",
    "hukuka aykırı içerik bildirimi",
  ],
});

export default async function LegalProcedurePage() {
  const s = await getSiteSettings();
  const site = s.siteName;
  const email = s.contactEmail || "iletisim@anlasmalievlilik.net";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">
        Yasal Prosedür ve Başvuru Süreçleri
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Yürürlük tarihi: 2026</p>

      <div className="mt-6 space-y-6 leading-relaxed text-foreground/90">
        <section>
          <p>
            {site}, içeriği tümüyle kullanıcılar tarafından oluşturulan bir
            tanışma ve eşleşme platformudur. Aşağıda; içerik şikayeti, kişisel
            veri başvurusu ve hukuki taleplere ilişkin izlenecek yasal süreçler
            açıklanmıştır. Tüm başvurular değerlendirilir ve mevzuatta öngörülen
            süreler içinde yanıtlanır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            1. İçerik Şikayeti ve Kaldırma Talebi
          </h2>
          <p className="mt-2">
            Platformda yer alan bir ilan, profil veya mesajın; hukuka aykırı
            olduğunu, haklarınızı ihlal ettiğini ya da kurallarımıza aykırı
            olduğunu düşünüyorsanız iki yolla bildirebilirsiniz:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              İlgili ilan/profil/mesaj üzerindeki <strong>“Şikayet Et”</strong>{" "}
              seçeneğini kullanarak (sebep belirterek),
            </li>
            <li>
              <a href={`mailto:${email}`} className="text-primary hover:underline">
                {email}
              </a>{" "}
              adresine; şikayet konusu içeriğin bağlantısını ve gerekçenizi
              içeren bir e-posta göndererek.
            </li>
          </ul>
          <p className="mt-2">
            Bildirimler en kısa sürede incelenir; uygunsuz bulunan içerikler
            önceden uyarı yapılmaksızın yayından kaldırılır ve gerektiğinde ilgili
            üyenin hesabı askıya alınır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            2. Hukuka Aykırı İçerik Bildirimi (5651 sayılı Kanun)
          </h2>
          <p className="mt-2">
            5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi
            hakkında Kanun kapsamında; kişilik haklarınızın ihlal edildiğini
            düşünüyorsanız, ihlale konu içeriğin kaldırılması için yukarıdaki
            e-posta adresi üzerinden başvurabilirsiniz. Başvurunuzda kimlik ve
            iletişim bilgilerinizle birlikte içeriğin tam adresini (URL) ve ihlal
            gerekçenizi belirtmeniz, sürecin hızlanmasını sağlar.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. KVKK Başvuru Süreci</h2>
          <p className="mt-2">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki
            haklarınızı (verilerinize erişim, düzeltme, silme vb.) kullanmak için
            taleplerinizi{" "}
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>{" "}
            adresine iletebilirsiniz. Başvurularınız en geç yasal süre içinde
            (kural olarak 30 gün) yanıtlanır. Ayrıntılar için{" "}
            <Link
              href="/gizlilik-politikasi"
              className="text-primary hover:underline"
            >
              Gizlilik Politikası
            </Link>{" "}
            sayfamızı inceleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            4. Yetkili Mercilere Bilgi Paylaşımı
          </h2>
          <p className="mt-2">
            {site}, kullanıcıların gerçekleştirdiği işlemlere (üyelik, ilan,
            mesajlaşma) ait kayıtları ve IP adresi gibi teknik bilgileri
            saklamaktadır. Yasalara aykırı bir durum, suç şüphesi veya yetkili
            adli/idari mercilerin usulüne uygun talebi halinde bu bilgiler ilgili
            kurumlarla paylaşılabilir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. İtiraz ve İletişim</h2>
          <p className="mt-2">
            Hesabınıza veya içeriğinize ilişkin alınan bir karara itiraz etmek ya
            da her türlü yasal talebinizi iletmek için bizimle{" "}
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>{" "}
            üzerinden iletişime geçebilirsiniz. Ayrıca{" "}
            <Link href="/kullanim-sartlari" className="text-primary hover:underline">
              Kullanım Şartları
            </Link>{" "}
            ve{" "}
            <Link href="/sorumluluk-reddi" className="text-primary hover:underline">
              Sorumluluk Reddi
            </Link>{" "}
            sayfalarımız da ilgili kuralları içerir.
          </p>
        </section>
      </div>
    </div>
  );
}
