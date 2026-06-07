import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Kullanım Şartları",
  description:
    "AnlaşmalıEvlilik.com üyelik, ilan, profil, mesajlaşma ve güvenli kullanım koşulları.",
  path: "/kullanim-sartlari",
  keywords: ["evlilik sitesi kullanım şartları", "üyelik koşulları", "ilan kuralları"],
});

export default async function TermsPage() {
  const s = await getSiteSettings();
  const siteName = s.siteName;
  const email = s.contactEmail || "iletisim@anlasmalievlilik.com";

  // Admin panelinden özel (uzun) metin girildiyse onu göster
  const custom = s.termsText && s.termsText.trim().length > 200;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Kullanım Şartları</h1>
      <p className="mt-2 text-sm text-muted-foreground">Yürürlük tarihi: 2026</p>

      {custom ? (
        <p className="mt-6 whitespace-pre-line leading-relaxed text-foreground/90">
          {s.termsText}
        </p>
      ) : (
        <div className="mt-6 space-y-6 leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold">1. Taraflar ve Kabul</h2>
            <p className="mt-2">
              Bu Kullanım Şartları ({siteName} — “Platform”) ile Platform’a üye
              olan veya Platform’u kullanan gerçek kişiler (“Kullanıcı”)
              arasındaki hak ve yükümlülükleri düzenler. Platform’a üye olarak
              veya Platform’u kullanarak bu şartları okuduğunuzu, anladığınızı ve
              kabul ettiğinizi beyan edersiniz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Hizmetin Tanımı</h2>
            <p className="mt-2">
              Platform; ciddi ilişki ve evlilik amacıyla bireylerin profil
              oluşturmasına, ilan vermesine ve birbirleriyle mesajlaşmasına
              olanak tanıyan bir tanışma ve eşleşme hizmetidir. Platform yalnızca
              kullanıcıları bir araya getiren bir aracıdır; kullanıcılar
              arasındaki ilişkiden, görüşmelerden veya bunların sonuçlarından
              sorumlu değildir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Üyelik Koşulları</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Üye olabilmek için <strong>18 yaşından büyük</strong> olmanız gerekir.</li>
              <li>Verdiğiniz bilgilerin doğru, güncel ve size ait olması zorunludur.</li>
              <li>Hesap güvenliğinizden (parolanızın gizliliği dâhil) siz sorumlusunuz.</li>
              <li>Bir kişi yalnızca kendi adına hesap açabilir; sahte/yanıltıcı profil yasaktır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Kullanıcı Yükümlülükleri ve Yasaklar</h2>
            <p className="mt-2">Aşağıdaki davranışlar kesinlikle yasaktır:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Hakaret, taciz, tehdit, ayrımcılık veya nefret söylemi.</li>
              <li>Sahte kimlik kullanmak, başkası adına hesap açmak.</li>
              <li>Müstehcen, yasa dışı veya üçüncü kişilerin haklarını ihlal eden içerik paylaşmak.</li>
              <li>Ticari reklam, spam, dolandırıcılık veya para talep etmek.</li>
              <li>Platform’un güvenliğini tehdit eden yazılım/işlem kullanmak.</li>
            </ul>
            <p className="mt-2">
              Bu kurallara aykırılık halinde içerik kaldırılabilir ve hesap askıya
              alınabilir veya kapatılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. İlanlar ve İçerik</h2>
            <p className="mt-2">
              Kullanıcıların oluşturduğu profil, ilan ve mesaj gibi içeriklerin
              sorumluluğu tamamen içeriği oluşturan kullanıcıya aittir. Platform,
              uygunsuz içerikleri önceden bildirim yapmaksızın inceleme,
              düzenleme veya yayından kaldırma hakkını saklı tutar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Ücretlendirme</h2>
            <p className="mt-2">
              Temel üyelik ücretsizdir. İleride sunulabilecek ücretli özellikler
              için ücret ve koşullar, satın alma öncesinde Platform üzerinde açıkça
              belirtilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Fikri Mülkiyet</h2>
            <p className="mt-2">
              Platform’a ait tüm yazılım, tasarım, logo ve içerikler {siteName}’a
              veya lisans verenlerine aittir; izinsiz kullanılamaz, kopyalanamaz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Sorumluluğun Sınırlandırılması</h2>
            <p className="mt-2">
              Platform, kullanıcıların verdiği bilgilerin doğruluğunu garanti
              etmez ve kullanıcılar arasındaki etkileşimlerden doğabilecek
              zararlardan sorumlu tutulamaz. Kullanıcılar, tanıştıkları kişilerle
              ilgili gerekli özeni göstermek ve güvenliklerini sağlamakla
              yükümlüdür. Hizmet “olduğu gibi” sunulur; kesintisizlik garanti
              edilmez.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. Hesabın Askıya Alınması ve Fesih</h2>
            <p className="mt-2">
              Bu şartların ihlali halinde Platform, hesabınızı askıya alabilir
              veya kapatabilir. Dilediğiniz zaman hesabınızın silinmesini talep
              edebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">10. Gizlilik</h2>
            <p className="mt-2">
              Kişisel verilerinizin işlenmesine ilişkin esaslar{" "}
              <a href="/gizlilik-politikasi" className="text-primary hover:underline">
                Gizlilik Politikası
              </a>{" "}
              içinde açıklanmıştır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">11. Şartlarda Değişiklik</h2>
            <p className="mt-2">
              Platform, bu şartları zaman zaman güncelleyebilir. Güncel sürüm bu
              sayfada yayımlandığı anda yürürlüğe girer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">12. Uygulanacak Hukuk ve Yetki</h2>
            <p className="mt-2">
              Bu şartlar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda
              Türkiye mahkemeleri ve icra daireleri yetkilidir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">13. İletişim</h2>
            <p className="mt-2">
              Sorularınız için: <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
