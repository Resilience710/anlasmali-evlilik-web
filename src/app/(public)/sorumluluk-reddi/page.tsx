import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sorumluluk Reddi ve Kullanım Koşulları",
};

export default async function DisclaimerPage() {
  const s = await getSiteSettings();
  const site = s.siteName;
  const email = s.contactEmail || "iletisim@anlasmalievlilik.com";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">
        Sorumluluk Reddi ve Kullanım Koşulları
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Yürürlük tarihi: 2026</p>

      <div className="mt-6 space-y-6 leading-relaxed text-foreground/90">
        <section>
          <p>
            {site} platformunu kullanmaya başlamadan önce lütfen aşağıdaki
            koşulları dikkatlice okuyunuz. Platformu kullanan her ziyaretçi ve
            üye, bu koşulların tümünü kabul etmiş sayılır; bu koşullardan
            doğabilecek olumsuzluklardan {site} sorumlu değildir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">İlan ve İçerik Eklerken</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              Profilinizde ve ilanınızda paylaştığınız bilgiler diğer üyeler
              tarafından görüntülenebilir; bu hususta doğabilecek olumsuz
              durumlardan {site} sorumlu değildir. (Telefon ve e-posta gibi
              iletişim bilgileriniz herkese açık olarak gösterilmez.)
            </li>
            <li>
              Sitemize aynı içerikte birden fazla ilan eklemek yasaktır. Bu
              kurala uymayan üyelerin ilanları bildirim yapılmaksızın yayından
              kaldırılır ve üyelikleri engellenebilir.
            </li>
            <li>
              İzinsiz veya kopya içerik kullanarak ilan eklemek yasaktır;
              doğabilecek tüm sorumluluk ilanı ekleyen üyeye aittir.
            </li>
            <li>
              Türkiye Cumhuriyeti yasalarına aykırılık oluşturacak her türlü
              içerikte ilan eklemek yasaktır ve tüm ilanlar ekleyenin
              sorumluluğundadır.
            </li>
            <li>
              Genel ahlak kurallarına aykırı ilan ve görsel eklemek yasaktır. Bu
              gibi durumlarda ilanlarınız herhangi bir ön uyarı gerekmeksizin
              silinir.
            </li>
            <li>
              Site politikalarına aykırı ilan eklediği tespit edilen üyelerin
              ilanları yayından kaldırılır.
            </li>
            <li>
              {site}, gerekli gördüğü durumlarda herhangi bir gerekçe göstermeden,
              yayında olan ilanları sahibine haber vermeksizin yayından kaldırma
              hakkını saklı tutar.
            </li>
            <li>
              Aynı amaçla birden fazla hesap açmak kullanım koşullarımıza
              aykırıdır. Bu durumun tespiti halinde üyeliğiniz herhangi bir uyarı
              gerekmeksizin sonlandırılabilir.
            </li>
            <li>
              İlan ekleyebilmek için üye olmanız ve profil bilgilerinizi
              eksiksiz doldurmanız gerekir.
            </li>
            <li>
              Sitede gerçekleştirdiğiniz tüm işlemlere (üyelik, ilan ekleme,
              mesajlaşma) ait kayıtlar sistemimizde saklanır. Yasalara aykırı bir
              durum veya şikayet halinde bu bilgiler yetkili mercilerle
              paylaşılabilir.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Sorumluluk</h2>
          <p className="mt-2">
            {site} üzerinde diğer kullanıcılar tarafından oluşturulan içerikten
            hiçbir şekilde {site} sorumlu değildir. Platform, içeriği tümüyle
            kullanıcılar tarafından oluşturulan bir tanışma ve eşleşme
            hizmetidir; içerik üreten her kullanıcı bu koşulları kabul etmiş
            sayılır ve ürettiği içerikten doğabilecek her türlü hukuki
            yükümlülükten bizzat kendisi sorumludur.
          </p>
          <p className="mt-2">
            Platform yalnızca kullanıcıları bir araya getiren bir aracıdır;
            kullanıcılar arasındaki iletişim, görüşme, buluşma ve bunların
            sonuçlarından sorumlu tutulamaz. Kullanıcılar, tanıştıkları kişilerle
            ilgili gerekli özeni göstermek ve kendi güvenliklerini sağlamakla
            yükümlüdür.
          </p>
          <p className="mt-2">
            {site}, gerektiğinde ilan ekleyen ve platformu kullanan üyelerin IP
            adresi gibi bilgilerini yasal kurumlarla paylaşma hakkını saklı
            tutar.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">İletişim</h2>
          <p className="mt-2">
            Sorularınız için:{" "}
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>
            . Ayrıca{" "}
            <Link href="/kullanim-sartlari" className="text-primary hover:underline">
              Kullanım Şartları
            </Link>{" "}
            ve{" "}
            <Link href="/gizlilik-politikasi" className="text-primary hover:underline">
              Gizlilik Politikası
            </Link>{" "}
            sayfalarımızı da inceleyebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}
