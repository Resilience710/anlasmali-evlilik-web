import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Gizlilik Politikası ve KVKK",
  description:
    "AnlaşmalıEvlilik.com kişisel veri işleme, KVKK, çerez, üyelik, profil, ilan ve mesajlaşma gizliliği politikası.",
  path: "/gizlilik-politikasi",
  keywords: ["KVKK evlilik sitesi", "gizlilik politikası", "kişisel veri güvenliği"],
});

export default async function PrivacyPage() {
  const s = await getSiteSettings();
  const siteName = s.siteName;
  const email = s.contactEmail || "iletisim@anlasmalievlilik.com";
  const custom = s.privacyText && s.privacyText.trim().length > 200;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Gizlilik Politikası</h1>
      <p className="mt-2 text-sm text-muted-foreground">Yürürlük tarihi: 2026</p>

      {custom ? (
        <p className="mt-6 whitespace-pre-line leading-relaxed text-foreground/90">
          {s.privacyText}
        </p>
      ) : (
        <div className="mt-6 space-y-6 leading-relaxed text-foreground/90">
          <section>
            <p>
              {siteName} olarak kişisel verilerinizin güvenliğine önem veriyoruz.
              Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması
              Kanunu (“KVKK”) kapsamında kişisel verilerinizin nasıl toplandığını,
              işlendiğini ve korunduğunu açıklar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">1. Veri Sorumlusu</h2>
            <p className="mt-2">
              Kişisel verileriniz, veri sorumlusu sıfatıyla {siteName} tarafından
              aşağıda belirtilen amaç ve kapsamda işlenmektedir. İletişim:{" "}
              <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. İşlenen Kişisel Veriler</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Kimlik/Profil:</strong> ad soyad, takma ad, cinsiyet, yaş, medeni hal, eğitim, meslek, boy/kilo vb. profilde belirttiğiniz bilgiler.</li>
              <li><strong>İletişim:</strong> e-posta adresi, telefon numarası.</li>
              <li><strong>Görsel:</strong> yüklediğiniz profil/ilan fotoğrafları.</li>
              <li><strong>İçerik:</strong> oluşturduğunuz ilanlar ve gönderdiğiniz mesajlar.</li>
              <li><strong>İşlem/Kullanım:</strong> giriş kayıtları, son görülme zamanı ve site kullanımına dair teknik veriler.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. İşleme Amaçları</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Üyelik oluşturma, kimlik doğrulama ve hesabın yönetilmesi.</li>
              <li>Tanışma/eşleşme hizmetinin sunulması; ilan ve mesajlaşma işlevleri.</li>
              <li>Güvenlik, kötüye kullanımın önlenmesi ve şikâyetlerin değerlendirilmesi.</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi ve hizmetin iyileştirilmesi.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Hukuki Sebepler</h2>
            <p className="mt-2">
              Verileriniz KVKK m.5 kapsamında; sözleşmenin kurulması/ifası, hukuki
              yükümlülük, meşru menfaat ve gerektiğinde açık rızanız hukuki
              sebeplerine dayanılarak işlenir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Verilerin Aktarılması</h2>
            <p className="mt-2">
              Verileriniz; barındırma (hosting), veritabanı ve görsel depolama
              gibi hizmetleri sağlayan tedarikçilerle, yalnızca hizmetin sunulması
              amacıyla ve gerekli güvenlik tedbirleri alınarak paylaşılabilir.
              Yasal zorunluluk halinde yetkili kurumlarla paylaşılabilir. Profil ve
              ilan bilgileriniz, niteliği gereği diğer üyeler tarafından
              görüntülenebilir; <strong>telefon ve e-posta gibi iletişim
              bilgileriniz herkese açık gösterilmez.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Toplama Yöntemi</h2>
            <p className="mt-2">
              Kişisel verileriniz; üyelik ve profil formları, ilan oluşturma,
              mesajlaşma ve site kullanımınız sırasında elektronik ortamda
              toplanır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Saklama Süresi</h2>
            <p className="mt-2">
              Verileriniz, üyeliğiniz devam ettiği sürece ve ilgili mevzuatta
              öngörülen süreler boyunca saklanır; bu sürelerin sonunda silinir,
              yok edilir veya anonim hale getirilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Çerezler</h2>
            <p className="mt-2">
              Oturum yönetimi ve temel işlevler için zorunlu çerezler kullanılır.
              Tarayıcı ayarlarınızdan çerez tercihlerinizi yönetebilirsiniz; ancak
              zorunlu çerezlerin devre dışı bırakılması bazı işlevleri etkileyebilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. Veri Güvenliği</h2>
            <p className="mt-2">
              Parolalar şifrelenerek saklanır, veri aktarımı güvenli bağlantı (SSL)
              ile yapılır ve yetkisiz erişime karşı uygun teknik/idari tedbirler
              alınır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">10. İlgili Kişinin Hakları (KVKK m.11)</h2>
            <p className="mt-2">KVKK m.11 uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>Eksik/yanlış işlenmişse düzeltilmesini isteme,</li>
              <li>Silinmesini veya yok edilmesini isteme,</li>
              <li>İşlemeye itiraz etme ve zararın giderilmesini talep etme.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">11. Başvuru</h2>
            <p className="mt-2">
              Haklarınıza ilişkin taleplerinizi{" "}
              <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>{" "}
              adresine iletebilirsiniz. Talepleriniz en kısa sürede ve en geç yasal
              süreler içinde yanıtlanır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">12. Değişiklikler</h2>
            <p className="mt-2">
              Bu Gizlilik Politikası zaman zaman güncellenebilir; güncel sürüm bu
              sayfada yayımlandığında yürürlüğe girer.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
