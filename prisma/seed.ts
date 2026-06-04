import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@anlasmalievlilik.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin1234!";
const DEMO_PASSWORD = "Demo1234!";

function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return input
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (m) => map[m] ?? m)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000);

async function main() {
  console.log("Seed başlıyor...");

  // ---- SiteSetting ----
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "anlaşmalievlilik.com",
      tagline: "Ciddi İlişki, Mutlu Evlilik",
      heroTitle: "Hayat Arkadaşınızı AnlaşmalıEvlilik.com'da Bulun",
      heroSubtitle:
        "Ciddi düşünen, geleceğe birlikte yürümek isteyen insanları bir araya getiriyoruz.",
      aboutText:
        "AnlaşmalıEvlilik.com, ciddi ilişki ve evlilik düşünen bireyleri güvenli bir ortamda buluşturmak için kurulmuştur. Gizliliğinize önem veriyor, gerçek ve doğrulanmış üyelerle tanışmanızı sağlıyoruz.",
      contactEmail: "iletisim@anlasmalievlilik.com",
      contactPhone: "+90 212 000 00 00",
      happyCount: 2893,
      termsText:
        "Bu platformu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız. 18 yaşından büyük olmalısınız. Sahte profil oluşturmak yasaktır...",
      privacyText:
        "Kişisel verileriniz KVKK kapsamında korunur. Fotoğraflarınız yalnızca izin verdiğiniz üyeler tarafından görüntülenebilir...",
      faqJson: JSON.stringify([
        {
          q: "Üyelik ücretli mi?",
          a: "Temel üyelik ücretsizdir. Ücretsiz üye olarak ilan oluşturabilir ve mesajlaşabilirsiniz.",
        },
        {
          q: "Bilgilerim güvende mi?",
          a: "Tüm verileriniz şifrelenir ve gizliliğiniz korunur. Fotoğraflarınızı yalnızca seçtiğiniz kişiler görebilir.",
        },
        {
          q: "İlanım neden hemen yayınlanmıyor?",
          a: "Güvenlik için tüm ilanlar yönetici onayından geçtikten sonra yayınlanır.",
        },
      ]),
      socialJson: JSON.stringify({
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        x: "https://x.com",
        youtube: "https://youtube.com",
      }),
    },
  });

  // ---- Kategoriler ----
  const categoryData = [
    { name: "Bay Arıyor", order: 1 },
    { name: "Bayan Arıyor", order: 2 },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const slug = slugify(c.name);
    const cat = await prisma.category.upsert({
      where: { slug },
      update: { name: c.name, order: c.order, isActive: true },
      create: { name: c.name, slug, order: c.order, isActive: true },
    });
    categories[c.name] = cat.id;
  }

  // ---- Şehirler ----
  const cityNames = [
    "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya",
    "Adana", "Konya", "Gaziantep",
  ];
  const cities: Record<string, string> = {};
  for (let i = 0; i < cityNames.length; i++) {
    const name = cityNames[i];
    const slug = slugify(name);
    const city = await prisma.city.upsert({
      where: { slug },
      update: { name, order: i + 1, isActive: true },
      create: { name, slug, order: i + 1, isActive: true },
    });
    cities[name] = city.id;
  }

  // ---- Yaş seçenekleri ----
  await prisma.ageOption.deleteMany();
  await prisma.ageOption.createMany({
    data: [
      { label: "18-25", minAge: 18, maxAge: 25, order: 1 },
      { label: "26-30", minAge: 26, maxAge: 30, order: 2 },
      { label: "31-40", minAge: 31, maxAge: 40, order: 3 },
      { label: "41-50", minAge: 41, maxAge: 50, order: 4 },
      { label: "50+", minAge: 51, maxAge: 99, order: 5 },
    ],
  });

  // ---- Admin ----
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "ADMIN", passwordHash: adminHash, isBanned: false },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      role: "ADMIN",
      lastSeenAt: new Date(),
      profile: {
        create: {
          displayName: "Site Yöneticisi",
          gender: "MALE",
          age: 35,
          cityId: cities["İstanbul"],
          bio: "Platform yöneticisi.",
        },
      },
    },
  });

  // ---- Demo üyeler ----
  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const demoPeople: {
    name: string;
    gender: "MALE" | "FEMALE";
    age: number;
    city: string;
    bio: string;
  }[] = [
    { name: "Elif Yılmaz", gender: "FEMALE", age: 28, city: "İstanbul", bio: "Ciddi ilişki ve evlilik düşünüyorum. Hayatı paylaşacağım birini arıyorum." },
    { name: "Mehmet Demir", gender: "MALE", age: 32, city: "Ankara", bio: "Dürüst, saygılı ve aile değerlerine bağlı biriyim." },
    { name: "Zeynep Kaya", gender: "FEMALE", age: 26, city: "İzmir", bio: "Gezmeyi, kitap okumayı seven, geleceğini planlayan biriyim." },
    { name: "Ahmet Çelik", gender: "MALE", age: 30, city: "Bursa", bio: "İş sahibi, evine bağlı, ciddi düşünen biriyim." },
    { name: "Ayşe Şahin", gender: "FEMALE", age: 27, city: "Antalya", bio: "Sıcak, samimi ve dürüst bir ilişki arıyorum." },
    { name: "Mustafa Arslan", gender: "MALE", age: 34, city: "İstanbul", bio: "Hayat arkadaşımı arıyorum. Saygı ve sevgi önceliğim." },
    { name: "Fatma Yıldız", gender: "FEMALE", age: 31, city: "Ankara", bio: "Kariyer sahibi, dengeli ve huzurlu bir yuva isteyen biriyim." },
    { name: "Emre Aydın", gender: "MALE", age: 29, city: "İzmir", bio: "Doğayı ve sporu seven, ciddi ilişki düşünen biriyim." },
    { name: "Hatice Öztürk", gender: "FEMALE", age: 33, city: "Bursa", bio: "Aileye önem veren, anlayışlı bir eş adayıyım." },
    { name: "Burak Koç", gender: "MALE", age: 27, city: "Antalya", bio: "Pozitif, espirili ama ciddi düşünen biriyim." },
    { name: "Merve Aksoy", gender: "FEMALE", age: 25, city: "Adana", bio: "Geleceğimi birlikte kuracağım birini arıyorum." },
    { name: "Caner Polat", gender: "MALE", age: 36, city: "Konya", bio: "Sakin, güvenilir ve aile odaklı biriyim." },
    { name: "Selin Doğan", gender: "FEMALE", age: 29, city: "Gaziantep", bio: "Dürüstlüğe ve sadakate inanan biriyim." },
    { name: "Okan Kurt", gender: "MALE", age: 31, city: "İstanbul", bio: "Hayatı paylaşmak için doğru insanı arıyorum." },
    { name: "Deniz Acar", gender: "FEMALE", age: 30, city: "Ankara", bio: "Mutlu bir yuva kurmak istiyorum." },
    { name: "Serkan Yavuz", gender: "MALE", age: 33, city: "İzmir", bio: "Ciddi, çalışkan ve aile değerlerine bağlıyım." },
  ];

  const demoUsers: { id: string; name: string; gender: string; city: string; age: number }[] = [];
  for (let i = 0; i < demoPeople.length; i++) {
    const p = demoPeople[i];
    const email = `${slugify(p.name)}@ornek.com`;
    const u = await prisma.user.upsert({
      where: { email },
      update: { lastSeenAt: i % 2 === 0 ? new Date() : hoursAgo(20) },
      create: {
        email,
        passwordHash: demoHash,
        role: "USER",
        lastSeenAt: i % 2 === 0 ? new Date() : hoursAgo(20),
        profile: {
          create: {
            displayName: p.name,
            gender: p.gender,
            age: p.age,
            cityId: cities[p.city],
            lookingFor: p.gender === "MALE" ? "FEMALE" : "MALE",
            bio: p.bio,
          },
        },
      },
    });
    demoUsers.push({ id: u.id, name: p.name, gender: p.gender, city: p.city, age: p.age });
  }

  // ---- İlanlar ----
  // Ekran görüntüsündeki "Son Eklenen İlanlar" ile birebir başlayan ilk 5:
  const featured = [
    { title: "Ciddi evlilik düşünen bayan arıyor", cat: "Bay Arıyor", age: 28, city: "İstanbul", h: 2, owner: 0 },
    { title: "Hayat arkadaşımı arıyorum", cat: "Bayan Arıyor", age: 26, city: "Ankara", h: 5, owner: 1 },
    { title: "Ciddi ve dürüst bey arıyorum", cat: "Bayan Arıyor", age: 27, city: "İzmir", h: 26, owner: 2 },
    { title: "Evlilik düşünen bayan arıyorum", cat: "Bay Arıyor", age: 30, city: "Bursa", h: 30, owner: 3 },
    { title: "Geleceğimizi birlikte şekillendirelim", cat: "Bay Arıyor", age: 31, city: "Antalya", h: 50, owner: 5 },
  ];

  const moreTitles = [
    "Anlayışlı ve sadık bir eş arıyorum",
    "Birlikte mutlu olabileceğimiz birini arıyorum",
    "Ciddi düşünen, aileye önem veren biri olsun",
    "Hayata birlikte gülümseyeceğimiz biri",
    "Dürüst ve saygılı bir ilişki istiyorum",
    "Geleceğe birlikte yürüyeceğimiz yol arkadaşı",
    "Sıcak bir yuva kurmak istiyorum",
    "Sevgi ve güvenle dolu bir birliktelik",
    "Kariyer sahibi, ayakları yere basan biri",
    "Huzurlu bir hayatı paylaşmak istiyorum",
    "Saygı ve sevginin olduğu bir ilişki",
    "Birbirini anlayan iki kişi olalım",
    "Ciddi adımlar atmaya hazırım",
    "Doğru insanı bulduğuma inanmak istiyorum",
    "Aile kurmak için ciddi biriyle tanışmak istiyorum",
  ];

  // Demo ilanları temizle (idempotent demo durumu)
  await prisma.report.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.listing.deleteMany();

  let slugCounter = 0;
  const createdListings: { id: string; ownerId: string; title: string }[] = [];

  const makeListing = async (
    title: string,
    catName: string,
    age: number,
    cityName: string,
    h: number,
    ownerIdx: number
  ) => {
    const owner = demoUsers[ownerIdx % demoUsers.length];
    const targetGender = catName === "Bay Arıyor" ? "MALE" : "FEMALE";
    const ownerGender = targetGender === "MALE" ? "FEMALE" : "MALE";
    const slug = `${slugify(title)}-${(slugCounter++).toString(36)}${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const l = await prisma.listing.create({
      data: {
        authorId: owner.id,
        title,
        slug,
        description: `${title}. ${owner.name} olarak ciddi ilişki ve evlilik düşünüyorum. Karşılıklı saygı, sevgi ve dürüstlük benim için çok önemli. Tanışıp birbirimizi anlayabileceğimize inanıyorum.`,
        age,
        gender: ownerGender,
        targetGender,
        categoryId: categories[catName],
        cityId: cities[cityName],
        status: "APPROVED",
        publishedAt: hoursAgo(h),
        createdAt: hoursAgo(h),
        viewCount: Math.floor(Math.random() * 200),
      },
    });
    createdListings.push({ id: l.id, ownerId: owner.id, title });
  };

  for (const f of featured) {
    await makeListing(f.title, f.cat, f.age, f.city, f.h, f.owner);
  }
  for (let i = 0; i < moreTitles.length; i++) {
    const owner = demoUsers[(i + 2) % demoUsers.length];
    const cat = i % 2 === 0 ? "Bayan Arıyor" : "Bay Arıyor";
    await makeListing(
      moreTitles[i],
      cat,
      owner.age,
      owner.city,
      60 + i * 8,
      (i + 2) % demoUsers.length
    );
  }

  // Bir adet onay bekleyen ilan (admin paneli kuyruğu için)
  await prisma.listing.create({
    data: {
      authorId: demoUsers[4].id,
      title: "Onay bekleyen örnek ilan",
      slug: `onay-bekleyen-${Math.random().toString(36).slice(2, 7)}`,
      description:
        "Bu ilan yönetici onayı bekliyor. Admin panelinden onaylanabilir veya reddedilebilir.",
      age: demoUsers[4].age,
      gender: demoUsers[4].gender,
      targetGender: demoUsers[4].gender === "MALE" ? "FEMALE" : "MALE",
      categoryId: categories["Bay Arıyor"],
      cityId: cities[demoUsers[4].city],
      status: "PENDING",
    },
  });

  // ---- Favoriler ----
  await prisma.favorite.create({
    data: { userId: demoUsers[0].id, listingId: createdListings[1].id },
  });
  await prisma.favorite.create({
    data: { userId: demoUsers[1].id, listingId: createdListings[0].id },
  });

  // ---- Konuşma + mesajlar (canonical sıralı) ----
  const a = demoUsers[0].id;
  const b = demoUsers[1].id;
  const [userAId, userBId] = a < b ? [a, b] : [b, a];
  const conv = await prisma.conversation.create({
    data: {
      userAId,
      userBId,
      lastMessageAt: hoursAgo(1),
      messages: {
        create: [
          { senderId: a, body: "Merhaba, ilanınızı gördüm. Tanışabilir miyiz?", createdAt: hoursAgo(3) },
          { senderId: b, body: "Merhaba, tabii ki. Kendinizden bahseder misiniz?", createdAt: hoursAgo(2) },
          { senderId: a, body: "Tabii, ciddi bir ilişki düşünüyorum. Sizinle tanışmak isterim.", createdAt: hoursAgo(1) },
        ],
      },
    },
  });

  // ---- Bildirimler ----
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUsers[1].id,
        type: "MESSAGE",
        title: "Yeni mesajınız var",
        body: `${demoUsers[0].name} size mesaj gönderdi.`,
        linkUrl: `/hesabim/mesajlar/${conv.id}`,
      },
      {
        userId: demoUsers[0].id,
        type: "FAVORITE",
        title: "İlanınız favorilere eklendi",
        body: "Birisi ilanınızı favorilerine ekledi.",
        linkUrl: "/hesabim/ilanlarim",
      },
      {
        userId: admin.id,
        type: "SYSTEM",
        title: "Onay bekleyen ilan",
        body: "Yeni bir ilan onayınızı bekliyor.",
        linkUrl: "/admin/ilanlar?status=PENDING",
      },
    ],
  });

  console.log("Seed tamamlandı ✓");
  console.log(`Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Demo üye örneği: elif-yilmaz@ornek.com / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
