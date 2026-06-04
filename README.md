# anlaşmalievlilik.com — Ciddi İlişki / Evlilik Sitesi

Koyu tema + turuncu vurgulu, üyelik sistemli, ilan & mesajlaşma odaklı modern bir
evlilik/ciddi ilişki platformu. **Next.js (App Router) full-stack** olarak tek
uygulamada geliştirilmiştir.

## Teknoloji

- **Next.js 16 (App Router) + React 19 + TypeScript**
- **Tailwind CSS v4** (koyu tema, turuncu `#F97316` vurgu)
- **Prisma 6 ORM** — yerel geliştirmede **SQLite**, üretimde **PostgreSQL (Supabase)**
- **NextAuth v5 (Auth.js)** — Credentials + JWT oturum
- **Supabase Realtime** (mesajlaşma) — yoksa otomatik **polling** fallback
- **Cloudinary** (görsel) — yoksa **yerel** `public/uploads` fallback
- **zod** doğrulama, **bcryptjs** parola

## Özellikler

- Üyelik (kayıt / giriş / çıkış / şifre değiştir / şifre sıfırlama)
- Profil oluşturma & düzenleme (avatar yükleme)
- İlan oluşturma (çok adımlı), düzenleme, silme — yönetici onayı ile yayın
- İlan listeleme (kategori / şehir / cinsiyet / yaş filtreleri) ve ilan detayı
- Üyeler dizini + herkese açık profil
- Üyeler arası mesajlaşma (gerçek zamanlı / polling), okunmamış sayaçları
- Favorilere ekleme, bildirimler, şikayet (rapor) sistemi
- "Online kullanıcı" göstergesi (presence heartbeat)
- Hesabım paneli (genel bakış, ilanlarım, favorilerim, mesajlar, bildirimler, ayarlar)
- **Admin paneli:** üyeler, ilan onay kuyruğu, kategoriler, şehirler, yaş seçenekleri,
  mesaj & şikayet moderasyonu, istatistikler, site ayarları (logo, site adı, içerikler)
- Responsive tasarım (mobil / tablet / masaüstü)

## Hızlı Başlangıç (Yerel Geliştirme)

Gereksinim: Node.js 18+ (20/22 önerilir).

```bash
npm install
npm run db:push      # SQLite şemasını oluşturur
npm run db:seed      # demo verileri yükler
npm run dev          # http://localhost:3000
```

`.env` dosyası SQLite ile çalışacak şekilde hazır gelir.

### Demo Giriş Bilgileri

- **Admin:** `admin@anlasmalievlilik.com` / `Admin1234!`
  (parola `.env` içindeki `SEED_ADMIN_PASSWORD` ile değiştirilebilir)
- **Demo üye:** `elif-yilmaz@ornek.com` / `Demo1234!`
  (tüm demo üyeler `Demo1234!` parolasını kullanır; e-posta = `ad-soyad@ornek.com`)

### Faydalı Komutlar

```bash
npm run dev        # geliştirme sunucusu
npm run build      # üretim derlemesi
npm run start      # üretim sunucusu
npm run lint       # ESLint
npm run db:studio  # Prisma Studio (veritabanı görüntüleyici)
npm run db:reset   # veritabanını sıfırla + yeniden seed
```

## Ortam Değişkenleri

`.env.example` dosyasına bakın. Önemli olanlar:

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | SQLite: `file:./dev.db` — Postgres: Supabase bağlantısı |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Oturum şifreleme anahtarı (`openssl rand -base64 32`) |
| `IMAGE_DRIVER` | `local` (varsayılan) veya `cloudinary` |
| `SEED_ADMIN_PASSWORD` | Seed admin parolası |
| `CLOUDINARY_*` | Cloudinary anahtarları (prod görsel) |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Supabase Realtime (istemci) |

## Üretime Geçiş (Vercel + Supabase)

1. **Veritabanı (Supabase Postgres):**
   - `prisma/schema.prisma` içinde `datasource db` bloğunda `provider = "sqlite"` →
     `provider = "postgresql"` yapın.
   - `DATABASE_URL`'i Supabase bağlantı dizesiyle (pooled / pgbouncer) değiştirin.
   - `npx prisma migrate deploy` (ilk kurulumda `npx prisma db push`) ve `npm run db:seed`.
   - Şema kasıtlı olarak DB-bağımsızdır (enum/native tip yok), bu yüzden sorunsuz taşınır.

2. **Gerçek zamanlı mesajlaşma (Supabase Realtime):**
   - `.env`'e `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` ekleyin.
   - Supabase'de Realtime için `Message` tablosunu publication'a ekleyin.
   - `Message`/`Conversation` tablolarında **RLS** politikalarını açın (kullanıcı yalnız
     kendi konuşmalarının mesajlarını alsın). Yazma işlemleri sunucuda yapıldığı için güvenlidir.
   - Anahtarlar yoksa uygulama otomatik olarak polling'e düşer.

3. **Görseller (Cloudinary):**
   - `IMAGE_DRIVER=cloudinary` ve `CLOUDINARY_*` ekleyin. Aksi halde `public/uploads`'a yazılır.

4. **Deploy (Vercel):**
   - Repoyu bağlayın, ortam değişkenlerini girin.
   - `postinstall` `prisma generate` çalıştırır; build `next build`.
   - `AUTH_SECRET`, `NEXTAUTH_URL` (prod domeni) ve `AUTH_TRUST_HOST=true` ayarlayın.

## Güvenlik Notları

- Parolalar **bcrypt** (cost 12) ile saklanır.
- Tüm Server Action'lar ve admin işlemleri sunucu tarafında oturum/rol ve satır
  sahipliği kontrolü yapar (`requireUser` / `requireAdmin` / `ensureAdmin`).
- `middleware.ts` korumalı yolları (`/hesabim`, `/admin`) korur; admin rolü ayrıca
  admin layout'unda doğrulanır.
- Güvenlik başlıkları `next.config.ts` içinde tanımlıdır.
- Tüm form girdileri **zod** ile doğrulanır.

> Not: Next.js 16, `middleware.ts` yerine `proxy.ts` adlandırmasını öneriyor
> (yalnızca bir uyarı; mevcut kurulum tam çalışır).

## Proje Yapısı

```
src/
├─ app/
│  ├─ (public)/   anasayfa, ilanlar, üyeler, hakkımızda, iletişim, yasal sayfalar
│  ├─ (auth)/     giriş, kayıt, şifre sıfırlama
│  ├─ (dashboard)/hesabim/...   (korumalı kullanıcı paneli)
│  ├─ (admin)/admin/...         (yalnız ADMIN)
│  ├─ api/        auth, presence, upload, conversations
│  └─ _actions/   Server Actions (auth, profile, listings, messages, engagement, admin, contact)
├─ components/    layout/ home/ listings/ members/ messaging/ dashboard/ admin/ ui/
├─ lib/           prisma, auth-guards, validations, listings, members, conversations, stats, storage, site
└─ hooks/         use-conversation-messages
prisma/           schema.prisma, seed.ts
```
