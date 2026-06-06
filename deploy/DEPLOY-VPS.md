# VPS'e Taşıma Rehberi (CyberPanel / AlmaLinux 8)

Bu rehber `anlasmali-evlilik-web` (Next.js 16) uygulamasını **Vercel'i kapatmadan**
GüzelHosting VPS'e taşır. Cutover sadece DNS değişikliğiyle yapılır; her şey
çalıştığını doğruladıktan sonra Vercel'i durdurursun.

> **Strateji:** Önce VPS'i kur ve test et → DNS'i VPS'e çevir → birkaç gün stabil
> kaldıktan sonra Vercel'i durdur. Vercel projesini **silme**, yedek olarak kalsın.

## Ortam Bilgileri
- **VPS IP:** `104.247.164.217`
- **Hostname:** `server.anlasmalievlilik.net`
- **OS:** AlmaLinux 8 · **Panel:** CyberPanel (OpenLiteSpeed)
- **Uygulama domaini (hedef):** `anlasmalievlilik.com` (+ `www`)
- **Dış servisler (DEĞİŞMİYOR):** Neon (DB), Cloudinary (görsel), Brevo (e-posta)

> Veritabanı şimdilik **Neon'da kalıyor** (çalışıyor, risksiz). İleride VPS'e
> kendi PostgreSQL'ini kurmak ayrı bir iş — bu rehberin sonunda not var.

---

## FAZ 0 — Hazırlık (kendi bilgisayarında)

Tüm production environment değerlerini Vercel'den tek dosyaya çek (sonra sunucuya kopyalayacağız):

```bash
# proje klasöründe (lokal)
vercel env pull deploy/.env.vps.real --environment=production
```

Bu dosya `.gitignore` ile korunur, git'e gitmez. İçinde gerçek anahtarlar olur;
sunucuya kopyaladıktan sonra lokalden silebilirsin.

> Alternatif: Değerleri elle `deploy/env.vps.example` şablonundan doldur.

---

## FAZ 1 — Sunucuya bağlan ve Node.js kur

```bash
ssh root@104.247.164.217

# Node.js 20 LTS (NodeSource) — Next 16 için gerekli
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs git
node -v   # v20.x olmalı
npm -v

# PM2 (process manager) + güncelle
npm install -g pm2
```

---

## FAZ 2 — CyberPanel'de web sitesini oluştur

1. CyberPanel paneline gir: `https://104.247.164.217:8090`
2. **Websites → Create Website**
   - Package: Default · Owner: admin
   - **Domain Name:** `anlasmalievlilik.com`
   - Email: kendi e-postan · PHP: en düşük (kullanmayacağız)
   - **Create Website**
3. (Önemli) Bu, OpenLiteSpeed'de domain için bir vHost oluşturur. Node uygulaması
   reverse proxy ile bağlanacağı için CyberPanel'in koyduğu varsayılan
   "coming soon / index" sayfası FAZ 5'te proxy ile devre dışı kalacak.

---

## FAZ 3 — Uygulamayı sunucuya çek ve derle

```bash
# Uygulamayı public_html DIŞINA koyuyoruz (kaynak kod web'den servis edilmesin)
mkdir -p /home/anlasmalievlilik.com/app
cd /home/anlasmalievlilik.com/app

git clone https://github.com/Resilience710/anlasmali-evlilik-web.git .

# Bağımlılıklar (postinstall otomatik `prisma generate` çalıştırır)
npm ci

# Ortam dosyasını oluştur (FAZ 0'daki dosyayı kopyala ya da elle doldur)
#   lokalden:  scp deploy/.env.vps.real root@104.247.164.217:/home/anlasmalievlilik.com/app/.env
# ya da nano ile:
nano .env     # deploy/env.vps.example içeriğini doldur (AUTH_URL = https://anlasmalievlilik.com)

# Şema zaten Neon'da var; sadece emin olmak istersen (VERİYİ SİLMEZ):
# npx prisma db push

# Production build
npm run build
```

> ⚠️ **Sunucuda ASLA `npm run db:seed` veya `db:reset` çalıştırma** — mevcut canlı
> veriyi (üyeler, ilanlar, admin) siler/yeniden tohumlar.

---

## FAZ 4 — PM2 ile uygulamayı başlat

```bash
cd /home/anlasmalievlilik.com/app
cp deploy/ecosystem.config.cjs ./ecosystem.config.cjs   # zaten repoda var

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd        # çıktıdaki komutu kopyalayıp çalıştır (boot'ta otomatik başlar)

pm2 status                 # "anlasmali-evlilik" online olmalı
curl -I http://127.0.0.1:3000   # 200/307 dönmeli → uygulama ayakta
```

Uygulama artık **sadece 127.0.0.1:3000**'de çalışıyor (dışarıya kapalı). Dışarıya
açılması reverse proxy ile olacak.

---

## FAZ 5 — Reverse proxy (OpenLiteSpeed) + SSL

### 5a. vHost'a proxy ekle
CyberPanel → **Websites → List Websites → anlasmalievlilik.com → Manage →**
(aşağıda) **vHost Conf** sekmesi. Mevcut `context /` bloğu varsa onu
`deploy/openlitespeed-vhost.conf` içindeki proxy bloklarıyla değiştir / ekle:

```
extprocessor nodeapp {
  type                    proxy
  address                 127.0.0.1:3000
  maxConns                100
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}

context / {
  type                    proxy
  handler                 nodeapp
  addDefaultCharset       off
}
```

**Save** → CyberPanel'de **Restart OpenLiteSpeed** (ya da `systemctl restart lsws`).

### 5b. SSL (Let's Encrypt)
DNS'i çevirdikten sonra (FAZ 6) CyberPanel → **SSL → Manage SSL →**
`anlasmalievlilik.com` seç → **Issue SSL**. OLS HTTPS'i sonlandırır, içeride
HTTP olarak 3000'e proxy yapar — bu normaldir, `.env`'deki `AUTH_URL` sayesinde
Auth.js doğru çalışır.

> nginx tercih edersen `deploy/nginx.conf.example` hazır; ama CyberPanel zaten
> OpenLiteSpeed çalıştırdığından 80/443 çakışır — nginx kullanacaksan önce OLS'i
> durdurman gerekir. **Önerilen: OLS proxy (yukarıdaki).**

---

## FAZ 6 — DNS cutover (Vercel'i bozmadan)

### Önce test (DNS değiştirmeden)
Kendi bilgisayarının `hosts` dosyasına geçici satır ekle ve siteyi VPS'ten test et:
```
104.247.164.217   anlasmalievlilik.com www.anlasmalievlilik.com
```
Tarayıcıda `https://anlasmalievlilik.com` → VPS'teki uygulamayı görmelisin.
(Test bitince bu satırı sil.)

### Gerçek cutover
Domain DNS panelinde A kayıtlarını VPS'e çevir:
```
A    @      104.247.164.217
A    www    104.247.164.217
```
(Vercel'e bağlı CNAME/A kaydı varsa kaldır.) Yayılma 5 dk–birkaç saat sürebilir.
**Vercel projesi açık kalsın** — sorun olursa DNS'i geri alıp anında Vercel'e
dönebilirsin.

---

## FAZ 7 — Cron (Vercel cron'un yerine)

Vercel'deki günlük temizlik cron'u VPS'te çalışmaz. Sistem crontab'ına ekle:

```bash
crontab -e
# Aşağıyı ekle (CRON_SECRET = .env'deki değerle AYNI olmalı):
0 3 * * * curl -s -H "Authorization: Bearer BURAYA_CRON_SECRET" https://anlasmalievlilik.com/api/cron/cleanup >/dev/null 2>&1
```

`deploy/crontab.example` içinde hazır satır var.

---

## FAZ 8 — Doğrulama kontrol listesi

- [ ] `https://anlasmalievlilik.com` açılıyor, SSL yeşil
- [ ] Giriş yap (admin@anlasmalievlilik.com) → `/admin` açılıyor
- [ ] Üye ol → e-posta doğrulama maili geliyor (Brevo)
- [ ] İlan oluştur → fotoğraf yükleniyor (Cloudinary)
- [ ] Mesaj gönder → karşı tarafta görünüyor, "Görüldü" çalışıyor
- [ ] Favori / şikayet çalışıyor
- [ ] Mobil görünüm sorunsuz
- [ ] `curl https://anlasmalievlilik.com/api/cron/cleanup` → **401** (secret'sız reddediyor)

Hepsi yeşilse → birkaç gün izle → sonra Vercel projesini durdur (silme, pasifleştir).

---

## Güncelleme yapmak (ileride kod değişince)

```bash
cd /home/anlasmalievlilik.com/app
bash deploy/deploy.sh      # git pull + npm ci + build + pm2 restart
```

---

## Faydalı komutlar

```bash
pm2 logs anlasmali-evlilik     # canlı log
pm2 restart anlasmali-evlilik  # yeniden başlat
pm2 monit                      # CPU/RAM izleme
systemctl restart lsws         # OpenLiteSpeed restart
```

---

## İleride: Veritabanını VPS'e taşımak (opsiyonel, şimdi DEĞİL)

Şu an DB Neon'da. Tam self-host istersen ayrı bir adımda:
1. VPS'e PostgreSQL 16 kur, kullanıcı/veritabanı oluştur.
2. Neon'dan `pg_dump`, VPS'e `pg_restore`.
3. `.env` → `DATABASE_URL` ve `DIRECT_URL`'i yerel Postgres'e çevir.
4. `npm run build` + `pm2 restart`.

Bu, performans/gizlilik için iyi ama bakım sorumluluğu (yedek, güncelleme) sana
geçer. Acelesi yok; Neon ücretsiz katmanı yeterli.
